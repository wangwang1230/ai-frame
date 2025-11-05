import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const workspaceAlias = {
  '@ai-frame/types': path.resolve(__dirname, '../../packages/types/src'),
  '@ai-frame/domain': path.resolve(__dirname, '../../packages/domain/src'),
  '@ai-frame/infra': path.resolve(__dirname, '../../packages/infra/src'),
  '@ai-frame/ui': path.resolve(__dirname, '../../packages/ui/src'),
  '@ai-frame/plugin-host': path.resolve(__dirname, '../../packages/plugin-host/src'),
  '@ai-frame/config': path.resolve(__dirname, '../../packages/config'),
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    turbo: {
      resolveAlias: workspaceAlias,
    },
  },
  webpack: config => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      ...workspaceAlias,
    }
    return config
  },
}

export default nextConfig
