#!/usr/bin/env node
// svelte-package copies the whole input tree. Drop tests from dist/ so they
// never ship, matching the React package's tsc exclude.

import { rmSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist')

function walk(dir) {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      if (name === 'test') {
        rmSync(path, { recursive: true, force: true })
        continue
      }
      walk(path)
      continue
    }
    if (/\.test\./.test(name) || /\.test-host\./.test(name)) rmSync(path, { force: true })
  }
}

walk(dist)
