<script lang="ts">
  import { Field, FieldLabel, NumberField } from '@appica/ui-svelte'

  let qty = $state<number | null>(3)
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Number field</h2>

  <Field name="qty">
    <FieldLabel>Quantity</FieldLabel>
    <NumberField bind:value={qty} min={0} max={99} />
  </Field>

  <NumberField variant="soft" size="lg" defaultValue={12} />
</section>
