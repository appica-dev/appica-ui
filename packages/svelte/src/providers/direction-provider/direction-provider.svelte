<script lang="ts">
  import type { Snippet } from 'svelte'
  import { setDirectionContext, type Direction } from './direction-context'

  interface Props {
    children?: Snippet
    /**
     * Reading direction for descendant components.
     * @default 'ltr'
     */
    dir?: Direction
  }

  let { children, dir = 'ltr' }: Props = $props()

  setDirectionContext({
    get dir() {
      return dir
    },
  })
</script>

<div data-slot="direction-provider" style="display: contents" {dir}>
  {@render children?.()}
</div>
