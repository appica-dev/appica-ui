<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type HeadingEl = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'

  type Props = HTMLAttributes<HTMLElement> & {
    /**
     * Heading level so the card fits the page outline.
     * @default 'h3'
     */
    el?: HeadingEl
    children?: Snippet
  }

  let { class: className, el = 'h3', children, ...rest }: Props = $props()
</script>

<svelte:element this={el} data-slot="card-title" class={cn('text-foreground-intense text-lg font-semibold', className)} {...rest}>
  {@render children?.()}
</svelte:element>
