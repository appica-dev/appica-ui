import type { ClassValue } from 'clsx'
import { cn } from '../../internal/utils'
import type { ContextMenuSize } from './context-menu-context'

export const POPUP_SIZE: Record<ContextMenuSize, string> = {
  sm: 'min-w-40 rounded-md',
  md: 'min-w-48 rounded-lg',
  lg: 'min-w-56 rounded-xl',
}

export const ICON_SIZE: Record<ContextMenuSize, string> = {
  sm: 'size-4',
  md: 'size-4.5',
  lg: 'size-5',
}

export const ITEM_TEXT: Record<ContextMenuSize, string> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-1.5',
}

export const GROUP_LABEL_SIZE: Record<ContextMenuSize, string> = {
  sm: 'px-2.5 pt-1.5 pb-1 text-xs',
  md: 'px-3 pt-2 pb-1.25 text-sm',
  lg: 'px-3.5 pt-2.5 pb-1.5 text-base',
}

export const ITEM_BASE = 'w-full outline-hidden'

export function popupClassName(size: ContextMenuSize, className?: ClassValue) {
  return cn(
    'max-h-(--bits-context-menu-content-available-height) w-(--bits-context-menu-anchor-width) bg-background border-border-overlay flex flex-col border shadow-2xl outline-none',
    POPUP_SIZE[size],
    'origin-(--bits-context-menu-content-transform-origin)',
    'motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
    'data-[state=closed]:motion-safe:scale-95 data-[state=closed]:motion-safe:opacity-0',
    'data-starting-style:motion-safe:scale-90 data-starting-style:motion-safe:opacity-0',
    'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
    className,
  )
}
