<script lang="ts">
  import { Search } from '@appica/icons-svelte'
  import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxCollection,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxLabel,
    ComboboxList,
    ComboboxTrigger,
    ComboboxValue,
    DirectionProvider,
    Field,
    FieldError,
    FieldLabel,
    Switch,
  } from '@appica/ui-svelte'

  const FRAMEWORKS = ['Next.js', 'SvelteKit', 'Nuxt.js', 'Remix', 'Astro', 'SolidStart', 'Gatsby', 'Vite']
  const COUNTRIES = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'JP', name: 'Japan' },
    { code: 'DE', name: 'Germany' },
  ]
  const USERS = [
    { id: 'ada', name: 'Ada Lovelace', email: 'ada@example.com' },
    { id: 'grace', name: 'Grace Hopper', email: 'grace@example.com' },
    { id: 'alan', name: 'Alan Turing', email: 'alan@example.com' },
  ]
  const GROUPS = [
    { value: 'Fruits', items: ['Apple', 'Banana', 'Cherry', 'Mango'] },
    { value: 'Vegetables', items: ['Broccoli', 'Carrot', 'Spinach', 'Tomato'] },
  ]

  let dir: 'ltr' | 'rtl' = $state('ltr')
  let controlled = $state('SvelteKit')
  let multi = $state<string[]>(['SvelteKit'])
  let extra = $state<string[]>([])
  let country = $state('ID')

  const creatableItems = $derived([...FRAMEWORKS, ...extra])
</script>

{#snippet searchIcon()}
  <Search class="size-4" />
{/snippet}

<section class="flex max-w-sm flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Combobox</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex max-w-70 flex-col gap-3">
      <Combobox items={FRAMEWORKS}>
        <ComboboxInput placeholder="Outline" aria-label="Outline" />
        <ComboboxContent>
          <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
          <ComboboxList>
            {#snippet children(item)}
              <ComboboxItem value={String(item)}>{item}</ComboboxItem>
            {/snippet}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Combobox items={FRAMEWORKS} variant="soft">
        <ComboboxInput placeholder="Soft" aria-label="Soft" />
        <ComboboxContent>
          <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
          <ComboboxList>
            {#snippet children(item)}
              <ComboboxItem value={String(item)}>{item}</ComboboxItem>
            {/snippet}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex max-w-70 flex-col gap-3">
      {#each (['sm', 'md', 'lg'] as const) as size (size)}
        <Combobox items={FRAMEWORKS} {size}>
          <ComboboxInput placeholder={size} aria-label={size} />
          <ComboboxContent>
            <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
            <ComboboxList>
              {#snippet children(item)}
                <ComboboxItem value={String(item)}>{item}</ComboboxItem>
              {/snippet}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Clearable and chevron</p>
    <Combobox items={FRAMEWORKS} clearable icon defaultValue="Next.js">
      <ComboboxInput placeholder="Clearable" aria-label="Clearable" />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {#snippet children(item)}
            <ComboboxItem value={String(item)}>{item}</ComboboxItem>
          {/snippet}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled and error</p>
    <div class="flex max-w-70 flex-col gap-3">
      <Combobox items={FRAMEWORKS} disabled defaultValue="Astro">
        <ComboboxInput placeholder="Disabled" aria-label="Disabled" />
        <ComboboxContent>
          <ComboboxList>
            {#snippet children(item)}
              <ComboboxItem value={String(item)}>{item}</ComboboxItem>
            {/snippet}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <Field invalid>
        <FieldLabel>Framework</FieldLabel>
        <Combobox items={FRAMEWORKS}>
          <ComboboxInput placeholder="Needs a value" aria-label="Invalid framework" />
          <ComboboxContent>
            <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
            <ComboboxList>
              {#snippet children(item)}
                <ComboboxItem value={String(item)}>{item}</ComboboxItem>
              {/snippet}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldError>Pick a framework.</FieldError>
      </Field>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Start and end</p>
    <Combobox items={FRAMEWORKS}>
      <ComboboxInput placeholder="Search" aria-label="Search with icon" start={searchIcon} />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {#snippet children(item)}
            <ComboboxItem value={String(item)}>{item}</ComboboxItem>
          {/snippet}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Country</p>
    <Combobox
      items={COUNTRIES}
      bind:value={country}
      itemToStringValue={(item) => (item as (typeof COUNTRIES)[number]).name}
    >
      <ComboboxInput placeholder="Country" aria-label="Country" />
      <ComboboxContent>
        <ComboboxEmpty>No countries found.</ComboboxEmpty>
        <ComboboxList>
          {#snippet children(item)}
            {@const countryItem = item as (typeof COUNTRIES)[number]}
            <ComboboxItem value={countryItem.code} label={countryItem.name}>
              {countryItem.name}
            </ComboboxItem>
          {/snippet}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
    <p class="text-foreground-subtle text-xs">Selected: {country}</p>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Input inside popup</p>
    <Combobox items={FRAMEWORKS}>
      <ComboboxTrigger aria-label="Open frameworks">
        <ComboboxValue placeholder="Pick a framework" />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder="Filter" aria-label="Filter frameworks" />
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {#snippet children(item)}
            <ComboboxItem value={String(item)}>{item}</ComboboxItem>
          {/snippet}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">User select</p>
    <Combobox
      items={USERS}
      itemToStringValue={(item) => (item as (typeof USERS)[number]).name}
    >
      <ComboboxInput placeholder="Assign to" aria-label="Assign to" />
      <ComboboxContent>
        <ComboboxEmpty>No people found.</ComboboxEmpty>
        <ComboboxList>
          {#snippet children(item)}
            {@const user = item as (typeof USERS)[number]}
            <ComboboxItem value={user.id} label={user.name}>
              <span class="flex flex-col">
                <span>{user.name}</span>
                <span class="text-foreground-muted text-xs">{user.email}</span>
              </span>
            </ComboboxItem>
          {/snippet}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Grouped</p>
    <Combobox items={GROUPS}>
      <ComboboxInput placeholder="Search produce" aria-label="Search produce" />
      <ComboboxContent>
        <ComboboxEmpty>No produce found.</ComboboxEmpty>
        <ComboboxList>
          {#snippet children(group)}
            {@const section = group as { value: string; items: string[] }}
            <ComboboxGroup items={section.items}>
              <ComboboxLabel>{section.value}</ComboboxLabel>
              <ComboboxCollection>
                {#snippet children(item)}
                  <ComboboxItem value={String(item)}>{item}</ComboboxItem>
                {/snippet}
              </ComboboxCollection>
            </ComboboxGroup>
          {/snippet}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Grid</p>
    <Combobox items={FRAMEWORKS} grid>
      <ComboboxInput placeholder="Grid" aria-label="Grid" />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList cols={2}>
          {#snippet children(item)}
            <ComboboxItem value={String(item)} class="flex-1">{item}</ComboboxItem>
          {/snippet}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Multiple chips</p>
    <Combobox items={FRAMEWORKS} multiple clearable bind:value={multi}>
      <ComboboxChips placeholder="Add frameworks" inputProps={{ 'aria-label': 'Add frameworks' }}>
        {#each multi as item (item)}
          <ComboboxChip value={item}>{item}</ComboboxChip>
        {/each}
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {#snippet children(item)}
            <ComboboxItem value={String(item)}>{item}</ComboboxItem>
          {/snippet}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Creatable</p>
    <Combobox
      items={creatableItems}
      filter={(item, query) => String(item).toLowerCase().includes(query.toLowerCase()) || query.length > 0}
    >
      <ComboboxInput
        placeholder="Create or pick"
        aria-label="Creatable"
        onkeydown={(event) => {
          if (event.key !== 'Enter') return
          const query = event.currentTarget.value.trim()
          if (!query || creatableItems.includes(query)) return
          extra = [...extra, query]
        }}
      />
      <ComboboxContent>
        <ComboboxEmpty>Type and press Enter to create.</ComboboxEmpty>
        <ComboboxList>
          {#snippet children(item)}
            <ComboboxItem value={String(item)}>{item}</ComboboxItem>
          {/snippet}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Controlled</p>
    <Combobox items={FRAMEWORKS} bind:value={controlled} clearable>
      <ComboboxInput placeholder="Controlled" aria-label="Controlled" />
      <ComboboxContent>
        <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
        <ComboboxList>
          {#snippet children(item)}
            <ComboboxItem value={String(item)}>{item}</ComboboxItem>
          {/snippet}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
    <p class="text-foreground-subtle text-xs">Value: {controlled || '-'}</p>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="max-w-70">
        <Combobox items={FRAMEWORKS} clearable>
          <ComboboxInput placeholder="Search" aria-label="RTL search" />
          <ComboboxContent>
            <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
            <ComboboxList>
              {#snippet children(item)}
                <ComboboxItem value={String(item)}>{item}</ComboboxItem>
              {/snippet}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </DirectionProvider>
  </div>
</section>
