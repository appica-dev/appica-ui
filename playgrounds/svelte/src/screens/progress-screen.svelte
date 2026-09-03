<script lang="ts">
  import {
    Button,
    DirectionProvider,
    Progress,
    ProgressLabel,
    ProgressValue,
    Switch,
  } from '@appica/ui-svelte'

  let progress = $state(0)
  let running = $state(true)
  let checkDrawn = $state(false)
  let dir: 'ltr' | 'rtl' = $state('ltr')

  const done = $derived(progress >= 100)

  $effect(() => {
    if (!running) return
    const id = setInterval(() => {
      progress = Math.min(100, progress + 7)
      if (progress >= 100) running = false
    }, 280)
    return () => clearInterval(id)
  })

  $effect(() => {
    if (!done) {
      checkDrawn = false
      return
    }
    const id = requestAnimationFrame(() => {
      checkDrawn = true
    })
    return () => cancelAnimationFrame(id)
  })

  function restart() {
    progress = 0
    running = true
  }
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Progress</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Default</p>
    <Progress value={60} class="w-72 max-w-full">
      <ProgressLabel>Uploading</ProgressLabel>
      <ProgressValue />
    </Progress>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Circular</p>
    <div class="flex items-center gap-10">
      <Progress variant="circular" value={72} size={64}>
        <ProgressValue />
      </Progress>

      <Progress variant="circular" value={40} size={64}>
        <ProgressValue />
        <ProgressLabel>Synced</ProgressLabel>
      </Progress>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Custom color and thickness</p>
    <div class="flex w-72 max-w-full flex-col gap-7">
      <Progress value={88} thickness={10} indicatorColor="var(--success-emphasis)">
        <ProgressLabel>Backup</ProgressLabel>
        <ProgressValue />
      </Progress>

      <Progress value={24} thickness={2} indicatorColor="var(--warning-emphasis)">
        <ProgressLabel>Storage</ProgressLabel>
        <ProgressValue />
      </Progress>

      <div class="flex justify-center">
        <Progress
          variant="circular"
          value={62}
          size={72}
          thickness={8}
          indicatorColor="var(--secondary-emphasis)"
        >
          <ProgressValue />
        </Progress>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">File upload (controlled)</p>
    <div class="border-border bg-background w-80 max-w-full rounded-xl border p-4">
      <div class="flex items-center gap-3">
        <span
          class={[
            'flex size-12 shrink-0 items-center justify-center rounded-lg transition-colors',
            done ? 'bg-success-subtle text-success-emphasis' : 'bg-background-muted text-foreground-muted',
          ]}
        >
          {#if done}
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="size-5">
              <path
                d="M5 12.5l4.5 4.5L19 7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                pathLength="1"
                class="transition-[stroke-dashoffset] duration-500 ease-out [stroke-dasharray:1] motion-reduce:transition-none"
                style:stroke-dashoffset={checkDrawn ? 0 : 1}
              />
            </svg>
          {:else}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.85"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              class="size-5"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
            </svg>
          {/if}
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-foreground-intense truncate text-sm font-medium">cover-photo.jpg</p>
          <Progress value={progress} class="mt-1.5 gap-y-1">
            <ProgressValue class="text-foreground-muted text-xs" />
            <ProgressLabel class="text-foreground-muted text-xs font-normal">
              {done ? 'Uploaded' : 'Uploading…'}
            </ProgressLabel>
          </Progress>
        </div>
      </div>
      {#if done}
        <Button variant="soft" size="sm" onclick={restart} class="mt-3 w-full">Upload again</Button>
      {/if}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Custom value</p>
    <Progress value={7} min={0} max={10} class="w-72 max-w-full">
      <ProgressLabel>Items</ProgressLabel>
      <ProgressValue>
        {#snippet children(_formatted, value)}
          {value} of 10
        {/snippet}
      </ProgressValue>
    </Progress>
    <Progress
      value={60}
      format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
      locale="en-US"
      class="w-72 max-w-full"
    >
      <ProgressLabel>Precise</ProgressLabel>
      <ProgressValue />
    </Progress>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        <Progress value={60} class="w-72 max-w-full">
          <ProgressLabel>Uploading</ProgressLabel>
          <ProgressValue />
        </Progress>
      </div>
    </DirectionProvider>
  </div>
</section>
