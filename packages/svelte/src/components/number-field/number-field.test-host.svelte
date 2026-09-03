<script lang="ts">
  import Field from '../field/field.svelte'
  import FieldLabel from '../field/field-label.svelte'
  import NumberField from './number-field.svelte'

  let {
    defaultValue = 1,
    min,
    max,
    invalid = false,
    disabled = false,
    size,
    variant,
    id = 'qty',
    label = 'Qty',
  }: {
    defaultValue?: number | null
    min?: number
    max?: number
    invalid?: boolean
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg'
    variant?: 'outline' | 'soft'
    id?: string
    label?: string
  } = $props()
</script>

{#if invalid}
  <Field {invalid}>
    <FieldLabel for={id}>{label}</FieldLabel>
    <NumberField {id} {defaultValue} {min} {max} {disabled} {size} {variant} />
  </Field>
{:else}
  <label for={id}>{label}</label>
  <NumberField {id} {defaultValue} {min} {max} {disabled} {size} {variant} />
{/if}
