<script lang="ts">
  import { Bold, ChevronDown, Italic, Underline } from '@appica/icons-svelte'
  import {
    Button,
    ButtonGroup,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    buttonVariants,
    DirectionProvider,
    Switch,
  } from '@appica/ui-svelte'

  const variants = ['primary', 'primary-outline', 'secondary', 'soft', 'outline', 'destructive'] as const
  const sizes = ['sm', 'md', 'lg'] as const
  let dir: 'ltr' | 'rtl' = $state('ltr')
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
        <Bold />
      </Button>
      <Button aria-label="Italic">
        <Italic />
      </Button>
      <Button aria-label="Underline">
        <Underline />
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
          <ChevronDown
            class="group-data-popup-open/split:rotate-180 motion-safe:transition-transform motion-safe:duration-200"
          />
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

  <div class="flex flex-col gap-2">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir}>
        <ButtonGroup variant="outline">
          <Button>Years</Button>
          <Button>Months</Button>
          <Button>Days</Button>
        </ButtonGroup>
      </div>
    </DirectionProvider>
  </div>
</section>
