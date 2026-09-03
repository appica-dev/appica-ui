<script lang="ts">
  import type { HTMLLabelAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Label as BitsLabel } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { requireFieldContext } from './field-context'

  type Props = HTMLLabelAttributes & {
    children?: Snippet
  }

  let { class: className, children, ...rest }: Props = $props()

  const field = requireFieldContext()
  const classes = $derived(
    cn(
      'text-foreground-intense mb-1.5 flex w-fit items-center text-sm font-medium select-none',
      'data-disabled:opacity-disabled',
      className,
    ),
  )
</script>

<BitsLabel.Root
  data-slot="field-label"
  id={field.labelId}
  for={field.controlId}
  data-disabled={field.disabled() ? '' : undefined}
  class={classes}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsLabel.Root>
