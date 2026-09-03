<script lang="ts">
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Tabs</h2>

  <Tabs defaultValue="one" class="max-w-md">
    <TabsList>
      <TabsTrigger value="one">One</TabsTrigger>
      <TabsTrigger value="two">Two</TabsTrigger>
      <TabsTrigger value="three">Three</TabsTrigger>
    </TabsList>
    <TabsContent value="one">First panel</TabsContent>
    <TabsContent value="two">Second panel</TabsContent>
    <TabsContent value="three">Third panel</TabsContent>
  </Tabs>

  <Tabs defaultValue="a" variant="line" size="sm" class="max-w-md">
    <TabsList>
      <TabsTrigger value="a">Line</TabsTrigger>
      <TabsTrigger value="b">Small</TabsTrigger>
    </TabsList>
    <TabsContent value="a">Line variant</TabsContent>
    <TabsContent value="b">Small size</TabsContent>
  </Tabs>
</section>
