# `@appica/ui-svelte` component status

Checklist of every public `@appica/ui-react` export and whether the Svelte package has a counterpart. Update this file as each component lands.

Wave 1 is native HTML + shared Tailwind tokens. **bits-ui** is the Base UI analog and starts in Wave 2. Dismiss animations use `svelte/transition`, not Motion. Polymorphism is `href` / `el` - there is no public `child` snippet.

## Components

- [x] `accordion` - Wave 2: bits-ui. `multiple` → `type`. Variant/icon context. Closed content unmounts (`forceMount={false}`).
- [x] `alert` - Wave 1. Dismiss uses `svelte/transition` (`out:`), not Motion. Compound parts: Icon / Title / Description / Action. Title tag via `el`.
- [x] `alert-dialog` - Wave 2: bits-ui. No default ×. `AlertDialog.createHandle` is a Svelte `$state` handle. Close wraps bits-ui Cancel.
- [x] `autocomplete` - Wave 2: bits-ui Combobox analog. `items` + built-in filter; `value` is the input string. `icon` default `false`. Extra `AutocompleteStatus`. `AutocompleteCollection` maps group items. No 2D grid keyboard nav.
- [x] `avatar` - Wave 1. Native `<img>` load/error (no Base UI). Group size/shape via context, not `cloneElement`.
- [x] `background-pattern` - Wave 1. Native CSS masks; spotlight uses `{@attach}` + WAAPI fade (persistent under `useReducedMotion`).
- [x] `badge` - Wave 1. `<span>` by default; `<a>` when `href` is set; `<button>` when `onclick` is set. No `child` snippet.
- [x] `border-beam` - Wave 1. CSS `animate-border-beam`. Same `revealOn` / `pressScale` pattern as GradientGlow.
- [x] `breadcrumb` - Wave 1. Native `nav` / `ol` / `li`. `el` on `BreadcrumbLink` (`a` / `button`); `active` renders a non-interactive `<span>`.
- [x] `button` - Wave 2: bits-ui `Button.Root`. `type="button"` default. `focusableWhenDisabled`. Links use exported `buttonVariants` on `<a>` (no `href` on Button). Inherits `variant` / `size` / `disabled` from `ButtonGroup` context.
- [x] `button-group` - Wave 1. Context for child `Button` variant, size, and disabled. No bits-ui.
- [x] `calendar` - Wave 2: bits-ui Calendar/RangeCalendar. Public props match React (`mode`, `selected` / `onSelect` / `bind:selected`, `month` / `onMonthChange`, `defaultMonth`, `startMonth` / `endMonth`, `disabled` Matcher). Values stay `DateValue` from `@internationalized/date` (`CalendarDate`, …), not native `Date`, so DateField / DatePicker stay on one date model. Range is `{ from?, to? }`, mapped internally to bits-ui `{ start, end }`. `class` stays `class` (Svelte). Caption matches React (`dropdown` / `dropdown-months` / `dropdown-years` / `label`) via Appica `Select`. `required` maps to bits-ui `preventDeselect`.
- [x] `card` - Wave 1. Root tag via `el` (`div` / `article` / `li` / …), not `render` / `child`.
- [x] `carousel` - custom Wave 2 (bits-ui has no carousel). Embla v9 via `embla-carousel-svelte` (same plugins as React). No `render` on Prev/Next: native `<button>` + `position`. `useLinkedCarousels` takes getters (`() => api`) so Svelte can track the apis.
- [x] `checkbox` - Wave 2: bits-ui `Checkbox.Root`. Folded indicator. `bind:checked`. `aria-invalid` → `data-invalid`. Reads Field context. Group identity is `value` with `name` fallback (same as Base UI). `parent` select-all is Appica (bits-ui has no parent).
- [x] `checkbox-group` - Wave 2: bits-ui `Checkbox.Group`. `orientation` default `vertical`. `allValues` drives a `parent` checkbox.
- [x] `chip` - Wave 1. Reuses `buttonVariants`. Dismiss uses `svelte/transition`. Group `clearAll()` is a component export (`bind:this`).
- [x] `collapsible` - Wave 2: bits-ui. Height via `--bits-collapsible-content-height`. `keepMounted` → `forceMount`.
- [x] `color-area` - Wave 2: custom (bits-ui has no color primitives). `bind:value`. RTL via `useDirection()`.
- [x] `color-picker` - Wave 2: custom. `bind:value` / `bind:open`. `trigger` snippet or `null` (no React `render` / `child`). `onOpenChange(open)` (no Base UI `details` / `cancel()`). Default `children` snippet replaces the HSB panel.
- [x] `color-slider` - Wave 2: custom. `bind:value`. RTL via `useDirection()`. Thumb inset from `offsetWidth` / `offsetHeight`.
- [x] `color-swatch` - Wave 2: custom. Picker-context preview when `color` is omitted.
- [x] `color-swatch-picker` - Wave 2: custom. Roving listbox, sliding indicator. `bind:value`. RTL via `useDirection()`.
- [x] `combobox` - Wave 2: bits-ui Combobox. `multiple` → `type`. Chips are Appica chrome (`ComboboxChips` / `ComboboxChip`). No Collection / `useFilteredItems`; filtering is consumer-side. Clear is an Appica button (bits-ui has no `.Clear`).
- [x] `context-menu` - Wave 2: bits-ui. Clone of DropdownMenu chrome. Extra `ContextMenuCheckboxGroup`. Trigger is right-click / long-press.
- [x] `copy-button` - Built on `Button`. Children swap to `copiedLabel` on success. `value` is a string, HTMLElement (`bind:this`), or getter.
- [x] `countdown` - Wave 1. Timer + context. Digit roll is CSS `translateY`, not Motion. Children snippet receives `parts`.
- [x] `date-field` - Wave 2: bits-ui DateField wrap (`bind:value`, `bind:placeholder`). Format comes from `locale` + value/placeholder type (`CalendarDate` vs `CalendarDateTime` vs `ZonedDateTime`); `granularity` is inferred when omitted. Appica chrome: `variant` / `size` / `start` / `end` / `unstyled` / Field. No React `format` tokens. Hidden input is ISO `yyyy-MM-dd`.
- [x] `date-picker` - compose Calendar + DateField + TimeField + Popover (not a bits-ui DatePicker wrap). `type` (not React `mode`), `showTime`, `closeOnSelect`. No date-fns `dateFormat` / `timeFormat`; formatting is `locale` + granularity / `hourCycle`. Visible month via `defaultPlaceholder` (not React `defaultMonth`). Values are `DateValue` / `DateValue[]` / `{ from?, to? }`.
- [x] `dialog` - Wave 2: bits-ui. `splitModalProps` Portal/Overlay/viewport. `Dialog.createHandle` is a Svelte `$state` handle. Triggers take `class={buttonVariants(...)}`.
- [x] `drawer` - Wave 2: bits-ui Dialog + Appica chrome (no bits-ui Drawer). Swipe/snap are CSS-only. Nested backdrop off when `depth > 1`. `Drawer.createHandle`.
- [x] `dropdown-menu` - Wave 2: bits-ui. Extra `DropdownMenuCheckboxGroup` (`bind:value={string[]}`) for bits-ui checkbox items.
- [x] `field` - Wave 2: native (bits-ui has Label only). Form `errors[name]` drives FieldError. Wired into Input, Textarea, Select trigger, Switch, Checkbox, Radio, OTPField, NumberField, Combobox Input, Autocomplete Input, DateField, TimeField, DatePicker.
- [x] `fieldset` - Wave 1. Native `<fieldset>` / `<legend>` (no bits-ui). `disabled` disables descendant controls.
- [x] `form` - Wave 1. Native `<form>`. `errors` / `onClearErrors` live in context for Wave 2 Field.
- [x] `gradient-glow` - Wave 1. Uses shared `animate-gradient-glow` utilities in `styles.css`.
- [x] `input` - Wave 1. `bind:value`, `clearable`, `start` / `end` snippets. `htmlSize` maps to the native `size` attribute. Reads Field context (`invalid` / `disabled` / `name` / `aria-describedby`).
- [x] `kbd` - Wave 1. Size via context on `KbdGroup`.
- [x] `loader` - Wave 1. Bar / dots as CSS `@keyframes`, gated by `useReducedMotion` (no Motion).
- [x] `menubar` - Wave 2: bits-ui `Menubar.Root` + `Menu` (not a DropdownMenu wrap). Extra `MenubarCheckboxGroup`. Vertical uses `side=right`.
- [x] `meter` - Wave 1. Native ARIA `role="meter"` (no bits-ui). Threshold status classes on the indicator.
- [x] `navigation` - Wave 1. Native `<nav>` / list / `el` on `NavigationLink` (`a` / `button`). No `render` / `child`.
- [x] `navigation-menu` - Wave 2: bits-ui. Viewport auto-rendered (`viewport` default `true`). Appica `NavigationMenuIcon`, backdrop, Sub (pill + vertical inside Content). `useDirection()` for `dir`.
- [x] `number-field` - Wave 2: native (bits-ui has no NumberField). Steppers + `Intl.NumberFormat`. Digit overlay is CSS `translateY`, not Motion. Reads Field context.
- [x] `otp-field` - Wave 2: bits-ui PinInput. Public `length` maps to `maxlength`. Root snippet `{ cells }` → `OTPFieldInput {cell}`. One hidden input is the form control. `OTPFieldSeparator` is Appica chrome.
- [x] `pagination` - Wave 1. `el` on `PaginationLink` (`a` / `button`). Links use `buttonVariants` via context.
- [x] `popover` - Wave 2: bits-ui. Compound parts. Triggers take `class={buttonVariants(...)}`. Title/Description are styled `h2` / `p`. `keepMounted` → `forceMount`. `Popover.createHandle` is a Svelte `$state` handle.
- [x] `preview-card` - Wave 2: bits-ui LinkPreview. Default `openDelay=600` / `closeDelay=300`. `PreviewCard.createHandle`. Arrow chrome cloned from Popover.
- [x] `progress` - Wave 1. Native ARIA `role="progressbar"` (no bits-ui). Bar and circular variants.
- [x] `radio` - Wave 2: bits-ui `RadioGroup.Item` (no standalone Radio). Requires a RadioGroup ancestor. Reads Field context (`omitId` so the label targets the group).
- [x] `radio-group` - Wave 2: bits-ui `RadioGroup.Root`. `orientation` default `vertical`. Inherits Field `name` / `disabled` / `id`.
- [x] `rating` - Wave 1. Radiogroup + CSS clip-path / scale (no Motion). RTL from closest `[dir]`. `bind:value`.
- [x] `scroll-area` - Wave 1. Native overflow + overlay thumbs (no bits-ui). `scrollShadow` CSS vars from overflow.
- [x] `select` - Wave 2: bits-ui. `multiple` → `type`. Field context on the trigger. `start` / `end` snippets. Empty single value is `''`.
- [x] `separator` - Wave 1. SVG decorative variants (dotted / wave / zigzag) ported as-is.
- [x] `skeleton` - Wave 1. Same `shimmer` / `pulse` / `none` classes as React.
- [x] `slider` - Wave 2: bits-ui. Folded Root + track + thumbs. Infers `type` from number vs array. `tooltipVisibility`. RTL via closest `[dir]`.
- [x] `sparkline` - Wave 1. SVG path / CSS columns. Hover via pointer events. RTL from closest `[dir]` (no DirectionProvider).
- [x] `spinner` - Wave 1. Circular / dots as CSS `@keyframes`; sparkle morphs via rAF. Gated by `useReducedMotion`.
- [x] `switch` - Wave 2: bits-ui `Switch.Root` + `Thumb`. `size` sm/md/lg. `bind:checked`. `aria-invalid` → `data-invalid`. Reads Field context.
- [x] `table` - Wave 1. Native table parts. `highlighted` on `TableRow`.
- [x] `tabs` - Wave 2: bits-ui. Custom sliding indicator (`data-slot="tabs-indicator"`) because bits-ui has no Tabs.Indicator. `data-[state=active]:`.
- [x] `text-animate` - Wave 1. rAF clock + `IntersectionObserver`. Required `text` prop (Svelte cannot tokenize string children). Presets match React.
- [x] `textarea` - Wave 1. Same patterns as Input (`bind:value`, `clearable`, `start` / `end`). Reads Field context.
- [x] `thumbnail` - Wave 1. Image vs icon variants; same size/shape scale as Avatar.
- [x] `time-field` - Wave 2: bits-ui TimeField. `dir="ltr"` on the segments row. Field context. Values are `TimeValue` (`Time` / `CalendarDateTime` / `ZonedDateTime`), not `"HH:mm"` strings. Hidden input is bits-ui ISO time.
- [x] `toast` - Wave 2: native manager (`createToastManager`) + bits-ui Portal. Viewport `dir` from `useDirection()`. Swipe, stack limit, F6, and hover/focus timer pause match React.
- [x] `toc` - Wave 1. Native `<nav>` + `IntersectionObserver`. No `render` / `child`.
- [x] `toggle` - Wave 2: bits-ui. Standalone `Toggle.Root`; inside a group, `ToggleGroup.Item`. No chrome - pass `class={buttonVariants(...)}`.
- [x] `toggle-group` - Wave 2: bits-ui. `multiple` maps to `type`. Default `flex w-fit gap-1`.
- [x] `toolbar` - Wave 1. Native `role="toolbar"` + roving tabindex (no bits-ui). Triggers take `class={buttonVariants(...)}`.
- [x] `tooltip` - Wave 2: bits-ui. `TooltipProvider` `delay` default 200 (`delayDuration`). Triggers take `class={buttonVariants(...)}`. `keepMounted` → `forceMount`.

## Lib

- [x] `color` - shared color model (`@appica/ui-svelte/color`), copied from React.

## Hooks

- [x] `use-direction` - Wave 2. Returns `{ current }`; defaults to `'ltr'` without a provider.
- [x] `use-dismissible` - shipped with Wave 1 (Alert persistKey)
- [x] `use-local-storage` - shipped with Wave 1 (ThemeProvider)
- [x] `use-media-query` - Wave 1. Wraps `MediaQuery` from `svelte/reactivity` (read `.current`)
- [x] `use-reduced-motion` - Wave 1. Read `.current`
- [x] `use-theme` - Wave 1

## Providers

- [x] `direction-provider` - Wave 2. `display: contents` wrapper with `dir`. Nested providers overwrite context.
- [x] `reduced-motion-provider` - Wave 1. Sets `data-disable-animations` on `<html>`
- [x] `theme-provider` - Wave 1. Same `localStorage` key and inline no-flash script as React
