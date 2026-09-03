<script lang="ts">
  import ToastProvider from './toast-provider.svelte'
  import Toaster from './toaster.svelte'
  import type { ToastManager } from './toast-manager.svelte'

  let { manager }: { manager: ToastManager } = $props()
</script>

<ToastProvider toastManager={manager}>
  <Toaster />
</ToastProvider>
