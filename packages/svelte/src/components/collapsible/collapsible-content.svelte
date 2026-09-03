<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Collapsible as BitsCollapsible } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Keep the panel mounted while closed so enter/exit animations can run.
     * @default false
     */
    keepMounted?: boolean
    children?: Snippet
  }

  let { class: className, keepMounted = false, children, ...rest }: Props = $props()

  const classes = $derived(
    cn(
      'overflow-hidden',
      'h-[var(--bits-collapsible-content-height)]',
      'data-[state=closed]:h-0',
      'transition-[height] duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]',
      'motion-reduce:transition-none',
      className,
    ),
  )
</script>

<BitsCollapsible.Content
  data-slot="collapsible-content"
  class={classes}
  forceMount={keepMounted}
  {...asBitsAttrs(rest)}
>
  {#snippet child({ props })}
    {#if keepMounted || !props.hidden}
      <div {...props}>
        {@render children?.()}
      </div>
    {/if}
  {/snippet}
</BitsCollapsible.Content>
