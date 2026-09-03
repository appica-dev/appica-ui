<script lang="ts">
  import { Card, CardDescription, CardHeader, CardTitle, GradientGlow } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">GradientGlow</h2>
  <GradientGlow class="p-4">
    <Card class="bg-background">
      <CardHeader>
        <CardTitle>Always on</CardTitle>
        <CardDescription>Aura rotates behind the card.</CardDescription>
      </CardHeader>
    </Card>
  </GradientGlow>
  <GradientGlow border revealOn="hover" class="p-4">
    <Card class="bg-background">
      <CardHeader>
        <CardTitle>Hover to reveal</CardTitle>
        <CardDescription>Glow and border appear on hover.</CardDescription>
      </CardHeader>
    </Card>
  </GradientGlow>
</section>
