<script lang="ts">
  import Field from '../field/field.svelte'
  import FieldLabel from '../field/field-label.svelte'
  import Autocomplete from './autocomplete.svelte'
  import AutocompleteContent from './autocomplete-content.svelte'
  import AutocompleteEmpty from './autocomplete-empty.svelte'
  import AutocompleteInput from './autocomplete-input.svelte'
  import AutocompleteItem from './autocomplete-item.svelte'
  import AutocompleteList from './autocomplete-list.svelte'
  import AutocompleteStatus from './autocomplete-status.svelte'
  import AutocompleteTrigger from './autocomplete-trigger.svelte'

  const FRAMEWORKS = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro'] as const

  let {
    defaultValue,
    value,
    onValueChange,
    clearable,
    invalid,
    icon,
    grid,
    cols,
    placeholder = 'Search a framework',
    status,
    disabled,
    standaloneTrigger,
  }: {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
    clearable?: boolean
    invalid?: boolean
    icon?: boolean
    grid?: boolean
    cols?: number
    placeholder?: string
    status?: string
    disabled?: boolean
    standaloneTrigger?: boolean
  } = $props()
</script>

{#snippet popup()}
  <AutocompleteContent>
    {#if status}
      <AutocompleteStatus>{status}</AutocompleteStatus>
    {/if}
    <AutocompleteEmpty>No items found.</AutocompleteEmpty>
    <AutocompleteList {cols}>
      {#snippet children(item)}
        <AutocompleteItem value={item}>{item}</AutocompleteItem>
      {/snippet}
    </AutocompleteList>
  </AutocompleteContent>
{/snippet}

{#if invalid}
  <Field {invalid}>
    <FieldLabel>Framework</FieldLabel>
    <Autocomplete items={FRAMEWORKS} {defaultValue} {clearable} {icon}>
      <AutocompleteInput {placeholder} aria-label={placeholder} />
      {@render popup()}
    </Autocomplete>
  </Field>
{:else if standaloneTrigger}
  <Autocomplete items={FRAMEWORKS}>
    <AutocompleteTrigger aria-label="Open picker">Open</AutocompleteTrigger>
    <AutocompleteContent>
      <AutocompleteInput aria-label="Search in popup" />
      <AutocompleteList>
        {#snippet children(item)}
          <AutocompleteItem value={item}>{item}</AutocompleteItem>
        {/snippet}
      </AutocompleteList>
    </AutocompleteContent>
  </Autocomplete>
{:else}
  <Autocomplete items={FRAMEWORKS} {value} {defaultValue} {onValueChange} {clearable} {icon} {grid} {disabled}>
    <AutocompleteInput {placeholder} aria-label={placeholder} {disabled} />
    {@render popup()}
  </Autocomplete>
{/if}
