<script lang="ts">
  import {
    Bookmark,
    BookmarkFilled,
    FolderPlus,
    Heart,
    HeartFilled,
    Plus,
    ShoppingCartPlus,
  } from '@appica/icons-svelte'
  import {
    Avatar,
    AvatarBadge,
    AvatarFallback,
    AvatarImage,
    Badge,
    Button,
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardMedia,
    CardTitle,
    Checkbox,
    DirectionProvider,
    Field,
    FieldLabel,
    Input,
    NumberField,
    Switch,
    Thumbnail,
    Toggle,
    ToggleGroup,
    buttonVariants,
  } from '@appica/ui-svelte'

  const PEAKS = 'https://appica.dev/carousel/slide-1.jpg'
  const RADIUS_IMG = 'https://appica.dev/carousel/slide-4.jpg'
  const HORIZONTAL_IMG = 'https://appica.dev/carousel/slide-5.jpg'
  const OVERLAY_IMG = 'https://appica.dev/carousel/slide-7.jpg'
  const AVATAR_SARAH = 'https://appica.dev/avatars/01.jpg'
  const AVATAR_MATEO = 'https://appica.dev/avatars/03.jpg'
  const PRODUCT_IMG = 'https://appica.dev/landing/nimbus-runner.jpg'
  const VIDEO_SRC = 'https://appica.dev/card/video.mp4'

  const RADII = [
    { label: 'radius-sm', class: '[--card-radius:var(--radius-sm)]' },
    { label: 'radius-xl (default)', class: '' },
    { label: 'radius-3xl', class: '[--card-radius:var(--radius-3xl)]' },
  ] as const

  const SIZES = ['40', '41', '42', '43']
  const OVERLAY_INSETS = [true, false] as const

  let dir: 'ltr' | 'rtl' = $state('ltr')

  function handleSignIn(event: SubmitEvent) {
    event.preventDefault()
  }
</script>

{#snippet bookmark()}
  <Bookmark class="in-data-pressed:hidden" />
{/snippet}

{#snippet bookmarkFilled()}
  <BookmarkFilled class="hidden in-data-pressed:block" />
{/snippet}

{#snippet heart()}
  <Heart class="in-data-pressed:hidden" />
{/snippet}

{#snippet heartFilled()}
  <HeartFilled class="hidden in-data-pressed:block" />
{/snippet}

{#snippet shoppingCartPlus()}
  <ShoppingCartPlus data-icon="start" />
{/snippet}

{#snippet folderPlus()}
  <FolderPlus />
{/snippet}

{#snippet plus()}
  <Plus data-icon="start" />
{/snippet}

{#snippet appicaMark()}
  <svg class="size-9" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="none" aria-hidden="true">
    <path
      class="text-primary"
      d="M16 0c11.671 0 16 4.329 16 16s-4.329 16-16 16S0 27.671 0 16 4.329 0 16 0z"
      fill="currentColor"
    ></path>
    <path
      class="text-primary-foreground"
      d="M20.27 8.945c-1.793-2.54-5.534-2.54-7.326 0l-6.023 8.534c-2.118 3.001.01 7.162 3.663 7.162h4.476c-.849-1.301-1.344-2.859-1.344-4.533 0-4.56 3.666-8.257 8.189-8.257.142 0 .282.004.422.011L20.27 8.945zm2.117 14.886c1.951 0 3.533-1.595 3.533-3.562s-1.582-3.562-3.533-3.562-3.533 1.595-3.533 3.562 1.582 3.562 3.533 3.562z"
      fill="currentColor"
    ></path>
  </svg>
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Card</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Default</p>
    <Card class="w-full max-w-90">
      <CardHeader>
        <CardTitle>Weekly digest</CardTitle>
        <CardDescription>
          A short round-up of what changed, who shipped it, and what still needs a second pair of eyes.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button>Read digest</Button>
      </CardFooter>
    </Card>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Frame</p>
    <div class="grid w-full gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>No frame</CardTitle>
          <CardDescription>The card sits directly on the page, outlined by a single hairline border.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="soft">Learn more</Button>
        </CardFooter>
      </Card>

      <Card frame="solid">
        <CardHeader>
          <CardTitle>Solid frame</CardTitle>
          <CardDescription>
            An 8px band of <code>background-subtle</code> wraps the content and lifts the card off the page.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline">Learn more</Button>
        </CardFooter>
      </Card>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Glass frame</p>
    <div
      class="w-full rounded-2xl bg-[image:linear-gradient(rgb(0_0_0/0.2),rgb(0_0_0/0.2)),url('https://appica.dev/carousel/slide-2.jpg')] bg-cover bg-center p-8"
    >
      <Card frame="glass" class="mx-auto w-full max-w-90">
        <CardHeader>
          <CardTitle>A room above the clouds</CardTitle>
          <CardDescription>
            The glass frame borrows the pixels behind it, so it only reads as glass over imagery or a colored surface.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button>Check availability</Button>
        </CardFooter>
      </Card>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Media</p>
    <div class="grid w-full gap-4 sm:grid-cols-2">
      <Card>
        <CardMedia class="h-44">
          <img src={PEAKS} alt="Snow-capped peaks at sunrise" />
        </CardMedia>
        <CardHeader>
          <CardTitle>Inset</CardTitle>
          <CardDescription>
            The image floats 8px inside the content wrapper and keeps all four corners rounded.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card inset={false}>
        <CardMedia class="h-44">
          <img src={PEAKS} alt="Snow-capped peaks at sunrise" />
        </CardMedia>
        <CardHeader>
          <CardTitle>Flush</CardTitle>
          <CardDescription>The image runs edge to edge and the card clips it to its own top corners.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Video</p>
    <Card class="w-full max-w-90">
      <CardMedia class="h-48">
        <video src={VIDEO_SRC} autoplay loop muted playsinline aria-label="A jellyfish drifting in dark water"></video>
      </CardMedia>
      <CardHeader>
        <CardTitle>Ambient loop</CardTitle>
        <CardDescription>
          A video element is clipped by exactly the same rounded box as an image - no extra classes needed.
        </CardDescription>
      </CardHeader>
    </Card>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Horizontal layout</p>
    <Card el="article" contentProps={{ class: 'md:flex-row md:gap-2' }} class="w-full max-w-160">
      <CardMedia class="h-48 shrink-0 md:h-auto md:w-56">
        <img src={HORIZONTAL_IMG} alt="A lone peak mirrored in a still lake" />
      </CardMedia>
      <div class="flex min-w-0 flex-1 flex-col">
        <CardHeader>
          <Badge variant="secondary" size="sm" class="mb-1 self-start">Field notes</Badge>
          <CardTitle>
            <a href="#!" class="outline-ring rounded-xs hover:underline">
              What eight seasons above the treeline taught us about packing light
            </a>
          </CardTitle>
          <CardDescription>
            Every gram you carry is a decision you already made. Here is the kit that survived - and the gear that never
            left the tent twice.
          </CardDescription>
        </CardHeader>
        <CardFooter class="flex-row items-center justify-between">
          <div class="flex min-w-0 items-center gap-2">
            <Avatar size="xs">
              <AvatarImage src={AVATAR_SARAH} alt="Sarah Jenkins" />
              <AvatarFallback>EV</AvatarFallback>
            </Avatar>
            <span class="text-foreground-muted truncate text-xs">Sarah Jenkins · 12 March 2026</span>
          </div>
          <Toggle
            aria-label="Save for later"
            class={[buttonVariants({ variant: 'ghost', size: 'icon-sm' }), 'data-pressed:text-foreground-intense']}
          >
            {@render bookmark()}
            {@render bookmarkFilled()}
          </Toggle>
        </CardFooter>
      </div>
    </Card>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Overlay</p>
    <div class="grid w-full gap-4 sm:grid-cols-2">
      {#each OVERLAY_INSETS as inset (String(inset))}
        <Card {inset} class="h-72" contentProps={{ class: 'relative' }}>
          <CardMedia class={inset ? 'absolute inset-2' : 'absolute inset-0'}>
            <img src={OVERLAY_IMG} alt="A lone mountain under towering clouds" />
            <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent"></div>
          </CardMedia>
          <CardHeader class="relative justify-between">
            <Badge variant="light" class="self-start">
              {inset ? 'inset' : 'inset={false}'}
            </Badge>
            <div class="flex flex-col gap-1.5">
              <CardTitle class="text-white">The Lone Peak</CardTitle>
              <CardDescription class="text-white/75">
                The header stacks above an absolutely-positioned media layer, so the whole card becomes the image.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Profile</p>
    <Card frame="solid" class="w-full max-w-80">
      <CardHeader class="items-center text-center">
        <Avatar size="xl" class="mb-2">
          <AvatarImage src={AVATAR_MATEO} alt="" />
          <AvatarFallback>MR</AvatarFallback>
          <AvatarBadge />
        </Avatar>
        <CardTitle>Mateo Rossi</CardTitle>
        <CardDescription>Principal designer · Bologna</CardDescription>
      </CardHeader>
      <CardFooter class="sm:justify-center">
        <Button size="sm">Follow</Button>
        <Button variant="outline" size="sm">Message</Button>
      </CardFooter>
    </Card>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Empty state</p>
    <Card
      class="w-full max-w-110"
      contentProps={{ class: 'bg-background-subtle items-center border-dashed border-strong text-center' }}
    >
      <CardHeader class="items-center">
        <Thumbnail variant="icon-outline" class="mb-2">
          {@render folderPlus()}
        </Thumbnail>
        <CardTitle>No collections yet</CardTitle>
        <CardDescription class="max-w-70">
          Collections group related boards so your team can find them without digging through search.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button size="sm">
          {@render plus()}
          New collection
        </Button>
      </CardFooter>
    </Card>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Product card</p>
    <Card class="w-full max-w-85">
      <CardMedia class="h-44">
        <img src={PRODUCT_IMG} alt="Nimbus Runner sneaker on a pastel background" />
        <Badge variant="light" size="sm" class="absolute inset-s-2 top-2">-20%</Badge>
        <Toggle aria-label="Add to wishlist" class={[buttonVariants({ variant: 'light', size: 'icon-sm' }), 'absolute inset-e-2 top-2']}>
          {@render heart()}
          {@render heartFilled()}
        </Toggle>
      </CardMedia>

      <CardHeader>
        <div class="flex items-start justify-between gap-3">
          <div>
            <CardTitle class="text-base">Nimbus Runner</CardTitle>
            <CardDescription class="text-xs">Men's running shoes</CardDescription>
          </div>
          <div class="text-end">
            <div class="text-foreground-intense font-semibold tabular-nums">$96</div>
            <s class="text-foreground-muted text-xs tabular-nums">$120</s>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between gap-3">
          <ToggleGroup aria-label="Shoe size" defaultValue="42">
            {#each SIZES as size (size)}
              <Toggle value={size} class={[buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'text-xs']}>
                {size}
              </Toggle>
            {/each}
          </ToggleGroup>
          <NumberField variant="soft" size="sm" defaultValue={1} min={1} max={9} aria-label="Quantity" />
        </div>
      </CardHeader>

      <CardFooter>
        <Button size="sm" class="w-full">
          {@render shoppingCartPlus()}
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Form in a card</p>
    <Card frame="solid" el="form" class="w-full max-w-90" onsubmit={handleSignIn}>
      <CardHeader>
        {@render appicaMark()}
        <CardTitle class="mt-1 text-xl">Sign in to Appica</CardTitle>
        <CardDescription>Sign in to view order status, update billing, check past orders.</CardDescription>

        <div class="mt-4 flex flex-col gap-4">
          <Field name="email">
            <FieldLabel>Email</FieldLabel>
            <Input type="email" variant="soft" autocomplete="off" />
          </Field>
          <Field name="password">
            <div class="flex items-center justify-between gap-3">
              <FieldLabel>Password</FieldLabel>
              <a href="#!" class="outline-ring text-foreground-intense rounded-xs text-sm underline">Forgot password?</a>
            </div>
            <Input type="password" variant="soft" autocomplete="new-password" />
          </Field>
          <label class="flex items-center gap-2 text-sm select-none">
            <Checkbox name="persist" defaultChecked />
            Stay signed in
          </label>
        </div>
      </CardHeader>
      <CardFooter>
        <Button type="submit" class="w-full">Sign in</Button>
      </CardFooter>
    </Card>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Radius</p>
    <div class="grid w-full gap-4 sm:grid-cols-2 md:grid-cols-3">
      {#each RADII as radius (radius.label)}
        <Card class={radius.class}>
          <CardMedia class="h-24">
            <img src={RADIUS_IMG} alt="" />
          </CardMedia>
          <CardHeader>
            <CardTitle class="text-base">{radius.label}</CardTitle>
          </CardHeader>
        </Card>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="grid w-full gap-4 sm:grid-cols-2">
        <Card inset={false}>
          <CardMedia class="h-44">
            <img src={PEAKS} alt="" />
          </CardMedia>
          <CardHeader>
            <CardTitle>Flush media</CardTitle>
            <CardDescription>
              Logical padding and flex order keep the footer actions on the start edge in both directions.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button>Primary</Button>
            <Button variant="outline">Secondary</Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inset footer</CardTitle>
            <CardDescription>Actions stack from the start edge and reverse on narrow viewports.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button>Read digest</Button>
            <Button variant="ghost">Skip</Button>
          </CardFooter>
        </Card>
      </div>
    </DirectionProvider>
  </div>
</section>
