<script lang="ts">
  import {
    DropdownMenu,
    DropdownMenuCheckboxGroup,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuGroupLabel,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
    buttonVariants,
  } from '@appica/ui-svelte'

  let radio = $state('one')
  let checks = $state<string[]>(['notifications'])
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Dropdown menu</h2>

  <DropdownMenu>
    <DropdownMenuTrigger class={buttonVariants({ variant: 'outline' })}>Open</DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuGroup>
        <DropdownMenuGroupLabel>Account</DropdownMenuGroupLabel>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem disabled>Disabled</DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup bind:value={radio}>
        <DropdownMenuRadioItem value="one">One</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="two">Two</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxGroup bind:value={checks}>
        <DropdownMenuCheckboxItem value="notifications">Notifications</DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem value="digest">Digest</DropdownMenuCheckboxItem>
      </DropdownMenuCheckboxGroup>
      <DropdownMenuSeparator />
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuItem>Nested</DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuContent>
  </DropdownMenu>
</section>
