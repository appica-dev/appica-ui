<script lang="ts">
  import { ChevronRight, File, Folder, FolderOpen, Maximize, Minimize } from '@appica/icons-svelte'
  import {
    Button,
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    DirectionProvider,
    Field,
    FieldLabel,
    Input,
    Switch,
    buttonVariants,
  } from '@appica/ui-svelte'

  type TreeNode = { name: string; children?: TreeNode[] }

  const tree: TreeNode[] = [
    {
      name: 'src',
      children: [
        {
          name: 'app',
          children: [{ name: 'layout.tsx' }, { name: 'page.tsx' }, { name: 'globals.css' }],
        },
        {
          name: 'components',
          children: [{ name: 'site-header.tsx' }, { name: 'site-footer.tsx' }],
        },
        { name: 'lib', children: [{ name: 'utils.ts' }] },
      ],
    },
    {
      name: 'public',
      children: [{ name: 'favicon.ico' }, { name: 'logo.svg' }],
    },
    { name: 'package.json' },
    { name: 'README.md' },
  ]

  let showMoreOpen = $state(false)
  let orderOpen = $state(false)
  let dir: 'ltr' | 'rtl' = $state('ltr')
</script>

{#snippet chevronRight(extraClass: string)}
  <ChevronRight class={['rtl:-scale-x-100', extraClass]} />
{/snippet}

{#snippet folderIcon()}
  <Folder class="text-foreground-muted size-4 shrink-0 group-data-panel-open:hidden" />
{/snippet}

{#snippet folderOpenIcon()}
  <FolderOpen class="text-foreground-muted hidden size-4 shrink-0 group-data-panel-open:block" />
{/snippet}

{#snippet fileIcon()}
  <File class="size-4 shrink-0" />
{/snippet}

{#snippet maximizeIcon()}
  <Maximize class="group-data-open:hidden" />
{/snippet}

{#snippet minimizeIcon()}
  <Minimize class="hidden group-data-open:block" />
{/snippet}

{#snippet pxSlot()}
  <span class="text-foreground-muted text-xs">px</span>
{/snippet}

{#snippet cornerField(label: string, defaultValue: string)}
  <Field>
    <FieldLabel class="text-xs font-normal">{label}</FieldLabel>
    <Input inputSize="sm" type="number" value={defaultValue} end={pxSlot} />
  </Field>
{/snippet}

{#snippet treeItem(node: TreeNode, defaultOpen = false)}
  {#if !node.children}
    <span class="text-foreground-muted flex items-center gap-1.5 py-1 ps-5.5">
      {@render fileIcon()}
      {node.name}
    </span>
  {:else}
    <Collapsible {defaultOpen}>
      <CollapsibleTrigger class="group inline-flex items-center gap-1.5 py-1 font-medium">
        {@render chevronRight(
          'size-4 shrink-0 stroke-[1.75] transition-transform duration-200 group-data-panel-open:rotate-90 motion-reduce:transition-none',
        )}
        {@render folderIcon()}
        {@render folderOpenIcon()}
        {node.name}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div class="ms-2 flex flex-col border-s ps-2">
          {#each node.children as child (child.name)}
            {@render treeItem(child)}
          {/each}
        </div>
      </CollapsibleContent>
    </Collapsible>
  {/if}
{/snippet}

{#snippet defaultCollapsible()}
  <Collapsible defaultOpen class="w-full max-w-100">
    <CollapsibleTrigger class="group text-foreground-intense inline-flex items-start gap-2 text-start font-medium">
      {@render chevronRight(
        'mt-0.75 size-4.5 shrink-0 stroke-2 transition-transform duration-200 group-data-panel-open:rotate-90 motion-reduce:transition-none',
      )}
      What's included in the free plan?
    </CollapsibleTrigger>
    <CollapsibleContent>
      <p class="ps-6.5 pt-2.5 text-sm">
        The free plan includes up to three projects, 1&nbsp;GB of storage, and community support - everything you need
        to evaluate the product before upgrading.
      </p>
    </CollapsibleContent>
  </Collapsible>
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Collapsible</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Default</p>
    {@render defaultCollapsible()}
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">File tree</p>
    <div class="w-full max-w-72 text-sm">
      {#each tree as node (node.name)}
        {@render treeItem(node, node.name === 'src')}
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Settings panel</p>
    <Collapsible class="group border-border w-full max-w-82 rounded-xl border p-5">
      <div>
        <h3 class="text-foreground-intense font-semibold">Corner radius</h3>
        <p class="text-foreground-muted text-sm">Round every corner at once, or set each one.</p>
      </div>

      <div class="mt-4 flex items-center gap-3">
        <Input
          inputSize="sm"
          type="number"
          value="12"
          class="flex-1"
          aria-label="All corners"
          end={pxSlot}
        />
        <CollapsibleTrigger
          class={[buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'shrink-0']}
          aria-label="Set each corner individually"
        >
          {@render maximizeIcon()}
          {@render minimizeIcon()}
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div class="mt-4 grid grid-cols-2 gap-4 px-1.5 pb-1.5">
          {@render cornerField('Top left', '12')}
          {@render cornerField('Top right', '12')}
          {@render cornerField('Bottom left', '12')}
          {@render cornerField('Bottom right', '12')}
        </div>
      </CollapsibleContent>
    </Collapsible>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Show more</p>
    <Collapsible open={showMoreOpen} onOpenChange={(next) => (showMoreOpen = next)} class="max-w-100 text-sm leading-relaxed">
      <p>
        Appica UI is a headless-first component library built on Base UI and Tailwind. It ships accessible primitives
        with sensible default styling you can override class by class.
      </p>
      <CollapsibleContent>
        <p class="pt-3">
          Every component supports right-to-left layouts, honors <code>prefers-reduced-motion</code>, and forwards refs
          and native attributes to the underlying element - so it drops into your design system without fighting it.
        </p>
      </CollapsibleContent>
      <CollapsibleTrigger class="text-primary mt-2 cursor-pointer text-sm font-medium hover:underline">
        {showMoreOpen ? 'Show less' : 'Show more'}
      </CollapsibleTrigger>
    </Collapsible>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Controlled</p>
    <div class="flex w-full max-w-100 flex-col gap-3">
      <div class="flex items-center justify-between">
        <span class="text-foreground-muted text-sm">
          Panel is <strong class="text-foreground">{orderOpen ? 'open' : 'closed'}</strong>
        </span>
        <Button size="sm" variant="outline" onclick={() => (orderOpen = !orderOpen)}>
          {orderOpen ? 'Collapse' : 'Expand'}
        </Button>
      </div>

      <Collapsible open={orderOpen} onOpenChange={(next) => (orderOpen = next)}>
        <CollapsibleTrigger class="group text-foreground-intense inline-flex items-start gap-2 text-start font-medium">
          {@render chevronRight(
            'mt-0.75 size-4.5 shrink-0 stroke-2 transition-transform duration-200 group-data-panel-open:rotate-90 motion-reduce:transition-none',
          )}
          Order #4982
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p class="ps-6.5 pt-2.5 text-sm">
            Two items, shipped on Aug&nbsp;30 via standard delivery. The header and the external button drive the same
            state, so either one toggles the panel.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled</p>
    <Collapsible disabled class="w-full max-w-100">
      <CollapsibleTrigger
        class="group text-foreground-intense data-disabled:text-foreground-muted inline-flex items-start gap-2 text-start font-medium"
      >
        {@render chevronRight(
          'mt-0.75 size-4.5 shrink-0 stroke-2 transition-transform duration-200 group-data-panel-open:rotate-90 motion-reduce:transition-none',
        )}
        Advanced settings
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p class="ps-6.5 pt-2.5 text-sm">These settings unlock on a paid plan.</p>
      </CollapsibleContent>
    </Collapsible>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Keep mounted</p>
    <Collapsible class="w-full max-w-100">
      <CollapsibleTrigger class="group text-foreground-intense inline-flex items-start gap-2 text-start font-medium">
        {@render chevronRight(
          'mt-0.75 size-4.5 shrink-0 stroke-2 transition-transform duration-200 group-data-panel-open:rotate-90 motion-reduce:transition-none',
        )}
        Shipping &amp; returns
      </CollapsibleTrigger>
      <CollapsibleContent keepMounted>
        <p class="ps-6.5 pt-2.5 text-sm">
          Orders ship within one business day and arrive in 3-5 days. With <code>keepMounted</code> the panel stays in
          the DOM while closed, so search engines and the browser's find-in-page can still reach this text.
        </p>
      </CollapsibleContent>
    </Collapsible>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        {@render defaultCollapsible()}
      </div>
    </DirectionProvider>
  </div>
</section>
