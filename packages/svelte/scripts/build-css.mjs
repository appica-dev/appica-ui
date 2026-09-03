// Generates the prebuilt `appica.css` for consumers who don't use Tailwind.
import { createRequire } from 'node:module'
import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const postcss = require('postcss')
const tailwind = require('@tailwindcss/postcss')

const pkgRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(pkgRoot, 'dist')
const entryPath = join(pkgRoot, '.appica-css-entry.css')
const outPath = join(pkgRoot, 'appica.css')

if (!existsSync(distDir)) {
  console.error('[build-css] dist/ not found - run the JS build before this script.')
  process.exit(1)
}

writeFileSync(entryPath, `@import './styles.css';\n@source './dist';\n`)

const banner =
  '/*! Appica UI prebuilt stylesheet - for projects without Tailwind.\n' +
  ' * Tailwind users: import styles.css + @source instead (see docs/installation).\n' +
  ' * Override design tokens by redefining the CSS variables after this file:\n' +
  ' *   :root { --primary: oklch(60% 0.25 150); }\n' +
  ' */\n'

try {
  const input = readFileSync(entryPath, 'utf8')
  const result = await postcss([tailwind({ optimize: { minify: true } })]).process(input, {
    from: entryPath,
    to: outPath,
  })
  writeFileSync(outPath, banner + result.css)
} finally {
  rmSync(entryPath, { force: true })
}

console.log(`[build-css] wrote appica.css (${(statSync(outPath).size / 1024).toFixed(1)} KB)`)
