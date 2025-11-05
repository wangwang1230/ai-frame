import type { Message, Session } from '@ai-frame/types'
import { nanoid } from 'nanoid'

export const buildMockData = () => {
  const baseSessions: Session[] = [
    {
      id: 'session-1',
      title: '产品设计周报',
      pinnedTools: ['web-search', 'chart-maker'],
      participants: [
        { id: 'you', name: '你' },
        { id: 'assistant', name: '豆包' },
      ],
      modelConfig: {
        model: 'doubao-pro',
        temperature: 0.5,
        topP: 0.9,
      },
      createdAt: Date.now() - 1000 * 60 * 60,
      updatedAt: Date.now(),
    },
    {
      id: 'session-2',
      title: 'SQL 调优备忘',
      pinnedTools: ['code-runner'],
      participants: [
        { id: 'you', name: '你' },
        { id: 'assistant', name: '豆包' },
      ],
      modelConfig: {
        model: 'doubao-lite',
        temperature: 0.2,
        topP: 0.8,
      },
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
      updatedAt: Date.now() - 1000 * 60 * 20,
    },
  ]

  const messages: Message[] = [
    {
      id: nanoid(),
      sessionId: 'session-1',
      role: 'user',
      status: 'done',
      content: [
        {
          id: nanoid(),
          type: 'text',
          data: {
            kind: 'text',
            content: '帮我把本周多模态输入输出的迭代总结成周报，突出亮点和风险。',
            format: 'markdown',
          },
          createdAt: Date.now(),
        },
      ],
      toolCalls: [],
      createdAt: Date.now() - 1000 * 60 * 50,
      updatedAt: Date.now() - 1000 * 60 * 50,
    },
    {
      id: nanoid(),
      sessionId: 'session-1',
      role: 'assistant',
      status: 'done',
      content: [
        {
          id: nanoid(),
          type: 'text',
          data: {
            kind: 'text',
            content:
              '### 多模态亮点\n- 语音听写延迟控制在 280ms，支持中英文自由切换\n- 图片理解能力升级，引入区域引用能力，支持“圈一圈讲一讲”\n\n### 风险\n- TTS 合成在移动端偶现爆音，需继续优化 WebAssembly pipeline\n- 摄像头权限在 Safari 16 上需要兜底弹窗',
            format: 'markdown',
          },
          createdAt: Date.now(),
        },
      ],
      toolCalls: [],
      createdAt: Date.now() - 1000 * 60 * 49,
      updatedAt: Date.now() - 1000 * 60 * 49,
    },
  ]

  return { sessions: baseSessions, messages }
}
