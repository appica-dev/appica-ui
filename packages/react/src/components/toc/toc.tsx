'use client'

import * as React from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cn } from '../../internal/utils'

type TocContextValue = {
  activeIds: readonly string[]
  currentId: string | null
  highlight: boolean
  register: (id: string, element: HTMLElement) => () => void
  getLinkElement: (id: string) => HTMLElement | undefined
}

const TocContext = React.createContext<TocContextValue | null>(null)

function useTocContext(component: string): TocContextValue {
  const ctx = React.useContext(TocContext)
  if (!ctx) throw new Error(`Appica UI: <${component}> must be used within <Toc>.`)
  return ctx
}

function areSameIds(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

function closestHeadingId(ids: readonly string[], rootBounds: DOMRectReadOnly | null) {
  if (!rootBounds) return null
  let closest: string | null = null
  let minDistance = Number.POSITIVE_INFINITY
  for (const id of ids) {
    const heading = document.getElementById(id)
    if (!heading) continue
    const distance = Math.abs(heading.getBoundingClientRect().top - rootBounds.top)
    if (distance < minDistance) {
      minDistance = distance
      closest = id
    }
  }
  return closest
}

interface TocProps extends React.ComponentPropsWithoutRef<'nav'> {
  /**
   * `IntersectionObserver` `rootMargin` (`top right bottom left`) - offset the active boundary, e.g. for a sticky
   * header.
   * @default '0px'
   */
  rootMargin?: string
  /**
   * Tints the area behind the active links, with the indicator line along its edge.
   * @default false
   */
  highlight?: boolean
}

function Toc({ className, rootMargin = '0px', highlight = false, ...props }: TocProps) {
  const [ids, setIds] = React.useState<readonly string[]>([])
  const [activeIds, setActiveIds] = React.useState<readonly string[]>([])
  const linkElementsRef = React.useRef(new Map<string, HTMLElement>())

  const register = React.useCallback((id: string, element: HTMLElement) => {
    linkElementsRef.current.set(id, element)
    setIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    return () => {
      linkElementsRef.current.delete(id)
      setIds((prev) => prev.filter((existing) => existing !== id))
    }
  }, [])

  const getLinkElement = React.useCallback((id: string) => linkElementsRef.current.get(id), [])

  React.useEffect(() => {
    if (ids.length === 0) {
      setActiveIds((prev) => (prev.length === 0 ? prev : []))
      return
    }
    if (typeof IntersectionObserver === 'undefined') return
    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        let next = ids.filter((id) => visible.has(id))
        if (next.length === 0) {
          const fallback = closestHeadingId(ids, entries[0]?.rootBounds ?? null)
          if (fallback) next = [fallback]
        }
        setActiveIds((prev) => (areSameIds(prev, next) ? prev : next))
      },
      { rootMargin },
    )
    for (const id of ids) {
      const heading = document.getElementById(id)
      if (heading) observer.observe(heading)
    }
    return () => observer.disconnect()
  }, [ids, rootMargin])

  const ctx = React.useMemo<TocContextValue>(
    () => ({ activeIds, currentId: activeIds[0] ?? null, highlight, register, getLinkElement }),
    [activeIds, highlight, register, getLinkElement],
  )

  return (
    <TocContext.Provider value={ctx}>
      <nav data-slot="toc" aria-label="Table of contents" className={className} {...props} />
    </TocContext.Provider>
  )
}

type TocListProps = React.ComponentPropsWithoutRef<'ul'>

const INDICATOR_VARIANTS: Record<'line' | 'highlight', string> = {
  line: 'before:w-0.5 before:bg-foreground-intense',
  highlight: cn(
    'isolate before:-z-1 before:inset-e-0 before:rounded-e-2xs',
    'before:border-s-2 before:border-foreground-intense before:bg-background-soft before:backdrop-blur-md',
  ),
}

function TocList({ className, style, ...props }: TocListProps) {
  const { activeIds, highlight, getLinkElement } = useTocContext('TocList')
  const listRef = React.useRef<HTMLUListElement>(null)
  const [indicator, setIndicator] = React.useState({ top: 0, height: 0, visible: false })
  const [animate, setAnimate] = React.useState(false)

  React.useEffect(() => {
    const measure = () => {
      let top = Number.POSITIVE_INFINITY
      let bottom = Number.NEGATIVE_INFINITY
      for (const id of activeIds) {
        const link = getLinkElement(id)
        if (!link) continue
        top = Math.min(top, link.offsetTop)
        bottom = Math.max(bottom, link.offsetTop + link.offsetHeight)
      }
      setIndicator((prev) => {
        if (bottom <= top) return prev.visible ? { ...prev, visible: false } : prev
        const height = bottom - top
        if (prev.visible && prev.top === top && prev.height === height) return prev
        return { top, height, visible: true }
      })
    }
    measure()
    const list = listRef.current
    if (!list || typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(list)
    return () => resizeObserver.disconnect()
  }, [activeIds, getLinkElement])

  React.useEffect(() => {
    if (!indicator.visible || animate) return
    const frame = requestAnimationFrame(() => setAnimate(true))
    return () => cancelAnimationFrame(frame)
  }, [indicator.visible, animate])

  return (
    <ul
      ref={listRef}
      data-slot="toc-list"
      role="list"
      className={cn(
        'border-border relative flex flex-col border-s',
        'before:pointer-events-none before:absolute before:-inset-s-px',
        'before:top-(--toc-indicator-top) before:h-(--toc-indicator-height)',
        INDICATOR_VARIANTS[highlight ? 'highlight' : 'line'],
        'before:transition-opacity before:duration-300 before:ease-out',
        animate && 'before:transition-[top,height,opacity]',
        'motion-reduce:before:transition-none',
        indicator.visible ? 'before:opacity-100' : 'before:opacity-0',
        className,
      )}
      style={
        {
          ...style,
          '--toc-indicator-top': `${indicator.top}px`,
          '--toc-indicator-height': `${indicator.height}px`,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

type TocItemProps = React.ComponentPropsWithoutRef<'li'>

function TocItem({ className, ...props }: TocItemProps) {
  return <li data-slot="toc-item" className={className} {...props} />
}

type TocLinkState = {
  active: boolean
}

const DEPTH_INDENT: Record<number, string> = {
  2: 'ps-4',
  3: 'ps-7',
  4: 'ps-10',
  5: 'ps-13',
  6: 'ps-16',
}

interface TocLinkProps extends useRender.ComponentProps<'a', TocLinkState> {
  /** **Required.** The target heading, as a hash (`#id`). The `id` after `#` is the heading observed. */
  href: string
  /**
   * Heading level (2-6); controls the indentation. Higher = deeper indent.
   * @default 2
   */
  depth?: number
}

function TocLink({ className, depth = 2, href, render, ref, ...props }: TocLinkProps) {
  const { activeIds, currentId, highlight, register } = useTocContext('TocLink')
  const id = href.startsWith('#') ? href.slice(1) : null
  const linkRef = React.useRef<HTMLAnchorElement>(null)

  React.useEffect(() => {
    const element = linkRef.current
    if (!id || !element) return
    return register(id, element)
  }, [id, register])

  const active = id !== null && activeIds.includes(id)

  return useRender({
    defaultTagName: 'a',
    render,
    ref: ref ? [linkRef, ref] : linkRef,
    state: { active } satisfies TocLinkState,
    props: mergeProps<'a'>(
      {
        href,
        'data-slot': 'toc-link',
        'aria-current': id !== null && currentId === id ? 'location' : undefined,
        className: cn(
          'text-foreground-muted block transform-gpu py-1.5 text-sm font-medium outline-none',
          'transition duration-250 motion-reduce:transition-none',
          'hover:text-foreground-intense focus-visible:text-foreground-intense data-active:text-foreground-intense',
          'active:scale-[0.98] active:translate-y-px active:duration-100 active:ease-in-out',
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='stroke-'])]:stroke-[1.85] [&_svg:not([class*='size-'])]:size-4.5",
          DEPTH_INDENT[Math.min(Math.max(Math.trunc(depth), 2), 6)],
          highlight && 'pe-3',
          className,
        ),
      } as unknown as React.AnchorHTMLAttributes<HTMLAnchorElement>,
      props,
    ),
  })
}

export { Toc, TocList, TocItem, TocLink }
export type { TocProps, TocListProps, TocItemProps, TocLinkProps, TocLinkState }
