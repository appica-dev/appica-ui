'use client'

import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { useFieldRootContext } from '@base-ui/react/internals/field-root-context'
import { useLabelableContext, useLabelableId } from '@base-ui/react/internals/labelable-provider'
import { cn } from '../../internal/utils'
import { inputVariants } from '../input/input-variants'

type TimeFieldVariant = NonNullable<VariantProps<typeof inputVariants>['variant']>
type TimeFieldSize = NonNullable<VariantProps<typeof inputVariants>['size']>

type SegmentType = 'hour24' | 'hour12' | 'minute' | 'second' | 'period'
type SegmentToken = 'H' | 'HH' | 'h' | 'hh' | 'm' | 'mm' | 's' | 'ss' | 'a'

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

interface TimeFieldProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'onChange'> {
  /** Controlled value, a 24-hour `"HH:mm[:ss]"` string. Pair with `onValueChange`. */
  value?: string | null
  /** Uncontrolled initial value. */
  defaultValue?: string | null
  /** Fires with the time string when complete, or `null` when cleared. */
  onValueChange?: (time: string | null) => void
  /**
   * date-fns token string - `H`/`HH`, `h`/`hh`, `m`/`mm`, `s`/`ss`, `a`.
   * @default 'HH:mm'
   */
  format?: string
  /**
   * Field appearance - bordered or filled.
   * @default 'outline'
   */
  variant?: TimeFieldVariant
  /**
   * Height, padding, and text scale.
   * @default 'md'
   */
  size?: TimeFieldSize
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
  /** Renders a hidden `<input>` with the time value for form submission. */
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
  hours: number | null
  minutes: number | null
  seconds: number | null
}

const EMPTY_PARTS: Parts = { hours: null, minutes: null, seconds: null }

const TOKEN_PATTERN = 'HH|H|hh|h|mm|m|ss|s|a'

const PLACEHOLDERS: Record<SegmentToken, string> = {
  H: 'HH',
  HH: 'HH',
  h: 'hh',
  hh: 'hh',
  m: 'mm',
  mm: 'mm',
  s: 'ss',
  ss: 'ss',
  a: 'AM',
}

function tokenToType(token: SegmentToken): SegmentType {
  if (token === 'H' || token === 'HH') return 'hour24'
  if (token === 'h' || token === 'hh') return 'hour12'
  if (token === 'm' || token === 'mm') return 'minute'
  if (token === 's' || token === 'ss') return 'second'
  return 'period'
}

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
    nodes.push({ kind: 'segment', type: tokenToType(token), token, index: segmentIndex++ })
    lastIndex = match.index + token.length
  }
  if (lastIndex < formatStr.length) {
    nodes.push({ kind: 'literal', text: formatStr.slice(lastIndex) })
  }
  return nodes
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function partsFromString(s: string | null | undefined): Parts {
  if (!s) return EMPTY_PARTS
  const m = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\.\d+)?$/.exec(s)
  if (!m) return EMPTY_PARTS
  const hours = Number(m[1])
  const minutes = Number(m[2])
  const seconds = m[3] != null ? Number(m[3]) : null
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return EMPTY_PARTS
  if (seconds != null && (seconds < 0 || seconds > 59)) return EMPTY_PARTS
  return { hours, minutes, seconds }
}

function partsToString(p: Parts, includeSeconds: boolean): string | null {
  if (p.hours == null || p.minutes == null) return null
  if (includeSeconds && p.seconds == null) return null
  if (includeSeconds) return `${pad2(p.hours)}:${pad2(p.minutes)}:${pad2(p.seconds!)}`
  return `${pad2(p.hours)}:${pad2(p.minutes)}`
}

function to12(h24: number): { hour12: number; period: 'AM' | 'PM' } {
  if (h24 === 0) return { hour12: 12, period: 'AM' }
  if (h24 === 12) return { hour12: 12, period: 'PM' }
  if (h24 > 12) return { hour12: h24 - 12, period: 'PM' }
  return { hour12: h24, period: 'AM' }
}

function from12(hour12: number, period: 'AM' | 'PM'): number {
  const h = hour12 % 12
  return period === 'PM' ? h + 12 : h
}

function periodOf(hours: number | null): 'AM' | 'PM' | null {
  if (hours == null) return null
  return hours >= 12 ? 'PM' : 'AM'
}

function getSegmentRange(token: SegmentToken): { min: number; max: number; maxDigits: number } {
  if (token === 'H' || token === 'HH') return { min: 0, max: 23, maxDigits: 2 }
  if (token === 'h' || token === 'hh') return { min: 1, max: 12, maxDigits: 2 }
  if (token === 'a') return { min: 0, max: 1, maxDigits: 1 }
  return { min: 0, max: 59, maxDigits: 2 }
}

function getDisplayHour12(hours: number | null): number | null {
  if (hours == null) return null
  return to12(hours).hour12
}

function displayPart(part: number | null, token: SegmentToken, parts: Parts): string {
  if (token === 'a') {
    const period = periodOf(parts.hours)
    return period ?? PLACEHOLDERS.a
  }
  if (token === 'h' || token === 'hh') {
    const h12 = getDisplayHour12(parts.hours)
    if (h12 == null) return PLACEHOLDERS[token]
    return token === 'hh' ? pad2(h12) : String(h12)
  }
  if (part == null) return PLACEHOLDERS[token]
  if (token === 'HH' || token === 'mm' || token === 'ss') return pad2(part)
  return String(part)
}

function ariaText(token: SegmentToken, parts: Parts): string {
  if (token === 'a') {
    const period = periodOf(parts.hours)
    return period ?? 'Empty'
  }
  if (token === 'h' || token === 'hh') {
    const h12 = getDisplayHour12(parts.hours)
    return h12 == null ? 'Empty' : String(h12)
  }
  const val =
    token === 'H' || token === 'HH' ? parts.hours : token === 'm' || token === 'mm' ? parts.minutes : parts.seconds
  return val == null ? 'Empty' : String(val)
}

function ariaLabel(type: SegmentType): string {
  if (type === 'hour24' || type === 'hour12') return 'hour'
  if (type === 'minute') return 'minute'
  if (type === 'second') return 'second'
  return 'period'
}

function setHourFromInput(prev: Parts, token: SegmentToken, value: number): Parts {
  if (token === 'h' || token === 'hh') {
    const period = periodOf(prev.hours) ?? 'AM'
    return { ...prev, hours: from12(value, period) }
  }
  return { ...prev, hours: value }
}

function togglePeriod(prev: Parts, target?: 'AM' | 'PM'): Parts {
  const current = periodOf(prev.hours)
  if (prev.hours == null) {
    const next: 'AM' | 'PM' = target ?? 'AM'
    return { ...prev, hours: next === 'PM' ? 12 : 0 }
  }
  const next: 'AM' | 'PM' = target ?? (current === 'AM' ? 'PM' : 'AM')
  if (next === current) return prev
  return { ...prev, hours: next === 'PM' ? prev.hours + 12 : prev.hours - 12 }
}

function TimeField({
  className,
  value,
  defaultValue,
  onValueChange,
  format = 'HH:mm',
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
}: TimeFieldProps) {
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
  const includeSeconds = React.useMemo(
    () => nodes.some((n) => n.kind === 'segment' && (n.token === 's' || n.token === 'ss')),
    [nodes],
  )

  const isControlled = value !== undefined
  const [internalParts, setInternalParts] = React.useState<Parts>(() => partsFromString(value ?? defaultValue))
  const [commitTick, setCommitTick] = React.useState(0)

  const lastValueRef = React.useRef<string>(value ?? '')
  const lastCommittedRef = React.useRef<string>(
    partsToString(partsFromString(value ?? defaultValue), includeSeconds) ?? '',
  )

  React.useEffect(() => {
    if (!isControlled) return
    const v = value ?? ''
    if (v !== lastValueRef.current) {
      lastValueRef.current = v
      lastCommittedRef.current = v
      setInternalParts(partsFromString(value))
    }
  }, [isControlled, value])

  const parts = internalParts

  const partsRef = React.useRef(parts)
  partsRef.current = parts

  const onValueChangeRef = React.useRef(onValueChange)
  onValueChangeRef.current = onValueChange

  const includeSecondsRef = React.useRef(includeSeconds)
  includeSecondsRef.current = includeSeconds

  const commit = React.useCallback((updater: (prev: Parts) => Parts) => {
    const next = updater(partsRef.current)
    setInternalParts(next)
    const serialized = partsToString(next, includeSecondsRef.current)
    if (serialized) {
      if (serialized !== lastCommittedRef.current) {
        lastCommittedRef.current = serialized
        onValueChangeRef.current?.(serialized)
        setCommitTick((t) => t + 1)
      }
      return
    }
    const allEmpty = next.hours == null && next.minutes == null && next.seconds == null
    if (allEmpty && lastCommittedRef.current !== '') {
      lastCommittedRef.current = ''
      onValueChangeRef.current?.(null)
      setCommitTick((t) => t + 1)
    }
  }, [])

  React.useEffect(() => {
    if (commitTick === 0 || !isControlled) return
    const v = value ?? ''
    const serialized = partsToString(partsRef.current, includeSecondsRef.current) ?? ''
    if (v !== serialized) {
      lastValueRef.current = v
      lastCommittedRef.current = v
      setInternalParts(partsFromString(value))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commitTick])

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
      if (target.closest('[data-slot="time-field-segment"]')) return
      if (target.closest('button, a, input, select, textarea, label, [role="button"]')) return
      e.preventDefault()
      const p = partsRef.current
      const isEmpty = (type: SegmentType) =>
        type === 'minute' ? p.minutes == null : type === 'second' ? p.seconds == null : p.hours == null
      const firstEmpty = nodes.find((n): n is SegmentNode => n.kind === 'segment' && isEmpty(n.type))
      focusSegment(firstEmpty ? firstEmpty.index : 0)
    },
    [disabled, focusSegment, nodes],
  )

  const processCharInput = React.useCallback(
    (seg: SegmentNode, ch: string) => {
      if (disabled || readOnly) return
      const p = partsRef.current

      if (seg.token === 'a') {
        if (/[aApP]/.test(ch)) {
          typingCountRef.current.delete(seg.index)
          const target: 'AM' | 'PM' = ch.toLowerCase() === 'a' ? 'AM' : 'PM'
          commit((prev) => togglePeriod(prev, target))
          return
        }
        if (ch === ':' || ch === '/' || ch === '-' || ch === '.' || ch === ',' || ch === ' ') {
          if (seg.index < segmentCount - 1) focusSegment(seg.index + 1)
        }
        return
      }

      if (ch === ':' || ch === '/' || ch === '-' || ch === '.' || ch === ',' || ch === ' ') {
        typingCountRef.current.delete(seg.index)
        if (seg.index < segmentCount - 1) focusSegment(seg.index + 1)
        return
      }

      if (ch < '0' || ch > '9') return

      const range = getSegmentRange(seg.token)
      const digit = Number(ch)
      const count = typingCountRef.current.get(seg.index) ?? 0
      const base =
        seg.token === 'h' || seg.token === 'hh'
          ? getDisplayHour12(p.hours)
          : seg.token === 'H' || seg.token === 'HH'
            ? p.hours
            : seg.token === 'm' || seg.token === 'mm'
              ? p.minutes
              : p.seconds
      let displayVal: number
      if (count === 0 || base == null) {
        displayVal = digit
      } else {
        const tentative = base * 10 + digit
        displayVal = tentative > range.max ? digit : tentative
      }
      if (displayVal < range.min) displayVal = range.min
      typingCountRef.current.set(seg.index, count + 1)

      commit((prev) => {
        if (seg.type === 'hour24' || seg.type === 'hour12') return setHourFromInput(prev, seg.token, displayVal)
        if (seg.type === 'minute') return { ...prev, minutes: displayVal }
        return { ...prev, seconds: displayVal }
      })

      const reachedMaxDigits = (typingCountRef.current.get(seg.index) ?? 0) >= range.maxDigits
      const cantFitAnother = displayVal * 10 > range.max
      if (reachedMaxDigits || cantFitAnother) {
        typingCountRef.current.delete(seg.index)
        if (seg.index < segmentCount - 1) focusSegment(seg.index + 1)
      }
    },
    [commit, disabled, focusSegment, readOnly, segmentCount],
  )

  const onSegmentKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLSpanElement>, seg: SegmentNode) => {
      if (disabled) return
      const p = partsRef.current

      if (e.key === 'Tab') return

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const goNext = e.key === 'ArrowRight'
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

      if (seg.token === 'a') {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault()
          typingCountRef.current.delete(seg.index)
          commit((prev) => togglePeriod(prev))
          return
        }
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault()
          typingCountRef.current.delete(seg.index)
          if (p.hours == null && e.key === 'Backspace' && seg.index > 0) {
            focusSegment(seg.index - 1)
          } else {
            commit((prev) => ({ ...prev, hours: null }))
          }
          return
        }
        if (e.key.length === 1) {
          e.preventDefault()
          processCharInput(seg, e.key)
        }
        return
      }

      const partVal =
        seg.token === 'h' || seg.token === 'hh'
          ? getDisplayHour12(p.hours)
          : seg.token === 'H' || seg.token === 'HH'
            ? p.hours
            : seg.token === 'm' || seg.token === 'mm'
              ? p.minutes
              : p.seconds

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault()
        typingCountRef.current.delete(seg.index)
        const range = getSegmentRange(seg.token)
        const stepUp = e.key === 'ArrowUp'
        let next: number
        if (partVal == null) {
          next = stepUp ? range.min : range.max
        } else {
          let nb = stepUp ? partVal + 1 : partVal - 1
          if (nb > range.max) nb = range.min
          if (nb < range.min) nb = range.max
          next = nb
        }
        commit((prev) => {
          if (seg.type === 'hour24' || seg.type === 'hour12') return setHourFromInput(prev, seg.token, next)
          if (seg.type === 'minute') return { ...prev, minutes: next }
          return { ...prev, seconds: next }
        })
        return
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        typingCountRef.current.delete(seg.index)
        if (partVal == null && e.key === 'Backspace' && seg.index > 0) {
          focusSegment(seg.index - 1)
        } else {
          commit((prev) => {
            if (seg.type === 'hour24' || seg.type === 'hour12') return { ...prev, hours: null }
            if (seg.type === 'minute') return { ...prev, minutes: null }
            return { ...prev, seconds: null }
          })
        }
        return
      }

      if (e.key.length === 1) {
        e.preventDefault()
        processCharInput(seg, e.key)
      }
    },
    [commit, disabled, focusSegment, processCharInput, readOnly, segmentCount],
  )

  const onSegmentBeforeInput = React.useCallback(
    (e: React.FormEvent<HTMLSpanElement>, seg: SegmentNode) => {
      e.preventDefault()
      const data = (e.nativeEvent as InputEvent).data
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

  const hiddenValue = partsToString(parts, includeSeconds) ?? ''

  return (
    <div
      data-slot="time-field"
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
        <div data-slot="time-field-start" className="-ms-1 shrink-0">
          {startSlot}
        </div>
      ) : null}
      <div data-slot="time-field-segments" dir="ltr" className="text-foreground flex min-w-0 flex-1 items-center">
        {nodes.map((node, i) => {
          if (node.kind === 'literal') {
            return (
              <span key={`l-${i}`} aria-hidden="true" className="text-foreground-subtle whitespace-pre">
                {node.text}
              </span>
            )
          }
          const isPeriod = node.token === 'a'
          const range = getSegmentRange(node.token)
          const partVal =
            node.token === 'a'
              ? null
              : node.token === 'h' || node.token === 'hh'
                ? getDisplayHour12(parts.hours)
                : node.token === 'H' || node.token === 'HH'
                  ? parts.hours
                  : node.token === 'm' || node.token === 'mm'
                    ? parts.minutes
                    : parts.seconds
          const isPlaceholder = isPeriod ? parts.hours == null : partVal == null
          const editable = !disabled && !readOnly
          const periodValue = isPeriod ? periodOf(parts.hours) : null
          const periodAriaNow = periodValue === 'AM' ? 0 : periodValue === 'PM' ? 1 : undefined
          return (
            <span
              key={`s-${node.index}`}
              ref={setSegmentRef(node.index)}
              role="spinbutton"
              tabIndex={disabled ? -1 : 0}
              contentEditable={editable}
              suppressContentEditableWarning
              inputMode={isPeriod ? 'text' : 'numeric'}
              enterKeyHint="next"
              autoCorrect="off"
              spellCheck={false}
              aria-label={ariaLabel(node.type)}
              aria-readonly={readOnly || undefined}
              aria-invalid={resolvedAriaInvalid}
              aria-valuemin={isPeriod ? 0 : range.min}
              aria-valuemax={isPeriod ? 1 : range.max}
              aria-valuenow={isPeriod ? periodAriaNow : (partVal ?? undefined)}
              aria-valuetext={ariaText(node.token, parts)}
              data-slot="time-field-segment"
              data-placeholder={isPlaceholder || undefined}
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
              {displayPart(partVal, node.token, parts)}
            </span>
          )
        })}
      </div>
      {endSlot ? (
        <div data-slot="time-field-end" className="-me-1 shrink-0">
          {endSlot}
        </div>
      ) : null}
      {name ? <input type="hidden" name={name} value={hiddenValue} required={required} disabled={disabled} /> : null}
    </div>
  )
}

export { TimeField }
export type { TimeFieldProps }
