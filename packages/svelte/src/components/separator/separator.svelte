<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type SeparatorVariant = 'solid' | 'dashed' | 'dotted' | 'double' | 'gradient' | 'wave' | 'zigzag'
  type Orientation = 'horizontal' | 'vertical'

  const separatorVariants: Record<SeparatorVariant, string> = {
    solid: 'border-current border-solid data-[orientation=horizontal]:border-t data-[orientation=vertical]:border-l',
    dashed:
      'text-border-strong border-current border-dashed data-[orientation=horizontal]:border-t data-[orientation=vertical]:border-l',
    dotted: 'text-border-strong',
    double:
      'border-current border-double data-[orientation=horizontal]:border-t-[calc(var(--border-width)*3)] data-[orientation=vertical]:border-l-[calc(var(--border-width)*3)]',
    gradient:
      'data-[orientation=horizontal]:h-(--border-width) data-[orientation=horizontal]:bg-[linear-gradient(to_right,transparent,currentColor_26%,currentColor_74%,transparent)] data-[orientation=vertical]:w-(--border-width) data-[orientation=vertical]:bg-[linear-gradient(to_bottom,transparent,currentColor_26%,currentColor_74%,transparent)]',
    wave: '',
    zigzag: '',
  }

  type DecorativeDim = { w: number; h: number; d: string }
  const decorativeVariants: Partial<
    Record<SeparatorVariant, { strokeScale: number; horizontal: DecorativeDim; vertical: DecorativeDim }>
  > = {
    dotted: {
      strokeScale: 1.75,
      horizontal: { w: 6, h: 8, d: 'M3 4 L3 4' },
      vertical: { w: 8, h: 6, d: 'M4 3 L4 3' },
    },
    wave: {
      strokeScale: 1.5,
      horizontal: { w: 16, h: 8, d: 'M0 4 Q4 1 8 4 T16 4' },
      vertical: { w: 8, h: 16, d: 'M4 0 Q1 4 4 8 T4 16' },
    },
    zigzag: {
      strokeScale: 1.5,
      horizontal: { w: 16, h: 8, d: 'M0 6 L4 2 L8 6 L12 2 L16 6' },
      vertical: { w: 8, h: 16, d: 'M6 0 L2 4 L6 8 L2 12 L6 16' },
    },
  }

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Line style. `gradient`, `wave`, `zigzag`, and `dotted` are decorative.
     * @default 'solid'
     */
    variant?: SeparatorVariant
    /**
     * Axis the rule follows.
     * @default 'horizontal'
     */
    orientation?: Orientation
    /**
     * When `true`, the rule is hidden from the accessibility tree (`role="none"`).
     * @default false
     */
    decorative?: boolean
    children?: Snippet
  }

  let {
    class: className,
    variant = 'solid',
    orientation = 'horizontal',
    decorative = false,
    children,
    ...rest
  }: Props = $props()

  const isDecorative = $derived(variant in decorativeVariants)
  const config = $derived(decorativeVariants[variant])
  const horizontal = $derived(orientation === 'horizontal')
  const dim = $derived(config ? (horizontal ? config.horizontal : config.vertical) : null)
  const patternId = $props.id()
</script>

<div
  data-slot="separator"
  data-orientation={orientation}
  role={decorative ? 'none' : 'separator'}
  aria-orientation={decorative ? undefined : orientation}
  class={cn(
    'text-border shrink-0 data-[orientation=horizontal]:w-full data-[orientation=vertical]:self-stretch',
    separatorVariants[variant],
    className,
  )}
  {...rest}
>
  {#if isDecorative && config && dim}
    <svg
      aria-hidden="true"
      focusable="false"
      class="block"
      width={horizontal ? '100%' : dim.w}
      height={horizontal ? dim.h : '100%'}
    >
      <pattern id={patternId} width={dim.w} height={dim.h} patternUnits="userSpaceOnUse">
        <path
          d={dim.d}
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="stroke-width: calc(var(--border-width) * {config.strokeScale})"
        />
      </pattern>
      <rect width="100%" height="100%" fill="url(#{patternId})" />
    </svg>
  {:else}
    {@render children?.()}
  {/if}
</div>
