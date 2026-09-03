<script lang="ts">
  import { buttonVariants } from '../button/button-variants'
  import Toggle from './toggle.svelte'

  let {
    onPressedChange,
    disabled,
    class: className,
  }: {
    onPressedChange?: (pressed: boolean) => void
    disabled?: boolean
    class?: string
  } = $props()
</script>

<Toggle
  aria-label="Bold"
  {onPressedChange}
  {disabled}
  class={className ?? buttonVariants({ variant: 'outline', size: 'sm' })}
>
  B
</Toggle>
