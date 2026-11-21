# Design tokens

The palette is organized by role, not by hue: there is no `bg-gray-100` here. Every color below is a Tailwind
utility (`bg-*`, `text-*`, `border-*`, `ring-*`, `fill-*`, `stroke-*`) and a raw CSS variable named after the
role (`var(--foreground-muted)`). Each has a light and a dark value, so a token-only screen works in dark mode
with no `dark:` classes.

The list for the installed version is the `@theme inline` block of `node_modules/@appica/ui-react/styles.css`.
Full text: `https://appica.dev/ui/docs/react/colors.md`.

## Contents

- [What is already applied](#what-is-already-applied)
- [Foreground: text and icons](#foreground-text-and-icons)
- [Background: surfaces](#background-surfaces)
- [Border](#border)
- [Accents](#accents)
- [Focus rings](#focus-rings)
- [Radius, shadow, type and motion](#radius-shadow-type-and-motion)
- [A token outside a utility](#a-token-outside-a-utility)

## What is already applied

The stylesheet puts `bg-background text-foreground` on `body` and `border-border` on every element. So body
text needs no color class, and a bare `border` already draws the default border color. Name a color only to
change it.

## Foreground: text and icons

| Token | Use for |
| --- | --- |
| `foreground` | Default body text |
| `foreground-muted` | Secondary text, descriptions |
| `foreground-subtle` | Placeholders, disabled labels, markers |
| `foreground-strong` | Emphasized text |
| `foreground-emphasis` | Stronger emphasis |
| `foreground-intense` | Headings, highest-contrast text |
| `foreground-inverse` | Text on an inverted surface |

## Background: surfaces

| Token | Use for |
| --- | --- |
| `background` | The base page surface |
| `background-subtle` | Slightly raised areas, cards |
| `background-soft` | Translucent frames and panels over a pattern or an image |
| `background-muted` | Hover fills, inset panels |
| `background-strong` | More prominent fills |
| `background-inverse` | Inverted surfaces, such as tooltips |

`background-soft` is translucent in both themes, and `background-subtle` in dark mode, so they composite over
whatever is behind them. Where content shows through, put a `backdrop-blur-*` on the same element and the same
state. Where a surface has to hide what is behind it, such as a sticky bar, use `background` or
`background-muted`.

## Border

| Token | Use for |
| --- | --- |
| `border` | Default borders and dividers |
| `border-muted` | Faint separators |
| `border-strong` | Higher-contrast borders |
| `border-emphasis` | Emphasized outlines |
| `border-intense` | Strongest outlines |
| `border-inverse` | Borders on inverted surfaces |

## Accents

6 families share 1 scale, so they are interchangeable by intent. `primary` and `secondary` carry the brand.
`error`, `success`, `warning` and `info` carry status, and are not for decoration.

| Step | Role |
| --- | --- |
| `*-subtle` | Translucent tint, a soft background wash |
| `*-soft` | A slightly stronger translucent fill, also the border of a tinted box |
| `*-muted` | Muted solid |
| `*` | The default accent fill |
| `*-strong` | Stronger, for hover and active |
| `*-emphasis` | The vivid value, for an icon or a word on a neutral or tinted surface |
| `*-intense` | The boldest value |
| `*-foreground` | Text and icons on a solid step of the same family |

`primary` has no `-emphasis` or `-intense` step, and its default values are achromatic: near-black in light
mode and white in dark. Giving it a color changes the whole family, see [theming.md](theming.md).

Pairings that hold in both themes:

- A solid fill: `bg-primary text-primary-foreground`, `bg-success-muted text-success-foreground`.
- A status box: `bg-info-subtle border border-info-soft`, the icon in `text-info-emphasis`, and the text in the
  regular foreground tokens.

`*-foreground` is legible only on a solid step. On a `-subtle` or `-soft` tint it stays near-black in dark
mode, so tinted boxes keep the regular foreground tokens.

## Focus rings

`ring`, `ring-input`, `ring-primary`, `ring-secondary`, `ring-error`, `ring-success`, `ring-warning`,
`ring-info`, `ring-light`. Components apply the right one on `:focus-visible` already. Reach for them only when
building a focusable element of your own, and never remove an outline.

## Radius, shadow, type and motion

- **Radius.** `rounded-4xs` through `rounded-4xl`, with `rounded-md` as the base. Every step is computed from
  `--radius`, so the scale follows the theme and a px value does not. In CSS: `var(--radius-md)`.
- **Shadow.** `shadow-2xs` through `shadow-2xl`, tinted per theme by `--shadow-color`.
- **Type.** `font-sans` and `font-mono` read `--font-sans` and `--font-mono`. Sizes run `text-xs` through
  `text-10xl`.
- **Motion.** `ease-spring` is the curve behind every press and popup entrance. Gate your own transitions with
  the library's `motion-safe:` and `motion-reduce:` variants, which also follow `ReducedMotionProvider`.
- **Variants.** `dark:` matches inside any `.dark` ancestor, and `hover-none:` matches on touch devices.

## A token outside a utility

Reference the raw variable: `var(--primary)` in CSS, or `text-(--primary)` in a class. There is no
`--color-primary` at runtime, because the theme layer is inlined into the utilities.
