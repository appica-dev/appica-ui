<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { cn } from '../../internal/utils'
  import { DEPTH_INDENT, getTocContext } from './toc-context'

  type Props = HTMLAnchorAttributes & {
    /** **Required.** The target heading, as a hash (`#id`). The `id` after `#` is the heading observed. */
    href: string
    /**
     * Heading level (2-6); controls the indentation. Higher = deeper indent.
     * @default 2
     */
    depth?: number
    children?: Snippet
  }

  let { class: className, depth = 2, href, children, ...rest }: Props = $props()

  const ctx = getTocContext('TocLink')
  const id = $derived(href.startsWith('#') ? href.slice(1) : null)
  const activeIds = $derived(ctx.activeIds())
  const currentId = $derived(ctx.currentId())
  const active = $derived(id !== null && activeIds.includes(id))
  const indent = $derived(DEPTH_INDENT[Math.min(Math.max(Math.trunc(depth), 2), 6)])

  const registerLink = (node: HTMLAnchorElement) => {
    const headingId = id
    if (!headingId) return
    return untrack(() => ctx.register(headingId, node))
  }
</script>

<a
  {@attach registerLink}
  {href}
  data-slot="toc-link"
  data-active={active ? '' : undefined}
  aria-current={id !== null && currentId === id ? 'location' : undefined}
  class={cn(
    'text-foreground-muted block transform-gpu py-1.5 text-sm font-medium outline-none',
    'transition duration-250 motion-reduce:transition-none',
    'hover:text-foreground-intense focus-visible:text-foreground-intense data-active:text-foreground-intense',
    'active:translate-y-px active:scale-[0.98] active:duration-100 active:ease-in-out',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4.5 [&_svg:not([class*='stroke-'])]:stroke-[1.85]",
    indent,
    className,
  )}
  {...rest}
>
  {@render children?.()}
</a>
