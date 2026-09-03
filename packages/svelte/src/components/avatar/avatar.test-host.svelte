<script lang="ts">
  import type { HTMLImgAttributes } from 'svelte/elements'
  import Avatar from './avatar.svelte'
  import AvatarBadge from './avatar-badge.svelte'
  import AvatarFallback from './avatar-fallback.svelte'
  import AvatarImage from './avatar-image.svelte'
  import type { AvatarStatus } from './avatar-context'
  import type { AvatarPresetSize, AvatarShape } from './avatar-variants'

  let {
    size,
    shape,
    class: className,
    style,
    fallback = 'JD',
    src,
    alt = '',
    showBadge = false,
    animateBadge = false,
    badgeClass,
    testId,
    onload,
    onerror,
    onLoadingStatusChange,
  }: {
    size?: AvatarPresetSize | number
    shape?: AvatarShape
    class?: string
    style?: string
    fallback?: string
    src?: string
    alt?: string
    showBadge?: boolean
    animateBadge?: boolean
    badgeClass?: string
    testId?: string
    onload?: HTMLImgAttributes['onload']
    onerror?: HTMLImgAttributes['onerror']
    onLoadingStatusChange?: (status: AvatarStatus) => void
  } = $props()
</script>

<Avatar {size} {shape} class={className} {style} data-testid={testId}>
  <AvatarImage {src} {alt} {onload} {onerror} {onLoadingStatusChange} />
  <AvatarFallback>{fallback}</AvatarFallback>
  {#if showBadge}
    <AvatarBadge animate={animateBadge} class={badgeClass} />
  {/if}
</Avatar>
