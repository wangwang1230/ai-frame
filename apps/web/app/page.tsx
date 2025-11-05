'use client'

import { Sidebar } from '../components/navigation/Sidebar'
import { ChatPanel } from '../components/chat/ChatPanel'
import { CommandMenu } from '../components/command/CommandMenu'

export default function HomePage() {
  return (
    <div className="flex h-screen w-full bg-background text-text">
      <Sidebar />
      <ChatPanel />
      <CommandMenu />
    </div>
  )
}
