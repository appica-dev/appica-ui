<script lang="ts">
  import {
    Autocomplete,
    AutocompleteCollection,
    AutocompleteContent,
    AutocompleteEmpty,
    AutocompleteGroup,
    AutocompleteInput,
    AutocompleteItem,
    AutocompleteLabel,
    AutocompleteList,
    DirectionProvider,
    Field,
    FieldLabel,
    Switch,
  } from '@appica/ui-svelte'

  const FRAMEWORKS = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro', 'SolidStart', 'Gatsby', 'Vite']
  const GROUPS = [
    { value: 'Fruits', items: ['Apple', 'Banana', 'Cherry', 'Mango'] },
    { value: 'Vegetables', items: ['Broccoli', 'Carrot', 'Spinach', 'Tomato'] },
  ]

  let dir: 'ltr' | 'rtl' = $state('ltr')
  let controlled = $state('')
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Autocomplete</h2>
  <p class="text-foreground-muted text-sm">
    Pass `items` on the root. The list snippet maps the filtered results; Empty shows when nothing matches.
  </p>

  <label class="flex items-center gap-2 text-sm">
    <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
    RTL
  </label>

  <DirectionProvider {dir}>
    <div class="flex max-w-70 flex-col gap-6" {dir}>
      <Autocomplete items={FRAMEWORKS}>
        <AutocompleteInput placeholder="Search a framework" aria-label="Search a framework" />
        <AutocompleteContent>
          <AutocompleteEmpty>No frameworks found.</AutocompleteEmpty>
          <AutocompleteList>
            {#snippet children(item)}
              <AutocompleteItem value={item}>{item}</AutocompleteItem>
            {/snippet}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>

      <Autocomplete items={FRAMEWORKS} variant="soft" size="sm" clearable icon defaultValue="Next.js">
        <AutocompleteInput placeholder="Soft, sm, clearable" aria-label="Soft sm" />
        <AutocompleteContent>
          <AutocompleteEmpty>No frameworks found.</AutocompleteEmpty>
          <AutocompleteList>
            {#snippet children(item)}
              <AutocompleteItem value={item}>{item}</AutocompleteItem>
            {/snippet}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>

      <Autocomplete items={FRAMEWORKS} grid icon>
        <AutocompleteInput placeholder="Grid" aria-label="Grid" />
        <AutocompleteContent>
          <AutocompleteEmpty>No frameworks found.</AutocompleteEmpty>
          <AutocompleteList cols={2}>
            {#snippet children(item)}
              <AutocompleteItem value={item} class="flex-1">{item}</AutocompleteItem>
            {/snippet}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>

      <Autocomplete items={GROUPS}>
        <AutocompleteInput placeholder="Search produce" aria-label="Search produce" />
        <AutocompleteContent>
          <AutocompleteEmpty>No produce found.</AutocompleteEmpty>
          <AutocompleteList>
            {#snippet children(group)}
              {@const section = group as { value: string; items: string[] }}
              <AutocompleteGroup items={section.items}>
                <AutocompleteLabel>{section.value}</AutocompleteLabel>
                <AutocompleteCollection>
                  {#snippet children(item)}
                    <AutocompleteItem value={item}>{item}</AutocompleteItem>
                  {/snippet}
                </AutocompleteCollection>
              </AutocompleteGroup>
            {/snippet}
          </AutocompleteList>
        </AutocompleteContent>
      </Autocomplete>

      <div class="flex flex-col gap-2">
        <Autocomplete items={FRAMEWORKS} bind:value={controlled} clearable>
          <AutocompleteInput placeholder="Controlled" aria-label="Controlled" />
          <AutocompleteContent>
            <AutocompleteEmpty>No frameworks found.</AutocompleteEmpty>
            <AutocompleteList>
              {#snippet children(item)}
                <AutocompleteItem value={item}>{item}</AutocompleteItem>
              {/snippet}
            </AutocompleteList>
          </AutocompleteContent>
        </Autocomplete>
        <p class="text-foreground-muted text-sm">
          Current value: <span class="text-foreground font-medium">{controlled || '-'}</span>
        </p>
      </div>

      <Field invalid>
        <FieldLabel>Invalid</FieldLabel>
        <Autocomplete items={FRAMEWORKS}>
          <AutocompleteInput placeholder="Needs a value" aria-label="Needs a value" />
          <AutocompleteContent>
            <AutocompleteEmpty>No frameworks found.</AutocompleteEmpty>
            <AutocompleteList>
              {#snippet children(item)}
                <AutocompleteItem value={item}>{item}</AutocompleteItem>
              {/snippet}
            </AutocompleteList>
          </AutocompleteContent>
        </Autocomplete>
      </Field>
    </div>
  </DirectionProvider>
</section>
