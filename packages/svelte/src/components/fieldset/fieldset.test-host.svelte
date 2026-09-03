<script lang="ts">
  import Fieldset from './fieldset.svelte'
  import FieldsetLegend from './fieldset-legend.svelte'

  let {
    disabled = false,
    class: className,
    legendClass,
    legend = 'Account',
  }: {
    disabled?: boolean
    class?: string
    legendClass?: string
    legend?: string
  } = $props()
</script>

<Fieldset {disabled} class={className}>
  <FieldsetLegend class={legendClass}>{legend}</FieldsetLegend>
  <label>
    Email
    <input type="email" value="" />
  </label>
</Fieldset>
