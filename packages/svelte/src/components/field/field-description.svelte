<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { requireFieldContext } from './field-context'

  type Props = HTMLAttributes<HTMLParagraphElement> & {
    children?: Snippet
  }

  let { class: className, children, ...rest }: Props = $props()

  const field = requireFieldContext()
  const classes = $derived(
    cn('text-foreground-muted data-disabled:opacity-disabled mt-1.5 text-sm', className),
  )
</script>

<p
  data-slot="field-description"
  id={field.descriptionId}
  data-disabled={field.disabled() ? '' : undefined}
  class={classes}
  {...rest}
>
  {@render children?.()}
</p>
