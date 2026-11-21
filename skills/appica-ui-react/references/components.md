# Appica UI component catalog

Covers `@appica/ui-react` 1.5.0. Every public entry point, grouped by job.

- **Import** from `@appica/ui-react/<Import>`, 1 entry point per import statement.
- **Exports** is generated from the package, so a name missing from it does not exist. The parts resemble
  shadcn/ui's but are not the same set: `Card` has no `CardContent`, `Select` has no `SelectLabel`, and
  `AlertDialog` has no `AlertDialogAction`.
- **Docs** for a component are at `https://appica.dev/ui/components/react/<Import>.md`. A row says so when its
  docs live on another page.
- A project on another version has a different list. `scripts/check.mjs` prints what differs.

## Contents

- [Actions and inputs](#actions-and-inputs)
- [Data display](#data-display)
- [Decoration and effects](#decoration-and-effects)
- [Layout](#layout)
- [Menus](#menus)
- [Navigation](#navigation)
- [Overlays](#overlays)
- [Status and feedback](#status-and-feedback)
- [Providers and hooks](#providers-and-hooks)
- [Which one?](#which-one)
- [Names that are not components](#names-that-are-not-components)

## Actions and inputs

| Import | Exports | Use it for |
| --- | --- | --- |
| `autocomplete` | Autocomplete, AutocompleteInput, AutocompleteTrigger, AutocompleteValue, AutocompleteContent, AutocompleteList, AutocompleteItem, AutocompleteEmpty, AutocompleteStatus, AutocompleteGroup, AutocompleteLabel, AutocompleteCollection, AutocompleteSeparator | A text input that suggests matches as you type. The value is free text. |
| `button` | Button, buttonVariants | An action. `buttonVariants` styles a link to look like one. |
| `button-group` | ButtonGroup | Related buttons joined into 1 segmented control. |
| `calendar` | Calendar | An always-visible month grid for picking a date, several dates, or a range. |
| `checkbox` | Checkbox | 1 option on or off, usually submitted with a form. |
| `checkbox-group` | CheckboxGroup | Several checkboxes sharing 1 value. Docs: the `checkbox` page. |
| `chip` | Chip, ChipGroup | A small tag for filters and selections, optionally removable. |
| `color-area` | ColorArea | A 2-axis gradient for adjusting 2 channels of a color. |
| `color-picker` | ColorPicker, ColorPickerInput, ColorPickerEyeDropper | A trigger, a popover and a color panel sharing 1 value. Start here for "pick a color". |
| `color-slider` | ColorSlider | A gradient track for 1 channel of a color. |
| `color-swatch` | ColorSwatch | A preview of 1 color, transparency included. |
| `color-swatch-picker` | ColorSwatchPicker, ColorSwatchPickerItem | A palette to choose 1 color from. |
| `combobox` | Combobox, ComboboxInput, ComboboxTrigger, ComboboxChips, ComboboxValue, ComboboxChip, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty, ComboboxGroup, ComboboxLabel, ComboboxCollection, ComboboxSeparator, createComboboxItems | An input with a filterable list, for picking 1 option or several from a known set. |
| `copy-button` | CopyButton | Copies text to the clipboard and confirms with a check. |
| `date-field` | DateField | A segmented input for typing a date. |
| `date-picker` | DatePicker | A date field with a calendar popup: a date, a range, or a date and time. |
| `field` | Field, FieldLabel, FieldDescription, FieldError, FieldValidity | Pairs 1 control with its label, description and error. There is no separate Label component. |
| `fieldset` | Fieldset, FieldsetLegend | Groups fields under a legend. Docs: the `field` page. |
| `form` | Form | A form that validates its fields on submit and shows server errors per field. |
| `input` | Input, inputVariants | A single-line text field, with icons and an optional clear button. |
| `number-field` | NumberField | A number input with stepper buttons. |
| `otp-field` | OTPField, OTPFieldInput, OTPFieldSeparator | A row of boxes for a one-time code. |
| `radio` | Radio | 1 option of a radio group. |
| `radio-group` | RadioGroup | The group that holds radios and their value. Docs: the `radio` page. |
| `rating` | Rating | A score input made of stars or any icon, fractions supported. |
| `select` | Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectGroupLabel, SelectItem, SelectSeparator | A trigger that opens a list of fixed options, for 1 value or several. No typing. |
| `slider` | Slider | A draggable control for a number or a range. |
| `switch` | Switch | A setting that turns on or off at once. |
| `textarea` | Textarea | A multi-line text field. |
| `time-field` | TimeField | A segmented input for typing a time. |
| `toggle` | Toggle | A button that stays pressed or unpressed. |
| `toggle-group` | ToggleGroup | A set of toggles where 1 or several are pressed: a segmented choice. |
| `toolbar` | Toolbar, ToolbarButton, ToolbarLink, ToolbarInput, ToolbarGroup, ToolbarSeparator | A container that groups buttons, links and inputs. |

## Data display

| Import | Exports | Use it for |
| --- | --- | --- |
| `accordion` | Accordion, AccordionItem, AccordionTrigger, AccordionContent | A stack of sections that expand and collapse. |
| `avatar` | Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup | A user image with a text or icon fallback. `AvatarGroup` stacks several. |
| `badge` | Badge | A small static label for a status, count or category. |
| `card` | Card, CardMedia, CardHeader, CardTitle, CardDescription, CardFooter | A container for media, a title, a description and actions. |
| `carousel` | Carousel, CarouselContent, CarouselSlide, CarouselThumbs, CarouselThumb, CarouselPrev, CarouselNext, CarouselPlayToggle, CarouselPagination, CarouselProgress, useCarousel, useLinkedCarousels | A draggable slider with autoplay, fade, thumbnails and pagination. |
| `collapsible` | Collapsible, CollapsibleTrigger, CollapsibleContent | 1 section that expands and collapses. |
| `compare-slider` | CompareSlider | 2 layers split by a draggable divider, for before and after. |
| `kbd` | Kbd, KbdGroup | A keyboard key, and groups of keys for shortcuts. |
| `sparkline` | Sparkline, SparklineChart, SparklineValue, SparklineLabel | A compact inline chart for a trend. The only chart in the library. |
| `table` | Table, TableCaption, TableHeader, TableBody, TableRow, TableHead, TableCell | A styled table for rows of data. |
| `thumbnail` | Thumbnail | A small preview tile for an image or icon, with a fallback. |

Sorting, filtering, selection and pagination are not a component. They are `table` wired to TanStack Table by
the Data Table recipe: `https://appica.dev/ui/components/react/data-table.md`.

## Decoration and effects

| Import | Exports | Use it for |
| --- | --- | --- |
| `background-pattern` | BackgroundPattern, patternCell | A decorative pattern behind content, with an optional cursor spotlight. |
| `border-beam` | BorderBeam | A comet of light that laps the border of its content. |
| `gradient-glow` | GradientGlow | A soft, drifting gradient glow around its content. |
| `text-animate` | TextAnimate | Text animated by character, word or line: typewriter, scramble, wave and more. |

## Layout

| Import | Exports | Use it for |
| --- | --- | --- |
| `scroll-area` | ScrollArea | A scroll container with themeable scrollbars. |
| `separator` | Separator | A thin horizontal or vertical line. |
| `splitter` | Splitter, SplitterPanel, SplitterHandle | Resizable panels separated by handles that drag or move with the keyboard. |

## Menus

| Import | Exports | Use it for |
| --- | --- | --- |
| `context-menu` | ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuGroup, ContextMenuGroupLabel, ContextMenuItem, ContextMenuLinkItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuCheckboxItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent | A menu that opens on right-click or long-press. |
| `dropdown-menu` | DropdownMenu, DropdownMenuFilterProvider, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuInput, DropdownMenuEmpty, DropdownMenuList, DropdownMenuGroup, DropdownMenuGroupLabel, DropdownMenuItem, DropdownMenuLinkItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuCheckboxItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent | A button that opens a menu of actions and options. |
| `menubar` | Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarLinkItem, MenubarGroup, MenubarGroupLabel, MenubarRadioGroup, MenubarRadioItem, MenubarCheckboxItem, MenubarSeparator, MenubarSub, MenubarSubTrigger, MenubarSubContent | A bar of menus for an app's top-level commands. |

## Navigation

| Import | Exports | Use it for |
| --- | --- | --- |
| `breadcrumb` | Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbEllipsis | The trail of links to the current page. |
| `navigation` | Navigation, NavigationList, NavigationItem, NavigationLink, navigationLinkVariants | Links between the main pages or sections, as a row or a column. |
| `navigation-menu` | NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuIcon, NavigationMenuContent, NavigationMenuLink, NavigationMenuPositioner, NavigationMenuViewport | A navigation bar whose items open panels of links. |
| `pagination` | Pagination, PaginationList, PaginationItem, PaginationLink, PaginationEllipsis | Page links for a long list. |
| `tabs` | Tabs, TabsList, TabsTrigger, TabsContent | Panels within 1 page, 1 shown at a time. |
| `toc` | Toc, TocList, TocItem, TocLink | An "on this page" list that tracks the section in view. |

## Overlays

| Import | Exports | Use it for |
| --- | --- | --- |
| `alert-dialog` | AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogBody, AlertDialogFooter, AlertDialogClose | A modal confirmation that demands a deliberate answer. |
| `command-palette` | CommandPalette, CommandPaletteTrigger, CommandPaletteContent, CommandPaletteInput, CommandPaletteList, CommandPaletteItem, CommandPaletteEmpty, CommandPaletteStatus, CommandPaletteGroup, CommandPaletteLabel, CommandPaletteCollection, CommandPaletteSeparator, CommandPaletteFooter | A searchable list of commands and pages in a dialog, opened by a click or a shortcut. |
| `dialog` | Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose | A modal window for a focused task. |
| `drawer` | Drawer, DrawerProvider, DrawerIndent, DrawerIndentBackground, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter, DrawerClose | A panel that slides in from a screen edge, with swipe to dismiss and snap points. |
| `popover` | Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose | A floating panel anchored to a trigger, for rich or interactive content. |
| `preview-card` | PreviewCard, PreviewCardTrigger, PreviewCardContent | A hover preview of a link's destination. |
| `tooltip` | Tooltip, TooltipTrigger, TooltipContent, TooltipProvider | A short hint on hover or focus that labels a control. |

## Status and feedback

| Import | Exports | Use it for |
| --- | --- | --- |
| `alert` | Alert, AlertIcon, AlertTitle, AlertDescription, AlertAction | A message that stays in the page to flag a status or event. |
| `countdown` | Countdown, CountdownSegment | A timer that counts down to a set time. |
| `loader` | Loader | An indeterminate bar or dots for a section that is loading. |
| `meter` | Meter, MeterLabel, MeterValue, MeterProgress | A measurement within a known range, such as a quota. Not task progress. |
| `progress` | Progress, ProgressLabel, ProgressValue | How far a long task has come. |
| `skeleton` | Skeleton | An animated placeholder in the shape of content that is loading. |
| `spinner` | Spinner | A compact spinning indicator, for a button or a tight spot. |
| `toast` | ToastProvider, Toaster, ToastViewport, ToastPortal, Toast, ToastIcon, ToastTitle, ToastDescription, ToastActions, ToastAction, ToastClose, ToastProgress, useToastManager, createToastManager | A brief notification that stacks in a corner. Needs `ToastProvider` and 1 `Toaster` at the root. |

## Providers and hooks

Docs for these are at `https://appica.dev/ui/docs/react/<last segment>.md`, for example
`https://appica.dev/ui/docs/react/use-theme.md`.

| Import | Exports | Use it for |
| --- | --- | --- |
| `providers/theme-provider` | ThemeProvider, ThemeScript, getThemeScript | Owns the theme, persists it, and prevents a flash of the wrong one on load. |
| `providers/direction-provider` | DirectionProvider | Tells the components that position themselves in JavaScript the reading direction. Right-to-left only. |
| `providers/reduced-motion-provider` | ReducedMotionProvider, useReducedMotionContext | Turns animation off for a subtree or the whole app. |
| `hooks/use-theme` | useTheme | Read and set the active theme. |
| `hooks/use-direction` | useDirection | Read the current text direction. |
| `hooks/use-media-query` | useMediaQuery | Subscribe to a CSS media query, safe on the server. |
| `hooks/use-local-storage` | useStorage, useLocalStorage, useSessionStorage | State persisted to storage and synced across tabs, safe on the server. |
| `hooks/use-dismissible` | useDismissible | Track and persist which banners or hints the user dismissed. |
| `hooks/use-reduced-motion` | useReducedMotion | Know when to skip a JavaScript animation. |
| `color` | getColorChannels, getChannelRange, getChannelValue, withChannelValue, getColorSpaceAxes, convertColor, getChannelName, formatChannelValue, parseColor, safeParseColor, formatColor | Parse, convert and format the color values the color components use. Docs: the `color-picker` page. |

## Which one?

| The request says | Use |
| --- | --- |
| a modal, a popup window | `dialog` |
| "are you sure?", a destructive confirmation | `alert-dialog` |
| a side panel, sheet, bottom sheet, filter drawer, mobile menu | `drawer` |
| a dropdown that sets a form value | `select` for a short fixed list, `combobox` when the list needs filtering or several picks |
| a search box with suggestions, free text allowed | `autocomplete` |
| a dropdown of actions, a user menu, a "more" menu | `dropdown-menu` |
| a right-click menu | `context-menu` |
| a Cmd+K launcher, command menu, global search | `command-palette` |
| a hint on hover | `tooltip` for a short label, `popover` when it holds anything interactive or has to work on touch, `preview-card` for a link preview |
| a tag or pill | `badge` for a static status or count, `chip` when it can be removed or selected |
| on or off | `switch` for a setting that applies at once, `checkbox` for a choice submitted with a form, `toggle` for a pressed-state button such as Bold |
| a segmented control | `toggle-group` to choose a value, `tabs` to switch panels, `button-group` to join actions |
| loading | `spinner` in a button or a tight spot, `loader` for a section, `skeleton` for a placeholder in the content's shape, `progress` when the percentage is known |
| a notification | `toast` when it is transient, `alert` when it stays in the page |
| page links in a sidebar or header | `navigation`, or `navigation-menu` when items open panels of links |
| a date | `date-picker` for a field with a calendar popup, `date-field` for typing only, `calendar` for a grid that is always visible |
| a data grid | `table` with the Data Table recipe |
| resizable panes | `splitter` |
| expandable sections | `accordion` for a set, `collapsible` for 1 |
| a chart | `sparkline` for a trend. For anything larger bring a chart library and color it with tokens |

## Names that are not components

No entry point has these names. Importing one fails.

| Looking for | Use |
| --- | --- |
| `modal` | `dialog` |
| `sheet`, `offcanvas` | `drawer` |
| `sidebar` | your own layout with `navigation` inside, and `drawer` on small screens |
| `label` | `FieldLabel` from `field` |
| `dropdown` | `select`, `combobox` or `dropdown-menu`, by what it picks |
| `menu` | `dropdown-menu`, `context-menu` or `menubar` |
| `tag`, `pill` | `badge` or `chip` |
| `hover-card` | `preview-card` |
| `command`, `cmdk` | `command-palette` |
| `resizable` | `splitter` |
| `sonner`, `toaster`, `notification` | `toast` |
| `input-otp` | `otp-field` |
| `segmented-control` | `toggle-group` |
| `data-table` | `table` with the Data Table recipe |
| `icons`, `icon` | the separate `@appica/icons-react` package |
| `utils`, `cn` | your own class helper. A `className` you pass to a component is already merged with its own |
| `stepper`, `timeline`, `tree`, `chart`, `file-upload` | what is in the catalog. The library has no such component |
