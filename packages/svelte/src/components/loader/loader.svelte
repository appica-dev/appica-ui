<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '../../internal/utils'
  import { useReducedMotion } from '../../hooks/use-reduced-motion/use-reduced-motion'

  type LoaderVariant = 'bar' | 'dots'
  type VariantColors = { indicator: string; track: string }

  export type LoaderProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    /**
     * The animated shape.
     * @default 'bar'
     */
    variant?: LoaderVariant
    /**
     * Inherit the surrounding text color (`currentColor`) instead of the primary accent.
     * @default false
     */
    currentColor?: boolean
  }

  const LOADER_SIZE = 'text-[2.5rem]'
  const PRIMARY_COLORS: VariantColors = { indicator: 'text-primary', track: 'text-primary-soft' }
  const CURRENT_COLORS: VariantColors = { indicator: 'text-current', track: 'text-current/20' }

  let {
    variant = 'bar',
    currentColor = false,
    'aria-label': ariaLabel = 'Loading',
    class: className,
    ...rest
  }: LoaderProps = $props()

  const reduced = useReducedMotion()
  const colors = $derived(currentColor ? CURRENT_COLORS : PRIMARY_COLORS)
  const clipId = $props.id()
</script>

<span
  data-slot="loader"
  role="status"
  aria-label={ariaLabel}
  class={cn('inline-flex shrink-0 items-center justify-center align-middle', LOADER_SIZE, className)}
  {...rest}
>
  {#if variant === 'bar'}
    <svg
      width="1.4em"
      height="0.2em"
      viewBox="0 0 44 6"
      fill="currentColor"
      aria-hidden="true"
      class={cn('size-[1em] h-[0.2em]! w-[1.4em]!', colors.indicator)}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width="44" height="6" rx="3"></rect>
        </clipPath>
      </defs>
      <rect x="0" y="0" width="44" height="6" rx="3" class={colors.track}></rect>
      <g clip-path="url(#{clipId})">
        {#if reduced.current}
          <rect x="12" y="0" width="20" height="6" rx="3"></rect>
        {:else}
          <rect y="0" height="6" rx="3" x="-15.4" width="15.4" class="appica-loader-bar-a"></rect>
          <rect y="0" height="6" rx="3" x="-88" width="88" class="appica-loader-bar-b"></rect>
        {/if}
      </g>
    </svg>
  {:else}
    <svg
      width="0.8em"
      height="0.35em"
      viewBox="0 0 28 12"
      fill="currentColor"
      aria-hidden="true"
      class={cn('size-[1em] h-[0.35em]! w-[0.8em]!', colors.indicator)}
    >
      {#each [0, 1, 2] as i (i)}
        {#if reduced.current}
          <circle cx={4 + i * 10} cy="6" r="4"></circle>
        {:else}
          <circle cy="6" cx="28" r="0" class="appica-loader-dot" style={`animation-delay: ${-(0.85 + i) * 1.6}s`}
          ></circle>
        {/if}
      {/each}
    </svg>
  {/if}
</span>

<style>
  .appica-loader-bar-a {
    animation: appica-loader-bar-a 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
  }
  .appica-loader-bar-b {
    animation: appica-loader-bar-b 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
  }
  .appica-loader-dot {
    animation: appica-loader-dot 2.4s linear infinite;
  }
  @keyframes appica-loader-bar-a {
    0% {
      x: -15.4px;
      width: 15.4px;
    }
    60%,
    100% {
      x: 44px;
      width: 39.6px;
    }
  }
  @keyframes appica-loader-bar-b {
    0% {
      x: -88px;
      width: 88px;
    }
    60%,
    100% {
      x: 47.08px;
      width: 0.44px;
    }
  }
  @keyframes appica-loader-dot {
    0%,
    1% {
      cx: 28px;
      r: 0px;
    }
    50% {
      cx: 14px;
      r: 6px;
    }
    100% {
      cx: 0px;
      r: 0px;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .appica-loader-bar-a,
    .appica-loader-bar-b,
    .appica-loader-dot {
      animation: none;
    }
  }
</style>
