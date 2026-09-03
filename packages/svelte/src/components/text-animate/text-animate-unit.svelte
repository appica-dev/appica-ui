<script lang="ts">
  import { cssStyle, clamp01, MIN_UNIT_DURATION, type TextAnimateEffect, type TextAnimateSegment } from './text-animate-model'

  type Props = {
    text: string
    index: number
    total: number
    by: TextAnimateSegment
    stagger: number
    globalProgress: number
    reduced: boolean
    run: TextAnimateEffect
  }

  let { text, index, total, by, stagger, globalProgress, reduced, run }: Props = $props()

  const local = $derived.by(() => {
    const start = (index / total) * stagger
    const duration = Math.max(1 - stagger, MIN_UNIT_DURATION)
    return clamp01((globalProgress - start) / duration)
  })
  const result = $derived(run(local, { index, total, text, by, globalProgress, reduced }))
  const style = $derived(cssStyle(result.style))
  const shown = $derived(result.content === undefined ? text : result.content)
</script>

<span data-slot="text-animate-unit" class={result.className} {style}>{#if result.innerTransform}<span style={`display: inline-block; transform: ${result.innerTransform}`}>{shown}</span>{:else}{shown}{/if}{#if result.caret}<span aria-hidden="true" class="motion-safe:animate-text-caret" style="display: inline-block; width: 0.08em; height: 1em; margin-inline-start: 0.04em; background-color: currentColor; vertical-align: text-bottom;"></span>{/if}</span>
