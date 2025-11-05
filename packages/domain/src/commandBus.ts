import type { CommandInput } from '@ai-frame/types'
import type { SessionStore } from './sessionStore'

export interface CommandBus {
  dispatch(command: CommandInput): Promise<unknown>
}

export const createCommandBus = (store: SessionStore): CommandBus => {
  const dispatch: CommandBus['dispatch'] = async (command) => {
    const actions = store.getState().actions
    switch (command.type) {
      case 'prompt':
        return actions.sendPrompt(command.content, command.sessionId)
      case 'retry':
        return actions.retryMessage(command.messageId)
      case 'branch':
        return actions.branchFrom(command.messageId)
      case 'tool':
        console.warn('Tool command needs plugin host integration', command)
        return undefined
      default:
        const _exhaustive: never = command
        return _exhaustive
    }
  }

  return { dispatch }
}
