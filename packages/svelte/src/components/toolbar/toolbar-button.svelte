<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { getToolbarContext } from './toolbar-context.svelte'

  type Props = HTMLButtonAttributes & { children?: Snippet }

  let { class: className, disabled, type = 'button', children, ...rest }: Props = $props()

  const ctx = getToolbarContext()
  let node = $state<HTMLButtonElement | undefined>()
  const isDisabled = $derived(Boolean(disabled || ctx.disabled))
  const tabIndex = $derived(node && ctx.isTabStop(node) ? 0 : -1)

  function attach(el: HTMLButtonElement) {
    node = el
    return ctx.register({ el, disabled: () => isDisabled })
  }
</script>

<button
  {@attach attach}
  data-slot="toolbar-button"
  {type}
  disabled={isDisabled}
  data-disabled={isDisabled ? '' : undefined}
  tabindex={tabIndex}
  onfocus={() => {
    if (node) ctx.tabStop = node
  }}
  class={className}
  {...rest}
>
  {@render children?.()}
</button>
