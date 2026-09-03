<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { patternCell, patternTint, type BackgroundPatternVariant } from './background-pattern-shared'
  import BackgroundPatternInteractive from './background-pattern-interactive.svelte'
  import BackgroundPatternLayer from './background-pattern-layer.svelte'

  type SpotlightConfig = { size?: number | string; persistent?: boolean }

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Pattern texture painted behind the content.
     * @default 'dots'
     */
    variant?: BackgroundPatternVariant
    /**
     * Cursor-following highlight. `true` for a 200px fading highlight; a number/length sizes it; an object with
     * `persistent: true` keeps it always on.
     * @default false
     */
    spotlight?: boolean | number | string | SpotlightConfig
    /** Cell size in px; overrides the per-variant default (dots 14, grid/dashed-grid 28, hexagons 40). */
    cellSize?: number
    /**
     * Where the spotlight reads pointer movement. `'self'` tracks over this element; `'window'` tracks anywhere - for a
     * pattern positioned behind unrelated content.
     * @default 'self'
     */
    track?: 'self' | 'window'
    children?: Snippet
  }

  let {
    variant = 'dots',
    spotlight = false,
    cellSize,
    track = 'self',
    class: className,
    style,
    children,
    ...rest
  }: Props = $props()

  function resolveSpotlight(
    value: Props['spotlight'],
  ): { size?: number | string; persistent: boolean } | null {
    if (!value) return null
    if (value === true) return { persistent: false }
    if (typeof value === 'object') return { size: value.size, persistent: value.persistent ?? false }
    return { size: value, persistent: false }
  }

  const spot = $derived(resolveSpotlight(spotlight))
  const rootStyle = $derived.by(() => {
    const parts = [`--pattern-cell: ${cellSize ?? patternCell(variant)}px`]
    if (spot?.size != null) {
      parts.push(`--spotlight-size: ${typeof spot.size === 'number' ? `${spot.size}px` : spot.size}`)
    }
    if (style) parts.push(String(style))
    return parts.join('; ')
  })
</script>

<div
  data-slot="background-pattern"
  class={cn(
    'relative isolate [--pattern-color:var(--color-border-intense)] [--pattern-highlight:var(--spotlight-size)] [--spotlight-size:200px]',
    className,
  )}
  style={rootStyle}
  {...rest}
>
  <BackgroundPatternLayer {variant} class={cn('-z-10 text-(--pattern-color)', patternTint(variant))} />
  {#if spot}
    <BackgroundPatternInteractive {variant} persistent={spot.persistent} {track} />
  {/if}
  {@render children?.()}
</div>
