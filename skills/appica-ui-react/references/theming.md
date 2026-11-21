# Theming

Appica UI is themed through CSS custom properties. There is no theme object and no JavaScript config: you
redefine a few variables after the stylesheet import and every component follows. Never copy a component into
the project to change its look.

Full text: `https://appica.dev/ui/docs/react/theming.md`, `colors.md`, `fonts.md` and `dark-mode.md` in the same
folder.

## Contents

- [Override the raw token, in both themes](#override-the-raw-token-in-both-themes)
- [Brand colors](#brand-colors)
- [Radius](#radius)
- [Fonts](#fonts)
- [Restyle a component everywhere](#restyle-a-component-everywhere)
- [Dark mode](#dark-mode)
- [A dark region inside a light page](#a-dark-region-inside-a-light-page)

## Override the raw token, in both themes

Tokens live in 2 layers. Raw tokens (`--primary`, `--background`, `--radius`) hold the values, with the light
set on `:root, .light` and the dark set on `.dark`. Theme tokens (`--color-primary`) alias them inside
`@theme inline`, and exist only to generate utilities.

- **Override the raw token, never `--color-*`.** The theme layer is derived, and editing it breaks the
  light and dark mapping.
- **Make every color override reach both themes.** Your stylesheet loads after the library's at the same
  specificity, so a color set on `:root` alone also beats the library's `.dark` value, and dark mode keeps your
  light color. Give it a `.dark` twin, or add `.dark` to the selector when both themes share the value.

```css
@import 'tailwindcss';
@import '@appica/ui-react/styles.css';

:root,
.light {
  --secondary: oklch(0.827 0.119 306.383);
}

.dark {
  --secondary: oklch(0.714 0.203 305.504);
}
```

Any CSS color format works: hex, `rgb()`, `hsl()`, `oklch()`. The library writes oklch because its lightness
is even across hues.

## Brand colors

A brand color is a family, not 1 token. `--primary` has 5 siblings that do not follow from it, so setting
`--primary` alone gives a color that looks right on a button and wrong everywhere else: tints stay gray, and
in dark mode the text on it stays near-black.

The default primary is achromatic and uses a different recipe from a colored one, so there is nothing to
tweak. Replace the whole family. `color-mix()` derives the siblings from the 1 color, so the brand color stays
in whatever format it was given and nothing has to be converted:

```css
/* A colored primary does not invert between themes, so 1 block serves both. */
:root,
.light,
.dark {
  --primary: #6d28d9;
  --primary-subtle: color-mix(in oklab, var(--primary) 10%, transparent);
  --primary-soft: color-mix(in oklab, var(--primary) 20%, transparent);
  --primary-muted: color-mix(in oklab, var(--primary) 85%, white);
  --primary-strong: color-mix(in oklab, var(--primary) 85%, black);
  --primary-foreground: white;
}

:root,
.light {
  --focus-ring-primary: color-mix(in oklab, var(--primary) 30%, transparent);
}

.dark {
  --focus-ring-primary: color-mix(in oklab, var(--primary) 50%, transparent);
}
```

- **Keep `-subtle` and `-soft` translucent.** They composite over whatever surface they land on. An opaque
  replacement stops adapting between themes.
- **The family has to reach `.dark`**, `--primary-foreground` included, or the library's dark values (a white
  primary with near-black text) show through.
- **`--primary-foreground` is white on a dark or saturated brand color**, and the library's near-black
  (`oklch(0.13 0.028 261.692)`) on a light one. Aim for 4.5:1 against `--primary`.
- **A dark brand color is weak as text on a dark surface.** Fills with white text are fine, but `text-primary`,
  outline buttons and spinners can drop under 3:1 in dark mode. Tell the user, and offer a lighter `--primary`
  for `.dark` (its own block, same recipe). Changing the brand color per theme is their call.
- `secondary` follows a different recipe: its base fill is a lighter step, and the picked color is
  `--secondary-emphasis`. Copy the worked example from `https://appica.dev/ui/docs/react/theming.md`. The
  status families (`error`, `success`, `warning`, `info`) are not brand colors: a re-seeded error red stops
  reading as an error.

When the exact shades matter, point the user to the theme customizer: Settings in the header of
`https://appica.dev/ui`, then Primary Color, Custom, Get CSS Code. It generates both families for both themes
from 1 color, as literal values.

## Radius

`--radius` drives the whole corner scale. Every step from `--radius-4xs` to `--radius-4xl` is computed from it:

```css
:root {
  --radius: 0.5rem;
}
```

`Card` is the exception: set its corner with `--card-radius` (`className="[--card-radius:var(--radius-3xl)]"`),
because its frame and media scale from that variable and a `rounded-*` class reaches only 1 element.

## Fonts

Load the font, then point the raw token at it with a fallback stack. Redefining `--font-sans` on `:root`
re-fonts every component.

```css
:root {
  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
}
```

- **Next.js:** `next/font` with a `variable`, applied to `<html>` as `className={font.variable}`. Do not also
  put `font.className` on `<body>`: it hardcodes the family, bypasses the token, and `font-mono` stops working.
- **Vite, React Router, TanStack Start:** a Fontsource import or an `@font-face` rule, then the family name
  first in `--font-sans`.
- `--font-mono` works the same way.

## Restyle a component everywhere

Every part carries a `data-slot` attribute named after it (`button`, `card`, `dialog-popup`, `dialog-title`),
so 1 rule in your stylesheet restyles every instance:

```css
[data-slot='button'] {
  @apply rounded-full;
}
```

The slot names of a component are in its source: `node_modules/@appica/ui-react/src/components/<name>/`. A link
styled with `buttonVariants(...)` carries no slot, so give it `data-slot="button"` where the rule should
reach it. For 1 instance, pass `className` instead: it is merged with the component's classes and yours win.

## Dark mode

Dark mode is class-based: `.dark` on `<html>` switches the raw tokens, and `ThemeProvider` manages the class,
persists the choice, and sets it before first paint.

- **1 provider, at the root**, with `suppressHydrationWarning` on `<html>`. The attribute is expected: the
  no-flash script changes the class before React hydrates.
- **A nested `ThemeProvider` does nothing.** Only the outermost owns the theme, so a second one with
  `forcedTheme` further down changes nothing and reports no error.
- **Guard theme-dependent rendering with `mounted`.** `useTheme()` returns `theme` (the stored choice, possibly
  `'system'`), `resolvedTheme` (`'light'` or `'dark'`), `setTheme` and `mounted`. Until `mounted` is true the
  server cannot know the theme, so render a neutral placeholder:

```tsx
'use client'

import { useTheme } from '@appica/ui-react/hooks/use-theme'
import { Button } from '@appica/ui-react/button'
import { MoonStars, SunHigh } from '@appica/icons-react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme, mounted } = useTheme()
  if (!mounted) return <Button variant="ghost" size="icon-md" aria-label="Toggle theme" />

  return (
    <Button
      variant="ghost"
      size="icon-md"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {resolvedTheme === 'dark' ? <MoonStars /> : <SunHigh />}
    </Button>
  )
}
```

The icons come from the optional `@appica/icons-react` package. Any icon set works.

`ThemeProvider` props worth knowing: `defaultTheme`, `enableSystem` (on by default), `forcedTheme`,
`storageKey`, and `themes` with `value` for themes beyond light and dark.

## A dark region inside a light page

Put the `dark` class on a wrapper. The tokens inherit, so everything inside flips:

```tsx
<aside className="dark bg-background text-foreground">...</aside>
```

`text-foreground` belongs beside `dark`. Text color is inherited from `<body>` as an already-resolved color, so
without it plain text inside the region keeps the page's color.

A popup opened from inside that region is the exception. Select, DropdownMenu, Tooltip, Dialog and the rest
portal to `<body>`, outside the wrapper, and render in the page's theme. Give the same 2 classes to an element
around the popup:

```tsx
<DropdownMenuContent positionerProps={{ className: 'dark text-foreground' }} />
<DialogContent viewportProps={{ className: 'dark text-foreground' }} />
```

- Floating components take `positionerProps`: Select, DropdownMenu, Tooltip, Popover, Combobox, Autocomplete,
  ContextMenu, Menubar, PreviewCard.
- Modal components take `viewportProps`: Dialog, AlertDialog, Drawer.
- Add `scheme-dark` when the region or the popup scrolls, so native scrollbars turn dark too.
- Do not use `container` for this. It moves the popup into the wrapper, where it is clipped and stacked
  again, and it collapses a Dialog or Drawer overlay. See [composition.md](composition.md).
- `useTheme().resolvedTheme` reports the page's theme, not the region's. Code that branches on the theme in
  JavaScript (a chart palette, an image) needs the region's theme passed down.
