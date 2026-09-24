# `@appica/ui-react` component agent guide

This package is a React component library built on three foundations: React 19+, Base UI (`@base-ui/react`), and Motion (formerly Framer Motion). When you build, edit, or refactor a component in this directory, follow the workflow below - every time, no exceptions.

## Stack pin

- React `^19.0.0` - use modern patterns (ref-as-prop, no `forwardRef`, `useId`, `useTransition`, etc.).
- `@base-ui/react` `^1.8.0` - **NOT** `@base-ui-components/react` (that was the pre-GA name; switched 2026-05-06).
- Tailwind v4, TypeScript 7 for `tsc` (the `@typescript/native` alias). `typescript` itself resolves to TypeScript 6 (`@typescript/typescript6`), because typescript-eslint and the `scripts/` import its JS API, which TypeScript 7 doesn't ship.
- Test stack: vitest jsdom + @testing-library/react + user-event + vitest-axe. `globals: false` - `cleanup()` is wired manually in [src/test/setup.ts](src/test/setup.ts).

## Workflow when building or editing a component

1. **Load `vercel-react-best-practices`** via the Skill tool before writing any new component or doing a non-trivial refactor. Apply its rendering, re-render, and bundle rules to the implementation.
2. **Load `motion`** via the Skill tool whenever the component has motion/animation requirements: enter/exit transitions beyond CSS, gestures (drag/hover/tap/pan), scroll-linked effects, layout animations (FLIP), or shared-element transitions. Skip it for plain CSS hover/focus.
3. **Consult Base UI before wrapping a primitive.** Read [.context/base-ui-llms.txt](.context/base-ui-llms.txt) first - it's a snapshot of `https://base-ui.com/llms.txt` (date in the file header). If the snapshot is missing the part you need or appears outdated, WebFetch the live URL or the linked component page. Never invent a Base UI prop or sub-component name from memory.

## Component conventions

Inferred from [src/components/button/button.tsx](src/components/button/button.tsx) - match this exactly unless you have a documented reason to deviate.

- **Folder layout:** `src/<name>/` containing `<name>.tsx` and `<name>.test.tsx`. Add an `index.ts` barrel **only when the folder needs to expose more than one module** - e.g. a server-safe utility (`cva` variants, pure helpers) next to a `'use client'` component, or a context module next to its provider. Drop-in folders with a single component file don't need a barrel: `scripts/sync-exports.mjs` resolves `<name>.tsx` directly. When a barrel exists, `sync-exports.mjs` automatically routes the subpath through `index.ts`, which lets server and client modules in the folder retain their distinct `'use client'` boundaries.
- **`*Group` companions:** decide by _how_ the Group injects state, not by file count.
  - **cloneElement-based groups** (e.g. `KbdGroup` in [src/components/kbd/kbd.tsx](src/components/kbd/kbd.tsx), `AvatarGroup` in [src/components/avatar/avatar.tsx](src/components/avatar/avatar.tsx)) - Group is just a styled wrapper that `React.cloneElement`s children to forward size/shape defaults. **Co-locate in the same file** as the base primitive; do not create a separate `<name>-group/` folder.
  - **Context-based groups** (e.g. `RadioGroup`, `CheckboxGroup`, `ButtonGroup`) - Group is a Provider with shared state, refs, or keyboard handling. **Keep in a separate `<name>-group/` folder** so the provider boundary stays explicit and the subpath import (`@appica/ui-react/<name>-group`) is meaningful.
- **Wrap a Base UI primitive** rather than handrolling. Component props extend `ComponentPropsWithoutRef<'button'>` (or the appropriate element).
- **Theme via CSS variables only** - `var(--color-…)`, `var(--radius-…)`, `var(--transition-…)`. Never hardcode hex colors, px radii, or duration values.
- **Class-list pattern:** use the shared `cn(...)` helper from [src/internal/utils.ts](src/internal/utils.ts) (wraps `clsx` + `tailwind-merge`). It deduplicates conflicting Tailwind classes and supports conditional/array inputs - prefer it over manual array+join concatenation.
- **Tailwind v4 syntax:** prefer the v4 variant shorthand over arbitrary-selector escape hatches. Use `*:` for direct children, `**:` for descendants, and `data-[attr=value]:` / `data-attr:` for data attributes. Example: write `**:data-[slot=navigation-link-indicator]:opacity-0` - not `[&_[data-slot='navigation-link-indicator']]:opacity-0`. Use `not-{variant}:` for negation (e.g. `not-hover:`) and named `group/name` + `group-{state}/name:` for scoped sibling/ancestor reactions. The arbitrary `[&_...]` form is only acceptable when no built-in variant can express the selector (e.g. tag-name descendants like `[&_svg]:`).
- **Variant/size maps:** `Record<Variant, string>` constants outside the component, indexed by prop value. Don't inline conditional class strings.
- **Exports - minimal surface:** only export what consumers actually need. The default set is the component(s) and their `*Props` types - for example `export { Chip, ChipGroup }` + `export type { ChipProps, ChipGroupProps, ChipGroupHandle }`. Do **NOT** export internal `cva` variants (`chipSizeVariants`), the variant/size string-literal unions (`ChipVariant`, `ChipSize`), or other implementation details. The exceptions are components whose variants are deliberately reused elsewhere (`buttonVariants` from [src/components/button/button-variants.ts](src/components/button/button-variants.ts), `inputVariants` from [src/components/input/input-variants.ts](src/components/input/input-variants.ts)) - those are extracted into a separate file and exported via `index.ts`. If a consumer needs a variant union, they can derive it from `ComponentProps<typeof Component>['variant']`. When in doubt, leave it unexported; you can always add the export later if a real need surfaces.
- **Shared non-component modules split by visibility, not by kind.** `src/lib/` is published, `src/internal/` is not, and the two folder names are the whole rule:
  - **`src/lib/<name>.ts`** - part of the public surface, gets a flat subpath exactly like a component (`src/lib/color.ts` → `@appica/ui-react/color`). It is the fourth namespace alongside `components/`, `hooks/` and `providers/`.
  - **`src/internal/<name>.ts`** - no public surface ([internal/floating.ts](src/internal/floating.ts), [internal/modal.ts](src/internal/modal.ts), [internal/color-control.ts](src/internal/color-control.ts), [internal/color-math.ts](src/internal/color-math.ts), [internal/color-picker-context.ts](src/internal/color-picker-context.ts), [internal/utils.ts](src/internal/utils.ts)). `sync-exports.mjs` scans an **allowlist** of the four public namespaces, so nothing here can leak into `exports` even by accident.

  The pairing is the point: `color-math` (matrix conversions) sits in `internal/` while `color` (the `Color` model) sits in `lib/`, and you can tell which is which from the path alone. When adding a shared module, the only question to answer is "do consumers import this?"

- **Exports - wiring:** don't edit `src/index.ts` or the `exports` map in [package.json](package.json) by hand. Run `pnpm sync-exports` (also runs automatically via `prebuild`/`prepack`) - the script regenerates both from the folder tree and prefers `index.ts` over `<name>.tsx` when both exist.

## Writing style

Applies to everything you write here: prop JSDoc, code comments, commit
messages, and these guides.

- **Use the plain keyboard hyphen `-`. Never `—` or `–`.** Typographic dashes
  read as machine-written. If you catch yourself reaching for one, that's
  usually a sign the sentence wants restructuring rather than substituting.
- **Prefer a comma, a colon, or two sentences over a dash.** "Wrap the content
  in a padded frame. `true` is an alias for `'solid'`." beats one sentence
  joined by a dash.
- **A parenthetical aside takes brackets, not a pair of dashes.** Write
  "clickable (a filter chip, a category link), pass a `render` element" - a
  paired `- … -` reads as two stray hyphens.
- A single hyphen joining a clause to its explanation is fine in moderation.
  Two in one sentence is one too many.
- Ranges use a hyphen too: `0-100`, not `0–100`.
- **Use American English spelling.** `color`, `behavior`, `center`/`centered`,
  `labeled`/`labeling`, `honors`, `gray`, `neighbor`, `canceled`, `-ize`
  (`normalize`, `customize`, `serialize`, `organize`), `traveling`, `artifact`.
  Never the British form. The public API is already American (`color`,
  `colorSpace`, `Color`, `ColorArea`), so a British comment sitting next to it
  reads as a mismatch - and prop JSDoc ships to the website, where the two
  spellings would appear on the same page. It bites hardest in prose that isn't
  a prop name: test titles ("honours controlled value"), internal identifiers
  (`rowNeighbour`), and inline comments. `aria-labelledby` is a DOM attribute,
  not a spelling error - leave it alone.

The one exception is `-` as the "no value" placeholder in a docs table cell,
which is a symbol rather than punctuation.

## Comments & prop docs

Comments here are a **product surface**, not a scratchpad. JSDoc survives `tsc`
into the shipped `.d.ts` (and `src/` ships too, per `files` in
[package.json](package.json)), so it drives IDE hover, what an agent reads out of
a consumer's `node_modules` - **and the published prop tables**: appica-dev
generates `## API reference` from these comments. Editing a prop's JSDoc edits
the website. It costs nothing at runtime (esbuild strips comments from `.js`).

**Document exactly one thing: props the component declares itself.**

- **Every declared prop gets a one-line description**, plus `@default` when it
  has a default. That's the whole budget for a typical component.
- **Never document inherited props.** Props reaching the component through
  `extends` (`ComponentPropsWithoutRef<'div'>`, Base UI root props, `className`,
  `children`) are documented upstream and are owned by the docs sidecar. Do
  **not** redeclare a prop just to add a comment.
- **No component-level JSDoc.** The docs page prose covers "what this component
  is"; a second copy in the source only drifts.
- **Write the description as the published sentence** - it lands verbatim in a
  table cell. Present tense, no "The prop that…" preamble, no restating the type
  (`/** The variant. */` on `variant` is pure noise - omit the comment entirely
  before writing that).
- **`cva` carries no docs.** `interface XProps extends …, VariantProps<typeof
xVariants> {}` ships an empty body: consumers hover `variant` and get a bare
  ten-member union with no default and no guidance. `Omit` the keys off the
  intersection and redeclare them with JSDoc, reusing the cva-derived type so
  the public surface is unchanged:

  ```ts
  interface BadgeProps
    extends useRender.ComponentProps<'span', BadgeState>, Omit<VariantProps<typeof badgeVariants>, 'variant' | 'size'> {
    /**
     * Color scheme.
     * @default 'primary'
     */
    variant?: VariantProps<typeof badgeVariants>['variant']
  }
  ```

- **This applies to hooks and providers too.** Their doc pages generate `##
Props` / `## Signature` / `## Return value` from `<Name>Props`,
  `<Name>Options` and `<Name>Return` - so those interfaces' members follow the
  same rules. Note `children` **is** declared on the provider props (unlike
  components, where it's inherited), so it is documented there.

**Inline (`//`) comments** are for non-obvious implementation only - a workaround,
an ordering constraint, a "this looks wrong but isn't". If the comment explains
_why the design is this way_ rather than _why this line is this way_, it belongs
in the "Quick-reference gotchas" list below, not in the source.

The bar is higher than it sounds, so calibrate against what's already here rather
than against habit. Most component files carry **zero** inline comments -
[carousel.tsx](src/components/carousel/carousel.tsx) has one in 1000+ lines, and
`date-picker`, `combobox`, `select`, `autocomplete` and `sparkline` have none at
all. The densest file in the package sits near 2% of its lines. A new component
well above that is over-commented, not well documented.

- **Never restate the code.** If the comment paraphrases the line under it, delete
  it. What survives is the thing a reader would otherwise get _wrong_.
- **No section banners.** `/* ---- Helpers ---- */` dividers appear nowhere in this
  package; a file that feels like it needs them is a file that wants splitting.
- **Module headers only outside `components/`.** The shared modules
  in `src/internal/` and `src/lib/` open with a 2-4 line header saying what they are
  and who uses them ([internal/floating.ts](src/internal/floating.ts),
  [internal/modal.ts](src/internal/modal.ts), [lib/color.ts](src/lib/color.ts)).
  Component files don't get one: the docs page
  covers "what this component is".
- **Prefer JSDoc over `//`.** A `/** */` on an exported function or type earns its
  keep through IDE hover and the shipped `.d.ts`; a `//` above the same
  declaration reaches nobody.

**MDX-safety:** descriptions become Markdown. Keep braces inside backticks
(`` `render={<h2 />}` ``), and prefer absolute URLs over site-relative links
(IDE hover can't resolve `/ui/components/...`). A table cell needing an MDX
expression escape (`{'…'}`) stays owned by the sidecar and ignores JSDoc.

### After changing props

JSDoc reaches the docs through the published tarball, so:

```
pnpm pack:react                       # rebuild + repack
# in ~/Sites/appica-dev:
pnpm install --force && pnpm api:generate && pnpm api:verify
```

`pnpm api:audit` there lists declared props still missing JSDoc - it should
report `0 candidate(s)`. `scripts/apply-prop-docs.mjs` seeded the first pass from
the existing tables; it's a one-time migration tool, not part of the loop.

## Tests

- Co-locate `<name>.test.tsx` next to the component.
- Use @testing-library/react + user-event for interaction. Use vitest-axe for an accessibility smoke test on the rendered component.
- Test the public API (props, accessibility, user interactions) - not internal class strings.
- **userEvent clipboard:** `userEvent.setup()` replaces `navigator.clipboard`, so spy with `vi.spyOn(navigator.clipboard, …)` **after** `setup()` runs - not in a `beforeEach` that runs before it.

## Consumer composition: `className` on render-prop wrappers

For any wrapper that uses Base UI's `useRender` (`DropdownMenuTrigger`, `PopoverTrigger`, `TooltipTrigger`, `SelectTrigger`, our `BreadcrumbLink`, `PaginationLink`, `NavigationLink`, etc.), put consumer style overrides on the **wrapper**, not on the JSX passed to `render`:

```tsx
// ✅ Do - className lives on the wrapper
<DropdownMenuTrigger
  className="text-foreground-muted size-7 rounded-xs"
  render={<Button size="icon-sm" variant="ghost"><Icon /></Button>}
/>

// ❌ Don't - className on the render-prop JSX
<DropdownMenuTrigger
  render={<Button className="text-foreground-muted size-7 rounded-xs" …>…</Button>}
/>
```

The "don't" form triggers a **React 19 hydration mismatch** when the consuming page is a Server Component (the default in `docs/app/*` - no `'use client'`). The `<Button className="X">` JSX is constructed on the server, serialized over the RSC boundary, reconstructed on the client, and then `cloneElement`d by Base UI's `useRender`. SSR HTML and CSR render end up producing different final class strings on the underlying element. Confirmed by repro 2026-05-27 in [docs/app/page.tsx](../../docs/app/page.tsx) (Breadcrumb collapsed-with-dropdown demo) - adding `'use client'` to the page eliminated the error with the same JSX, isolating the cause to RSC + render-prop cloneElement.

Putting `className` on the wrapper bypasses this: it lands in the wrapper's own props inside `useRenderElement` before any cloneElement happens, so server and client agree.

**Rule of thumb when composing:**

- **Visual overrides (className, style)** → on the wrapper.
- **Structural/behavioral props (size, variant, href, type, render-as-different-element)** → keep on the JSX inside `render`. Those don't trigger the bug.
- **Need className on the inner element specifically?** Extract the trigger into its own `'use client'` component rather than promoting the whole page to `'use client'`.

Class precedence still works through `cn(twMerge)`: the wrapper's `className` lands last in the inner component's `cn(...)` call and wins for conflicts.

When designing a new wrapper, make sure it accepts and forwards `className` itself (don't only rely on `render`) so consumers have this escape hatch.

## Floating `*Content` components (Portal → Positioner → Popup)

Any component whose `*Content` wraps a Base UI `Portal → Positioner → Popup` trio (Popover, Tooltip, PreviewCard, Menu, Select, Combobox, Autocomplete, …) must use the shared helper in [src/internal/floating.ts](src/internal/floating.ts) - do **not** hand-roll a `Pick<…Positioner, …>` list per component. That ad-hoc approach drifted: most components only forwarded `side/sideOffset/align/alignOffset`, silently dropping `collisionPadding`, `collisionBoundary`, `collisionAvoidance`, `anchor`, `sticky`, `arrowPadding`, `container`, `keepMounted`, etc. Consumers can't reach the inner Portal/Positioner directly, so the `*Content` is the **only** place those props can be mapped.

Pattern:

- **Type:** `type XContentProps = React.ComponentProps<typeof X.Popup> & FloatingContentProps<React.ComponentProps<typeof X.Positioner>, React.ComponentProps<typeof X.Portal>> & { /* component extras */ }`. `FloatingContentProps` promotes the common Positioner/Portal props to flat props (derived from the component's own Base UI types, so it stays in lockstep) and adds typed `positionerProps` / `portalProps` escape hatches for the long tail (`style`, `render`, …).
- **Body:** `const { positioner, portal, popup } = splitFloatingProps(props)` after destructuring `className`/`children`/component-specific props. Spread `{...portal}` on Portal, `{...popup}` on Popup. On Positioner, write component defaults as plain attributes **before** `{...positioner}` (so consumer values win), and merge the fixed stacking class via `className={cn('isolate z-50', positioner.className as string | undefined)}`.
- `className`/`style`/`render` are intentionally **not** flat props - `*Content` represents the Popup, so those bind to it. Reach the Positioner/Portal element via the escape hatches.

`navigation-menu` is the exception: its positioner is rendered internally by the Root, not consumer-facing, so it doesn't use this helper.

## Modal `*Content` components (Portal → Backdrop → Viewport → Popup)

`dialog`, `alert-dialog`, and `drawer` wrap a Base UI `Portal → Backdrop → Viewport → Popup` structure inside a single `*Content`. Same problem as the floating components - `...props` reaches only the Popup, so the Portal/Backdrop/Viewport must be mapped explicitly. Use the sibling helper in [src/internal/modal.ts](src/internal/modal.ts):

- **Type:** `type DialogContentProps = ModalContentProps<Popup, Portal, Backdrop, Viewport> & { /* extras */ }`, where each type arg is `React.ComponentProps<typeof BaseDialog.{Popup,Portal,Backdrop,Viewport}>`. `ModalContentProps` promotes `container`/`keepMounted` to flat props and adds `portalProps` / `backdropProps` / `viewportProps` escape hatches.
- **Body:** `const { portal, popup } = splitModalProps(props)` after destructuring `className`/`children`/`backdropProps`/`viewportProps` and component-specific props (`backdrop`, `closeButton`, …). Spread `{...portal}` on Portal and `{...popup}` on Popup. On Backdrop/Viewport, spread `{...backdropProps}` / `{...viewportProps}` **before** the fixed `className`, then merge the consumer class via `className={cn('…fixed classes…', backdropProps?.className as string | undefined)}` (the `backdrop` boolean still gates whether the Backdrop renders).

`toast` is a lighter case (Portal → Viewport, no Backdrop/Popup): `Toaster` just exposes flat `container` + `portalProps` and forwards the rest to the Viewport.

## Folded single-element components - escape hatches for the inner element

When a component folds several Base UI parts into one styled element (so the inner element isn't a separate export), expose a typed `<element>Props` escape hatch so consumers can still reach it: e.g. `number-field` forwards Root props via the spread and adds `inputProps` for the inner `NumberField.Input`; `scroll-area` adds `viewportProps` for the inner `ScrollArea.Viewport`. Spread the escape hatch **before** the component's controlled handlers/classes (so the component's behavior wins) and merge `className` via `cn(…, <element>Props?.className)`.

## Build / verify

Run from the repo root or this package:

- `pnpm --filter @appica/ui-react test` - vitest
- `pnpm --filter @appica/ui-react build` - tsc + rollup, produces `dist/`
- `pnpm --filter @appica/ui-react typecheck` - `tsc --noEmit`

A component task is not done until tests pass and the build emits the new component's ESM-only `.js` + `.d.ts` correctly.

## Quick-reference gotchas

Terse rules distilled from past fixes; the linked file is the canonical example. (The team's Claude memory holds the full rationale.)

- **Base UI import alias:** wrap primitives as `Base<Name>` (e.g. `import { Switch as BaseSwitch }`), not `<Name>Primitive`.
- **`'use client'` only when needed:** a pure Base UI wrapper stays server-safe; add the directive only when the wrapper itself calls hooks or Motion.
- **Field-like error/disabled state:** field-like inputs both (a) bridge a standalone `aria-invalid` → `data-invalid` (strict check: `aria === true || aria === 'true'`) and (b) inherit `invalid`/`disabled`/`name` from Base UI Field context via `useFieldRootContext(true)` (from `@base-ui/react/internals/field-root-context`). When wrapping a Field-aware Base UI Root, add the attribute via a conditional spread **after** the prop spread - `{...(invalid ? { 'data-invalid': '' } : {})}` - so you don't clobber the context-provided value with `undefined`. Done in Switch, Checkbox, Radio, OTPField, Input, Textarea, NumberField, DateField, TimeField, DatePicker, Select (on `SelectTrigger`), Combobox (on `ComboboxInput`'s InputGroup).
- **Labeling a `role="group"`** (RadioGroup, ToggleGroup, DateField/TimeField segment groups): name it with `aria-labelledby`, not `FieldLabel` / `<label htmlFor>` (those emit `<label for>`, which doesn't associate with a group).
- **CSS-only animations:** use the `motion-safe:` Tailwind variant rather than `useReducedMotion` when the only effect is toggling transition classes.
- **`ReducedMotionProvider` sets its attribute on `<html>`, not a wrapper div** - Base UI portals its popups under `document.body`, so they escape the React subtree and a wrapper would miss them. The `motion-reduce:` / `motion-safe:` variants in [styles.css](styles.css) already target `[data-disable-animations] *`.
- **Motion mount-guard:** squish/toggle animations must compare a _previous-value ref_, not `isFirstRender`, or they replay on a fresh mount (StrictMode / popover remount).
- **Nested dialog backdrop:** Base UI hides a nested dialog's backdrop; force it with `backdropProps={{ forceRender: true }}` when the host modal is backdrop-less.
- **Floating + modal surfaces all stay `z-50`** so nested popups inside dialogs/drawers stack by DOM order; don't raise modals above the floating layer.
- **ScrollArea layout:** Root is `flex flex-col` and Viewport is `flex-1 min-h-0` (not `h-full`), so it scrolls inside max-height/flex parents without a definite-height ancestor.
- **Links are not Buttons:** for a link styled as a button, put `buttonVariants(...)` on the `<a>` - never `<Button render={<a/>}>`. `nativeButton={false}` is only for rendering Button as a non-button element (div/span).
- **Theme tokens (Tailwind v4):** `:root` custom props referenced _only_ by generated utilities can get purged - use spacing literals or `@theme static`. `@theme inline` inlines the raw token, so reference `var(--primary)` (not `var(--color-primary)`) unless a `--color-*` alias is defined in [styles.css](styles.css).
- **Grayscale palette is user-facing "Base color"** (not "Neutral", to avoid the Tailwind `neutral` clash); the internal type stays `NeutralColor`.
- **Menu items carry their own `data-orientation="vertical"`** ([src/components/dropdown-menu/dropdown-menu.tsx](src/components/dropdown-menu/dropdown-menu.tsx), [src/components/context-menu/context-menu.tsx](src/components/context-menu/context-menu.tsx)): `navigationLinkVariants` sizes them off it. Never style menu items off Base UI's `aria-orientation` - `role="menu"` is implicitly vertical, and 1.8 stopped writing the attribute there. The `in-aria-[orientation=vertical]` rules stay for consumers who wrap `navigationLinkVariants` rows in their own `aria-orientation="vertical"` container.
- **Card radius scales proportionally, not by subtraction:** `--card-radius` is the content wrapper's corner and the only knob a consumer sets. The frame (`×4/3`) and inset media (`×3/4`) multiply off it. Subtracting the padding instead leaves inset media on a hairline corner at the default radius and collapses it entirely below that.
