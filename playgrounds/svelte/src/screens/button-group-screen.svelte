<script lang="ts">
  import {
    Button,
    ButtonGroup,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    buttonVariants,
  } from '@appica/ui-svelte'

  const variants = ['primary', 'primary-outline', 'secondary', 'soft', 'outline', 'destructive'] as const
  const sizes = ['sm', 'md', 'lg'] as const
</script>

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">ButtonGroup</h2>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Usage</p>
    <ButtonGroup variant="outline">
      <Button>Years</Button>
      <Button>Months</Button>
      <Button>Days</Button>
    </ButtonGroup>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Variants</p>
    <div class="flex flex-col items-start gap-4">
      {#each variants as variant (variant)}
        <ButtonGroup {variant}>
          <Button>Years</Button>
          <Button>Months</Button>
          <Button>Days</Button>
        </ButtonGroup>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Sizes</p>
    <div class="flex flex-col items-start gap-4">
      {#each sizes as size (size)}
        <ButtonGroup {size} variant="outline">
          <Button>Left</Button>
          <Button>Center</Button>
          <Button>Right</Button>
        </ButtonGroup>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Vertical orientation</p>
    <ButtonGroup orientation="vertical" variant="outline">
      <Button>Profile</Button>
      <Button>Billing</Button>
      <Button>Settings</Button>
    </ButtonGroup>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Icon buttons</p>
    <ButtonGroup variant="outline" size="icon-md">
      <Button aria-label="Bold">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
        </svg>
      </Button>
      <Button aria-label="Italic">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <line x1="19" x2="10" y1="4" y2="4" />
          <line x1="14" x2="5" y1="20" y2="20" />
          <line x1="15" x2="9" y1="4" y2="20" />
        </svg>
      </Button>
      <Button aria-label="Underline">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M6 4v6a6 6 0 0 0 12 0V4" />
          <line x1="4" x2="20" y1="20" y2="20" />
        </svg>
      </Button>
    </ButtonGroup>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Split button</p>
    <ButtonGroup variant="outline">
      <Button>Save</Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          class={['group/split', buttonVariants({ variant: 'outline', size: 'icon-md' })]}
          aria-label="More save options"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
            class="group-data-popup-open/split:rotate-180 motion-safe:transition-transform motion-safe:duration-200"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Save and continue</DropdownMenuItem>
          <DropdownMenuItem>Save as draft</DropdownMenuItem>
          <DropdownMenuItem>Save as template</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  </div>

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">Disabled</p>
    <ButtonGroup variant="outline" disabled>
      <Button>Years</Button>
      <Button>Months</Button>
      <Button>Days</Button>
    </ButtonGroup>
  </div>
</section>
