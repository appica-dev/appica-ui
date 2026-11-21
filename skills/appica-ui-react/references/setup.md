# Setup

Appica UI is 1 npm package. Setting it up takes 3 steps: install it, point the project's Tailwind at it, and
add the theme provider. Run `scripts/check.mjs` after each step. It verifies the step and prints the exact line
to add when something is missing.

Full text: `https://appica.dev/ui/docs/react/installation.md`.

## Contents

- [Requirements](#requirements)
- [Install](#install)
- [Configure the stylesheet](#configure-the-stylesheet)
- [Add the provider](#add-the-provider)
- [Where things go, by framework](#where-things-go-by-framework)
- [Without Tailwind](#without-tailwind)
- [When components render unstyled](#when-components-render-unstyled)
- [Upgrading](#upgrading)

## Requirements

- **React 19 or later.** Components use `ref` as a prop, with no `forwardRef` shims. On React 18, upgrading is
  the first step, and it is the user's call: say so before doing it.
- **Tailwind CSS v4, already compiling.** The library ships class names for the project's own Tailwind to
  compile. `tailwindcss` and its build plugin (`@tailwindcss/vite` for Vite, `@tailwindcss/postcss` for Next.js
  and PostCSS) have to be working first: a utility on one of the project's own elements should take effect.
  On Tailwind v3, upgrade the project (`npx @tailwindcss/upgrade`) instead of downgrading the components. With
  no Tailwind at all, see [Without Tailwind](#without-tailwind).

## Install

Use the project's package manager, the one its lockfile belongs to:

```bash
npm install @appica/ui-react
```

## Configure the stylesheet

In the stylesheet that imports Tailwind:

```css
@import 'tailwindcss';
@import '@appica/ui-react/styles.css';

@source '../node_modules/@appica/ui-react/dist';
```

- **`@source` is what styles the components.** Tailwind skips `node_modules`, so without it none of the classes
  inside the library are generated, and everything renders unstyled with no error.
- **Its path is relative to the stylesheet that contains it.** Count the `../` needed to reach `node_modules`:
  1 for `src/index.css` or `app/globals.css`, 2 for `src/app/globals.css` or `src/styles/app.css`. In a
  monorepo, `node_modules` may sit above the app. `scripts/check.mjs` resolves the real location and prints
  the line to write.
- **A bare package name does not work.** `@source '@appica/ui-react'` resolves to nothing and fails silently.
- **No `tailwind.config.js`.** Tailwind v4 is configured in CSS with `@theme`.

The installed package's `agent-rules.md` describes its own version. If it no longer asks for `@source`, that
version registers the path itself, and the check script reports it.

## Add the provider

`ThemeProvider` enables dark mode and theme switching, and sets the stored theme before first paint. Wrap the
app once, at the root:

```tsx
import { ThemeProvider } from '@appica/ui-react/providers/theme-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
```

`suppressHydrationWarning` on `<html>` is expected: the no-flash script changes the theme class before React
hydrates. `DirectionProvider` and `ReducedMotionProvider` are optional, see
[accessibility-and-rtl.md](accessibility-and-rtl.md). Toasts need a `ToastProvider` and 1 `Toaster` at the
root as well.

### Client-rendered apps

In an app that React renders only in the browser (Vite, or anything served from a static `index.html`), the
script `ThemeProvider` renders is inserted but never runs. The stored or system theme is then not applied on
load: a visitor in dark mode gets the light theme until they toggle it. Put the same script in the document
head yourself. `getThemeScript()` returns it as a string, and takes the options you give the provider
(`storageKey`, `defaultTheme`, `enableSystem`, `themes`, `value`):

```ts
// vite.config.ts
import { getThemeScript } from '@appica/ui-react/providers/theme-provider'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'appica-theme-script',
      transformIndexHtml: () => [{ tag: 'script', children: getThemeScript(), injectTo: 'head-prepend' }],
    },
  ],
})
```

Frameworks that render on the server (Next.js, React Router, TanStack Start) need none of this: the provider's
own script arrives in the HTML and runs.

## Where things go, by framework

| Framework | Tailwind plugin | Global stylesheet | Provider goes in |
| --- | --- | --- | --- |
| Next.js (App Router) | `@tailwindcss/postcss` | `app/globals.css` | the root layout's `<body>` |
| Vite | `@tailwindcss/vite` | `src/index.css` | the root component in `main.tsx` |
| TanStack Start | `@tailwindcss/vite` | `src/styles/app.css` | the root route component |
| React Router 7, Remix | `@tailwindcss/vite` | `app/app.css` | the root component in `root.tsx` |
| Astro | `@tailwindcss/vite` | `src/styles/global.css` | inside each hydrated island |

These are the usual locations. The project's own files decide, so find the stylesheet that imports
`tailwindcss` instead of assuming.

Astro renders React as islands, so it also needs the `@astrojs/react` integration and a client directive
(`client:load`) on anything interactive. A provider in an `.astro` layout does not share context across
islands.

## Without Tailwind

A project that does not run Tailwind imports the prebuilt stylesheet instead, a single file with every
component's styles and the full token system:

```css
@import '@appica/ui-react/css';
```

- It includes Tailwind's Preflight reset, which is global.
- The token variables (colors, fonts, radii, shadows) stay overridable. Spacing and layout are frozen.
- There are no utilities to write, so style your own markup in CSS with the variables: `var(--background-muted)`.
- Never load both. With Tailwind present, use the `@source` path above, or the reset and every utility ship
  twice.

## When components render unstyled

Unstyled components are a setup problem. Never write CSS to patch them: find the broken step.

| Symptom | Cause |
| --- | --- |
| Components are bare HTML, and your own utilities work | The `@source` line is missing or its path is wrong, or `styles.css` is not imported |
| Nothing is styled, your own utilities included | Tailwind is not compiling: the build plugin or the `tailwindcss` import is missing |
| Styled, but dark mode never switches | No `ThemeProvider` at the root, or a second one nested below it |
| The saved or system theme is ignored on load | A client-rendered app without the theme script. See [Client-rendered apps](#client-rendered-apps) |
| Dark mode shows a light color | A token overridden on `:root` only. See [theming.md](theming.md) |
| `Cannot find module '@appica/ui-react/...'` | That entry point is not in the installed version. See [components.md](components.md) |
| Base styles applied twice | Both `styles.css` and the prebuilt file are loaded |

## Upgrading

1. Update the package with the project's package manager.
2. Read `node_modules/@appica/ui-react/CHANGELOG.md` for the versions in between.
3. Run `scripts/check.mjs`. It reports entry points the new version adds or this skill does not know yet.
4. Update this skill so its catalog matches: `npx skills update`.
