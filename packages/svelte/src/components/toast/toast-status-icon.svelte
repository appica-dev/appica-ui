<script lang="ts">
  import Spinner from '../spinner/spinner.svelte'
  import { cn } from '../../internal/utils'
  import { isToastStatusIcon, type ToastStatusIcon } from './toast-manager.svelte'

  type Props = {
    kind: string
  }

  let { kind }: Props = $props()

  const status = $derived(isToastStatusIcon(kind) ? kind : null)
  const iconClass =
    'size-5 shrink-0 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]'

  function assertNever(value: never): never {
    throw new Error(`Unhandled toast status icon: ${String(value)}`)
  }

  function statusClass(value: Exclude<ToastStatusIcon, 'loading'>): string {
    switch (value) {
      case 'success':
        return 'text-success-emphasis'
      case 'error':
        return 'text-error-emphasis'
      case 'info':
        return 'text-info-emphasis'
      case 'warning':
        return 'text-warning-emphasis'
      default:
        return assertNever(value)
    }
  }
</script>

{#if status === 'loading'}
  <Spinner currentColor class="text-[1.25rem]" aria-label="Loading" />
{:else if status === 'success'}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    data-toast-status="success"
    class={cn(iconClass, statusClass(status))}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="m9 12 2 2 4-4"></path>
  </svg>
{:else if status === 'error'}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    data-toast-status="error"
    class={cn(iconClass, statusClass(status))}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="m15 9-6 6"></path>
    <path d="m9 9 6 6"></path>
  </svg>
{:else if status === 'info'}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    data-toast-status="info"
    class={cn(iconClass, statusClass(status))}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v-4"></path>
    <path d="M12 8h.01"></path>
  </svg>
{:else if status === 'warning'}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    data-toast-status="warning"
    class={cn(iconClass, statusClass(status))}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path>
    <path d="M12 9v4"></path>
    <path d="M12 17h.01"></path>
  </svg>
{:else if status === null}
  {kind}
{:else}
  {assertNever(status)}
{/if}
