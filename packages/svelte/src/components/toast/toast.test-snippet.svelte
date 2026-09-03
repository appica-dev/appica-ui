<script lang="ts">
  import ToastProvider from './toast-provider.svelte'
  import Toaster from './toaster.svelte'
  import ToastSnippetTrigger from './toast.test-snippet-trigger.svelte'
</script>

<ToastProvider>
  <ToastSnippetTrigger />
  <Toaster />
</ToastProvider>
