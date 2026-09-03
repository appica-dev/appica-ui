<script lang="ts">
  import Input from './input.svelte'

  let { onValue }: { onValue?: (value: string) => void } = $props()
  let value = $state('')
</script>

<Input
  aria-label="Controlled"
  bind:value
  oninput={() => {
    onValue?.(value)
  }}
/>
