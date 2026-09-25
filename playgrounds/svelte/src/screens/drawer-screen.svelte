<script lang="ts">
  import { Music, Pencil } from '@appica/icons-svelte'
  import {
    DirectionProvider,
    Drawer,
    DrawerBody,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
    Field,
    FieldLabel,
    Input,
    ScrollArea,
    Switch,
    Thumbnail,
    buttonVariants,
    type DrawerSide,
  } from '@appica/ui-svelte'

  const SIDES: { side: DrawerSide; label: string }[] = [
    { side: 'top', label: 'Top' },
    { side: 'right', label: 'Right' },
    { side: 'bottom', label: 'Bottom' },
    { side: 'left', label: 'Left' },
  ]

  const TRACKS = [
    { title: 'Nightcall', artist: 'Neon Drift' },
    { title: 'Midnight City', artist: 'Violet Skies' },
    { title: 'Resonance', artist: 'Echo Theory' },
    { title: 'A Real Hero', artist: 'Pixel Horizon' },
    { title: 'Sunset Avenue', artist: 'The Lateliners' },
    { title: 'Turbo Killer', artist: 'Chrome Wolf' },
    { title: 'Afterglow', artist: 'Static Bloom' },
    { title: 'Le Castle', artist: 'Power Circuit' },
    { title: 'Tech Noir', artist: 'Ghost Signal' },
    { title: 'Crystals', artist: 'Cassette 84' },
  ]

  const EVENTS = [
    { who: 'Sarah Jenkins', what: 'merged pull request #482', when: '2m ago' },
    { who: 'Maya Torres', what: 'commented on "Release checklist"', when: '18m ago' },
    { who: 'Leo Martin', what: 'approved pull request #480', when: '40m ago' },
    { who: 'Daniel Reyes', what: 'closed issue #311', when: '1h ago' },
    { who: 'Priya Shah', what: 'added a label to issue #309', when: '2h ago' },
    { who: 'Emma Clarke', what: 'deployed to production', when: '3h ago' },
    { who: 'Sarah Jenkins', what: 'opened pull request #485', when: '5h ago' },
    { who: 'Tom Becker', what: 'pushed 12 commits to main', when: '6h ago' },
    { who: 'Maya Torres', what: 'requested changes on #478', when: '8h ago' },
    { who: 'Leo Martin', what: 'linked issue #312 to #485', when: '11h ago' },
    { who: 'Maya Torres', what: 'invited 2 members', when: 'Yesterday' },
    { who: 'Nina Foster', what: 'updated the roadmap', when: 'Yesterday' },
    { who: 'Priya Shah', what: 'merged pull request #476', when: 'Yesterday' },
    { who: 'Daniel Reyes', what: 'renamed the project', when: '2d ago' },
    { who: 'Emma Clarke', what: 'archived 4 tasks', when: '2d ago' },
    { who: 'Tom Becker', what: 'reverted commit 9f3c1a', when: '3d ago' },
    { who: 'Sarah Jenkins', what: 'created milestone "v2.0"', when: '3d ago' },
    { who: 'Leo Martin', what: 'closed issue #298', when: '4d ago' },
    { who: 'Nina Foster', what: 'edited the README', when: '5d ago' },
    { who: 'Priya Shah', what: 'opened pull request #470', when: '5d ago' },
    { who: 'Daniel Reyes', what: 'added 3 members', when: '6d ago' },
    { who: 'Emma Clarke', what: 'set up continuous integration', when: '1w ago' },
    { who: 'Tom Becker', what: 'imported the codebase', when: '1w ago' },
    { who: 'Sarah Jenkins', what: 'created the project', when: '2w ago' },
  ]

  let dir: 'ltr' | 'rtl' = $state('ltr')
  let workspaceName = $state('Appica')
</script>

{#snippet musicIcon()}
  <Music />
{/snippet}

{#snippet pencilIcon()}
  <Pencil data-icon="start" />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Drawer</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Usage</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Drawer side="right">
        <DrawerTrigger class={buttonVariants({ variant: 'outline' })}>Open drawer</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Notifications</DrawerTitle>
            <DrawerDescription>Choose what you want to be notified about.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>Content</DrawerBody>
          <DrawerFooter>
            <DrawerClose class={buttonVariants()}>Save</DrawerClose>
            <DrawerClose class={buttonVariants({ variant: 'outline' })}>Cancel</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Sides</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      {#each SIDES as { side, label } (side)}
        {@const wide = side === 'top' || side === 'bottom'}
        <Drawer {side}>
          <DrawerTrigger class={buttonVariants({ variant: 'outline' })}>{label}</DrawerTrigger>
          <DrawerContent class={wide ? 'mx-auto max-w-2xl' : undefined}>
            <DrawerHeader>
              <DrawerTitle>{label} drawer</DrawerTitle>
              <DrawerDescription>This panel slides in from the {side} edge.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <p>Drag the handle or swipe toward the {side} edge to dismiss it.</p>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose class={buttonVariants({ variant: 'outline' })}>Close</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Snap points</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Drawer snapPoints={[0.4, 1]}>
        <DrawerTrigger class={buttonVariants({ variant: 'outline' })}>Open player</DrawerTrigger>
        <DrawerContent class="mx-auto max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Up next</DrawerTitle>
            <DrawerDescription>Drag the sheet to a snap point - peek at 40% or pull it to full height.</DrawerDescription>
          </DrawerHeader>
          <ScrollArea class="min-h-0 flex-1" scrollShadow>
            <div class="flex flex-col gap-5 px-6">
              {#each TRACKS as track (track.title)}
                <div class="flex items-center gap-3">
                  <Thumbnail variant="icon-soft" size="sm">
                    {@render musicIcon()}
                  </Thumbnail>
                  <span class="flex min-w-0 flex-col">
                    <span class="text-foreground-intense truncate text-sm font-medium">{track.title}</span>
                    <span class="text-foreground-muted truncate text-xs">{track.artist}</span>
                  </span>
                </div>
              {/each}
            </div>
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Scrollable content</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Drawer side="right">
        <DrawerTrigger class={buttonVariants({ variant: 'outline' })}>View activity</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Activity</DrawerTitle>
            <DrawerDescription>Everything that happened in this project.</DrawerDescription>
          </DrawerHeader>
          <ScrollArea class="min-h-0 flex-1">
            <ol class="flex flex-col gap-4 px-6 pb-2">
              {#each EVENTS as event, i (`${event.who}-${event.when}-${i}`)}
                <li class="flex flex-col gap-0.5">
                  <p class="text-sm">
                    <span class="text-foreground-intense font-medium">{event.who}</span>
                    {event.what}
                  </p>
                  <p class="text-foreground-muted text-xs">{event.when}</p>
                </li>
              {/each}
            </ol>
          </ScrollArea>
          <DrawerFooter>
            <DrawerClose class={buttonVariants({ variant: 'outline' })}>Close</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Nested drawers</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Drawer side="right">
        <DrawerTrigger class={buttonVariants({ variant: 'outline' })}>Workspace</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Workspace</DrawerTitle>
            <DrawerDescription>Manage the workspace and its members.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody class="flex flex-col items-start gap-3">
            <p>Open a sub-panel to rename the workspace - the parent tucks back to show the stack.</p>
            <Drawer side="right">
              <DrawerTrigger class={buttonVariants()}>
                {@render pencilIcon()}
                Rename workspace
              </DrawerTrigger>
              <DrawerContent closeButton={false}>
                <DrawerHeader>
                  <DrawerTitle>Rename workspace</DrawerTitle>
                  <DrawerDescription>This name is visible to everyone on the team.</DrawerDescription>
                </DrawerHeader>
                <DrawerBody>
                  <Field>
                    <FieldLabel>Workspace name</FieldLabel>
                    <Input bind:value={workspaceName} />
                  </Field>
                </DrawerBody>
                <DrawerFooter>
                  <DrawerClose class={buttonVariants()}>Save</DrawerClose>
                  <DrawerClose class={buttonVariants({ variant: 'outline' })}>Cancel</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">RTL</p>
    <label class="flex items-center gap-2 text-sm">
      <Switch checked={dir === 'rtl'} onCheckedChange={(next) => (dir = next ? 'rtl' : 'ltr')} />
      RTL
    </label>
    <DirectionProvider {dir}>
      <div {dir} class="flex flex-wrap items-center justify-center gap-3">
        <Drawer side="right">
          <DrawerTrigger class={buttonVariants({ variant: 'outline' })}>Open drawer</DrawerTrigger>
          <DrawerContent {dir}>
            <DrawerHeader>
              <DrawerTitle>Notifications</DrawerTitle>
              <DrawerDescription>The header, body, and footer flip to read right-to-left.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <p>The handle and corner close button move to mirror.</p>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose class={buttonVariants({ variant: 'outline' })}>Close</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </DirectionProvider>
  </div>
</section>
