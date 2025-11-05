import { createNanoEvents } from 'nanoevents'
import type { InstalledTool, ToolResultPayload, ToolSpec } from '@ai-frame/types'

export interface PluginManifest extends ToolSpec {
  name: string
  version: string
  entry: () => Promise<PluginRuntime>
}

export interface PluginRuntime {
  invoke(args: Record<string, unknown>): Promise<ToolResultPayload['output']>
  suspend?(): void
  destroy?(): void
  ui?: unknown
}

export type PluginHostEvents = {
  installed: PluginManifest
  enabled: InstalledTool
  disabled: InstalledTool
  invoked: { name: string; args: Record<string, unknown> }
  failed: { name: string; error: Error }
}

export class PluginHost {
  private registry = new Map<string, PluginManifest>()
  private runtimes = new Map<string, PluginRuntime>()
  private emitter = createNanoEvents<PluginHostEvents>()

  on<E extends keyof PluginHostEvents>(event: E, handler: (payload: PluginHostEvents[E]) => void) {
    return this.emitter.on(event, handler)
  }

  install(manifest: PluginManifest) {
    this.registry.set(manifest.name, manifest)
    this.emitter.emit('installed', manifest)
  }

  async enable(name: string) {
    const manifest = this.registry.get(name)
    if (!manifest) throw new Error(Plugin  missing manifest)
    if (this.runtimes.has(name)) return
    const runtime = await manifest.entry()
    this.runtimes.set(name, runtime)
    this.emitter.emit('enabled', buildInstalledTool(manifest))
  }

  disable(name: string) {
    const runtime = this.runtimes.get(name)
    runtime?.suspend?.()
    runtime?.destroy?.()
    this.runtimes.delete(name)
    const manifest = this.registry.get(name)
    if (manifest) {
      this.emitter.emit('disabled', buildInstalledTool(manifest))
    }
  }

  async invoke(name: string, args: Record<string, unknown>) {
    const runtime = this.runtimes.get(name)
    if (!runtime) throw new Error(Plugin  not enabled)
    this.emitter.emit('invoked', { name, args })
    try {
      const result = await runtime.invoke(args)
      return result
    } catch (error) {
      this.emitter.emit('failed', { name, error: error as Error })
      throw error
    }
  }

  list() {
    return Array.from(this.registry.values())
  }
}

const buildInstalledTool = (manifest: PluginManifest): InstalledTool => ({
  ...manifest,
  enabled: true,
  entry: manifest.entry.toString(),
})
