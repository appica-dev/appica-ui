<script lang="ts">
  import { DirectionProvider, Switch, ToastProvider, Toaster, type ToastPosition } from '@appica/ui-svelte'
  import ToastExamples from './toast-screen-buttons.svelte'

  let dir: 'ltr' | 'rtl' = $state('ltr')
  let position: ToastPosition = $state('bottom-right')
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Toast</h2>

  <label class="flex items-center gap-2 text-sm">
    <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
    RTL
  </label>

  <DirectionProvider {dir}>
    <ToastProvider>
      <ToastExamples bind:position />
      <Toaster {position} progress />
    </ToastProvider>
  </DirectionProvider>
</section>
