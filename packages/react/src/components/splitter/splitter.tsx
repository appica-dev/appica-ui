'use client'

import * as React from 'react'
import { useDirection } from '../../hooks/use-direction'
import { cn } from '../../internal/utils'

type SplitterOrientation = 'horizontal' | 'vertical'
type ResizeMode = 'drag' | 'step'

interface PanelConstraints {
  min: number
  max: number
  collapsible: boolean
  collapsedSize: number
}

interface SplitterApi {
  register: (id: string, constraints: PanelConstraints) => () => void
  resize: (
    index: number,
    target: number,
    mode: ResizeMode,
    from: readonly number[],
    current: readonly number[],
  ) => number[] | null
  restoredSize: (index: number) => number
  commit: (sizes: readonly number[]) => void
  setDragging: (dragging: boolean) => void
  measure: () => number
}

interface SplitterContextValue {
  orientation: SplitterOrientation
  keyboardStep: number
  sizes: readonly number[]
  ids: readonly (string | undefined)[]
  constraints: readonly PanelConstraints[]
  mounted: boolean
  api: SplitterApi
}

interface ScannedPanel {
  id: string | undefined
  constraints: PanelConstraints
}

const DEFAULT_CONSTRAINTS: PanelConstraints = { min: 0, max: 100, collapsible: false, collapsedSize: 0 }
const EPSILON = 1e-6

const SplitterContext = React.createContext<SplitterContextValue | null>(null)
const SplitterIndexContext = React.createContext(-1)

function useSplitterContext(component: string): SplitterContextValue {
  const ctx = React.useContext(SplitterContext)
  if (!ctx) throw new Error(`Appica UI: <${component}> must be used within <Splitter>.`)
  return ctx
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function toConstraints({
  minSize = 0,
  maxSize = 100,
  collapsible = false,
  collapsedSize = 0,
}: Pick<SplitterPanelProps, 'minSize' | 'maxSize' | 'collapsible' | 'collapsedSize'>): PanelConstraints {
  const min = clamp(minSize, 0, 100)
  return { min, max: clamp(maxSize, min, 100), collapsible, collapsedSize: clamp(collapsedSize, 0, min) }
}

function sameConstraints(a: PanelConstraints | undefined, b: PanelConstraints) {
  return (
    a !== undefined &&
    a.min === b.min &&
    a.max === b.max &&
    a.collapsible === b.collapsible &&
    a.collapsedSize === b.collapsedSize
  )
}

function sameIds(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

function isPanel(node: Element) {
  return node.getAttribute('data-slot') === 'splitter-panel'
}

function normalizeSizes(input: readonly (number | undefined)[] | undefined, count: number): number[] {
  if (count <= 0) return []
  const values = Array.from({ length: count }, (_, index) => {
    const value = input?.[index]
    return value !== undefined && Number.isFinite(value) && value >= 0 ? value : undefined
  })
  const known = values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
  const missing = values.filter((value) => value === undefined).length
  const fill = missing === 0 ? 0 : known < 100 ? (100 - known) / missing : 100 / count
  const filled = values.map((value) => value ?? fill)
  const total = filled.reduce((sum, value) => sum + value, 0)
  return filled.map((value) => (total > 0 ? (value * 100) / total : 100 / count))
}

function isCollapsed(size: number | undefined, c: PanelConstraints) {
  return c.collapsible && size !== undefined && Math.abs(size - c.collapsedSize) < EPSILON
}

function allows(c: PanelConstraints, size: number) {
  return isCollapsed(size, c) || (size > c.min - EPSILON && size < c.max + EPSILON)
}

function snapsShut(target: number, current: number, c: PanelConstraints, mode: ResizeMode) {
  if (!isCollapsed(current, c)) return mode === 'drag' && target < (c.collapsedSize + c.min) / 2
  return mode === 'drag' ? target < c.min : target <= current
}

function fit(target: number, current: number, c: PanelConstraints, mode: ResizeMode) {
  if (c.collapsible && c.collapsedSize < c.min) {
    if (Math.abs(target - c.collapsedSize) < EPSILON || snapsShut(target, current, c, mode)) return c.collapsedSize
  }
  return clamp(target, c.min, c.max)
}

function resizePair(
  from: readonly number[],
  current: readonly number[],
  index: number,
  target: number,
  constraints: readonly PanelConstraints[],
  mode: ResizeMode,
): number[] | null {
  const a = constraints[index]
  const b = constraints[index + 1]
  const fromA = from[index]
  const fromB = from[index + 1]
  const currentA = current[index]
  const currentB = current[index + 1]
  if (!a || !b || fromA === undefined || fromB === undefined || currentA === undefined || currentB === undefined) {
    return null
  }

  const pair = fromA + fromB
  let first = fit(target, currentA, a, mode)
  let second = fit(pair - first, currentB, b, mode)
  first = pair - second
  if (!allows(a, first)) {
    first = fit(first, currentA, a, mode)
    second = pair - first
    if (!allows(b, second)) return null
  }
  if (Math.abs(first - currentA) < EPSILON && Math.abs(second - currentB) < EPSILON) return null

  const next = [...from]
  next[index] = first
  next[index + 1] = second
  return next
}

function scanChildren(children: React.ReactNode) {
  const panels: ScannedPanel[] = []
  const content = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child
    if (child.type === SplitterPanel) {
      const props = child.props as SplitterPanelProps
      const index = panels.push({ id: props.id, constraints: toConstraints(props) }) - 1
      return <SplitterIndexContext.Provider value={index}>{child}</SplitterIndexContext.Provider>
    }
    if (child.type === SplitterHandle) {
      return <SplitterIndexContext.Provider value={panels.length - 1}>{child}</SplitterIndexContext.Provider>
    }
    return child
  })
  return { content, panels }
}

const rootClasses =
  'flex h-full w-full data-[orientation=vertical]:flex-col data-dragging:select-none data-dragging:data-[orientation=horizontal]:cursor-col-resize data-dragging:data-[orientation=vertical]:cursor-row-resize data-dragging:*:data-[slot=splitter-panel]:pointer-events-none'

interface SplitterProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Axis the panels are laid out along. Horizontal places them side by side, vertical stacks them.
   * @default 'horizontal'
   */
  orientation?: SplitterOrientation
  /** Panel sizes as percentages, in DOM order. Pass it to control the component. */
  sizes?: number[]
  /** Panel sizes on first render, as percentages in DOM order, when the component is uncontrolled. Panels split evenly without it. */
  defaultSizes?: number[]
  /** Fires on every change, including each frame of a drag, with the sizes in DOM order. */
  onSizesChange?: (sizes: number[]) => void
  /** Fires once a drag ends or a key press settles, with the sizes landed on. */
  onSizesCommitted?: (sizes: number[]) => void
  /**
   * Percentage an arrow key moves a handle by.
   * @default 5
   */
  keyboardStep?: number
}

function Splitter({
  orientation = 'horizontal',
  sizes: sizesProp,
  defaultSizes,
  onSizesChange,
  onSizesCommitted,
  keyboardStep = 5,
  className,
  children,
  ...props
}: SplitterProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const restoreRef = React.useRef(new Map<string, number>())
  const [panelIds, setPanelIds] = React.useState<readonly string[] | null>(null)
  const [registry, setRegistry] = React.useState<Readonly<Record<string, PanelConstraints>>>({})
  const [internal, setInternal] = React.useState<Readonly<Record<string, number>> | null>(null)
  const [dragging, setDragging] = React.useState(false)

  const { content, panels } = React.useMemo(() => scanChildren(children), [children])

  const ids = React.useMemo(() => panelIds ?? panels.map((panel) => panel.id), [panelIds, panels])
  const constraints = React.useMemo(
    () =>
      panelIds ? panelIds.map((id) => registry[id] ?? DEFAULT_CONSTRAINTS) : panels.map((panel) => panel.constraints),
    [panelIds, registry, panels],
  )
  const sizes = React.useMemo(
    () =>
      normalizeSizes(
        sizesProp ?? (internal && panelIds ? panelIds.map((id) => internal[id]) : defaultSizes),
        ids.length,
      ),
    [sizesProp, internal, panelIds, defaultSizes, ids.length],
  )

  const latest = { orientation, ids, constraints, keyboardStep, sizesProp, onSizesChange, onSizesCommitted }
  const latestRef = React.useRef(latest)
  latestRef.current = latest

  React.useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const next = Array.from(root.children)
      .filter(isPanel)
      .map((node) => node.id)
    setPanelIds((prev) => (prev && sameIds(prev, next) ? prev : next))
  }, [content, registry])

  const api = React.useMemo<SplitterApi>(
    () => ({
      register: (id, panelConstraints) => {
        setRegistry((prev) =>
          sameConstraints(prev[id], panelConstraints) ? prev : { ...prev, [id]: panelConstraints },
        )
        return () =>
          setRegistry((prev) => {
            const { [id]: _removed, ...rest } = prev
            return rest
          })
      },
      resize: (index, target, mode, from, current) => {
        const latest = latestRef.current
        const next = resizePair(from, current, index, target, latest.constraints, mode)
        if (!next) return null
        for (const k of [index, index + 1]) {
          const c = latest.constraints[k]
          const id = latest.ids[k]
          const before = current[k]
          const start = from[k]
          if (!c || !id || before === undefined || start === undefined) continue
          if (isCollapsed(next[k], c) && !isCollapsed(before, c)) {
            restoreRef.current.set(id, isCollapsed(start, c) ? before : start)
          }
        }
        if (latest.sizesProp === undefined) {
          const entries = latest.ids.flatMap((id, k) => (id === undefined ? [] : [[id, next[k] ?? 0] as const]))
          setInternal((prev) => ({ ...prev, ...Object.fromEntries(entries) }))
        }
        latest.onSizesChange?.(next)
        return next
      },
      restoredSize: (index) => {
        const latest = latestRef.current
        const c = latest.constraints[index] ?? DEFAULT_CONSTRAINTS
        const id = latest.ids[index]
        const restored = id === undefined ? undefined : restoreRef.current.get(id)
        return restored ?? Math.max(c.min, c.collapsedSize + latest.keyboardStep)
      },
      commit: (committed) => latestRef.current.onSizesCommitted?.([...committed]),
      setDragging,
      measure: () => {
        const rect = rootRef.current?.getBoundingClientRect()
        if (!rect) return 0
        return latestRef.current.orientation === 'vertical' ? rect.height : rect.width
      },
    }),
    [],
  )

  const ctx = React.useMemo<SplitterContextValue>(
    () => ({ orientation, keyboardStep, sizes, ids, constraints, mounted: panelIds !== null, api }),
    [orientation, keyboardStep, sizes, ids, constraints, panelIds, api],
  )

  return (
    <SplitterContext.Provider value={ctx}>
      <div
        ref={rootRef}
        {...props}
        data-slot="splitter"
        data-orientation={orientation}
        data-dragging={dragging ? '' : undefined}
        className={cn(rootClasses, className)}
      >
        {content}
      </div>
    </SplitterContext.Provider>
  )
}

interface SplitterPanelProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Smallest size the panel resizes to, as a percentage.
   * @default 0
   */
  minSize?: number
  /**
   * Largest size the panel resizes to, as a percentage.
   * @default 100
   */
  maxSize?: number
  /**
   * Let the panel snap to `collapsedSize` when dragged halfway from `minSize` toward it, or with Home and Enter on the handle after it.
   * @default false
   */
  collapsible?: boolean
  /**
   * Size of the panel while collapsed, as a percentage.
   * @default 0
   */
  collapsedSize?: number
}

function SplitterPanel({
  minSize,
  maxSize,
  collapsible,
  collapsedSize,
  id: idProp,
  className,
  style,
  ...props
}: SplitterPanelProps) {
  const { sizes, ids, mounted, api } = useSplitterContext('SplitterPanel')
  const renderIndex = React.useContext(SplitterIndexContext)
  const generatedId = React.useId()
  const id = idProp ?? generatedId
  const constraints = toConstraints({ minSize, maxSize, collapsible, collapsedSize })
  const { min, max, collapsible: canCollapse, collapsedSize: collapsedAt } = constraints
  const { register } = api

  React.useLayoutEffect(
    () => register(id, { min, max, collapsible: canCollapse, collapsedSize: collapsedAt }),
    [register, id, min, max, canCollapse, collapsedAt],
  )

  const size = sizes[mounted ? ids.indexOf(id) : renderIndex]

  return (
    <div
      {...props}
      id={id}
      data-slot="splitter-panel"
      data-collapsed={isCollapsed(size, constraints) ? '' : undefined}
      className={cn('min-h-0 min-w-0 overflow-hidden', className)}
      style={{ ...style, flex: `${size ?? 1} 1 0px` }}
    />
  )
}

// The line is a pseudo-element that scales to 2px, so the handle keeps its 1px box and the panels never shift.
const handleClasses = cn(
  'group/splitter-handle outline-ring relative z-10 shrink-0 touch-none select-none focus-visible:outline-2',
  'after:bg-border after:absolute after:inset-0 after:-z-1 after:transition-[scale] after:duration-250 motion-reduce:after:transition-none',
  'data-[orientation=horizontal]:hover:after:scale-x-200 data-[orientation=horizontal]:data-dragging:after:scale-x-200',
  'data-[orientation=vertical]:hover:after:scale-y-200 data-[orientation=vertical]:data-dragging:after:scale-y-200',
  'before:absolute data-[orientation=horizontal]:before:inset-y-0 data-[orientation=vertical]:before:inset-x-0',
  'data-[orientation=horizontal]:w-(--border-width) data-[orientation=horizontal]:cursor-col-resize data-[orientation=horizontal]:before:-inset-x-1.5 data-[orientation=horizontal]:pointer-coarse:before:-inset-x-3',
  'data-[orientation=vertical]:h-(--border-width) data-[orientation=vertical]:cursor-row-resize data-[orientation=vertical]:before:-inset-y-1.5 data-[orientation=vertical]:pointer-coarse:before:-inset-y-3',
)

const gripClasses = cn(
  'bg-background border-border text-foreground-muted absolute top-1/2 left-1/2 flex -translate-1/2 items-center justify-center gap-1 rounded-full border shadow-xs',
  'dark:bg-background-subtle dark:backdrop-blur-xl',
  'transition-[border-width] duration-250 group-hover/splitter-handle:border-2 group-data-dragging/splitter-handle:border-2 motion-reduce:transition-none',
  'data-[orientation=horizontal]:h-7 data-[orientation=horizontal]:w-4 data-[orientation=horizontal]:flex-col data-[orientation=vertical]:h-4 data-[orientation=vertical]:w-7',
)

const gripDot = <span className="size-0.75 rounded-full bg-current" />

interface SplitterHandleProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Show a pill with dots on the line, to mark it as draggable.
   * @default false
   */
  grip?: boolean
}

interface DragState {
  pointerId: number
  origin: number
  extent: number
  from: readonly number[]
  latest: readonly number[] | null
}

function SplitterHandle({
  grip = false,
  className,
  children,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: SplitterHandleProps) {
  const { orientation, keyboardStep, sizes, ids, constraints, mounted, api } = useSplitterContext('SplitterHandle')
  const rtl = useDirection() === 'rtl'
  const vertical = orientation === 'vertical'
  const renderIndex = React.useContext(SplitterIndexContext)
  const handleRef = React.useRef<HTMLDivElement>(null)
  const dragRef = React.useRef<DragState | null>(null)
  const [domIndex, setDomIndex] = React.useState<number | null>(null)
  const [dragging, setDragging] = React.useState(false)

  React.useLayoutEffect(() => {
    if (!mounted) return
    let node = handleRef.current?.previousElementSibling ?? null
    while (node && !isPanel(node)) node = node.previousElementSibling
    setDomIndex(node ? ids.indexOf(node.id) : -1)
  }, [mounted, ids])

  const index = domIndex ?? renderIndex
  const size = sizes[index]
  const c = constraints[index]
  const resizable = index >= 0 && index + 1 < sizes.length && size !== undefined && c !== undefined
  const neighbor = constraints[index + 1]
  const pair = (size ?? 0) + (sizes[index + 1] ?? 0)
  const valueMin = c && Math.max(c.collapsible ? c.collapsedSize : c.min, neighbor ? pair - neighbor.max : 0)
  const valueMax =
    c && Math.min(c.max, neighbor ? pair - (neighbor.collapsible ? neighbor.collapsedSize : neighbor.min) : 100)

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || !resizable) return
    const forward = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
    const backward = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
    const targets: Record<string, number | undefined> = {
      [forward]: size + keyboardStep,
      [backward]: size - keyboardStep,
      Home: c.collapsible ? c.collapsedSize : c.min,
      End: c.max,
      Enter: c.collapsible ? (isCollapsed(size, c) ? api.restoredSize(index) : c.collapsedSize) : undefined,
    }
    const target = targets[event.key]
    if (target === undefined) return
    event.preventDefault()
    const next = api.resize(index, target, 'step', sizes, sizes)
    if (next) api.commit(next)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerDown?.(event)
    if (event.defaultPrevented || !resizable || (event.pointerType === 'mouse' && event.button !== 0)) return
    const extent = api.measure()
    if (!extent) return
    dragRef.current = {
      pointerId: event.pointerId,
      origin: vertical ? event.clientY : event.clientX,
      extent,
      from: sizes,
      latest: null,
    }
    setDragging(true)
    api.setDragging(true)
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {}
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(event)
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const delta = (((vertical ? event.clientY : event.clientX) - drag.origin) / drag.extent) * 100
    const target = (drag.from[index] ?? 0) + (!vertical && rtl ? -delta : delta)
    const next = api.resize(index, target, 'drag', drag.from, drag.latest ?? drag.from)
    if (next) drag.latest = next
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(false)
    api.setDragging(false)
    if (drag.latest) api.commit(drag.latest)
  }

  return (
    <div
      ref={handleRef}
      role="separator"
      tabIndex={0}
      aria-orientation={vertical ? 'horizontal' : 'vertical'}
      data-base-ui-swipe-ignore=""
      {...props}
      aria-valuenow={size === undefined ? undefined : Math.round(size)}
      aria-valuemin={valueMin === undefined ? undefined : Math.round(valueMin)}
      aria-valuemax={valueMax === undefined ? undefined : Math.round(valueMax)}
      aria-controls={ids[index]}
      data-slot="splitter-handle"
      data-orientation={orientation}
      data-dragging={dragging ? '' : undefined}
      className={cn(handleClasses, className)}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        onPointerUp?.(event)
        endDrag(event)
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event)
        endDrag(event)
      }}
    >
      {grip ? (
        <span data-slot="splitter-grip" data-orientation={orientation} aria-hidden="true" className={gripClasses}>
          {gripDot}
          {gripDot}
          {gripDot}
        </span>
      ) : null}
      {children}
    </div>
  )
}

export { Splitter, SplitterPanel, SplitterHandle }
export type { SplitterProps, SplitterPanelProps, SplitterHandleProps }
