<script lang="ts">
  import Toc from './toc.svelte'
  import TocItem from './toc-item.svelte'
  import TocLink from './toc-link.svelte'
  import TocList from './toc-list.svelte'

  let {
    ariaLabel,
    rootMargin,
  }: {
    ariaLabel?: string
    rootMargin?: string
  } = $props()
</script>

<main>
  <h2 id="intro">Intro</h2>
  <h2 id="usage">Usage</h2>
  <h3 id="props">Props</h3>
</main>
<Toc aria-label={ariaLabel} {rootMargin}>
  <TocList>
    <TocItem>
      <TocLink href="#intro">Intro</TocLink>
    </TocItem>
    <TocItem>
      <TocLink href="#usage">Usage</TocLink>
    </TocItem>
    <TocItem>
      <TocLink href="#props" depth={3}>Props</TocLink>
    </TocItem>
  </TocList>
</Toc>
