<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { getToolbarContext } from './toolbar-context.svelte'

  type Props = HTMLAnchorAttributes & { children?: Snippet }

  let { class: className, href, children, ...rest }: Props = $props()

  const ctx = getToolbarContext()
  let node = $state<HTMLAnchorElement | undefined>()
  const isDisabled = $derived(ctx.disabled)
  const tabIndex = $derived(node && ctx.isTabStop(node) ? 0 : -1)

  function attach(el: HTMLAnchorElement) {
    node = el
    return ctx.register({ el, disabled: () => isDisabled })
  }
</script>

<a
  {@attach attach}
  data-slot="toolbar-link"
  href={isDisabled ? undefined : href}
  aria-disabled={isDisabled ? true : undefined}
  data-disabled={isDisabled ? '' : undefined}
  tabindex={tabIndex}
  onfocus={() => {
    if (node) ctx.tabStop = node
  }}
  class={className}
  {...rest}
>
  {@render children?.()}
</a>
