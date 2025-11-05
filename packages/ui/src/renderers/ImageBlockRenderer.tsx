import type { Block } from '@ai-frame/types'
import { memo } from 'react'

export const ImageBlockRenderer = memo(({ block }: { block: Block }) => {
  if (block.type !== 'image') return null
  const payload = block.data as { url: string; alt?: string }
  return (
    <figure className="overflow-hidden rounded-2xl border border-white/10">
      <img src={payload.url} alt={payload.alt ?? 'generated image'} className="h-full w-full object-cover" />
    </figure>
  )
})
