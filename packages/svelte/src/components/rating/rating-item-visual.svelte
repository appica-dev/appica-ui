<script lang="ts">
  import { cn } from '../../internal/utils'
  import { clamp, clipFor, type RatingIconPair, type RatingVariant } from './rating-model'

  const DASHED = '[stroke-dasharray:2.5_2]'
  const iconLayerClasses = 'block size-(--rating-size) *:size-full'

  type Props = {
    index: number
    displayed: number
    hover: number | null
    pressedIndex: number | null
    reduced: boolean
    rtl: boolean
    vertical: boolean
    variant: RatingVariant
    disabled: boolean
    icon?: RatingIconPair
  }

  let {
    index,
    displayed,
    hover,
    pressedIndex,
    reduced,
    rtl,
    vertical,
    variant,
    disabled,
    icon,
  }: Props = $props()

  const fill = $derived(clamp(displayed - index, 0, 1))
  const clip = $derived(clipFor(fill, rtl, vertical))
  const lifted = $derived(hover !== null && Math.ceil(hover) - 1 === index)
  const pressed = $derived(pressedIndex === index)
  const visualClass = $derived(
    cn(
      'relative block transition-transform duration-150 motion-reduce:transition-none',
      !reduced && pressed && 'scale-90',
      !reduced && !pressed && lifted && 'scale-[1.14]',
    ),
  )
</script>

<span class={visualClass}>
  <span class="relative block">
    <span
      data-slot="rating-item-base"
      class={cn(
        iconLayerClasses,
        'relative',
        variant === 'filled' && (disabled ? 'text-background-muted' : 'text-border-strong'),
        variant === 'outline' && disabled && DASHED,
      )}
    >
      {#if variant === 'filled'}
        {#if icon}{@render icon.filled()}{:else}
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="m8.33 7.439-6.242.903-.11.023a.98.98 0 0 0-.692 1.206 1 1 0 0 0 .26.438l4.524 4.393-1.067 6.206-.013.107a.975.975 0 0 0 .934 1.034 1 1 0 0 0 .499-.112l5.583-2.93 5.57 2.93.099.045a.98.98 0 0 0 1.275-.566 1 1 0 0 0 .048-.508l-1.068-6.206 4.525-4.394.076-.083a.975.975 0 0 0-.62-1.582L15.67 7.44l-2.79-5.644a.978.978 0 0 0-1.756 0z"
            />
          </svg>
        {/if}
      {:else if icon}
        {@render icon.empty()}
      {:else}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="M12.007 17.754 5.827 21l1.18-6.876L2 9.256l6.91-1L12 2l3.09 6.255 6.91 1-5.007 4.87L18.173 21z"
          />
        </svg>
      {/if}
    </span>
    {#if variant === 'filled' && disabled}
      <span aria-hidden="true" class={cn(iconLayerClasses, 'text-border-strong absolute inset-0', DASHED)}>
        {#if icon}
          {@render icon.empty()}
        {:else}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path
              d="M12.007 17.754 5.827 21l1.18-6.876L2 9.256l6.91-1L12 2l3.09 6.255 6.91 1-5.007 4.87L18.173 21z"
            />
          </svg>
        {/if}
      </span>
    {/if}
    <span data-slot="rating-item-fill" aria-hidden="true" class={cn(iconLayerClasses, 'absolute inset-0')} style={`clip-path: ${clip}`}>
      {#if icon}
        {@render icon.filled()}
      {:else}
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            d="m8.33 7.439-6.242.903-.11.023a.98.98 0 0 0-.692 1.206 1 1 0 0 0 .26.438l4.524 4.393-1.067 6.206-.013.107a.975.975 0 0 0 .934 1.034 1 1 0 0 0 .499-.112l5.583-2.93 5.57 2.93.099.045a.98.98 0 0 0 1.275-.566 1 1 0 0 0 .048-.508l-1.068-6.206 4.525-4.394.076-.083a.975.975 0 0 0-.62-1.582L15.67 7.44l-2.79-5.644a.978.978 0 0 0-1.756 0z"
          />
        </svg>
      {/if}
    </span>
  </span>
</span>
