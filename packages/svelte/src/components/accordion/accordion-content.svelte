<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Accordion as BitsAccordion } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & {
    children?: Snippet
  }

  let { class: className, children, ...rest }: Props = $props()

  const classes = $derived(
    cn(
      'overflow-hidden',
      'h-[var(--bits-accordion-content-height)]',
      'data-[state=closed]:h-0',
      'transition-[height] duration-400 ease-[cubic-bezier(0.32,0.72,0,1)]',
      'motion-reduce:transition-none',
      className,
    ),
  )
</script>

<BitsAccordion.Content data-slot="accordion-content" class={classes} forceMount={false} {...asBitsAttrs(rest)}>
  {#snippet child({ props })}
    {#if !props.hidden}
      <div {...props}>
        <div class="pt-3">
          {@render children?.()}
        </div>
      </div>
    {/if}
  {/snippet}
</BitsAccordion.Content>
