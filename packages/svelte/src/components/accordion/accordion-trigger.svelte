<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Accordion as BitsAccordion } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import {
    getAccordionContext,
    getAccordionItemContext,
    type AccordionIcon,
    type AccordionIconPosition,
    type AccordionIconVariant,
  } from './accordion-context'
  import { iconBoxVariants, triggerVariants } from './accordion-variants'

  type Props = HTMLButtonAttributes & {
    /** Override the root's icon for this trigger. */
    icon?: AccordionIcon
    /** Override the root's icon style. */
    iconVariant?: AccordionIconVariant
    /** Override the root's icon position. */
    iconPosition?: AccordionIconPosition
    children?: Snippet
  }

  let { class: className, icon, iconVariant, iconPosition, children, ...rest }: Props = $props()

  const root = getAccordionContext()
  const item = getAccordionItemContext()
  const variant = $derived(item?.variant ?? root.variant)
  const resolvedIcon = $derived(icon ?? root.icon)
  const resolvedIconVariant = $derived(iconVariant ?? root.iconVariant)
  const resolvedIconPosition = $derived(iconPosition ?? root.iconPosition)

  const svgSize = $derived(
    resolvedIconVariant === 'icon-box'
      ? resolvedIcon === 'chevron'
        ? 'size-[56%]'
        : 'size-[50%]'
      : resolvedIcon === 'plus'
        ? 'size-[1em]'
        : 'size-[1.12em]',
  )

  const classes = $derived(cn(triggerVariants({ variant }), className))
</script>

<BitsAccordion.Header data-slot="accordion-header" class="flex">
  <BitsAccordion.Trigger data-slot="accordion-trigger" class={classes} {...asBitsAttrs(rest)}>
    {#if resolvedIcon !== false && resolvedIconPosition === 'start'}
      <span class="inline-flex h-lh items-center">
        {#if resolvedIconVariant === 'icon-box'}
          <span data-slot="accordion-trigger-icon-box" class={iconBoxVariants({ variant })}>
            {#if resolvedIcon === 'plus'}
              {@render plusIcon(svgSize)}
            {:else}
              {@render chevronIcon(svgSize)}
            {/if}
          </span>
        {:else if resolvedIcon === 'plus'}
          {@render plusIcon(svgSize)}
        {:else}
          {@render chevronIcon(svgSize)}
        {/if}
      </span>
    {/if}
    <span class="flex flex-1 items-start gap-3.5 text-start">
      {@render children?.()}
    </span>
    {#if resolvedIcon !== false && resolvedIconPosition === 'end'}
      <span class="inline-flex h-lh items-center">
        {#if resolvedIconVariant === 'icon-box'}
          <span data-slot="accordion-trigger-icon-box" class={iconBoxVariants({ variant })}>
            {#if resolvedIcon === 'plus'}
              {@render plusIcon(svgSize)}
            {:else}
              {@render chevronIcon(svgSize)}
            {/if}
          </span>
        {:else if resolvedIcon === 'plus'}
          {@render plusIcon(svgSize)}
        {:else}
          {@render chevronIcon(svgSize)}
        {/if}
      </span>
    {/if}
  </BitsAccordion.Trigger>
</BitsAccordion.Header>

{#snippet chevronIcon(sizeClass: string)}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    data-slot="accordion-icon"
    class={cn(
      'transition-transform duration-300 ease-out motion-reduce:transition-none',
      'group-data-[state=open]/accordion-item:rotate-180',
      sizeClass,
    )}
  >
    <path d="M14.47 6.97A.75.75 0 0 1 15.53 8.03l-5 5a.75.75 0 0 1-1.061 0l-5-5A.75.75 0 0 1 5.53 6.97l4.47 4.47 4.47-4.47z" />
  </svg>
{/snippet}

{#snippet plusIcon(sizeClass: string)}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    stroke-width="1.85"
    stroke-linecap="round"
    aria-hidden="true"
    data-slot="accordion-icon"
    class={cn(
      'transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
      'group-data-[state=open]/accordion-item:rotate-180',
      sizeClass,
    )}
  >
    <path d="M4.167 10 L15.833 10" />
    <path
      d="M10 4.167 L10 15.833"
      class="origin-center transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] group-data-[state=open]/accordion-item:rotate-90 motion-reduce:transition-none"
    />
  </svg>
{/snippet}
