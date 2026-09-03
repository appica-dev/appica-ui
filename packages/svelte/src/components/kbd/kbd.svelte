<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getKbdGroupContext, SIZE_CLASSES, type KbdSize } from './kbd-context'

  type Props = HTMLAttributes<HTMLElement> & {
    /**
     * Height, padding, and text scale. Inherited from a `KbdGroup`.
     * @default 'md'
     */
    size?: KbdSize
    children?: Snippet
  }

  let { class: className, size, children, ...rest }: Props = $props()

  const group = getKbdGroupContext()
  const resolvedSize = $derived(size ?? group?.size ?? 'md')
</script>

<kbd
  data-slot="kbd"
  class={cn(
    'border-border bg-background text-foreground-muted pointer-events-none inline-flex w-fit shrink-0 items-center justify-center border font-sans font-medium whitespace-nowrap select-none',
    'in-data-[slot=tooltip-content]:bg-background-inverse in-data-[slot=tooltip-content]:text-foreground-inverse/75 dark:in-data-[slot=tooltip-content]:border-border-intense/20 in-data-[slot=tooltip-content]:border-white/25',
    SIZE_CLASSES[resolvedSize],
    className,
  )}
  {...rest}
>
  {@render children?.()}
</kbd>
