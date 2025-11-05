import { StatusBar } from 'expo-status-bar'
import { memo, useCallback } from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native'
import { useStore } from 'zustand'
import {
  buildMockData,
  createCommandBus,
  createSessionStore,
  type SessionStore,
  type SessionStoreState,
} from '@ai-frame/domain'
import type { TransportAdapter } from '@ai-frame/types'

const transport: TransportAdapter = {
  async *streamPrompt({ messageId, sessionId, content }) {
    const canned = 移动端占位流：
    yield {
      messageId,
      sessionId,
      block: {
        id: ${messageId}-mobile,
        type: 'text',
        data: { kind: 'text', content: canned, format: 'markdown' },
        createdAt: Date.now(),
      },
      isFinal: true,
    }
  },
}

const store: SessionStore = (() => {
  const instance = createSessionStore({ transport })
  instance.getState().actions.hydrate(buildMockData())
  return instance
})()

const commandBus = createCommandBus(store)

const useSession = <T,>(selector: (state: SessionStoreState) => T) => useStore(store, selector)

export default function App() {
  const sessions = useSession((state) => state.sessionOrder.map((id) => state.sessions[id]))
  const activeSessionId = useSession((state) => state.activeSessionId ?? state.sessionOrder[0])
  const messages = useSession((state) => (activeSessionId ? state.messages[activeSessionId] ?? [] : []))

  const sendQuickPrompt = useCallback(() => {
    if (!activeSessionId) return
    commandBus.dispatch({ type: 'prompt', sessionId: activeSessionId, content: '总结一下本轮对话' })
  }, [activeSessionId])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.title}>AI Frame Mobile</Text>
        <FlatList
          data={sessions}
          keyExtractor={(item) => item?.id ?? 'unknown'}
          renderItem={({ item }) => (
            <SessionRow
              session={item?.title ?? '未命名'}
              active={item?.id === activeSessionId}
              onPress={() => item && store.getState().actions.selectSession(item.id)}
            />
          )}
        />
      </View>

      <View style={styles.chatPane}>
        <Text style={styles.sessionTitle}>{sessions.find((s) => s?.id === activeSessionId)?.title}</Text>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.message, item.role === 'user' ? styles.user : styles.assistant]}>
              <Text style={styles.messageRole}>{item.role.toUpperCase()}</Text>
              <Text style={styles.messageContent}>
                {item.content.map((block) => (block.type === 'text' ? (block.data as any).content : '')).join('\n')}
              </Text>
            </View>
          )}
        />
        <TouchableOpacity style={styles.primaryButton} onPress={sendQuickPrompt}>
          <Text style={styles.primaryButtonText}>发送示例</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  )
}

const SessionRow = memo(({ session, active, onPress }: { session: string; active?: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.sessionRow, active && styles.sessionRowActive]}>
    <Text style={[styles.sessionRowText, active && styles.sessionRowTextActive]}>{session}</Text>
  </TouchableOpacity>
))

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0E0F11',
  },
  sidebar: {
    width: 200,
    padding: 16,
    backgroundColor: '#111318',
  },
  chatPane: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  title: {
    color: '#f2f4f7',
    fontWeight: '600',
    marginBottom: 12,
  },
  sessionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  message: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  user: {
    backgroundColor: '#1E2026',
  },
  assistant: {
    backgroundColor: '#14161b',
  },
  messageRole: {
    color: '#98A2B3',
    fontSize: 12,
  },
  messageContent: {
    color: '#F2F4F7',
    marginTop: 4,
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: '#4C8CFF',
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0F111A',
    fontWeight: '600',
  },
  sessionRow: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  sessionRowActive: {
    backgroundColor: '#1E2026',
  },
  sessionRowText: {
    color: '#98A2B3',
  },
  sessionRowTextActive: {
    color: '#fff',
  },
})
