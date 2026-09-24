# Changelog

All notable changes to `@appica/ui-react`. This file covers the library only.
The [full release notes](https://appica.dev/ui/changelog) put the same releases
on one timeline with the documentation and the Figma community file, which
version alongside the package.

The library follows [semantic versioning](https://semver.org/spec/v2.0.0.html).

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
- **Dependencies** - Base UI 1.8, Embla Carousel 9.0.0-rc03, Motion 13.4 and React 19.3, with TypeScript 7 and Vitest 5 across the workspace. Through Base UI 1.8, read-only Select, Combobox and Autocomplete open for browsing, and start-aligned menus scale in from their corner.
- **Agent rules** - The packaged rules and the README point at the per-integration index, `https://appica.dev/ui/react/llms.txt`.

### Removed

- **Background Pattern dashed grid** - The `dashed-grid` variant is gone. Use `grid`, which now marks every intersection.

### Fixed

- **[Menu items under Base UI 1.8](https://appica.dev/ui/components/react/dropdown-menu)** - Dropdown Menu, Context Menu and Menubar items keep their padding, radius and rounded highlight. Base UI 1.8 stopped writing the `aria-orientation` the item styles relied on ([#11](https://github.com/appica-dev/appica-ui/issues/11)).

## 1.1.0 - 2026-08-11

8 new components including a full color system, a prebuilt stylesheet for projects without Tailwind, and an API reference generated from the library types.

### Added

- **[Card](https://appica.dev/ui/components/react/card)** - A server-safe layout container with `CardMedia`, `CardHeader`, `CardTitle`, `CardDescription` and `CardFooter` slots, an optional solid or glass frame, and an inset mode that floats media into a fully rounded panel. Every corner derives from a single `--card-radius`, so retuning one value keeps the nest concentric.
- **[Color Picker](https://appica.dev/ui/components/react/color-picker)** - A swatch trigger and a popover holding an HSB area, a hue slider and a text input. It shares one color with every color component below it through context, so an area, a slider and a palette need no value wiring. `ColorPickerInput` reads any string `parseColor` accepts, not only the format it prints, and `ColorPickerEyeDropper` samples a screen pixel where the browser has an EyeDropper (rendering nothing where it does not).
- **[Color Area, Color Slider, Color Swatch and Color Swatch Picker](https://appica.dev/ui/components/react/color-area)** - The 4 building blocks behind the picker, each usable on its own: a two-axis HSB plane, a channel slider, a single swatch, and a selectable palette.
- **Color model** - `parseColor`, `formatColor`, `convertColor` and the channel helpers ship from `@appica/ui-react/color`. An alpha format collapses to its opaque twin at full opacity, so a solid color is written `#3b82f6` rather than `#3b82f6ff`.
- **[Rating](https://appica.dev/ui/components/react/rating)** - A `radiogroup` of icon buttons that sweeps a fill preview across the row under the pointer and commits on click. The preview always lands on a `step` boundary, so it never promises a value the click will not deliver. Swap the built-in star through `icon={{ empty, filled }}`, and recolor the whole control with any `text-*` utility.
- **[Border Beam](https://appica.dev/ui/components/react/border-beam)** - A comet of light that laps your content's border, painted as a conic sweep clipped to a hairline ring so it follows the wrapper's own `border-radius` exactly, from a `rounded-xl` card to a full pill, with no radius prop to keep in sync. Pure CSS, mirrored in RTL and reduced-motion aware.
- **[Carousel thumbnails](https://appica.dev/ui/components/react/carousel)** - `CarouselThumbs` is a rail of `CarouselThumb`s that sits inside the carousel and drives it, with no second engine to wire up by hand. The rail is a carousel of its own, so a set with more shots than fit scrolls instead of squeezing, and selection is drawn as a single outline that slides between thumbnails.
- **[frame prop on Dialog, AlertDialog and Drawer](https://appica.dev/ui/components/react/dialog)** - Wraps the popup in a translucent glass frame over the backdrop. Pass `frame={false}` for a plain solid card.
- **[Prebuilt stylesheet](https://appica.dev/ui/docs/react/installation)** - `@import '@appica/ui-react/css'` pulls in a single self-contained `appica.css` carrying every component's styles and the full token system, for projects that do not run Tailwind. It is linkable straight from a CDN, and tokens stay overridable CSS variables so theming works the same way.
- **[Agent rules in the package](https://appica.dev/ui/docs/react/agents)** - `@appica/ui-react/agent-rules.md` ships the rules a coding agent needs to use the library correctly, so an agent that wandered in following an import finds them without the docs site. The README links it.

### Improved

- **Prop documentation comes from the source** - All 366 props declared on our own types now carry JSDoc, so a component's comments, its IDE hover and the published API reference cannot drift apart. `Badge`, `Button`, `Alert` and `TabsList` declare `variant` and `size` explicitly, so hovering one shows the union and its default instead of an empty interface body.
- **[Text Animate shimmer](https://appica.dev/ui/components/react/text-animate)** - Reworked as a seamless gradient glare that sweeps the whole string as one band, rather than brightening character by character.
- **Dependencies** - Base UI 1.7, Motion 13, Tailwind CSS 4.3 and TypeScript 6 across the workspace, and the development Node floor moves to 22. React 19 and Tailwind CSS 4 remain the only peer requirements.

### Fixed

- **Menu padding** - Dropdown Menu and Context Menu keep their padding inside the scrollport, so pressing the last item no longer scrolls the list under the pointer.

## 1.0.0 - 2026-07-09

The first public release of the component library.

### Added

- **[60+ components](https://appica.dev/ui/components/react/button)** - Built on Base UI primitives, animated with Motion and styled with Tailwind CSS v4 design tokens. Accessible by default, right-to-left ready, and quiet when the reader prefers reduced motion.
- **[Providers and hooks](https://appica.dev/ui/docs/react/theme-provider)** - `ThemeProvider`, `DirectionProvider` and `ReducedMotionProvider`, plus `useTheme`, `useDirection`, `useMediaQuery`, `useLocalStorage`, `useDismissible` and `useReducedMotion`.
- **[Token-based theming](https://appica.dev/ui/docs/react/theming)** - Every color, radius, font and shadow is a CSS variable, so a project retunes the library by redefining tokens rather than overriding component styles. Dark mode ships with no flash of the wrong theme.
- **[Composition through render](https://appica.dev/ui/docs/react/composition)** - Every component takes a `render` prop, so it lends its behavior and styling to an element you supply - a `next/link`, a `<button>`, another component - rather than wrapping it in one more node.
