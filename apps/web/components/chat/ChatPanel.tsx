'use client'

import { useMemo } from 'react'
import { MessageList } from '@ai-frame/ui'
import { useCommandBus, useSessionStore } from '../../lib/session-context'
import { Composer } from './Composer'
import { ToolTray } from './ToolTray'
import { ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

export const ChatPanel = () => {
  const { activeSessionId, session, messages, composerDraft } = useSessionStore((state) => {
    const activeId = state.activeSessionId ?? state.sessionOrder[0]
    return {
      activeSessionId: activeId,
      session: activeId ? state.sessions[activeId] : undefined,
      messages: activeId ? state.messages[activeId] ?? [] : [],
      composerDraft: activeId ? state.composerDrafts[activeId] ?? '' : '',
    }
  })

  const actions = useSessionStore((state) => state.actions)
  const commandBus = useCommandBus()

  const title = session?.title ?? '未命名会话'
  const description = useMemo(
    () => `${session?.modelConfig.model ?? 'doubao-pro'} · 个工具`,
    [session],
  )

  const handleSend = async (value: string) => {
    if (!value.trim()) return
    await commandBus.dispatch({ type: 'prompt', sessionId: activeSessionId!, content: value })
  }

  const handleMessageAction = (messageId: string, action: 'copy' | 'branch' | 'retry') => {
    const target = messages.find((msg) => msg.id === messageId)
    if (!target) return
    if (action === 'copy') {
      navigator.clipboard?.writeText(
        target.content
          .map((block) => (block.type === 'text' ? (block.data as any).content : ''))
          .join('\n'),
      )
      toast.success('消息已复制')
      return
    }
    if (action === 'branch') {
      commandBus.dispatch({ type: 'branch', messageId })
      toast('已从该消息创建分支')
      return
    }
    if (action === 'retry') {
      commandBus.dispatch({ type: 'retry', messageId })
    }
  }

  return (
    <section className="flex flex-1 flex-col bg-background">
      <header className="flex items-center justify-between border-b border-white/5 px-8 py-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-muted">当前会话</p>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-white">{title}</h2>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] uppercase text-text-muted">
              {description}
            </span>
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-text-muted">
          历史版本 <ChevronDown className="h-4 w-4" />
        </button>
      </header>

      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_320px] overflow-hidden">
        <div className="flex flex-col overflow-y-auto px-8 py-6">
          <MessageList messages={messages} onAction={handleMessageAction} />
        </div>
        <ToolTray session={session} />
      </div>

      <div className="border-t border-white/5 px-8 py-5">
        <Composer
          value={composerDraft}
          onChange={(value) => activeSessionId && actions.updateComposer(activeSessionId, value)}
          onSubmit={handleSend}
        />
      </div>
    </section>
  )
}
