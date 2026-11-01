'use client'

import * as React from 'react'
import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'
import { inputVariants } from '../input/input-variants'
import { buttonVariants } from '../button/button-variants'

type ComboboxSize = 'sm' | 'md' | 'lg'
type ComboboxVariant = 'outline' | 'soft'

interface ComboboxContextValue {
  size: ComboboxSize
  variant: ComboboxVariant
  clearable: boolean
  icon: boolean
  grid: boolean
  reducedMotion: boolean
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null)

function useComboboxContext() {
  const ctx = React.useContext(ComboboxContext)
  if (!ctx) {
    throw new Error('Combobox sub-components must be rendered inside <Combobox>')
  }
  return ctx
}

type ComboboxProps<
  Value = unknown,
  Multiple extends boolean | undefined = false,
  Item = Value,
> = BaseCombobox.Root.Props<Value, Multiple, Item> & ComboboxOwnProps

interface ComboboxOwnProps {
  /**
   * Input height, popup radius, and item sizing.
   * @default 'md'
   */
  size?: ComboboxSize
  /**
   * Input appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: ComboboxVariant
  /**
   * Render a clear button inside the input when a value is present.
   * @default false
   */
  clearable?: boolean
  /**
   * Render a chevron button that toggles the popup.
   * @default true
   */
  icon?: boolean
}

function Combobox<Value, Multiple extends boolean | undefined = false, Item = Value>({
  size = 'md',
  variant = 'outline',
  clearable = false,
  icon = true,
  grid = false,
  children,
  ...rest
}: ComboboxProps<Value, Multiple, Item>) {
  const reducedMotion = useReducedMotion()
  const ctx = React.useMemo<ComboboxContextValue>(
    () => ({ size, variant, clearable, icon, grid, reducedMotion }),
    [size, variant, clearable, icon, grid, reducedMotion],
  )
  return (
    <ComboboxContext value={ctx}>
      <BaseCombobox.Root grid={grid} {...rest}>
        {children}
      </BaseCombobox.Root>
    </ComboboxContext>
  )
}

const ICON_SIZE: Record<ComboboxSize, string> = {
  sm: 'size-4',
  md: 'size-4.5',
  lg: 'size-5',
}

interface ComboboxInputProps extends Omit<React.ComponentProps<typeof BaseCombobox.Input>, 'size'> {
  /** Adornment rendered before the field, inside the input frame. */
  startSlot?: React.ReactNode
  /** Adornment rendered after the field, before the controls. */
  endSlot?: React.ReactNode
}

function ComboboxInput({ className, startSlot, endSlot, placeholder, ...props }: ComboboxInputProps) {
  const { size, variant, clearable, icon } = useComboboxContext()
  const ariaInvalid = props['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  return (
    <BaseCombobox.InputGroup
      data-slot="combobox-input"
      className={cn(inputVariants({ variant, size, state: 'within' }), className)}
      {...(invalid ? { 'data-invalid': '' } : {})}
    >
      {startSlot && (
        <div data-slot="combobox-input-start" className="-ms-1 shrink-0">
          {startSlot}
        </div>
      )}
      <BaseCombobox.Input
        data-slot="combobox-input-field"
        placeholder={placeholder ?? ' '}
        className="peer text-foreground placeholder:text-foreground-subtle h-full min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
        {...props}
      />
      {clearable && <ComboboxClearButton />}
      {endSlot && (
        <div data-slot="combobox-input-end" className="shrink-0">
          {endSlot}
        </div>
      )}
      {icon && <ComboboxToggleButton />}
    </BaseCombobox.InputGroup>
  )
}

interface ComboboxChipsProps extends React.ComponentProps<typeof BaseCombobox.InputGroup> {
  /** Placeholder for the inline text field. */
  placeholder?: string
  /** Props forwarded to the inner text `input`. */
  inputProps?: Omit<React.ComponentProps<typeof BaseCombobox.Input>, 'placeholder'>
}

function ComboboxChips({ className, children, placeholder, inputProps, ...props }: ComboboxChipsProps) {
  const { size, variant, clearable, icon } = useComboboxContext()
  const hasControls = clearable || icon

  return (
    <BaseCombobox.InputGroup
      data-slot="combobox-chips"
      className={cn(
        'group/combobox-chips',
        inputVariants({ variant, size, state: 'within' }),
        'has-data-[slot=combobox-chip]:h-auto has-data-[slot=combobox-chip]:flex-wrap has-data-[slot=combobox-chip]:items-start has-data-[slot=combobox-chip]:p-1',
        CHIPS_FILLED_MIN_H[size],
        className,
      )}
      {...props}
    >
      <BaseCombobox.Chips
        data-slot="combobox-chips-list"
        className="flex h-full min-w-0 flex-1 flex-wrap items-center gap-1 **:data-[slot=combobox-input-field]:px-1"
      >
        {children}
        <BaseCombobox.Input
          data-slot="combobox-input-field"
          placeholder={placeholder ?? ' '}
          className="peer text-foreground placeholder:text-foreground-subtle min-w-15 flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
          {...inputProps}
        />
      </BaseCombobox.Chips>
      {hasControls && (
        <div
          data-slot="combobox-controls"
          className={cn('flex shrink-0 items-center gap-1', CONTROLS_FILLED_PAD[size])}
        >
          {clearable && <ComboboxClearButton />}
          {icon && <ComboboxToggleButton />}
        </div>
      )}
    </BaseCombobox.InputGroup>
  )
}

function ComboboxClearButton() {
  return (
    <BaseCombobox.Clear
      data-slot="combobox-clear"
      aria-label="Clear selection"
      className="text-foreground-subtle hover:text-foreground shrink-0 cursor-pointer transition-colors duration-200 outline-none motion-reduce:transition-none"
    >
      <ClearIcon className="size-[1em]" />
    </BaseCombobox.Clear>
  )
}

function ComboboxToggleButton() {
  const { size } = useComboboxContext()
  return (
    <BaseCombobox.Trigger
      data-slot="combobox-toggle"
      tabIndex={-1}
      aria-label="Toggle popup"
      className="group/combobox-toggle text-foreground -me-1 shrink-0 cursor-pointer outline-none disabled:cursor-not-allowed"
    >
      <ChevronDownIcon
        className={cn(
          ICON_SIZE[size],
          'motion-safe:transition-transform motion-safe:duration-200',
          'group-data-popup-open/combobox-toggle:rotate-180',
        )}
      />
    </BaseCombobox.Trigger>
  )
}

interface ComboboxTriggerProps extends React.ComponentProps<typeof BaseCombobox.Trigger> {
  /** Adornment before the value, inside the trigger frame. */
  startSlot?: React.ReactNode
  /** Adornment after the value, before the chevron. */
  endSlot?: React.ReactNode
}

function ComboboxTrigger({ className, startSlot, endSlot, children, ...props }: ComboboxTriggerProps) {
  const { size, variant } = useComboboxContext()

  return (
    <BaseCombobox.Trigger
      data-slot="combobox-trigger"
      className={cn(
        'group/combobox-trigger',
        inputVariants({ variant, size, state: 'self' }),
        'data-placeholder:text-foreground-subtle flex items-center justify-between',
        className,
      )}
      {...props}
    >
      {startSlot && (
        <span data-slot="combobox-trigger-start" className="-ms-1 shrink-0">
          {startSlot}
        </span>
      )}
      <span className="flex min-w-0 flex-1 items-center truncate text-start">{children}</span>
      {endSlot && (
        <span data-slot="combobox-trigger-end" className="shrink-0">
          {endSlot}
        </span>
      )}
      <BaseCombobox.Icon
        data-slot="combobox-icon"
        className={cn(
          ICON_SIZE[size],
          'text-foreground -me-1 shrink-0',
          'motion-safe:transition-transform motion-safe:duration-200',
          'group-data-popup-open/combobox-trigger:rotate-180',
        )}
        render={<ChevronDownIcon />}
      />
    </BaseCombobox.Trigger>
  )
}

type ComboboxValueProps = React.ComponentProps<typeof BaseCombobox.Value>

function ComboboxValue(props: ComboboxValueProps) {
  return <BaseCombobox.Value {...props} />
}

const CHIP_SIZE: Record<ComboboxSize, string> = {
  sm: 'h-6 px-2 text-xs rounded-xs gap-1',
  md: 'h-8 px-3 text-sm rounded-sm gap-1.5',
  lg: 'h-10 px-3.5 text-base rounded-md gap-1.5',
}

const CHIPS_FILLED_MIN_H: Record<ComboboxSize, string> = {
  sm: 'has-data-[slot=combobox-chip]:min-h-8',
  md: 'has-data-[slot=combobox-chip]:min-h-10',
  lg: 'has-data-[slot=combobox-chip]:min-h-12',
}

const CONTROLS_FILLED_PAD: Record<ComboboxSize, string> = {
  sm: cn(
    'group-has-data-[slot=combobox-chip]/combobox-chips:pt-1',
    'group-has-data-[slot=combobox-chip]/combobox-chips:pe-2',
  ),
  md: cn(
    'group-has-data-[slot=combobox-chip]/combobox-chips:pt-1.5',
    'group-has-data-[slot=combobox-chip]/combobox-chips:pe-2.5',
  ),
  lg: cn(
    'group-has-data-[slot=combobox-chip]/combobox-chips:pt-2.5',
    'group-has-data-[slot=combobox-chip]/combobox-chips:pe-3',
  ),
}

const CHIP_BUTTON_VARIANT: Record<ComboboxVariant, 'soft' | 'outline'> = {
  outline: 'soft',
  soft: 'outline',
}

interface ComboboxChipProps extends React.ComponentProps<typeof BaseCombobox.Chip> {}

function ComboboxChip({ className, children, ...props }: ComboboxChipProps) {
  const { size, variant } = useComboboxContext()
  return (
    <BaseCombobox.Chip
      data-slot="combobox-chip"
      className={cn(
        buttonVariants({ variant: CHIP_BUTTON_VARIANT[variant], size }),
        CHIP_SIZE[size],
        'text-foreground-strong cursor-default font-normal',
        className,
      )}
      {...props}
    >
      <span className="min-w-0 truncate">{children}</span>
      <BaseCombobox.ChipRemove
        data-slot="combobox-chip-remove"
        aria-label="Remove"
        className="text-foreground-subtle hover:text-foreground -me-0.5 shrink-0 cursor-pointer transition-colors duration-200 outline-none motion-reduce:transition-none"
      >
        <ClearIcon className="size-[1em]" />
      </BaseCombobox.ChipRemove>
    </BaseCombobox.Chip>
  )
}

const POPUP_RADIUS: Record<ComboboxSize, string> = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
}

type ComboboxContentProps = React.ComponentProps<typeof BaseCombobox.Popup> &
  FloatingContentProps<
    React.ComponentProps<typeof BaseCombobox.Positioner>,
    React.ComponentProps<typeof BaseCombobox.Portal>
  >

function ComboboxContent({ className, children, ...props }: ComboboxContentProps) {
  const { size } = useComboboxContext()
  const { positioner, portal, popup } = splitFloatingProps(props)

  return (
    <BaseCombobox.Portal {...portal}>
      <BaseCombobox.Positioner
        sideOffset={6}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseCombobox.Popup
          data-slot="combobox-content"
          className={cn(
            'group/combobox-content bg-background border-border-overlay flex flex-col border py-2 shadow-2xl outline-none has-data-empty:py-0',
            POPUP_RADIUS[size],
            'w-(--anchor-width) min-w-36',
            'max-h-(--available-height) overflow-hidden',
            'origin-(--transform-origin)',
            'motion-safe:ease-spring motion-safe:transition-[opacity,scale] motion-safe:duration-200',
            'data-starting-style:motion-safe:scale-90 data-starting-style:motion-safe:opacity-0',
            'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
            className,
          )}
          {...popup}
        >
          {children}
        </BaseCombobox.Popup>
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  )
}

interface ComboboxListProps<T = any> extends Omit<React.ComponentProps<typeof BaseCombobox.List>, 'children'> {
  /** Items per row in grid mode (defaults to 2 when `grid` is set). */
  cols?: number
  /** A render function over the filtered items, or static `ComboboxItem`s. */
  children?: React.ReactNode | ((item: T, index: number) => React.ReactNode)
}

const COMBOBOX_LIST_CLASSNAME = 'flex flex-col gap-0.5 px-2 min-h-0 flex-1 overflow-y-auto overscroll-contain'

function ComboboxList<T = any>({ className, cols, children, ...props }: ComboboxListProps<T>) {
  const { grid } = useComboboxContext()
  const effectiveCols = cols ?? (grid ? 2 : undefined)
  if (effectiveCols && effectiveCols > 1 && typeof children === 'function') {
    return (
      <BaseCombobox.List data-slot="combobox-list" className={cn(COMBOBOX_LIST_CLASSNAME, className)} {...props}>
        <ComboboxGridRows cols={effectiveCols} render={children} />
      </BaseCombobox.List>
    )
  }
  return (
    <BaseCombobox.List data-slot="combobox-list" className={cn(COMBOBOX_LIST_CLASSNAME, className)} {...props}>
      {children as React.ComponentProps<typeof BaseCombobox.List>['children']}
    </BaseCombobox.List>
  )
}

function cellKey(item: unknown, fallback: number): React.Key {
  if (item == null) return fallback
  if (typeof item === 'object') {
    const rec = item as Record<string, unknown>
    const candidate = rec.value ?? rec.id ?? rec.key
    if (typeof candidate === 'string' || typeof candidate === 'number') return candidate
    return fallback
  }
  return item as React.Key
}

function ComboboxGridRows({ cols, render }: { cols: number; render: (item: any, index: number) => React.ReactNode }) {
  const filtered = BaseCombobox.useFilteredItems<unknown>()
  const rows = React.useMemo(() => {
    const out: unknown[][] = []
    for (let i = 0; i < filtered.length; i += cols) out.push(filtered.slice(i, i + cols))
    return out
  }, [filtered, cols])
  return (
    <>
      {rows.map((row, rowIndex) => (
        <ComboboxRow key={`row-${cellKey(row[0], rowIndex)}`}>
          {row.map((item, colIndex) => {
            const globalIndex = rowIndex * cols + colIndex
            return <React.Fragment key={cellKey(item, globalIndex)}>{render(item, globalIndex)}</React.Fragment>
          })}
        </ComboboxRow>
      ))}
    </>
  )
}

interface ComboboxRowProps extends React.ComponentProps<typeof BaseCombobox.Row> {}

function ComboboxRow({ className, ...props }: ComboboxRowProps) {
  return (
    <BaseCombobox.Row
      data-slot="combobox-row"
      className={cn('flex w-full items-stretch gap-0.5', className)}
      {...props}
    />
  )
}

const ITEM_SIZE: Record<ComboboxSize, string> = {
  sm: "gap-1 rounded-xs py-1.5 px-2.5 text-xs has-data-[icon=end]:pe-1.5 has-data-[icon=start]:ps-1.5 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
  md: "gap-1.5 rounded-sm py-2 px-3 text-sm has-data-[icon=end]:pe-2 has-data-[icon=start]:ps-2 [&_svg:not([class*='size-'])]:size-4.5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
  lg: "gap-1.5 rounded-md py-2.5 px-3.5 text-base has-data-[icon=end]:pe-2.5 has-data-[icon=start]:ps-2.5 [&_svg:not([class*='size-'])]:size-5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
}

const ITEM_TEXT_SIZE: Record<ComboboxSize, string> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-1.5',
}

interface ComboboxItemProps extends React.ComponentProps<typeof BaseCombobox.Item> {}

function ComboboxItem({ className, children, ...props }: ComboboxItemProps) {
  const { size, reducedMotion } = useComboboxContext()
  return (
    <BaseCombobox.Item
      data-slot="combobox-item"
      className={cn(
        'text-foreground relative isolate flex w-full cursor-default items-center justify-between outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
        'before:bg-background-muted before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0',
        'active:translate-y-px active:scale-[0.98]',
        'data-highlighted:not-data-disabled:text-foreground-intense data-highlighted:not-data-disabled:before:opacity-100',
        'motion-safe:ease-spring motion-safe:transition motion-safe:duration-250',
        'motion-safe:active:duration-100 motion-safe:active:ease-in-out',
        'motion-safe:before:transition-opacity motion-safe:before:duration-200 motion-safe:before:ease-out',
        'data-disabled:opacity-disabled data-disabled:pointer-events-none',
        ITEM_SIZE[size],
        className,
      )}
      {...props}
    >
      <span className={cn('flex items-center text-start', ITEM_TEXT_SIZE[size])}>{children}</span>
      <BaseCombobox.ItemIndicator
        data-slot="combobox-item-indicator"
        keepMounted={!reducedMotion}
        className="group/check text-foreground-intense shrink-0"
      >
        <CheckIcon data-icon="end" className="me-0.5 size-[1.125em]" />
      </BaseCombobox.ItemIndicator>
    </BaseCombobox.Item>
  )
}

interface ComboboxEmptyProps extends React.ComponentProps<typeof BaseCombobox.Empty> {}

const EMPTY_SIZE: Record<ComboboxSize, string> = {
  sm: 'px-2.5 py-2 text-xs',
  md: 'px-3 py-2.5 text-sm',
  lg: 'px-3.5 py-3 text-base',
}

function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  const { size } = useComboboxContext()
  return (
    <BaseCombobox.Empty
      data-slot="combobox-empty"
      className={cn('text-foreground-muted text-center empty:p-0', EMPTY_SIZE[size], className)}
      {...props}
    />
  )
}

type ComboboxGroupProps = React.ComponentProps<typeof BaseCombobox.Group>

function ComboboxGroup(props: ComboboxGroupProps) {
  return <BaseCombobox.Group data-slot="combobox-group" {...props} />
}

const GROUP_LABEL_SIZE: Record<ComboboxSize, string> = {
  sm: 'px-2.5 pt-1.5 pb-1 text-xs',
  md: 'px-3 pt-2 pb-1.25 text-sm',
  lg: 'px-3.5 pt-2.5 pb-1.5 text-base',
}

type ComboboxLabelProps = React.ComponentProps<typeof BaseCombobox.GroupLabel>

function ComboboxLabel({ className, ...props }: ComboboxLabelProps) {
  const { size } = useComboboxContext()
  return (
    <BaseCombobox.GroupLabel
      data-slot="combobox-label"
      className={cn('text-foreground-subtle', GROUP_LABEL_SIZE[size], className)}
      {...props}
    />
  )
}

type ComboboxCollectionProps = React.ComponentProps<typeof BaseCombobox.Collection>

function ComboboxCollection(props: ComboboxCollectionProps) {
  return <BaseCombobox.Collection {...props} />
}

type ComboboxSeparatorProps = React.ComponentProps<typeof BaseCombobox.Separator>

function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  return (
    <BaseCombobox.Separator
      data-slot="combobox-separator"
      className={cn('bg-border -mx-2 my-1.5 h-px shrink-0', className)}
      {...props}
    />
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

function ChevronDownIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M11.594 5.594c.225-.225.588-.225.813 0s.225.588 0 .813l-4 4c-.225.225-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812s.588-.225.812 0L8 9.187l3.594-3.594z" />
    </svg>
  )
}

function CheckIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('stroke-2', className)}
      {...props}
    >
      <path
        d="M4.3 12.55 L9.25 17.5 L19.7 6.5"
        pathLength={1}
        strokeDasharray="1 2"
        className={cn(
          'opacity-0 [stroke-dashoffset:1.02]',
          'group-data-selected/check:opacity-100 group-data-selected/check:[stroke-dashoffset:0]',
          'motion-safe:transition-[opacity,stroke-dashoffset] motion-safe:ease-out',
          'motion-safe:delay-[0ms,150ms] motion-safe:duration-[150ms,0ms]',
          'motion-safe:group-data-selected/check:delay-[0ms] motion-safe:group-data-selected/check:duration-[0ms,300ms]',
        )}
      />
    </svg>
  )
}

function ClearIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  )
}

const createComboboxItems = BaseCombobox.createItems

export {
  Combobox,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxChips,
  ComboboxValue,
  ComboboxChip,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxSeparator,
  createComboboxItems,
}
export type {
  ComboboxProps,
  ComboboxInputProps,
  ComboboxTriggerProps,
  ComboboxChipsProps,
  ComboboxValueProps,
  ComboboxChipProps,
  ComboboxContentProps,
  ComboboxListProps,
  ComboboxItemProps,
  ComboboxEmptyProps,
  ComboboxGroupProps,
  ComboboxLabelProps,
  ComboboxCollectionProps,
  ComboboxSeparatorProps,
}
