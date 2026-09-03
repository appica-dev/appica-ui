<script lang="ts">
  import type { Snippet } from 'svelte'
  import { requireFieldContext } from './field-context'

  export type FieldValidityState = {
    valid: boolean
    invalid: boolean
  }

  type Props = {
    children?: Snippet<[FieldValidityState]>
  }

  let { children }: Props = $props()

  const field = requireFieldContext()
  const state = $derived({
    valid: !field.invalid(),
    invalid: field.invalid(),
  } satisfies FieldValidityState)
</script>

{@render children?.(state)}
