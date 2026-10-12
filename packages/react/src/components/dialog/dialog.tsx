import * as React from 'react'
import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { cn } from '../../internal/utils'
import { type ModalContentProps, splitModalProps } from '../../internal/modal'
import { buttonVariants } from '../button/button-variants'

type DialogProps = React.ComponentProps<typeof BaseDialog.Root>

const Dialog = Object.assign(
  function Dialog(props: DialogProps) {
    return <BaseDialog.Root {...props} />
  },
  { createHandle: BaseDialog.createHandle },
)

type DialogTriggerProps = React.ComponentProps<typeof BaseDialog.Trigger>

function DialogTrigger({ className, ...props }: DialogTriggerProps) {
  return <BaseDialog.Trigger data-slot="dialog-trigger" className={cn(className)} {...props} />
}

type DialogContentProps = ModalContentProps<
  React.ComponentProps<typeof BaseDialog.Popup>,
  React.ComponentProps<typeof BaseDialog.Portal>,
  React.ComponentProps<typeof BaseDialog.Backdrop>,
  React.ComponentProps<typeof BaseDialog.Viewport>
> & {
  /**
   * Render the × button in the corner.
   * @default true
   */
  closeButton?: boolean
  /**
   * Accessible label for the close button.
   * @default 'Close'
   */
  closeLabel?: string
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

function DialogContent({
  className,
  children,
  closeButton = true,
  closeLabel = 'Close',
  backdrop = true,
  frame = true,
  backdropProps,
  viewportProps,
  ...props
}: DialogContentProps) {
  // The frame is a rim of blurred page around the popup, so it only reads against the
  // backdrop. Without one it collapses to a plain solid card.
  const showFrame = frame && backdrop
  const { portal, popup } = splitModalProps(props)
  return (
    <BaseDialog.Portal {...portal}>
      {backdrop && (
        <BaseDialog.Backdrop
          data-slot="dialog-backdrop"
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
        data-slot="dialog-viewport"
        {...viewportProps}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4',
          viewportProps?.className as string | undefined,
        )}
      >
        <BaseDialog.Popup
          data-slot="dialog-popup"
          {...(showFrame ? { 'data-frame': '' } : {})}
          className={cn(
            'group/dialog-popup relative flex max-h-full min-h-0 w-150 max-w-full flex-col',
            'rounded-2xl border',
            showFrame ? 'border-white/15 bg-white/10 p-1.5 backdrop-blur-sm' : 'bg-background border-border-overlay',
            !showFrame && 'shadow-2xl',
            'isolate transform-gpu outline-none',
            'motion-safe:ease-spring motion-safe:transition-[opacity,scale] motion-safe:duration-250',
            'data-starting-style:motion-safe:scale-95 data-starting-style:motion-safe:opacity-0',
            'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
            'data-nested-dialog-open:pointer-events-none data-nested-dialog-open:scale-95 data-nested-dialog-open:opacity-0',
            className,
          )}
          {...popup}
        >
          <div
            data-slot="dialog-content"
            className={cn(
              'relative flex min-h-0 flex-col overflow-hidden not-has-[>[data-slot=dialog-footer]]:pb-6 not-has-[>[data-slot=dialog-header]]:pt-6 [&>[data-slot=dialog-header]+[data-slot=dialog-footer]]:pt-0',
              showFrame && 'bg-background rounded-[calc(var(--radius-2xl)*5/6)]',
            )}
          >
            {children}
            {closeButton && (
              <BaseDialog.Close
                aria-label={closeLabel}
                data-slot="dialog-close-button"
                className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'absolute inset-e-3 top-3 z-10')}
              >
                <CloseIcon />
              </BaseDialog.Close>
            )}
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  )
}

type DialogHeaderProps = React.ComponentPropsWithoutRef<'div'>

function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return <div data-slot="dialog-header" className={cn('flex shrink-0 flex-col gap-2 p-6', className)} {...props} />
}

type DialogTitleProps = React.ComponentProps<typeof BaseDialog.Title>

function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <BaseDialog.Title
      data-slot="dialog-title"
      className={cn('text-foreground-intense text-2xl font-semibold', className)}
      {...props}
    />
  )
}

type DialogDescriptionProps = React.ComponentProps<typeof BaseDialog.Description>

function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <BaseDialog.Description
      data-slot="dialog-description"
      className={cn('text-foreground-muted text-sm', className)}
      {...props}
    />
  )
}

type DialogBodyProps = React.ComponentPropsWithoutRef<'div'>

function DialogBody({ className, ...props }: DialogBodyProps) {
  return <div data-slot="dialog-body" className={cn('min-h-0 flex-1 px-6', className)} {...props} />
}

type DialogFooterProps = React.ComponentPropsWithoutRef<'div'>

function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 p-6 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

type DialogCloseProps = React.ComponentProps<typeof BaseDialog.Close>

function DialogClose({ className, ...props }: DialogCloseProps) {
  return <BaseDialog.Close data-slot="dialog-close" className={cn(className)} {...props} />
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M11.594 3.594c.225-.225.588-.225.813 0s.225.588 0 .812L8.813 8l3.594 3.594c.225.225.225.588 0 .813s-.588.225-.812 0L8 8.812l-3.594 3.594c-.225.225-.588.225-.812 0s-.225-.588 0-.812L7.188 8 3.594 4.406c-.225-.225-.225-.588 0-.812s.588-.225.813 0L8 7.187l3.594-3.594z" />
    </svg>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
}
export type {
  DialogProps,
  DialogTriggerProps,
  DialogContentProps,
  DialogHeaderProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogBodyProps,
  DialogFooterProps,
  DialogCloseProps,
}
