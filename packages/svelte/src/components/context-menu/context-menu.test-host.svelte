<script lang="ts">
  import ContextMenu from './context-menu.svelte'
  import ContextMenuTrigger from './context-menu-trigger.svelte'
  import ContextMenuContent from './context-menu-content.svelte'
  import ContextMenuGroup from './context-menu-group.svelte'
  import ContextMenuGroupLabel from './context-menu-group-label.svelte'
  import ContextMenuItem from './context-menu-item.svelte'
  import ContextMenuLinkItem from './context-menu-link-item.svelte'
  import ContextMenuRadioGroup from './context-menu-radio-group.svelte'
  import ContextMenuRadioItem from './context-menu-radio-item.svelte'
  import ContextMenuSeparator from './context-menu-separator.svelte'
  import ContextMenuSub from './context-menu-sub.svelte'
  import ContextMenuSubTrigger from './context-menu-sub-trigger.svelte'
  import ContextMenuSubContent from './context-menu-sub-content.svelte'

  let { radio = $bindable('one') }: { radio?: string } = $props()
</script>

<ContextMenu>
  <ContextMenuTrigger data-testid="trigger" class="border-border bg-background-muted inline-flex rounded-md border px-3 py-2 text-sm">
    Right click here
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuGroup>
      <ContextMenuGroupLabel>Actions</ContextMenuGroupLabel>
      <ContextMenuItem>Profile</ContextMenuItem>
      <ContextMenuItem>Settings</ContextMenuItem>
      <ContextMenuItem disabled>Disabled</ContextMenuItem>
    </ContextMenuGroup>
    <ContextMenuSeparator />
    <ContextMenuLinkItem href="https://example.com">Docs</ContextMenuLinkItem>
    <ContextMenuSeparator />
    <ContextMenuRadioGroup bind:value={radio}>
      <ContextMenuRadioItem value="one">One</ContextMenuRadioItem>
      <ContextMenuRadioItem value="two">Two</ContextMenuRadioItem>
    </ContextMenuRadioGroup>
    <ContextMenuSeparator />
    <ContextMenuSub>
      <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>Nested</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
  </ContextMenuContent>
</ContextMenu>
