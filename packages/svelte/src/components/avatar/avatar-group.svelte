<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { setAvatarGroupContext } from './avatar-context'
  import type { AvatarPresetSize, AvatarShape } from './avatar-variants'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Full circle or rounded square. Applied to child avatars that omit their own.
     */
    shape?: AvatarShape
    /**
     * A preset scale, or a pixel number for an exact size. Applied to child avatars that omit their own.
     */
    size?: AvatarPresetSize | number
    /**
     * Stack the avatars in a row or a column.
     * @default 'horizontal'
     */
    orientation?: 'horizontal' | 'vertical'
    children?: Snippet
  }

  let { class: className, size, shape, orientation = 'horizontal', children, ...rest }: Props = $props()

  setAvatarGroupContext({
    get size() {
      return size
    },
    get shape() {
      return shape
    },
  })

  const horizontal = $derived(orientation === 'horizontal')
</script>

<div
  data-slot="avatar-group"
  class={cn(
    'isolate flex',
    horizontal ? 'space-x-[-0.2em]' : 'flex-col space-y-[-0.2em]',
    '*:data-[slot=avatar]:ring-background *:data-[slot=avatar]:ring-[calc(1em/12)]',
    className,
  )}
  {...rest}
>
  {@render children?.()}
</div>
