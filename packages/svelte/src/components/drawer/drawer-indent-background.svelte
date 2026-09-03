<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement>

  let { class: className, ...rest }: Props = $props()
</script>

<div data-slot="drawer-indent-background" class={cn('bg-background fixed inset-0 -z-10', className)} {...rest}></div>
