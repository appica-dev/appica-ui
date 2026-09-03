<script lang="ts">
  import Switch from './switch.svelte'

  let { onCheckedChange, locked = false }: { onCheckedChange?: (checked: boolean) => void; locked?: boolean } =
    $props()
</script>

<Switch aria-label="Controlled" checked={locked} {onCheckedChange} />
