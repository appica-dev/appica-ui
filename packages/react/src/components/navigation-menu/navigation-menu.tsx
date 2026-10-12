'use client'

import * as React from 'react'
import { NavigationMenu as BaseNavigationMenu } from '@base-ui/react/navigation-menu'
import { useDirection } from '../../hooks/use-direction'
import { cn } from '../../internal/utils'
import { navigationLinkVariants } from '../navigation/navigation-link-variants'

type NavigationMenuVariant = 'pill' | 'line'
type NavigationMenuSize = 'sm' | 'md' | 'lg'
type NavigationMenuIconKind = 'chevron' | 'caret' | 'plus' | false
type NavigationMenuOrientation = 'horizontal' | 'vertical'

interface NavigationMenuContextValue {
  variant: NavigationMenuVariant
  size: NavigationMenuSize
  icon: NavigationMenuIconKind
  orientation: NavigationMenuOrientation
  backdrop: boolean
  morph: boolean
}

const NavigationMenuContext = React.createContext<NavigationMenuContextValue | null>(null)

function useNavigationMenuContext() {
  const ctx = React.useContext(NavigationMenuContext)
  if (!ctx) {
    throw new Error('NavigationMenu sub-components must be rendered inside <NavigationMenu>')
  }
  return ctx
}

const NavigationMenuContentContext = React.createContext(false)

type BaseRootProps = React.ComponentProps<typeof BaseNavigationMenu.Root>

interface NavigationMenuProps extends BaseRootProps {
  /**
   * Trigger appearance - hover/active pill, or an animated underline.
   * @default 'pill'
   */
  variant?: NavigationMenuVariant
  /**
   * Scales triggers, popup radius, and link padding.
   * @default 'md'
   */
  size?: NavigationMenuSize
  /**
   * The open/close indicator shown by each `NavigationMenuIcon`.
   * @default 'chevron'
   */
  icon?: NavigationMenuIconKind
  /**
   * Render a dimmed, blurred backdrop behind the open panel.
   * @default false
   */
  backdrop?: boolean
  /**
   * Auto-render the portalled positioner + popup. Set `false` to render your own.
   * @default true
   */
  viewport?: boolean
  /**
   * Animate the popup's size and position between items.
   * @default true
   */
  morph?: boolean
  /**
   * Gap between the trigger and the auto-rendered popup.
   * @default 6
   */
  sideOffset?: number
}

function NavigationMenu({
  className,
  variant = 'pill',
  size = 'md',
  icon = 'chevron',
  orientation = 'horizontal',
  backdrop = false,
  viewport = true,
  morph = true,
  sideOffset,
  children,
  ...rest
}: NavigationMenuProps) {
  const nested = React.useContext(NavigationMenuContentContext)
  const resolvedSideOffset = sideOffset ?? (nested ? 12 : 6)
  const ctx = React.useMemo<NavigationMenuContextValue>(
    () => ({ variant, size, icon, orientation, backdrop, morph }),
    [variant, size, icon, orientation, backdrop, morph],
  )
  return (
    <NavigationMenuContext.Provider value={ctx}>
      <BaseNavigationMenu.Root
        data-slot="navigation-menu"
        data-orientation={orientation}
        orientation={orientation}
        className={cn(className)}
        {...rest}
      >
        {children}
        {viewport && <NavigationMenuPositioner sideOffset={resolvedSideOffset} />}
      </BaseNavigationMenu.Root>
    </NavigationMenuContext.Provider>
  )
}

type NavigationMenuListProps = React.ComponentProps<typeof BaseNavigationMenu.List>

const HORIZONTAL_GAP: Partial<Record<NavigationMenuVariant, string>> = {
  pill: 'gap-0.5',
  line: 'gap-7',
}

const VERTICAL_GAP: Partial<Record<NavigationMenuVariant, string>> = {
  pill: 'gap-0.5',
}

function NavigationMenuList({ className, ...props }: NavigationMenuListProps) {
  const { orientation, variant } = useNavigationMenuContext()
  const vertical = orientation === 'vertical'
  const gap = (vertical ? VERTICAL_GAP : HORIZONTAL_GAP)[variant]
  return (
    <BaseNavigationMenu.List
      data-slot="navigation-menu-list"
      className={cn('flex', vertical ? 'w-full flex-col' : 'w-fit items-center', gap, className)}
      {...props}
    />
  )
}

type NavigationMenuItemProps = React.ComponentProps<typeof BaseNavigationMenu.Item>

function NavigationMenuItem(props: NavigationMenuItemProps) {
  return <BaseNavigationMenu.Item data-slot="navigation-menu-item" {...props} />
}

type NavigationMenuTriggerProps = React.ComponentProps<typeof BaseNavigationMenu.Trigger>

function NavigationMenuTrigger({ className, ...props }: NavigationMenuTriggerProps) {
  const { variant, size, orientation, backdrop } = useNavigationMenuContext()
  const inContent = React.useContext(NavigationMenuContentContext)
  const vertical = inContent || orientation === 'vertical'
  return (
    <BaseNavigationMenu.Trigger
      data-slot="navigation-menu-trigger"
      data-orientation={vertical ? 'vertical' : 'horizontal'}
      className={cn(
        navigationLinkVariants({ variant: inContent ? 'pill' : variant, size }),
        vertical && 'w-full',
        'outline-hidden',
        backdrop && 'z-50',
        className,
      )}
      {...props}
    />
  )
}

const ICON_SIZE: Record<NavigationMenuSize, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-4.5',
}

type NavigationMenuIconProps = Omit<React.ComponentProps<typeof BaseNavigationMenu.Icon>, 'children'> & {
  /**
   * Override the indicator for this trigger.
   * @default root
   */
  icon?: NavigationMenuIconKind
}

function NavigationMenuIcon({ icon, className, ...props }: NavigationMenuIconProps) {
  const ctx = useNavigationMenuContext()
  const resolved = icon === undefined ? ctx.icon : icon
  if (resolved === false) {
    return null
  }
  const sizeClass = ICON_SIZE[ctx.size]
  const vertical = ctx.orientation === 'vertical'
  return (
    <BaseNavigationMenu.Icon
      data-slot="navigation-menu-icon"
      data-icon="end"
      className={cn(
        'group/navigation-menu-icon -ms-0.5 inline-flex shrink-0',
        (resolved === 'chevron' || resolved === 'caret') &&
          (vertical
            ? '-rotate-90 rtl:rotate-90'
            : 'transition-transform duration-300 ease-out data-popup-open:rotate-180 motion-reduce:transition-none'),
        className,
      )}
      {...props}
    >
      {resolved === 'chevron' && <ChevronIconSvg className={sizeClass} />}
      {resolved === 'caret' && <CaretIconSvg className={sizeClass} />}
      {resolved === 'plus' && <PlusIconSvg className={sizeClass} />}
    </BaseNavigationMenu.Icon>
  )
}

const CONTENT_PADDING: Record<NavigationMenuSize, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
}

type NavigationMenuContentProps = React.ComponentProps<typeof BaseNavigationMenu.Content>

function NavigationMenuContent({ className, children, ...props }: NavigationMenuContentProps) {
  const { morph, size } = useNavigationMenuContext()
  return (
    <BaseNavigationMenu.Content
      data-slot="navigation-menu-content"
      className={cn(
        CONTENT_PADDING[size],
        morph && [
          'motion-safe:transition-[opacity,translate] motion-safe:duration-350 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]',
          'data-starting-style:motion-safe:opacity-0',
          'data-ending-style:motion-safe:opacity-0',
          'data-[activation-direction=left]:data-starting-style:motion-safe:-translate-x-4',
          'data-[activation-direction=right]:data-starting-style:motion-safe:translate-x-4',
          'data-[activation-direction=up]:data-starting-style:motion-safe:-translate-y-4',
          'data-[activation-direction=down]:data-starting-style:motion-safe:translate-y-4',
          'data-[activation-direction=left]:data-ending-style:motion-safe:translate-x-4',
          'data-[activation-direction=right]:data-ending-style:motion-safe:-translate-x-4',
          'data-[activation-direction=up]:data-ending-style:motion-safe:translate-y-4',
          'data-[activation-direction=down]:data-ending-style:motion-safe:-translate-y-4',
        ],
        className,
      )}
      {...props}
    >
      <NavigationMenuContentContext.Provider value={true}>{children}</NavigationMenuContentContext.Provider>
    </BaseNavigationMenu.Content>
  )
}

type NavigationMenuLinkProps = React.ComponentProps<typeof BaseNavigationMenu.Link>

function NavigationMenuLink({ className, ...props }: NavigationMenuLinkProps) {
  const { size, orientation, variant } = useNavigationMenuContext()
  const inContent = React.useContext(NavigationMenuContentContext)
  const vertical = inContent || orientation === 'vertical'
  return (
    <BaseNavigationMenu.Link
      data-slot="navigation-menu-link"
      data-orientation={vertical ? 'vertical' : 'horizontal'}
      className={cn(
        navigationLinkVariants({ variant: inContent ? 'pill' : variant, size }),
        vertical && 'w-full',
        'outline-hidden',
        className,
      )}
      {...props}
    />
  )
}

const POPUP_RADIUS: Record<NavigationMenuSize, string> = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
}

type PositionerPicks = Pick<
  React.ComponentProps<typeof BaseNavigationMenu.Positioner>,
  'side' | 'sideOffset' | 'align' | 'alignOffset' | 'collisionPadding' | 'collisionAvoidance'
>
type PortalPicks = Pick<React.ComponentProps<typeof BaseNavigationMenu.Portal>, 'container'>

interface NavigationMenuPositionerProps extends PositionerPicks, PortalPicks {
  /** Extra classes, merged via `tailwind-merge`. */
  className?: string
}

function NavigationMenuPositioner({
  className,
  side,
  sideOffset = 6,
  align = 'start',
  alignOffset,
  collisionPadding,
  collisionAvoidance = { side: 'none' },
  container,
}: NavigationMenuPositionerProps) {
  const { size, orientation, backdrop, morph } = useNavigationMenuContext()
  const direction = useDirection()
  const vertical = orientation === 'vertical'
  return (
    <BaseNavigationMenu.Portal container={container}>
      {backdrop && (
        <BaseNavigationMenu.Backdrop
          data-slot="navigation-menu-backdrop"
          className={cn(
            'pointer-events-none fixed inset-0 z-40 bg-black/30 backdrop-blur-sm supports-[-webkit-touch-callout:none]:absolute',
            'motion-safe:transition-opacity motion-safe:duration-250 motion-safe:ease-out',
            'data-ending-style:motion-safe:opacity-0 data-starting-style:motion-safe:opacity-0',
          )}
        />
      )}
      <BaseNavigationMenu.Positioner
        data-slot="navigation-menu-positioner"
        dir={direction === 'rtl' ? 'rtl' : undefined}
        side={side ?? (vertical ? 'inline-end' : undefined)}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        collisionAvoidance={collisionAvoidance}
        className={cn(
          'isolate z-50',
          morph && [
            'h-(--positioner-height) w-(--positioner-width) max-w-(--available-width)',
            'motion-safe:transition-[top,left,right,bottom] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]',
            'data-instant:motion-safe:transition-none',
          ],
        )}
      >
        <BaseNavigationMenu.Popup
          data-slot="navigation-menu-popup"
          className={cn(
            'bg-background border-border-overlay relative border shadow-2xl outline-none',
            POPUP_RADIUS[size],
            morph && 'h-(--popup-height) w-(--popup-width)',
            'origin-(--transform-origin)',
            morph
              ? 'motion-safe:[transition:opacity_300ms_var(--ease-spring),scale_300ms_var(--ease-spring),width_300ms_cubic-bezier(0.22,1,0.36,1),height_300ms_cubic-bezier(0.22,1,0.36,1)]'
              : 'motion-safe:ease-spring motion-safe:transition-[opacity,scale] motion-safe:duration-300',
            'data-starting-style:motion-safe:scale-95 data-starting-style:motion-safe:opacity-0',
            'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-150 data-ending-style:motion-safe:ease-out',
            className,
          )}
        >
          <BaseNavigationMenu.Viewport
            data-slot="navigation-menu-viewport"
            className="relative h-full w-full overflow-hidden"
          />
        </BaseNavigationMenu.Popup>
      </BaseNavigationMenu.Positioner>
    </BaseNavigationMenu.Portal>
  )
}

interface IconProps extends React.SVGProps<SVGSVGElement> {}

function ChevronIconSvg({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={cn(className)}
      {...props}
    >
      <path d="M11.558 5.558c.244-.244.641-.244.885 0s.244.641 0 .885l-4 4c-.244.244-.641.244-.885 0l-4-4c-.244-.244-.244-.641 0-.885s.641-.244.885 0L8 9.115l3.558-3.558z" />
    </svg>
  )
}

function CaretIconSvg({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn(className)}
      {...props}
    >
      <path d="M17.141 9.5c.73 0 1.112.863.671 1.42l-.065.074-5.143 5.25a.85.85 0 0 1-.552.255c-.208.013-.414-.051-.579-.182l-.081-.073-5.143-5.25-.071-.082-.046-.067-.046-.084-.015-.031-.023-.059-.027-.095-.009-.046-.009-.053-.003-.05v-.103l.004-.051.008-.053.009-.046.027-.095.023-.059.06-.115.056-.079.063-.071.081-.073.066-.047.082-.047.031-.015.057-.024.093-.028.045-.009.051-.009.049-.004L17.141 9.5z" />
    </svg>
  )
}

function PlusIconSvg({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      className={cn(
        'transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
        'group-data-popup-open/navigation-menu-icon:rotate-180',
        className,
      )}
      {...props}
    >
      <rect x="3.333" y="7.375" width="9.334" height="1.25" rx="0.625" />
      <rect
        x="7.375"
        y="3.333"
        width="1.25"
        height="9.334"
        rx="0.625"
        className={cn(
          'origin-center transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
          'group-data-popup-open/navigation-menu-icon:rotate-90',
        )}
      />
    </svg>
  )
}

type NavigationMenuViewportProps = React.ComponentProps<typeof BaseNavigationMenu.Viewport>

function NavigationMenuViewport({ className, ...props }: NavigationMenuViewportProps) {
  return (
    <BaseNavigationMenu.Viewport
      data-slot="navigation-menu-viewport"
      className={cn('relative overflow-hidden', className)}
      {...props}
    />
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuIcon,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuPositioner,
  NavigationMenuViewport,
}
export type {
  NavigationMenuProps,
  NavigationMenuListProps,
  NavigationMenuItemProps,
  NavigationMenuTriggerProps,
  NavigationMenuIconProps,
  NavigationMenuContentProps,
  NavigationMenuLinkProps,
  NavigationMenuPositionerProps,
  NavigationMenuViewportProps,
}
