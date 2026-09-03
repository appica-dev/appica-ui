<script lang="ts">
  import {
    Toolbar,
    ToolbarButton,
    ToolbarGroup,
    ToolbarLink,
    ToolbarSeparator,
    buttonVariants,
  } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Toolbar</h2>
  <Toolbar aria-label="Formatting">
    <ToolbarGroup aria-label="Text style">
      <ToolbarButton class={buttonVariants({ variant: 'ghost', size: 'sm' })}>Bold</ToolbarButton>
      <ToolbarButton class={buttonVariants({ variant: 'ghost', size: 'sm' })}>Italic</ToolbarButton>
    </ToolbarGroup>
    <ToolbarSeparator />
    <ToolbarLink href="#help" class={buttonVariants({ variant: 'ghost', size: 'sm' })}>Help</ToolbarLink>
  </Toolbar>
</section>
