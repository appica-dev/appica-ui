'use client'

import * as React from 'react'
import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'
import { inputVariants } from '../input/input-variants'

type AutocompleteSize = 'sm' | 'md' | 'lg'
type AutocompleteVariant = 'outline' | 'soft'

interface AutocompleteContextValue {
  size: AutocompleteSize
  variant: AutocompleteVariant
  clearable: boolean
  icon: boolean
  grid: boolean
}

const AutocompleteContext = React.createContext<AutocompleteContextValue | null>(null)

function useAutocompleteContext() {
  const ctx = React.useContext(AutocompleteContext)
  if (!ctx) {
    throw new Error('Autocomplete sub-components must be rendered inside <Autocomplete>')
  }
  return ctx
}

type BaseAutocompleteRootProps = React.ComponentProps<typeof BaseAutocomplete.Root>

interface AutocompleteProps extends BaseAutocompleteRootProps {
  /**
   * Input height, popup radius, and item sizing.
   * @default 'md'
   */
  size?: AutocompleteSize
  /**
   * Input appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: AutocompleteVariant
  /**
   * Render a clear button inside the input when a value is present.
   * @default false
   */
  clearable?: boolean
  /**
   * Render a chevron button that toggles the popup.
   * @default false
   */
  icon?: boolean
}

function Autocomplete({
  size = 'md',
  variant = 'outline',
  clearable = false,
  icon = false,
  grid = false,
  children,
  ...rest
}: AutocompleteProps) {
  const ctx = React.useMemo<AutocompleteContextValue>(
    () => ({ size, variant, clearable, icon, grid }),
    [size, variant, clearable, icon, grid],
  )
  return (
    <AutocompleteContext.Provider value={ctx}>
      <BaseAutocomplete.Root grid={grid} {...rest}>
        {children}
      </BaseAutocomplete.Root>
    </AutocompleteContext.Provider>
  )
}

const ICON_SIZE: Record<AutocompleteSize, string> = {
  sm: 'size-4',
  md: 'size-4.5',
  lg: 'size-5',
}

interface AutocompleteInputProps extends Omit<React.ComponentProps<typeof BaseAutocomplete.Input>, 'size'> {
  /** Adornment rendered before the field, inside the input frame. */
  startSlot?: React.ReactNode
  /** Adornment rendered after the field, inside the input frame. */
  endSlot?: React.ReactNode
}

function AutocompleteInput({ className, startSlot, endSlot, placeholder, disabled, ...props }: AutocompleteInputProps) {
  const { size, variant, clearable, icon } = useAutocompleteContext()

  return (
    <BaseAutocomplete.InputGroup
      data-slot="autocomplete-input"
      className={cn(inputVariants({ variant, size, state: 'within' }), className)}
    >
      {startSlot && (
        <div data-slot="autocomplete-input-start" className="-ms-1 shrink-0">
          {startSlot}
        </div>
      )}
      <BaseAutocomplete.Input
        data-slot="autocomplete-input-field"
        placeholder={placeholder ?? ' '}
        disabled={disabled}
        className="peer text-foreground placeholder:text-foreground-subtle h-full min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
        {...props}
      />
      {clearable && <AutocompleteClearButton disabled={disabled} />}
      {endSlot && (
        <div data-slot="autocomplete-input-end" className="shrink-0">
          {endSlot}
        </div>
      )}
      {icon && <AutocompleteIconButton disabled={disabled} />}
    </BaseAutocomplete.InputGroup>
  )
}

function AutocompleteClearButton({ disabled }: { disabled?: boolean }) {
  return (
    <BaseAutocomplete.Clear
      data-slot="autocomplete-clear"
      aria-label="Clear selection"
      disabled={disabled}
      className="text-foreground-subtle hover:text-foreground shrink-0 cursor-pointer transition-colors duration-200 outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed motion-reduce:transition-none"
    >
      <ClearIcon className="size-[1em]" />
    </BaseAutocomplete.Clear>
  )
}

function AutocompleteIconButton({ disabled }: { disabled?: boolean }) {
  const { size } = useAutocompleteContext()
  return (
    <BaseAutocomplete.Trigger
      data-slot="autocomplete-icon"
      tabIndex={-1}
      aria-label="Toggle popup"
      disabled={disabled}
      className="group/autocomplete-icon text-foreground -me-1 shrink-0 cursor-pointer outline-none disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:cursor-not-allowed"
    >
      <ChevronDownIcon
        className={cn(
          ICON_SIZE[size],
          'motion-safe:transition-transform motion-safe:duration-200',
          'group-data-popup-open/autocomplete-icon:rotate-180',
        )}
      />
    </BaseAutocomplete.Trigger>
  )
}

type AutocompleteTriggerProps = React.ComponentProps<typeof BaseAutocomplete.Trigger>

function AutocompleteTrigger({ className, ...props }: AutocompleteTriggerProps) {
  return (
    <BaseAutocomplete.Trigger
      data-slot="autocomplete-trigger"
      className={cn(
        'cursor-pointer outline-none',
        'data-disabled:opacity-disabled data-disabled:pointer-events-none data-disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}

type AutocompleteValueProps = React.ComponentProps<typeof BaseAutocomplete.Value>

function AutocompleteValue(props: AutocompleteValueProps) {
  return <BaseAutocomplete.Value {...props} />
}

const POPUP_RADIUS: Record<AutocompleteSize, string> = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
}

type AutocompleteContentProps = React.ComponentProps<typeof BaseAutocomplete.Popup> &
  FloatingContentProps<
    React.ComponentProps<typeof BaseAutocomplete.Positioner>,
    React.ComponentProps<typeof BaseAutocomplete.Portal>
  >

function AutocompleteContent({ className, children, ...props }: AutocompleteContentProps) {
  const { size } = useAutocompleteContext()
  const { positioner, portal, popup } = splitFloatingProps(props)

  return (
    <BaseAutocomplete.Portal {...portal}>
      <BaseAutocomplete.Positioner
        sideOffset={6}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseAutocomplete.Popup
          data-slot="autocomplete-content"
          className={cn(
            'group/autocomplete-content bg-background border-border-overlay flex flex-col border py-2 shadow-2xl outline-none has-data-empty:py-0',
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
        </BaseAutocomplete.Popup>
      </BaseAutocomplete.Positioner>
    </BaseAutocomplete.Portal>
  )
}

interface AutocompleteListProps<T = any> extends Omit<React.ComponentProps<typeof BaseAutocomplete.List>, 'children'> {
  /** Items per row in grid mode (defaults to 2 when `grid` is set). */
  cols?: number
  /** A render function over the filtered items, or static `AutocompleteItem`s. */
  children?: React.ReactNode | ((item: T, index: number) => React.ReactNode)
}

const LIST_CLASSNAME = 'flex flex-col gap-0.5 px-2 min-h-0 flex-1 overflow-y-auto overscroll-contain'

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

function AutocompleteList<T = any>({ className, cols, children, ...props }: AutocompleteListProps<T>) {
  const { grid } = useAutocompleteContext()
  const effectiveCols = cols ?? (grid ? 2 : undefined)
  if (effectiveCols && effectiveCols > 1 && typeof children === 'function') {
    return (
      <BaseAutocomplete.List data-slot="autocomplete-list" className={cn(LIST_CLASSNAME, className)} {...props}>
        <AutocompleteGridRows cols={effectiveCols} render={children} />
      </BaseAutocomplete.List>
    )
  }
  return (
    <BaseAutocomplete.List data-slot="autocomplete-list" className={cn(LIST_CLASSNAME, className)} {...props}>
      {children as React.ComponentProps<typeof BaseAutocomplete.List>['children']}
    </BaseAutocomplete.List>
  )
}

function AutocompleteGridRows({
  cols,
  render,
}: {
  cols: number
  render: (item: any, index: number) => React.ReactNode
}) {
  const filtered = BaseAutocomplete.useFilteredItems<unknown>()
  const rows = React.useMemo(() => {
    const out: unknown[][] = []
    for (let i = 0; i < filtered.length; i += cols) out.push(filtered.slice(i, i + cols))
    return out
  }, [filtered, cols])
  return (
    <>
      {rows.map((row, rowIndex) => (
        <AutocompleteRow key={`row-${cellKey(row[0], rowIndex)}`}>
          {row.map((item, colIndex) => {
            const globalIndex = rowIndex * cols + colIndex
            return <React.Fragment key={cellKey(item, globalIndex)}>{render(item, globalIndex)}</React.Fragment>
          })}
        </AutocompleteRow>
      ))}
    </>
  )
}

interface AutocompleteRowProps extends React.ComponentProps<typeof BaseAutocomplete.Row> {}

function AutocompleteRow({ className, ...props }: AutocompleteRowProps) {
  return (
    <BaseAutocomplete.Row
      data-slot="autocomplete-row"
      className={cn('flex w-full items-stretch gap-0.5', className)}
      {...props}
    />
  )
}

const ITEM_SIZE: Record<AutocompleteSize, string> = {
  sm: "gap-1 rounded-xs py-1.5 px-2.5 text-xs has-data-[icon=end]:pe-1.5 has-data-[icon=start]:ps-1.5 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
  md: "gap-1.5 rounded-sm py-2 px-3 text-sm has-data-[icon=end]:pe-2 has-data-[icon=start]:ps-2 [&_svg:not([class*='size-'])]:size-4.5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
  lg: "gap-1.5 rounded-md py-2.5 px-3.5 text-base has-data-[icon=end]:pe-2.5 has-data-[icon=start]:ps-2.5 [&_svg:not([class*='size-'])]:size-5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
}

const ITEM_TEXT_SIZE: Record<AutocompleteSize, string> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-1.5',
}

interface AutocompleteItemProps extends React.ComponentProps<typeof BaseAutocomplete.Item> {}

function AutocompleteItem({ className, children, ...props }: AutocompleteItemProps) {
  const { size } = useAutocompleteContext()
  return (
    <BaseAutocomplete.Item
      data-slot="autocomplete-item"
      className={cn(
        'text-foreground relative isolate flex w-full cursor-default items-center outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0',
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
    </BaseAutocomplete.Item>
  )
}

const EMPTY_SIZE: Record<AutocompleteSize, string> = {
  sm: 'px-2.5 py-2 text-xs',
  md: 'px-3 py-2.5 text-sm',
  lg: 'px-3.5 py-3 text-base',
}

interface AutocompleteEmptyProps extends React.ComponentProps<typeof BaseAutocomplete.Empty> {}

function AutocompleteEmpty({ className, ...props }: AutocompleteEmptyProps) {
  const { size } = useAutocompleteContext()
  return (
    <BaseAutocomplete.Empty
      data-slot="autocomplete-empty"
      className={cn('text-foreground-muted text-center empty:p-0', EMPTY_SIZE[size], className)}
      {...props}
    />
  )
}

type AutocompleteStatusProps = React.ComponentProps<typeof BaseAutocomplete.Status>

function AutocompleteStatus({ className, ...props }: AutocompleteStatusProps) {
  const { size } = useAutocompleteContext()
  return (
    <BaseAutocomplete.Status
      data-slot="autocomplete-status"
      className={cn('text-foreground-muted text-center', EMPTY_SIZE[size], className)}
      {...props}
    />
  )
}

type AutocompleteGroupProps = React.ComponentProps<typeof BaseAutocomplete.Group>

function AutocompleteGroup(props: AutocompleteGroupProps) {
  return <BaseAutocomplete.Group data-slot="autocomplete-group" {...props} />
}

const GROUP_LABEL_SIZE: Record<AutocompleteSize, string> = {
  sm: 'px-2.5 pt-1.5 pb-1 text-xs',
  md: 'px-3 pt-2 pb-1.25 text-sm',
  lg: 'px-3.5 pt-2.5 pb-1.5 text-base',
}

type AutocompleteLabelProps = React.ComponentProps<typeof BaseAutocomplete.GroupLabel>

function AutocompleteLabel({ className, ...props }: AutocompleteLabelProps) {
  const { size } = useAutocompleteContext()
  return (
    <BaseAutocomplete.GroupLabel
      data-slot="autocomplete-label"
      className={cn('text-foreground-subtle', GROUP_LABEL_SIZE[size], className)}
      {...props}
    />
  )
}

type AutocompleteCollectionProps = React.ComponentProps<typeof BaseAutocomplete.Collection>

function AutocompleteCollection(props: AutocompleteCollectionProps) {
  return <BaseAutocomplete.Collection {...props} />
}

type AutocompleteSeparatorProps = React.ComponentProps<typeof BaseAutocomplete.Separator>

function AutocompleteSeparator({ className, ...props }: AutocompleteSeparatorProps) {
  return (
    <BaseAutocomplete.Separator
      data-slot="autocomplete-separator"
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

function ClearIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  )
}

export {
  Autocomplete,
  AutocompleteInput,
  AutocompleteTrigger,
  AutocompleteValue,
  AutocompleteContent,
  AutocompleteList,
  AutocompleteItem,
  AutocompleteEmpty,
  AutocompleteStatus,
  AutocompleteGroup,
  AutocompleteLabel,
  AutocompleteCollection,
  AutocompleteSeparator,
}
export type {
  AutocompleteProps,
  AutocompleteInputProps,
  AutocompleteTriggerProps,
  AutocompleteValueProps,
  AutocompleteContentProps,
  AutocompleteListProps,
  AutocompleteItemProps,
  AutocompleteEmptyProps,
  AutocompleteStatusProps,
  AutocompleteGroupProps,
  AutocompleteLabelProps,
  AutocompleteCollectionProps,
  AutocompleteSeparatorProps,
}
