# Appica UI monorepo - agent guide

A pnpm-workspace monorepo housing the public `@appica/ui-*` packages. One
workspace so far (`pnpm-workspace.yaml`), with more integrations (html, vue, …)
to land as sibling packages:

- **`packages/react`** - the `@appica/ui-react` component library (React 19 + Base UI `@base-ui/react` + Motion + Tailwind v4). Conventions: [packages/react/AGENTS.md](packages/react/AGENTS.md).
- **`packages/svelte`** - the `@appica/ui-svelte` component library (Svelte 5 runes + Native HTML / bits-ui later + Tailwind v4, shared design tokens with `@appica/ui-react`). Conventions: [packages/svelte/AGENTS.md](packages/svelte/AGENTS.md). Port status: [packages/svelte/COMPONENT-STATUS.md](packages/svelte/COMPONENT-STATUS.md).

**Always read the scoped guide for the area you're working in** before writing code there.

## Docs site lives elsewhere

The documentation site (appica.dev, incl. the UI docs at `/ui`) is its own repo
at `~/Sites/appica-dev` - this repo is packages-only, like the sibling
`appica-icons` and `appica-country-flags` repos. The site consumes this library
as a **packed tarball** (`file:` dependency), not a workspace dependency. After
changing a component, rebuild + repack so the site can pick it up:

```
pnpm pack:react   # build + pack → packages/react/appica-ui-react-<version>.tgz
pnpm pack:svelte  # build + pack → packages/svelte/appica-ui-svelte-<version>.tgz
```

then reinstall in appica-dev (`pnpm install --force` there if the version didn't change).

## Common commands

- `pnpm --filter @appica/ui-react test | build | typecheck`
- `pnpm --filter @appica/ui-svelte test | build | typecheck`
- `pnpm pack:react` - build + pack the tarball consumed by appica-dev
- `pnpm pack:svelte` - build + pack `@appica/ui-svelte`

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
