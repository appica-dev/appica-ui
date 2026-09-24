<!--
  Canonical rules for a coding agent writing Appica UI code in a CONSUMER's
  project. Ships in the tarball (`files` in package.json) so it travels with the
  version it describes.

  Not the same document as AGENTS.md in this directory - that one is the
  contributor guide, written for someone editing this library. This file must
  never tell a reader to modify the library.

  Two consumers read this text, and neither should ever restate it:
    - the docs site, which inlines it into https://appica.dev/ui/react/llms.txt and into
      the "Set up your coding agent" page (it reads this file out of
      node_modules at build time);
    - README.md's "For AI agents" section, which links here.

  Three copies of the `@source` instruction is exactly how that directive ended
  up contradicting itself in three places. Keep one copy: this one.

  Keep it under ~40 lines of rules. It gets prepended to an agent's context, so
  length is a direct cost to every consumer.
-->

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
- Never write hue-based utilities (`bg-gray-100`, `text-slate-600`). The palette is organized by
  role, not hue.
- Prefer v4 variant syntax (`*:`, `**:`, `data-*:`, `not-*:`) over `[&_...]` arbitrary selectors.
- For a link styled as a button, put `buttonVariants(...)` on the `<a>` - never `<Button render={<a/>}>`.
- Put `className` overrides on the wrapper component, not on the JSX passed to `render`.
- Do not hand-roll a component that exists in the library. Check the component list first:
  https://appica.dev/ui/react/llms.txt
- Every documentation page is served as clean markdown at `<url>.md` - fetch that, not the HTML.
