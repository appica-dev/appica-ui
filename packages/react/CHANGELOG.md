# Changelog

All notable changes to `@appica/ui-react`. This file covers the library only.
The [full release notes](https://appica.dev/ui/changelog) put the same releases
on one timeline with the documentation and the Figma community file, which
version alongside the package.

The library follows [semantic versioning](https://semver.org/spec/v2.0.0.html).

## 1.4.0 - 2026-11-01

A play and pause control for Carousel, options to keep autoplay running under the pointer or focus, and a mouse click that no longer pauses it.

### Added

- **[CarouselPlayToggle](https://appica.dev/ui/components/react/carousel#play-and-pause)** - A play and pause button for Autoplay and Auto Scroll. Once paused, the carousel stays paused until it's pressed again. For a custom control, use `paused`, `pause()` and `play()` from `useCarousel()`.
- **[Carousel autoplay pause options](https://appica.dev/ui/components/react/carousel#autoplay)** - `pauseOnHover` and `pauseOnFocus` turn off either pause, for a timer that is part of the design. A carousel without the pause needs a `CarouselPlayToggle`.

### Fixed

- **[Carousel autoplay focus pause](https://appica.dev/ui/components/react/carousel#accessibility)** - Only keyboard focus pauses autoplay. A mouse click on an arrow or a pagination dot leaves it running.

## 1.3.1 - 2026-11-01

Accessibility fixes for Carousel and form fields, and a lighter carousel progress bar.

### Added

- **[Date Picker range labels](https://appica.dev/ui/components/react/date-picker#date-range)** - `startAriaLabel` and `endAriaLabel` name the 2 fields of a range.

### Improved

- **[Carousel autoplay](https://appica.dev/ui/components/react/carousel#autoplay)** - Pauses while hovered or focused, and stays off with reduced motion.
- **Carousel progress bar** - Animates its position instead of its width, so it no longer triggers layout every frame.
- **Dependencies** - Motion 14.9.

### Fixed

- **[Carousel landmarks](https://appica.dev/ui/components/react/carousel#accessibility)** - 1 region per labeled carousel instead of 2 named "Carousel". An unlabeled carousel is a group.
- **[Carousel slides](https://appica.dev/ui/components/react/carousel#accessibility)** - Off-screen slides are inert, and visible slides are no longer hidden from screen readers.
- **Carousel thumbnails and arrows** - Thumbnails stay buttons, and an arrow at the end is `aria-disabled` so it keeps focus: style it with `data-disabled`, not `:disabled`.
- **Date Field, Time Field and Date Picker** - Field labels, descriptions and errors reach the segments.
- **Field, Number Field, Combobox and Autocomplete** - Errors and "No results" are announced, and a Number Field's `aria-label` names its input.
- **[Copy Button](https://appica.dev/ui/components/react/copy-button#accessibility)** - Visible text names the button, and the "Copied" status now renders just before the `<button>` instead of inside it.
- **Breadcrumb, Pagination, Spinner and Loader** - Correct names and states for screen readers, with no stray tab stops.

## 1.3.0 - 2026-10-12

A new Compare Slider, type-to-filter Dropdown Menus, drag controls that work inside a Drawer, and Base UI 1.9.

### Added

- **[Compare Slider](https://appica.dev/ui/components/react/compare-slider)** - Two layers split by a draggable divider, for before and after comparisons. Horizontal or vertical, with labels, a custom handle icon and an optional reveal on scroll.
- **[Dropdown Menu filtering](https://appica.dev/ui/components/react/dropdown-menu#filtering)** - `DropdownMenuFilterProvider`, `DropdownMenuInput`, `DropdownMenuEmpty` and `DropdownMenuList` let readers type to narrow a menu or submenu. Base UI still marks filtering as a preview.
- **[createComboboxItems](https://appica.dev/ui/components/react/combobox#values-by-id)** - Base UI's `Combobox.createItems`, re-exported, for a Combobox that stores IDs but shows labels.
- **[keepMounted on Thumbnail](https://appica.dev/ui/components/react/thumbnail#nextjs-image)** - Loads the image in place instead of preloading `src`, so a Next.js `<Image>` downloads once and `loading="lazy"` stays lazy.
- **[--ease-spring token](https://appica.dev/ui/docs/react/theming#other-token-groups)** - The library's spring curve as a theme token, with an `ease-spring` utility for your own transitions.

### Improved

- **Dependencies** - Base UI 1.9, Motion 14 and Embla Carousel 9.0.0-rc04. The menus gain `onItemHighlighted`, and Accordion and Collapsible triggers set the native `disabled` attribute.
- **[Typed Combobox values](https://appica.dev/ui/components/react/combobox#values-by-id)** - `value`, `defaultValue` and `onValueChange` take their type from `items` instead of `unknown`, so `onValueChange={setValue}` needs no cast. A value of the wrong type is now a type error.
- **actionsRef with a custom exit animation** - To unmount a popup with `actionsRef.unmount()` after your own exit animation, call `eventDetails.preventUnmountOnClose()` in `onOpenChange`. Otherwise Base UI 1.9 unmounts it before your animation ends.

### Fixed

- **[Drag controls inside a Drawer](https://appica.dev/ui/components/react/drawer#drags-inside-the-drawer)** - Dragging a Slider, Color Slider, Color Area, Carousel or interactive Sparkline no longer moves the Drawer around it.

## 1.2.0 - 2026-09-24

Base UI 1.8 compatibility fixes, 2 new Background Pattern textures and a redrawn grid, a border-only Gradient Glow, and custom Copy Button icons.

### Added

- **[Background Pattern rings and checkerboard](https://appica.dev/ui/components/react/background-pattern)** - Staggered rings drawn at a fixed stroke at any `cellSize`, and a checkerboard whose `cellSize` sets one square.
- **[Border-only Gradient Glow](https://appica.dev/ui/components/react/gradient-glow)** - `glow={false}` drops the blurred aura. With `border` it leaves a gradient stroke that keeps `revealOn`, `speed` and `pressScale`.
- **[Custom Copy Button icon](https://appica.dev/ui/components/react/copy-button)** - The `icon` prop swaps the resting glyph, for a copy-link control for example. The drawn check and the status announcement stay built in.
- **[Snapping free drag on Carousel](https://appica.dev/ui/components/react/carousel)** - `dragFree="snap"` glides like a free drag, then settles on the nearest snap point.

### Improved

- **[Background Pattern grid](https://appica.dev/ui/components/react/background-pattern)** - Redrawn with a dot at every intersection, set off from the 1px lines, and the stroke holds at any `cellSize`.
- **[Card solid frame](https://appica.dev/ui/components/react/card)** - A translucent `background-muted` band under a stronger blur, keeping `background-subtle` in dark mode.
- **Dependencies** - Base UI 1.8, Embla Carousel 9.0.0-rc03, Motion 13.4 and React 19.3. Read-only Select, Combobox and Autocomplete now open for browsing, and start-aligned menus scale in from their corner.
- **Agent rules** - The packaged rules and the README point at the per-integration index, `https://appica.dev/ui/react/llms.txt`.

### Removed

- **Background Pattern dashed grid** - The `dashed-grid` variant is gone. Use `grid`, which now marks every intersection.

### Fixed

- **[Menu items under Base UI 1.8](https://appica.dev/ui/components/react/dropdown-menu)** - Dropdown Menu, Context Menu and Menubar items keep their padding, radius and rounded highlight. Base UI 1.8 stopped writing the `aria-orientation` the item styles relied on ([#11](https://github.com/appica-dev/appica-ui/issues/11)).

## 1.1.0 - 2026-08-11

8 new components including a full color system, a prebuilt stylesheet for projects without Tailwind, and an API reference generated from the library types.

### Added

- **[Card](https://appica.dev/ui/components/react/card)** - A server-safe container with media, header and footer slots, an optional solid or glass frame, and an inset mode. Every corner derives from one `--card-radius`.
- **[Color Picker](https://appica.dev/ui/components/react/color-picker)** - A swatch trigger and a popover with an HSB area, a hue slider and a text input. Color components inside it share one color with no wiring, and `ColorPickerEyeDropper` samples a screen pixel where the browser supports it.
- **[Color Area, Color Slider, Color Swatch and Color Swatch Picker](https://appica.dev/ui/components/react/color-area)** - The 4 building blocks behind the picker, each usable on its own: a two-axis HSB plane, a channel slider, a single swatch, and a selectable palette.
- **Color model** - `parseColor`, `formatColor`, `convertColor` and the channel helpers, from `@appica/ui-react/color`.
- **[Rating](https://appica.dev/ui/components/react/rating)** - A star rating with a hover preview that snaps to `step`, custom icons through `icon={{ empty, filled }}`, and color from any `text-*` utility.
- **[Border Beam](https://appica.dev/ui/components/react/border-beam)** - A beam of light that circles your content's border and follows its `border-radius`. Pure CSS, mirrored in RTL and reduced-motion aware.
- **[Carousel thumbnails](https://appica.dev/ui/components/react/carousel)** - `CarouselThumbs` and `CarouselThumb` add a scrolling thumbnail rail that drives the carousel, with nothing extra to wire up.
- **[frame prop on Dialog, Alert Dialog and Drawer](https://appica.dev/ui/components/react/dialog)** - Wraps the popup in a translucent glass frame over the backdrop. Pass `frame={false}` for a plain solid card.
- **[Prebuilt stylesheet](https://appica.dev/ui/docs/react/installation)** - `@import '@appica/ui-react/css'` loads one self-contained stylesheet with every component and token, for projects without Tailwind. It also works from a CDN.
- **[Agent rules in the package](https://appica.dev/ui/docs/react/agents)** - `@appica/ui-react/agent-rules.md` ships the rules a coding agent needs to use the library, and the README links it.

### Improved

- **Prop documentation comes from the source** - All 366 props declared by the library carry JSDoc, which also generates the published API reference, so IDE hover and the docs match.
- **[Text Animate shimmer](https://appica.dev/ui/components/react/text-animate)** - Reworked as a seamless gradient glare that sweeps the whole string as one band, rather than brightening character by character.
- **Dependencies** - Base UI 1.7, Motion 13 and Tailwind CSS 4.3, and the development Node floor moves to 22. React 19 and Tailwind CSS 4 remain the only peer requirements.

### Fixed

- **Menu padding** - Dropdown Menu and Context Menu keep their padding inside the scrollport, so pressing the last item no longer scrolls the list under the pointer.

## 1.0.0 - 2026-07-09

The first public release of the component library.

### Added

- **[60+ components](https://appica.dev/ui/components/react/button)** - Built on Base UI, animated with Motion and styled with Tailwind CSS v4 tokens. Accessible, right-to-left ready and reduced-motion aware.
- **[Providers and hooks](https://appica.dev/ui/docs/react/theme-provider)** - `ThemeProvider`, `DirectionProvider` and `ReducedMotionProvider`, plus `useTheme`, `useDirection`, `useMediaQuery`, `useLocalStorage`, `useDismissible` and `useReducedMotion`.
- **[Token-based theming](https://appica.dev/ui/docs/react/theming)** - Every color, radius, font and shadow is a CSS variable you can redefine, and dark mode loads without a flash.
- **[Composition through render](https://appica.dev/ui/docs/react/composition)** - Every component takes a `render` prop to lend its behavior and styling to your own element (a `next/link`, a `<button>`, another component) instead of adding a wrapper.
