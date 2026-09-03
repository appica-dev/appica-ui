<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import { untrack } from 'svelte'
  import { Switch as BitsSwitch } from 'bits-ui'
  import { useReducedMotion } from '../../hooks/use-reduced-motion/use-reduced-motion'
  import { asBitsAttrs, cn, commitBindableChange, invalidDataAttr } from '../../internal/utils'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'
  import { switchSizes, type SwitchSize } from './switch-sizes'

  type Props = HTMLButtonAttributes & {
    /** Controlled checked state. Pair with `onCheckedChange` or `bind:checked`. */
    checked?: boolean
    /**
     * Uncontrolled initial checked state.
     * @default false
     */
    defaultChecked?: boolean
    /** Fires when the checked state is committed. */
    onCheckedChange?: (checked: boolean) => void
    /**
     * Scales the track and thumb together.
     * @default 'md'
     */
    size?: SwitchSize
    /** Field name submitted with a form, via a hidden input. */
    name?: string
    /** Value submitted with the form when checked. */
    value?: string
  }

  let {
    class: className,
    checked = $bindable(),
    defaultChecked = false,
    onCheckedChange,
    size = 'md',
    name,
    value,
    disabled,
    id,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedby,
    ...rest
  }: Props = $props()

  const field = getFieldContext()
  const control = $derived(
    mergeFieldControl({
      field,
      id,
      name,
      disabled,
      ariaInvalid,
      ariaDescribedby,
    }),
  )

  const reducedMotion = useReducedMotion()
  let inner = $state(false)
  inner = untrack(() => checked ?? defaultChecked)
  const sizeConfig = $derived(switchSizes[size])

  $effect(() => {
    if (checked !== undefined) inner = checked
  })

  function handleCheckedChange(next: boolean) {
    field?.clearFormError()
    commitBindableChange({
      next,
      bound: checked,
      setBound: (value) => {
        checked = value
      },
      setInner: (value) => {
        inner = value
      },
      onChange: onCheckedChange,
    })
  }

  const classes = $derived(
    cn(
      'bg-background-strong outline-ring flex shrink-0 rounded-full border border-transparent p-px outline-offset-1',
      sizeConfig.root,
      'transition-background duration-200 motion-reduce:transition-none',
      'data-[state=checked]:bg-primary data-[state=checked]:outline-ring-primary',
      'data-disabled:data-[state=unchecked]:border-border-strong data-disabled:opacity-disabled data-disabled:cursor-not-allowed data-disabled:data-[state=unchecked]:border-dashed',
      'data-invalid:border-error data-invalid:data-[state=unchecked]:bg-error-subtle data-invalid:outline-ring-error',
      className,
    ),
  )
</script>

<BitsSwitch.Root
  data-slot="switch"
  class={classes}
  bind:checked={inner}
  disabled={control.disabled}
  name={control.name}
  id={control.id}
  aria-invalid={control.ariaInvalid}
  aria-describedby={control.describedby}
  {value}
  onCheckedChange={handleCheckedChange}
  {...asBitsAttrs(rest)}
  {...invalidDataAttr(control.ariaInvalid)}
>
  {#snippet children({ checked: isChecked })}
    {@const reduced = reducedMotion.current}
    <BitsSwitch.Thumb
      data-slot="switch-thumb"
      class={cn(
        'group flex items-center justify-center rounded-full bg-white shadow-2xs',
        sizeConfig.thumb,
        'data-[state=checked]:bg-primary-foreground',
        'transition-transform duration-250 motion-reduce:transition-none',
        isChecked ? 'ms-auto' : '',
      )}
    >
      <svg
        class={cn('text-foreground-intense', sizeConfig.check)}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        style:stroke-dasharray="12"
        style:stroke-dashoffset={isChecked ? 0 : 12}
        style:transition={reduced
          ? 'none'
          : `stroke-dashoffset ${isChecked ? '0.3s' : '0s'} ease-out ${isChecked ? '0.25s' : '0s'}`}
      >
        <path d="M3 6l2 2 4-4" />
      </svg>
    </BitsSwitch.Thumb>
  {/snippet}
</BitsSwitch.Root>
