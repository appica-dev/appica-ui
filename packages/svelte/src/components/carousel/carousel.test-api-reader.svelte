<script lang="ts">
  import { useCarousel } from './carousel-context'
  import type { CarouselApi } from './carousel-types'

  let { onApi }: { onApi: (api: CarouselApi | undefined) => void } = $props()

  const ctx = useCarousel()

  $effect(() => {
    onApi(ctx.api)
  })
</script>
