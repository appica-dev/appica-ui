<script lang="ts">
  import Alert from './alert.svelte'
  import AlertTitle from './alert-title.svelte'

  let open = $state(true)
</script>

<Alert bind:open dismissible>
  <AlertTitle>System message</AlertTitle>
</Alert>
<p data-testid="bound-open">{String(open)}</p>
