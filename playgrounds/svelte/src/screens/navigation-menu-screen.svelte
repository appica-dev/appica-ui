<script lang="ts">
  import {
    Bolt,
    Book,
    ChartBar,
    Code,
    Cube,
    Folder,
    LayoutDashboard,
    Lifebuoy,
    Users,
  } from '@appica/icons-svelte'
  import {
    DirectionProvider,
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIcon,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
    Switch,
  } from '@appica/ui-svelte'

  const PRODUCTS = [
    { title: 'Analytics', description: 'Track usage and conversions in real time.', icon: 'analytics' },
    { title: 'Components', description: 'A composable library of UI primitives.', icon: 'cube' },
    { title: 'Automation', description: 'Wire up workflows without code.', icon: 'bolt' },
    { title: 'Integrations', description: 'Connect the tools your team already uses.', icon: 'code' },
  ] as const

  const RESOURCES = [
    { title: 'Documentation', description: 'Guides and API references.', icon: 'book' },
    { title: 'Support', description: 'Reach our team for help.', icon: 'lifebuoy' },
  ] as const

  const VARIANT_LINKS = ['Overview', 'Changelog', 'Roadmap', 'Releases']
  const SIZE_LINKS = ['Overview', 'Analytics', 'Settings']
  const ICON_LINKS = ['Dashboard', 'Reports', 'Settings']
  const SIZES = ['sm', 'md', 'lg'] as const
  const KINDS = ['chevron', 'caret', 'plus'] as const

  const MENUS = [
    { label: 'Dashboard', icon: 'layout', links: ['Summary', 'Activity', 'Insights'] },
    { label: 'Projects', icon: 'folder', links: ['All projects', 'Archived', 'Templates'] },
    { label: 'Team', icon: 'users', links: ['Members', 'Roles', 'Invitations'] },
  ] as const

  const BACKDROP_PRODUCTS = [
    { title: 'Analytics', description: 'Track usage and conversions.' },
    { title: 'Components', description: 'A composable UI library.' },
    { title: 'Automation', description: 'Wire up workflows fast.' },
    { title: 'Integrations', description: 'Connect your stack.' },
  ]

  const COMPANY = [
    { title: 'About', description: 'Our mission and the team behind it.' },
    { title: 'Careers', description: 'Open roles across the company.' },
    { title: 'Blog', description: 'Product news and engineering notes.' },
  ]

  const HANDBOOK = [
    { title: 'Getting started', description: 'Set up your workspace.' },
    { title: 'Principles', description: 'How we make decisions.' },
    { title: 'Remote work', description: 'Working across time zones.' },
  ]

  const AUDIENCES = [
    {
      value: 'developers',
      label: 'Developers',
      hint: 'Build and ship faster',
      title: 'For developers',
      description: 'APIs, SDKs, and primitives to integrate in minutes.',
      links: [
        { title: 'API reference', description: 'Every endpoint, documented.' },
        { title: 'SDKs', description: 'First-party libraries for your stack.' },
        { title: 'Examples', description: 'Copy-paste starting points.' },
      ],
    },
    {
      value: 'designers',
      label: 'Designers',
      hint: 'Design with the system',
      title: 'For designers',
      description: 'Tokens, kits, and guidelines that match the code.',
      links: [
        { title: 'Figma kit', description: 'Components mapped to production.' },
        { title: 'Design tokens', description: 'One source of truth for theming.' },
        { title: 'Guidelines', description: 'Patterns and accessibility notes.' },
      ],
    },
    {
      value: 'teams',
      label: 'Teams',
      hint: 'Scale across the org',
      title: 'For teams',
      description: 'Roles, governance, and shared workspaces.',
      links: [
        { title: 'Permissions', description: 'Granular role-based access.' },
        { title: 'Audit log', description: 'Track every change.' },
        { title: 'SSO', description: 'Single sign-on for everyone.' },
      ],
    },
  ]

  const cardClass = 'h-auto flex-col items-start gap-1 whitespace-normal'
  const inlineCardClass = 'h-auto flex-col items-start gap-0.5 whitespace-normal'

  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

{#snippet namedIcon(name: string, icon?: 'start')}
  {#if name === 'analytics'}
    <ChartBar data-icon={icon} />
  {:else if name === 'cube'}
    <Cube data-icon={icon} />
  {:else if name === 'bolt'}
    <Bolt data-icon={icon} />
  {:else if name === 'code'}
    <Code data-icon={icon} />
  {:else if name === 'book'}
    <Book data-icon={icon} />
  {:else if name === 'lifebuoy'}
    <Lifebuoy data-icon={icon} />
  {:else if name === 'layout'}
    <LayoutDashboard data-icon={icon} />
  {:else if name === 'folder'}
    <Folder data-icon={icon} />
  {:else if name === 'users'}
    <Users data-icon={icon} />
  {/if}
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Navigation menu</h2>

  <label class="flex items-center gap-2 text-sm">
    <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
    RTL
  </label>

  <DirectionProvider {dir}>
    <div {dir} class="flex flex-col gap-8">
      <div class="flex flex-col gap-2">
        <p class="text-foreground-muted text-sm">Default</p>
        <NavigationMenu aria-label="Main">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                Products
                <NavigationMenuIcon />
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="grid w-96 grid-cols-2 gap-0.5">
                  {#each PRODUCTS as product (product.title)}
                    <li>
                      <NavigationMenuLink href="#!" class={cardClass}>
                        <span class="text-foreground-intense flex items-center gap-1.5 font-medium">
                          {@render namedIcon(product.icon)}
                          {product.title}
                        </span>
                        <span class="text-foreground-muted text-xs font-normal">{product.description}</span>
                      </NavigationMenuLink>
                    </li>
                  {/each}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>
                Resources
                <NavigationMenuIcon />
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="w-50 gap-0.5">
                  {#each RESOURCES as resource (resource.title)}
                    <li>
                      <NavigationMenuLink href="#!" class={cardClass}>
                        <span class="text-foreground-intense flex items-center gap-1.5 font-medium">
                          {@render namedIcon(resource.icon)}
                          {resource.title}
                        </span>
                        <span class="text-foreground-muted text-xs font-normal">{resource.description}</span>
                      </NavigationMenuLink>
                    </li>
                  {/each}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="#!">Pricing</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-foreground-muted text-sm">Variants</p>
        <div class="flex flex-col gap-8">
          {#each [{ variant: 'pill' as const, label: 'Pill' }, { variant: 'line' as const, label: 'Line' }] as item (item.variant)}
            <NavigationMenu aria-label={item.label} variant={item.variant}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    Product
                    <NavigationMenuIcon />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul class="w-50 gap-0.5">
                      {#each VARIANT_LINKS as link (link)}
                        <li>
                          <NavigationMenuLink href="#!">{link}</NavigationMenuLink>
                        </li>
                      {/each}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink href="#!">Pricing</NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          {/each}
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-foreground-muted text-sm">Sizes</p>
        <div class="flex flex-wrap items-center gap-6">
          {#each SIZES as size (size)}
            <NavigationMenu aria-label={size} {size}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    {size}
                    <NavigationMenuIcon />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul class="w-50 gap-0.5">
                      {#each SIZE_LINKS as item (item)}
                        <li>
                          <NavigationMenuLink href="#!">{item}</NavigationMenuLink>
                        </li>
                      {/each}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          {/each}
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-foreground-muted text-sm">Indicator</p>
        <div class="flex flex-wrap gap-6">
          {#each KINDS as kind (kind)}
            <NavigationMenu aria-label={kind} icon={kind}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    {kind}
                    <NavigationMenuIcon />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul class="w-50 gap-0.5">
                      {#each ICON_LINKS as item (item)}
                        <li>
                          <NavigationMenuLink href="#!">{item}</NavigationMenuLink>
                        </li>
                      {/each}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          {/each}
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-foreground-muted text-sm">Vertical</p>
        <NavigationMenu aria-label="Sidebar" orientation="vertical" class="w-48">
          <NavigationMenuList>
            {#each MENUS as menu (menu.label)}
              <NavigationMenuItem>
                <NavigationMenuTrigger class="w-full justify-start">
                  {@render namedIcon(menu.icon, 'start')}
                  {menu.label}
                  <NavigationMenuIcon class="ms-auto" />
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul class="w-48 gap-0.5">
                    {#each menu.links as link (link)}
                      <li>
                        <NavigationMenuLink href="#!">{link}</NavigationMenuLink>
                      </li>
                    {/each}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            {/each}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-foreground-muted text-sm">Backdrop</p>
        <NavigationMenu aria-label="Main" backdrop>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                Products
                <NavigationMenuIcon />
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="grid w-94 grid-cols-2 gap-0.5">
                  {#each BACKDROP_PRODUCTS as product (product.title)}
                    <li>
                      <NavigationMenuLink href="#!" class={cardClass}>
                        <span class="text-foreground-intense font-medium">{product.title}</span>
                        <span class="text-foreground-muted text-xs font-normal">{product.description}</span>
                      </NavigationMenuLink>
                    </li>
                  {/each}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#!">Pricing</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-foreground-muted text-sm">Nested submenus</p>
        <NavigationMenu aria-label="Main">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                Company
                <NavigationMenuIcon />
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul class="w-58 gap-0.5">
                  {#each COMPANY as item (item.title)}
                    <li>
                      <NavigationMenuLink href="#!" class={cardClass}>
                        <span class="text-foreground-intense font-medium">{item.title}</span>
                        <span class="text-foreground-muted text-xs font-normal">{item.description}</span>
                      </NavigationMenuLink>
                    </li>
                  {/each}
                  <li>
                    <NavigationMenu orientation="vertical">
                      <NavigationMenuList class="w-full">
                        <NavigationMenuItem class="w-full">
                          <NavigationMenuTrigger class="h-auto w-full whitespace-normal">
                            <span class="flex min-w-0 flex-1 flex-col items-start gap-0.5">
                              <span class="text-foreground-intense font-medium">Handbook</span>
                              <span class="text-foreground-muted text-xs font-normal">
                                How the team works, day to day.
                              </span>
                            </span>
                            <NavigationMenuIcon />
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul class="w-50 gap-0.5">
                              {#each HANDBOOK as item (item.title)}
                                <li>
                                  <NavigationMenuLink href="#!" class={cardClass}>
                                    <span class="text-foreground-intense font-medium">{item.title}</span>
                                    <span class="text-foreground-muted text-xs font-normal">{item.description}</span>
                                  </NavigationMenuLink>
                                </li>
                              {/each}
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="#!">Pricing</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-foreground-muted text-sm">Nested inline submenus</p>
        <NavigationMenu aria-label="Main">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                Product
                <NavigationMenuIcon />
              </NavigationMenuTrigger>
              <NavigationMenuContent class="p-0">
                <NavigationMenu orientation="vertical" defaultValue="developers" viewport={false}>
                  <div class="grid w-125 grid-cols-[13rem_minmax(0,1fr)]">
                    <NavigationMenuList class="border-border w-full flex-col items-stretch gap-1 border-e p-2">
                      {#each AUDIENCES as menu (menu.value)}
                        <NavigationMenuItem value={menu.value} class="w-full">
                          <NavigationMenuTrigger class="w-full {inlineCardClass}">
                            <span class="text-foreground-intense font-medium">{menu.label}</span>
                            <span class="text-foreground-muted text-xs font-normal">{menu.hint}</span>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent class="p-0">
                            <div class="flex flex-col gap-3 p-2">
                              <div class="px-3 pt-1">
                                <h4 class="text-foreground-intense m-0 font-semibold">{menu.title}</h4>
                                <p class="text-foreground-muted m-0 mt-0.5 text-sm">{menu.description}</p>
                              </div>
                              <ul class="grid gap-1">
                                {#each menu.links as link (link.title)}
                                  <li>
                                    <NavigationMenuLink href="#!" class={inlineCardClass}>
                                      <span class="text-foreground-emphasis font-medium">{link.title}</span>
                                      <span class="text-foreground-muted text-xs font-normal">{link.description}</span>
                                    </NavigationMenuLink>
                                  </li>
                                {/each}
                              </ul>
                            </div>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      {/each}
                    </NavigationMenuList>
                    <NavigationMenuViewport class="min-h-60" />
                  </div>
                </NavigationMenu>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="#!">Pricing</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  </DirectionProvider>
</section>
