import { createParser, type ParsedEvent } from 'eventsource-parser'
import type {
  StreamPromptInput,
  StreamingDelta,
  TransportAdapter,
} from '@ai-frame/types'

export interface SSETransportOptions {
  endpoint?: string
  headers?: Record<string, string>
}

export const createSSETransport = (
  options: SSETransportOptions = {},
): TransportAdapter => {
  const base = options.endpoint ?? '/api/stream'
  const controllers = new Map<string, AbortController>()

  return {
    streamPrompt: (input: StreamPromptInput) =>
      streamFromEndpoint({ base, input, headers: options.headers, controllers }),
    abort: (messageId: string) => {
      const controller = controllers.get(messageId)
      controller?.abort()
      controllers.delete(messageId)
    },
  }
}

interface StreamParams {
  base: string
  input: StreamPromptInput
  headers?: Record<string, string>
  controllers: Map<string, AbortController>
}

const streamFromEndpoint = ({ base, input, headers, controllers }: StreamParams) => {
  const iterator = async function* (): AsyncGenerator<StreamingDelta> {
    const controller = new AbortController()
    controllers.set(input.messageId, controller)
    const response = await fetch(base, {
      method: 'POST',
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      signal: controller.signal,
    })

    if (!response.body) {
      throw new Error('Streaming response missing body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    const queue: StreamingDelta[] = []
    const parser = createParser((event: ParsedEvent) => {
      if (event.type !== 'event' || !event.data) return
      try {
        const parsed = JSON.parse(event.data) as StreamingDelta
        queue.push(parsed)
      } catch (error) {
        console.error('Failed parsing SSE chunk', error)
      }
    })

    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        parser.feed(decoder.decode(value, { stream: true }))
        while (queue.length) {
          yield queue.shift() as StreamingDelta
        }
      }
    } finally {
      controllers.delete(input.messageId)
      reader.releaseLock()
    }
  }

  return iterator()
}
