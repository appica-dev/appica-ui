<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getAvatarGroupContext, setAvatarContext, type AvatarStatus } from './avatar-context'
  import { avatarVariants, type AvatarPresetSize, type AvatarShape } from './avatar-variants'

  type Props = HTMLAttributes<HTMLSpanElement> & {
    /**
     * Full circle or rounded square.
     * @default 'circle'
     */
    shape?: AvatarShape
    /**
     * A preset scale, or a pixel number for an exact size.
     * @default 'md'
     */
    size?: AvatarPresetSize | number
    children?: Snippet
  }

  let { class: className, style, size, shape, children, ...rest }: Props = $props()

  const group = getAvatarGroupContext()
  const resolvedSize = $derived(size ?? group?.size ?? 'md')
  const resolvedShape = $derived(shape ?? group?.shape ?? 'circle')
  const isNumeric = $derived(typeof resolvedSize === 'number')

  let status = $state<AvatarStatus>('idle')

  setAvatarContext({
    get status() {
      return status
    },
    setStatus(next) {
      status = next
    },
    get size() {
      return resolvedSize
    },
    get shape() {
      return resolvedShape
    },
  })

  const variantClass = $derived(
    avatarVariants({
      shape: resolvedShape,
      size: isNumeric ? undefined : (resolvedSize as AvatarPresetSize),
    }),
  )
  const numericStyle = $derived(isNumeric ? `font-size: ${resolvedSize}px;` : '')
</script>

<span
  data-slot="avatar"
  class={cn(variantClass, className)}
  style="{numericStyle}{style ?? ''}"
  {...rest}
>
  {@render children?.()}
</span>
