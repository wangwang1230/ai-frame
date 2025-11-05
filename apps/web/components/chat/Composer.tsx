'use client'

import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { Image, Mic, Paperclip, Send, Wand2 } from 'lucide-react'
import clsx from 'clsx'

interface ComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
}

export const Composer = ({ value, onChange, onSubmit }: ComposerProps) => {
  const [mode, setMode] = useState<'text' | 'voice' | 'image'>('text')

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSubmit(value)
    }
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-background-elevated/80 p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2 text-xs text-text-muted">
        {['text', 'voice', 'image'].map((item) => (
          <button
            key={item}
            onClick={() => setMode(item as typeof mode)}
            className={clsx(
              'rounded-full px-3 py-1 capitalize',
              mode === item ? 'bg-white/10 text-white' : 'hover:bg-white/5',
            )}
          >
            {modeMap[item as keyof typeof modeMap]}
          </button>
        ))}
      </div>
      <textarea
        className="h-28 w-full resize-none bg-transparent text-base outline-none"
        placeholder="Ctrl + K 唤起指令。Shift + Enter 换行"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="mt-4 flex items-center justify-between text-text-muted">
        <div className="flex items-center gap-2">
          <IconButton icon={<Paperclip className="h-4 w-4" />} label="文件" />
          <IconButton icon={<Image className="h-4 w-4" />} label="图片" />
          <IconButton icon={<Mic className="h-4 w-4" />} label="语音" />
          <IconButton icon={<Wand2 className="h-4 w-4" />} label="改写" />
        </div>
        <button
          onClick={() => onSubmit(value)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-black"
        >
          发送 <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

const IconButton = ({ icon, label }: { icon: ReactNode; label: string }) => (
  <button className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-text-muted transition hover:bg-white/5">
    {icon}
    <span>{label}</span>
  </button>
)

const modeMap = {
  text: '文本',
  voice: '语音',
  image: '图像',
}
