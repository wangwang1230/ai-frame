import type { Block } from '@ai-frame/types'
import { motion } from 'framer-motion'
import { memo } from 'react'

export const TextBlockRenderer = memo(({ block }: { block: Block }) => {
  if (block.type !== 'text') return null
  const payload = block.data as { content: string }
  return (
    <motion.div
      className="whitespace-pre-wrap text-sm leading-6 text-text"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {payload.content}
    </motion.div>
  )
})
