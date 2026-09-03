<script lang="ts">
  import type { HTMLFormAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import { setFormContext, type FormErrors } from './form-context'

  type Props = HTMLFormAttributes & {
    /**
     * Server-side errors keyed by field name. Consumed by Field in Wave 2.
     * @default {}
     */
    errors?: FormErrors
    /** Called when field errors should be cleared. Consumed by Field in Wave 2. */
    onClearErrors?: (errors: FormErrors) => void
    children?: Snippet
  }

  let { class: className, errors = {}, onClearErrors, children, ...rest }: Props = $props()

  setFormContext({
    errors: () => errors,
    onClearErrors: () => onClearErrors,
  })
</script>

<form data-slot="form" class={cn(className)} {...rest}>
  {@render children?.()}
</form>
