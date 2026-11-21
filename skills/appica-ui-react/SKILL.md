---
name: appica-ui-react
description: Builds React interfaces with the Appica UI component library (@appica/ui-react). Finds the right component among its 75+, composes it without the mistakes that type-check but fail silently, styles with role-based design tokens, and verifies the Tailwind CSS v4 setup with a bundled check script. Use whenever a project depends on @appica/ui-react or the user mentions Appica UI, for any interface work there, such as building or changing a page, form, dialog, drawer, menu, table or navigation, theming and brand colors, dark mode, or right-to-left support, and for installing or upgrading the library or fixing components that render unstyled. Applies even when the request names no component, such as "add a filter drawer", "make this a modal" or "brand this in purple".
license: MIT
compatibility: For React 19 projects. The bundled check script needs Node.js 18 or later.
metadata:
  author: appica
  version: "1.5.0"
---

# Appica UI

Appica UI is a React 19 component library built on Base UI primitives and styled with Tailwind CSS v4 design
tokens. It ships as 1 npm package, `@appica/ui-react`: components are imported from it, never copied into the
project. Its parts look like shadcn/ui's but are a different set with different props, so write none of them
from memory.

File paths in this skill are relative to the skill's own directory.

## Workflow

1. **Check the project.** From the project root, run the bundled script. It is read-only:

   ```bash
   node <skill directory>/scripts/check.mjs
   ```

   It prints the installed version and verifies the setup: React, Tailwind, the stylesheet imports and the
   `@source` path. If Appica UI is not installed, or the check reports a setup error, fix that first with
   [references/setup.md](references/setup.md). Components that render unstyled are always a setup problem.
   Never write CSS to patch them.

2. **Find the component** in [references/components.md](references/components.md) before writing markup. It
   lists every entry point (the import subpath) with its exports, and maps the words a request uses to the
   component that fits:
   a "modal" is `dialog`, a "sheet" or "filter drawer" is `drawer`, and a "dropdown" is `select`, `combobox`,
   `autocomplete` or `dropdown-menu`, depending on what it picks.

3. **Read how it works** before using a component for the first time. Fetch its docs page,
   `https://appica.dev/ui/components/react/<name>.md`: about 8 KB of markdown with the parts, the props and
   examples. Guessing a prop costs more than the fetch. When the page is out of reach, comes back as a summary
   instead of the page, or describes something the installed version lacks, the package is the reference. In
   `node_modules/@appica/ui-react`, `dist/components/<name>/<name>.d.ts` has every export with its prop docs,
   and `src/components/<name>/` has the source, variant and size values included.

4. **Write the code** under the rules and traps below. Compose from library components, and from raw elements
   only where nothing fits. Never copy a library component into the project to change its look: restyle it
   through tokens, `className` or a `data-slot` rule.

5. **Verify.** Run the check on what you changed, then the project's own type-check:

   ```bash
   node <skill directory>/scripts/check.mjs src/app/settings
   ```

   Fix what it reports and run it again until it is clean. Findings in code outside your task are the user's
   to decide on: report them instead of fixing them.

Without a shell, cover steps 1 and 5 with the checklist at the end.

## Rules

These hold for every change. They are the rules of `@appica/ui-react` 1.5.0, copied from the package. The copy
in the project, `node_modules/@appica/ui-react/agent-rules.md`, describes the installed version and wins where
the 2 differ.

<!-- BEGIN:agent-rules -->
- Tailwind CSS v4 only. Do NOT create a `tailwind.config.js` - v4 config lives in CSS via `@theme`.
  If the project is on v3, convert unsupported syntax rather than downgrading the components.
- Scan the library for class names or everything renders unstyled: `@source '../node_modules/@appica/ui-react/dist';`
  in the stylesheet that imports Tailwind. The path is relative to that stylesheet - count the `../`
  needed to reach the project root. A bare package name resolves to nothing and fails silently.
- React 19 is a hard requirement. No `forwardRef` - `ref` is a plain prop.
- Import from the subpath, one component per import:
  `import { Button } from '@appica/ui-react/button'`.
- Never write hex colors, px radii, or duration literals. Use the role-based tokens:
  `bg-background-muted`, `text-foreground-intense`, `border-border-strong`, `var(--radius-md)`.
  Full list: https://appica.dev/ui/docs/react/colors.md
- `bg-background-soft` is translucent in light and dark mode, and `bg-background-subtle` in dark mode. Where content
  shows through either, pair it with a `backdrop-blur-*` on the same element and state. Where it must hide what's
  behind, use an opaque token (`bg-background`, `bg-background-muted`).
- Never write hue-based utilities (`bg-gray-100`, `text-slate-600`). The palette is organized by
  role, not hue.
- Prefer v4 variant syntax (`*:`, `**:`, `data-*:`, `not-*:`) over `[&_...]` arbitrary selectors.
- Never put `:has()` on `html`, `:root` or `body`, including variants like `in-[:root:has(...)]`. Beside the library's
  own `:has()` rules, each check restyles the whole page. Derive page state from the route or React state instead.
- For a link styled as a button, put `buttonVariants(...)` on the `<a>` - never `<Button render={<a/>}>`.
- Put `className` overrides on the wrapper component, not on the JSX passed to `render`.
- A carousel with `pauseOnHover: false` or `pauseOnFocus: false` takes a `CarouselPlayToggle`.
- Do not hand-roll a component that exists in the library. Check the component list first:
  https://appica.dev/ui/react/llms.txt
- Every documentation page is served as clean markdown at `<url>.md` - fetch that, not the HTML.
<!-- END:agent-rules -->

## Traps

These type-check, render, and are wrong:

- **`Button` does not submit a form.** It renders `type="button"`. Write `type="submit"` on the one that
  should.
- **Variant and size names are the library's own.** `Button` has no `default`, `link` or `icon`: it has
  `primary`, `outline`, `ghost`, `destructive` and others, in sizes such as `md` and `icon-md`. Read each
  component's values instead of assuming.
- **An icon in a text button needs `data-icon`.** Mark the glyph `data-icon="start"` or `data-icon="end"` and
  the button tightens that side's padding. An icon-only button takes an `icon-*` size and an `aria-label`.
- **A trigger is already a button.** To make a `Button` the trigger of a dialog, menu, popover or tooltip,
  pass it through `render`. As a child it nests a button inside a button.
- **Interactive components carry their own `'use client'`**, so they import straight into a Server Component.
  What cannot cross is a function prop or `render={<YourClientComponent />}`. Move that piece into a small
  `'use client'` component of your own, not `'use client'` onto the page.
- **A popup leaves its parent.** Menus, selects, dialogs and tooltips portal to `<body>`, so a `dark` class or
  a `dir` on a wrapper never reaches them. Pass it through `positionerProps` or `viewportProps`, not
  `container`. See [references/composition.md](references/composition.md).
- **A color override has to reach both themes, and a brand color is a family.** Setting `--primary` on `:root`
  alone breaks dark mode and leaves the tints gray. See [references/theming.md](references/theming.md).
- **`*-foreground` is for solid fills only.** On a `-subtle` or `-soft` tint it is unreadable in dark mode.
  See [references/tokens.md](references/tokens.md).
- **`Select` shows the raw value unless it gets `items`**, and a group is named with `aria-label`, not
  `FieldLabel`. See [references/forms.md](references/forms.md).

## References

Read the one the task needs:

| Task | Read |
| --- | --- |
| Choosing a component, checking that a part exists | [references/components.md](references/components.md) |
| Installing, upgrading, components that render unstyled | [references/setup.md](references/setup.md) |
| Picking a color, radius, shadow or font utility | [references/tokens.md](references/tokens.md) |
| Brand colors, fonts, dark mode, restyling a component everywhere | [references/theming.md](references/theming.md) |
| `render`, links styled as buttons, popups and portals, Server Components | [references/composition.md](references/composition.md) |
| Forms, validation, server errors | [references/forms.md](references/forms.md) |
| Accessible names, reduced motion, right-to-left | [references/accessibility-and-rtl.md](references/accessibility-and-rtl.md) |

Each one ends where the docs begin. Any guide or component page is markdown at its URL plus `.md`, fetched 1
page at a time.

## Icons and flags

`@appica/icons-react` and `@appica/country-flags-react` are separate, optional packages, imported from the
package root. Their guides: `https://appica.dev/ui/icons/react.md` and
`https://appica.dev/ui/country-flags/react.md`. To find an icon by meaning, fetch
`https://appica.dev/ui/icons/search.md?q=<word>`. Offline, the installed package has 1 file per icon, named
after it: `node_modules/@appica/icons-react/dist/icons/<category>/<name>.js`. Never guess an icon name. Any
other icon set works with the components too.

## Before you call it done

- [ ] `scripts/check.mjs` reports no errors for the files you changed, and the project's type-check passes.
- [ ] Every entry point and part you imported exists in the installed version.
- [ ] The screen renders styled. Unstyled means the setup is broken, not that CSS is missing.
- [ ] Colors are role tokens, and the screen holds up in dark mode, popups included.
- [ ] Every control has an accessible name, and every form has a `type="submit"` button.
- [ ] Nothing the library ships was rebuilt by hand.
