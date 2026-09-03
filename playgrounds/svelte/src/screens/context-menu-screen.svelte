<script lang="ts">
  import {
    ContextMenu,
    ContextMenuCheckboxGroup,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuGroupLabel,
    ContextMenuItem,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
  } from '@appica/ui-svelte'

  let radio = $state('one')
  let checks = $state<string[]>(['notifications'])
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Context menu</h2>

  <ContextMenu>
    <ContextMenuTrigger class="border-border bg-background-muted inline-flex rounded-md border px-4 py-8 text-sm">
      Right click here
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuGroup>
        <ContextMenuGroupLabel>Account</ContextMenuGroupLabel>
        <ContextMenuItem>Profile</ContextMenuItem>
        <ContextMenuItem>Settings</ContextMenuItem>
        <ContextMenuItem disabled>Disabled</ContextMenuItem>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuRadioGroup bind:value={radio}>
        <ContextMenuRadioItem value="one">One</ContextMenuRadioItem>
        <ContextMenuRadioItem value="two">Two</ContextMenuRadioItem>
      </ContextMenuRadioGroup>
      <ContextMenuSeparator />
      <ContextMenuCheckboxGroup bind:value={checks}>
        <ContextMenuCheckboxItem value="notifications">Notifications</ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem value="digest">Digest</ContextMenuCheckboxItem>
      </ContextMenuCheckboxGroup>
      <ContextMenuSeparator />
      <ContextMenuSub>
        <ContextMenuSubTrigger>More</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem>Nested</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
    </ContextMenuContent>
  </ContextMenu>
</section>
