<script lang="ts">
  import { patternLayerClass, patternMaskStyle, type BackgroundPatternVariant } from './background-pattern-shared'

  type Props = {
    variant: BackgroundPatternVariant
    class?: string
  }

  let { variant, class: className }: Props = $props()

  const maskStyle = $derived(patternMaskStyle(variant))
  const classes = $derived(patternLayerClass(variant, className))
</script>

<div aria-hidden="true" data-slot="background-pattern-layer" class={classes} style={maskStyle}></div>
