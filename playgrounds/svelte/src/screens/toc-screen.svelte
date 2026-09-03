<script lang="ts">
  import { Toc, TocItem, TocLink, TocList } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Toc</h2>
  <div class="grid grid-cols-[10rem_1fr] gap-8">
    <Toc class="sticky top-4 self-start">
      <TocList>
        <TocItem>
          <TocLink href="#toc-intro">Intro</TocLink>
        </TocItem>
        <TocItem>
          <TocLink href="#toc-usage">Usage</TocLink>
        </TocItem>
        <TocItem>
          <TocLink href="#toc-api" depth={3}>API</TocLink>
        </TocItem>
      </TocList>
    </Toc>
    <div class="flex flex-col gap-24 pb-24">
      <div>
        <h3 id="toc-intro" class="text-foreground-intense text-base font-semibold">Intro</h3>
        <p class="text-foreground-muted mt-2 text-sm">A table of contents tracks the heading in view.</p>
      </div>
      <div>
        <h3 id="toc-usage" class="text-foreground-intense text-base font-semibold">Usage</h3>
        <p class="text-foreground-muted mt-2 text-sm">Pass hash hrefs that match heading ids.</p>
      </div>
      <div>
        <h4 id="toc-api" class="text-foreground-intense text-base font-semibold">API</h4>
        <p class="text-foreground-muted mt-2 text-sm">Depth indents nested headings.</p>
      </div>
    </div>
  </div>
</section>
