<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import {
    thumbnailVariants,
    type ThumbnailPresetSize,
    type ThumbnailShape,
    type ThumbnailVariant,
  } from './thumbnail-variants'

  type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
    /**
     * Image tile, or a colored icon tile.
     * @default 'image'
     */
    variant?: ThumbnailVariant
    /**
     * Rounded square or full circle.
     * @default 'rounded'
     */
    shape?: ThumbnailShape
    /**
     * A preset scale, or a pixel number for an exact size.
     * @default 'md'
     */
    size?: ThumbnailPresetSize | number
    /** Image URL (image variant). */
    src?: string
    /**
     * Alternative text describing the image. Defaults to `""` (decorative) when omitted.
     * @default ''
     */
    alt?: string
    children?: Snippet
  }

  let {
    class: className,
    style,
    variant = 'image',
    shape = 'rounded',
    size = 'md',
    src,
    alt = '',
    children,
    ...rest
  }: Props = $props()

  const isNumeric = $derived(typeof size === 'number')
  const variantClass = $derived(
    thumbnailVariants({
      variant,
      shape,
      size: isNumeric ? undefined : (size as ThumbnailPresetSize),
    }),
  )
  const numericStyle = $derived(isNumeric ? `font-size: ${size}px;` : '')

  let status = $state<'loading' | 'loaded' | 'error'>('loading')

  function handleLoad() {
    status = 'loaded'
  }

  function handleError() {
    status = 'error'
  }
</script>

<div data-slot="thumbnail" class={cn(variantClass, className)} style="{numericStyle}{style ?? ''}" {...rest}>
  {#if variant === 'image'}
    {#if src && status !== 'error'}
      <img
        data-slot="thumbnail-image"
        {src}
        {alt}
        class="size-full rounded-[inherit] object-cover"
        onload={handleLoad}
        onerror={handleError}
      />
    {/if}
    {#if !src || status !== 'loaded'}
      <span
        data-slot="thumbnail-fallback"
        class="text-foreground-subtle flex size-full items-center justify-center has-[svg]:text-[1em]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          data-slot="thumbnail-fallback-icon"
        >
          <path
            d="M2.47 2.47a.75.75 0 0 1 1.061 0l.703.703c.078.037.151.086.215.151.057.059.099.126.133.196l15.925 15.925c.057.032.113.069.162.117s.094.111.128.173l.734.734a.75.75 0 0 1-1.061 1.061l-.402-.402c-.194.128-.398.24-.613.33a3.74 3.74 0 0 1-1.454.291v.001H6A3.75 3.75 0 0 1 2.25 18V6c0-.765.23-1.476.622-2.068L2.47 3.53a.75.75 0 0 1 0-1.061zM20.25 17v-.689l-2.77-2.771c-.388-.374-.762-.485-1.079-.455a.75.75 0 0 1-.141-1.494c.727-.068 1.421.175 2.013.651l.248.218 1.73 1.729V6A2.25 2.25 0 0 0 18 3.75H7a.75.75 0 1 1 0-1.5h11A3.75 3.75 0 0 1 21.75 6v11a.75.75 0 1 1-1.5 0zm-5.24-9.75a.75.75 0 1 1 0 1.5H15a.75.75 0 1 1 0-1.5h.01zM3.75 18A2.25 2.25 0 0 0 6 20.25h12.001c.299 0 .596-.059.872-.175.033-.014.063-.032.095-.047L10.48 11.54c-.351-.338-.69-.46-.979-.46s-.628.122-.979.46L3.75 16.311V18zm0-3.81l3.729-3.729c.354-.34.753-.594 1.181-.739L3.971 5.031A2.24 2.24 0 0 0 3.75 6v8.19z"
          />
        </svg>
      </span>
    {/if}
  {:else}
    {@render children?.()}
  {/if}
</div>
