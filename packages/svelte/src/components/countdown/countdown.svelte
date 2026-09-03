<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getParts, setCountdownContext, toTimestamp, type CountdownParts } from './countdown-context'

  export type CountdownProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    /** Absolute instant to count down to (a `Date`, epoch-ms, or date string). */
    targetDate?: Date | number | string
    /** Relative length in **seconds** from mount. Ignored when `targetDate` is set. */
    duration?: number
    /**
     * Tick interval in milliseconds.
     * @default 1000
     */
    interval?: number
    /** Fired once when the countdown reaches zero. */
    onComplete?: () => void
    /** Segments and labels. The snippet receives `{ days, hours, minutes, seconds, total, isComplete }`. */
    children?: Snippet<[CountdownParts]>
  }

  let {
    targetDate,
    duration,
    interval = 1000,
    onComplete,
    class: className,
    children,
    ...rest
  }: CountdownProps = $props()

  const mountedAt = Date.now()
  let now = $state(Date.now())
  let completed = false

  const target = $derived.by(() => {
    if (targetDate != null) {
      const ts = toTimestamp(targetDate)
      return Number.isNaN(ts) ? mountedAt : ts
    }
    if (duration != null) return mountedAt + duration * 1000
    return mountedAt
  })

  const parts = $derived(getParts(target - now))

  setCountdownContext(() => parts)

  // Tick from an external clock (setTimeout aligned to `interval`). This cannot be `$derived`.
  $effect(() => {
    const deadline = target
    const tickEvery = interval
    if (Date.now() >= deadline) {
      now = Date.now()
      return
    }
    let id: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      const current = Date.now()
      const delay = tickEvery - (current % tickEvery)
      id = setTimeout(() => {
        const t = Date.now()
        now = t
        if (t < deadline) schedule()
      }, delay)
    }
    schedule()
    return () => {
      if (id !== undefined) clearTimeout(id)
    }
  })

  $effect(() => {
    if (parts.isComplete && !completed) {
      completed = true
      onComplete?.()
    } else if (!parts.isComplete) {
      completed = false
    }
  })
</script>

<div data-slot="countdown" role="timer" class={cn('inline-flex items-center', className)} {...rest}>
  {@render children?.(parts)}
</div>
