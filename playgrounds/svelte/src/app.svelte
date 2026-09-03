<script lang="ts">
  import type { Component } from 'svelte'
  import { Button, useTheme } from '@appica/ui-svelte'
  import AccordionScreen from './screens/accordion-screen.svelte'
  import AlertScreen from './screens/alert-screen.svelte'
  import AlertDialogScreen from './screens/alert-dialog-screen.svelte'
  import AutocompleteScreen from './screens/autocomplete-screen.svelte'
  import AvatarScreen from './screens/avatar-screen.svelte'
  import BackgroundPatternScreen from './screens/background-pattern-screen.svelte'
  import BadgeScreen from './screens/badge-screen.svelte'
  import BorderBeamScreen from './screens/border-beam-screen.svelte'
  import BreadcrumbScreen from './screens/breadcrumb-screen.svelte'
  import ButtonScreen from './screens/button-screen.svelte'
  import ButtonGroupScreen from './screens/button-group-screen.svelte'
  import CalendarScreen from './screens/calendar-screen.svelte'
  import CardScreen from './screens/card-screen.svelte'
  import CarouselScreen from './screens/carousel-screen.svelte'
  import CheckboxScreen from './screens/checkbox-screen.svelte'
  import ChipScreen from './screens/chip-screen.svelte'
  import CollapsibleScreen from './screens/collapsible-screen.svelte'
  import ColorAreaScreen from './screens/color-area-screen.svelte'
  import ColorPickerScreen from './screens/color-picker-screen.svelte'
  import ColorSliderScreen from './screens/color-slider-screen.svelte'
  import ColorSwatchScreen from './screens/color-swatch-screen.svelte'
  import ColorSwatchPickerScreen from './screens/color-swatch-picker-screen.svelte'
  import ComboboxScreen from './screens/combobox-screen.svelte'
  import ContextMenuScreen from './screens/context-menu-screen.svelte'
  import CopyButtonScreen from './screens/copy-button-screen.svelte'
  import CountdownScreen from './screens/countdown-screen.svelte'
  import DateFieldScreen from './screens/date-field-screen.svelte'
  import DatePickerScreen from './screens/date-picker-screen.svelte'
  import DialogScreen from './screens/dialog-screen.svelte'
  import DrawerScreen from './screens/drawer-screen.svelte'
  import DropdownMenuScreen from './screens/dropdown-menu-screen.svelte'
  import FieldScreen from './screens/field-screen.svelte'
  import FieldsetScreen from './screens/fieldset-screen.svelte'
  import FormScreen from './screens/form-screen.svelte'
  import GradientGlowScreen from './screens/gradient-glow-screen.svelte'
  import InputScreen from './screens/input-screen.svelte'
  import KbdScreen from './screens/kbd-screen.svelte'
  import LoaderScreen from './screens/loader-screen.svelte'
  import MeterScreen from './screens/meter-screen.svelte'
  import MenubarScreen from './screens/menubar-screen.svelte'
  import NavigationScreen from './screens/navigation-screen.svelte'
  import NavigationMenuScreen from './screens/navigation-menu-screen.svelte'
  import NumberFieldScreen from './screens/number-field-screen.svelte'
  import OtpFieldScreen from './screens/otp-field-screen.svelte'
  import PaginationScreen from './screens/pagination-screen.svelte'
  import PopoverScreen from './screens/popover-screen.svelte'
  import PreviewCardScreen from './screens/preview-card-screen.svelte'
  import ProgressScreen from './screens/progress-screen.svelte'
  import RadioScreen from './screens/radio-screen.svelte'
  import RatingScreen from './screens/rating-screen.svelte'
  import ScrollAreaScreen from './screens/scroll-area-screen.svelte'
  import SelectScreen from './screens/select-screen.svelte'
  import SeparatorScreen from './screens/separator-screen.svelte'
  import SkeletonScreen from './screens/skeleton-screen.svelte'
  import SliderScreen from './screens/slider-screen.svelte'
  import SparklineScreen from './screens/sparkline-screen.svelte'
  import SpinnerScreen from './screens/spinner-screen.svelte'
  import SwitchScreen from './screens/switch-screen.svelte'
  import TableScreen from './screens/table-screen.svelte'
  import TabsScreen from './screens/tabs-screen.svelte'
  import TextAnimateScreen from './screens/text-animate-screen.svelte'
  import TextareaScreen from './screens/textarea-screen.svelte'
  import TimeFieldScreen from './screens/time-field-screen.svelte'
  import ThumbnailScreen from './screens/thumbnail-screen.svelte'
  import ToastScreen from './screens/toast-screen.svelte'
  import TocScreen from './screens/toc-screen.svelte'
  import ToggleScreen from './screens/toggle-screen.svelte'
  import ToolbarScreen from './screens/toolbar-screen.svelte'
  import TooltipScreen from './screens/tooltip-screen.svelte'

  const screens = [
    { id: 'button', label: 'Button' },
    { id: 'button-group', label: 'ButtonGroup' },
    { id: 'badge', label: 'Badge' },
    { id: 'border-beam', label: 'BorderBeam' },
    { id: 'breadcrumb', label: 'Breadcrumb' },
    { id: 'accordion', label: 'Accordion' },
    { id: 'alert', label: 'Alert' },
    { id: 'alert-dialog', label: 'AlertDialog' },
    { id: 'autocomplete', label: 'Autocomplete' },
    { id: 'avatar', label: 'Avatar' },
    { id: 'background-pattern', label: 'BackgroundPattern' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'card', label: 'Card' },
    { id: 'carousel', label: 'Carousel' },
    { id: 'checkbox', label: 'Checkbox' },
    { id: 'chip', label: 'Chip' },
    { id: 'collapsible', label: 'Collapsible' },
    { id: 'color-area', label: 'ColorArea' },
    { id: 'color-picker', label: 'ColorPicker' },
    { id: 'color-slider', label: 'ColorSlider' },
    { id: 'color-swatch', label: 'ColorSwatch' },
    { id: 'color-swatch-picker', label: 'ColorSwatchPicker' },
    { id: 'combobox', label: 'Combobox' },
    { id: 'context-menu', label: 'ContextMenu' },
    { id: 'copy-button', label: 'CopyButton' },
    { id: 'countdown', label: 'Countdown' },
    { id: 'date-field', label: 'DateField' },
    { id: 'date-picker', label: 'DatePicker' },
    { id: 'dialog', label: 'Dialog' },
    { id: 'drawer', label: 'Drawer' },
    { id: 'dropdown-menu', label: 'DropdownMenu' },
    { id: 'field', label: 'Field' },
    { id: 'fieldset', label: 'Fieldset' },
    { id: 'form', label: 'Form' },
    { id: 'gradient-glow', label: 'GradientGlow' },
    { id: 'input', label: 'Input' },
    { id: 'textarea', label: 'Textarea' },
    { id: 'time-field', label: 'TimeField' },
    { id: 'kbd', label: 'Kbd' },
    { id: 'loader', label: 'Loader' },
    { id: 'meter', label: 'Meter' },
    { id: 'menubar', label: 'Menubar' },
    { id: 'navigation', label: 'Navigation' },
    { id: 'navigation-menu', label: 'NavigationMenu' },
    { id: 'number-field', label: 'NumberField' },
    { id: 'otp-field', label: 'OTPField' },
    { id: 'pagination', label: 'Pagination' },
    { id: 'popover', label: 'Popover' },
    { id: 'preview-card', label: 'PreviewCard' },
    { id: 'progress', label: 'Progress' },
    { id: 'radio', label: 'Radio' },
    { id: 'rating', label: 'Rating' },
    { id: 'scroll-area', label: 'ScrollArea' },
    { id: 'select', label: 'Select' },
    { id: 'separator', label: 'Separator' },
    { id: 'skeleton', label: 'Skeleton' },
    { id: 'slider', label: 'Slider' },
    { id: 'sparkline', label: 'Sparkline' },
    { id: 'spinner', label: 'Spinner' },
    { id: 'switch', label: 'Switch' },
    { id: 'table', label: 'Table' },
    { id: 'tabs', label: 'Tabs' },
    { id: 'text-animate', label: 'TextAnimate' },
    { id: 'thumbnail', label: 'Thumbnail' },
    { id: 'toast', label: 'Toast' },
    { id: 'toc', label: 'Toc' },
    { id: 'toggle', label: 'Toggle' },
    { id: 'toolbar', label: 'Toolbar' },
    { id: 'tooltip', label: 'Tooltip' },
  ] as const

  type ScreenId = (typeof screens)[number]['id']

  const views: Record<ScreenId, Component> = {
    button: ButtonScreen,
    'button-group': ButtonGroupScreen,
    badge: BadgeScreen,
    'border-beam': BorderBeamScreen,
    breadcrumb: BreadcrumbScreen,
    accordion: AccordionScreen,
    alert: AlertScreen,
    'alert-dialog': AlertDialogScreen,
    autocomplete: AutocompleteScreen,
    avatar: AvatarScreen,
    'background-pattern': BackgroundPatternScreen,
    calendar: CalendarScreen,
    card: CardScreen,
    carousel: CarouselScreen,
    checkbox: CheckboxScreen,
    chip: ChipScreen,
    collapsible: CollapsibleScreen,
    'color-area': ColorAreaScreen,
    'color-picker': ColorPickerScreen,
    'color-slider': ColorSliderScreen,
    'color-swatch': ColorSwatchScreen,
    'color-swatch-picker': ColorSwatchPickerScreen,
    combobox: ComboboxScreen,
    'context-menu': ContextMenuScreen,
    'copy-button': CopyButtonScreen,
    countdown: CountdownScreen,
    'date-field': DateFieldScreen,
    'date-picker': DatePickerScreen,
    dialog: DialogScreen,
    drawer: DrawerScreen,
    'dropdown-menu': DropdownMenuScreen,
    field: FieldScreen,
    fieldset: FieldsetScreen,
    form: FormScreen,
    'gradient-glow': GradientGlowScreen,
    input: InputScreen,
    textarea: TextareaScreen,
    'time-field': TimeFieldScreen,
    kbd: KbdScreen,
    loader: LoaderScreen,
    meter: MeterScreen,
    menubar: MenubarScreen,
    navigation: NavigationScreen,
    'navigation-menu': NavigationMenuScreen,
    'number-field': NumberFieldScreen,
    'otp-field': OtpFieldScreen,
    pagination: PaginationScreen,
    popover: PopoverScreen,
    'preview-card': PreviewCardScreen,
    progress: ProgressScreen,
    radio: RadioScreen,
    rating: RatingScreen,
    'scroll-area': ScrollAreaScreen,
    select: SelectScreen,
    separator: SeparatorScreen,
    skeleton: SkeletonScreen,
    slider: SliderScreen,
    sparkline: SparklineScreen,
    spinner: SpinnerScreen,
    switch: SwitchScreen,
    table: TableScreen,
    tabs: TabsScreen,
    'text-animate': TextAnimateScreen,
    thumbnail: ThumbnailScreen,
    toast: ToastScreen,
    toc: TocScreen,
    toggle: ToggleScreen,
    toolbar: ToolbarScreen,
    tooltip: TooltipScreen,
  }

  let screen: ScreenId = $state('button')
  const theme = useTheme()
  const Screen = $derived(views[screen])

  function toggleTheme() {
    theme.setTheme(theme.resolvedTheme === 'dark' ? 'light' : 'dark')
  }
</script>

<main class="text-foreground bg-background mx-auto flex min-h-dvh max-w-4xl flex-col gap-8 px-6 py-12">
  <header class="flex items-start justify-between gap-4">
    <div>
      <h1 class="text-foreground-intense text-3xl font-semibold">Appica UI Svelte Playground</h1>
      <p class="text-foreground-muted mt-1 text-sm">
        Wave 1 and Wave 2 primitives - edit <code>packages/svelte/src</code> and it hot-reloads.
      </p>
    </div>
    <Button
      variant="outline"
      size="icon-md"
      onclick={toggleTheme}
      aria-label={theme.resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      ◑
    </Button>
  </header>

  <nav class="flex flex-wrap gap-2" aria-label="Component screens">
    {#each screens as item (item.id)}
      <Button variant={screen === item.id ? 'primary' : 'soft'} size="sm" onclick={() => (screen = item.id)}>
        {item.label}
      </Button>
    {/each}
  </nav>

  <Screen />
</main>
