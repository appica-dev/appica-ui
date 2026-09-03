<script lang="ts">
  import { Switch } from '@appica/ui-svelte'

  let enabled = $state(true)
</script>

<section class="flex flex-col gap-6">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Switch</h2>

  <label class="flex items-center gap-2 text-sm">
    <Switch bind:checked={enabled} />
    Notifications ({enabled ? 'on' : 'off'})
  </label>

  <div class="flex flex-wrap items-center gap-4">
    <Switch size="sm" aria-label="Small" defaultChecked />
    <Switch size="md" aria-label="Medium" defaultChecked />
    <Switch size="lg" aria-label="Large" defaultChecked />
  </div>

  <label class="flex items-center gap-2 text-sm">
    <Switch disabled />
    Disabled
  </label>

  <label class="flex items-center gap-2 text-sm">
    <Switch aria-invalid={true} />
    Invalid
  </label>

  <div class="flex items-center gap-2" dir="rtl">
    <Switch aria-label="RTL" defaultChecked />
    <span class="text-sm">RTL</span>
  </div>
</section>
