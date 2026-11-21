'use client'

import * as React from 'react'
import { Autocomplete as BaseAutocomplete } from '@base-ui/react/autocomplete'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { cn, useComposedRefs } from '../../internal/utils'
import { type ModalContentProps, splitModalProps } from '../../internal/modal'
import { inputVariants } from '../input/input-variants'
import { ScrollArea } from '../scroll-area/scroll-area'

type CommandPaletteSize = 'sm' | 'md' | 'lg'
type CommandPaletteVariant = 'outline' | 'soft'

type BaseDialogRootProps = React.ComponentProps<typeof BaseDialog.Root>
type BaseAutocompleteRootProps = React.ComponentProps<typeof BaseAutocomplete.Root>
type CommandPaletteSearchProps = Pick<
  BaseAutocompleteRootProps,
  | 'items'
  | 'filteredItems'
  | 'filter'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'onItemHighlighted'
  | 'itemToStringValue'
  | 'limit'
  | 'locale'
>

interface CommandPaletteContextValue {
  size: CommandPaletteSize
  handle: NonNullable<BaseDialogRootProps['handle']>
  search: CommandPaletteSearchProps
}

const CommandPaletteContext = React.createContext<CommandPaletteContextValue | null>(null)

function useCommandPaletteContext(component: string) {
  const ctx = React.useContext(CommandPaletteContext)
  if (!ctx) throw new Error(`Appica UI: <${component}> must be used within <CommandPalette>.`)
  return ctx
}

interface CommandPaletteContentContextValue {
  inputRef: React.RefObject<HTMLInputElement | null>
  label: string
}

const CommandPaletteContentContext = React.createContext<CommandPaletteContentContextValue | null>(null)

interface CommandPaletteProps extends BaseDialogRootProps, CommandPaletteSearchProps {
  /**
   * Key that opens and closes the palette together with ⌘ or Ctrl, e.g. `'k'` for ⌘K.
   */
  shortcut?: string
  /**
   * Input height, item and label sizing.
   * @default 'md'
   */
  size?: CommandPaletteSize
}

function CommandPaletteRoot({
  shortcut,
  size = 'md',
  handle,
  items,
  filteredItems,
  filter,
  value,
  defaultValue,
  onValueChange,
  onItemHighlighted,
  itemToStringValue,
  limit,
  locale,
  ...props
}: CommandPaletteProps) {
  const [ownHandle] = React.useState(() => BaseDialog.createHandle())
  const dialogHandle = handle ?? ownHandle

  React.useEffect(() => {
    if (!shortcut) return
    const key = shortcut.toLowerCase()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== key || !(event.metaKey || event.ctrlKey) || event.altKey) return
      event.preventDefault()
      if (dialogHandle.isOpen) dialogHandle.close()
      else dialogHandle.open(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shortcut, dialogHandle])

  const ctx = React.useMemo<CommandPaletteContextValue>(
    () => ({
      size,
      handle: dialogHandle,
      search: {
        items,
        filteredItems,
        filter,
        value,
        defaultValue,
        onValueChange,
        onItemHighlighted,
        itemToStringValue,
        limit,
        locale,
      },
    }),
    [
      size,
      dialogHandle,
      items,
      filteredItems,
      filter,
      value,
      defaultValue,
      onValueChange,
      onItemHighlighted,
      itemToStringValue,
      limit,
      locale,
    ],
  )

  return (
    <CommandPaletteContext.Provider value={ctx}>
      <BaseDialog.Root handle={dialogHandle} {...props} />
    </CommandPaletteContext.Provider>
  )
}

const CommandPalette = Object.assign(CommandPaletteRoot, { createHandle: BaseDialog.createHandle })

type CommandPaletteTriggerProps = React.ComponentProps<typeof BaseDialog.Trigger>

function CommandPaletteTrigger({ className, ...props }: CommandPaletteTriggerProps) {
  return <BaseDialog.Trigger data-slot="command-palette-trigger" className={cn(className)} {...props} />
}

type CommandPaletteContentProps = ModalContentProps<
  React.ComponentProps<typeof BaseDialog.Popup>,
  React.ComponentProps<typeof BaseDialog.Portal>,
  React.ComponentProps<typeof BaseDialog.Backdrop>,
  React.ComponentProps<typeof BaseDialog.Viewport>
> & {
  /**
   * Accessible name of the dialog, read by screen readers and kept out of sight.
   * @default 'Command palette'
   */
  label?: string
  /**
   * Render the dimmed, blurred backdrop behind the palette.
   * @default true
   */
  backdrop?: boolean
  /**
   * Wrap the palette in a translucent glass frame. Needs `backdrop`: without one the palette is
   * always a plain solid card.
   * @default true
   */
  frame?: boolean
}

function CommandPaletteContent({
  className,
  children,
  label = 'Command palette',
  backdrop = true,
  frame = true,
  initialFocus,
  backdropProps,
  viewportProps,
  ...props
}: CommandPaletteContentProps) {
  const { search } = useCommandPaletteContext('CommandPaletteContent')
  const inputRef = React.useRef<HTMLInputElement>(null)
  const showFrame = frame && backdrop
  const { portal, popup } = splitModalProps(props)
  const { onValueChange } = search

  const handleValueChange = React.useCallback<NonNullable<CommandPaletteSearchProps['onValueChange']>>(
    (next, eventDetails) => {
      // Running an item would otherwise write its label into the input.
      if (eventDetails.reason === 'item-press') {
        eventDetails.cancel()
        return
      }
      onValueChange?.(next, eventDetails)
    },
    [onValueChange],
  )

  const contentCtx = React.useMemo(() => ({ inputRef, label }), [label])

  return (
    <BaseDialog.Portal {...portal}>
      {backdrop && (
        <BaseDialog.Backdrop
          data-slot="command-palette-backdrop"
          {...backdropProps}
          className={cn(
            'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm supports-[-webkit-touch-callout:none]:absolute',
            'motion-safe:transition-opacity motion-safe:duration-250 motion-safe:ease-out',
            'data-ending-style:motion-safe:opacity-0 data-starting-style:motion-safe:opacity-0',
            backdropProps?.className as string | undefined,
          )}
        />
      )}
      <BaseDialog.Viewport
        data-slot="command-palette-viewport"
        {...viewportProps}
        className={cn(
          'fixed inset-0 z-50 flex items-start justify-center overflow-hidden px-4 py-16 md:py-24',
          viewportProps?.className as string | undefined,
        )}
      >
        <BaseDialog.Popup
          data-slot="command-palette-content"
          {...(showFrame ? { 'data-frame': '' } : {})}
          initialFocus={initialFocus ?? inputRef}
          className={cn(
            'relative flex max-h-full min-h-0 w-140 max-w-full flex-col',
            'rounded-2xl border',
            showFrame ? 'border-white/15 bg-white/10 p-1.5 backdrop-blur-sm' : 'bg-background border-border-overlay',
            !showFrame && 'shadow-2xl',
            'isolate transform-gpu outline-none',
            'motion-safe:ease-spring motion-safe:transition-[opacity,scale] motion-safe:duration-250',
            'data-starting-style:motion-safe:scale-95 data-starting-style:motion-safe:opacity-0',
            'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
            className,
          )}
          {...popup}
        >
          <div
            data-slot="command-palette-body"
            className={cn(
              'relative flex min-h-0 flex-col overflow-hidden',
              showFrame && 'bg-background rounded-[calc(var(--radius-2xl)*5/6)]',
            )}
          >
            <BaseDialog.Title className="sr-only">{label}</BaseDialog.Title>
            <CommandPaletteContentContext.Provider value={contentCtx}>
              <BaseAutocomplete.Root inline open autoHighlight="always" {...search} onValueChange={handleValueChange}>
                {children}
              </BaseAutocomplete.Root>
            </CommandPaletteContentContext.Provider>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  )
}

// The list is always open inline, so the input always carries `data-popup-open`: Input's
// `within` state would read that as focus. Only real focus styles the palette's input.
const INPUT_STATE =
  'flex items-center has-focus:ring-3 has-focus:ring-ring-input has-focus:border-transparent has-focus:bg-background has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-disabled'

const INPUT_HOVER: Record<CommandPaletteVariant, string> = {
  outline: 'hover:not-has-focus:border-border-emphasis',
  soft: 'hover:not-has-focus:border-border-strong',
}

interface CommandPaletteInputProps extends Omit<React.ComponentProps<typeof BaseAutocomplete.Input>, 'size'> {
  /**
   * Input appearance, bordered or filled.
   * @default 'soft'
   */
  variant?: CommandPaletteVariant
  /** Adornment rendered before the field, inside the input frame. A search icon unless you pass your own or `null`. */
  startSlot?: React.ReactNode
  /** Adornment rendered after the field, inside the input frame. */
  endSlot?: React.ReactNode
}

function CommandPaletteInput({
  className,
  variant = 'soft',
  startSlot,
  endSlot,
  placeholder,
  ref,
  ...props
}: CommandPaletteInputProps) {
  const { size } = useCommandPaletteContext('CommandPaletteInput')
  const content = React.useContext(CommandPaletteContentContext)
  const inputRef = useComposedRefs(content?.inputRef, ref)
  const start = startSlot === undefined ? <SearchIcon /> : startSlot

  return (
    <BaseAutocomplete.InputGroup
      data-slot="command-palette-input"
      className={cn(
        inputVariants({ variant, size, state: null }),
        INPUT_STATE,
        INPUT_HOVER[variant],
        'm-3 w-auto shrink-0',
        className,
      )}
    >
      {start != null && (
        <div data-slot="command-palette-input-start" className="text-foreground-subtle -ms-1 flex shrink-0">
          {start}
        </div>
      )}
      <BaseAutocomplete.Input
        ref={inputRef}
        data-slot="command-palette-input-field"
        aria-label={content?.label}
        placeholder={placeholder ?? ' '}
        className="text-foreground placeholder:text-foreground-subtle h-full min-w-0 flex-1 bg-transparent outline-none"
        {...props}
      />
      {endSlot != null && (
        <div data-slot="command-palette-input-end" className="flex shrink-0">
          {endSlot}
        </div>
      )}
    </BaseAutocomplete.InputGroup>
  )
}

const LIST_PADDING: Record<CommandPaletteSize, string> = {
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-3.5',
}

interface CommandPaletteListProps<T = any> extends Omit<
  React.ComponentProps<typeof BaseAutocomplete.List>,
  'children'
> {
  /** A render function over the filtered items, or static items. */
  children?: React.ReactNode | ((item: T, index: number) => React.ReactNode)
  /** Props forwarded to the scroll area around the list, e.g. a fixed `className="h-110"`. */
  scrollAreaProps?: Omit<React.ComponentProps<typeof ScrollArea>, 'children'>
}

function CommandPaletteList<T = any>({ className, children, scrollAreaProps, ...props }: CommandPaletteListProps<T>) {
  const { size } = useCommandPaletteContext('CommandPaletteList')
  return (
    <ScrollArea
      scrollShadow
      {...scrollAreaProps}
      className={cn(
        'border-border-muted max-h-[min(27.5rem,60vh)] min-h-0 shrink border-t',
        scrollAreaProps?.className as string | undefined,
      )}
    >
      <BaseAutocomplete.List
        data-slot="command-palette-list"
        className={cn('flex flex-col gap-0.5 outline-none data-empty:p-0', LIST_PADDING[size], className)}
        {...props}
      >
        {children as React.ComponentProps<typeof BaseAutocomplete.List>['children']}
      </BaseAutocomplete.List>
    </ScrollArea>
  )
}

const ITEM_SIZE: Record<CommandPaletteSize, string> = {
  sm: "gap-2 rounded-xs px-2 py-1.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
  md: "gap-2.5 rounded-sm px-2.5 py-2 text-sm [&_svg:not([class*='size-'])]:size-4",
  lg: "gap-3 rounded-md px-3 py-2.5 text-base [&_svg:not([class*='size-'])]:size-4.5",
}

interface CommandPaletteItemProps extends React.ComponentProps<typeof BaseAutocomplete.Item> {
  /**
   * Close the palette once the item runs, by click or Enter.
   * @default true
   */
  closeOnSelect?: boolean
}

function CommandPaletteItem({ className, closeOnSelect = true, onClick, ...props }: CommandPaletteItemProps) {
  const { size, handle } = useCommandPaletteContext('CommandPaletteItem')
  return (
    <BaseAutocomplete.Item
      data-slot="command-palette-item"
      onClick={(event) => {
        onClick?.(event)
        if (closeOnSelect) handle.close()
      }}
      className={cn(
        'text-foreground relative isolate flex w-full cursor-default items-center outline-hidden select-none',
        "[&_svg:not([class*='text-'])]:text-foreground-subtle [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
        'before:bg-background-muted before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0',
        'data-highlighted:not-data-disabled:text-foreground-intense data-highlighted:not-data-disabled:before:opacity-100',
        'motion-safe:before:transition-opacity motion-safe:before:duration-200 motion-safe:before:ease-out',
        'data-disabled:opacity-disabled data-disabled:pointer-events-none',
        ITEM_SIZE[size],
        className,
      )}
      {...props}
    />
  )
}

const EMPTY_SIZE: Record<CommandPaletteSize, string> = {
  sm: 'px-3 py-6 text-xs',
  md: 'px-4 py-8 text-sm',
  lg: 'px-5 py-10 text-base',
}

interface CommandPaletteEmptyProps extends React.ComponentProps<typeof BaseAutocomplete.Empty> {}

function CommandPaletteEmpty({ className, ...props }: CommandPaletteEmptyProps) {
  const { size } = useCommandPaletteContext('CommandPaletteEmpty')
  return (
    <BaseAutocomplete.Empty
      data-slot="command-palette-empty"
      className={cn('text-foreground-muted text-center empty:p-0', EMPTY_SIZE[size], className)}
      {...props}
    />
  )
}

type CommandPaletteStatusProps = React.ComponentProps<typeof BaseAutocomplete.Status>

function CommandPaletteStatus({ className, ...props }: CommandPaletteStatusProps) {
  const { size } = useCommandPaletteContext('CommandPaletteStatus')
  return (
    <BaseAutocomplete.Status
      data-slot="command-palette-status"
      className={cn('text-foreground-muted text-center empty:p-0', EMPTY_SIZE[size], className)}
      {...props}
    />
  )
}

type CommandPaletteGroupProps = React.ComponentProps<typeof BaseAutocomplete.Group>

function CommandPaletteGroup({ className, ...props }: CommandPaletteGroupProps) {
  return (
    <BaseAutocomplete.Group
      data-slot="command-palette-group"
      className={cn('flex flex-col gap-0.5 not-first:mt-2', className)}
      {...props}
    />
  )
}

const LABEL_SIZE: Record<CommandPaletteSize, string> = {
  sm: 'px-2 pt-1 pb-1 text-[0.6875rem]',
  md: 'px-2.5 pt-1 pb-1.5 text-xs',
  lg: 'px-3 pt-1.5 pb-1.5 text-sm',
}

type CommandPaletteLabelProps = React.ComponentProps<typeof BaseAutocomplete.GroupLabel>

function CommandPaletteLabel({ className, ...props }: CommandPaletteLabelProps) {
  const { size } = useCommandPaletteContext('CommandPaletteLabel')
  return (
    <BaseAutocomplete.GroupLabel
      data-slot="command-palette-label"
      className={cn('text-foreground-subtle font-medium', LABEL_SIZE[size], className)}
      {...props}
    />
  )
}

type CommandPaletteCollectionProps = React.ComponentProps<typeof BaseAutocomplete.Collection>

function CommandPaletteCollection(props: CommandPaletteCollectionProps) {
  return <BaseAutocomplete.Collection {...props} />
}

type CommandPaletteSeparatorProps = React.ComponentProps<typeof BaseAutocomplete.Separator>

function CommandPaletteSeparator({ className, ...props }: CommandPaletteSeparatorProps) {
  return (
    <BaseAutocomplete.Separator
      data-slot="command-palette-separator"
      className={cn('bg-border-muted -mx-3 my-2 h-px shrink-0', className)}
      {...props}
    />
  )
}

type CommandPaletteFooterProps = React.ComponentPropsWithoutRef<'div'>

function CommandPaletteFooter({ className, ...props }: CommandPaletteFooterProps) {
  return (
    <div
      data-slot="command-palette-footer"
      className={cn(
        'border-border-muted text-foreground-subtle flex shrink-0 items-center justify-end gap-4 border-t px-4 py-2.5 text-xs',
        className,
      )}
      {...props}
    />
  )
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z" />
    </svg>
  )
}

export {
  CommandPalette,
  CommandPaletteTrigger,
  CommandPaletteContent,
  CommandPaletteInput,
  CommandPaletteList,
  CommandPaletteItem,
  CommandPaletteEmpty,
  CommandPaletteStatus,
  CommandPaletteGroup,
  CommandPaletteLabel,
  CommandPaletteCollection,
  CommandPaletteSeparator,
  CommandPaletteFooter,
}
export type {
  CommandPaletteProps,
  CommandPaletteTriggerProps,
  CommandPaletteContentProps,
  CommandPaletteInputProps,
  CommandPaletteListProps,
  CommandPaletteItemProps,
  CommandPaletteEmptyProps,
  CommandPaletteStatusProps,
  CommandPaletteGroupProps,
  CommandPaletteLabelProps,
  CommandPaletteCollectionProps,
  CommandPaletteSeparatorProps,
  CommandPaletteFooterProps,
}
