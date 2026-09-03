<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  export type AlertActionProps = HTMLAttributes<HTMLDivElement> & { children?: Snippet }
  let { class: className, children, ...rest }: AlertActionProps = $props()
</script>

<div
  data-slot="alert-action"
  class={cn(
    'flex justify-end gap-2 [grid-area:actions]',
    'pt-2 @min-[460px]:group-data-[layout=inline]/alert:ms-3 @min-[460px]:group-data-[layout=inline]/alert:pt-0',
    className,
  )}
  {...rest}
>
  {@render children?.()}
</div>
