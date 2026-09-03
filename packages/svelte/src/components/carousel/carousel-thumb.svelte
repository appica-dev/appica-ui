<script lang="ts" module>
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  export type CarouselThumbProps = HTMLButtonAttributes & {
    /** Slide this thumbnail selects. Defaults to its position among the thumbnails. */
    index?: number
    children?: Snippet
  }
</script>

<script lang="ts">
  import { cn } from '../../internal/utils'
  import { useCarouselThumbs } from './carousel-thumbs-context'
  import { CAROUSEL_THUMB_TRANSITION } from './carousel-tokens'

  let { class: className, index: indexProp, children, onclick, ...rest }: CarouselThumbProps = $props()

  const thumbs = useCarouselThumbs()
  const assigned = thumbs.nextIndex()
  const index = $derived(indexProp ?? assigned)
  const active = $derived(index === thumbs.selectedIndex)
</script>

<button
  type="button"
  aria-label={`Go to slide ${index + 1}`}
  data-slot="carousel-thumb"
  data-active={active || undefined}
  aria-current={active ? 'true' : undefined}
  onclick={(event) => {
    onclick?.(event)
    if (!event.defaultPrevented) thumbs.select(index)
  }}
  class={cn(
    'block w-18 shrink-0 grow-0 transform-gpu cursor-pointer rounded-lg border p-1',
    thumbs.light ? 'outline-ring-light border-white/25 bg-white/10 backdrop-blur-md' : 'bg-background outline-ring',
    'focus-visible:outline-2',
    CAROUSEL_THUMB_TRANSITION,
    'active:translate-y-px active:scale-[0.97]',
    !active && 'opacity-65 hover:opacity-100',
    className,
  )}
  {...rest}
>
  <span
    data-slot="carousel-thumb-media"
    class={cn('relative block aspect-square w-full overflow-hidden rounded-md', thumbs.light ? 'bg-white/10' : 'bg-background-muted')}
  >
    {@render children?.()}
  </span>
</button>
