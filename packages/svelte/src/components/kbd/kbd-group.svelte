<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { setKbdGroupContext, type KbdSize } from './kbd-context'

  type Props = HTMLAttributes<HTMLSpanElement> & {
    /**
     * Default size applied to each child `Kbd` that doesn't set its own.
     * @default 'md'
     */
    size?: KbdSize
    children?: Snippet
  }

  let { class: className, size = 'md', children, ...rest }: Props = $props()

  const ctx = {
    get size() {
      return size
    },
  }
  setKbdGroupContext(ctx)
</script>

<span data-slot="kbd-group" class={cn('inline-flex items-center gap-0.5 align-middle', className)} {...rest}>
  {@render children?.()}
</span>
