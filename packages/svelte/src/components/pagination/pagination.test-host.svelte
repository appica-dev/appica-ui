<script lang="ts">
  import Pagination from './pagination.svelte'
  import PaginationEllipsis from './pagination-ellipsis.svelte'
  import PaginationItem from './pagination-item.svelte'
  import PaginationLink from './pagination-link.svelte'
  import PaginationList from './pagination-list.svelte'
  import type { PaginationSize, PaginationVariant } from './pagination-context'

  let {
    variant,
    size,
    disabledPrev = false,
    linkClass,
    linkEl = 'a',
    onclick,
  }: {
    variant?: PaginationVariant
    size?: PaginationSize
    disabledPrev?: boolean
    linkClass?: string
    linkEl?: 'a' | 'button'
    onclick?: (event: MouseEvent) => void
  } = $props()
</script>

<Pagination {variant} {size}>
  <PaginationList>
    <PaginationItem>
      <PaginationLink href="#prev" aria-label="Go to previous page" disabled={disabledPrev} el={linkEl} {onclick}>
        Prev
      </PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#1" class={linkClass} el={linkEl} {onclick}>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#2" active el={linkEl}>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#3" el={linkEl}>3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#next" aria-label="Go to next page" el={linkEl}>Next</PaginationLink>
    </PaginationItem>
  </PaginationList>
</Pagination>
