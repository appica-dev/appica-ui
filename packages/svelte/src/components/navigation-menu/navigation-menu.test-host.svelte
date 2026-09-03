<script lang="ts">
  import NavigationMenu from './navigation-menu.svelte'
  import NavigationMenuContent from './navigation-menu-content.svelte'
  import NavigationMenuIcon from './navigation-menu-icon.svelte'
  import NavigationMenuItem from './navigation-menu-item.svelte'
  import NavigationMenuLink from './navigation-menu-link.svelte'
  import NavigationMenuList from './navigation-menu-list.svelte'
  import NavigationMenuTrigger from './navigation-menu-trigger.svelte'

  let {
    variant,
    size,
    icon,
    orientation,
    backdrop,
    viewport,
    morph,
  }: {
    variant?: 'pill' | 'line'
    size?: 'sm' | 'md' | 'lg'
    icon?: 'chevron' | 'caret' | 'plus' | false
    orientation?: 'horizontal' | 'vertical'
    backdrop?: boolean
    viewport?: boolean
    morph?: boolean
  } = $props()
</script>

<NavigationMenu
  {variant}
  {size}
  {icon}
  {orientation}
  {backdrop}
  {viewport}
  {morph}
  delayDuration={0}
  aria-label="Main"
>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        Products
        <NavigationMenuIcon />
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/p/one">Product One</NavigationMenuLink>
        <NavigationMenuLink href="/p/two">Product Two</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuTrigger>
        Company
        <NavigationMenuIcon />
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <NavigationMenuLink href="/about">About</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
