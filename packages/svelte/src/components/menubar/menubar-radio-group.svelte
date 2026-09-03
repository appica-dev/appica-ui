<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { untrack } from 'svelte'
  import { Menubar as BitsMenubar } from 'bits-ui'
  import { asBitsAttrs, commitBindableChange } from '../../internal/utils'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Controlled selected radio value. Pair with `onValueChange` or `bind:value`. */
    value?: string
    /** Fires when the selected radio changes. */
    onValueChange?: (value: string) => void
    children?: Snippet
  }

  let { value = $bindable(), onValueChange, children, ...rest }: Props = $props()

  let inner = $state('')
  inner = untrack(() => value ?? '')

  $effect(() => {
    if (value !== undefined) inner = value
  })

  function handleValueChange(next: string) {
    commitBindableChange({
      next,
      bound: value,
      setBound: (nextValue) => {
        value = nextValue
      },
      setInner: (nextValue) => {
        inner = nextValue
      },
      onChange: onValueChange,
    })
  }
</script>

<BitsMenubar.RadioGroup
  data-slot="menubar-radio-group"
  bind:value={inner}
  onValueChange={handleValueChange}
  {...asBitsAttrs(rest)}
>
  {@render children?.()}
</BitsMenubar.RadioGroup>
