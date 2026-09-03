<script lang="ts">
  import { Field, FieldLabel, OTPField, OTPFieldInput, OTPFieldSeparator } from '@appica/ui-svelte'

  let code = $state('')
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">OTP field</h2>

  <Field name="code">
    <FieldLabel>Verification code</FieldLabel>
    <OTPField bind:value={code} length={6} aria-label="Verification code">
      {#snippet children({ cells })}
        {#each cells as cell, index (index)}
          {#if index === 3}
            <OTPFieldSeparator />
          {/if}
          <OTPFieldInput {cell} />
        {/each}
      {/snippet}
    </OTPField>
  </Field>

  <p class="text-foreground-subtle text-sm">Value: {code || '(empty)'}</p>
</section>
