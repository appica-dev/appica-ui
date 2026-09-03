import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [svelte({ hot: false })],
  resolve: {
    // Vitest would otherwise pick svelte's server entry (`index-server.js`)
    // and `mount()` would throw "not available on the server".
    conditions: ['browser'],
  },
  test: {
    name: '@appica/ui-svelte',
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['**/*.test.ts', '**/index.ts', 'src/test/**'],
    },
  },
})
