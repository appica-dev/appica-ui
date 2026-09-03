<script lang="ts">
  import Card from './card.svelte'
  import CardDescription from './card-description.svelte'
  import CardFooter from './card-footer.svelte'
  import CardHeader from './card-header.svelte'
  import CardMedia from './card-media.svelte'
  import CardTitle from './card-title.svelte'

  let {
    frame = false,
    inset = true,
    el = 'div',
    class: className,
  }: {
    frame?: boolean | 'solid' | 'glass'
    inset?: boolean
    el?: 'div' | 'article' | 'li' | 'section' | 'aside'
    class?: string
  } = $props()
</script>

<Card {frame} {inset} {el} class={className}>
  <CardMedia>
    <img alt="" src="https://example.com/cover.jpg" />
  </CardMedia>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardFooter>
    <span>Footer</span>
  </CardFooter>
</Card>
