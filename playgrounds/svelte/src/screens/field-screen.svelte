<script lang="ts">
  import {
    Button,
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
    Form,
    Input,
    type FormErrors,
  } from '@appica/ui-svelte'

  let errors: FormErrors = $state({ email: 'Email is required' })
  let invalidDemo = $state(true)
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Field</h2>

  <Field class="max-w-sm">
    <FieldLabel>Name</FieldLabel>
    <Input placeholder="Ada Lovelace" />
    <FieldDescription>Shown under the control via aria-describedby.</FieldDescription>
  </Field>

  <Field class="max-w-sm" invalid={invalidDemo}>
    <FieldLabel>Username</FieldLabel>
    <Input placeholder="ada" />
    <FieldError>Pick something unique.</FieldError>
    <Button variant="outline" size="sm" class="mt-2" onclick={() => (invalidDemo = !invalidDemo)}>
      Toggle invalid
    </Button>
  </Field>

  <Form class="max-w-sm" {errors} onClearErrors={(next) => (errors = next)}>
    <Field name="email">
      <FieldLabel>Email (Form errors)</FieldLabel>
      <Input type="email" placeholder="ada@example.com" />
      <FieldError />
    </Field>
  </Form>
</section>
