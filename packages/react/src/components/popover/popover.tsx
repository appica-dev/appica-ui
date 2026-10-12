import * as React from 'react'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'

type PopoverProps = React.ComponentProps<typeof BasePopover.Root>

const Popover = Object.assign(
  function Popover(props: PopoverProps) {
    return <BasePopover.Root {...props} />
  },
  { createHandle: BasePopover.createHandle },
)

type PopoverTriggerProps = React.ComponentProps<typeof BasePopover.Trigger>

function PopoverTrigger(props: PopoverTriggerProps) {
  return <BasePopover.Trigger data-slot="popover-trigger" {...props} />
}

type PopoverContentProps = React.ComponentProps<typeof BasePopover.Popup> &
  FloatingContentProps<
    React.ComponentProps<typeof BasePopover.Positioner>,
    React.ComponentProps<typeof BasePopover.Portal>
  > & {
    /**
     * Render the pointer and the thicker anchored border.
     * @default true
     */
    arrow?: boolean
  }

function PopoverContent({ className, arrow = true, children, ...props }: PopoverContentProps) {
  const { positioner, portal, popup } = splitFloatingProps(props)
  return (
    <BasePopover.Portal {...portal}>
      <BasePopover.Positioner
        side="bottom"
        align="center"
        alignOffset={0}
        sideOffset={arrow ? 10 : 6}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BasePopover.Popup className="group/popup outline-none" {...popup}>
          <div
            data-slot="popover-content"
            className={cn(
              'bg-background border-border-overlay flex max-w-80 min-w-50 flex-col gap-2 rounded-xl border p-4 shadow-2xl',
              arrow && [
                'group-data-[side=top]/popup:border-b-2',
                'group-data-[side=bottom]/popup:border-t-2',
                'group-data-[side=left]/popup:border-r-2',
                'group-data-[side=right]/popup:border-l-2',
                'group-data-[side=inline-start]/popup:border-e-2',
                'group-data-[side=inline-end]/popup:border-s-2',
              ],
              'motion-safe:ease-spring motion-safe:origin-(--transform-origin) motion-safe:transition-[opacity,scale] motion-safe:duration-200',
              'group-data-starting-style/popup:motion-safe:scale-90 group-data-starting-style/popup:motion-safe:opacity-0',
              'group-data-ending-style/popup:motion-safe:scale-95 group-data-ending-style/popup:motion-safe:opacity-0 group-data-ending-style/popup:motion-safe:duration-100 group-data-ending-style/popup:motion-safe:ease-out',
              className,
            )}
          >
            {children}
          </div>
          {arrow && (
            <BasePopover.Arrow
              data-slot="popover-arrow"
              className={cn(
                'flex',
                'data-[side=top]:-bottom-2.25 data-[side=top]:rotate-180',
                'data-[side=bottom]:-top-2.25',
                'data-[side=left]:-right-3.25 data-[side=left]:rotate-90',
                'data-[side=right]:-left-3.25 data-[side=right]:-rotate-90',
                'data-[side=inline-start]:-inset-e-3.25 data-[side=inline-start]:ltr:rotate-90 data-[side=inline-start]:rtl:-rotate-90',
                'data-[side=inline-end]:-inset-s-3.25 data-[side=inline-end]:ltr:-rotate-90 data-[side=inline-end]:rtl:rotate-90',
              )}
            >
              <PopoverArrowSvg />
            </BasePopover.Arrow>
          )}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}

function PopoverArrowSvg() {
  return (
    <svg width="26" height="18" viewBox="0 0 26 18" fill="none" aria-hidden="true">
      <path
        className="text-border-overlay"
        d="M21 9L15.9819 3.36153C14.3897 1.57244 11.5927 1.57413 10.0026 3.36516L5 9"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        className="text-background"
        d="M9.82943 4.57564C11.4308 2.51078 14.5497 2.51076 16.1511 4.5756L20.9774 10.7986C23.0157 13.4269 21.1426 17.25 17.8166 17.25L8.16409 17.25C4.83808 17.25 2.96496 13.4269 5.00325 10.7987L9.82943 4.57564Z"
        fill="currentColor"
      />
    </svg>
  )
}

type PopoverTitleProps = React.ComponentProps<typeof BasePopover.Title>

function PopoverTitle({ className, ...props }: PopoverTitleProps) {
  return (
    <BasePopover.Title
      data-slot="popover-title"
      className={cn('text-foreground-intense text-base font-semibold', className)}
      {...props}
    />
  )
}

type PopoverDescriptionProps = React.ComponentProps<typeof BasePopover.Description>

function PopoverDescription({ className, ...props }: PopoverDescriptionProps) {
  return <BasePopover.Description data-slot="popover-description" className={cn('text-sm', className)} {...props} />
}

type PopoverCloseProps = React.ComponentProps<typeof BasePopover.Close>

function PopoverClose(props: PopoverCloseProps) {
  return <BasePopover.Close data-slot="popover-close" {...props} />
}

export { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription, PopoverClose }
export type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
  PopoverCloseProps,
}
