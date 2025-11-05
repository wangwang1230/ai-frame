# AI Frame

打造「豆包客户端」级别体验的跨端前端架构（Web / Mobile / Desktop），覆盖多会话聊天、流式回复、插件工具链、富媒体、多模态与导出分享等能力。项目采用多包工作区（Turborepo + pnpm），抽象 Domain/Infra 层以共享核心状态机与服务逻辑，再为不同终端提供 UI 壳。

---

## 用户旅程（UJT）
- **入口**：展示最近会话与模板合集，支持 Pin/搜索。
- **会话过程**：创建/切换会话 → 输入问题 → 立即触发流式产出 → 过程中可调工具（搜索/翻译/制图等）与多模态输入。
- **消息后处理**：复制、引用、改写、继续、分支、总结、设为卡片。
- **导出分享**：图片 / Markdown / PDF / 链接（含权限控制）。

---

## 技术栈与层次

| 层级 | 说明 | Tech |
| --- | --- | --- |
| 体验层（UI/UX） | 页面/组件、渲染器（文本/代码/图表/表格/音视频）、快捷指令 | Next.js 14 (App Router) + React 18、Tailwind、shadcn/ui、Radix、Shiki、TipTap |
| 应用层（Domain） | 会话状态机、消息总线、工具宿主、模型/角色配置、缓存与离线策略 | TanStack Query + Zustand、Actor/State Machine（XState-inspired） |
| 基础能力层（Infra） | 网络流（SSE/WebSocket/gRPC-web）、持久化（IndexedDB/CacheStorage）、任务队列、加密权限、遥测 | ky/Fetch、SSE helpers、idb-keyval、Workbox、PostHog SDK、Feature Flags |

典型数据流：`UI 输入 → Command → Domain State Machine → Transport (SSE/WS) → 流式增量 → 渲染器 → 插件Host ↔ BFF ↔ 第三方服务`。

---

## 仓库结构

```
ai-frame
├─ apps
│  ├─ web/          # Next.js 客户端（SSR + RSC）
│  ├─ mobile/       # React Native (Expo) 壳，复用 domain/services
│  └─ desktop/      # Tauri + Web 前端
├─ packages
│  ├─ config/       # Tailwind、ESLint、TS 基础配置
│  ├─ types/        # 跨端类型 & JSONSchema
│  ├─ domain/       # 会话/消息状态机、消息队列、插件协议
│  ├─ infra/        # Transport、缓存、遥测、Feature Flag
│  ├─ ui/           # 共享 UI 基建：Renderer Registry、消息列表
│  └─ plugin-host/  # 插件生命周期、权限治理、iframe 宿主
├─ docs/            # 架构说明、运行手册
└─ tools/           # Dev 脚本、代码生成器
```

---

## 关键模块

- **Session Engine**：基于 Zustand Store + Immer，维护 `Session`, `Message`, `Block`, `ToolCall`。支持分片增量（delta idempotent merge）与离线事务日志。
- **Renderer Registry**：Block.type -> renderer map，延迟加载 + 优先级调度（requestIdleCallback）。包含文本、代码（Shiki 流式高亮）、图表（vega-lite schema 驱动）、表格（TipTap + React Virtual）。
- **Transport Layer**：SSE 默认、WS 可选，提供自动重连、Range 续传、背压控制。
- **PluginHost**：tool spec + manifest 签名校验，支持 iframe sandbox / 前端 widget / BFF 代理插件。权限声明 + 用户授权 UI。
- **Knowledge & Search**：MiniSearch 做前端全文检索；向量检索交由 BFF，只存引用。
- **Observability**：Page/View/Action/Error/Perf 埋点 + Feature Flag + 灰度控制。

---

## 当前进度

1. 设计整体架构与模块拆分。
2. 搭建 Turborepo + pnpm 工作区。
3. 实现 Web 端核心体验（多会话 + 流式消息 + 工具 Panel）。
4. 提供跨端共享的 Domain/Infra 包，移动与桌面壳可直接复用。

---

## 下一步路线

1. 完成移动端（Expo）UI，验证共享 Store。
2. 打通 Desktop (Tauri) 原生能力：文件导出、系统通知。
3. 深入插件生态：Manifest 管控、插件市场 UI。
4. 引入 WASM 工具（如本地图像处理、嵌入计算）。
5. 逐步补齐测试矩阵（Vitest + Playwright + Detox）。
