<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type GradientGlowBlur = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  type GradientGlowTrigger = 'hover' | 'press'

  const BLUR_CLASS: Record<GradientGlowBlur, string> = {
    sm: 'blur-sm',
    md: 'blur-md',
    lg: 'blur-lg',
    xl: 'blur-xl',
    '2xl': 'blur-2xl',
    '3xl': 'blur-3xl',
  }

  const BORDER_MASK = 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * First gradient stop.
     * @default '#8EC5FF'
     */
    from?: string
    /**
     * Middle gradient stop.
     * @default '#EFADF7'
     */
    via?: string
    /**
     * Last gradient stop.
     * @default '#FFD69B'
     */
    to?: string
    /**
     * Resting gradient direction in degrees; the animation rotates a full turn around it.
     * @default 95
     */
    angle?: number
    /**
     * Softness of the glow, mapped to a Tailwind `blur-*` utility.
     * @default 'lg'
     */
    blur?: GradientGlowBlur
    /**
     * Add a 1px stroke that follows the same animated gradient.
     * @default false
     */
    border?: boolean
    /**
     * Stroke thickness in px when `border` is on.
     * @default 1
     */
    borderWidth?: number
    /**
     * Seconds for one full rotation (and one breath) of the gradient.
     * @default 4
     */
    speed?: number
    /**
     * Reveal only on interaction. `'hover'` is pointer-only; `'press'` works on touch. Combine via an array. Omit for
     * always-on.
     */
    revealOn?: GradientGlowTrigger | GradientGlowTrigger[]
    /** Controlled visibility for programmatic states (loading, etc.); OR-ed with `revealOn`. */
    reveal?: boolean
    /**
     * With `revealOn="hover"`, keep the glow visible on touch devices (which have no hover) instead of hidden.
     * @default false
     */
    showOnTouch?: boolean
    /**
     * Scale the glow down while pressed, to track a child `Button`'s own active-press scale.
     * @default false
     */
    pressScale?: boolean
    children?: Snippet
  }

  let {
    from = '#8EC5FF',
    via = '#EFADF7',
    to = '#FFD69B',
    angle = 95,
    blur = 'lg',
    border = false,
    borderWidth = 1,
    speed = 4,
    revealOn,
    reveal,
    showOnTouch = false,
    pressScale = false,
    class: className,
    style,
    children,
    ...rest
  }: Props = $props()

  const gradient = $derived(
    `linear-gradient(calc(${angle}deg + var(--gradient-glow-rotation, 0deg)), ${from} 3.64%, ${via} 53.35%, ${to} 95.37%)`,
  )

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

  const layerClasses = $derived(
    grouped
      ? cn(
          transition,
          managed && 'opacity-0 [animation-play-state:paused]',
          managed &&
            triggers.includes('hover') &&
            'group-hover/glow:opacity-(--gradient-glow-opacity) group-hover/glow:[animation-play-state:running]',
          managed &&
            triggers.includes('hover') &&
            showOnTouch &&
            'hover-none:opacity-(--gradient-glow-opacity) hover-none:[animation-play-state:running]',
          managed &&
            triggers.includes('press') &&
            'group-active/glow:opacity-(--gradient-glow-opacity) group-active/glow:[animation-play-state:running]',
          managed && reveal && 'opacity-(--gradient-glow-opacity) [animation-play-state:running]',
          pressScale && 'group-active/glow:scale-[0.97] group-active/glow:translate-y-px',
        )
      : undefined,
  )

  const rootStyle = $derived(`--gradient-glow-duration: ${speed}s;${style ? ` ${style}` : ''}`)
  const auraStyle = $derived(`background: ${gradient}`)
  const borderStyle = $derived(
    `background: ${gradient}; padding: ${borderWidth}px; -webkit-mask: ${BORDER_MASK}; -webkit-mask-composite: xor; mask: ${BORDER_MASK}; mask-composite: exclude`,
  )
</script>

<div
  data-slot="gradient-glow"
  data-reveal={managed ? triggers.join(' ') : undefined}
  data-revealed={reveal ? '' : undefined}
  data-show-on-touch={showOnTouch ? '' : undefined}
  class={cn(
    'relative isolate rounded-2xl [--gradient-glow-opacity:1] dark:[--gradient-glow-opacity:0.6]',
    grouped && 'group/glow',
    className,
  )}
  style={rootStyle}
  {...rest}
>
  <span
    aria-hidden="true"
    data-slot="gradient-glow-aura"
    class={cn(
      'motion-safe:animate-gradient-glow-aura pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-(--gradient-glow-opacity)',
      BLUR_CLASS[blur],
      layerClasses,
    )}
    style={auraStyle}
  ></span>
  {@render children?.()}
  {#if border}
    <span
      aria-hidden="true"
      data-slot="gradient-glow-border"
      class={cn(
        'motion-safe:animate-gradient-glow pointer-events-none absolute inset-0 rounded-[inherit] opacity-(--gradient-glow-opacity)',
        layerClasses,
      )}
      style={borderStyle}
    ></span>
  {/if}
</div>
