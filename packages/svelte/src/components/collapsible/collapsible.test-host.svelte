<script lang="ts">
  import Collapsible from './collapsible.svelte'
  import CollapsibleTrigger from './collapsible-trigger.svelte'
  import CollapsibleContent from './collapsible-content.svelte'

  let {
    defaultOpen,
    disabled,
    keepMounted,
  }: {
    defaultOpen?: boolean
    disabled?: boolean
    keepMounted?: boolean
  } = $props()
</script>

<Collapsible {defaultOpen} {disabled}>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent {keepMounted}>
    <p>Panel body</p>
  </CollapsibleContent>
</Collapsible>
