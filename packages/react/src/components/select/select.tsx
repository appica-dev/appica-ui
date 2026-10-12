'use client'

import * as React from 'react'
import { Select as BaseSelect } from '@base-ui/react/select'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'
import { inputVariants } from '../input/input-variants'

type SelectSize = 'sm' | 'md' | 'lg'
type SelectVariant = 'outline' | 'soft'

interface SelectContextValue {
  size: SelectSize
  variant: SelectVariant
  alignItemWithTrigger: boolean
  hasValue: boolean
  clear: (event?: React.SyntheticEvent) => void
  multiple: boolean
  reducedMotion: boolean
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) {
    throw new Error('Select sub-components must be rendered inside <Select>')
  }
  return ctx
}

type BaseSelectRootProps = React.ComponentProps<typeof BaseSelect.Root>

interface SelectProps extends BaseSelectRootProps {
  /**
   * Trigger height, popup radius, and item sizing.
   * @default 'md'
   */
  size?: SelectSize
  /**
   * Trigger appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: SelectVariant
  /**
   * Overlay the selected item over the trigger on open. **Set `false` when using a `startSlot`.**
   * @default true
   */
  alignItemWithTrigger?: boolean
}

function Select({
  size = 'md',
  variant = 'outline',
  alignItemWithTrigger = true,
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  children,
  ...rest
}: SelectProps) {
  const reducedMotion = useReducedMotion()
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<unknown>(defaultValue ?? (multiple ? [] : null))
  const current = isControlled ? value : internal

  const hasValue = multiple
    ? Array.isArray(current) && current.length > 0
    : current !== null && current !== undefined && current !== ''

  const handleChange = React.useCallback<NonNullable<BaseSelectRootProps['onValueChange']>>(
    (next, details) => {
      if (!isControlled) {
        setInternal(next)
      }
      onValueChange?.(next, details)
    },
    [isControlled, onValueChange],
  )

  const clear = React.useCallback(
    (event?: React.SyntheticEvent) => {
      const next = multiple ? [] : null
      const details = {
        reason: 'none',
        event: event?.nativeEvent ?? new Event('clear'),
        trigger: undefined,
        cancel: () => {},
        allowPropagation: () => {},
        isCanceled: false,
        isPropagationAllowed: false,
      }
      handleChange(next as never, details as never)
    },
    [multiple, handleChange],
  )

  const ctx = React.useMemo<SelectContextValue>(
    () => ({ size, variant, alignItemWithTrigger, hasValue, clear, multiple, reducedMotion }),
    [size, variant, alignItemWithTrigger, hasValue, clear, multiple, reducedMotion],
  )

  return (
    <SelectContext.Provider value={ctx}>
      <BaseSelect.Root value={current as never} onValueChange={handleChange} multiple={multiple as never} {...rest}>
        {children}
      </BaseSelect.Root>
    </SelectContext.Provider>
  )
}

const ICON_SIZE: Record<SelectSize, string> = {
  sm: 'size-4',
  md: 'size-4.5',
  lg: 'size-5',
}

interface SelectTriggerProps extends React.ComponentProps<typeof BaseSelect.Trigger> {
  /**
   * Render a clear button inside the trigger when a value is present.
   * @default false
   */
  clearable?: boolean
  /** Adornment before the value. Pair with `alignItemWithTrigger={false}`. */
  startSlot?: React.ReactNode
  /** Adornment after the value, before the chevron. */
  endSlot?: React.ReactNode
}

function SelectTrigger({
  className,
  clearable,
  startSlot,
  endSlot,
  children,
  onKeyDown,
  ...props
}: SelectTriggerProps) {
  const { size, variant, alignItemWithTrigger, hasValue, clear } = useSelectContext()
  const iconSize = ICON_SIZE[size]
  const ariaInvalid = props['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'
  const canClear = clearable && hasValue

  const handleKeyDown: NonNullable<SelectTriggerProps['onKeyDown']> = (event) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (canClear && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault()
      clear(event)
    }
  }

  return (
    <BaseSelect.Trigger
      data-slot="select-trigger"
      className={cn(
        inputVariants({ variant, size, state: 'self' }),
        'data-placeholder:text-foreground-subtle flex items-center justify-between',
        className,
      )}
      {...props}
      onKeyDown={handleKeyDown}
      {...(invalid ? { 'data-invalid': '' } : {})}
    >
      {startSlot && (
        <span data-slot="select-trigger-start" className="-ms-1 shrink-0">
          {startSlot}
        </span>
      )}
      <span className="flex min-w-0 flex-1 items-center truncate text-start">{children}</span>
      {canClear ? (
        <span
          data-slot="select-clear"
          aria-hidden="true"
          onPointerDown={(event) => {
            event.stopPropagation()
            event.nativeEvent.stopImmediatePropagation()
            event.preventDefault()
            clear(event)
          }}
          onClick={(event) => {
            event.stopPropagation()
            event.nativeEvent.stopImmediatePropagation()
          }}
          className="text-foreground-subtle hover:text-foreground shrink-0 cursor-pointer transition-colors duration-200 motion-reduce:transition-none"
        >
          <ClearIcon className="size-[1em]" />
        </span>
      ) : null}
      {endSlot && (
        <span data-slot="select-trigger-end" className="shrink-0">
          {endSlot}
        </span>
      )}
      <BaseSelect.Icon
        data-slot="select-icon"
        className="text-foreground -me-1 shrink-0"
        render={
          alignItemWithTrigger ? (
            <ChevronsIcon className={iconSize} />
          ) : (
            <ChevronDownIcon
              className={cn(
                iconSize,
                'motion-safe:transition-transform motion-safe:duration-200',
                'data-popup-open:rotate-180',
              )}
            />
          )
        }
      />
    </BaseSelect.Trigger>
  )
}

type SelectValueProps = React.ComponentProps<typeof BaseSelect.Value>

function SelectValue({ className, ...props }: SelectValueProps) {
  return (
    <BaseSelect.Value
      data-slot="select-value"
      className={cn('min-w-0 flex-1 truncate text-start', className)}
      {...props}
    />
  )
}

const POPUP_RADIUS: Record<SelectSize, string> = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
}

type SelectContentProps = React.ComponentProps<typeof BaseSelect.Popup> &
  FloatingContentProps<
    React.ComponentProps<typeof BaseSelect.Positioner>,
    React.ComponentProps<typeof BaseSelect.Portal>
  > & {
    /** Per-popup override of the root's alignment setting. */
    alignItemWithTrigger?: boolean
  }

function SelectContent({ className, alignItemWithTrigger: alignOverride, children, ...props }: SelectContentProps) {
  const { size, alignItemWithTrigger: ctxAlign } = useSelectContext()
  const alignWithTrigger = alignOverride ?? ctxAlign
  const { positioner, portal, popup } = splitFloatingProps(props)

  return (
    <BaseSelect.Portal {...portal}>
      <BaseSelect.Positioner
        sideOffset={6}
        {...positioner}
        alignItemWithTrigger={alignWithTrigger}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseSelect.Popup
          data-slot="select-content"
          data-align-trigger={alignWithTrigger || undefined}
          className={cn(
            'bg-background border-border-overlay flex flex-col border shadow-2xl outline-none',
            POPUP_RADIUS[size],
            'min-w-36',
            alignWithTrigger ? 'w-[calc(var(--anchor-width)+1rem)]' : 'w-(--anchor-width)',
            alignWithTrigger ? 'origin-center' : 'origin-(--transform-origin)',
            'motion-safe:ease-spring motion-safe:transition-[opacity,scale] motion-safe:duration-200',
            'data-starting-style:motion-safe:scale-90 data-starting-style:motion-safe:opacity-0',
            'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
            className,
          )}
          {...popup}
        >
          <SelectScrollUpButton />
          <BaseSelect.List className="flex max-h-(--available-height) flex-col gap-0.5 overflow-y-auto p-2">
            {children}
          </BaseSelect.List>
          <SelectScrollDownButton />
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  )
}

const SCROLL_ARROW_CLASSES = cn(
  'bg-background text-foreground z-1 flex h-6 w-[calc(100%-var(--border-width)*2)] cursor-default items-center justify-center',
)

function SelectScrollUpButton() {
  const { size } = useSelectContext()
  return (
    <BaseSelect.ScrollUpArrow
      data-slot="select-scroll-up"
      aria-hidden="true"
      className={cn(SCROLL_ARROW_CLASSES, POPUP_RADIUS[size], 'top-px rounded-b-none')}
    >
      <ChevronDownIcon className={cn(ICON_SIZE[size], 'rotate-180')} />
    </BaseSelect.ScrollUpArrow>
  )
}

function SelectScrollDownButton() {
  const { size } = useSelectContext()
  return (
    <BaseSelect.ScrollDownArrow
      data-slot="select-scroll-down"
      aria-hidden="true"
      className={cn(SCROLL_ARROW_CLASSES, POPUP_RADIUS[size], 'bottom-px rounded-t-none')}
    >
      <ChevronDownIcon className={ICON_SIZE[size]} />
    </BaseSelect.ScrollDownArrow>
  )
}

type SelectGroupProps = React.ComponentProps<typeof BaseSelect.Group>

function SelectGroup(props: SelectGroupProps) {
  return <BaseSelect.Group data-slot="select-group" {...props} />
}

type SelectGroupLabelProps = React.ComponentProps<typeof BaseSelect.GroupLabel>

const GROUP_LABEL_SIZE: Record<SelectSize, string> = {
  sm: 'px-2.5 pt-1.5 pb-1 text-xs',
  md: 'px-3 pt-2 pb-1.25 text-sm',
  lg: 'px-3.5 pt-2.5 pb-1.5 text-base',
}

function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps) {
  const { size } = useSelectContext()
  return (
    <BaseSelect.GroupLabel
      data-slot="select-group-label"
      className={cn('text-foreground-subtle', GROUP_LABEL_SIZE[size], className)}
      {...props}
    />
  )
}

const ITEM_SIZE: Record<SelectSize, string> = {
  sm: "gap-1 rounded-xs py-1.5 px-2.5 text-xs has-data-[icon=end]:pe-1.5 has-data-[icon=start]:ps-1.5 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
  md: "gap-1.5 rounded-sm py-2 px-3 text-sm has-data-[icon=end]:pe-2 has-data-[icon=start]:ps-2 [&_svg:not([class*='size-'])]:size-4.5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
  lg: "gap-1.5 rounded-md py-2.5 px-3.5 text-base has-data-[icon=end]:pe-2.5 has-data-[icon=start]:ps-2.5 [&_svg:not([class*='size-'])]:size-5 [&_svg:not([class*='stroke-'])]:stroke-[1.65]",
}

const ITEM_TEXT_SIZE: Record<SelectSize, string> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-1.5',
}

interface SelectItemProps extends React.ComponentProps<typeof BaseSelect.Item> {}

function SelectItem({ className, children, ...props }: SelectItemProps) {
  const { size, reducedMotion } = useSelectContext()
  return (
    <BaseSelect.Item
      data-slot="select-item"
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
      <BaseSelect.ItemText className={cn('flex items-center text-start', ITEM_TEXT_SIZE[size])}>
        {children}
      </BaseSelect.ItemText>
      <BaseSelect.ItemIndicator
        data-slot="select-item-indicator"
        keepMounted={!reducedMotion}
        className="group/check text-foreground-intense shrink-0"
      >
        <CheckIcon data-icon="end" className="me-0.5 size-[1.125em]" />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  )
}

type SelectSeparatorProps = React.ComponentProps<typeof BaseSelect.Separator>

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <BaseSelect.Separator
      data-slot="select-separator"
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

function ChevronsIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M10.26 9.593c.225-.224.589-.224.814 0s.224.589 0 .813l-2.667 2.667c-.225.224-.589.224-.813 0l-2.666-2.667c-.225-.225-.225-.589 0-.813s.588-.224.813 0l2.26 2.26 2.261-2.26zM7.593 2.927c.225-.225.589-.225.813 0l2.667 2.666c.224.224.224.589 0 .813s-.589.225-.814 0L7.999 4.146 5.74 6.407c-.225.224-.588.224-.812 0s-.225-.589 0-.813l2.666-2.666z" />
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

export { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectGroupLabel, SelectItem, SelectSeparator }
export type {
  SelectProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectContentProps,
  SelectGroupProps,
  SelectGroupLabelProps,
  SelectItemProps,
  SelectSeparatorProps,
}
