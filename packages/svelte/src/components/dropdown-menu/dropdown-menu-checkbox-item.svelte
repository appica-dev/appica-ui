<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { DropdownMenu as BitsDropdownMenu } from 'bits-ui'
  import { asBitsAttrs, cn, commitBindableChange } from '../../internal/utils'
  import { navigationLinkVariants } from '../navigation/navigation-link-variants'
  import { getDropdownMenuContext } from './dropdown-menu-context'
  import { ITEM_BASE, ITEM_TEXT } from './dropdown-menu-variants'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Controlled checked state. Pair with `onCheckedChange` or `bind:checked`. */
    checked?: boolean
    /** Fires when the checked state changes. */
    onCheckedChange?: (checked: boolean) => void
    /** Value used inside a `DropdownMenuCheckboxGroup`. */
    value?: string
    disabled?: boolean
    children?: Snippet
  }

  let {
    class: className,
    checked = $bindable(),
    onCheckedChange,
    value,
    disabled,
    children: label,
    ...rest
  }: Props = $props()

  const ctx = getDropdownMenuContext()
  let inner = $state(false)
  inner = untrack(() => checked ?? false)

  $effect(() => {
    if (checked !== undefined) inner = checked
  })

  function handleCheckedChange(next: boolean) {
    commitBindableChange({
      next,
      bound: checked,
      setBound: (nextValue) => {
        checked = nextValue
      },
      setInner: (nextValue) => {
        inner = nextValue
      },
      onChange: onCheckedChange,
    })
  }

  const classes = $derived(
    cn(navigationLinkVariants({ variant: 'pill', size: ctx.size }), ITEM_BASE, 'justify-between', className),
  )
</script>

<BitsDropdownMenu.CheckboxItem
  data-slot="dropdown-menu-checkbox-item"
  bind:checked={inner}
  {value}
  {disabled}
  onCheckedChange={handleCheckedChange}
  class={classes}
  {...asBitsAttrs(rest)}
>
  {#snippet children({ checked: isChecked })}
    <span class={cn('flex items-center', ITEM_TEXT[ctx.size])}>{@render label?.()}</span>
    <span
      data-slot="dropdown-menu-checkbox-item-indicator"
      class="group/check text-foreground-intense shrink-0"
      data-checked={isChecked ? '' : undefined}
    >
      <svg
        data-icon="end"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        class="me-0.5 size-[1.125em] stroke-2"
      >
        <path
          d="M4.3 12.55 L9.25 17.5 L19.7 6.5"
          pathLength={1}
          stroke-dasharray="1 2"
          class={cn(
            'opacity-0 [stroke-dashoffset:1.02]',
            isChecked && 'opacity-100 [stroke-dashoffset:0]',
            'motion-safe:transition-[opacity,stroke-dashoffset] motion-safe:ease-out',
          )}
        />
      </svg>
    </span>
  {/snippet}
</BitsDropdownMenu.CheckboxItem>
