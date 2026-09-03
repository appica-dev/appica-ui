<script lang="ts">
  import { Button, Fieldset, FieldsetLegend, Form, Input } from '@appica/ui-svelte'

  let submitted = $state(false)

  function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    submitted = true
  }
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Form</h2>
  <Form class="max-w-sm" {onsubmit}>
    <Fieldset>
      <FieldsetLegend>Account</FieldsetLegend>
      <Input type="email" name="email" placeholder="Email" />
      <Input type="password" name="password" placeholder="Password" />
      <Button type="submit">Submit</Button>
    </Fieldset>
  </Form>
  {#if submitted}
    <p class="text-foreground-muted text-sm">Submitted</p>
  {/if}
</section>
