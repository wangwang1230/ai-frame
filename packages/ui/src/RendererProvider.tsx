import { createContext, useContext, type ReactNode } from 'react'
import type { Block, BlockType } from '@ai-frame/types'
import { TextBlockRenderer } from './renderers/TextBlockRenderer'
import { CodeBlockRenderer } from './renderers/CodeBlockRenderer'
import { ImageBlockRenderer } from './renderers/ImageBlockRenderer'

export type BlockRenderer = (block: Block) => ReactNode
export type RendererRegistry = Partial<Record<BlockType, BlockRenderer>>

const defaultRegistry: RendererRegistry = {
  text: (block) => <TextBlockRenderer block={block} />,
  code: (block) => <CodeBlockRenderer block={block} />,
  image: (block) => <ImageBlockRenderer block={block} />,
}

const RendererContext = createContext<RendererRegistry>(defaultRegistry)

export const RendererProvider = ({
  registry,
  children,
}: {
  registry?: RendererRegistry
  children: ReactNode
}) => {
  return (
    <RendererContext.Provider value={{ ...defaultRegistry, ...registry }}>
      {children}
    </RendererContext.Provider>
  )
}

export const useRenderer = () => {
  const registry = useContext(RendererContext)
  const renderBlock = (block: Block) => {
    const renderer = registry[block.type]
    if (!renderer) return null
    return renderer(block)
  }
  return { renderBlock }
}
