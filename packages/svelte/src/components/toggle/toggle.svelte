<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { Toggle as BitsToggle, ToggleGroup as BitsToggleGroup } from 'bits-ui'
  import { asBitsAttrs, cn, commitBindableChange } from '../../internal/utils'
  import { getToggleGroupContext } from '../toggle-group/toggle-group-context'

  type Props = HTMLButtonAttributes & {
    /** Controlled pressed state. Pair with `onPressedChange` or `bind:pressed`. */
    pressed?: boolean
    /**
     * Uncontrolled initial pressed state.
     * @default false
     */
    defaultPressed?: boolean
    /** Fires when the pressed state is committed. */
    onPressedChange?: (pressed: boolean) => void
    /** Identity of this toggle inside a `ToggleGroup`. Required in a group. */
    value?: string
    children?: Snippet
  }

  let {
    class: className,
    pressed = $bindable(),
    defaultPressed = false,
    onPressedChange,
    value,
    disabled,
    children,
    ...rest
  }: Props = $props()

  const inGroup = getToggleGroupContext()
  let inner = $state(false)
  inner = untrack(() => pressed ?? defaultPressed)
  const classes = $derived(cn(className))

  $effect(() => {
    if (pressed !== undefined) inner = pressed
  })

  function handlePressedChange(next: boolean) {
    commitBindableChange({
      next,
      bound: pressed,
      setBound: (value) => {
        pressed = value
      },
      setInner: (value) => {
        inner = value
      },
      onChange: onPressedChange,
    })
  }
</script>

{#if inGroup}
  <BitsToggleGroup.Item value={value ?? ''} {disabled} data-slot="toggle" class={classes} {...asBitsAttrs(rest)}>
    {#snippet child({ props, pressed: itemPressed })}
      <button
        {...props}
        role={undefined}
        aria-checked={undefined}
        aria-pressed={itemPressed}
        data-slot="toggle"
        data-pressed={itemPressed ? '' : undefined}
      >
        {@render children?.()}
      </button>
    {/snippet}
  </BitsToggleGroup.Item>
{:else}
  <BitsToggle.Root
    bind:pressed={inner}
    onPressedChange={handlePressedChange}
    {disabled}
    data-slot="toggle"
    data-pressed={inner ? '' : undefined}
    class={classes}
    {...asBitsAttrs(rest)}
  >
    {@render children?.()}
  </BitsToggle.Root>
{/if}
