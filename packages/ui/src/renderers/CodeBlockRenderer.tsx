import type { Block } from '@ai-frame/types'
import { memo } from 'react'
import clsx from 'clsx'

export const CodeBlockRenderer = memo(({ block }: { block: Block }) => {
  if (block.type !== 'code') return null
  const payload = block.data as { language: string; content: string }

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(payload.content).catch(() => {})
  }

  return (
    <div className="rounded-lg bg-background-subtle p-3 font-mono text-xs text-text">
      <div className="mb-2 flex items-center justify-between text-text-muted">
        <span>{payload.language}</span>
        <button
          type="button"
          className={clsx(
            'rounded border border-white/10 px-2 py-1 text-[11px] uppercase tracking-wide hover:border-white/30',
          )}
          onClick={copyToClipboard}
        >
          Copy
        </button>
      </div>
      <pre className="overflow-x-auto text-[13px] leading-relaxed">{payload.content}</pre>
    </div>
  )
})
