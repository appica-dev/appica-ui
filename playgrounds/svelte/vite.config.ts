import { fileURLToPath } from 'node:url'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: /^@appica\/ui-svelte$/,
        replacement: fileURLToPath(new URL('../../packages/svelte/src/index.ts', import.meta.url)),
      },
    ],
  },
})
