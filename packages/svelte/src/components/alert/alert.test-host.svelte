<script lang="ts">
  import Alert from './alert.svelte'
  import AlertAction from './alert-action.svelte'
  import AlertDescription from './alert-description.svelte'
  import AlertIcon from './alert-icon.svelte'
  import AlertTitle from './alert-title.svelte'
  import type { AlertVariant } from './alert-variants'

  type Layout = 'block' | 'inline'

  let {
    variant,
    layout,
    dismissible = false,
    open,
    onOpenChange,
    persistKey,
    persistStorage,
    closeLabel,
    class: className,
    iconClass,
    titleClass,
    descClass,
    actionClass,
    title = 'System message',
    description = 'This is a short informational message.',
    showIcon = true,
    showAction = true,
    showDescription = true,
    actionLabel = 'Action',
  }: {
    variant?: AlertVariant
    layout?: Layout
    dismissible?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
    persistKey?: string
    persistStorage?: 'local' | 'session'
    closeLabel?: string
    class?: string
    iconClass?: string
    titleClass?: string
    descClass?: string
    actionClass?: string
    title?: string
    description?: string
    showIcon?: boolean
    showAction?: boolean
    showDescription?: boolean
    actionLabel?: string
  } = $props()
</script>

<Alert
  {variant}
  {layout}
  {dismissible}
  {open}
  {onOpenChange}
  {persistKey}
  {persistStorage}
  {closeLabel}
  class={className}
>
  {#if showIcon}
    <AlertIcon class={iconClass}><span data-testid="icon">i</span></AlertIcon>
  {/if}
  <AlertTitle class={titleClass}>{title}</AlertTitle>
  {#if showDescription}
    <AlertDescription class={descClass}>{description}</AlertDescription>
  {/if}
  {#if showAction}
    <AlertAction class={actionClass}>
      <button type="button">{actionLabel}</button>
    </AlertAction>
  {/if}
</Alert>
