<script lang="ts">
  import ReducedMotionProvider from '../../providers/reduced-motion-provider/reduced-motion-provider.svelte'
  import TextAnimate from './text-animate.svelte'
  import type { TextAnimateEffect, TextAnimateEffectName, TextAnimateSegment } from './text-animate-model'

  let {
    text,
    effect,
    by,
    progress,
    autoPlay,
    duration,
    reduced = false,
  }: {
    text: string
    effect?: TextAnimateEffectName | TextAnimateEffect
    by?: TextAnimateSegment
    progress?: number
    autoPlay?: boolean
    duration?: number
    reduced?: boolean
  } = $props()
</script>

{#if reduced}
  <ReducedMotionProvider disableAnimations>
    <TextAnimate {text} {effect} {by} {progress} {autoPlay} {duration} />
  </ReducedMotionProvider>
{:else}
  <TextAnimate {text} {effect} {by} {progress} {autoPlay} {duration} />
{/if}
