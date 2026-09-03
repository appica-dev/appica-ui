<script lang="ts">
  import { Checkbox, CheckboxGroup } from '@appica/ui-svelte'

  const toppings = [
    { name: 'cheese', label: 'Extra cheese' },
    { name: 'mushrooms', label: 'Mushrooms' },
    { name: 'olives', label: 'Olives' },
    { name: 'onions', label: 'Onions' },
  ]

  const permissions = [
    { name: 'read', label: 'Read' },
    { name: 'write', label: 'Write' },
    { name: 'delete', label: 'Delete' },
  ]

  const allValues = permissions.map((permission) => permission.name)
  let permissionValue = $state<string[]>(['read'])
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Checkbox</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Usage</p>
    <label class="flex items-center gap-2">
      <Checkbox defaultChecked />
      Accept terms and conditions
    </label>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">States</p>
    <div class="flex flex-wrap items-center gap-6 text-sm select-none">
      <label class="flex items-center gap-2">
        <Checkbox />
        Unchecked
      </label>
      <label class="flex items-center gap-2">
        <Checkbox defaultChecked />
        Checked
      </label>
      <label class="flex items-center gap-2">
        <Checkbox indeterminate />
        Indeterminate
      </label>
      <label class="text-foreground-muted flex items-center gap-2">
        <Checkbox disabled />
        Disabled
      </label>
      <label class="text-foreground-muted flex items-center gap-2">
        <Checkbox disabled defaultChecked />
        Disabled checked
      </label>
      <label class="flex items-center gap-2">
        <Checkbox aria-invalid={true} />
        Error
      </label>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizing</p>
    <div class="flex flex-col items-start gap-4 select-none">
      <label class="flex items-center gap-2 text-base">
        <Checkbox defaultChecked />
        text-base
      </label>
      <label class="flex items-center gap-2.5 text-lg">
        <Checkbox defaultChecked />
        text-lg
      </label>
      <label class="flex items-center gap-3 text-xl">
        <Checkbox defaultChecked />
        text-xl
      </label>
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">With a label and description</p>
    <label class="flex max-w-sm items-start gap-2.5 select-none">
      <Checkbox defaultChecked class="mt-1" />
      <span class="flex flex-col">
        <span class="text-foreground-intense font-medium">Enable notifications</span>
        <span class="text-foreground-muted text-sm">
          Receive emails about new activity on your account. You can turn this off any time.
        </span>
      </span>
    </label>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Checkbox group</p>
    <CheckboxGroup aria-labelledby="toppings-label" defaultValue={['cheese', 'olives']}>
      <span id="toppings-label" class="text-foreground mb-1 text-sm font-medium">Toppings</span>
      {#each toppings as topping (topping.name)}
        <label class="flex items-center gap-2 text-sm select-none">
          <Checkbox name={topping.name} />
          {topping.label}
        </label>
      {/each}
    </CheckboxGroup>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Checkbox group (horizontal)</p>
    <CheckboxGroup orientation="horizontal" aria-labelledby="channels-label" defaultValue={['sms']}>
      <span id="channels-label" class="text-foreground w-full text-sm font-medium">Channels</span>
      <label class="flex items-center gap-2 text-sm select-none">
        <Checkbox name="email" />
        Email
      </label>
      <label class="flex items-center gap-2 text-sm select-none">
        <Checkbox name="sms" />
        SMS
      </label>
      <label class="flex items-center gap-2 text-sm select-none">
        <Checkbox name="push" />
        Push
      </label>
    </CheckboxGroup>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Select all (parent checkbox)</p>
    <CheckboxGroup allValues={allValues} bind:value={permissionValue} aria-labelledby="permissions-label">
      <label class="flex items-center gap-2 text-sm font-medium select-none">
        <Checkbox parent />
        <span id="permissions-label">Permissions</span>
      </label>
      <div class="flex flex-col gap-2 pl-6">
        {#each permissions as permission (permission.name)}
          <label class="flex items-center gap-2 text-sm select-none">
            <Checkbox name={permission.name} />
            {permission.label}
          </label>
        {/each}
      </div>
    </CheckboxGroup>
  </div>
</section>
