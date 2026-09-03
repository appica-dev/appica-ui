import type { DrawerSide } from './drawer-context'

export const VIEWPORT_SIDE: Record<DrawerSide, string> = {
  bottom: 'items-end justify-center',
  top: 'items-start justify-center',
  left: 'items-stretch justify-start',
  right: 'items-stretch justify-end',
}

export const POPUP_SIDE: Record<DrawerSide, string> = {
  bottom: 'w-full origin-bottom max-h-full',
  top: 'w-full origin-top max-h-full',
  left: 'h-full w-96 max-w-full origin-left',
  right: 'h-full w-96 max-w-full origin-right',
}

export const SHADOW_SIDE: Record<DrawerSide, string> = {
  bottom: 'shadow-[0_-24px_32px_-12px_var(--shadow-color)]',
  top: 'shadow-2xl',
  left: 'shadow-[24px_0_32px_-12px_var(--shadow-color)]',
  right: 'shadow-[-24px_0_32px_-12px_var(--shadow-color)]',
}

export const HANDLE_SIDE: Record<DrawerSide, string> = {
  bottom:
    'before:absolute before:top-1.5 before:left-1/2 before:h-1 before:w-11.5 before:-translate-x-1/2 before:rounded-full',
  top: 'before:absolute before:bottom-1.5 before:left-1/2 before:h-1 before:w-11.5 before:-translate-x-1/2 before:rounded-full',
  left: 'before:absolute before:inset-e-1.5 before:top-1/2 before:h-11.5 before:w-1 before:-translate-y-1/2 before:rounded-full',
  right:
    'before:absolute before:inset-s-1.5 before:top-1/2 before:h-11.5 before:w-1 before:-translate-y-1/2 before:rounded-full',
}

export const FRAME_PAD_SIDE: Record<DrawerSide, string> = {
  bottom: 'pt-4!',
  top: 'pb-4!',
  left: 'pe-4!',
  right: 'ps-4!',
}

export const CONTENT_RECLAIM_SIDE: Record<DrawerSide, string> = {
  bottom: 'overflow-hidden [&>[data-slot=drawer-header]]:-mt-4 [&>[data-slot=drawer-close-button]]:top-0',
  top: 'overflow-hidden [&>[data-slot=drawer-footer]]:-mb-4',
  left: 'overflow-hidden [&>:not([data-slot=drawer-close-button])]:-me-4 [&>[data-slot=drawer-close-button]]:inset-e-0',
  right: 'overflow-hidden [&>:not([data-slot=drawer-close-button])]:-ms-4',
}
