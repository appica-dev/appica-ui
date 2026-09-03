<script lang="ts">
  import Field from '../field/field.svelte'
  import FieldLabel from '../field/field-label.svelte'
  import OTPField from './otp-field.svelte'
  import OTPFieldInput from './otp-field-input.svelte'
  import OTPFieldSeparator from './otp-field-separator.svelte'

  const LENGTH = 4

  let {
    length = LENGTH,
    disabled = false,
    invalid = false,
    size,
    variant,
    defaultValue,
  }: {
    length?: number
    disabled?: boolean
    invalid?: boolean
    size?: 'sm' | 'md' | 'lg'
    variant?: 'outline' | 'soft'
    defaultValue?: string
  } = $props()
</script>

{#if invalid}
  <Field {invalid}>
    <FieldLabel>Code</FieldLabel>
    <OTPField {length} {disabled} {size} {variant} {defaultValue} aria-label="Verification code">
      {#snippet children({ cells })}
        {#each cells as cell, index (index)}
          {#if index === 2}
            <OTPFieldSeparator />
          {/if}
          <OTPFieldInput {cell} />
        {/each}
      {/snippet}
    </OTPField>
  </Field>
{:else}
  <OTPField {length} {disabled} {size} {variant} {defaultValue} aria-label="Verification code">
    {#snippet children({ cells })}
      {#each cells as cell, index (index)}
        {#if index === 2}
          <OTPFieldSeparator />
        {/if}
        <OTPFieldInput {cell} />
      {/each}
    {/snippet}
  </OTPField>
{/if}
