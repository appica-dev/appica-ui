<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type HeadingEl = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'

  export type AlertTitleProps = HTMLAttributes<HTMLElement> & {
    /**
     * Heading level, so the alert fits the page's heading outline.
     * @default 'h5'
     */
    el?: HeadingEl
    children?: Snippet
  }

  let { class: className, el = 'h5', children, ...rest }: AlertTitleProps = $props()
</script>

<svelte:element
  this={el}
  data-slot="alert-title"
  class={cn(
    'text-foreground-intense self-center font-semibold [grid-area:title]',
    'text-base @min-[460px]:group-data-[layout=inline]/alert:me-3 @min-[460px]:group-data-[layout=inline]/alert:text-sm',
    className,
  )}
  {...rest}
>
  {@render children?.()}
</svelte:element>
