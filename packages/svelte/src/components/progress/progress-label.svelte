<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getProgressContext } from './progress-context'

  export type ProgressLabelProps = HTMLAttributes<HTMLSpanElement> & { children?: Snippet }

  let { class: className, id, children, ...rest }: ProgressLabelProps = $props()

  const ctx = getProgressContext()
  const uid = $props.id()
  const resolvedId = $derived(id ?? `${uid}-label`)

  $effect(() => {
    ctx.setLabelId(resolvedId)
    return () => ctx.setLabelId(undefined)
  })
</script>

<span data-slot="progress-label" id={resolvedId} class={cn('text-foreground-intense text-sm font-medium', className)} {...rest}>
  {@render children?.()}
</span>
