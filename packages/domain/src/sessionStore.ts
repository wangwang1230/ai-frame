import { createStore, StoreApi } from 'zustand/vanilla'
import { produce } from 'immer'
import { nanoid } from 'nanoid'
import type {
  Block,
  Message,
  Session,
  ToolCall,
  TransportAdapter,
} from '@ai-frame/types'

export interface SessionStoreOptions {
  transport: TransportAdapter
  onToolCall?: (tool: ToolCall) => void
  createDefaultSession?: () => Session
}

export interface SessionStoreState {
  sessions: Record<string, Session>
  sessionOrder: string[]
  messages: Record<string, Message[]>
  activeSessionId?: string
  composerDrafts: Record<string, string>
  inflightMessageIds: Set<string>
  actions: SessionStoreActions
}

export interface SessionStoreActions {
  hydrate(payload: { sessions: Session[]; messages: Message[] }): void
  createSession(payload?: Partial<Session>): string
  selectSession(sessionId: string): void
  updateComposer(sessionId: string, value: string): void
  sendPrompt(content: string, sessionId?: string): Promise<void>
  retryMessage(messageId: string): Promise<void>
  branchFrom(messageId: string): Promise<string>
}

export type SessionStore = StoreApi<SessionStoreState>

export const createSessionStore = (
  options: SessionStoreOptions,
): SessionStore => {
  const store = createStore<SessionStoreState>()((set, get) => {
    const actions: SessionStoreActions = {
      hydrate: ({ sessions, messages }) => {
        set(
          produce((draft: SessionStoreState) => {
            draft.sessions = Object.fromEntries(sessions.map((s) => [s.id, s]))
            draft.sessionOrder = sessions
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((s) => s.id)
            draft.messages = messages.reduce<Record<string, Message[]>>((acc, msg) => {
              acc[msg.sessionId] = acc[msg.sessionId] || []
              acc[msg.sessionId].push(msg)
              return acc
            }, {})
            draft.activeSessionId = draft.sessionOrder[0]
          }),
        )
      },
      createSession: (payload) => {
        const id = payload?.id ?? nanoid()
        const now = Date.now()
        const session: Session =
          payload || options.createDefaultSession?.() ||
          ({
            id,
            title: '新的会话',
            pinnedTools: [],
            participants: [
              { id: 'user', name: 'You' },
              { id: 'assistant', name: 'Doubao' },
            ],
            modelConfig: {
              model: 'doubao-pro',
              temperature: 0.7,
              topP: 0.9,
            },
            createdAt: now,
            updatedAt: now,
          } as Session)

        set(
          produce((draft: SessionStoreState) => {
            draft.sessions[session.id] = session
            draft.sessionOrder.unshift(session.id)
            draft.activeSessionId = session.id
            draft.messages[session.id] = []
          }),
        )
        return session.id
      },
      selectSession: (sessionId) => {
        set(
          produce((draft: SessionStoreState) => {
            draft.activeSessionId = sessionId
          }),
        )
      },
      updateComposer: (sessionId, value) => {
        set(
          produce((draft: SessionStoreState) => {
            draft.composerDrafts[sessionId] = value
          }),
        )
      },
      sendPrompt: async (content, sessionId) => {
        const state = get()
        const targetSessionId = sessionId ?? state.activeSessionId ?? actions.createSession()
        const userMessageId = nanoid()
        const assistantMessageId = nanoid()
        const now = Date.now()

        set(
          produce((draft: SessionStoreState) => {
            const list = draft.messages[targetSessionId] || (draft.messages[targetSessionId] = [])
            list.push({
              id: userMessageId,
              sessionId: targetSessionId,
              role: 'user',
              status: 'done',
              content: [buildTextBlock(content)],
              toolCalls: [],
              createdAt: now,
              updatedAt: now,
            })
            list.push({
              id: assistantMessageId,
              sessionId: targetSessionId,
              role: 'assistant',
              status: 'streaming',
              content: [],
              toolCalls: [],
              createdAt: now,
              updatedAt: now,
            })
            draft.composerDrafts[targetSessionId] = ''
            draft.inflightMessageIds.add(assistantMessageId)
          }),
        )

        await streamIntoMessage({
          store,
          transport: options.transport,
          messageId: assistantMessageId,
          sessionId: targetSessionId,
          content,
        })
      },
      retryMessage: async (messageId) => {
        const target = locateMessage(get(), messageId)
        if (!target) return
        await actions.sendPrompt(target.message.content[0]?.data?.content ?? '', target.sessionId)
      },
      branchFrom: async (messageId) => {
        const target = locateMessage(get(), messageId)
        if (!target) throw new Error('Message not found')
        const newSessionId = actions.createSession({
          ...get().sessions[target.sessionId],
          id: nanoid(),
          title: ${get().sessions[target.sessionId].title} - 分支,
        })
        set(
          produce((draft: SessionStoreState) => {
            draft.messages[newSessionId] = [...target.list]
          }),
        )
        return newSessionId
      },
    }

    return {
      sessions: {},
      sessionOrder: [],
      messages: {},
      composerDrafts: {},
      inflightMessageIds: new Set(),
      activeSessionId: undefined,
      actions,
    }
  })

  return store
}

interface StreamArgs {
  store: SessionStore
  transport: TransportAdapter
  messageId: string
  sessionId: string
  content: string
}

const streamIntoMessage = async ({
  store,
  transport,
  messageId,
  sessionId,
  content,
}: StreamArgs) => {
  try {
    for await (const delta of transport.streamPrompt({ sessionId, messageId, content })) {
      store.setState(
        produce((draft: SessionStoreState) => {
          const list = draft.messages[sessionId]
          if (!list) return
          const target = list.find((msg) => msg.id === messageId)
          if (!target) return
          mergeBlocks(target.content, delta.block)
          target.updatedAt = Date.now()
          if (delta.isFinal) {
            target.status = 'done'
            draft.inflightMessageIds.delete(messageId)
          }
        }),
      )
    }
  } catch (error) {
    store.setState(
      produce((draft: SessionStoreState) => {
        const list = draft.messages[sessionId]
        const target = list?.find((msg) => msg.id === messageId)
        if (target) {
          target.status = 'failed'
        }
        draft.inflightMessageIds.delete(messageId)
      }),
    )
    console.error('stream error', error)
  }
}

const buildTextBlock = (content: string): Block => ({
  id: nanoid(),
  type: 'text',
  data: { kind: 'text', content, format: 'markdown' },
  createdAt: Date.now(),
})

const mergeBlocks = (blocks: Block[], incoming: Block) => {
  const idx = blocks.findIndex((b) => b.id === incoming.id)
  if (idx === -1) {
    blocks.push(incoming)
    return
  }
  const target = blocks[idx]
  if (target.type === 'text' && incoming.type === 'text') {
    target.data = {
      ...target.data,
      content: ${(target.data as any).content},
    }
  } else {
    blocks[idx] = { ...incoming }
  }
}

const locateMessage = (state: SessionStoreState, messageId: string) => {
  for (const sessionId of Object.keys(state.messages)) {
    const list = state.messages[sessionId]
    const idx = list?.findIndex((msg) => msg.id === messageId)
    if (idx !== undefined && idx >= 0 && list) {
      return { sessionId, list, message: list[idx] }
    }
  }
  return null
}
