<script lang="ts">
  import Textarea from './textarea.svelte'

  let { onValue }: { onValue?: (value: string) => void } = $props()
  let value = $state('')
</script>

<Textarea
  aria-label="Controlled"
  bind:value
  oninput={() => {
    onValue?.(value)
  }}
/>
