'use client'

import * as React from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cn, focusableProps } from '../../internal/utils'

type BreadcrumbProps = React.ComponentPropsWithoutRef<'nav'>

function Breadcrumb({ className, ...props }: BreadcrumbProps) {
  return (
    <nav
      data-slot="breadcrumb"
      aria-label="breadcrumb"
      className={cn('text-foreground-muted w-fit text-sm font-medium', className)}
      {...props}
    />
  )
}

type BreadcrumbListProps = React.ComponentPropsWithoutRef<'ol'>

function BreadcrumbList({ className, ...props }: BreadcrumbListProps) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'flex flex-wrap items-center gap-1.5 wrap-break-word',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='stroke-'])]:stroke-[1.85]",
        className,
      )}
      {...props}
    />
  )
}

type BreadcrumbItemProps = React.ComponentPropsWithoutRef<'li'>

function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5 [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    />
  )
}

type BreadcrumbLinkState = {
  active: boolean
  disabled: boolean
}

interface BreadcrumbLinkProps extends useRender.ComponentProps<'a', BreadcrumbLinkState> {
  /**
   * Mark the current page. Renders a non-interactive `<span>` with `aria-current="page"`.
   * @default false
   */
  active?: boolean
  /**
   * Make the link non-interactive and dimmed.
   * @default false
   */
  disabled?: boolean
}

function BreadcrumbLink({ className, active = false, disabled = false, render, ...props }: BreadcrumbLinkProps) {
  return useRender({
    defaultTagName: active ? 'span' : 'a',
    render,
    state: { active, disabled } satisfies BreadcrumbLinkState,
    props: mergeProps<'a'>(
      {
        'data-slot': 'breadcrumb-link',
        'data-active': active || undefined,
        'aria-current': active ? 'page' : undefined,
        ...(active && !disabled ? {} : focusableProps(disabled)),
        className: cn(
          'inline-flex items-center gap-1.5 outline-ring',
          'transition duration-250 motion-reduce:transition-none',
          active
            ? 'text-foreground-intense pointer-events-none'
            : 'hover:text-foreground-intense ease-spring active:scale-[0.97] active:duration-100 active:ease-in-out active:translate-y-px',
          disabled && 'opacity-disabled pointer-events-none',
          className,
        ),
      } as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>,
      props,
    ),
  })
}

type BreadcrumbSeparatorProps = React.ComponentPropsWithoutRef<'li'>

function BreadcrumbSeparator({ className, children, ...props }: BreadcrumbSeparatorProps) {
  return (
    <li
      role="presentation"
      aria-hidden
      data-slot="breadcrumb-separator"
      className={cn(
        "flex min-w-3.5 items-center justify-center text-center [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...props}
    >
      {children ?? <SeparatorIcon />}
    </li>
  )
}

function SeparatorIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" aria-hidden="true" className="rtl:rotate-180">
      <path d="M4.808 3.058c.244-.244.641-.244.885 0l3.5 3.5c.244.244.244.641 0 .885l-3.5 3.5c-.244.244-.641.244-.885 0s-.244-.641 0-.885L7.865 7 4.808 3.942c-.244-.244-.244-.641 0-.885z" />
    </svg>
  )
}

type BreadcrumbEllipsisProps = React.ComponentPropsWithoutRef<'span'>

function BreadcrumbEllipsis({ className, children, ...props }: BreadcrumbEllipsisProps) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden
      className={cn('inline-flex items-center justify-center [&_svg]:size-4.5!', className)}
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

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbEllipsis }
export type {
  BreadcrumbProps,
  BreadcrumbListProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbSeparatorProps,
  BreadcrumbEllipsisProps,
}
