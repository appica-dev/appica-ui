<script lang="ts">
  import Menubar from './menubar.svelte'
  import MenubarMenu from './menubar-menu.svelte'
  import MenubarTrigger from './menubar-trigger.svelte'
  import MenubarContent from './menubar-content.svelte'
  import MenubarItem from './menubar-item.svelte'
  import MenubarSeparator from './menubar-separator.svelte'
  import MenubarSub from './menubar-sub.svelte'
  import MenubarSubTrigger from './menubar-sub-trigger.svelte'
  import MenubarSubContent from './menubar-sub-content.svelte'

  let {
    variant,
    size,
    orientation,
  }: {
    variant?: 'pill' | 'line'
    size?: 'sm' | 'md' | 'lg'
    orientation?: 'horizontal' | 'vertical'
  } = $props()
</script>

<Menubar {variant} {size} {orientation} aria-label="Main">
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New</MenubarItem>
      <MenubarItem>Open</MenubarItem>
      <MenubarItem disabled>Disabled</MenubarItem>
      <MenubarSeparator />
      <MenubarSub>
        <MenubarSubTrigger>More</MenubarSubTrigger>
        <MenubarSubContent>
          <MenubarItem>Nested</MenubarItem>
        </MenubarSubContent>
      </MenubarSub>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>Edit</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>Copy</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
