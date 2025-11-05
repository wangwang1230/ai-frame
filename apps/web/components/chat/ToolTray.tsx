'use client'

import { Globe, Link2, Loader2, Puzzle, Repeat, Share2, Sigma } from 'lucide-react'
import type { Session } from '@ai-frame/types'
import { useState } from 'react'
import { toast } from 'sonner'

interface ToolTrayProps {
  session?: Session
}

const builtinTools = [
  { id: 'web-search', icon: Globe, label: '网页搜索', description: '实时搜索 + 摘要' },
  { id: 'doc-scan', icon: Link2, label: '网页抓取', description: '抓取结构化网页内容' },
  { id: 'code-runner', icon: Sigma, label: '代码执行', description: 'WebContainer 沙盒' },
  { id: 'retry', icon: Repeat, label: '消息重试', description: '重新触发最后一条链路' },
]

export const ToolTray = ({ session }: ToolTrayProps) => {
  const [loadingTool, setLoadingTool] = useState<string | null>(null)

  const handleInvoke = async (toolId: string) => {
    setLoadingTool(toolId)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setLoadingTool(null)
    toast.success(`${toolId} 已触发（伪造）`)
  }

  return (
    <aside className="flex h-full flex-col border-l border-white/5 bg-background-elevated/60 px-4 py-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">内置工具</h3>
        <button className="text-xs text-text-muted hover:text-white">市集</button>
      </div>
      <p className="text-xs text-text-muted">固定 {session?.pinnedTools?.length ?? 0} 个工具</p>

      <div className="mt-4 space-y-3">
        {builtinTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleInvoke(tool.id)}
            className="w-full rounded-2xl border border-white/5 px-4 py-3 text-left transition hover:border-white/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm font-medium text-white">
                <tool.icon className="h-4 w-4" />
                <span>{tool.label}</span>
              </div>
              {loadingTool === tool.id ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : null}
            </div>
            <p className="text-xs text-text-muted">{tool.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-auto rounded-2xl border border-dashed border-white/20 p-4 text-center text-text-muted">
        <Puzzle className="mx-auto mb-3 h-6 w-6" />
        <p className="text-sm font-medium text-white">开放 BFF 能力</p>
        <p className="text-xs">支持 http/gRPC、iframe 接入 + 权限管控</p>
        <button className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs text-white">
          <Share2 className="h-3.5 w-3.5" /> 接入指引
        </button>
      </div>
    </aside>
  )
}
