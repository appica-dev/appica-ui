<script lang="ts">
  import Checkbox from './checkbox.svelte'

  let { onCheckedChange, locked = false }: { onCheckedChange?: (checked: boolean) => void; locked?: boolean } =
    $props()
</script>

<Checkbox aria-label="Controlled" checked={locked} {onCheckedChange} />
