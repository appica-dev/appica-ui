<script lang="ts">
  import {
    DirectionProvider,
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIcon,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuSub,
    NavigationMenuTrigger,
    Switch,
  } from '@appica/ui-svelte'

  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Navigation menu</h2>

  <label class="flex items-center gap-2 text-sm">
    <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
    RTL
  </label>

  <DirectionProvider {dir}>
    <div {dir}>
      <NavigationMenu aria-label="Main">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              Products
              <NavigationMenuIcon />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#one">Product One</NavigationMenuLink>
              <NavigationMenuLink href="#two">Product Two</NavigationMenuLink>
              <NavigationMenuSub>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      More
                      <NavigationMenuIcon />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink href="#nested">Nested</NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenuSub>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              Company
              <NavigationMenuIcon />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#about">About</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#docs">Docs</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  </DirectionProvider>
</section>
