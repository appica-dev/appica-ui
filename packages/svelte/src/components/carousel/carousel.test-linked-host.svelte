<script lang="ts">
  import { useLinkedCarousels } from './use-linked-carousels.svelte'
  import type { CarouselApi } from './carousel-types'

  let {
    mainApi,
    thumbsApi,
  }: {
    mainApi?: CarouselApi
    thumbsApi?: CarouselApi
  } = $props()

  useLinkedCarousels(
    () => mainApi,
    () => thumbsApi,
  )
</script>
