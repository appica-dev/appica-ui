<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getOTPFieldContext } from './otp-field-context'

  const SEPARATOR_SIZE = {
    sm: 'w-3 [&_svg]:size-3',
    md: 'w-4 [&_svg]:size-3.5',
    lg: 'w-5 [&_svg]:size-4.5',
  } as const

  type Props = HTMLAttributes<HTMLDivElement> & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()

  const ctx = getOTPFieldContext()
</script>

<div
  data-slot="otp-field-separator"
  class={cn('text-border-strong flex items-center justify-center', SEPARATOR_SIZE[ctx.size], className)}
  {...rest}
>
  {#if children}
    {@render children()}
  {:else}
    <svg aria-hidden="true" viewBox="0 0 20 4" fill="none">
      <path d="M2 2H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  {/if}
</div>
