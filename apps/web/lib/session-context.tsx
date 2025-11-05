'use client'

import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react'
import { useStore } from 'zustand'
import {
  createCommandBus,
  createSessionStore,
  type CommandBus,
  type SessionStore,
  type SessionStoreState,
  buildMockData,
} from '@ai-frame/domain'
import { createSSETransport } from '@ai-frame/infra'

const SessionContext = createContext<SessionStore | null>(null)
const CommandBusContext = createContext<CommandBus | null>(null)

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const storeRef = useRef<SessionStore>()
  if (!storeRef.current) {
    storeRef.current = createSessionStore({ transport: createSSETransport() })
    const mock = buildMockData()
    storeRef.current.getState().actions.hydrate(mock)
  }

  const commandBus = useMemo(() => createCommandBus(storeRef.current as SessionStore), [])

  return (
    <SessionContext.Provider value={storeRef.current}>
      <CommandBusContext.Provider value={commandBus}>{children}</CommandBusContext.Provider>
    </SessionContext.Provider>
  )
}

export const useSessionStore = <T,>(selector: (state: SessionStoreState) => T): T => {
  const store = useContext(SessionContext)
  if (!store) throw new Error('Session store missing context')
  return useStore(store, selector)
}

export const useCommandBus = () => {
  const bus = useContext(CommandBusContext)
  if (!bus) throw new Error('Command bus missing context')
  return bus
}
