'use client'

import * as React from 'react'
import { Menu as BaseMenu } from '@base-ui/react/menu'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'
import { navigationLinkVariants } from '../navigation/navigation-link-variants'

type DropdownMenuSize = 'sm' | 'md' | 'lg'

interface DropdownMenuContextValue {
  size: DropdownMenuSize
  reducedMotion: boolean
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

function useDropdownMenuContext() {
  const ctx = React.useContext(DropdownMenuContext)
  if (!ctx) {
    throw new Error('DropdownMenu sub-components must be rendered inside <DropdownMenu>')
  }
  return ctx
}

type BaseRootProps = React.ComponentProps<typeof BaseMenu.Root>

interface DropdownMenuProps extends BaseRootProps {
  /**
   * Scales the popup radius, item padding, and icon size.
   * @default 'md'
   */
  size?: DropdownMenuSize
}

function DropdownMenu({ size = 'md', children, ...rest }: DropdownMenuProps) {
  const reducedMotion = useReducedMotion()
  const ctx = React.useMemo<DropdownMenuContextValue>(() => ({ size, reducedMotion }), [size, reducedMotion])
  return (
    <DropdownMenuContext value={ctx}>
      <BaseMenu.Root {...rest}>{children}</BaseMenu.Root>
    </DropdownMenuContext>
  )
}

type DropdownMenuTriggerProps = React.ComponentProps<typeof BaseMenu.Trigger>

function DropdownMenuTrigger({ className, ...props }: DropdownMenuTriggerProps) {
  return <BaseMenu.Trigger data-slot="dropdown-menu-trigger" className={cn(className)} {...props} />
}

const POPUP_SIZE: Record<DropdownMenuSize, string> = {
  sm: 'min-w-40 rounded-md',
  md: 'min-w-48 rounded-lg',
  lg: 'min-w-56 rounded-xl',
}

const ICON_SIZE: Record<DropdownMenuSize, string> = {
  sm: 'size-4',
  md: 'size-4.5',
  lg: 'size-5',
}

function popupClassName(size: DropdownMenuSize, className?: string) {
  return cn(
    'max-h-(--available-height) w-(--anchor-width) bg-background border-border-overlay flex flex-col border shadow-2xl outline-none',
    POPUP_SIZE[size],
    'origin-(--transform-origin)',
    'motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
    'data-starting-style:motion-safe:scale-90 data-starting-style:motion-safe:opacity-0',
    'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
    className,
  )
}

type DropdownMenuFloatingProps = FloatingContentProps<
  React.ComponentProps<typeof BaseMenu.Positioner>,
  React.ComponentProps<typeof BaseMenu.Portal>
>

type DropdownMenuContentProps = Omit<React.ComponentProps<typeof BaseMenu.Popup>, 'className'> &
  DropdownMenuFloatingProps & {
    /** Extra classes on the popup. */
    className?: string
  }

function DropdownMenuContent({ className, children, ...props }: DropdownMenuContentProps) {
  const { size } = useDropdownMenuContext()
  const { positioner, portal, popup } = splitFloatingProps(props)
  return (
    <BaseMenu.Portal {...portal}>
      <BaseMenu.Positioner
        align="start"
        sideOffset={6}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseMenu.Popup data-slot="dropdown-menu-content" className={popupClassName(size, className)} {...popup}>
          <div className="flex flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-2">{children}</div>
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}

const ITEM_BASE = 'w-full outline-hidden'

const ITEM_TEXT: Record<DropdownMenuSize, string> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-1.5',
}

type DropdownMenuItemProps = React.ComponentProps<typeof BaseMenu.Item>

function DropdownMenuItem({ className, ...props }: DropdownMenuItemProps) {
  const { size } = useDropdownMenuContext()
  return (
    <BaseMenu.Item
      data-slot="dropdown-menu-item"
      data-orientation="vertical"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, className)}
      {...props}
    />
  )
}

type DropdownMenuLinkItemProps = React.ComponentProps<typeof BaseMenu.LinkItem>

function DropdownMenuLinkItem({ className, ...props }: DropdownMenuLinkItemProps) {
  const { size } = useDropdownMenuContext()
  return (
    <BaseMenu.LinkItem
      data-slot="dropdown-menu-link-item"
      data-orientation="vertical"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, className)}
      {...props}
    />
  )
}

type DropdownMenuGroupProps = React.ComponentProps<typeof BaseMenu.Group>

function DropdownMenuGroup(props: DropdownMenuGroupProps) {
  return <BaseMenu.Group data-slot="dropdown-menu-group" {...props} />
}

type DropdownMenuGroupLabelProps = React.ComponentProps<typeof BaseMenu.GroupLabel>

const GROUP_LABEL_SIZE: Record<DropdownMenuSize, string> = {
  sm: 'px-2.5 pt-1.5 pb-1 text-xs',
  md: 'px-3 pt-2 pb-1.25 text-sm',
  lg: 'px-3.5 pt-2.5 pb-1.5 text-base',
}

function DropdownMenuGroupLabel({ className, ...props }: DropdownMenuGroupLabelProps) {
  const { size } = useDropdownMenuContext()
  return (
    <BaseMenu.GroupLabel
      data-slot="dropdown-menu-group-label"
      className={cn('text-foreground-subtle', GROUP_LABEL_SIZE[size], className)}
      {...props}
    />
  )
}

type DropdownMenuSeparatorProps = React.ComponentProps<typeof BaseMenu.Separator>

function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <BaseMenu.Separator
      data-slot="dropdown-menu-separator"
      className={cn('bg-border -mx-2 my-1.5 h-px shrink-0', className)}
      {...props}
    />
  )
}

type DropdownMenuRadioGroupProps = React.ComponentProps<typeof BaseMenu.RadioGroup>

function DropdownMenuRadioGroup(props: DropdownMenuRadioGroupProps) {
  return <BaseMenu.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

type DropdownMenuRadioItemProps = React.ComponentProps<typeof BaseMenu.RadioItem>

function DropdownMenuRadioItem({ className, children, ...props }: DropdownMenuRadioItemProps) {
  const { size, reducedMotion } = useDropdownMenuContext()
  return (
    <BaseMenu.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-orientation="vertical"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, 'justify-between', className)}
      {...props}
    >
      <span className={cn('flex items-center', ITEM_TEXT[size])}>{children}</span>
      <BaseMenu.RadioItemIndicator
        data-slot="dropdown-menu-radio-item-indicator"
        keepMounted={!reducedMotion}
        className="group/check text-foreground-intense shrink-0"
      >
        <CheckIcon data-icon="end" className="me-0.5 size-[1.125em]" />
      </BaseMenu.RadioItemIndicator>
    </BaseMenu.RadioItem>
  )
}

type DropdownMenuCheckboxItemProps = React.ComponentProps<typeof BaseMenu.CheckboxItem>

function DropdownMenuCheckboxItem({ className, children, ...props }: DropdownMenuCheckboxItemProps) {
  const { size, reducedMotion } = useDropdownMenuContext()
  return (
    <BaseMenu.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-orientation="vertical"
      className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, 'justify-between', className)}
      {...props}
    >
      <span className={cn('flex items-center', ITEM_TEXT[size])}>{children}</span>
      <BaseMenu.CheckboxItemIndicator
        data-slot="dropdown-menu-checkbox-item-indicator"
        keepMounted={!reducedMotion}
        className="group/check text-foreground-intense shrink-0"
      >
        <CheckIcon data-icon="end" className="me-0.5 size-[1.125em]" />
      </BaseMenu.CheckboxItemIndicator>
    </BaseMenu.CheckboxItem>
  )
}

type DropdownMenuSubProps = React.ComponentProps<typeof BaseMenu.SubmenuRoot>

function DropdownMenuSub(props: DropdownMenuSubProps) {
  return <BaseMenu.SubmenuRoot {...props} />
}

type DropdownMenuSubTriggerProps = React.ComponentProps<typeof BaseMenu.SubmenuTrigger>

function DropdownMenuSubTrigger({ className, children, ...props }: DropdownMenuSubTriggerProps) {
  const { size } = useDropdownMenuContext()
  return (
    <BaseMenu.SubmenuTrigger className="group/submenu-trigger outline-hidden" {...props}>
      <span
        data-slot="dropdown-menu-sub-trigger"
        data-orientation="vertical"
        className={cn(navigationLinkVariants({ variant: 'pill', size }), ITEM_BASE, 'justify-between', className)}
      >
        <span className={cn('flex flex-1 items-center', ITEM_TEXT[size])}>{children}</span>
        <ChevronEndIcon data-icon="end" className={cn(ICON_SIZE[size], 'shrink-0 rtl:rotate-180')} />
      </span>
    </BaseMenu.SubmenuTrigger>
  )
}

type DropdownMenuSubContentProps = Omit<React.ComponentProps<typeof BaseMenu.Popup>, 'className'> &
  DropdownMenuFloatingProps & {
    /** Extra classes on the submenu popup. */
    className?: string
  }

function DropdownMenuSubContent({ className, children, ...props }: DropdownMenuSubContentProps) {
  const { size } = useDropdownMenuContext()
  const { positioner, portal, popup } = splitFloatingProps(props)
  return (
    <BaseMenu.Portal {...portal}>
      <BaseMenu.Positioner
        side="inline-end"
        align="start"
        sideOffset={12}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseMenu.Popup data-slot="dropdown-menu-sub-content" className={popupClassName(size, className)} {...popup}>
          <div className="flex flex-col gap-0.5 overflow-x-hidden overflow-y-auto p-2">{children}</div>
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
export type {
  DropdownMenuProps,
  DropdownMenuTriggerProps,
  DropdownMenuContentProps,
  DropdownMenuGroupProps,
  DropdownMenuGroupLabelProps,
  DropdownMenuItemProps,
  DropdownMenuLinkItemProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuCheckboxItemProps,
  DropdownMenuSeparatorProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuSubContentProps,
}
