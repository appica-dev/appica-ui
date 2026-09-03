<script lang="ts">
  import NavigationMenu from './navigation-menu.svelte'
  import NavigationMenuContent from './navigation-menu-content.svelte'
  import NavigationMenuIcon from './navigation-menu-icon.svelte'
  import NavigationMenuItem from './navigation-menu-item.svelte'
  import NavigationMenuLink from './navigation-menu-link.svelte'
  import NavigationMenuList from './navigation-menu-list.svelte'
  import NavigationMenuTrigger from './navigation-menu-trigger.svelte'
</script>

<NavigationMenu icon="chevron" delayDuration={0} aria-label="Main">
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        Solo
        <NavigationMenuIcon icon={false} />
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/x">X</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
