# Contributing

Appica UI is developed in-house, and we're not accepting feature pull requests at this time. That said, your input genuinely helps the project:

- **Bug reports** are very welcome - please [open an issue](https://github.com/appica-dev/appica-ui/issues) - a small code example that shows the problem helps us fix it much faster.
- **Small fixes** (typos, docs, obvious one-line bugs) are fine as PRs.
- For anything larger, **open an issue first** so we can discuss it before you invest time - unsolicited feature PRs will likely be closed.

## Working on a fix or reproducing an issue locally

### Prerequisites

- Node.js >= 22
- [pnpm](https://pnpm.io) >= 9 (`npm install -g pnpm`)

### Setup and common commands

```sh
pnpm install

pnpm build          # build all packages
pnpm test           # run all test suites
pnpm typecheck      # type-check all packages
pnpm lint           # lint all packages
pnpm format         # format the codebase with Prettier
pnpm dev            # watch-rebuild the React package
```

To target a single package, use a filter from the repo root:

```sh
pnpm --filter @appica/ui-react test
pnpm --filter @appica/ui-svelte test
```

(`dev` is a long-running watcher, so it always targets one package - point it elsewhere with a filter as more packages land.)

## Testing your change visually

Each package has a small Vite playground wired directly to the library source.

### React

```sh
pnpm playground
```

It serves at `localhost:5173` with hot reload: edit anything under `packages/react/src` and the browser updates instantly (no build step needed). Use `playgrounds/react/src/app.tsx` as your scratch page - drop in the component you're fixing and reproduce the issue there. Import components from the package root (`import { Button } from '@appica/ui-react'`); subpath imports aren't wired up in the playground.

### Svelte

```sh
pnpm playground:svelte
```

Same idea for `@appica/ui-svelte`: edit under `packages/svelte/src` and the browser updates instantly. Use `playgrounds/svelte/src/app.svelte` as the scratch page. Import from the package root (`import { Button } from '@appica/ui-svelte'`).

### Repo layout

Framework packages live under `packages/` and are published to npm independently.

- `packages/react` is the `@appica/ui-react` component library (React 19 + [Base UI](https://base-ui.com) + [Motion](https://motion.dev) + Tailwind CSS v4). Conventions: [packages/react/AGENTS.md](packages/react/AGENTS.md).
- `packages/svelte` is the `@appica/ui-svelte` component library (Svelte 5 runes + [bits-ui](https://bits-ui.com) for headless overlays + Tailwind CSS v4, sharing design tokens with React). Conventions: [packages/svelte/AGENTS.md](packages/svelte/AGENTS.md). Port status: [packages/svelte/COMPONENT-STATUS.md](packages/svelte/COMPONENT-STATUS.md).

`src/index.ts` and the package.json `exports` map are generated in both packages - run `pnpm --filter @appica/ui-react sync-exports` or `pnpm --filter @appica/ui-svelte sync-exports` instead of editing them by hand.

Pack a tarball for the docs site with `pnpm pack:react` or `pnpm pack:svelte`. Publish with `pnpm release` (React) or `pnpm release:svelte`.
