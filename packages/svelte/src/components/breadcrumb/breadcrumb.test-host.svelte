<script lang="ts">
  import Breadcrumb from './breadcrumb.svelte'
  import BreadcrumbEllipsis from './breadcrumb-ellipsis.svelte'
  import BreadcrumbItem from './breadcrumb-item.svelte'
  import BreadcrumbLink from './breadcrumb-link.svelte'
  import BreadcrumbList from './breadcrumb-list.svelte'
  import BreadcrumbSeparator from './breadcrumb-separator.svelte'

  let {
    disabled = false,
    linkClass,
    linkEl = 'a',
    onclick,
    separatorText,
  }: {
    disabled?: boolean
    linkClass?: string
    linkEl?: 'a' | 'button'
    onclick?: (event: MouseEvent) => void
    separatorText?: string
  } = $props()
</script>

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/" class={linkClass} el={linkEl} {onclick}>Home</BreadcrumbLink>
    </BreadcrumbItem>
    {#if separatorText !== undefined}
      <BreadcrumbSeparator data-testid="sep">{separatorText}</BreadcrumbSeparator>
    {:else}
      <BreadcrumbSeparator data-testid="sep" />
    {/if}
    <BreadcrumbItem>
      <BreadcrumbEllipsis />
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/components" disabled={disabled} el={linkEl}>Components</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink active>Breadcrumb</BreadcrumbLink>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
