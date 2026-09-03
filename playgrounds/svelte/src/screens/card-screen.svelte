<script lang="ts">
  import { Button, Card, CardDescription, CardFooter, CardHeader, CardMedia, CardTitle } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Card</h2>
  <Card el="article" class="max-w-sm" frame>
    <CardMedia>
      <img alt="Placeholder" src="https://picsum.photos/400/180" />
    </CardMedia>
    <CardHeader>
      <CardTitle>Lake trail</CardTitle>
      <CardDescription>A framed card with media, title, and footer actions.</CardDescription>
    </CardHeader>
    <CardFooter>
      <Button size="sm">Open</Button>
      <Button size="sm" variant="ghost">Skip</Button>
    </CardFooter>
  </Card>
</section>
