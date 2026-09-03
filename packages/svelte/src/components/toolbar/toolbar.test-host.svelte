<script lang="ts">
  import { buttonVariants } from '../button/button-variants'
  import Toolbar from './toolbar.svelte'
  import ToolbarButton from './toolbar-button.svelte'
  import ToolbarGroup from './toolbar-group.svelte'
  import ToolbarLink from './toolbar-link.svelte'
  import ToolbarSeparator from './toolbar-separator.svelte'
  import type { ToolbarOrientation } from './toolbar-context.svelte'

  let {
    orientation,
    disabled,
    class: className,
  }: {
    orientation?: ToolbarOrientation
    disabled?: boolean
    class?: string
  } = $props()
</script>

<Toolbar aria-label="Formatting" {orientation} {disabled} class={className}>
  <ToolbarGroup aria-label="Text style">
    <ToolbarButton class={buttonVariants({ variant: 'ghost', size: 'sm' })}>Bold</ToolbarButton>
    <ToolbarButton class={buttonVariants({ variant: 'ghost', size: 'sm' })}>Italic</ToolbarButton>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarLink href="#help">Help</ToolbarLink>
</Toolbar>
