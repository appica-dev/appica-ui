<script lang="ts">
  import ToastViewport from './toast-viewport.svelte'
  import Toast from './toast.svelte'
  import ToastTitle from './toast-title.svelte'
  import ToastDescription from './toast-description.svelte'
  import ToastActions from './toast-actions.svelte'
  import ToastAction from './toast-action.svelte'
  import ToastClose from './toast-close.svelte'
  import { useToastManager } from './toast-manager.svelte'

  let {
    extraClass = false,
  }: {
    extraClass?: boolean
  } = $props()

  const manager = useToastManager()
</script>

<ToastViewport position="top-left" class={extraClass ? 'vp-extra' : undefined}>
  {#each manager.toasts as toast (toast.id)}
    <Toast {toast} dismissible={false} class={extraClass ? 'root-extra' : undefined}>
      <ToastTitle class={extraClass ? 'title-extra' : undefined}>{toast.title}</ToastTitle>
      {#if toast.description}
        <ToastDescription class={extraClass ? 'desc-extra' : undefined}>{toast.description}</ToastDescription>
      {/if}
      {#if !extraClass}
        <ToastActions>
          <ToastAction variant="soft">Cancel</ToastAction>
          <ToastAction variant="primary">Save</ToastAction>
        </ToastActions>
        <ToastClose closeLabel="Close" />
      {/if}
    </Toast>
  {/each}
</ToastViewport>
