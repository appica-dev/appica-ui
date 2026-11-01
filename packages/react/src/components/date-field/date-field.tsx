'use client'

import * as React from 'react'
import { format as formatDate, formatISO, getDaysInMonth, isValid } from 'date-fns'
import { type VariantProps } from 'class-variance-authority'
import { useFieldRootContext } from '@base-ui/react/internals/field-root-context'
import { useLabelableContext, useLabelableId } from '@base-ui/react/internals/labelable-provider'
import { cn } from '../../internal/utils'
import { useDirection } from '../../hooks/use-direction'
import { inputVariants } from '../input/input-variants'

type DateFieldVariant = NonNullable<VariantProps<typeof inputVariants>['variant']>
type DateFieldSize = NonNullable<VariantProps<typeof inputVariants>['size']>

type SegmentType = 'day' | 'month' | 'year'
type SegmentToken = 'd' | 'dd' | 'M' | 'MM' | 'MMM' | 'MMMM' | 'y' | 'yy' | 'yyyy'

interface SegmentNode {
  kind: 'segment'
  type: SegmentType
  token: SegmentToken
  index: number
}
interface LiteralNode {
  kind: 'literal'
  text: string
}
type FormatNode = SegmentNode | LiteralNode

interface DateFieldProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'onChange'> {
  /** Controlled value. Pair with `onValueChange`. */
  value?: Date | null
  /** Uncontrolled initial value. */
  defaultValue?: Date | null
  /** Fires with a `Date` when complete, or `null` when cleared. */
  onValueChange?: (date: Date | null) => void
  /**
   * date-fns token string defining the segments and separators.
   * @default 'MM/dd/yyyy'
   */
  format?: string
  /**
   * Field appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: DateFieldVariant
  /**
   * Height, padding, and text scale.
   * @default 'md'
   */
  size?: DateFieldSize
  /** Content pinned to the start edge. */
  startSlot?: React.ReactNode
  /** Content pinned to the end edge. */
  endSlot?: React.ReactNode
  /**
   * Blocks interaction and removes the segments from the tab order.
   * @default false
   */
  disabled?: boolean
  /**
   * Segments stay focusable and readable but can't be edited.
   * @default false
   */
  readOnly?: boolean
  /**
   * Marks the hidden form input as required (needs `name`).
   * @default false
   */
  required?: boolean
  /** Renders a hidden `<input>` with the ISO date for form submission. */
  name?: string
  /**
   * Drop the input appearance - for composing inside another field (used by `DatePicker`).
   * @default false
   */
  unstyled?: boolean
  /** Ref to the underlying element. */
  ref?: React.Ref<HTMLDivElement>
}

interface Parts {
  year: number | null
  month: number | null
  day: number | null
}

const EMPTY_PARTS: Parts = { year: null, month: null, day: null }

const TOKEN_PATTERN = 'MMMM|MMM|MM|M|dd|d|yyyy|yy|y'

const PLACEHOLDERS: Record<SegmentToken, string> = {
  d: 'D',
  dd: 'DD',
  M: 'M',
  MM: 'MM',
  MMM: 'Mon',
  MMMM: 'Month',
  y: 'YYYY',
  yy: 'YY',
  yyyy: 'YYYY',
}

const MONTH_SHORT = Array.from({ length: 12 }, (_, i) => formatDate(new Date(2020, i, 1), 'MMM'))
const MONTH_LONG = Array.from({ length: 12 }, (_, i) => formatDate(new Date(2020, i, 1), 'MMMM'))

function parseFormat(formatStr: string): FormatNode[] {
  const nodes: FormatNode[] = []
  const re = new RegExp(TOKEN_PATTERN, 'g')
  let lastIndex = 0
  let segmentIndex = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(formatStr)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ kind: 'literal', text: formatStr.slice(lastIndex, match.index) })
    }
    const token = match[0] as SegmentToken
    const type: SegmentType = token[0] === 'M' ? 'month' : token[0] === 'y' ? 'year' : 'day'
    nodes.push({ kind: 'segment', type, token, index: segmentIndex++ })
    lastIndex = match.index + token.length
  }
  if (lastIndex < formatStr.length) {
    nodes.push({ kind: 'literal', text: formatStr.slice(lastIndex) })
  }
  return nodes
}

function partsFromDate(d: Date | null | undefined): Parts {
  if (!d || !isValid(d)) return EMPTY_PARTS
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() }
}

function safeIso(d: Date | null | undefined): string {
  return d instanceof Date && isValid(d) ? d.toISOString() : ''
}

function partsToDate(p: Parts): Date | null {
  if (p.year == null || p.month == null || p.day == null) return null
  const d = new Date(p.year, p.month - 1, p.day)
  if (!isValid(d)) return null
  if (d.getFullYear() !== p.year || d.getMonth() !== p.month - 1 || d.getDate() !== p.day) return null
  return d
}

function clampDay(p: Parts): Parts {
  if (p.day == null || p.month == null) return p
  const year = p.year ?? 2000
  const maxDay = getDaysInMonth(new Date(year, p.month - 1, 1))
  return p.day > maxDay ? { ...p, day: maxDay } : p
}

function expandTwoDigitYear(yy: number): number {
  return yy < 70 ? 2000 + yy : 1900 + yy
}

function getPartFor(type: SegmentType, p: Parts): number | null {
  return type === 'day' ? p.day : type === 'month' ? p.month : p.year
}

function setPartFor(type: SegmentType, p: Parts, value: number | null): Parts {
  if (type === 'day') return { ...p, day: value }
  if (type === 'month') return { ...p, month: value }
  return { ...p, year: value }
}

function getSegmentRange(token: SegmentToken, p: Parts): { min: number; max: number; maxDigits: number } {
  if (token === 'yy') return { min: 0, max: 99, maxDigits: 2 }
  if (token === 'yyyy' || token === 'y') return { min: 1, max: 9999, maxDigits: 4 }
  if (token === 'MMMM' || token === 'MMM' || token === 'MM' || token === 'M') {
    return { min: 1, max: 12, maxDigits: 2 }
  }
  const year = p.year ?? 2000
  const monthIdx = (p.month ?? 1) - 1
  return { min: 1, max: getDaysInMonth(new Date(year, monthIdx, 1)), maxDigits: 2 }
}

function displayPart(part: number | null, token: SegmentToken): string {
  if (part == null) return PLACEHOLDERS[token]
  if (token === 'MMM') return MONTH_SHORT[part - 1] ?? PLACEHOLDERS[token]
  if (token === 'MMMM') return MONTH_LONG[part - 1] ?? PLACEHOLDERS[token]
  if (token === 'dd' || token === 'MM') return String(part).padStart(2, '0')
  if (token === 'yy') return String(part % 100).padStart(2, '0')
  return String(part)
}

function ariaText(part: number | null, token: SegmentToken): string {
  if (part == null) return 'Empty'
  if (token === 'MMM' || token === 'MMMM') return MONTH_LONG[part - 1] ?? String(part)
  return String(part)
}

function findMonthByLetter(letter: string, current: number | null): number {
  const lower = letter.toLowerCase()
  const start = current ?? 0
  for (let i = 1; i <= 12; i++) {
    const idx = (start + i - 1) % 12
    if (MONTH_LONG[idx]!.toLowerCase().startsWith(lower)) return idx + 1
  }
  return current ?? 1
}

function DateField({
  className,
  value,
  defaultValue,
  onValueChange,
  format = 'MM/dd/yyyy',
  variant = 'outline',
  size = 'md',
  startSlot,
  endSlot,
  disabled: disabledProp,
  readOnly,
  required,
  name: nameProp,
  unstyled,
  ref,
  ...rest
}: DateFieldProps) {
  const direction = useDirection()
  const isRtl = direction === 'rtl'
  const field = useFieldRootContext(true)
  const disabled = disabledProp || field.disabled
  const name = nameProp ?? field.name
  const ariaInvalid = rest['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true' || field.invalid === true
  const resolvedAriaInvalid = ariaInvalid ?? (invalid || undefined)
  const { labelId, getDescriptionProps } = useLabelableContext()
  useLabelableId({ id: null })

  const nodes = React.useMemo(() => parseFormat(format), [format])
  const segmentCount = React.useMemo(() => nodes.reduce((n, x) => n + (x.kind === 'segment' ? 1 : 0), 0), [nodes])

  const isControlled = value !== undefined
  const [internalParts, setInternalParts] = React.useState<Parts>(() => partsFromDate(value ?? defaultValue))

  const lastValueIsoRef = React.useRef<string>(safeIso(value))
  const lastCommittedRef = React.useRef<string>(partsToDate(partsFromDate(value ?? defaultValue))?.toISOString() ?? '')

  React.useEffect(() => {
    if (!isControlled) return
    const iso = safeIso(value)
    if (iso !== lastValueIsoRef.current) {
      lastValueIsoRef.current = iso
      lastCommittedRef.current = iso
      setInternalParts(partsFromDate(value))
    }
  }, [isControlled, value])

  // Always render from internalParts so partial input (e.g. just a day, no month/year yet)
  // stays visible even when controlled. External value changes resync internalParts via the effect above.
  const parts = internalParts

  const partsRef = React.useRef(parts)
  const onValueChangeRef = React.useRef(onValueChange)
  React.useEffect(() => {
    partsRef.current = parts
    onValueChangeRef.current = onValueChange
  })

  const commit = React.useCallback((updater: (prev: Parts) => Parts) => {
    const next = clampDay(updater(partsRef.current))
    partsRef.current = next
    setInternalParts(next)
    const date = partsToDate(next)
    if (date) {
      const iso = date.toISOString()
      if (iso !== lastCommittedRef.current) {
        lastCommittedRef.current = iso
        onValueChangeRef.current?.(date)
      }
      return
    }
    // No valid date yet. Only notify parent when the user truly cleared every
    // segment; intermediate partial input (e.g. just a year, or day=0 mid-typing)
    // stays internal so the parent doesn't reset its committed value.
    const allEmpty = next.day == null && next.month == null && next.year == null
    if (allEmpty && lastCommittedRef.current !== '') {
      lastCommittedRef.current = ''
      onValueChangeRef.current?.(null)
    }
  }, [])

  const segmentRefs = React.useRef<Array<HTMLSpanElement | null>>([])
  const typingCountRef = React.useRef<Map<number, number>>(new Map())

  const setSegmentRef = React.useMemo(() => {
    const cache = new Map<number, (el: HTMLSpanElement | null) => void>()
    return (index: number) => {
      let cb = cache.get(index)
      if (!cb) {
        cb = (el) => {
          segmentRefs.current[index] = el
        }
        cache.set(index, cb)
      }
      return cb
    }
  }, [])

  const focusSegment = React.useCallback((idx: number) => {
    segmentRefs.current[idx]?.focus()
  }, [])

  const onRootMouseDown = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return
      const target = e.target as HTMLElement
      if (target.closest('[data-slot="date-field-segment"]')) return
      if (target.closest('button, a, input, select, textarea, label, [role="button"]')) return
      e.preventDefault()
      const firstEmpty = nodes.find(
        (n): n is SegmentNode => n.kind === 'segment' && getPartFor(n.type, partsRef.current) == null,
      )
      focusSegment(firstEmpty ? firstEmpty.index : 0)
    },
    [disabled, focusSegment, nodes],
  )

  const processCharInput = React.useCallback(
    (seg: SegmentNode, ch: string) => {
      if (disabled || readOnly) return
      const p = partsRef.current
      const partVal = getPartFor(seg.type, p)
      const range = getSegmentRange(seg.token, p)

      if (ch === '/' || ch === '-' || ch === '.' || ch === ',' || ch === ' ') {
        typingCountRef.current.delete(seg.index)
        if (seg.index < segmentCount - 1) focusSegment(seg.index + 1)
        return
      }

      if (ch >= '0' && ch <= '9') {
        const digit = Number(ch)
        const count = typingCountRef.current.get(seg.index) ?? 0
        const base = seg.token === 'yy' && partVal != null ? partVal % 100 : partVal
        let displayVal: number
        if (count === 0 || base == null) {
          displayVal = digit
        } else {
          const tentative = base * 10 + digit
          displayVal = tentative > range.max ? digit : tentative
        }
        typingCountRef.current.set(seg.index, count + 1)

        const valueToSet = seg.token === 'yy' ? expandTwoDigitYear(displayVal) : displayVal
        commit((prev) => setPartFor(seg.type, prev, valueToSet))

        const reachedMaxDigits = (typingCountRef.current.get(seg.index) ?? 0) >= range.maxDigits
        const cantFitAnother = displayVal * 10 > range.max
        if (reachedMaxDigits || cantFitAnother) {
          typingCountRef.current.delete(seg.index)
          if (seg.index < segmentCount - 1) focusSegment(seg.index + 1)
        }
        return
      }

      if ((seg.token === 'MMM' || seg.token === 'MMMM') && /[a-zA-Z]/.test(ch)) {
        typingCountRef.current.delete(seg.index)
        const next = findMonthByLetter(ch, partVal)
        commit((prev) => setPartFor('month', prev, next))
      }
    },
    [commit, disabled, focusSegment, readOnly, segmentCount],
  )

  const onSegmentKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>, seg: SegmentNode) => {
      if (disabled) return
      const p = partsRef.current
      const partVal = getPartFor(seg.type, p)
      const range = getSegmentRange(seg.token, p)

      if (e.key === 'Tab') return

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const goNext = (e.key === 'ArrowRight') !== isRtl
        typingCountRef.current.delete(seg.index)
        const target = goNext ? seg.index + 1 : seg.index - 1
        if (target >= 0 && target < segmentCount) focusSegment(target)
        return
      }

      if (e.key === 'Home') {
        e.preventDefault()
        typingCountRef.current.delete(seg.index)
        focusSegment(0)
        return
      }

      if (e.key === 'End') {
        e.preventDefault()
        typingCountRef.current.delete(seg.index)
        focusSegment(segmentCount - 1)
        return
      }

      if (readOnly) return

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        typingCountRef.current.delete(seg.index)
        const stepUp = e.key === 'ArrowUp'
        let next: number
        if (partVal == null) {
          next = stepUp ? range.min : range.max
        } else {
          const base = seg.token === 'yy' ? partVal % 100 : partVal
          let nb = stepUp ? base + 1 : base - 1
          if (nb > range.max) nb = range.min
          if (nb < range.min) nb = range.max
          next = seg.token === 'yy' ? expandTwoDigitYear(nb) : nb
        }
        commit((prev) => setPartFor(seg.type, prev, next))
        return
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        typingCountRef.current.delete(seg.index)
        if (partVal == null && e.key === 'Backspace' && seg.index > 0) {
          focusSegment(seg.index - 1)
        } else {
          commit((prev) => setPartFor(seg.type, prev, null))
        }
        return
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key.length === 1) {
        e.preventDefault()
        processCharInput(seg, e.key)
      }
    },
    [commit, disabled, focusSegment, isRtl, processCharInput, readOnly, segmentCount],
  )

  const onSegmentBeforeInput = React.useCallback(
    (e: React.FormEvent<HTMLSpanElement>, seg: SegmentNode) => {
      e.preventDefault()
      const nativeEvent = e.nativeEvent as InputEvent
      const data = nativeEvent.data ?? nativeEvent.dataTransfer?.getData('text/plain') ?? ''
      if (!data) return
      for (const ch of data) processCharInput(seg, ch)
    },
    [processCharInput],
  )

  const onSegmentFocus = React.useCallback((seg: SegmentNode) => {
    typingCountRef.current.delete(seg.index)
  }, [])

  const onSegmentBlur = React.useCallback((seg: SegmentNode) => {
    typingCountRef.current.delete(seg.index)
  }, [])

  const fullDate = partsToDate(parts)
  const hiddenValue = fullDate ? formatISO(fullDate, { representation: 'date' }) : ''

  return (
    <div
      data-slot="date-field"
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
      aria-invalid={invalid || undefined}
      aria-disabled={disabled || undefined}
      aria-labelledby={rest['aria-label'] == null ? labelId : undefined}
      aria-describedby={getDescriptionProps({})['aria-describedby']}
      role="group"
      ref={ref}
      className={cn(
        unstyled
          ? 'inline-flex min-w-0 items-center select-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed'
          : cn(
              inputVariants({ variant, size, state: 'within' }),
              'select-none',
              'data-disabled:border-border-strong! data-disabled:bg-background-subtle! data-disabled:opacity-disabled data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:border-dashed',
            ),
        className,
      )}
      {...rest}
      onMouseDown={(e) => {
        rest.onMouseDown?.(e)
        if (!e.defaultPrevented) onRootMouseDown(e)
      }}
    >
      {startSlot ? (
        <div data-slot="date-field-start" className="-ms-1 shrink-0">
          {startSlot}
        </div>
      ) : null}
      <div data-slot="date-field-segments" className="text-foreground flex min-w-0 flex-1 items-center">
        {nodes.map((node, i) => {
          if (node.kind === 'literal') {
            return (
              <span key={`l-${i}`} aria-hidden="true" className="text-foreground-subtle whitespace-pre">
                {node.text}
              </span>
            )
          }
          const partVal = getPartFor(node.type, parts)
          const range = getSegmentRange(node.token, parts)
          const isAlphaMonth = node.token === 'MMM' || node.token === 'MMMM'
          const editable = !disabled && !readOnly
          return (
            <span
              key={`s-${node.index}`}
              ref={setSegmentRef(node.index)}
              role="spinbutton"
              tabIndex={disabled ? -1 : 0}
              contentEditable={editable}
              suppressContentEditableWarning
              inputMode={isAlphaMonth ? 'text' : 'numeric'}
              enterKeyHint="next"
              autoCorrect="off"
              spellCheck={false}
              aria-label={node.type}
              aria-readonly={readOnly || undefined}
              aria-invalid={resolvedAriaInvalid}
              aria-valuemin={range.min}
              aria-valuemax={range.max}
              aria-valuenow={partVal ?? undefined}
              aria-valuetext={ariaText(partVal, node.token)}
              data-slot="date-field-segment"
              data-placeholder={partVal == null || undefined}
              onBeforeInput={(e) => onSegmentBeforeInput(e, node)}
              onKeyDown={(e) => onSegmentKeyDown(e, node)}
              onFocus={() => onSegmentFocus(node)}
              onBlur={() => onSegmentBlur(node)}
              className={cn(
                'rounded-3xs inline-block px-0.5 caret-transparent transition-colors duration-200 outline-none motion-reduce:transition-none',
                'focus:bg-(--selection-color)',
                'data-placeholder:text-foreground-subtle',
              )}
            >
              {displayPart(partVal, node.token)}
            </span>
          )
        })}
      </div>
      {endSlot ? (
        <div data-slot="date-field-end" className="-me-1 shrink-0">
          {endSlot}
        </div>
      ) : null}
      {name ? <input type="hidden" name={name} value={hiddenValue} required={required} disabled={disabled} /> : null}
    </div>
  )
}

export { DateField }
export type { DateFieldProps }
