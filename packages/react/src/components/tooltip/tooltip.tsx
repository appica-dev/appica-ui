import * as React from 'react'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { cn } from '../../internal/utils'
import { type FloatingContentProps, splitFloatingProps } from '../../internal/floating'

type TooltipProviderProps = React.ComponentProps<typeof BaseTooltip.Provider>

function TooltipProvider({ delay = 200, ...props }: TooltipProviderProps) {
  return <BaseTooltip.Provider data-slot="tooltip-provider" delay={delay} {...props} />
}

type TooltipProps = React.ComponentProps<typeof BaseTooltip.Root>

function Tooltip(props: TooltipProps) {
  return <BaseTooltip.Root {...props} />
}

type TooltipTriggerProps = React.ComponentProps<typeof BaseTooltip.Trigger>

function TooltipTrigger(props: TooltipTriggerProps) {
  return <BaseTooltip.Trigger data-slot="tooltip-trigger" {...props} />
}

type TooltipContentProps = React.ComponentProps<typeof BaseTooltip.Popup> &
  FloatingContentProps<
    React.ComponentProps<typeof BaseTooltip.Positioner>,
    React.ComponentProps<typeof BaseTooltip.Portal>
  > & {
    /**
     * Render the pointer.
     * @default true
     */
    arrow?: boolean
  }

function TooltipContent({ className, arrow = true, children, ...props }: TooltipContentProps) {
  const { positioner, portal, popup } = splitFloatingProps(props)
  return (
    <BaseTooltip.Portal {...portal}>
      <BaseTooltip.Positioner
        side="top"
        align="center"
        alignOffset={0}
        sideOffset={arrow ? 8 : 4}
        {...positioner}
        className={cn('isolate z-50', positioner.className as string | undefined)}
      >
        <BaseTooltip.Popup
          data-slot="tooltip-content"
          className={cn(
            'bg-background-inverse text-foreground-inverse rounded-xs px-3 py-1.5 text-xs shadow-md',
            'motion-safe:ease-spring motion-safe:origin-(--transform-origin) motion-safe:transition-[opacity,scale] motion-safe:duration-200',
            'data-starting-style:motion-safe:scale-90 data-starting-style:motion-safe:opacity-0',
            'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
            'data-instant:motion-safe:transition-none',
            className,
          )}
          {...popup}
        >
          {children}
          {arrow && (
            <BaseTooltip.Arrow
              data-slot="tooltip-arrow"
              className={cn(
                'bg-background-inverse fill-background-inverse size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px]',
                'data-[side=top]:-bottom-2.5',
                'data-[side=bottom]:top-1',
                'data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2',
                'data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2',
                'data-[side=inline-start]:-inset-e-1 data-[side=inline-start]:top-1/2! data-[side=inline-start]:-translate-y-1/2',
                'data-[side=inline-end]:-inset-s-1 data-[side=inline-end]:top-1/2! data-[side=inline-end]:-translate-y-1/2',
              )}
            />
          )}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
export type { TooltipProps, TooltipTriggerProps, TooltipContentProps, TooltipProviderProps }
