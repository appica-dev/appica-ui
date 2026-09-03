<script lang="ts">
  import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    DirectionProvider,
    Field,
    FieldLabel,
    Switch,
  } from '@appica/ui-svelte'

  const FRAMEWORKS = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro']

  let dir: 'ltr' | 'rtl' = $state('ltr')
  let query = $state('')
  let multi = $state<string[]>(['SvelteKit'])

  const filtered = $derived(
    FRAMEWORKS.filter((item) => item.toLowerCase().includes(query.trim().toLowerCase())),
  )
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Combobox</h2>
  <p class="text-foreground-muted text-sm">
    Filtering is consumer-side. Type in the input and the list is derived from that query.
  </p>

  <label class="flex items-center gap-2 text-sm">
    <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
    RTL
  </label>

  <DirectionProvider {dir}>
    <div class="flex max-w-sm flex-col gap-6" {dir}>
      <Combobox>
        <ComboboxInput
          placeholder="Search a framework"
          aria-label="Search a framework"
          oninput={(event) => {
            query = event.currentTarget.value
          }}
        />
        <ComboboxContent>
          <ComboboxList>
            {#each filtered as item (item)}
              <ComboboxItem value={item} label={item}>{item}</ComboboxItem>
            {:else}
              <ComboboxEmpty>No items found.</ComboboxEmpty>
            {/each}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <Combobox multiple clearable bind:value={multi}>
        <ComboboxChips placeholder="Add frameworks" inputProps={{ 'aria-label': 'Add frameworks' }}>
          {#each multi as item (item)}
            <ComboboxChip value={item}>{item}</ComboboxChip>
          {/each}
        </ComboboxChips>
        <ComboboxContent>
          <ComboboxList>
            {#each FRAMEWORKS as item (item)}
              <ComboboxItem value={item} label={item}>{item}</ComboboxItem>
            {/each}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      <Field invalid>
        <FieldLabel>Invalid</FieldLabel>
        <Combobox>
          <ComboboxInput placeholder="Needs a value" aria-label="Needs a value" />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxItem value="Next.js" label="Next.js">Next.js</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
    </div>
  </DirectionProvider>
</section>
