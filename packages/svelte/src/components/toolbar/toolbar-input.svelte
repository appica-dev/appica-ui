<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'
  import { getToolbarContext } from './toolbar-context.svelte'

  type Props = HTMLInputAttributes

  let { class: className, disabled, ...rest }: Props = $props()

  const ctx = getToolbarContext()
  let node = $state<HTMLInputElement | undefined>()
  const isDisabled = $derived(Boolean(disabled || ctx.disabled))
  const tabIndex = $derived(node && ctx.isTabStop(node) ? 0 : -1)

  function attach(el: HTMLInputElement) {
    node = el
    return ctx.register({ el, disabled: () => isDisabled })
  }
</script>

<input
  {@attach attach}
  data-slot="toolbar-input"
  disabled={isDisabled}
  data-disabled={isDisabled ? '' : undefined}
  tabindex={tabIndex}
  onfocus={() => {
    if (node) ctx.tabStop = node
  }}
  class={className}
  {...rest}
/>
