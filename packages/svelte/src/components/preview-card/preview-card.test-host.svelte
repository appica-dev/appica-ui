<script lang="ts">
  import PreviewCard from './preview-card.svelte'
  import PreviewCardTrigger from './preview-card-trigger.svelte'
  import PreviewCardContent from './preview-card-content.svelte'

  let {
    body = 'A short preview of the linked page.',
    arrow = true,
    keepMounted = false,
  }: {
    body?: string
    arrow?: boolean
    keepMounted?: boolean
  } = $props()
</script>

<PreviewCard openDelay={0} closeDelay={0}>
  <PreviewCardTrigger href="https://example.com">example.com</PreviewCardTrigger>
  <PreviewCardContent {arrow} {keepMounted}>
    <p>{body}</p>
  </PreviewCardContent>
</PreviewCard>
