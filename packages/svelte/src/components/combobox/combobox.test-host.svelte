<script lang="ts">
  import { untrack } from 'svelte'
  import Field from '../field/field.svelte'
  import FieldLabel from '../field/field-label.svelte'
  import Combobox from './combobox.svelte'
  import ComboboxChip from './combobox-chip.svelte'
  import ComboboxChips from './combobox-chips.svelte'
  import ComboboxContent from './combobox-content.svelte'
  import ComboboxEmpty from './combobox-empty.svelte'
  import ComboboxGroup from './combobox-group.svelte'
  import ComboboxGroupLabel from './combobox-group-label.svelte'
  import ComboboxInput from './combobox-input.svelte'
  import ComboboxItem from './combobox-item.svelte'
  import ComboboxList from './combobox-list.svelte'
  import ComboboxSeparator from './combobox-separator.svelte'

  const FRAMEWORKS = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro'] as const

  let {
    defaultValue,
    clearable,
    multiple,
    invalid,
    icon,
    placeholder = 'Select a framework',
    chips,
  }: {
    defaultValue?: string | string[]
    clearable?: boolean
    multiple?: boolean
    invalid?: boolean
    icon?: boolean
    placeholder?: string
    chips?: boolean
  } = $props()

  let selected = $state<string[]>(untrack(() => (Array.isArray(defaultValue) ? defaultValue : [])))
</script>

{#snippet list()}
  <ComboboxContent>
    <ComboboxEmpty>No items found.</ComboboxEmpty>
    <ComboboxList>
      <ComboboxGroup>
        <ComboboxGroupLabel>Frameworks</ComboboxGroupLabel>
        {#each FRAMEWORKS as item (item)}
          <ComboboxItem value={item} label={item}>{item}</ComboboxItem>
        {/each}
      </ComboboxGroup>
      <ComboboxSeparator />
      <ComboboxItem value="other" label="Other">Other</ComboboxItem>
    </ComboboxList>
  </ComboboxContent>
{/snippet}

{#if invalid}
  <Field {invalid}>
    <FieldLabel>Framework</FieldLabel>
    <Combobox {defaultValue} {multiple} {clearable} {icon}>
      <ComboboxInput {placeholder} aria-label={placeholder} />
      {@render list()}
    </Combobox>
  </Field>
{:else if chips}
  <Combobox multiple {clearable} {icon} bind:value={selected}>
    <ComboboxChips {placeholder} inputProps={{ 'aria-label': placeholder }}>
      {#each selected as item (item)}
        <ComboboxChip value={item}>{item}</ComboboxChip>
      {/each}
    </ComboboxChips>
    {@render list()}
  </Combobox>
{:else}
  <Combobox {defaultValue} {multiple} {clearable} {icon}>
    <ComboboxInput {placeholder} aria-label={placeholder} />
    {@render list()}
  </Combobox>
{/if}
