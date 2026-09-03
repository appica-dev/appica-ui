<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { ContextMenu as BitsContextMenu } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { navigationLinkVariants } from '../navigation/navigation-link-variants'
  import { getContextMenuContext } from './context-menu-context'
  import { ITEM_BASE, ITEM_TEXT } from './context-menu-variants'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Value of this radio option. */
    value: string
    disabled?: boolean
    children?: Snippet
  }

  let { class: className, value, disabled, children: label, ...rest }: Props = $props()

  const ctx = getContextMenuContext()
  const classes = $derived(
    cn(navigationLinkVariants({ variant: 'pill', size: ctx.size }), ITEM_BASE, 'justify-between', className),
  )
</script>

<BitsContextMenu.RadioItem data-slot="context-menu-radio-item" {value} {disabled} class={classes} {...asBitsAttrs(rest)}>
  {#snippet children({ checked })}
    <span class={cn('flex items-center', ITEM_TEXT[ctx.size])}>{@render label?.()}</span>
    <span data-slot="context-menu-radio-item-indicator" class="group/check text-foreground-intense shrink-0" data-checked={checked ? '' : undefined}>
      <svg
        data-icon="end"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        class="me-0.5 size-[1.125em] stroke-2"
      >
        <path
          d="M4.3 12.55 L9.25 17.5 L19.7 6.5"
          pathLength={1}
          stroke-dasharray="1 2"
          class={cn(
            'opacity-0 [stroke-dashoffset:1.02]',
            checked && 'opacity-100 [stroke-dashoffset:0]',
            'motion-safe:transition-[opacity,stroke-dashoffset] motion-safe:ease-out',
          )}
        />
      </svg>
    </span>
  {/snippet}
</BitsContextMenu.RadioItem>
