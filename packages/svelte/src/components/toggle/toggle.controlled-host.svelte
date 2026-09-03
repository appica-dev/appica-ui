<script lang="ts">
  import Toggle from './toggle.svelte'

  let { onPressedChange, locked = false }: { onPressedChange?: (pressed: boolean) => void; locked?: boolean } =
    $props()
</script>

<Toggle aria-label="Bold" pressed={locked} {onPressedChange}>B</Toggle>
