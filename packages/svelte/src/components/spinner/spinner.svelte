<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '../../internal/utils'
  import { useReducedMotion } from '../../hooks/use-reduced-motion/use-reduced-motion'
  import { SPARKLE_MORPH_PATH, attachSparkle } from './spinner-sparkle'

  type SpinnerVariant = 'circular' | 'dots' | 'sparkle'
  type VariantColors = { indicator: string; track: string }

  export type SpinnerProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    /**
     * The animated shape.
     * @default 'circular'
     */
    variant?: SpinnerVariant
    /**
     * Inherit the surrounding text color (`currentColor`) instead of the primary accent.
     * @default false
     */
    currentColor?: boolean
  }

  const SPINNER_SIZE = 'text-[2.5rem]'
  const PRIMARY_COLORS: VariantColors = { indicator: 'text-primary', track: 'text-primary-soft' }
  const CURRENT_COLORS: VariantColors = { indicator: 'text-current', track: 'text-current/20' }
  const DOT_COUNT = 12
  const DOT_CYCLE = 1.2
  const DOT_INDICES = Array.from({ length: DOT_COUNT }, (_, i) => i)

  let {
    variant = 'circular',
    currentColor = false,
    'aria-label': ariaLabel = 'Loading',
    class: className,
    ...rest
  }: SpinnerProps = $props()

  const reduced = useReducedMotion()
  const colors = $derived(currentColor ? CURRENT_COLORS : PRIMARY_COLORS)
</script>

<span
  data-slot="spinner"
  role="status"
  aria-label={ariaLabel}
  class={cn('inline-flex shrink-0 items-center justify-center align-middle', SPINNER_SIZE, className)}
  {...rest}
>
  {#if variant === 'circular'}
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      stroke-width="4"
      stroke-linecap="round"
      aria-hidden="true"
      class={cn('size-[1em] stroke-4!', colors.indicator)}
    >
      <circle cx="20" cy="20" r="16" class={colors.track}></circle>
      <circle
        cx="20"
        cy="20"
        r="16"
        pathLength="1"
        stroke-dasharray="0.25 0.75"
        class={reduced.current ? undefined : 'appica-spinner-circular'}
      ></circle>
    </svg>
  {:else if variant === 'dots'}
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 40 40"
      fill="currentColor"
      aria-hidden="true"
      class={cn('size-[1em]', colors.indicator)}
    >
      {#each DOT_INDICES as i (i)}
        <rect
          x="18"
          y="2"
          width="4"
          height="6"
          rx="2"
          transform="rotate({i * (360 / DOT_COUNT)} 20 20)"
          opacity={reduced.current ? 0.25 : undefined}
          class={reduced.current ? undefined : 'appica-spinner-dot'}
          style={reduced.current ? undefined : `animation-delay: ${(i / DOT_COUNT) * DOT_CYCLE - DOT_CYCLE}s`}
        ></rect>
      {/each}
    </svg>
  {:else}
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
      stroke-linecap="round"
      aria-hidden="true"
      class={cn('size-[1em]', colors.indicator)}
    >
      {#if reduced.current}
        <path d={SPARKLE_MORPH_PATH}></path>
      {:else}
        <path d={SPARKLE_MORPH_PATH} {@attach attachSparkle}></path>
      {/if}
    </svg>
  {/if}
</span>

<style>
  .appica-spinner-circular {
    animation: appica-spinner-dash 0.9s linear infinite;
  }
  .appica-spinner-dot {
    animation: appica-spinner-dot 1.2s linear infinite;
  }
  @keyframes appica-spinner-dash {
    to {
      stroke-dashoffset: -1;
    }
  }
  @keyframes appica-spinner-dot {
    0% {
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .appica-spinner-circular,
    .appica-spinner-dot {
      animation: none;
    }
  }
</style>
