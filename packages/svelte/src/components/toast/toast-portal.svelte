<script lang="ts">
  import type { Snippet } from 'svelte'
  import { Portal } from 'bits-ui'
  import { asBitsAttrs } from '../../internal/utils'

  export type ToastPortalProps = {
    /**
     * Portal target.
     * @default document.body
     */
    to?: Element | string
    children?: Snippet
  }

  let { to, children, ...rest }: ToastPortalProps = $props()
</script>

<Portal {to} {...asBitsAttrs(rest)}>
  {@render children?.()}
</Portal>
