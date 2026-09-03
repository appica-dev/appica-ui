<script lang="ts">
  import type { HTMLFieldsetAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLFieldsetAttributes & {
    children?: Snippet
  }

  let { class: className, children, ...rest }: Props = $props()
</script>

<fieldset data-slot="fieldset" class={cn('flex w-full flex-col gap-4', className)} {...rest}>
  {@render children?.()}
</fieldset>
