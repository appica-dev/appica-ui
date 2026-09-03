<script lang="ts">
  import Form from '../form/form.svelte'
  import Input from '../input/input.svelte'
  import type { FormErrors } from '../form/form-context'
  import Field from './field.svelte'
  import FieldLabel from './field-label.svelte'
  import FieldError from './field-error.svelte'

  let errors: FormErrors = $state({ email: 'Email is required' })
</script>

<Form {errors} onClearErrors={(next) => (errors = next)}>
  <Field name="email">
    <FieldLabel>Email</FieldLabel>
    <Input />
    <FieldError />
  </Field>
</Form>
