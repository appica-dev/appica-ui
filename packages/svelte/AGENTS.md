# `@appica/ui-svelte` component agent guide

This package is a Svelte 5 component library sharing design tokens with `@appica/ui-react`. When you build, edit, or refactor a component in this directory, follow the workflow below - every time, no exceptions.

## Stack pin

- Svelte `^5.33.0` - runes mode only. No legacy `export let`, `$:` , `on:click`, `<slot>`, or stores for new code.
- Tailwind v4, TypeScript 6 (`ignoreDeprecations: "6.0"` is required in `tsconfig.json`).
- Test stack: vitest jsdom + @testing-library/svelte + user-event + vitest-axe. `globals: false` - `cleanup()` is wired manually in [src/test/setup.ts](src/test/setup.ts).
- Wave 1 is native HTML. bits-ui lands in Wave 2 as the analog of React's Base UI. Do not add bits-ui until a component needs a headless primitive.

## Svelte 5 conventions

- `$state` only for values that should be reactive. `$derived` (or `$derived.by`) for anything computed from props/state. Do not write derived values in `$effect`.
- `$props()` for props. Treat props as changing - values that depend on them must be `$derived`.
- `$bindable()` for two-way `value` on fields.
- Default content is the `children` snippet + `{@render children?.()}`. Named snippets (`start`, `end`) replace React slots.
- **No `child` snippet on the public API.** Polymorphism is `href` on `Badge` or `el` on `Card` / `AlertTitle`. Links that look like a button use `buttonVariants(...)` on the `<a>`. Overlay triggers (Wave 2) take `class={buttonVariants(...)}` directly.
- `createContext` / `setContext` + `getContext` instead of `cloneElement`. Optional contexts return `undefined` when no provider is mounted.
- `onclick={...}` not `on:click`. `{@attach}` not `use:action`. Classes use clsx-style arrays/objects in `class={cn(...)}`, not the `class:` directive.
- No SvelteKit `$app/*` in this package. Use `esm-env` if a browser check is required.
- Validate every new or edited `.svelte` file with the Svelte autofixer before considering it done.

## Component conventions

- **Folder layout:** `src/components/<name>/` containing `<name>.svelte` and `<name>.test.ts`, plus an `index.ts` barrel that re-exports the component(s) and types. Variants that React extracts (`button-variants.ts`, `input-variants.ts`) stay `.ts`.
- **Theme via CSS variables only** - `var(--color-…)`, `var(--radius-…)`, `var(--transition-…)`. Never hardcode hex colors, px radii, or duration values.
- **Class-list pattern:** `cn(...)` from [src/internal/utils.ts](src/internal/utils.ts).
- **Variant/size maps:** `cva(...)` or `Record<Variant, string>` constants outside the component. Don't inline conditional class strings.
- **Exports - minimal surface:** component(s) and `*Props` types. Export `buttonVariants` / `inputVariants` because they are reused (triggers, textarea). Do not export internal unions when a consumer can derive them from props.
- **Exports - wiring:** don't edit `src/index.ts` or the `exports` map in [package.json](package.json) by hand. Run `pnpm sync-exports`.
- **Shared modules:** `src/lib/` is published, `src/internal/` is not.

## Writing style

Same as the React package: plain hyphen `-`, American English, prop JSDoc is the published API reference. Full rules: [packages/react/AGENTS.md](../react/AGENTS.md#writing-style).

**Document exactly one thing: props the component declares itself.** Every declared prop gets a one-line description plus `@default` when it has a default. Never document inherited HTML attributes (`class`, `children`, native `disabled`).

## Tests

- Co-locate `<name>.test.ts` next to the component.
- Use @testing-library/svelte + user-event for interaction. Use vitest-axe for an accessibility smoke test.
- Test the public API (props, accessibility, user interactions) - not internal class strings.

## Build / verify

- `pnpm --filter @appica/ui-svelte test` - vitest
- `pnpm --filter @appica/ui-svelte build` - svelte-package + prebuilt CSS
- `pnpm --filter @appica/ui-svelte typecheck` - svelte-check

A component task is not done until tests pass and the build emits the new component's `.js` + `.d.ts` (and `.svelte`) correctly.
