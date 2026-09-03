<script lang="ts">
  import ToastProvider from './toast-provider.svelte'
  import ToastTrigger from './toast.test-trigger.svelte'
  import ToastList from './toast.test-list.svelte'

  let {
    extraClass = false,
  }: {
    extraClass?: boolean
  } = $props()
</script>

<ToastProvider>
  <ToastTrigger title="Manual" description="D" timeout={0} />
  <ToastList {extraClass} />
</ToastProvider>
