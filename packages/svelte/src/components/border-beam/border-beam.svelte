<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type BorderBeamTrigger = 'hover' | 'press'

  const RING_MASK = 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Beam color. It lights the head of the comet and fades to transparent along the tail, so pass a solid color
     * rather than a gradient.
     * @default 'var(--primary)'
     */
    color?: string
    /**
     * How much of the border the comet spans, in percent of one lap.
     * @default 10
     */
    length?: number
    /**
     * Beam thickness in px.
     * @default 1
     */
    thickness?: number
    /**
     * Seconds for one full lap around the border.
     * @default 5
     */
    speed?: number
    /**
     * Seconds before the first lap starts. Negative values start the beam mid-lap, which is how you desynchronize a
     * group of cards.
     * @default 0
     */
    delay?: number
    /**
     * Reveal only on interaction. `'hover'` is pointer-only; `'press'` works on touch. Combine via an array. Omit for
     * always-on.
     */
    revealOn?: BorderBeamTrigger | BorderBeamTrigger[]
    /** Controlled visibility for programmatic states (loading, etc.); OR-ed with `revealOn`. */
    reveal?: boolean
    /**
     * With `revealOn="hover"`, keep the beam visible on touch devices (which have no hover) instead of hidden.
     * @default false
     */
    showOnTouch?: boolean
    /**
     * Scale the beam down while pressed, to track a child `Button`'s own active-press scale.
     * @default false
     */
    pressScale?: boolean
    children?: Snippet
  }

  let {
    color = 'var(--primary)',
    length = 10,
    thickness = 1,
    speed = 5,
    delay = 0,
    revealOn,
    reveal,
    showOnTouch = false,
    pressScale = false,
    class: className,
    style,
    children,
    ...rest
  }: Props = $props()

  const triggers = $derived(revealOn == null ? [] : Array.isArray(revealOn) ? revealOn : [revealOn])
  const managed = $derived(triggers.length > 0 || reveal !== undefined)
  const grouped = $derived(managed || pressScale)
  const transition = $derived(
    managed && pressScale
      ? '[transition:opacity_500ms_ease-out,scale_150ms_ease-out,translate_150ms_ease-out]'
      : managed
        ? 'transition-opacity duration-500 ease-out'
        : pressScale
          ? '[transition:scale_150ms_ease-out,translate_150ms_ease-out]'
          : undefined,
  )
  const ringClasses = $derived(
    cn(
      'pointer-events-none absolute inset-0 rounded-[inherit] rtl:transform-[scaleX(-1)]',
      'motion-safe:animate-border-beam motion-reduce:hidden',
      managed && 'opacity-0 [animation-play-state:paused]',
      managed &&
        triggers.includes('hover') &&
        'group-hover/beam:opacity-100 group-hover/beam:[animation-play-state:running]',
      managed &&
        triggers.includes('hover') &&
        showOnTouch &&
        'hover-none:opacity-100 hover-none:[animation-play-state:running]',
      managed &&
        triggers.includes('press') &&
        'group-active/beam:opacity-100 group-active/beam:[animation-play-state:running]',
      managed && reveal && 'opacity-100 [animation-play-state:running]',
      pressScale && 'group-active/beam:translate-y-px group-active/beam:scale-[0.97]',
      transition,
    ),
  )
  const rootStyle = $derived(
    `--border-beam-duration: ${speed}s; --border-beam-delay: ${delay}s;${style ? ` ${style}` : ''}`,
  )
  const ringStyle = $derived(
    `background: conic-gradient(from var(--border-beam-angle), transparent, ${color} ${length}%, transparent calc(${length}% * 1.2)); padding: ${thickness}px; -webkit-mask: ${RING_MASK}; -webkit-mask-composite: xor; mask: ${RING_MASK}; mask-composite: exclude`,
  )
</script>

<div
  data-slot="border-beam"
  data-reveal={managed ? triggers.join(' ') : undefined}
  data-revealed={reveal ? '' : undefined}
  data-show-on-touch={showOnTouch ? '' : undefined}
  class={cn('relative rounded-xl', grouped && 'group/beam', className)}
  style={rootStyle}
  {...rest}
>
  {@render children?.()}
  <span aria-hidden="true" data-slot="border-beam-ring" class={ringClasses} style={ringStyle}></span>
</div>
