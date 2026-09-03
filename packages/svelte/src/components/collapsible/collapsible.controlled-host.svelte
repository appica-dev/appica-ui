<script lang="ts">
  import Collapsible from './collapsible.svelte'
  import CollapsibleTrigger from './collapsible-trigger.svelte'
  import CollapsibleContent from './collapsible-content.svelte'

  let {
    locked = false,
    onOpenChange,
  }: {
    locked?: boolean
    onOpenChange?: (open: boolean) => void
  } = $props()

  let open = $state(false)

  function handleOpenChange(next: boolean) {
    onOpenChange?.(next)
    if (!locked) open = next
  }
</script>

<Collapsible {open} onOpenChange={handleOpenChange}>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>
    <p>Panel body</p>
  </CollapsibleContent>
</Collapsible>
