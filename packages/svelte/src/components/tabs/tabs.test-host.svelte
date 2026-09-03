<script lang="ts">
  import Tabs from './tabs.svelte'
  import TabsList from './tabs-list.svelte'
  import TabsTrigger from './tabs-trigger.svelte'
  import TabsContent from './tabs-content.svelte'
  import type { TabsListVariant, TabsOrientation, TabsSize } from './tabs-variants'

  let {
    defaultValue = 'one',
    secondDisabled,
    variant,
    size,
    orientation,
  }: {
    defaultValue?: string
    secondDisabled?: boolean
    variant?: TabsListVariant
    size?: TabsSize
    orientation?: TabsOrientation
  } = $props()
</script>

<Tabs {defaultValue} {variant} {size} {orientation}>
  <TabsList>
    <TabsTrigger value="one">One</TabsTrigger>
    <TabsTrigger value="two" disabled={secondDisabled}>Two</TabsTrigger>
    <TabsTrigger value="three">Three</TabsTrigger>
  </TabsList>
  <TabsContent value="one">Panel One</TabsContent>
  <TabsContent value="two">Panel Two</TabsContent>
  <TabsContent value="three">Panel Three</TabsContent>
</Tabs>
