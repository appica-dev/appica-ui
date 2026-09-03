<script lang="ts">
  import Form from './form.svelte'
  import type { FormErrors } from './form-context'

  let {
    ariaLabel = 'signup',
    errors,
    onsubmit,
  }: {
    ariaLabel?: string
    errors?: FormErrors
    onsubmit?: (event: SubmitEvent) => void
  } = $props()
</script>

<Form aria-label={ariaLabel} {errors} {onsubmit}>
  <label>
    Email
    <input type="email" name="email" value="" />
  </label>
  <button type="submit">Submit</button>
</Form>
