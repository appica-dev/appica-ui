'use client'

import * as React from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cn, focusableProps } from '../../internal/utils'
import { buttonVariants } from '../button/button-variants'

type PaginationVariant = 'outline' | 'soft'
type PaginationSize = 'sm' | 'md' | 'lg'

interface PaginationContextValue {
  variant: PaginationVariant
  size: PaginationSize
}

const PaginationContext = React.createContext<PaginationContextValue | null>(null)

function usePaginationContext() {
  const ctx = React.useContext(PaginationContext)
  if (!ctx) {
    throw new Error('Pagination sub-components must be rendered inside <Pagination>')
  }
  return ctx
}

interface PaginationProps extends React.ComponentPropsWithoutRef<'nav'> {
  /**
   * Link style, shared with every link via context.
   * @default 'outline'
   */
  variant?: PaginationVariant
  /**
   * Link sizing, shared via context.
   * @default 'md'
   */
  size?: PaginationSize
}

function Pagination({ className, variant = 'outline', size = 'md', ...props }: PaginationProps) {
  const ctx = React.useMemo<PaginationContextValue>(() => ({ variant, size }), [variant, size])

  return (
    <PaginationContext.Provider value={ctx}>
      <nav
        aria-label="pagination"
        data-slot="pagination"
        className={cn('data-disabled:opacity-disabled flex w-fit', className)}
        {...props}
      />
    </PaginationContext.Provider>
  )
}

type PaginationListProps = React.ComponentPropsWithoutRef<'ul'>

function PaginationList({ className, ...props }: PaginationListProps) {
  return <ul data-slot="pagination-list" className={cn('flex items-center gap-1', className)} {...props} />
}

type PaginationItemProps = React.ComponentPropsWithoutRef<'li'>

function PaginationItem({ className, ...props }: PaginationItemProps) {
  return <li data-slot="pagination-item" className={className} {...props} />
}

type PaginationLinkState = {
  active: boolean
  disabled: boolean
  variant: PaginationVariant
  size: PaginationSize
}

interface PaginationLinkProps extends useRender.ComponentProps<'a', PaginationLinkState> {
  /**
   * Mark the current page. Renders a non-interactive, filled link with `aria-current="page"`.
   * @default false
   */
  active?: boolean
  /**
   * Make the link non-interactive and dimmed (`aria-disabled`); used for out-of-range controls.
   * @default false
   */
  disabled?: boolean
}

const LINK_SIZE_OVERRIDES: Record<PaginationSize, string> = {
  sm: 'px-2 gap-0.5 text-xs min-w-8 has-data-[icon=end]:pe-1 has-data-[icon=start]:ps-1',
  md: 'px-2.5 gap-0.5 text-sm min-w-10 has-data-[icon=end]:pe-1.5 has-data-[icon=start]:ps-1.5',
  lg: 'px-3 gap-0.5 text-base min-w-12 has-data-[icon=end]:pe-2 has-data-[icon=start]:ps-2',
}

function PaginationLink({ className, active = false, disabled = false, render, ...props }: PaginationLinkProps) {
  const { variant, size } = usePaginationContext()

  return useRender({
    defaultTagName: 'a',
    render,
    state: { active, disabled, variant, size } satisfies PaginationLinkState,
    props: mergeProps<'a'>(
      {
        'data-slot': 'pagination-link',
        'data-active': active || undefined,
        'aria-current': active ? 'page' : undefined,
        ...(active && !disabled ? {} : focusableProps(disabled)),
        className: cn(
          buttonVariants({ variant, size }),
          LINK_SIZE_OVERRIDES[size],
          active &&
            'text-primary-foreground pointer-events-none cursor-default before:bg-primary before:border-transparent',
          disabled && 'opacity-disabled pointer-events-none',
          className,
        ),
      } as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>,
      props,
    ),
  })
}

type PaginationEllipsisProps = React.ComponentPropsWithoutRef<'span'>

const ELLIPSIS_SIZE: Record<PaginationSize, string> = {
  sm: 'h-8 w-6 pb-1 [&_svg]:size-4',
  md: 'h-10 w-7 pb-1.5 [&_svg]:size-4.5',
  lg: 'h-12 w-8 pb-2 [&_svg]:size-5',
}

function PaginationEllipsis({ className, children, ...props }: PaginationEllipsisProps) {
  const { size } = usePaginationContext()

  return (
    <span
      data-slot="pagination-ellipsis"
      aria-hidden
      className={cn('text-foreground-strong inline-flex items-end justify-center', ELLIPSIS_SIZE[size], className)}
      {...props}
    >
      {children ?? <EllipsisMark />}
    </span>
  )
}

function EllipsisMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
    </svg>
  )
}

export { Pagination, PaginationList, PaginationItem, PaginationLink, PaginationEllipsis }
export type { PaginationProps, PaginationListProps, PaginationItemProps, PaginationLinkProps, PaginationEllipsisProps }
