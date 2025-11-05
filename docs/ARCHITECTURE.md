# AI Frame · Architecture Notes

## Quick Start

```bash
pnpm install
pnpm dev:web       # Next.js + streaming SSE
pnpm dev:mobile    # Expo shell (uses共享 domain store + mock transport)
pnpm dev:desktop   # Tauri shell embedding web体验
```

> 需要 Node 18+、pnpm 8+、Rust 1.74+（Tauri）。

## Monorepo Layout

| Scope | Path | 描述 |
| --- | --- | --- |
| Web | `apps/web` | Next.js App Router，包含多会话 UI、Renderer、Command Menu、SSE API Mock |
| Mobile | `apps/mobile` | Expo (React Native) 验证共享 Domain Store，移动 UI 占位 |
| Desktop | `apps/desktop` | Tauri + Vite Shell，将 Web 体验封装为桌面应用 |
| Config | `packages/config` | Tailwind/ESLint 预设 |
| Types | `packages/types` | Session/Message/Block/Tool 等 schema |
| Domain | `packages/domain` | Zustand 状态机、命令总线、Mock 数据 |
| Infra | `packages/infra` | SSE Transport、重连/终止接口 |
| UI | `packages/ui` | Renderer Registry、MessageList、Block 渲染器 |
| Plugin Host | `packages/plugin-host` | 插件生命周期、事件总线 |

## Data Path

1. `Composer` 触发 `CommandBus.dispatch('prompt')`
2. `SessionStore.actions.sendPrompt`：
   - 写入 User Message + Streaming Placeholder
   - 调用 `TransportAdapter.streamPrompt`
3. `@ai-frame/infra` SSE Transport 解析增量 → `StreamingDelta`
4. Store 合并 `Block` delta，`MessageList` 通过 `RendererProvider` 增量渲染
5. 工具调用通过 `PluginHost` 报告事件（当前 Demo 中以 UI 占位）

## 状态管理

- Zustand vanilla store（`createSessionStore`）可被 Web/RN/Tauri 共享
- `composerDrafts` 与 `inflightMessageIds` 确保跨端保持输入/状态一致
- `CommandBus` 约束消息操作（prompt/retry/branch/tool）

## 实时与流式

- `apps/web/app/api/stream` 模拟 BFF SSE，支持 Block idempotent merge
- `packages/infra` 使用 `eventsource-parser` 兼容浏览器 fetch 流
- Transport 暴露 `abort(messageId)` 预留背压 & 断点续传能力

## Plugin Host

- Workspace 包 `@ai-frame/plugin-host` 定义 `PluginManifest`/`PluginRuntime`
- 提供 `install/enable/invoke/disable` 生命周期 + 事件；实际 UI 由 Web ToolTray 占位

## 跨端复用

- Domain/Infra/Types/UI 均以 TypeScript 实现，供 Next/RN/Tauri 直接消费
- Mobile 使用 mock transport 验证 API，未来可指向 BFF gRPC-web ↔ WebSocket。
- Desktop Shell 通过 iframe 加载 Web（默认 http://localhost:3000），支持 `shell.open` 调系统浏览器

## 后续演进建议

1. 在 `packages/domain` 新增消息队列 + IndexedDB 离线日志
2. Web 引入真实插件 UI（iframe + postMessage）与权限面板
3. SSE → 双通道（WS/gRPC-web）抽象，支持语音/协同
4. Playwright + Detox 自动化校验关键路径
5. 为 `@ai-frame/ui` Renderer 引入懒加载与语法高亮（Shiki）
