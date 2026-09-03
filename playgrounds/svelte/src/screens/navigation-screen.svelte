<script lang="ts">
  import { Navigation, NavigationItem, NavigationLink, NavigationList } from '@appica/ui-svelte'

  let active = $state('home')
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Navigation</h2>

  <Navigation aria-label="Main" activeLink={active}>
    <NavigationList>
      {#each ['home', 'about', 'contact'] as item (item)}
        <NavigationItem>
          <NavigationLink href={`#${item}`} value={item} onclick={() => (active = item)}>
            {item}
          </NavigationLink>
        </NavigationItem>
      {/each}
      <NavigationItem>
        <NavigationLink href="#disabled" disabled>Disabled</NavigationLink>
      </NavigationItem>
    </NavigationList>
  </Navigation>

  <Navigation aria-label="Side" orientation="vertical" variant="indicator" activeLink="usage" class="w-48">
    <NavigationList>
      <NavigationItem>
        <NavigationLink href="#intro" value="intro">Intro</NavigationLink>
      </NavigationItem>
      <NavigationItem>
        <NavigationLink href="#usage" value="usage">Usage</NavigationLink>
      </NavigationItem>
      <NavigationItem>
        <NavigationLink href="#api" value="api">API</NavigationLink>
      </NavigationItem>
    </NavigationList>
  </Navigation>
</section>
