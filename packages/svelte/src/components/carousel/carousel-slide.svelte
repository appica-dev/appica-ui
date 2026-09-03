<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  export type CarouselSlideProps = HTMLAttributes<HTMLDivElement> & {
    children?: Snippet
  }
</script>

<script lang="ts">
  import { cn } from '../../internal/utils'
  import { useCarousel } from './carousel-context'

  let { class: className, children, ...rest }: CarouselSlideProps = $props()

  const ctx = useCarousel()
</script>

<div
  data-slot="carousel-slide"
  data-orientation={ctx.orientation}
  role="group"
  aria-roledescription="slide"
  class={cn(
    'min-h-0 min-w-0 shrink-0 grow-0 basis-full',
    ctx.orientation === 'horizontal' ? 'ps-4' : 'pt-4',
    className,
  )}
  {...rest}
>
  {@render children?.()}
</div>
