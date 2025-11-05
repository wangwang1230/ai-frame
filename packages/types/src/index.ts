export type Role = 'system' | 'user' | 'assistant' | 'tool'
export type MessageStatus = 'pending' | 'streaming' | 'done' | 'failed'
export type ToolCallStatus = 'pending' | 'running' | 'done' | 'failed'
export type BlockType =
  | 'text'
  | 'code'
  | 'chart'
  | 'table'
  | 'image'
  | 'audio'
  | 'file'
  | 'trace'
  | 'tool-result'

export interface Session {
  id: string
  title: string
  pinnedTools: string[]
  participants: Array<{ id: string; name: string; avatar?: string }>
  modelConfig: ModelConfig
  createdAt: number
  updatedAt: number
}

export interface ModelConfig {
  model: string
  temperature: number
  topP: number
  maxTokens?: number
  plugins?: string[]
}

export interface MessageMeta {
  isCritical?: boolean
  source?: 'user' | 'system' | 'automation'
  tags?: string[]
  toolCallIds?: string[]
}

export interface Block<T extends BlockPayload = BlockPayload> {
  id: string
  type: BlockType
  data: T
  deltaIdx?: number
  createdAt: number
}

export type BlockPayload =
  | TextPayload
  | CodePayload
  | ChartPayload
  | TablePayload
  | ImagePayload
  | AudioPayload
  | FilePayload
  | TracePayload
  | ToolResultPayload

export interface TextPayload {
  kind: 'text'
  content: string
  format?: 'markdown' | 'plain'
}

export interface CodePayload {
  kind: 'code'
  language: string
  content: string
  runnable?: boolean
}

export interface ChartPayload {
  kind: 'chart'
  schema: Record<string, unknown>
}

export interface TablePayload {
  kind: 'table'
  rows: Array<Record<string, string | number>>
  columns: string[]
}

export interface ImagePayload {
  kind: 'image'
  url: string
  alt?: string
}

export interface AudioPayload {
  kind: 'audio'
  url: string
  mime?: string
}

export interface FilePayload {
  kind: 'file'
  url: string
  name: string
  size: number
}

export interface TracePayload {
  kind: 'trace'
  steps: Array<{ label: string; detail: string; durationMs?: number }>
}

export interface ToolResultPayload {
  kind: 'tool-result'
  toolName: string
  output: Record<string, unknown>
}

export interface Message {
  id: string
  sessionId: string
  role: Role
  status: MessageStatus
  content: Block[]
  toolCalls: ToolCall[]
  meta?: MessageMeta
  createdAt: number
  updatedAt: number
}

export interface ToolCall {
  id: string
  name: string
  description?: string
  arguments: Record<string, unknown>
  status: ToolCallStatus
  result?: ToolResultPayload['output']
  error?: string
}

export interface ConversationState {
  sessions: Record<string, Session>
  sessionOrder: string[]
  messages: Record<string, Message[]>
  activeSessionId?: string
}

export interface StreamingDelta {
  messageId: string
  sessionId: string
  block: Block
  isFinal?: boolean
}

export interface StreamPromptInput {
  sessionId: string
  messageId: string
  content: string
  toolCallIds?: string[]
}

export interface TransportAdapter {
  streamPrompt(input: StreamPromptInput): AsyncIterable<StreamingDelta>
  abort?(messageId: string): void
}

export interface ToolSpec {
  name: string
  description: string
  parameters: Record<string, unknown>
  permissions?: string[]
}

export interface InstalledTool extends ToolSpec {
  version: string
  enabled: boolean
  entry: string
}

export type CommandInput =
  | { type: 'prompt'; sessionId: string; content: string }
  | { type: 'retry'; messageId: string }
  | { type: 'branch'; messageId: string }
  | { type: 'tool'; name: string; args: Record<string, unknown> }

export interface TransportPayload {
  event: 'chunk' | 'tool' | 'state' | 'error'
  data: Record<string, unknown>
  timestamp: number
}
