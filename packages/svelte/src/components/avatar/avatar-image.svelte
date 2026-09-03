<script lang="ts">
  import type { HTMLImgAttributes } from 'svelte/elements'
  import { untrack } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getAvatarContext, type AvatarStatus } from './avatar-context'

  const UNSET = Symbol('avatar-src')

  type Props = HTMLImgAttributes & {
    src?: string
    alt?: string
    /**
     * Fires as the image moves through its loading lifecycle.
     */
    onLoadingStatusChange?: (status: AvatarStatus) => void
  }

  let {
    class: className,
    src,
    alt = '',
    onload,
    onerror,
    onLoadingStatusChange,
    ...rest
  }: Props = $props()

  const avatar = getAvatarContext()

  let seenSrc: string | undefined | typeof UNSET = UNSET

  // Reset when `src` changes. Loaded/error come from img events, so this cannot be $derived.
  $effect.pre(() => {
    const current = src
    if (current === seenSrc) return
    seenSrc = current
    const next: AvatarStatus = current ? 'loading' : 'idle'
    untrack(() => {
      avatar?.setStatus(next)
      onLoadingStatusChange?.(next)
    })
  })

  function handleLoad(event: Event) {
    avatar?.setStatus('loaded')
    onLoadingStatusChange?.('loaded')
    onload?.(event as Event & { currentTarget: EventTarget & HTMLImageElement })
  }

  function handleError(event: Event) {
    avatar?.setStatus('error')
    onLoadingStatusChange?.('error')
    onerror?.(event as Event & { currentTarget: EventTarget & HTMLImageElement })
  }
</script>

{#if src && avatar?.status !== 'error'}
  {#key src}
    <img
      data-slot="avatar-image"
      {src}
      {alt}
      class={cn('size-full rounded-[inherit] object-cover', className)}
      {...rest}
      onload={handleLoad}
      onerror={handleError}
    />
  {/key}
{/if}
