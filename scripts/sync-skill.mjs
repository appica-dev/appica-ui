#!/usr/bin/env node
/*
 * Keeps skills/appica-ui-react in step with packages/react, so the published skill can
 * never describe a different library than the one being released.
 *
 * Generated: the version stamps, the rules block in SKILL.md (a verbatim copy of
 * agent-rules.md), and the Exports column of references/components.md.
 * Checked, never written: that the catalog has a row for every entry point and
 * none for a missing one, and that its guidance tables name real entry points.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PACKAGE_DIR = join(ROOT, 'packages', 'react')
const SKILL_DIR = join(ROOT, 'skills', 'appica-ui-react')

const HELP = `Usage: node scripts/sync-skill.mjs [--check]

Sync skills/appica-ui-react with packages/react.

Options:
  --check  Write nothing. Exit 1 if a file is stale or the catalog has a problem.
  --help   Show this message.
`

const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  process.stdout.write(HELP)
  process.exit(0)
}
const unknown = args.find((arg) => arg !== '--check')
if (unknown) {
  process.stderr.write(`Error: unknown option "${unknown}".\n\n${HELP}`)
  process.exit(2)
}
const check = args.includes('--check')

const read = (file) => readFileSync(file, 'utf8')
const pkg = JSON.parse(read(join(PACKAGE_DIR, 'package.json')))
const problems = []

/** Public entry points: the exports map without the root, the stylesheets and package.json. */
const subpaths = Object.keys(pkg.exports)
  .filter((key) => key !== '.' && key !== './package.json' && key !== './css' && !key.endsWith('.css'))
  .map((key) => key.slice(2))

/** Runtime exports of an entry point, read from source so no build is needed. */
function exportsOf(subpath) {
  const names = []
  const seen = new Set()
  const visit = (base) => {
    const file = [`${base}.ts`, `${base}.tsx`].find((candidate) => existsSync(candidate))
    if (!file || seen.has(file)) return
    seen.add(file)
    const source = read(file)
    for (const match of source.matchAll(/^export\s+\*\s+from\s+['"](\.[^'"]+)['"]/gm)) {
      visit(resolve(dirname(file), match[1]))
    }
    for (const match of source.matchAll(/^export\s+\{([^}]+)\}/gm)) {
      for (const part of match[1].split(',')) {
        const name = part
          .trim()
          .split(/\s+as\s+/)
          .pop()
        if (name && !name.startsWith('type ')) names.push(name)
      }
    }
    for (const match of source.matchAll(/^export\s+(?:async\s+)?(?:function|const|class)\s+(\w+)/gm))
      names.push(match[1])
  }
  const types = pkg.exports[`./${subpath}`].types
  visit(join(PACKAGE_DIR, types.replace(/^\.\/dist\//, 'src/').replace(/\.d\.ts$/, '')))
  return [...new Set(names)]
}

// ── SKILL.md: version stamps and the rules block ───────────────────────────

const rules = read(join(PACKAGE_DIR, 'agent-rules.md'))
  // The leading comment is a note to the library's maintainers, not part of the rules.
  .replace(/^<!--[\s\S]*?-->\s*/, '')
  .trim()

function syncSkill(text) {
  const block = /(<!-- BEGIN:agent-rules -->\n)[\s\S]*?(<!-- END:agent-rules -->)/
  if (!block.test(text)) problems.push('SKILL.md has no BEGIN:agent-rules / END:agent-rules markers.')
  if (!/^ {2}version: "[^"]*"$/m.test(text)) problems.push('SKILL.md frontmatter has no metadata.version line.')
  return text
    .replace(block, (_all, begin, end) => `${begin}${rules}\n${end}`)
    .replace(/^( {2}version: )"[^"]*"$/m, `$1"${pkg.version}"`)
    .replace(/(rules of `@appica\/ui-react` )\d+\.\d+\.\d+/, `$1${pkg.version}`)
}

// ── components.md: the Exports column, and coverage ────────────────────────

function syncCatalog(text) {
  const split = text.indexOf('\n## Which one?')
  if (split === -1) {
    problems.push('components.md has no "## Which one?" section.')
    return text
  }
  const listed = new Set()
  const entries = text
    .slice(0, split)
    .replace(/(Covers `@appica\/ui-react` )\d+\.\d+\.\d+/, `$1${pkg.version}`)
    .replace(/^\| `([a-z0-9/-]+)` \| .*? \| (.*) \|$/gm, (row, subpath, purpose) => {
      listed.add(subpath)
      if (!subpaths.includes(subpath)) {
        problems.push(
          `components.md lists \`${subpath}\`, which is not an entry point of ${pkg.version}. Remove the row.`,
        )
        return row
      }
      return `| \`${subpath}\` | ${exportsOf(subpath).join(', ')} | ${purpose} |`
    })
  for (const subpath of subpaths) {
    if (!listed.has(subpath)) {
      problems.push(`components.md has no row for \`${subpath}\`. Add it to the section it belongs in.`)
    }
  }

  // The 2 guidance tables are prose, so they are checked, not generated.
  const guidance = text.slice(split)
  const [, aliases = ''] = guidance.split('\n## Names that are not components')
  for (const row of aliases.matchAll(/^\| (.+?) \| .+ \|$/gm)) {
    for (const name of row[1].matchAll(/`([a-z0-9-]+)`/g)) {
      if (subpaths.includes(name[1])) {
        problems.push(
          `components.md calls \`${name[1]}\` a name that is not a component, but it is an entry point now.`,
        )
      }
    }
  }
  for (const row of guidance.matchAll(/^\| .+? \| (.+) \|$/gm)) {
    for (const name of row[1].matchAll(/`([a-z][a-z0-9-]*)`/g)) {
      if (!subpaths.includes(name[1])) {
        problems.push(`components.md points to \`${name[1]}\`, which is not an entry point of ${pkg.version}.`)
      }
    }
  }
  return entries + guidance
}

// ── setup.md: the @source instruction follows the rules ────────────────────

function checkSetup(text) {
  const inRules = rules.includes('@source')
  const inSetup = /^@source\s+'/m.test(text)
  if (inRules !== inSetup) {
    problems.push(
      inRules
        ? 'agent-rules.md asks for @source, but references/setup.md has no @source line.'
        : 'agent-rules.md no longer asks for @source, but references/setup.md still documents one. Rewrite its "Configure the stylesheet" section.',
    )
  }
  return text
}

const files = [
  ['SKILL.md', syncSkill],
  ['references/components.md', syncCatalog],
  ['references/setup.md', checkSetup],
]

const stale = []
for (const [name, sync] of files) {
  const file = join(SKILL_DIR, name)
  const current = read(file)
  const next = sync(current)
  if (next === current) continue
  stale.push(name)
  if (!check) writeFileSync(file, next)
}

for (const problem of problems) process.stderr.write(`Error: ${problem}\n`)
if (check && stale.length) {
  process.stderr.write(`Stale: ${stale.join(', ')}. Run \`pnpm sync:skill\`.\n`)
}
if (problems.length || (check && stale.length)) process.exit(1)

process.stderr.write(
  check || !stale.length
    ? `skills/appica-ui-react matches @appica/ui-react ${pkg.version}.\n`
    : `Updated ${stale.join(', ')} for @appica/ui-react ${pkg.version}.\n`,
)
