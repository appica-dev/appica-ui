<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getAvatarContext } from './avatar-context'

  type Props = HTMLAttributes<HTMLSpanElement> & { children?: Snippet }
  let { class: className, children, ...rest }: Props = $props()

  const avatar = getAvatarContext()
  const show = $derived(!avatar || avatar.status !== 'loaded')
</script>

{#if show}
  <span
    data-slot="avatar-fallback"
    class={cn(
      'flex size-full items-center justify-center rounded-[inherit] text-[0.4em] leading-none uppercase has-[svg]:text-[1em]',
      className,
    )}
    {...rest}
  >
    {@render children?.()}
  </span>
{/if}
