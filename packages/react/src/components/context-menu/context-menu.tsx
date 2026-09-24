'use client'

import * as React from 'react'
import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'
import { navigationLinkVariants } from '../navigation/navigation-link-variants'

type ContextMenuSize = 'sm' | 'md' | 'lg'

interface ContextMenuContextValue {
  size: ContextMenuSize
  reducedMotion: boolean
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(null)

function useContextMenuContext() {
  const ctx = React.useContext(ContextMenuContext)
  if (!ctx) {
    throw new Error('ContextMenu sub-components must be rendered inside <ContextMenu>')
  }
  return ctx
}

type BaseRootProps = React.ComponentProps<typeof BaseContextMenu.Root>

interface ContextMenuProps extends BaseRootProps {
  /**
   * Scales the popup radius, item padding, and icon size.
   * @default 'md'
   */
  size?: ContextMenuSize
}

function ContextMenu({ size = 'md', children, ...rest }: ContextMenuProps) {
  const reducedMotion = useReducedMotion()
  const ctx = React.useMemo<ContextMenuContextValue>(() => ({ size, reducedMotion }), [size, reducedMotion])
  return (
    <ContextMenuContext value={ctx}>
      <BaseContextMenu.Root {...rest}>{children}</BaseContextMenu.Root>
    </ContextMenuContext>
  )
}

type ContextMenuTriggerProps = React.ComponentProps<typeof BaseContextMenu.Trigger>

function ContextMenuTrigger({ className, ...props }: ContextMenuTriggerProps) {
  return <BaseContextMenu.Trigger data-slot="context-menu-trigger" className={cn(className)} {...props} />
}

const POPUP_SIZE: Record<ContextMenuSize, string> = {
  sm: 'min-w-40 rounded-md',
  md: 'min-w-48 rounded-lg',
  lg: 'min-w-56 rounded-xl',
}

const ICON_SIZE: Record<ContextMenuSize, string> = {
  sm: 'size-4',
  md: 'size-4.5',
  lg: 'size-5',
}

function popupClassName(size: ContextMenuSize, className?: string) {
  return cn(
    'max-h-(--available-height) bg-background border-border-overlay flex flex-col border shadow-2xl outline-none',
    POPUP_SIZE[size],
    'origin-(--transform-origin)',
    'motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
    'data-starting-style:motion-safe:scale-90 data-starting-style:motion-safe:opacity-0',
    'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
    className,
  )
}

type ContextMenuFloatingProps = FloatingContentProps<
  React.ComponentProps<typeof BaseContextMenu.Positioner>,
  React.ComponentProps<typeof BaseContextMenu.Portal>
>

type ContextMenuContentProps = Omit<React.ComponentProps<typeof BaseContextMenu.Popup>, 'className'> &
  ContextMenuFloatingProps & {
    /** Extra classes on the popup. */
    className?: string
  }

function ContextMenuContent({ className, children, ...props }: ContextMenuContentProps) {
  const { size } = useContextMenuContext()
  const { positioner, portal, popup } = splitFloatingProps(props)
  return (
    <BaseContextMenu.Portal {...portal}>
      <BaseContextMenu.Positioner
        align="start"
        sideOffset={2}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseContextMenu.Popup data-slot="context-menu-content" className={popupClassName(size, className)} {...popup}>
          <div className="flex flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-2">{children}</div>
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  )
}

const ITEM_BASE = 'w-full outline-hidden'

const ITEM_TEXT: Record<ContextMenuSize, string> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-1.5',
}

type ContextMenuItemProps = React.ComponentProps<typeof BaseContextMenu.Item>

function ContextMenuItem({ className, ...props }: ContextMenuItemProps) {
  const { size } = useContextMenuContext()
  return (
    <BaseContextMenu.Item
      data-slot="context-menu-item"
      data-orientation="vertical"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, className)}
      {...props}
    />
  )
}

type ContextMenuLinkItemProps = React.ComponentProps<typeof BaseContextMenu.LinkItem>

function ContextMenuLinkItem({ className, ...props }: ContextMenuLinkItemProps) {
  const { size } = useContextMenuContext()
  return (
    <BaseContextMenu.LinkItem
      data-slot="context-menu-link-item"
      data-orientation="vertical"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, className)}
      {...props}
    />
  )
}

type ContextMenuGroupProps = React.ComponentProps<typeof BaseContextMenu.Group>

function ContextMenuGroup(props: ContextMenuGroupProps) {
  return <BaseContextMenu.Group data-slot="context-menu-group" {...props} />
}

type ContextMenuGroupLabelProps = React.ComponentProps<typeof BaseContextMenu.GroupLabel>

const GROUP_LABEL_SIZE: Record<ContextMenuSize, string> = {
  sm: 'px-2.5 pt-1.5 pb-1 text-xs',
  md: 'px-3 pt-2 pb-1.25 text-sm',
  lg: 'px-3.5 pt-2.5 pb-1.5 text-base',
}

function ContextMenuGroupLabel({ className, ...props }: ContextMenuGroupLabelProps) {
  const { size } = useContextMenuContext()
  return (
    <BaseContextMenu.GroupLabel
      data-slot="context-menu-group-label"
      className={cn('text-foreground-subtle', GROUP_LABEL_SIZE[size], className)}
      {...props}
    />
  )
}

type ContextMenuSeparatorProps = React.ComponentProps<typeof BaseContextMenu.Separator>

function ContextMenuSeparator({ className, ...props }: ContextMenuSeparatorProps) {
  return (
    <BaseContextMenu.Separator
      data-slot="context-menu-separator"
      className={cn('bg-border -mx-2 my-1.5 h-px shrink-0', className)}
      {...props}
    />
  )
}

type ContextMenuRadioGroupProps = React.ComponentProps<typeof BaseContextMenu.RadioGroup>

function ContextMenuRadioGroup(props: ContextMenuRadioGroupProps) {
  return <BaseContextMenu.RadioGroup data-slot="context-menu-radio-group" {...props} />
}

type ContextMenuRadioItemProps = React.ComponentProps<typeof BaseContextMenu.RadioItem>

function ContextMenuRadioItem({ className, children, ...props }: ContextMenuRadioItemProps) {
  const { size, reducedMotion } = useContextMenuContext()
  return (
    <BaseContextMenu.RadioItem
      data-slot="context-menu-radio-item"
      data-orientation="vertical"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, 'justify-between', className)}
      {...props}
    >
      <span className={cn('flex items-center', ITEM_TEXT[size])}>{children}</span>
      <BaseContextMenu.RadioItemIndicator
        data-slot="context-menu-radio-item-indicator"
        keepMounted={!reducedMotion}
        className="group/check text-foreground-intense shrink-0"
      >
        <CheckIcon data-icon="end" className="me-0.5 size-[1.125em]" />
      </BaseContextMenu.RadioItemIndicator>
    </BaseContextMenu.RadioItem>
  )
}

type ContextMenuCheckboxItemProps = React.ComponentProps<typeof BaseContextMenu.CheckboxItem>

function ContextMenuCheckboxItem({ className, children, ...props }: ContextMenuCheckboxItemProps) {
  const { size, reducedMotion } = useContextMenuContext()
  return (
    <BaseContextMenu.CheckboxItem
      data-slot="context-menu-checkbox-item"
      data-orientation="vertical"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, 'justify-between', className)}
      {...props}
    >
      <span className={cn('flex items-center', ITEM_TEXT[size])}>{children}</span>
      <BaseContextMenu.CheckboxItemIndicator
        data-slot="context-menu-checkbox-item-indicator"
        keepMounted={!reducedMotion}
        className="group/check text-foreground-intense shrink-0"
      >
        <CheckIcon data-icon="end" className="me-0.5 size-[1.125em]" />
      </BaseContextMenu.CheckboxItemIndicator>
    </BaseContextMenu.CheckboxItem>
  )
}

type ContextMenuSubProps = React.ComponentProps<typeof BaseContextMenu.SubmenuRoot>

function ContextMenuSub(props: ContextMenuSubProps) {
  return <BaseContextMenu.SubmenuRoot {...props} />
}

type ContextMenuSubTriggerProps = React.ComponentProps<typeof BaseContextMenu.SubmenuTrigger>

function ContextMenuSubTrigger({ className, children, ...props }: ContextMenuSubTriggerProps) {
  const { size } = useContextMenuContext()
  return (
    <BaseContextMenu.SubmenuTrigger className="group/submenu-trigger outline-hidden" {...props}>
      <span
        data-slot="context-menu-sub-trigger"
        data-orientation="vertical"
        className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, 'justify-between', className)}
      >
        <span className={cn('flex flex-1 items-center', ITEM_TEXT[size])}>{children}</span>
        <ChevronEndIcon data-icon="end" className={cn(ICON_SIZE[size], 'shrink-0 rtl:rotate-180')} />
      </span>
    </BaseContextMenu.SubmenuTrigger>
  )
}

type ContextMenuSubContentProps = Omit<React.ComponentProps<typeof BaseContextMenu.Popup>, 'className'> &
  ContextMenuFloatingProps & {
    /** Extra classes on the submenu popup. */
    className?: string
  }

function ContextMenuSubContent({ className, children, ...props }: ContextMenuSubContentProps) {
  const { size } = useContextMenuContext()
  const { positioner, portal, popup } = splitFloatingProps(props)
  return (
    <BaseContextMenu.Portal {...portal}>
      <BaseContextMenu.Positioner
        side="inline-end"
        align="start"
        sideOffset={12}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseContextMenu.Popup
          data-slot="context-menu-sub-content"
          className={popupClassName(size, cn('w-(--anchor-width)', className))}
          {...popup}
        >
          <div className="flex flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-2">{children}</div>
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

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
          'group-data-checked/check:opacity-100 group-data-checked/check:[stroke-dashoffset:0]',
          'motion-safe:transition-[opacity,stroke-dashoffset] motion-safe:ease-out',
          'motion-safe:delay-[0ms,150ms] motion-safe:duration-[150ms,0ms]',
          'motion-safe:group-data-checked/check:delay-[0ms] motion-safe:group-data-checked/check:duration-[0ms,300ms]',
        )}
      />
    </svg>
  )
}

function ChevronEndIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M5.558 3.558c.244-.244.641-.244.885 0l4 4c.244.244.244.641 0 .885l-4 4c-.244.244-.641.244-.885 0s-.244-.641 0-.885L9.115 8 5.558 4.442c-.244-.244-.244-.641 0-.885z" />
    </svg>
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuLinkItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuCheckboxItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
}
export type {
  ContextMenuProps,
  ContextMenuTriggerProps,
  ContextMenuContentProps,
  ContextMenuGroupProps,
  ContextMenuGroupLabelProps,
  ContextMenuItemProps,
  ContextMenuLinkItemProps,
  ContextMenuRadioGroupProps,
  ContextMenuRadioItemProps,
  ContextMenuCheckboxItemProps,
  ContextMenuSeparatorProps,
  ContextMenuSubProps,
  ContextMenuSubTriggerProps,
  ContextMenuSubContentProps,
}
