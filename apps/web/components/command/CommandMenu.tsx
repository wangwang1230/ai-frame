'use client'

import { useEffect, useState } from 'react'
import { Command, GitBranch, MessageCircle, Repeat2, Send } from 'lucide-react'
import { useCommandBus, useSessionStore } from '../../lib/session-context'

const actions = [
  { id: 'retry-last', label: '重试最新消息', icon: Repeat2 },
  { id: 'continue', label: '让助手继续', icon: Send },
  { id: 'branch', label: '从该点分支', icon: GitBranch },
]

export const CommandMenu = () => {
  const [open, setOpen] = useState(false)
  const commandBus = useCommandBus()
  const latestMessage = useSessionStore((state) => {
    const sessionId = state.activeSessionId ?? state.sessionOrder[0]
    const list = sessionId ? state.messages[sessionId] ?? [] : []
    return list[list.length - 1]
  })

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  const handleAction = (actionId: string) => {
    if (!latestMessage) return
    if (actionId === 'retry-last') {
      commandBus.dispatch({ type: 'retry', messageId: latestMessage.id })
    }
    if (actionId === 'branch') {
      commandBus.dispatch({ type: 'branch', messageId: latestMessage.id })
    }
    if (actionId === 'continue') {
      commandBus.dispatch({ type: 'prompt', sessionId: latestMessage.sessionId, content: '继续' })
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
      <div className="absolute left-1/2 top-1/4 w-[480px] -translate-x-1/2 rounded-2xl border border-white/10 bg-background p-4 shadow-card">
        <div className="mb-3 flex items-center gap-2 text-sm text-text-muted">
          <Command className="h-4 w-4" />
          指令面板（Ctrl + K）
        </div>
        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-white transition hover:bg-white/5"
            >
              <action.icon className="h-4 w-4" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-white/10 px-3 py-2 text-xs text-text-muted">
          <MessageCircle className="h-4 w-4" />
          支持工具、模型切换、知识库检索等快速指令。
        </div>
      </div>
    </div>
  )
}
