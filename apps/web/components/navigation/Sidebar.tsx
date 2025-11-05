'use client'

import { useMemo, type ReactNode } from 'react'
import { MessageSquare, Plus, Search, Sparkles } from 'lucide-react'
import { nanoid } from 'nanoid'
import clsx from 'clsx'
import type { Session } from '@ai-frame/types'
import { useSessionStore } from '../../lib/session-context'

const templates = [
  { id: 'report', title: '经营周报', description: '指标拆解 + 趋势提示' },
  { id: 'code', title: '代码 Review', description: '静态扫描 + 解释' },
  { id: 'qa', title: '问题排查', description: '定位越界与异常' },
]

export const Sidebar = () => {
  const { sessions, activeSessionId } = useSessionStore((state) => ({
    sessions: state.sessionOrder.map((id) => state.sessions[id]),
    activeSessionId: state.activeSessionId,
  }))

  const actions = useSessionStore((state) => state.actions)

  const groupedSessions = useMemo(() => {
    return sessions.reduce<{ recent: Session[]; older: Session[] }>(
      (acc, session, idx) => {
        if (!session) return acc
        const bucket = idx < 5 ? 'recent' : 'older'
        acc[bucket].push(session)
        return acc
      },
      { recent: [], older: [] },
    )
  }, [sessions])

  const createFromTemplate = (template: (typeof templates)[number]) => {
    actions.createSession({
      id: nanoid(),
      title: template.title,
      pinnedTools: [],
      participants: [
        { id: 'you', name: '你' },
        { id: 'assistant', name: '助手' },
      ],
      modelConfig: {
        model: 'doubao-pro',
        temperature: 0.4,
        topP: 0.95,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as Session)
  }

  return (
    <aside className="flex h-full w-[320px] flex-col border-r border-white/5 bg-background-elevated/80 px-5 py-6 backdrop-blur-xl">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">指挥工作台</p>
          <h1 className="text-xl font-semibold">AI Frame</h1>
        </div>
        <button
          onClick={() => actions.createSession()}
          className="rounded-full bg-primary px-3 py-2 text-sm font-medium text-black"
        >
          新会话
        </button>
      </header>

      <div className="mb-4 flex items-center gap-2 rounded-full bg-background-subtle px-3 py-2 text-sm text-text-muted">
        <Search className="h-4 w-4" />
        <span>搜索会话/模版</span>
      </div>

      <section className="mb-6 space-y-3">
        <p className="text-xs uppercase tracking-wide text-text-muted">推荐模版</p>
        <div className="space-y-2">
          {templates.map((template) => (
            <button
              key={template.id}
              className="w-full rounded-2xl border border-white/5 bg-transparent px-4 py-3 text-left transition hover:border-white/30"
              onClick={() => createFromTemplate(template)}
            >
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{template.title}</span>
                <Sparkles className="h-4 w-4 text-accent" />
              </div>
              <p className="text-xs text-text-muted">{template.description}</p>
            </button>
          ))}
        </div>
      </section>

      <nav className="flex-1 overflow-y-auto pr-2">
        <Section title="最近">
          {groupedSessions.recent.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              active={session.id === activeSessionId}
              onClick={() => actions.selectSession(session.id)}
            />
          ))}
        </Section>
        <Section title="更早">
          {groupedSessions.older.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              active={session.id === activeSessionId}
              onClick={() => actions.selectSession(session.id)}
            />
          ))}
        </Section>
      </nav>

      <button className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-text-muted">
        <Plus className="h-4 w-4" /> 管理知识库
      </button>
    </aside>
  )
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mb-6 space-y-2">
    <p className="text-xs uppercase tracking-wide text-text-muted">{title}</p>
    <div className="space-y-1">{children}</div>
  </div>
)

const SessionItem = ({ session, active, onClick }: { session: Session; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={clsx(
      'flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm transition',
      active ? 'bg-white/10 text-white' : 'text-text-muted hover:bg-white/5',
    )}
  >
    <MessageSquare className="h-4 w-4" />
    <div className="flex-1 truncate">
      <p className="truncate font-medium">{session.title}</p>
      <p className="truncate text-xs text-text-muted">{session.modelConfig.model}</p>
    </div>
  </button>
)
