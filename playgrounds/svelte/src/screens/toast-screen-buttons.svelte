<script lang="ts">
  import { Button, Spinner, Thumbnail, useToastManager, type ToastPosition } from '@appica/ui-svelte'

  type Props = {
    position?: ToastPosition
  }

  let { position = $bindable('bottom-right') }: Props = $props()

  const manager = useToastManager()

  const positions: ToastPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ]

  function save() {
    return new Promise<{ name: string }>((resolve, reject) => {
      setTimeout(() => (Math.random() > 0.3 ? resolve({ name: 'report.pdf' }) : reject(new Error('Network error'))), 2000)
    })
  }

  function showDefault() {
    manager.add({
      title: 'Changes saved',
      description: 'Your preferences have been updated.',
    })
  }

  function showIcon(kind: 'success' | 'error' | 'warning' | 'info') {
    switch (kind) {
      case 'success':
        manager.add({
          title: 'Payment received',
          description: 'Invoice #1024 has been settled.',
          data: { icon: kind },
        })
        return
      case 'error':
        manager.add({
          title: 'Upload failed',
          description: 'The file exceeds the 25 MB limit.',
          data: { icon: kind },
        })
        return
      case 'warning':
        manager.add({
          title: 'Storage almost full',
          description: 'You have used 92% of your quota.',
          data: { icon: kind },
        })
        return
      case 'info':
        manager.add({
          title: 'Heads up',
          description: 'Maintenance is scheduled for Sunday.',
          data: { icon: kind },
        })
        return
      default: {
        const _never: never = kind
        return _never
      }
    }
  }

  function showAction() {
    manager.add({
      title: 'Message archived',
      actionProps: {
        children: 'Undo',
        onclick: () => manager.add({ title: 'Message restored' }),
      },
    })
  }

  function showPromise() {
    void manager
      .promise(save(), {
        loading: {
          title: 'Saving…',
          data: { icon: loadingThumb },
        },
        success: {
          title: 'Saved',
          description: 'report.pdf is ready to share.',
          data: { icon: successThumb },
        },
        error: {
          title: 'Could not save',
          description: 'Check your connection and try again.',
          data: { icon: errorThumb },
        },
      })
      .catch(() => {})
  }

  function showFrom(next: ToastPosition) {
    position = next
    manager.add({
      title: 'Notification',
      description: `Anchored ${next}.`,
    })
  }

  function showTimed() {
    manager.add({
      title: 'Auto-dismiss',
      description: 'This toast closes in 6 seconds.',
      timeout: 6000,
    })
  }

  function showPersistent() {
    manager.add({
      title: 'Stays put',
      description: 'Set timeout to 0 to keep a toast until dismissed.',
      timeout: 0,
    })
  }
</script>

{#snippet bellIcon()}
  <Thumbnail variant="icon-soft" size="sm">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"
      />
    </svg>
  </Thumbnail>
{/snippet}

{#snippet successThumb()}
  <Thumbnail variant="icon-success" size="sm">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
      <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4"></path>
    </svg>
  </Thumbnail>
{/snippet}

{#snippet errorThumb()}
  <Thumbnail variant="icon-error" size="sm">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
      <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m15 9-6 6"></path>
      <path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m9 9 6 6"></path>
    </svg>
  </Thumbnail>
{/snippet}

{#snippet loadingThumb()}
  <Thumbnail variant="icon-soft" size="sm">
    <Spinner currentColor class="text-base" />
  </Thumbnail>
{/snippet}

<div class="flex flex-col gap-8">
  <div class="flex flex-col gap-2">
    <h3 class="text-foreground-emphasis text-sm font-medium">Default</h3>
    <div class="flex flex-wrap gap-2">
      <Button onclick={showDefault}>Show toast</Button>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <h3 class="text-foreground-emphasis text-sm font-medium">With an icon</h3>
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" onclick={() => showIcon('success')}>Success</Button>
      <Button variant="outline" onclick={() => showIcon('error')}>Error</Button>
      <Button variant="outline" onclick={() => showIcon('warning')}>Warning</Button>
      <Button variant="outline" onclick={() => showIcon('info')}>Info</Button>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <h3 class="text-foreground-emphasis text-sm font-medium">With a thumbnail</h3>
    <div class="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onclick={() =>
          manager.add({
            title: 'New notification',
            description: 'You have 3 unread messages.',
            data: { icon: bellIcon },
          })}
      >
        Default
      </Button>
      <Button
        variant="outline"
        onclick={() =>
          manager.add({
            title: 'Payment received',
            description: 'Invoice #1024 has been settled.',
            data: { icon: successThumb },
          })}
      >
        Success
      </Button>
      <Button
        variant="outline"
        onclick={() =>
          manager.add({
            title: 'Upload failed',
            description: 'The file exceeds the 25 MB limit.',
            data: { icon: errorThumb },
          })}
      >
        Error
      </Button>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <h3 class="text-foreground-emphasis text-sm font-medium">With an action</h3>
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" onclick={showAction}>Archive message</Button>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <h3 class="text-foreground-emphasis text-sm font-medium">Promise</h3>
    <div class="flex flex-wrap gap-2">
      <Button onclick={showPromise}>Save document</Button>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <h3 class="text-foreground-emphasis text-sm font-medium">Positions</h3>
    <div class="flex flex-wrap gap-2">
      {#each positions as item (item)}
        <Button variant={position === item ? 'primary' : 'outline'} size="sm" onclick={() => showFrom(item)}>
          {item}
        </Button>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <h3 class="text-foreground-emphasis text-sm font-medium">Timeout & progress</h3>
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" onclick={showTimed}>Timed (6s)</Button>
      <Button variant="outline" onclick={showPersistent}>Persistent</Button>
    </div>
  </div>
</div>
