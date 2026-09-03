<script lang="ts">
  import {
    Pagination,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationList,
  } from '@appica/ui-svelte'

  let page = $state(2)
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Pagination</h2>
  <Pagination>
    <PaginationList>
      <PaginationItem>
        <PaginationLink href="#prev" aria-label="Go to previous page" disabled={page <= 1}>Prev</PaginationLink>
      </PaginationItem>
      {#each [1, 2, 3] as n (n)}
        <PaginationItem>
          <PaginationLink href={`#${n}`} active={page === n} onclick={() => (page = n)}>{n}</PaginationLink>
        </PaginationItem>
      {/each}
      <PaginationItem>
        <PaginationEllipsis />
      </PaginationItem>
      <PaginationItem>
        <PaginationLink href="#next" aria-label="Go to next page">Next</PaginationLink>
      </PaginationItem>
    </PaginationList>
  </Pagination>
</section>
