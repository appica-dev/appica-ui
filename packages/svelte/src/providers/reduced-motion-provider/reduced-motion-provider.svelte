<script lang="ts">
  import type { Snippet } from 'svelte'
  import { hasReducedMotionContext, setReducedMotionContext } from './reduced-motion-context.svelte'

  interface Props {
    children?: Snippet
    /**
     * Force-disable animations regardless of the OS preference
     * @default false
     */
    disableAnimations?: boolean
  }

  let { children, disableAnimations = false }: Props = $props()

  const nested = hasReducedMotionContext()
  const ctx = {
    get disableAnimations() {
      return disableAnimations
    },
  }

  if (!nested) setReducedMotionContext(ctx)

  const ATTR = 'data-disable-animations'

  $effect(() => {
    if (nested || !disableAnimations) return
    const html = document.documentElement
    html.setAttribute(ATTR, '')
    return () => {
      html.removeAttribute(ATTR)
    }
  })
</script>

{@render children?.()}
