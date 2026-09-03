<script lang="ts">
  import type { Snippet } from 'svelte'
  import { Tooltip as BitsTooltip } from 'bits-ui'

  type Props = {
    /**
     * Delay in milliseconds before a tooltip opens.
     * @default 200
     */
    delay?: number
    /**
     * Time a user has to enter another trigger without incurring a delay again.
     * @default 300
     */
    skipDelayDuration?: number
    children?: Snippet
  }

  let { delay = 200, skipDelayDuration = 300, children }: Props = $props()
</script>

<BitsTooltip.Provider delayDuration={delay} {skipDelayDuration}>
  {@render children?.()}
</BitsTooltip.Provider>
