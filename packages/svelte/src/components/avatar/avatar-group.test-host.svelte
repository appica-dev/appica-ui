<script lang="ts">
  import Avatar from './avatar.svelte'
  import AvatarFallback from './avatar-fallback.svelte'
  import AvatarGroup from './avatar-group.svelte'
  import AvatarImage from './avatar-image.svelte'
  import type { AvatarPresetSize, AvatarShape } from './avatar-variants'

  let {
    size,
    shape,
    orientation,
    class: className,
    overrideSize,
    overrideShape,
    passthrough = false,
    withImage = false,
  }: {
    size?: AvatarPresetSize | number
    shape?: AvatarShape
    orientation?: 'horizontal' | 'vertical'
    class?: string
    overrideSize?: AvatarPresetSize | number
    overrideShape?: AvatarShape
    passthrough?: boolean
    withImage?: boolean
  } = $props()
</script>

<AvatarGroup {size} {shape} {orientation} class={className}>
  {#if passthrough}
    <div data-testid="passthrough">extra</div>
  {/if}
  <Avatar size={overrideSize} shape={overrideShape} data-testid="overridden">
    {#if withImage}
      <AvatarImage src="https://example.com/jane.jpg" alt="Jane Doe" />
    {/if}
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
  <Avatar data-testid="inherits">
    <AvatarFallback>AB</AvatarFallback>
  </Avatar>
</AvatarGroup>
