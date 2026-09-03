<script lang="ts">
  import type { TimeValue } from 'bits-ui'
  import Field from '../field/field.svelte'
  import FieldLabel from '../field/field-label.svelte'
  import TimeField from './time-field.svelte'
  import type { TimeFieldGranularity, TimeFieldSize, TimeFieldVariant } from './time-field.svelte'

  let {
    defaultValue,
    value,
    name,
    disabled = false,
    invalid = false,
    hourCycle,
    granularity,
    size,
    variant,
    label = 'Time',
  }: {
    defaultValue?: TimeValue
    value?: TimeValue
    name?: string
    disabled?: boolean
    invalid?: boolean
    hourCycle?: 12 | 24
    granularity?: TimeFieldGranularity
    size?: TimeFieldSize
    variant?: TimeFieldVariant
    label?: string
  } = $props()
</script>

{#if invalid}
  <Field {invalid} {name}>
    <FieldLabel>{label}</FieldLabel>
    <TimeField {defaultValue} {value} {name} {disabled} {hourCycle} {granularity} {size} {variant} />
  </Field>
{:else}
  <TimeField
    {defaultValue}
    {value}
    {name}
    {disabled}
    {hourCycle}
    {granularity}
    {size}
    {variant}
    aria-label={label}
  />
{/if}
