# Accessibility, motion and right-to-left

The components implement the WAI-ARIA patterns through Base UI: keyboard interaction, focus management and
ARIA wiring are done. What follows is the part that stays with the code you write around them.

Full text: `https://appica.dev/ui/docs/react/accessibility.md`, `animation.md` and `rtl.md` in the same folder.

## Contents

- [Names and labels](#names-and-labels)
- [Focus](#focus)
- [Reduced motion](#reduced-motion)
- [Right-to-left](#right-to-left)

## Names and labels

- **A single control** gets its label from `Field` and `FieldLabel`.
- **A group** (`RadioGroup`, `CheckboxGroup`, `ToggleGroup`, and the segmented `DateField`, `TimeField` and
  `DatePicker`) takes `aria-label` or `aria-labelledby`. A `<label>` cannot point at a group.
- **A control with no visible text** needs `aria-label`: an icon-only button, a search field, a `Navigation`
  landmark.

```tsx
<Button variant="ghost" size="icon-md" aria-label="Close">
  <XIcon />
</Button>
```

- **A tooltip is not a name.** It never shows on touch and is not announced as the control's name, so an
  icon-only trigger keeps its own `aria-label`. Content everyone has to reach goes in a `Popover`.
- **A carousel that keeps playing under the pointer or focus** (`pauseOnHover: false` or `pauseOnFocus: false`)
  needs a `CarouselPlayToggle`, so a user can stop it.

## Focus

A focus ring is applied on `:focus-visible` everywhere. Do not remove outlines from interactive elements, and
do not restyle them per component: the `--focus-ring-*` tokens recolor them all. Dialogs, drawers and popovers trap
focus while open and return it to the trigger on close, so no focus code is needed around them.

## Reduced motion

Every animated component already honors the user's preference. Make your own transitions do the same with the
library's variants, which follow both the system setting and `ReducedMotionProvider`:

```tsx
<div className="transition-transform duration-200 hover:scale-105 motion-reduce:transition-none">...</div>
```

- `motion-reduce:` and `motion-safe:` here are the library's variants, not Tailwind's defaults: they also
  match when a `ReducedMotionProvider` turns animation off, including inside portaled popups.
- For an animation driven from JavaScript, read `useReducedMotion()` from
  `@appica/ui-react/hooks/use-reduced-motion`.
- `<ReducedMotionProvider disableAnimations>` turns animation off for the app, for tests or a user setting.
- Popups expose `data-starting-style` and `data-ending-style`, so enter and exit timing is tuned with
  utilities on `*Content` (`className="motion-safe:duration-500"`), without an animation library.

## Right-to-left

Direction reaches the components through 2 channels, and both have to be set:

1. **`dir="rtl"` on `<html>`**, for CSS and for the alignment of floating popups.
2. **`<DirectionProvider dir="rtl">`** around the app, for the components that position themselves in
   JavaScript: Slider, Switch, Carousel, menus and other floating surfaces.

```tsx
import { DirectionProvider } from '@appica/ui-react/providers/direction-provider'

<html lang="ar" dir="rtl">
  <body>
    <DirectionProvider dir="rtl">{children}</DirectionProvider>
  </body>
</html>
```

The attribute alone looks right until a slider or a submenu moves the wrong way. Add neither to a
left-to-right project unless the task asks for right-to-left.

The components use logical properties, so write your own markup the same way and it mirrors for free:
`ps-*` / `pe-*`, `ms-*` / `me-*`, `start-*` / `end-*`, `border-s` / `border-e`, `rounded-s-*` / `rounded-e-*`,
`text-start` / `text-end`. Never `pl-*`, `ml-*`, `left-*`, `border-l`, `text-left`. `scripts/check.mjs --rtl`
lists the physical ones.

4 things logical utilities do not mirror:

- **Transforms are physical.** `translate-x-*`, `-scale-x-*` and a Motion `x` keep their sign. Add an `rtl:`
  twin, or mirror a wrapper with `rtl:-scale-x-100`.
- **Gradient angles are physical.** `bg-linear-to-r` needs `rtl:bg-linear-to-l`.
- **Directional icons point the wrong way.** An arrow or chevron that means forward or back takes
  `rtl:rotate-180`. An icon that depicts a thing does not.
- **A popup opened from an RTL region of an LTR page** stays left-to-right, because it portals to `<body>`.
  Pass the direction to its positioner: `<DropdownMenuContent positionerProps={{ dir: 'rtl' }}>`.

To switch direction at runtime, update `<html dir>` and the `DirectionProvider` value together.
`useDirection()` from `@appica/ui-react/hooks/use-direction` reads it in your own components.
