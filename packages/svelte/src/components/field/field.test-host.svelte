<script lang="ts">
  import Input from '../input/input.svelte'
  import Field from './field.svelte'
  import FieldLabel from './field-label.svelte'
  import FieldDescription from './field-description.svelte'
  import FieldError from './field-error.svelte'
  import FieldValidity from './field-validity.svelte'

  let {
    invalid,
    disabled,
    name,
    description,
    error,
    showValidity,
  }: {
    invalid?: boolean
    disabled?: boolean
    name?: string
    description?: boolean
    error?: string
    showValidity?: boolean
  } = $props()
</script>

<Field {invalid} {disabled} {name}>
  <FieldLabel>Email</FieldLabel>
  <Input type="email" />
  {#if description}
    <FieldDescription>We never share your email.</FieldDescription>
  {/if}
  {#if error}
    <FieldError>{error}</FieldError>
  {/if}
  {#if showValidity}
    <FieldValidity>
      {#snippet children({ valid })}
        <span data-testid="valid">{String(valid)}</span>
      {/snippet}
    </FieldValidity>
  {/if}
</Field>
