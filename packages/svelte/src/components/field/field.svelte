<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { getFormContext } from '../form/form-context'
  import { setFieldContext } from './field-context'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Mark the field as invalid. Also set when the parent Form has an error for `name`.
     * @default false
     */
    invalid?: boolean
    /**
     * Disable the label and descendant controls that read Field context.
     * @default false
     */
    disabled?: boolean
    /** Field name. Matches Form `errors` keys and is inherited by nested controls. */
    name?: string
    children?: Snippet
  }

  let { class: className, invalid = false, disabled = false, name, children, ...rest }: Props = $props()

  const uid = $props.id()
  const controlId = `field-${uid}-control`
  const labelId = `field-${uid}-label`
  const descriptionId = `field-${uid}-description`
  const errorId = `field-${uid}-error`

  const form = getFormContext()

  const formError = $derived.by(() => {
    if (!name || !form) return undefined
    const err = form.errors()[name]
    if (err == null || err === '') return undefined
    return Array.isArray(err) ? err[0] ?? undefined : err
  })

  const resolvedInvalid = $derived(invalid || Boolean(formError))

  function clearFormError() {
    if (!name || !form) return
    const onClear = form.onClearErrors()
    if (!onClear) return
    onClear({ ...form.errors(), [name]: null })
  }

  setFieldContext({
    invalid: () => resolvedInvalid,
    disabled: () => disabled,
    name: () => name,
    controlId,
    labelId,
    descriptionId,
    errorId,
    formError: () => formError,
    clearFormError,
  })
</script>

<div
  data-slot="field"
  data-invalid={resolvedInvalid ? '' : undefined}
  data-disabled={disabled ? '' : undefined}
  class={cn(className)}
  {...rest}
>
  {@render children?.()}
</div>
