#!/usr/bin/env node
/*
 * Checks a project's Appica UI setup, and the files you name for usage mistakes.
 * Read-only: it never writes, installs or fetches anything.
 *
 * Run it from the project root. `--help` prints the options.
 */

import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from 'node:fs'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE = '@appica/ui-react'
const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const HELP = `Usage: node scripts/check.mjs [options] [paths...]

Checks the Appica UI setup of the project in the current directory. Name files
or directories to also check them for usage mistakes. Read-only.

Options:
  --root DIR  Project root, the directory with package.json. Default: cwd.
  --rtl       Also report physical left/right utilities in the named paths.
  --help      Show this message.

Exit codes:
  0  No errors. Warnings and notes may be printed.
  1  At least 1 error.
  2  Could not run: bad arguments, or no package.json at the root.
`

// Dependencies, build output and caches: never the project's own source.
const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.nuxt',
  '.output',
  '.astro',
  '.turbo',
  '.vercel',
  '.cache',
  'dist',
  'build',
  'out',
  'coverage',
  'storybook-static',
])
const STYLE_EXT = new Set(['.css'])
const SOURCE_EXT = new Set(['.tsx', '.jsx', '.ts', '.js', '.mjs', '.cjs', '.mts', '.astro', '.mdx'])
// A file above this size is generated or vendored, and reading it only slows the walk.
const MAX_FILE_BYTES = 512 * 1024
// Stops a mistaken --root (a home directory, a huge monorepo) from walking for minutes.
const MAX_FILES = 20000
// Past this many hits, 1 rule in 1 file is a pattern, and listing each instance only buries the others.
const MAX_HITS_PER_RULE = 8

const HUES =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const COLOR_PREFIXES =
  'bg|text|border|ring|outline|decoration|divide|fill|stroke|from|via|to|shadow|accent|caret|placeholder|inset-ring|inset-shadow'

function fail(message) {
  process.stderr.write(`Error: ${message}\n`)
  process.exit(2)
}

function parseArgs(argv) {
  const options = { root: process.cwd(), rtl: false, paths: [] }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--help' || arg === '-h') {
      process.stdout.write(HELP)
      process.exit(0)
    } else if (arg === '--rtl') options.rtl = true
    else if (arg === '--root') {
      const value = argv[++i]
      if (!value) fail(`--root needs a directory.\n\n${HELP}`)
      options.root = resolve(value)
    } else if (arg.startsWith('-')) fail(`Unknown option "${arg}".\n\n${HELP}`)
    else options.paths.push(arg)
  }
  return options
}

const read = (file) => readFileSync(file, 'utf8')
const readJson = (file) => JSON.parse(read(file))
const posix = (path) => path.split(sep).join('/')

/** Walks up from `from` to the nearest `node_modules/<name>`, the way Node resolves it. */
function findPackage(from, name) {
  for (let dir = from; ; dir = dirname(dir)) {
    const candidate = join(dir, 'node_modules', name)
    if (existsSync(join(candidate, 'package.json'))) {
      return { dir: candidate, pkg: readJson(join(candidate, 'package.json')) }
    }
    if (dirname(dir) === dir) return null
  }
}

function walk(start, extensions, files = []) {
  let entries
  try {
    entries = readdirSync(start, { withFileTypes: true })
  } catch {
    return files
  }
  for (const entry of entries) {
    if (files.length >= MAX_FILES) break
    const path = join(start, entry.name)
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path, extensions, files)
    } else if (extensions.has(extname(entry.name)) && statSync(path).size <= MAX_FILE_BYTES) {
      files.push(path)
    }
  }
  return files
}

/** 1-based line and column of an index, for `file:line:col` output. */
function locate(text, index) {
  const before = text.slice(0, index)
  const line = before.split('\n').length
  return `${line}:${index - before.lastIndexOf('\n')}`
}

/** Blanks out CSS comments, keeping every newline so line numbers still match. */
const stripCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))

const major = (version) => Number.parseInt(String(version).replace(/^[^\d]*/, ''), 10)

// ── The skill's own catalog ────────────────────────────────────────────────

/** Reads the entry points and aliases out of references/components.md. Null when the file is absent. */
function readCatalog() {
  let text
  try {
    text = read(join(SKILL_DIR, 'references', 'components.md'))
  } catch {
    return null
  }
  const [entries, aliases = ''] = text.split(/^## Names that are not components$/m)
  const catalog = {
    version: /`@appica\/ui-react` (\d+\.\d+\.\d+)/.exec(text)?.[1],
    subpaths: new Set([...entries.matchAll(/^\| `([a-z0-9/-]+)` \|/gm)].map((match) => match[1])),
    aliases: new Map(),
  }
  for (const row of aliases.matchAll(/^\| (.+?) \| (.+?) \|$/gm)) {
    for (const name of row[1].matchAll(/`([a-z0-9-]+)`/g)) catalog.aliases.set(name[1], row[2])
  }
  return catalog
}

// ── The installed package ──────────────────────────────────────────────────

/** Public entry points of the installed version, without the stylesheets. */
function installedSubpaths(pkg) {
  return Object.keys(pkg.exports ?? {})
    .filter((key) => key !== '.' && key !== './package.json' && key !== './css' && !key.endsWith('.css'))
    .map((key) => key.slice(2))
}

/** Every name a subpath exports, types included, read from the installed declarations. */
function exportedNames(ui, subpath) {
  const names = { values: new Set(), types: new Set() }
  const entry = ui.pkg.exports?.[`./${subpath}`]?.types
  if (!entry) return names
  const seen = new Set()
  const visit = (file) => {
    if (seen.has(file) || !existsSync(file)) return
    seen.add(file)
    const text = read(file)
    for (const match of text.matchAll(/export\s+\*\s+from\s+['"](\.[^'"]+)['"]/g)) {
      visit(resolve(dirname(file), `${match[1].replace(/\.js$/, '')}.d.ts`))
    }
    for (const match of text.matchAll(/export\s+(type\s+)?\{([^}]+)\}/g)) {
      for (const part of match[2].split(',')) {
        const name = part
          .trim()
          .split(/\s+as\s+/)
          .pop()
        if (!name) continue
        const isType = Boolean(match[1]) || name.startsWith('type ')
        names[isType ? 'types' : 'values'].add(name.replace(/^type\s+/, ''))
      }
    }
    for (const match of text.matchAll(/export\s+declare\s+(?:function|const|class)\s+(\w+)/g))
      names.values.add(match[1])
    for (const match of text.matchAll(/export\s+(?:declare\s+)?(?:type|interface)\s+(\w+)/g)) names.types.add(match[1])
  }
  visit(join(ui.dir, entry))
  return names
}

function editDistance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const current = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1))
      previous = current
    }
  }
  return row[b.length]
}

/** What to import instead of an entry point that does not exist. */
function suggest(name, subpaths, catalog) {
  const alias = catalog?.aliases.get(name)
  if (alias) return `Use ${alias}.`
  const near = subpaths
    .map((subpath) => ({ subpath, distance: editDistance(name, subpath.split('/').pop()) }))
    .filter(({ subpath, distance }) => distance <= 2 || subpath.includes(name) || name.includes(subpath))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(({ subpath }) => `\`${subpath}\``)
  return near.length ? `Did you mean ${near.join(' or ')}?` : 'Look it up in references/components.md.'
}

// ── Setup ──────────────────────────────────────────────────────────────────

function checkSetup(root, catalog) {
  const findings = []
  const add = (level, message, fix) => findings.push({ level, message, fix })
  const shown = (file) => posix(relative(root, file)) || '.'

  const ui = findPackage(root, PACKAGE)
  if (!ui) {
    const project = readJson(join(root, 'package.json'))
    const declared = { ...project.dependencies, ...project.devDependencies }[PACKAGE]
    add(
      'error',
      declared
        ? `${PACKAGE} is in package.json but not in node_modules. Install the project's dependencies first.`
        : `${PACKAGE} is not installed in this project.`,
      ['Follow references/setup.md, then run this check again.'],
    )
    return { findings, ui: null }
  }

  const subpaths = installedSubpaths(ui.pkg)
  add('ok', `${PACKAGE} ${ui.pkg.version}`)
  if (catalog?.version && catalog.version !== ui.pkg.version) {
    const missing = [...catalog.subpaths].filter((subpath) => !subpaths.includes(subpath))
    const extra = subpaths.filter((subpath) => !catalog.subpaths.has(subpath))
    add(
      'note',
      `This skill's catalog describes ${catalog.version}. node_modules/${PACKAGE} is the truth for this project.`,
    )
    if (missing.length) {
      add('note', `Not in the installed ${ui.pkg.version}: ${missing.join(', ')}. Upgrade ${PACKAGE} to use them.`)
    }
    if (extra.length) {
      add('note', `Installed but not in the catalog: ${extra.join(', ')}. Update the skill: npx skills update`)
    }
  }

  const react = findPackage(root, 'react')
  if (!react) add('error', 'react is not installed. Appica UI needs React 19 or later.')
  else if (major(react.pkg.version) < 19) {
    add(
      'error',
      `react ${react.pkg.version} is installed. Appica UI needs React 19 or later: upgrade react and react-dom.`,
    )
  } else add('ok', `react ${react.pkg.version}`)

  const tailwind = findPackage(root, 'tailwindcss')
  if (tailwind && major(tailwind.pkg.version) < 4) {
    add('error', `tailwindcss ${tailwind.pkg.version} is installed. Appica UI needs Tailwind CSS v4.`, [
      'Upgrade the project to v4 (npx @tailwindcss/upgrade) instead of downgrading the components.',
    ])
  } else if (tailwind) add('ok', `tailwindcss ${tailwind.pkg.version}`)

  if (tailwind && major(tailwind.pkg.version) >= 4) {
    const config = ['js', 'ts', 'cjs', 'mjs']
      .map((ext) => `tailwind.config.${ext}`)
      .find((name) => existsSync(join(root, name)))
    if (config)
      add(
        'warn',
        `${config} exists. Tailwind v4 is configured in CSS with @theme, and ignores this file unless a stylesheet loads it with @config.`,
      )
  }

  // Where the styles come in. Tokens (`styles.css`) mean the Tailwind path, `css` the prebuilt file.
  const tokens = []
  const prebuilt = []
  const sources = []
  let tailwindSheet
  for (const file of walk(root, STYLE_EXT)) {
    const css = stripCssComments(read(file))
    if (/@import\s+(?:url\()?['"]tailwindcss(?:\/[^'"]*)?['"]/.test(css)) tailwindSheet ??= file
    if (/@import\s+(?:url\()?['"]@appica\/ui-react\/styles\.css['"]/.test(css)) tokens.push(file)
    if (/@import\s+(?:url\()?['"]@appica\/ui-react\/(?:css|appica\.css)['"]/.test(css)) prebuilt.push(file)
    for (const match of css.matchAll(/@source\s+(?:not\s+)?['"]([^'"]+)['"]/g)) {
      sources.push({ file, value: match[1], at: locate(css, match.index) })
    }
  }
  let themeProvider = false
  let themeScript = false
  for (const file of walk(root, SOURCE_EXT)) {
    const text = read(file)
    const imported = /import\s+['"]@appica\/ui-react\/(styles\.css|css|appica\.css)['"]/.exec(text)
    if (imported) (imported[1] === 'styles.css' ? tokens : prebuilt).push(file)
    if (!themeProvider && /\bThemeProvider\b/.test(text) && text.includes(PACKAGE)) themeProvider = true
    if (!themeScript && /\b(?:getThemeScript|ThemeScript)\b/.test(text)) themeScript = true
  }

  const dist = join(ui.dir, 'dist')
  const sourceLine = (sheet) => {
    const path = posix(relative(dirname(sheet), dist))
    return `@source '${path.startsWith('.') ? path : `./${path}`}';`
  }

  if (tokens.length && prebuilt.length) {
    add(
      'warn',
      `Both stylesheets are loaded: ${shown(tokens[0])} imports styles.css and ${shown(prebuilt[0])} imports the prebuilt file. That ships the reset and every utility twice.`,
      [`Keep styles.css where Tailwind runs, and remove the ${PACKAGE}/css import.`],
    )
  }

  if (!tokens.length && !prebuilt.length) {
    const sheet = tailwindSheet
    add(
      'error',
      'No stylesheet imports Appica UI, so its components render unstyled.',
      sheet
        ? [
            `Add to ${shown(sheet)}, after the tailwindcss import:`,
            `  @import '${PACKAGE}/styles.css';`,
            `  ${sourceLine(sheet)}`,
          ]
        : [
            'Follow references/setup.md: the Tailwind path if the project runs Tailwind v4, the prebuilt stylesheet if not.',
          ],
    )
  } else if (!tokens.length) {
    add('ok', `${shown(prebuilt[0])} loads the prebuilt stylesheet (the path without Tailwind)`)
  } else {
    const sheet = tokens.find((file) => STYLE_EXT.has(extname(file))) ?? tokens[0]
    add('ok', `${shown(sheet)} imports ${PACKAGE}/styles.css`)
    if (!STYLE_EXT.has(extname(sheet))) {
      add(
        'warn',
        `${shown(sheet)} imports styles.css from a script. Import it from the stylesheet that imports tailwindcss, so both compile in 1 pass.`,
      )
    }
    if (!tailwind)
      add(
        'error',
        'styles.css is imported but tailwindcss is not installed. Install Tailwind CSS v4, or import the prebuilt stylesheet instead (references/setup.md).',
      )

    // From the release that registers its own @source, a consumer needs no directive at all.
    const selfRegistered = /@source\s/.test(stripCssComments(read(join(ui.dir, 'styles.css'))))
    if (selfRegistered) add('ok', 'the installed styles.css registers its own @source')
    else {
      const distReal = realpathSync(dist)
      const reaches = (source) => {
        try {
          // A glob scans from its static prefix, so that prefix is what has to exist.
          const target = realpathSync(resolve(dirname(source.file), source.value.split(/[*{[]/)[0]))
          return distReal === target || distReal.startsWith(target + sep) || target.startsWith(distReal + sep)
        } catch {
          return false
        }
      }
      const good = sources.find(reaches)
      if (good) add('ok', `@source in ${shown(good.file)} reaches the library`)
      else {
        const wrong = sources.find((source) => source.value.includes('@appica'))
        const fix = [`In ${shown(sheet)}, write:`, `  ${sourceLine(sheet)}`]
        if (!wrong) {
          add(
            'error',
            `No @source reaches node_modules/${PACKAGE}/dist. Tailwind skips node_modules, so it generates none of the component classes and everything renders unstyled.`,
            fix,
          )
        } else if (!/^[./]/.test(wrong.value)) {
          add(
            'error',
            `${shown(wrong.file)}:${wrong.at} @source '${wrong.value}' is a bare package name. @source takes a path relative to the stylesheet, so this scans nothing and everything renders unstyled.`,
            fix,
          )
        } else {
          add(
            'error',
            `${shown(wrong.file)}:${wrong.at} @source '${wrong.value}' does not resolve to the installed library from that stylesheet, so everything renders unstyled.`,
            fix,
          )
        }
      }
    }
  }

  if (!themeProvider) {
    add(
      'note',
      'No ThemeProvider found. Without one the light theme still works, but dark mode never switches (references/setup.md).',
    )
  } else if (!themeScript) {
    // A static index.html with a module entry means React renders only in the browser, where a
    // <script> rendered by a component is inserted but never run.
    const indexHtml = join(root, 'index.html')
    const html = existsSync(indexHtml) ? read(indexHtml) : ''
    if (/<script[^>]+type=["']module["']/.test(html) && !/localStorage|prefers-color-scheme/.test(html)) {
      add(
        'warn',
        "This app renders only in the browser, where ThemeProvider's no-flash script never runs: the stored or system theme is not applied until it changes.",
        ['Put the output of getThemeScript() in the head of index.html (references/setup.md, "Client-rendered apps").'],
      )
    }
  }
  return { findings, ui, subpaths }
}

// ── Usage ──────────────────────────────────────────────────────────────────

function hueHint(hue) {
  if (/^(slate|gray|zinc|neutral|stone)$/.test(hue)) return 'a `background-*`, `foreground-*` or `border-*` role'
  if (/^(red|rose)$/.test(hue)) return 'an `error-*` step'
  if (/^(green|emerald|lime|teal)$/.test(hue)) return 'a `success-*` step'
  if (/^(amber|yellow|orange)$/.test(hue)) return 'a `warning-*` step'
  if (/^(blue|sky|cyan|indigo)$/.test(hue)) return 'an `info-*` step, or `primary` / `secondary` for brand color'
  return '`primary` or `secondary`, the brand roles'
}

function checkFile(file, text, context) {
  const hits = []
  // `subject` is the offending text, `advice` what to do about it. Kept apart so a repeat prints the subject only.
  const add = (level, rule, index, subject, advice) => hits.push({ level, rule, index, subject, advice })
  const each = (pattern, callback) => {
    for (const match of text.matchAll(pattern)) callback(match)
  }
  const quote = (value) => `\`${value}\``
  const isStyle = STYLE_EXT.has(extname(file))

  each(new RegExp(`(?<![\\w-])(?:${COLOR_PREFIXES})-(${HUES})-(?:50|[1-9]00|950)(?![\\w-])`, 'g'), (match) => {
    const advice = `is a hue utility. Colors are roles here: use ${hueHint(match[1])} (references/tokens.md).`
    add('error', 'hue-color', match.index, quote(match[0]), advice)
  })
  each(
    new RegExp(
      `(?<![\\w-])(?:${COLOR_PREFIXES})-\\[(?:#[0-9a-fA-F]{3,8}\\b|(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\\()[^\\]]*\\]`,
      'g',
    ),
    (match) => {
      const advice =
        'hardcodes a color. Use a role token, or define a token in CSS if the design needs a new color (references/theming.md).'
      add('error', 'color-literal', match.index, quote(match[0]), advice)
    },
  )
  each(/(?<![\w-])rounded(?:-[a-z]{1,2})?-\[\d[^\]]*\]/g, (match) => {
    const advice = 'hardcodes a radius. Use the scale (`rounded-md`, `rounded-xl`), which follows `--radius`.'
    add('warn', 'radius-literal', match.index, quote(match[0]), advice)
  })
  each(/(?:html|:root|body)[^{};'"`\s\]]*:has\(/g, (match) => {
    const advice =
      '`:has()` on html, :root or body makes every check restyle the whole page. Derive page state from the route or React state.'
    add('warn', 'root-has', match.index, '', advice)
  })
  if (context.rtl) {
    each(
      /(?<![\w:-])-?(?:[mp][lr]-|(?:left|right)-|scroll-[mp][lr]-|(?:border|rounded)-[lr](?![a-z])|rounded-[tb][lr](?![a-z])|(?:text|float)-(?:left|right)(?![\w-]))[\w./[\]-]*/g,
      (match) => {
        const advice =
          'does not mirror in right-to-left. Use the logical utility (ms/me, ps/pe, start/end, border-s/e, rounded-s/e, text-start/end), or prefix it with `ltr:` / `rtl:` when it is physical on purpose.'
        add('warn', 'physical-direction', match.index, quote(match[0]), advice)
      },
    )
  }
  if (isStyle) return hits

  each(/\bfrom\s+['"]@appica\/ui-react['"]/g, (match) => {
    add(
      'warn',
      'root-import',
      match.index,
      '',
      'Import from the subpath, 1 component per import: `@appica/ui-react/button`.',
    )
  })
  each(
    /(?:import\s+(?:type\s+)?(\{[^}]*\})\s*from|import\(|\bfrom)\s*['"]@appica\/ui-react\/([^'"]+)['"]/g,
    (match) => {
      const subpath = match[2]
      if (subpath === 'css' || subpath.endsWith('.css') || subpath === 'package.json') return
      if (!context.subpaths.includes(subpath)) {
        const what = /^(dist|src)\//.test(subpath)
          ? 'is a deep import, not a public entry point'
          : `does not exist in ${context.ui.pkg.version}`
        const leaf = subpath.replace(/^(dist|src)\/(components\/)?/, '').split('/')[0]
        const advice = `${what}. ${suggest(leaf, context.subpaths, context.catalog)}`
        add('error', 'unknown-import', match.index, quote(`${PACKAGE}/${subpath}`), advice)
        return
      }
      if (!match[1] || /^import\s+type\b/.test(match[0])) return
      const names = (context.names[subpath] ??= exportedNames(context.ui, subpath))
      if (!names.values.size) return
      for (const part of match[1].slice(1, -1).split(',')) {
        const name = part
          .trim()
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)[0]
        if (!name || names.values.has(name) || names.types.has(name)) continue
        const advice = `is not exported by \`${PACKAGE}/${subpath}\`. It exports: ${[...names.values].join(', ')}.`
        add('error', 'unknown-export', match.index, quote(name), advice)
      }
    },
  )
  each(/<Button\b[^<]*?\brender=\{\s*<(a|Link|NavLink)\b/g, (match) => {
    const advice = `A link rendered through Button gets button semantics. Put \`buttonVariants({ variant, size })\` on the <${match[1]}> instead (references/composition.md).`
    add('error', 'link-as-button', match.index, '', advice)
  })
  each(/\brender=\{\s*<[A-Za-z][\w.]*\b[^<>]*?\bclassName=/g, (match) => {
    const advice =
      '`className` on the element passed to `render`. Move visual classes to the wrapper component: on the inner element they can cause a hydration mismatch (references/composition.md).'
    add('warn', 'class-on-render', match.index, '', advice)
  })
  const form = /<(?:Form|form)\b/.exec(text)
  if (form && /<Button\b/.test(text) && !/\btype=(?:["']submit["']|\{\s*["']submit["']\s*\})/.test(text)) {
    const advice =
      'This file has a form and Buttons, but no `type="submit"`. Button renders `type="button"`, so none of them submits the form.'
    add('warn', 'no-submit', form.index, '', advice)
  }
  return hits.sort((a, b) => a.index - b.index).map((hit) => ({ ...hit, at: locate(text, hit.index) }))
}

function checkUsage(root, paths, context) {
  const files = new Set()
  for (const path of paths) {
    const target = [resolve(path), resolve(root, path)].find((candidate) => existsSync(candidate))
    if (!target) fail(`No such file or directory: ${path}`)
    if (statSync(target).isDirectory())
      walk(target, new Set([...SOURCE_EXT, ...STYLE_EXT])).forEach((file) => files.add(file))
    else files.add(target)
  }
  const results = []
  for (const file of files) {
    const hits = checkFile(file, read(file), context)
    if (hits.length) results.push({ file: posix(relative(root, file)), hits })
  }
  return { count: files.size, results }
}

// ── Report ─────────────────────────────────────────────────────────────────

const options = parseArgs(process.argv.slice(2))
if (!existsSync(join(options.root, 'package.json'))) {
  fail(`No package.json in ${options.root}. Run this from the project root, or pass --root.`)
}

const catalog = readCatalog()
const setup = checkSetup(options.root, catalog)
const out = ['Appica UI check', '', 'Setup']
const totals = { error: 0, warn: 0 }
const LABEL = { ok: 'ok   ', note: 'note ', warn: 'warn ', error: 'error' }

for (const finding of setup.findings) {
  if (finding.level in totals) totals[finding.level]++
  out.push(`  ${LABEL[finding.level]}  ${finding.message}`)
  for (const line of finding.fix ?? []) out.push(`         ${line}`)
}

if (options.paths.length && setup.ui) {
  const context = { ui: setup.ui, subpaths: setup.subpaths, catalog, rtl: options.rtl, names: {} }
  const usage = checkUsage(options.root, options.paths, context)
  out.push('', `Usage (${usage.count} ${usage.count === 1 ? 'file' : 'files'})`)
  if (!usage.results.length) {
    // Say what a clean result covers, so it is not read as "everything is right".
    out.push(
      '  ok     nothing to report',
      `         Checked: imports and exports against ${setup.ui.pkg.version}, hue utilities, color and radius literals,`,
      `         links rendered through Button, className on render elements, forms without a submit button${options.rtl ? ', physical left/right utilities' : ''}.`,
      '         Not checked: props, theming and popups in scoped regions. The type-check and the references cover those.',
    )
  }
  for (const { file, hits } of usage.results) {
    out.push(`  ${file}`)
    const perRule = {}
    const explained = new Set()
    for (const hit of hits) {
      totals[hit.level]++
      perRule[hit.rule] = (perRule[hit.rule] ?? 0) + 1
      if (perRule[hit.rule] > MAX_HITS_PER_RULE) continue
      // The advice is printed once per file. A repeat names what it found and points back.
      const key = `${hit.rule} ${hit.advice}`
      const message = explained.has(key)
        ? `${hit.subject || 'Again'}: as above.`
        : [hit.subject, hit.advice].filter(Boolean).join(' ')
      explained.add(key)
      out.push(`    ${hit.at.padEnd(7)}${LABEL[hit.level]}  ${hit.rule}  ${message}`)
    }
    for (const [rule, count] of Object.entries(perRule)) {
      if (count > MAX_HITS_PER_RULE) out.push(`    ... and ${count - MAX_HITS_PER_RULE} more ${rule}`)
    }
  }
} else if (setup.ui) {
  out.push('', 'Usage: not checked. Name the files or directories you changed to check them.')
}

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`
out.push('', `Result: ${plural(totals.error, 'error')}, ${plural(totals.warn, 'warning')}.`)
process.stdout.write(`${out.join('\n')}\n`)
process.exit(totals.error ? 1 : 0)
