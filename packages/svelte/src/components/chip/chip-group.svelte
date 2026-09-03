<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { SvelteSet } from 'svelte/reactivity'
  import { cn } from '../../internal/utils'
  import { setChipGroupContext } from './chip-context'
  import type { ChipSize, ChipVariant } from './chip-variants'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Default `variant` for every child chip; a chip may override it. */
    variant?: ChipVariant
    /** Default `size` for every child chip; a chip may override it. */
    size?: ChipSize
    children?: Snippet
  }

  let { class: className, variant, size, children, ...rest }: Props = $props()

  const dismissers = new SvelteSet<() => void>()

  setChipGroupContext({
    register(dismiss) {
      dismissers.add(dismiss)
      return () => {
        dismissers.delete(dismiss)
      }
    },
    get variant() {
      return variant
    },
    get size() {
      return size
    },
  })

  export function clearAll() {
    dismissers.forEach((dismiss) => dismiss())
  }
</script>

<div data-slot="chip-group" class={cn('flex flex-wrap items-center gap-2', className)} {...rest}>
  {@render children?.()}
</div>
