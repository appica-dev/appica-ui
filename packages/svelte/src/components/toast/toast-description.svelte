<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getToastItemContext } from './toast-item-context'

  export type ToastDescriptionProps = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, id: idProp, children, ...rest }: ToastDescriptionProps = $props()

  const item = getToastItemContext()
  const fallback = $derived(item ? `${item.toast.id}-description` : undefined)
  const id = $derived(idProp ?? fallback)
  const text = $derived(children ? undefined : item?.toast.description)

  $effect.pre(() => {
    item?.setDescriptionId(id)
    return () => item?.setDescriptionId(undefined)
  })
</script>

{#if children || text}
  <div {id} data-slot="toast-description" class={cn('text-foreground text-sm [grid-area:description]', className)} {...rest}>
    {#if children}
      {@render children()}
    {:else}
      {text}
    {/if}
  </div>
{/if}
