<script lang="ts">
  import { Fieldset, FieldsetLegend, Input } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Fieldset</h2>
  <Fieldset class="max-w-sm">
    <FieldsetLegend>Account</FieldsetLegend>
    <Input type="email" placeholder="Email" />
    <Input type="password" placeholder="Password" />
  </Fieldset>
</section>
