import * as React from 'react'
import { AlertDialog as BaseAlertDialog } from '@base-ui/react/alert-dialog'
import { cn } from '../../internal/utils'
import { type ModalContentProps, splitModalProps } from '../../internal/modal'

type AlertDialogProps = React.ComponentProps<typeof BaseAlertDialog.Root>

const AlertDialog = Object.assign(
  function AlertDialog(props: AlertDialogProps) {
    return <BaseAlertDialog.Root {...props} />
  },
  { createHandle: BaseAlertDialog.createHandle },
)

type AlertDialogTriggerProps = React.ComponentProps<typeof BaseAlertDialog.Trigger>

function AlertDialogTrigger({ className, ...props }: AlertDialogTriggerProps) {
  return <BaseAlertDialog.Trigger data-slot="alert-dialog-trigger" className={cn(className)} {...props} />
}

type AlertDialogContentProps = ModalContentProps<
  React.ComponentProps<typeof BaseAlertDialog.Popup>,
  React.ComponentProps<typeof BaseAlertDialog.Portal>,
  React.ComponentProps<typeof BaseAlertDialog.Backdrop>,
  React.ComponentProps<typeof BaseAlertDialog.Viewport>
> & {
  /**
   * Render the dimmed, blurred backdrop behind the popup.
   * @default true
   */
  backdrop?: boolean
  /**
   * Wrap the popup in a translucent glass frame. Needs `backdrop`: without one the popup
   * is always a plain solid card.
   * @default true
   */
  frame?: boolean
}

function AlertDialogContent({
  className,
  children,
  backdrop = true,
  frame = true,
  backdropProps,
  viewportProps,
  ...props
}: AlertDialogContentProps) {
  const { portal, popup } = splitModalProps(props)
  const forceBackdrop = backdropProps?.forceRender === true
  // The frame is a rim of blurred page around the popup, so it only reads against the
  // backdrop. Without one it collapses to a plain solid card.
  const showFrame = frame && backdrop
  return (
    <BaseAlertDialog.Portal {...portal}>
      {backdrop && (
        <BaseAlertDialog.Backdrop
          data-slot="alert-dialog-backdrop"
          {...backdropProps}
          className={cn(
            'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm supports-[-webkit-touch-callout:none]:absolute',
            'motion-safe:transition-opacity motion-safe:duration-250 motion-safe:ease-out',
            'data-ending-style:motion-safe:opacity-0 data-starting-style:motion-safe:opacity-0',
            backdropProps?.className as string | undefined,
          )}
        />
      )}
      <BaseAlertDialog.Viewport
        data-slot="alert-dialog-viewport"
        {...viewportProps}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4',
          viewportProps?.className as string | undefined,
        )}
      >
        <BaseAlertDialog.Popup
          data-slot="alert-dialog-popup"
          {...(showFrame ? { 'data-frame': '' } : {})}
          className={cn(
            'group/alert-dialog-popup relative flex max-h-full min-h-0 w-100 max-w-full flex-col',
            'rounded-2xl border',
            showFrame
              ? cn(
                  'border-white/15 bg-white/10 p-1.5 backdrop-blur-sm',
                  !forceBackdrop &&
                    'data-nested:border-border-overlay data-nested:bg-background data-nested:p-0 data-nested:shadow-2xl data-nested:backdrop-blur-none',
                )
              : 'bg-background border-border-overlay',
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
            data-slot="alert-dialog-content"
            className={cn(
              'flex min-h-0 flex-col overflow-hidden not-has-[>[data-slot=alert-dialog-footer]]:pb-6 not-has-[>[data-slot=alert-dialog-header]]:pt-6 [&>[data-slot=alert-dialog-header]+[data-slot=alert-dialog-footer]]:pt-0',
              showFrame &&
                cn(
                  'bg-background rounded-[calc(var(--radius-2xl)*5/6)]',
                  !forceBackdrop &&
                    'group-data-nested/alert-dialog-popup:rounded-none group-data-nested/alert-dialog-popup:bg-transparent',
                ),
            )}
          >
            {children}
          </div>
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Viewport>
    </BaseAlertDialog.Portal>
  )
}

type AlertDialogHeaderProps = React.ComponentPropsWithoutRef<'div'>

function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps) {
  return (
    <div data-slot="alert-dialog-header" className={cn('flex shrink-0 flex-col gap-2 p-6', className)} {...props} />
  )
}

type AlertDialogTitleProps = React.ComponentProps<typeof BaseAlertDialog.Title>

function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <BaseAlertDialog.Title
      data-slot="alert-dialog-title"
      className={cn('text-foreground-intense text-xl font-semibold', className)}
      {...props}
    />
  )
}

type AlertDialogDescriptionProps = React.ComponentProps<typeof BaseAlertDialog.Description>

function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return (
    <BaseAlertDialog.Description
      data-slot="alert-dialog-description"
      className={cn('text-foreground-muted text-sm', className)}
      {...props}
    />
  )
}

type AlertDialogBodyProps = React.ComponentPropsWithoutRef<'div'>

function AlertDialogBody({ className, ...props }: AlertDialogBodyProps) {
  return <div data-slot="alert-dialog-body" className={cn('min-h-0 flex-1 px-6', className)} {...props} />
}

type AlertDialogFooterProps = React.ComponentPropsWithoutRef<'div'>

function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('flex flex-col-reverse gap-2 p-6 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

type AlertDialogCloseProps = React.ComponentProps<typeof BaseAlertDialog.Close>

function AlertDialogClose({ className, ...props }: AlertDialogCloseProps) {
  return <BaseAlertDialog.Close data-slot="alert-dialog-close" className={cn(className)} {...props} />
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogClose,
}
export type {
  AlertDialogProps,
  AlertDialogTriggerProps,
  AlertDialogContentProps,
  AlertDialogHeaderProps,
  AlertDialogTitleProps,
  AlertDialogDescriptionProps,
  AlertDialogBodyProps,
  AlertDialogFooterProps,
  AlertDialogCloseProps,
}
