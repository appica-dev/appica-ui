<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Collapsible as BitsCollapsible } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'

  type Props = HTMLButtonAttributes & {
    children?: Snippet
  }

  let { class: className, disabled, children, ...rest }: Props = $props()

  const classes = $derived(
    cn(
      'outline-ring cursor-pointer select-none',
      'data-disabled:opacity-disabled data-disabled:pointer-events-none',
      className,
    ),
  )
</script>

<BitsCollapsible.Trigger data-slot="collapsible-trigger" {disabled} class={classes} {...asBitsAttrs(rest)}>
  {@render children?.()}
</BitsCollapsible.Trigger>
