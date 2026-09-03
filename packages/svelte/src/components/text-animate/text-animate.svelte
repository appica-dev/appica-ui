<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { useReducedMotion } from '../../hooks/use-reduced-motion/use-reduced-motion'
  import { cn } from '../../internal/utils'
  import TextAnimateUnit from './text-animate-unit.svelte'
  import {
    clamp01,
    cssStyle,
    resolvePreset,
    tokenize,
    type TextAnimateEffect,
    type TextAnimateEffectName,
    type TextAnimateSegment,
  } from './text-animate-model'

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
    /** The text to animate. Use `\n` for explicit line breaks. */
    text: string
    /**
     * A preset name (`typewriter`, `scramble`, `rise`, `highlight`, `wave`, `flip`, `shimmer`) or a custom `(progress,
     * ctx) => {…}`.
     * @default 'typewriter'
     */
    effect?: TextAnimateEffectName | TextAnimateEffect
    /**
     * Segmentation level. Defaults to the preset's natural level (e.g. `word` for `highlight`).
     * @default preset's level
     */
    by?: TextAnimateSegment
    /** Controlled driver value (`0 → 1`). When set, the internal clock is disabled and you own the timeline. */
    progress?: number
    /**
     * Run the built-in clock when `progress` is not provided.
     * @default true
     */
    autoPlay?: boolean
    /**
     * Loop the built-in clock. Continuous presets (`wave`, `shimmer`) default to `true`.
     * @default preset's value
     */
    loop?: boolean
    /**
     * Built-in clock length in **seconds**.
     * @default 1.6
     */
    duration?: number
    /**
     * Built-in clock start delay in **seconds**.
     * @default 0
     */
    delay?: number
    /**
     * How offset each unit's window is from its neighbor's, `0 → 1`. `0` = all together; `1` = fully sequential.
     * @default preset's value
     */
    stagger?: number
  }

  let {
    text,
    effect: effectProp = 'typewriter',
    by,
    progress,
    autoPlay = true,
    loop,
    duration = 1.6,
    delay = 0,
    stagger,
    class: className,
    ...rest
  }: Props = $props()

  const reducedMotion = useReducedMotion()
  const preset = $derived(resolvePreset(effectProp))
  const effectFn = $derived(preset ? preset.fn : (effectProp as TextAnimateEffect))
  const segment = $derived(by ?? preset?.by ?? 'char')
  const resolvedStagger = $derived(clamp01(stagger ?? preset?.stagger ?? 0.5))
  const shouldLoop = $derived(loop ?? preset?.continuous ?? false)
  const controlled = $derived(progress != null)
  const reduced = $derived(reducedMotion.current)

  let clock = $state(0)
  let visible = $state(true)

  $effect(() => {
    if (controlled) clock = clamp01(progress ?? 0)
    else if (!autoPlay) clock = 1
  })

  function attach(el: HTMLSpanElement) {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true
    })
    io.observe(el)
    return () => io.disconnect()
  }

  $effect(() => {
    if (controlled || !autoPlay || reduced) return
    if (shouldLoop && !visible) return
    let raf = 0
    let startedAt: number | null = null
    const totalMs = Math.max(duration, 0.001) * 1000
    const delayMs = Math.max(delay, 0) * 1000

    const tick = (now: number) => {
      if (startedAt === null) startedAt = now + delayMs
      const elapsed = now - startedAt
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick)
        return
      }
      const raw = elapsed / totalMs
      const value = shouldLoop ? raw % 1 : Math.min(raw, 1)
      clock = value
      if (shouldLoop || raw < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  })

  const globalProgress = $derived(controlled ? clamp01(progress ?? 0) : reduced ? 1 : clock)
  const built = $derived(tokenize(text, segment))
  const multiline = $derived(built.lines.length > 1)
  const container = $derived(preset?.container?.(globalProgress, { reduced }))
  const containerStyle = $derived(cssStyle(container?.style))
</script>

<span {@attach attach} data-slot="text-animate" class={cn('inline-block', className)} {...rest}>
  <span class="sr-only">{text}</span>
  <span aria-hidden="true" class={container?.className} style={containerStyle}>
    {#each built.lines as line, li (li)}
      <span style={multiline ? 'display: block' : undefined}>
        {#if line.words === null}
          <TextAnimateUnit
            text={line.text}
            index={line.index}
            total={built.total}
            by={segment}
            stagger={resolvedStagger}
            {globalProgress}
            {reduced}
            run={effectFn}
          />
        {:else}
          {#each line.words as word, wi (wi)}
            {#if word.chars === null}
              <TextAnimateUnit
                text={word.text}
                index={word.index}
                total={built.total}
                by={segment}
                stagger={resolvedStagger}
                {globalProgress}
                {reduced}
                run={effectFn}
              />
            {:else}
              <span style="display: inline-block; white-space: pre">{#each word.chars as c (c.index)}<TextAnimateUnit
                    text={c.ch}
                    index={c.index}
                    total={built.total}
                    by={segment}
                    stagger={resolvedStagger}
                    {globalProgress}
                    {reduced}
                    run={effectFn}
                  />{/each}</span>
            {/if}{wi < line.words.length - 1 ? ' ' : ''}
          {/each}
        {/if}
      </span>
    {/each}
  </span>
</span>
