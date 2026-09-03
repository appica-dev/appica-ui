<script lang="ts">
  import { Button } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Button</h2>
  <div class="flex flex-wrap items-center gap-3">
    <Button>Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="destructive">Destructive</Button>
    <Button size="sm">Small</Button>
    <Button size="lg">Large</Button>
    <Button disabled>Disabled</Button>
    <Button href="#button">Link</Button>
  </div>
</section>
