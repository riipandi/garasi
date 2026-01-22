import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import type { Config as RouterConfig } from '@tanstack/router-plugin/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import type { NitroConfig } from 'nitro/types'
import { nitro } from 'nitro/vite'
import { isProduction } from 'std-env'
import { defineConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import tsconfigPaths from 'vite-tsconfig-paths'

const nitroConfig = {
  compatibilityDate: '2025-09-15',
  preset: 'bun',
  serveStatic: true,
  serverDir: './server',
  minify: isProduction
} satisfies NitroConfig

const routerConfig: Partial<RouterConfig> = {
  routesDirectory: './app/routes',
  generatedRouteTree: './app/routes.gen.ts',
  autoCodeSplitting: true,
  target: 'react'
}

export default defineConfig({
  plugins: [
    nitro(),
    tanstackRouter(routerConfig),
    devtools({ removeDevtoolsOnBuild: true }),
    react(),
    tailwindcss(),
    tsconfigPaths({ ignoreConfigErrors: true }),
    devtoolsJson()
  ],
  nitro: nitroConfig,
  resolve: { tsconfigPaths: true },
  build: {
    chunkSizeWarningLimit: 1024 * 2,
    minify: isProduction ? 'oxc' : false
  },
  server: {
    port: 3980,
    strictPort: true,
    watch: {
      ignored: ['**/docs/**', '**/specs/**', '**/scripts/**']
    }
  }
})
