<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import { RadioGroup as BitsRadioGroup } from 'bits-ui'
  import { useReducedMotion } from '../../hooks/use-reduced-motion/use-reduced-motion'
  import { asBitsAttrs, cn, invalidDataAttr } from '../../internal/utils'
  import { getFieldContext, mergeFieldControl } from '../field/field-context'

  const SQUISH_MS = 300
  const SQUISH_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)'

  type Props = HTMLButtonAttributes & {
    /** Value of this option. Must be unique within the parent `RadioGroup`. */
    value: string
  }

  let {
    class: className,
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
      disabled,
      ariaInvalid,
      ariaDescribedby,
      omitId: true,
    }),
  )

  const reducedMotion = useReducedMotion()
  let rootEl: HTMLElement | null = $state(null)
  let prevChecked: boolean | null = null

  $effect(() => {
    const el = rootEl
    if (!el) return
    const apply = () => squish(el.getAttribute('data-state') === 'checked')
    const observer = new MutationObserver(apply)
    observer.observe(el, { attributes: true, attributeFilter: ['data-state'] })
    apply()
    return () => observer.disconnect()
  })

  const classes = $derived(
    cn(
      'flex size-[1em] min-h-4 min-w-4 shrink-0 cursor-default items-center justify-center',
      'bg-background border-border-strong outline-ring-input rounded-full border outline-offset-1',
      'transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none',
      'hover:data-[state=unchecked]:not-data-disabled:not-data-invalid:border-border-emphasis',
      'data-[state=checked]:bg-primary data-[state=checked]:outline-ring-primary data-[state=checked]:border-transparent',
      'data-disabled:data-[state=unchecked]:bg-background-subtle data-disabled:data-[state=checked]:opacity-disabled data-disabled:cursor-not-allowed data-disabled:data-[state=unchecked]:border-dashed',
      'data-invalid:border-error data-invalid:data-[state=unchecked]:bg-error-subtle data-invalid:outline-ring-error',
      className,
    ),
  )

  function squish(isChecked: boolean) {
    const el = rootEl
    const reduced = reducedMotion.current
    if (prevChecked === null) {
      prevChecked = isChecked
      return
    }
    const toggled = prevChecked !== isChecked
    prevChecked = isChecked
    if (toggled && !reduced && el) {
      el.animate([{ scale: '1' }, { scale: '0.8' }, { scale: '1.1' }, { scale: '1' }], {
        duration: SQUISH_MS,
        easing: SQUISH_EASING,
      })
    }
  }
</script>

<BitsRadioGroup.Item
  bind:ref={rootEl}
  data-slot="radio"
  class={classes}
  {value}
  disabled={control.disabled}
  id={control.id}
  aria-invalid={control.ariaInvalid}
  aria-describedby={control.describedby}
  {...asBitsAttrs(rest)}
  {...invalidDataAttr(control.ariaInvalid)}
>
  {#snippet children({ checked })}
    {@const reduced = reducedMotion.current}
    <span data-slot="radio-indicator" class="flex items-center justify-center">
      <span
        class="bg-primary-foreground size-[0.5em] min-h-2 min-w-2 rounded-full"
        style:transform={checked ? 'scale(1)' : 'scale(0)'}
        style:transition={reduced ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'}
      ></span>
    </span>
  {/snippet}
</BitsRadioGroup.Item>
