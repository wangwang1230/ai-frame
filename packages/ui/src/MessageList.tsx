import type { Message } from '@ai-frame/types'
import clsx from 'clsx'
import { Fragment } from 'react'
import { useRenderer } from './RendererProvider'

export interface MessageListProps {
  messages: Message[]
  onAction?: (messageId: string, action: 'copy' | 'branch' | 'retry') => void
}

export const MessageList = ({ messages, onAction }: MessageListProps) => {
  const { renderBlock } = useRenderer()
  return (
    <div className="flex flex-col gap-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={clsx('group rounded-2xl p-4 shadow-card', roleStyles[message.role])}
        >
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-text-muted">
            <span>{message.role === 'user' ? 'You' : '豆包助手'}</span>
            <div className="hidden gap-3 text-text-muted group-hover:flex">
              <button onClick={() => onAction?.(message.id, 'copy')}>复制</button>
              <button onClick={() => onAction?.(message.id, 'branch')}>分支</button>
              <button onClick={() => onAction?.(message.id, 'retry')}>重试</button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {message.content.map((block) => (
              <Fragment key={block.id}>{renderBlock(block)}</Fragment>
            ))}
          </div>
          {message.status === 'streaming' && (
            <div className="mt-3 text-[11px] uppercase tracking-wide text-text-muted">生成中...</div>
          )}
        </div>
      ))}
    </div>
  )
}

const roleStyles: Record<Message['role'], string> = {
  user: 'bg-surface text-text',
  assistant: 'bg-background-elevated text-text',
  system: 'bg-surface text-text-muted border border-white/5',
  tool: 'bg-surface text-text-muted border border-accent/30',
}
