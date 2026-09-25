<script lang="ts">
  import type { Snippet } from 'svelte'
  import { Accessible, Palette, Rocket, TextDirectionRtl } from '@appica/icons-svelte'
  import { DirectionProvider, Switch, Toc, TocItem, TocLink, TocList } from '@appica/ui-svelte'

  type Heading = {
    id: string
    title: string
    body: string
    depth?: number
  }

  const DEFAULT_SECTIONS: Heading[] = [
    {
      id: 'toc-demo-getting-started',
      title: 'Getting started',
      body: 'Install the package with your favorite package manager and import the component you need. Every component ships from its own subpath, so your bundler only pulls in what you actually use and tree-shaking does the rest. There is no global stylesheet to wire up beyond the theme layer - the components bring their own styles, so a fresh install renders correctly with nothing else configured. A component behaves identically on the server and the client, so you can drop it anywhere in a React tree without reaching for a "use client" boundary unless your own code needs one. Sensible defaults mean most components look right immediately, and every visual choice can be overridden through props or class names. Once you are comfortable with one component the rest follow the same composition-first API, so there is very little new to learn as you reach for more of them across a project.',
    },
    {
      id: 'toc-demo-theming',
      title: 'Theming',
      body: 'Colors, radii, and motion are driven entirely by CSS variables. Override them at any level of the tree to retheme a single section or the whole application, with no build step or configuration. Light and dark modes are just two sets of the same variables, so a theme toggle is a single class on a parent element. Because everything resolves at runtime, you can even let users tweak the palette live.',
    },
    {
      id: 'toc-demo-accessibility',
      title: 'Accessibility',
      body: 'Components follow the WAI-ARIA patterns out of the box - roving focus, correct roles, and labeled landmarks - so keyboard and screen-reader support comes for free. Focus is trapped and restored where it should be, and every interactive element is reachable by keyboard. We test the primitives against axe to catch regressions early. You are still responsible for naming your own instances, but the wiring underneath is handled.',
    },
    {
      id: 'toc-demo-rtl',
      title: 'Right-to-left',
      body: 'Logical properties and a direction provider mean every component mirrors cleanly under dir="rtl" without any extra work on your part. Padding, borders, and animations all flip to follow the reading direction. Arrow-key navigation and popup placement respect the resolved direction too. Switching a whole app to RTL is a single attribute on the html element plus the provider.',
    },
  ]

  const NESTED_HEADINGS: Heading[] = [
    {
      id: 'toc-nested-install',
      title: 'Installation',
      depth: 2,
      body: 'Add the package to your project before importing anything. It has a single peer dependency on React and works with any bundler that understands ES modules, so there is no special configuration to add and nothing to register globally. Pick the package manager your team already uses - the install command is the only thing that differs between them, and the resulting dependency is identical. In a monorepo, add it to the package that actually renders UI rather than the workspace root, so each app pins the version it depends on and upgrades stay scoped. Commit your lockfile afterwards so every environment, including CI, resolves exactly the same build of the library. Once it is installed you can import any component from its own subpath and start composing immediately, with no build step and no global stylesheet to wire up first.',
    },
    {
      id: 'toc-nested-pnpm',
      title: 'pnpm',
      depth: 3,
      body: 'Run pnpm add to install it into the current workspace. In a monorepo, scope it to the package that renders UI rather than the root so versions stay explicit per app.',
    },
    {
      id: 'toc-nested-npm',
      title: 'npm',
      depth: 3,
      body: 'npm install works identically and writes the dependency to your package.json. Commit the lockfile so every environment resolves the same version of the library.',
    },
    {
      id: 'toc-nested-usage',
      title: 'Usage',
      depth: 2,
      body: 'Import the parts you need and compose them. Components are designed to be assembled rather than configured through long prop lists, so most screens are just JSX. The pieces share a styling context, so a variant set once flows down.',
    },
    {
      id: 'toc-nested-import',
      title: 'Importing',
      depth: 3,
      body: 'Each component lives at its own subpath, so import from there rather than a barrel. This keeps your bundle lean and makes it obvious which parts a file actually depends on.',
    },
    {
      id: 'toc-nested-compose',
      title: 'Composing',
      depth: 3,
      body: 'Nest the sub-components to build the shape you want, and reach for the render prop when you need to project a part onto your own element. Composition is the primary extension point across the whole library.',
    },
    {
      id: 'toc-nested-faq',
      title: 'FAQ',
      depth: 2,
      body: 'Answers to the questions that come up most often, from server-component support to bundle size and theming. If something is missing here, the per-component pages go deeper.',
    },
  ]

  const ICON_SECTIONS: Heading[] = [
    {
      id: 'toc-icons-getting-started',
      title: 'Getting started',
      body: 'Install the package and import the component you need from its own subpath. There is nothing global to configure - components bring their own styles, so you can drop one into a page and it renders correctly straight away, with no provider or stylesheet to register first. Tree-shaking keeps your bundle to only the parts you import, and there is no runtime style injection to worry about. A component works the same whether it is rendered on the server or the client, so you can use it anywhere in a React tree without a "use client" boundary unless your own code needs one. Sensible defaults mean it looks right immediately, and you can override any of it through props or class names. Once you are comfortable with one component the rest follow the same composition-first API, so there is very little new to learn as you reach for more of them.',
    },
    {
      id: 'toc-icons-theming',
      title: 'Theming',
      body: 'Colors, radii, and motion are driven by CSS variables you can override anywhere in the tree. Light and dark are two sets of the same variables, so a theme switch is a single class on a parent. There is no build step involved, and values resolve live at runtime.',
    },
    {
      id: 'toc-icons-accessibility',
      title: 'Accessibility',
      body: 'Components follow the WAI-ARIA patterns out of the box, so keyboard support and screen-reader semantics come for free. Focus management, roles, and labeled landmarks are handled by the primitives. You still name your own instances, but the wiring underneath is done for you.',
    },
    {
      id: 'toc-icons-rtl',
      title: 'Right-to-left',
      body: 'Logical properties mean every component mirrors cleanly under dir="rtl". Padding, borders, focus order, and popup placement all flip to follow the reading direction. Switching the whole app is a single attribute plus the direction provider.',
    },
  ]

  const RTL_SECTIONS: Heading[] = DEFAULT_SECTIONS.map((section) => ({
    ...section,
    id: section.id.replace('toc-demo-', 'toc-rtl-'),
  }))

  let dir: 'ltr' | 'rtl' = $state('ltr')

  // Demo only: scrolls within this panel instead of the page so the example stays put.
  // A page-level TOC needs none of this - let the anchor jump the page natively.
  function scrollWithinPanel(event: MouseEvent) {
    const target = event.target
    if (!(target instanceof Element)) return
    const link = target.closest('a[href^="#"]')
    if (!link) return
    const href = link.getAttribute('href')
    if (!href) return
    const id = decodeURIComponent(href.slice(1))
    const heading = document.getElementById(id)
    const panel = heading?.closest('[data-scroll-panel]')
    if (!heading || !(panel instanceof HTMLElement)) return
    event.preventDefault()
    const gap = parseFloat(getComputedStyle(heading).scrollMarginTop) || 0
    const top = heading.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop - gap
    panel.scrollTo({ top, behavior: 'smooth' })
  }
</script>

{#snippet rocketIcon()}
  <Rocket aria-hidden="true" />
{/snippet}

{#snippet paletteIcon()}
  <Palette aria-hidden="true" />
{/snippet}

{#snippet accessibleIcon()}
  <Accessible aria-hidden="true" />
{/snippet}

{#snippet rtlIcon()}
  <TextDirectionRtl aria-hidden="true" />
{/snippet}

{#snippet demo(sections: Heading[], icons?: Record<string, Snippet>)}
  <div class="flex w-full max-w-xl gap-4">
    <div data-scroll-panel class="border-border h-64 flex-1 scrollbar-none overflow-auto rounded-lg border p-4">
      {#each sections as section (section.id)}
        <section class="mb-6 last:mb-0">
          {#if (section.depth ?? 2) === 2}
            <h3 id={section.id} class="text-foreground-intense mb-2 scroll-mt-6 font-semibold">{section.title}</h3>
          {:else}
            <h4 id={section.id} class="text-foreground-intense mb-2 scroll-mt-6 text-sm font-medium">{section.title}</h4>
          {/if}
          <p class="text-sm leading-relaxed">{section.body}</p>
        </section>
      {/each}
    </div>

    <Toc class="w-38 shrink-0" onclick={scrollWithinPanel}>
      <TocList>
        {#each sections as section (section.id)}
          <TocItem>
            <TocLink
              href={`#${section.id}`}
              depth={section.depth}
              class={icons ? 'flex items-center gap-2 [&_svg]:size-4 [&_svg]:shrink-0' : undefined}
            >
              {#if icons?.[section.id]}
                {@render icons[section.id]()}
              {/if}
              {section.title}
            </TocLink>
          </TocItem>
        {/each}
      </TocList>
    </Toc>
  </div>
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Toc</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Default</p>
    {@render demo(DEFAULT_SECTIONS)}
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Nested headings</p>
    {@render demo(NESTED_HEADINGS)}
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">With icons</p>
    {@render demo(ICON_SECTIONS, {
      'toc-icons-getting-started': rocketIcon,
      'toc-icons-theming': paletteIcon,
      'toc-icons-accessibility': accessibleIcon,
      'toc-icons-rtl': rtlIcon,
    })}
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        {@render demo(RTL_SECTIONS)}
      </div>
    </DirectionProvider>
  </div>
</section>
