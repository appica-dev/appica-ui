<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { SvelteMap, SvelteSet } from 'svelte/reactivity'
  import { areSameIds, closestHeadingId, setTocContext } from './toc-context'

  type Props = HTMLAttributes<HTMLElement> & {
    /**
     * `IntersectionObserver` `rootMargin` (`top right bottom left`) - offset the active boundary, e.g. for a sticky
     * header.
     * @default '0px'
     */
    rootMargin?: string
    children?: Snippet
  }

  let {
    class: className,
    rootMargin = '0px',
    'aria-label': ariaLabel = 'Table of contents',
    children,
    ...rest
  }: Props = $props()

  let ids = $state<readonly string[]>([])
  let activeIds = $state<readonly string[]>([])
  const linkElements = new SvelteMap<string, HTMLElement>()

  function register(id: string, element: HTMLElement) {
    linkElements.set(id, element)
    untrack(() => {
      if (!ids.includes(id)) ids = [...ids, id]
    })
    return () => {
      linkElements.delete(id)
      untrack(() => {
        ids = ids.filter((existing) => existing !== id)
      })
    }
  }

  function getLinkElement(id: string) {
    return linkElements.get(id)
  }

  setTocContext({
    activeIds: () => activeIds,
    currentId: () => activeIds[0] ?? null,
    register,
    getLinkElement,
  })

  $effect(() => {
    const observed = ids
    const margin = rootMargin
    if (observed.length === 0) {
      const current = untrack(() => activeIds)
      if (current.length !== 0) activeIds = []
      return
    }
    if (typeof IntersectionObserver === 'undefined') return
    const visible = new SvelteSet<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        let next = observed.filter((id) => visible.has(id))
        if (next.length === 0) {
          const fallback = closestHeadingId(observed, entries[0]?.rootBounds ?? null)
          if (fallback) next = [fallback]
        }
        const current = untrack(() => activeIds)
        if (!areSameIds(current, next)) activeIds = next
      },
      { rootMargin: margin },
    )
    for (const id of observed) {
      const heading = document.getElementById(id)
      if (heading) observer.observe(heading)
    }
    return () => observer.disconnect()
  })
</script>

<nav data-slot="toc" aria-label={ariaLabel} class={className} {...rest}>
  {@render children?.()}
</nav>
