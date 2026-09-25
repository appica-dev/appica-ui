<script lang="ts">
  import { Send, Trash } from '@appica/icons-svelte'
  import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogClose,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DirectionProvider,
    ScrollArea,
    Spinner,
    Switch,
    buttonVariants,
  } from '@appica/ui-svelte'

  const AFFECTED = [
    { name: 'Orbit', detail: '12 members, 48 projects' },
    { name: 'Northstar', detail: '4 members, 9 projects' },
    { name: 'Harbor', detail: 'Billing history since 2023' },
    { name: 'Cascade', detail: 'Shared design tokens' },
    { name: 'Lumen', detail: '3 pending invitations' },
    { name: 'Atlas', detail: 'Production API keys' },
    { name: 'Drift', detail: 'Staging environment' },
    { name: 'Quill', detail: 'Docs and changelog' },
  ]

  let dir: 'ltr' | 'rtl' = $state('ltr')
  let asyncOpen = $state(false)
  let pending = $state(false)

  function handleAsyncOpenChange(next: boolean) {
    if (!pending) asyncOpen = next
  }

  async function confirmReset() {
    pending = true
    await new Promise((resolve) => setTimeout(resolve, 1400))
    pending = false
    asyncOpen = false
  }
</script>

{#snippet trashIcon()}
  <Trash data-icon="start" />
{/snippet}

{#snippet sendIcon()}
  <Send data-icon="start" />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Alert dialog</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Usage</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <AlertDialog>
        <AlertDialogTrigger class={buttonVariants({ variant: 'outline' })}>Delete project</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the project and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose class={buttonVariants({ variant: 'soft' })}>Cancel</AlertDialogClose>
            <AlertDialogClose class={buttonVariants({ variant: 'destructive' })}>Delete</AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Destructive confirmation</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <AlertDialog>
        <AlertDialogTrigger class={buttonVariants({ variant: 'outline' })}>
          {@render trashIcon()}
          Delete account
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile, projects, and billing history will be erased immediately. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose class={buttonVariants({ variant: 'soft' })}>Cancel</AlertDialogClose>
            <AlertDialogClose class={buttonVariants({ variant: 'destructive' })}>Delete account</AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">With media</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <AlertDialog>
        <AlertDialogTrigger class={buttonVariants({ variant: 'outline' })}>Invite member</AlertDialogTrigger>
        <AlertDialogContent class="text-center">
          <AlertDialogHeader>
            <Avatar size="lg" class="mx-auto mb-1">
              <AvatarImage src="https://picsum.photos/80" alt="Sarah Jenkins" />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            <AlertDialogTitle>Invite Sarah Jenkins?</AlertDialogTitle>
            <AlertDialogDescription>
              She'll get an email invitation to join the Orbit project as an editor. You can change her role later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose class={[buttonVariants({ variant: 'soft' }), 'flex-1']}>Cancel</AlertDialogClose>
            <AlertDialogClose class={[buttonVariants(), 'flex-1']}>
              {@render sendIcon()}
              Send invite
            </AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Asynchronous action</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <AlertDialog open={asyncOpen} onOpenChange={handleAsyncOpenChange}>
        <AlertDialogTrigger class={buttonVariants({ variant: 'outline' })}>Reset API key</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset your API key?</AlertDialogTitle>
            <AlertDialogDescription>
              The current key stops working at once. Update every service that uses it before continuing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose disabled={pending} class={buttonVariants({ variant: 'soft' })}>Cancel</AlertDialogClose>
            <Button disabled={pending} onclick={confirmReset}>
              {#if pending}
                <Spinner data-icon="start" currentColor class="text-base" />
                Resetting…
              {:else}
                Reset key
              {/if}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">No backdrop</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <AlertDialog>
        <AlertDialogTrigger class={buttonVariants({ variant: 'outline' })}>No backdrop</AlertDialogTrigger>
        <AlertDialogContent backdrop={false}>
          <AlertDialogHeader>
            <AlertDialogTitle>Plain card</AlertDialogTitle>
            <AlertDialogDescription>Frame drops when the backdrop is off.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose class={buttonVariants({ variant: 'soft' })}>Cancel</AlertDialogClose>
            <AlertDialogClose class={buttonVariants({ variant: 'destructive' })}>Delete</AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Without a frame</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <AlertDialog>
        <AlertDialogTrigger class={buttonVariants({ variant: 'outline' })}>Without a frame</AlertDialogTrigger>
        <AlertDialogContent frame={false}>
          <AlertDialogHeader>
            <AlertDialogTitle>Solid card</AlertDialogTitle>
            <AlertDialogDescription>The glass rim is off; the backdrop still dims the page.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose class={buttonVariants({ variant: 'soft' })}>Cancel</AlertDialogClose>
            <AlertDialogClose class={buttonVariants({ variant: 'destructive' })}>Delete</AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Nested</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Dialog>
        <DialogTrigger class={buttonVariants({ variant: 'outline' })}>Edit post</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
            <DialogDescription>Unsaved edits stay in this dialog until you save or discard them.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p>Closing without saving should ask first. The confirm flattens onto this dialog and hides its extra dim.</p>
          </DialogBody>
          <DialogFooter>
            <AlertDialog>
              <AlertDialogTrigger class={buttonVariants({ variant: 'soft' })}>Discard</AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your edits will be lost. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogClose class={buttonVariants({ variant: 'soft' })}>Keep editing</AlertDialogClose>
                  <AlertDialogClose class={buttonVariants({ variant: 'destructive' })}>Discard</AlertDialogClose>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <DialogClose class={buttonVariants()}>Save</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Scrollable content</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <AlertDialog>
        <AlertDialogTrigger class={buttonVariants({ variant: 'outline' })}>Delete workspace</AlertDialogTrigger>
        <AlertDialogContent class="h-138">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              These projects and their data will be removed with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ScrollArea class="min-h-0 flex-1">
            <ul class="flex flex-col gap-3 px-6 pb-2">
              {#each AFFECTED as item (item.name)}
                <li class="flex flex-col">
                  <span class="text-foreground-intense font-medium">{item.name}</span>
                  <span class="text-foreground-muted text-sm">{item.detail}</span>
                </li>
              {/each}
            </ul>
          </ScrollArea>
          <AlertDialogFooter>
            <AlertDialogClose class={buttonVariants({ variant: 'soft' })}>Cancel</AlertDialogClose>
            <AlertDialogClose class={buttonVariants({ variant: 'destructive' })}>Delete workspace</AlertDialogClose>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
        <AlertDialog>
          <AlertDialogTrigger class={buttonVariants({ variant: 'outline' })}>Delete project</AlertDialogTrigger>
          <AlertDialogContent {dir}>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this project?</AlertDialogTitle>
              <AlertDialogDescription>
                The header, body, and footer flip to read right-to-left, and the actions mirror to the leading edge.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose class={buttonVariants({ variant: 'soft' })}>Cancel</AlertDialogClose>
              <AlertDialogClose class={buttonVariants({ variant: 'destructive' })}>Delete</AlertDialogClose>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DirectionProvider>
  </div>
</section>
