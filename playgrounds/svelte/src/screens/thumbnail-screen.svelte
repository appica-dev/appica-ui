<script lang="ts">
  import { Thumbnail } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Thumbnail</h2>
  <div class="flex flex-wrap items-center gap-4">
    <Thumbnail src="https://picsum.photos/120" alt="Peak" />
    <Thumbnail shape="circle" src="https://picsum.photos/121" alt="Circle" />
    <Thumbnail variant="icon-soft">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z" />
      </svg>
    </Thumbnail>
    <Thumbnail variant="icon-primary" size="lg">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
      </svg>
    </Thumbnail>
  </div>
</section>
