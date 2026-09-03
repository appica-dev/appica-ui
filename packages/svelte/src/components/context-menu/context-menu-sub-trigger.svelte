<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { ContextMenu as BitsContextMenu } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { navigationLinkVariants } from '../navigation/navigation-link-variants'
  import { getContextMenuContext } from './context-menu-context'
  import { ICON_SIZE, ITEM_BASE, ITEM_TEXT } from './context-menu-variants'

  type Props = HTMLButtonAttributes & { children?: Snippet }

  let { class: className, disabled, children, ...rest }: Props = $props()

  const ctx = getContextMenuContext()
</script>

<BitsContextMenu.SubTrigger class="group/submenu-trigger outline-hidden" disabled={disabled ?? undefined} {...asBitsAttrs(rest)}>
  <span
    data-slot="context-menu-sub-trigger"
    class={cn(navigationLinkVariants({ variant: 'pill', size: ctx.size }), ITEM_BASE, 'justify-between', className)}
  >
    <span class={cn('flex flex-1 items-center', ITEM_TEXT[ctx.size])}>{@render children?.()}</span>
    <svg
      data-icon="end"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      class={cn(ICON_SIZE[ctx.size], 'shrink-0 rtl:rotate-180')}
    >
      <path
        d="M5.558 3.558c.244-.244.641-.244.885 0l4 4c.244.244.244.641 0 .885l-4 4c-.244.244-.641.244-.885 0s-.244-.641 0-.885L9.115 8 5.558 4.442c-.244-.244-.244-.641 0-.885z"
      />
    </svg>
  </span>
</BitsContextMenu.SubTrigger>
