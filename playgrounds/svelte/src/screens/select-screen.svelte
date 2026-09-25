<script lang="ts">
  import { CreditCard } from '@appica/icons-svelte'
  import {
    Avatar,
    AvatarFallback,
    DirectionProvider,
    Field,
    FieldError,
    Select,
    SelectContent,
    SelectGroup,
    SelectGroupLabel,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
    Switch,
  } from '@appica/ui-svelte'

  const fruits = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Orange', 'Strawberry']
  const variants = ['outline', 'soft'] as const
  const sizes = ['sm', 'md', 'lg'] as const
  const methods = ['Credit card', 'PayPal', 'Bank transfer', 'Apple Pay', 'Google Pay']
  const toppings = ['Pepperoni', 'Mushrooms', 'Onions', 'Olives', 'Peppers', 'Bacon', 'Pineapple']
  const plans = { free: 'Free', pro: 'Pro', enterprise: 'Enterprise' } as const
  const countries = [
    { code: 'au', name: 'Australia' },
    { code: 'br', name: 'Brazil' },
    { code: 'ca', name: 'Canada' },
    { code: 'fr', name: 'France' },
    { code: 'de', name: 'Germany' },
    { code: 'jp', name: 'Japan' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'us', name: 'United States' },
  ]
  const users = [
    { id: 'sarah', name: 'Sarah Jenkins', initials: 'SJ' },
    { id: 'liam', name: 'Liam Hudson', initials: 'LH' },
    { id: 'mateo', name: 'Mateo Rossi', initials: 'MR' },
    { id: 'ava', name: 'Ava Thompson', initials: 'AT' },
    { id: 'emma', name: 'Emma Garcia', initials: 'EG' },
    { id: 'noah', name: 'Noah Patel', initials: 'NP' },
  ]

  let dir: 'ltr' | 'rtl' = $state('ltr')
  let country = $state('us')
  let assignee = $state('liam')
  let fruit = $state<string | undefined>()
  let topping = $state<string[]>(['Pepperoni', 'Mushrooms'])

  const selectedCountry = $derived(countries.find((item) => item.code === country))
  const selectedUser = $derived(users.find((item) => item.id === assignee))

  function flagEmoji(code: string) {
    return [...code.toUpperCase()].map((char) => String.fromCodePoint(127397 + char.charCodeAt(0))).join('')
  }
</script>

{#snippet cardIcon()}
  <CreditCard data-icon="start" />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Select</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex w-full max-w-70 flex-col gap-4">
      {#each variants as variant (variant)}
        <Select {variant}>
          <SelectTrigger aria-label="Pick a fruit ({variant})">
            <SelectValue placeholder="Pick a fruit" />
          </SelectTrigger>
          <SelectContent>
            {#each fruits as item (item)}
              <SelectItem value={item} label={item}>{item}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex w-full max-w-70 flex-col gap-4">
      {#each sizes as size (size)}
        <Select {size}>
          <SelectTrigger aria-label="Pick a fruit ({size})">
            <SelectValue placeholder="Pick a fruit" />
          </SelectTrigger>
          <SelectContent>
            {#each fruits as item (item)}
              <SelectItem value={item} label={item}>{item}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Grouped options</p>
    <div class="w-full max-w-70">
      <Select>
        <SelectTrigger aria-label="Pick a food">
          <SelectValue placeholder="Pick a food" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectGroupLabel>Fruits</SelectGroupLabel>
            <SelectItem value="Apple" label="Apple">Apple</SelectItem>
            <SelectItem value="Banana" label="Banana">Banana</SelectItem>
            <SelectItem value="Orange" label="Orange">Orange</SelectItem>
            <SelectItem value="Strawberry" label="Strawberry">Strawberry</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectGroupLabel>Vegetables</SelectGroupLabel>
            <SelectItem value="Carrot" label="Carrot">Carrot</SelectItem>
            <SelectItem value="Potato" label="Potato">Potato</SelectItem>
            <SelectItem value="Tomato" label="Tomato">Tomato</SelectItem>
            <SelectItem value="Broccoli" label="Broccoli" disabled>Broccoli</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Clearable</p>
    <div class="w-full max-w-70">
      <Select defaultValue="Orange">
        <SelectTrigger clearable aria-label="Pick a fruit">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          {#each fruits as item (item)}
            <SelectItem value={item} label={item}>{item}</SelectItem>
          {/each}
        </SelectContent>
      </Select>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled and error states</p>
    <div class="flex w-full max-w-70 flex-col gap-4">
      <Select disabled>
        <SelectTrigger aria-label="Disabled">
          <SelectValue placeholder="Disabled" />
        </SelectTrigger>
        <SelectContent>
          {#each fruits as item (item)}
            <SelectItem value={item} label={item}>{item}</SelectItem>
          {/each}
        </SelectContent>
      </Select>
      <Select defaultValue="Orange">
        <SelectTrigger aria-invalid aria-label="With error">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          {#each fruits as item (item)}
            <SelectItem value={item} label={item}>{item}</SelectItem>
          {/each}
        </SelectContent>
      </Select>
      <Field invalid>
        <Select>
          <SelectTrigger aria-label="Needs a value">
            <SelectValue placeholder="Needs a value" />
          </SelectTrigger>
          <SelectContent>
            {#each fruits as item (item)}
              <SelectItem value={item} label={item}>{item}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
        <FieldError>Pick a fruit.</FieldError>
      </Field>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Start and end</p>
    <div class="w-full max-w-70">
      <Select defaultValue="Credit card" alignItemWithTrigger={false}>
        <SelectTrigger aria-label="Payment method">
          {#snippet start()}
            {@render cardIcon()}
          {/snippet}
          {#snippet end()}
            <span class="text-foreground-subtle text-xs">Default</span>
          {/snippet}
          <SelectValue placeholder="Payment method" />
        </SelectTrigger>
        <SelectContent>
          {#each methods as method (method)}
            <SelectItem value={method} label={method}>{method}</SelectItem>
          {/each}
        </SelectContent>
      </Select>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Country select</p>
    <div class="w-full max-w-70">
      <Select bind:value={country} alignItemWithTrigger={false}>
        <SelectTrigger aria-label="Select a country">
          {#snippet start()}
            {#if selectedCountry}
              <span aria-hidden="true">{flagEmoji(selectedCountry.code)}</span>
            {/if}
          {/snippet}
          <SelectValue placeholder="Select a country">
            {#snippet children({ placeholder })}
              {selectedCountry?.name ?? placeholder}
            {/snippet}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {#each countries as item (item.code)}
            <SelectItem value={item.code} label={item.name}>
              <span data-icon="start" aria-hidden="true">{flagEmoji(item.code)}</span>
              {item.name}
            </SelectItem>
          {/each}
        </SelectContent>
      </Select>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">User select</p>
    <div class="w-full max-w-70">
      <Select bind:value={assignee} alignItemWithTrigger={false}>
        <SelectTrigger aria-label="Assign to">
          {#snippet start()}
            {#if selectedUser}
              <Avatar size={22}>
                <AvatarFallback>{selectedUser.initials}</AvatarFallback>
              </Avatar>
            {/if}
          {/snippet}
          <SelectValue placeholder="Assign to">
            {#snippet children({ placeholder })}
              {selectedUser?.name ?? placeholder}
            {/snippet}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {#each users as user (user.id)}
            <SelectItem value={user.id} label={user.name}>
              <Avatar size={22} data-icon="start">
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              {user.name}
            </SelectItem>
          {/each}
        </SelectContent>
      </Select>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Showing a label</p>
    <div class="flex w-full max-w-70 flex-col gap-4">
      <div class="flex flex-col gap-1.5">
        <p class="text-foreground-muted text-sm">Without items</p>
        <Select defaultValue="pro">
          <SelectTrigger aria-label="Plan, without items">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {#each Object.entries(plans) as [value, label] (value)}
              <SelectItem {value}>{label}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      </div>
      <div class="flex flex-col gap-1.5">
        <p class="text-foreground-muted text-sm">With items</p>
        <Select defaultValue="pro" items={plans}>
          <SelectTrigger aria-label="Plan, with items">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {#each Object.entries(plans) as [value, label] (value)}
              <SelectItem {value} {label}>{label}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Multiple selection</p>
    <div class="w-full max-w-70">
      <Select multiple bind:value={topping}>
        <SelectTrigger clearable aria-label="Choose toppings">
          <SelectValue placeholder="Choose toppings">
            {#snippet children({ labels, placeholder })}
              {labels.length === 0 ? placeholder : labels.length === 1 ? labels[0] : `${labels.length} toppings`}
            {/snippet}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {#each toppings as item (item)}
            <SelectItem value={item} label={item}>{item}</SelectItem>
          {/each}
        </SelectContent>
      </Select>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Controlled</p>
    <div class="flex w-full max-w-70 flex-col gap-3">
      <Select bind:value={fruit}>
        <SelectTrigger clearable aria-label="Pick a fruit">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent>
          {#each fruits as item (item)}
            <SelectItem value={item} label={item}>{item}</SelectItem>
          {/each}
        </SelectContent>
      </Select>
      <p class="text-foreground-muted text-sm">
        Current value: <span class="text-foreground font-medium">{fruit ?? '-'}</span>
      </p>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="w-full max-w-70">
        <Select defaultValue="Orange">
          <SelectTrigger aria-label="Pick a fruit">
            <SelectValue placeholder="Pick a fruit" />
          </SelectTrigger>
          <SelectContent>
            {#each fruits as item (item)}
              <SelectItem value={item} label={item}>{item}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      </div>
    </DirectionProvider>
  </div>
</section>
