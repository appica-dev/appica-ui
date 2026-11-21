/*
 * Tests for skills/appica-ui-react/scripts/check.mjs, the script the skill ships to consumers.
 * Each test builds a throwaway project with a stub of the installed package, so nothing
 * here needs a build or a network. Run with `pnpm test:skill`.
 */

import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { after, test } from 'node:test'
import { fileURLToPath } from 'node:url'

const CHECK = resolve(dirname(fileURLToPath(import.meta.url)), '../skills/appica-ui-react/scripts/check.mjs')
const SOURCE_2_UP = "@source '../../node_modules/@appica/ui-react/dist';"
const CONFIGURED = `@import 'tailwindcss';\n@import '@appica/ui-react/styles.css';\n\n${SOURCE_2_UP}\n`

const created = []
after(() => created.forEach((dir) => rmSync(dir, { recursive: true, force: true })))

function write(root, file, content) {
  const path = join(root, file)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

/** A project with stubs of react, tailwindcss and the library in node_modules. */
function project({
  files = {},
  css = CONFIGURED,
  version = '1.5.0',
  entries = { button: ['Button', 'buttonVariants'], card: ['Card', 'CardHeader'], drawer: ['Drawer'] },
  libraryCss = "@import 'tailwindcss';\n@theme inline {}\n",
  react = '19.3.1',
  tailwind = '4.3.5',
  installed = true,
} = {}) {
  const root = mkdtempSync(join(tmpdir(), 'appica-skill-check-'))
  created.push(root)
  write(root, 'package.json', JSON.stringify({ name: 'fixture', dependencies: { '@appica/ui-react': '^1.5.0' } }))
  if (css !== null) write(root, 'src/styles/app.css', css)
  for (const [file, content] of Object.entries(files)) write(root, file, content)
  if (react) write(root, 'node_modules/react/package.json', JSON.stringify({ name: 'react', version: react }))
  if (tailwind) {
    write(root, 'node_modules/tailwindcss/package.json', JSON.stringify({ name: 'tailwindcss', version: tailwind }))
  }
  if (!installed) return root

  const library = 'node_modules/@appica/ui-react'
  const exports = {
    '.': {},
    './styles.css': './styles.css',
    './css': './appica.css',
    './package.json': './package.json',
  }
  for (const [name, names] of Object.entries(entries)) {
    exports[`./${name}`] = { types: `./dist/components/${name}/index.d.ts` }
    write(root, `${library}/dist/components/${name}/index.d.ts`, `export * from './${name}';\n`)
    write(
      root,
      `${library}/dist/components/${name}/${name}.d.ts`,
      `${names.map((value) => `declare function ${value}(): null;`).join('\n')}\nexport { ${names.join(', ')} };\nexport type { ${names[0]}Props };\n`,
    )
  }
  write(root, `${library}/package.json`, JSON.stringify({ name: '@appica/ui-react', version, exports }))
  write(root, `${library}/styles.css`, libraryCss)
  return root
}

function check(root, ...args) {
  const result = spawnSync(process.execPath, [CHECK, ...args], { cwd: root, encoding: 'utf8' })
  return { code: result.status, out: result.stdout + result.stderr }
}

test('a configured project passes', () => {
  const { code, out } = check(project())
  assert.equal(code, 0, out)
  assert.match(out, /@source in src\/styles\/app\.css reaches the library/)
  assert.match(out, /Result: 0 errors, 0 warnings\./)
})

test('no package.json is a usage error, not a finding', () => {
  const root = mkdtempSync(join(tmpdir(), 'appica-skill-check-'))
  created.push(root)
  assert.equal(check(root).code, 2)
})

test('a project without the library is told to set it up', () => {
  const { code, out } = check(project({ installed: false }))
  assert.equal(code, 1)
  assert.match(out, /is in package\.json but not in node_modules/)
})

test('a missing @source prints the line for that stylesheet', () => {
  const css = "@import 'tailwindcss';\n@import '@appica/ui-react/styles.css';\n"
  const { code, out } = check(project({ css }))
  assert.equal(code, 1)
  assert.match(out, /No @source reaches/)
  assert.ok(out.includes(SOURCE_2_UP), out)
})

test('a bare package name in @source is an error', () => {
  const css = "@import 'tailwindcss';\n@import '@appica/ui-react/styles.css';\n@source '@appica/ui-react';\n"
  const { code, out } = check(project({ css }))
  assert.equal(code, 1)
  assert.match(out, /app\.css:3:1 @source '@appica\/ui-react' is a bare package name/)
})

test('an @source with the wrong number of ../ is an error', () => {
  const css = CONFIGURED.replace('../../node_modules', '../node_modules')
  const { code, out } = check(project({ css }))
  assert.equal(code, 1)
  assert.match(out, /does not resolve to the installed library/)
  assert.ok(out.includes(SOURCE_2_UP), out)
})

test('a commented-out @source does not count', () => {
  const css = CONFIGURED.replace(SOURCE_2_UP, `/* ${SOURCE_2_UP} */`)
  assert.equal(check(project({ css })).code, 1)
})

test('an @source that reaches the package through a symlink passes', () => {
  // pnpm's layout: node_modules/@appica/ui-react is a link into the store.
  const root = project()
  const store = join(root, 'node_modules/.pnpm/ui-react')
  mkdirSync(dirname(store), { recursive: true })
  renameSync(join(root, 'node_modules/@appica/ui-react'), store)
  symlinkSync(store, join(root, 'node_modules/@appica/ui-react'), 'dir')
  const { code, out } = check(root)
  assert.equal(code, 0, out)
})

test('a library that registers its own @source needs none in the project', () => {
  const css = "@import 'tailwindcss';\n@import '@appica/ui-react/styles.css';\n"
  const { code, out } = check(project({ css, libraryCss: "@import 'tailwindcss';\n@source './dist';\n" }))
  assert.equal(code, 0, out)
  assert.match(out, /registers its own @source/)
})

test('the prebuilt stylesheet is a valid setup without Tailwind', () => {
  const { code, out } = check(project({ css: "@import '@appica/ui-react/css';\n", tailwind: null }))
  assert.equal(code, 0, out)
  assert.match(out, /prebuilt stylesheet/)
})

test('loading both stylesheets is a warning', () => {
  const { code, out } = check(project({ css: `${CONFIGURED}@import '@appica/ui-react/css';\n` }))
  assert.equal(code, 0, out)
  assert.match(out, /Both stylesheets are loaded/)
})

test('no stylesheet import at all prints both lines to add', () => {
  const { code, out } = check(project({ css: "@import 'tailwindcss';\n" }))
  assert.equal(code, 1)
  assert.match(out, /No stylesheet imports Appica UI/)
  assert.ok(out.includes("@import '@appica/ui-react/styles.css';") && out.includes(SOURCE_2_UP), out)
})

test('React 18 and Tailwind 3 are errors', () => {
  const { code, out } = check(project({ react: '18.3.1', tailwind: '3.4.17' }))
  assert.equal(code, 1)
  assert.match(out, /react 18\.3\.1 is installed/)
  assert.match(out, /tailwindcss 3\.4\.17 is installed/)
})

test('a client-rendered app is warned when the theme script is missing', () => {
  const provider = "import { ThemeProvider } from '@appica/ui-react/providers/theme-provider'\n"
  const spa = '<html><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>'
  const files = { 'index.html': spa, 'src/main.tsx': provider }

  const missing = check(project({ files }))
  assert.equal(missing.code, 0, missing.out)
  assert.match(missing.out, /ThemeProvider's no-flash script never runs/)

  const plugin = "import { getThemeScript } from '@appica/ui-react/providers/theme-provider'\n"
  assert.doesNotMatch(check(project({ files: { ...files, 'vite.config.ts': plugin } })).out, /no-flash script/)

  const inlined = spa.replace('<body>', '<head><script>localStorage.getItem("theme")</script></head><body>')
  assert.doesNotMatch(check(project({ files: { ...files, 'index.html': inlined } })).out, /no-flash script/)

  // A server-rendered app has no static index.html, so the provider's own script runs.
  assert.doesNotMatch(check(project({ files: { 'src/app/layout.tsx': provider } })).out, /no-flash script/)
})

test('an older installed version lists what the catalog has and it lacks', () => {
  const { code, out } = check(project({ version: '1.4.0' }))
  assert.equal(code, 0, out)
  assert.match(out, /catalog describes \d+\.\d+\.\d+/)
  assert.match(out, /Not in the installed 1\.4\.0: .*command-palette/)
})

test('usage is checked only for the paths named', () => {
  const files = { 'src/page.tsx': '<div className="bg-gray-100" />' }
  const root = project({ files })
  assert.match(check(root).out, /Usage: not checked/)
  assert.equal(check(root).code, 0)
  assert.equal(check(root, 'src/page.tsx').code, 1)
})

test('usage findings', () => {
  const page = `import Link from 'next/link'
import { Button } from '@appica/ui-react/button'
import { Card, CardContent, type CardProps } from '@appica/ui-react/card'
import { Sheet } from '@appica/ui-react/sheet'
import { Input } from '@appica/ui-react'

export default function Page() {
  return (
    <form className="bg-gray-100 text-[#333] rtl:pl-2 pl-4">
      <Button render={<Link href="/pricing" />}>Pricing</Button>
      <Trigger render={<Button className="rounded-full" />} />
      <Button>Save</Button>
    </form>
  )
}
`
  const { code, out } = check(project({ files: { 'src/page.tsx': page } }), 'src/page.tsx')
  assert.equal(code, 1)
  assert.match(out, /hue-color {2}`bg-gray-100`/)
  assert.match(out, /color-literal {2}`text-\[#333\]`/)
  assert.match(out, /unknown-export {2}`CardContent` is not exported .* It exports: Card, CardHeader\./)
  assert.match(out, /unknown-import {2}`@appica\/ui-react\/sheet` does not exist in 1\.5\.0\. Use `drawer`\./)
  assert.match(out, /root-import/)
  assert.match(out, /link-as-button/)
  assert.match(out, /class-on-render/)
  assert.match(out, /no-submit/)
  assert.doesNotMatch(out, /CardProps|physical-direction/)
})

test('--rtl reports physical utilities, and skips the ones marked rtl: or ltr:', () => {
  const files = { 'src/page.tsx': '<div className="pl-4 rtl:pr-4 ltr:ml-2 text-left ps-2" />' }
  const { out } = check(project({ files }), '--rtl', 'src')
  assert.match(out, /`pl-4` does not mirror/)
  assert.match(out, /`text-left`: as above\./)
  assert.doesNotMatch(out, /`pr-4`|`ml-2`|`ps-2`/)
})

test('a correct file has nothing to report', () => {
  const page = `import { Button, buttonVariants } from '@appica/ui-react/button'

export function Actions() {
  return (
    <form className="bg-background-muted text-foreground-intense rounded-md">
      <a href="/pricing" className={buttonVariants({ variant: 'outline' })}>Pricing</a>
      <Button type="submit">Save</Button>
    </form>
  )
}
`
  const { code, out } = check(project({ files: { 'src/actions.tsx': page } }), 'src')
  assert.equal(code, 0, out)
  assert.match(out, /nothing to report/)
})
