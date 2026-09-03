<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getToastItemContext } from './toast-item-context'

  export type ToastTitleProps = HTMLAttributes<HTMLHeadingElement> & { children?: Snippet }

  let { class: className, id: idProp, children, ...rest }: ToastTitleProps = $props()

  const item = getToastItemContext()
  const fallback = $derived(item ? `${item.toast.id}-title` : undefined)
  const id = $derived(idProp ?? fallback)
  const text = $derived(children ? undefined : item?.toast.title)

  $effect.pre(() => {
    item?.setTitleId(id)
    return () => item?.setTitleId(undefined)
  })
</script>

{#if children || text}
  <h2
    {id}
    data-slot="toast-title"
    class={cn(
      'text-foreground-intense flex w-full items-center gap-2 text-sm font-semibold [grid-area:title]',
      className,
    )}
    {...rest}
  >
    {#if children}
      {@render children()}
    {:else}
      {text}
    {/if}
  </h2>
{/if}
