'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { RendererProvider } from '@ai-frame/ui'
import { SessionProvider } from '../lib/session-context'
import { Toaster } from 'sonner'

export const Providers = ({ children }: { children: ReactNode }) => {
  const [client] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      <SessionProvider>
        <RendererProvider>
          {children}
          <Toaster theme="dark" closeButton position="bottom-right" />
        </RendererProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
