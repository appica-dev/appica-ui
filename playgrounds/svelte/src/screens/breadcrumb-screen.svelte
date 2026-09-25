<script lang="ts">
  import { FileText, Folder, Home, LayoutGrid } from '@appica/icons-svelte'
  import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
    DirectionProvider,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLinkItem,
    DropdownMenuTrigger,
    Switch,
    badgeVariants,
  } from '@appica/ui-svelte'

  let dir: 'ltr' | 'rtl' = $state('ltr')

  function stay(event: MouseEvent) {
    event.preventDefault()
  }
</script>

{#snippet homeIcon()}
  <Home data-icon="start" />
{/snippet}

{#snippet folderIcon()}
  <Folder data-icon="start" />
{/snippet}

{#snippet fileTextIcon()}
  <FileText data-icon="start" />
{/snippet}

{#snippet componentsIcon()}
  <LayoutGrid data-icon="start" />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Breadcrumb</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Basic</p>
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#!" onclick={stay}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#!" onclick={stay}>Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink active>Breadcrumb</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">With icons</p>
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#!" onclick={stay}>
            {@render homeIcon()}
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#!" onclick={stay}>
            {@render folderIcon()}
            Projects
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink active>
            {@render fileTextIcon()}
            Roadmap
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Custom separators</p>
    <div class="flex flex-col gap-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#!" onclick={stay}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="#!" onclick={stay}>Docs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink active>Breadcrumb</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#!" onclick={stay}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <span class="bg-foreground-muted size-0.75 rounded-full"></span>
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="#!" onclick={stay}>Docs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <span class="bg-foreground-muted size-0.75 rounded-full"></span>
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink active>Breadcrumb</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Soft badges</p>
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#!" class={badgeVariants({ variant: 'soft' })} onclick={stay}>
            {@render homeIcon()}
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#!" class={badgeVariants({ variant: 'soft' })} onclick={stay}>
            {@render componentsIcon()}
            Library
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink active class={badgeVariants({ variant: 'soft' })}>
            {@render componentsIcon()}
            Component
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Collapsed trail</p>
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#!" onclick={stay}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              class="text-foreground-muted hover:text-foreground-intense outline-ring hover:bg-background-muted data-popup-open:bg-background-muted data-popup-open:text-foreground-intense rounded-2xs flex size-6 items-center justify-center transition"
            >
              <BreadcrumbEllipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLinkItem href="#!" onclick={stay}>Documentation</DropdownMenuLinkItem>
              <DropdownMenuLinkItem href="#!" onclick={stay}>Components</DropdownMenuLinkItem>
              <DropdownMenuLinkItem href="#!" onclick={stay}>Themes</DropdownMenuLinkItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#!" onclick={stay}>Breadcrumb</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink active>Collapsed</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Router links</p>
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/ui/components/react/breadcrumb" onclick={stay}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/ui/components/react/breadcrumb" onclick={stay}>Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink active>Breadcrumb</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#!" onclick={stay}>Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#!" onclick={stay}>Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink active>Breadcrumb</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </DirectionProvider>
  </div>
</section>
