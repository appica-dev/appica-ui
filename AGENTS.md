# Appica UI monorepo - agent guide

A pnpm-workspace monorepo housing the public `@appica/ui-*` packages. One
workspace so far (`pnpm-workspace.yaml`), with more frameworks (vue, svelte)
to land as sibling packages:

- **`packages/react`** - the `@appica/ui-react` component library (React 19 + Base UI `@base-ui/react` + Motion + Tailwind v4). Conventions: [packages/react/AGENTS.md](packages/react/AGENTS.md).

**Always read the scoped guide for the area you're working in** before writing code there.

## Docs site lives elsewhere

The documentation site (appica.dev, incl. the UI docs at `/ui`) is its own repo
at `~/Sites/appica-dev` - this repo is packages-only, like the sibling
`appica-icons` and `appica-country-flags` repos. The site consumes this library
as a **packed tarball** (`file:` dependency), not a workspace dependency. After
changing a component, rebuild + repack so the site can pick it up:

```
pnpm pack:react   # build + pack → packages/react/appica-ui-react-<version>.tgz
```

then reinstall in appica-dev (`pnpm install --force` there if the version didn't change).

## Common commands

- `pnpm --filter @appica/ui-react test | build | typecheck`
- `pnpm pack:react` - build + pack the tarball consumed by appica-dev
- `pnpm sync:skill` - bring the published agent skill in step with the library (see below)

## The published agent skill

[skills/appica-ui-react/](skills/appica-ui-react/) is the Agent Skill consumers install with
`npx skills add appica-dev/appica-ui --skill appica-ui-react`. It teaches a consumer's agent
to use the library, so it follows the same split as `agent-rules.md`: nothing in it may
tell a reader to modify the library. It is not loaded in this repo, where the contributor
guides apply.

- **1 skill per framework package, named after it.** `appica-ui-react` describes
  `@appica/ui-react`, and a Vue package gets its own `skills/appica-ui-vue/`. A skill is
  generated from 1 package and gated by that package's release, and an agent in a Vue
  project should never be handed React imports. The name is permanent once published:
  skills.sh counts installs per name and has no way to delist one.
- **Everything in that folder ships to users.** The `skills` CLI copies it whole, so dev
  material stays out: the tests for its check script live in
  [scripts/skill-check.test.mjs](scripts/skill-check.test.mjs).
- **It lives at the repo root, not under `packages/`.** `skills/` is where the CLI and the
  agent plugin formats look without any config, and it is not an npm package.
- **Parts of it are generated.** `pnpm sync:skill` stamps the library version, copies
  `packages/react/agent-rules.md` into SKILL.md, and fills the Exports column of
  `references/components.md` from source. Never edit those by hand.
- **`pnpm release` runs `pnpm sync:skill:check` first**, and it fails when the skill is
  stale or the catalog has no row for an entry point. So a new component needs a row in
  `references/components.md` (its purpose, in the section it belongs to) before it can ship.
- **The rest is hand-written and can go stale.** After changing how a component is
  composed, themed or set up, read the matching file in `references/`. `pnpm test:skill`
  covers `scripts/check.mjs`.
- The borrowed skills in `.claude/skills/` carry `metadata.internal: true`, so the `skills`
  CLI skips them when someone installs from this repo. Keep the flag when updating them.

## Writing style

**Use the plain keyboard hyphen `-` everywhere. Never `—` or `–`.** That covers
prop JSDoc, code comments, docs prose, and commit messages. Typographic dashes
read as machine-written, and a sentence leaning on one usually wants a comma, a
colon, or a full stop instead. A parenthetical aside takes brackets, not a pair
of dashes.

**Use American English spelling everywhere, in the same places.** `color`,
`behavior`, `center`/`centered`, `labeled`, `honors`, `gray`, `neighbor`,
`canceled`, `-ize` over `-ise`. The public API is already American, so British
prose beside it reads as a mismatch. (`aria-labelledby` is a DOM attribute, not
a misspelling.)

Full rules: [packages/react/AGENTS.md](packages/react/AGENTS.md#writing-style).

## Prop comments are the published API reference

Prop JSDoc in the component sources generates the `## API reference` tables on
appica.dev - editing a comment edits the website. The rules (what to document,
what never to document, and the repack → regenerate loop) live in
[packages/react/AGENTS.md](packages/react/AGENTS.md#comments--prop-docs). Read
them before adding or changing any prop.

Interactive git flags (`-i`) aren't available; commit/push only when asked, and branch first if on the default branch.

## Where conventions live

These in-repo AGENTS.md files are the canonical, versioned source of project conventions (shared with collaborators and any agent that reads `AGENTS.md`). The docs site's authoring conventions live in the appica-dev repo's own AGENTS.md/ARCHITECTURE.md. The maintainer's Claude Code memory holds extended rationale and in-flight notes; stable rules are promoted here.
