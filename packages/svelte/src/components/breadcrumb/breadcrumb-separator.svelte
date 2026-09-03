<script lang="ts">
  import type { HTMLLiAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'

  type Props = HTMLLiAttributes & { children?: Snippet }

  let { class: className, children, ...rest }: Props = $props()
</script>

<li
  role="presentation"
  aria-hidden="true"
  data-slot="breadcrumb-separator"
  class={cn("flex min-w-3.5 items-center justify-center text-center [&_svg:not([class*='size-'])]:size-3.5", className)}
  {...rest}
>
  {#if children}
    {@render children()}
  {:else}
    <svg viewBox="0 0 14 14" fill="currentColor" aria-hidden="true" class="rtl:rotate-180">
      <path
        d="M4.808 3.058c.244-.244.641-.244.885 0l3.5 3.5c.244.244.244.641 0 .885l-3.5 3.5c-.244.244-.641.244-.885 0s-.244-.641 0-.885L7.865 7 4.808 3.942c-.244.244-.244-.641 0-.885z"
      />
    </svg>
  {/if}
</li>
