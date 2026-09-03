<script lang="ts">
  import type { Snippet } from 'svelte'
  import Navigation from './navigation.svelte'
  import NavigationItem from './navigation-item.svelte'
  import NavigationLink from './navigation-link.svelte'
  import NavigationList from './navigation-list.svelte'
  import type {
    NavigationActiveLink,
    NavigationOrientation,
    NavigationSize,
    NavigationVariant,
  } from './navigation-context'

  let {
    activeLink,
    size,
    orientation,
    variant,
    linkClass,
    linkEl = 'a',
    disabled = false,
    forceActive,
    forceInactive = false,
    onclick,
    standalone = false,
    customIndicator = false,
    ariaLabel = 'Main',
    indicator,
  }: {
    activeLink?: NavigationActiveLink
    size?: NavigationSize
    orientation?: NavigationOrientation
    variant?: NavigationVariant
    linkClass?: string
    linkEl?: 'a' | 'button'
    disabled?: boolean
    forceActive?: boolean
    forceInactive?: boolean
    onclick?: (event: MouseEvent) => void
    standalone?: boolean
    customIndicator?: boolean
    ariaLabel?: string
    indicator?: Snippet
  } = $props()
</script>

{#if standalone}
  <NavigationLink href="#solo">Solo</NavigationLink>
{:else if customIndicator}
  <NavigationLink variant="indicator" {indicator}>Item</NavigationLink>
{:else if forceActive}
  <Navigation aria-label={ariaLabel} {activeLink}>
    <NavigationList>
      <NavigationItem>
        <NavigationLink href="#about" value="about" active>About</NavigationLink>
      </NavigationItem>
    </NavigationList>
  </Navigation>
{:else if forceInactive}
  <Navigation aria-label={ariaLabel} {activeLink}>
    <NavigationList>
      <NavigationItem>
        <NavigationLink href="#home" value="home" active={false}>Home</NavigationLink>
      </NavigationItem>
    </NavigationList>
  </Navigation>
{:else if disabled}
  <Navigation aria-label={ariaLabel}>
    <NavigationList>
      <NavigationItem>
        <NavigationLink href="#" {disabled}>Disabled</NavigationLink>
      </NavigationItem>
    </NavigationList>
  </Navigation>
{:else if orientation === 'vertical'}
  <Navigation aria-label={ariaLabel} orientation="vertical" variant={variant ?? 'line'}>
    <NavigationList>
      <NavigationItem>
        <NavigationLink href="#a" value="a" orientation={undefined}>A</NavigationLink>
      </NavigationItem>
    </NavigationList>
  </Navigation>
{:else if variant === 'indicator'}
  <Navigation aria-label="Side" orientation="vertical" variant="indicator">
    <NavigationList>
      <NavigationItem>
        <NavigationLink href="#one" value="one">One</NavigationLink>
      </NavigationItem>
    </NavigationList>
  </Navigation>
{:else}
  <Navigation aria-label={ariaLabel} {size} {activeLink}>
    <NavigationList>
      <NavigationItem>
        <NavigationLink href="#home" value="home" class={linkClass} el={linkEl} {onclick}>Home</NavigationLink>
      </NavigationItem>
      <NavigationItem>
        <NavigationLink href="#about" value="about" el={linkEl}>About</NavigationLink>
      </NavigationItem>
      <NavigationItem>
        <NavigationLink href="#contact" value="contact" el={linkEl}>Contact</NavigationLink>
      </NavigationItem>
    </NavigationList>
  </Navigation>
{/if}
