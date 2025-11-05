import { NextRequest } from 'next/server'
import { nanoid } from 'nanoid'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const { content, messageId, sessionId } = await request.json()
  const encoder = new TextEncoder()
  const blockId = nanoid()
  const template = buildAssistantReply(content)
  const chunks = chunkText(template, 80)

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < chunks.length; i += 1) {
        const delta = {
          messageId,
          sessionId,
          block: {
            id: blockId,
            type: 'text',
            data: { kind: 'text', content: chunks[i], format: 'markdown' },
            createdAt: Date.now(),
          },
          isFinal: i === chunks.length - 1,
        }
        controller.enqueue(encoder.encode(event: chunk\ndata: \n\n))
        await new Promise((resolve) => setTimeout(resolve, 120))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

const buildAssistantReply = (prompt: string) => {
  return ### 处理请求\n- 用户意图：\n- 解析：拆分为检索、多模态、工具链执行三步\n\n### 即时计划\n1. 检索知识库并合并缓存\n2. 结合上下文生成草稿\n3. 如果触发插件，则串联工具返回结构化结果\n\n> 本地 Demo 使用 SSE 模拟豆包流式效果。
}

const chunkText = (text: string, size: number) => {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks
}
