<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '../../internal/utils'
  import { useReducedMotion } from '../../hooks/use-reduced-motion/use-reduced-motion'
  import { getCountdownContext, type CountdownUnit } from './countdown-context'

  const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

  export type CountdownSegmentProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    /** Which unit to read from the parent `Countdown`. */
    unit?: CountdownUnit
    /** Render this number directly instead of reading context (standalone display). */
    value?: number
    /**
     * Minimum digit count; the value is zero-padded to this width.
     * @default 2
     */
    minDigits?: number
  }

  let { unit, value, minDigits = 2, class: className, ...rest }: CountdownSegmentProps = $props()

  const parts = getCountdownContext()
  const reduced = useReducedMotion()

  const resolved = $derived(value ?? (unit && parts ? parts()[unit] : 0))
  const text = $derived(String(Math.max(0, Math.trunc(resolved))).padStart(minDigits, '0'))
  const chars = $derived(text.split(''))
  const rollTransition = $derived(
    reduced.current ? 'transform 0s' : 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)',
  )
</script>

<span data-slot="countdown-segment" class={cn('inline-flex', className)} {...rest}>
  <span class="sr-only">{text}</span>
  <span aria-hidden="true" dir="ltr" class="inline-flex">
    {#each chars as char, i (i)}
      <span class="relative inline-block overflow-hidden leading-none">
        <span class="invisible">0</span>
        <span
          class="absolute inset-x-0 top-0 flex flex-col items-center"
          style={`transform: translateY(${-Number(char) * 10}%); transition: ${rollTransition}`}
        >
          {#each DIGITS as d (d)}
            <span class="flex h-[1em] items-center justify-center leading-none">{d}</span>
          {/each}
        </span>
      </span>
    {/each}
  </span>
</span>
