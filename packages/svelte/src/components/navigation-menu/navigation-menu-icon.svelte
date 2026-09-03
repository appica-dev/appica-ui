<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { cn } from '../../internal/utils'
  import { getNavigationMenuContext, type NavigationMenuIconKind } from './navigation-menu-context'

  const ICON_SIZE = {
    sm: 'size-3.5',
    md: 'size-4',
    lg: 'size-4.5',
  } as const

  type Props = HTMLAttributes<HTMLSpanElement> & {
    /**
     * Override the indicator for this trigger.
     * @default root
     */
    icon?: NavigationMenuIconKind
  }

  let { icon, class: className, ...rest }: Props = $props()

  const ctx = getNavigationMenuContext()
  const resolved = $derived(icon === undefined ? ctx.icon : icon)
  const sizeClass = $derived(ICON_SIZE[ctx.size])
  const vertical = $derived(ctx.orientation === 'vertical')
</script>

{#if resolved !== false}
  <span
    data-slot="navigation-menu-icon"
    data-icon="end"
    class={cn(
      'group/navigation-menu-icon -ms-0.5 inline-flex shrink-0',
      (resolved === 'chevron' || resolved === 'caret') &&
        (vertical
          ? '-rotate-90 rtl:rotate-90'
          : 'transition-transform duration-300 ease-out in-data-[state=open]:rotate-180 in-data-popup-open:rotate-180 motion-reduce:transition-none'),
      className,
    )}
    {...rest}
  >
    {#if resolved === 'chevron'}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class={sizeClass}>
        <path
          d="M11.558 5.558c.244-.244.641-.244.885 0s.244.641 0 .885l-4 4c-.244.244-.641.244-.885 0l-4-4c-.244-.244-.244-.641 0-.885s.641-.244.885 0L8 9.115l3.558-3.558z"
        />
      </svg>
    {:else if resolved === 'caret'}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class={sizeClass}>
        <path
          d="M17.141 9.5c.73 0 1.112.863.671 1.42l-.065.074-5.143 5.25a.85.85 0 0 1-.552.255c-.208.013-.414-.051-.579-.182l-.081-.073-5.143-5.25-.071-.082-.046-.067-.046-.084-.015-.031-.023-.059-.027-.095-.009-.046-.009-.053-.003-.05v-.103l.004-.051.008-.053.009-.046.027-.095.023-.059.06-.115.056-.079.063-.071.081-.073.066-.047.082-.047.031-.015.057-.024.093-.028.045-.009.051-.009.049-.004L17.141 9.5z"
        />
      </svg>
    {:else if resolved === 'plus'}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        class={cn(
          sizeClass,
          'transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
          'in-data-[state=open]:rotate-180 in-data-popup-open:rotate-180',
          'group-data-popup-open/navigation-menu-icon:rotate-180',
        )}
      >
        <rect x="3.333" y="7.375" width="9.334" height="1.25" rx="0.625" />
        <rect
          x="7.375"
          y="3.333"
          width="1.25"
          height="9.334"
          rx="0.625"
          class={cn(
            'origin-center transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none',
            'in-data-[state=open]:rotate-90 in-data-popup-open:rotate-90',
            'group-data-popup-open/navigation-menu-icon:rotate-90',
          )}
        />
      </svg>
    {/if}
  </span>
{/if}
