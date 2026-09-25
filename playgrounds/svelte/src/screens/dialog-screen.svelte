<script lang="ts">
  import { Folder, Trash } from '@appica/icons-svelte'
  import {
    Badge,
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
    Field,
    FieldLabel,
    Input,
    ScrollArea,
    Switch,
    Textarea,
    Thumbnail,
    buttonVariants,
  } from '@appica/ui-svelte'

  const SIZES = [
    { label: 'Small', className: 'sm:w-100', width: '400px' },
    { label: 'Default', className: undefined, width: '600px' },
    { label: 'Large', className: 'sm:w-200', width: '800px' },
  ] as const

  const SECTIONS = [
    {
      title: '1. Acceptance of terms',
      body: 'By accessing or using the service you agree to be bound by these terms. If you are entering into this agreement on behalf of a company, you represent that you have the authority to bind that entity.',
    },
    {
      title: '2. Accounts',
      body: 'You are responsible for safeguarding the credentials you use to access the service and for any activity under your account. Notify us immediately of any unauthorized use.',
    },
    {
      title: '3. Acceptable use',
      body: 'You agree not to misuse the service: no probing, scanning, or testing the vulnerability of any system, and no interfering with or disrupting the integrity or performance of the service.',
    },
    {
      title: '4. Content',
      body: 'You retain ownership of the content you submit. By submitting content you grant us a worldwide, non-exclusive license to host and display it solely to operate and improve the service.',
    },
    {
      title: '5. Subscriptions',
      body: 'Paid plans renew automatically at the end of each billing cycle unless canceled beforehand. Fees are non-refundable except where required by law.',
    },
    {
      title: '6. Termination',
      body: 'We may suspend or terminate your access if you breach these terms. You may stop using the service at any time; certain provisions survive termination.',
    },
    {
      title: '7. Disclaimers',
      body: 'The service is provided "as is" without warranties of any kind, whether express or implied, including merchantability, fitness for a particular purpose, and non-infringement.',
    },
    {
      title: '8. Changes',
      body: 'We may revise these terms from time to time. Material changes will be communicated in advance, and continued use after they take effect constitutes acceptance.',
    },
  ]

  let displayName = $state('Sarah Jenkins')
  let email = $state('sarah@appica.dev')
  let bio = $state('Product designer focused on design systems and accessibility.')
  let currentPassword = $state('opensesame')
  let newPassword = $state('correct-horse')

  let open = $state(false)
  let step = $state(0)
  let name = $state('')
  let description = $state('')
  let project = $state<{ name: string; description: string } | null>(null)

  let dir: 'ltr' | 'rtl' = $state('ltr')

  function handleOpenChange(next: boolean) {
    open = next
    if (!next) {
      step = 0
      name = ''
      description = ''
    }
  }
</script>

{#snippet folderIcon()}
  <Folder />
{/snippet}

{#snippet trashIcon()}
  <Trash />
{/snippet}

<section class="flex flex-col gap-8">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Dialog</h2>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Usage</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Dialog>
        <DialogTrigger class={buttonVariants({ variant: 'outline' })}>Invite people</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite your team</DialogTitle>
            <DialogDescription>Send an invitation by email.</DialogDescription>
          </DialogHeader>
          <DialogBody>form, content, …</DialogBody>
          <DialogFooter>
            <DialogClose class={buttonVariants({ variant: 'outline' })}>Cancel</DialogClose>
            <DialogClose class={buttonVariants()}>Send invites</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Form dialog</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Dialog>
        <DialogTrigger class={buttonVariants({ variant: 'outline' })}>Edit profile</DialogTrigger>
        <DialogContent class="sm:w-110">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Update how you appear across the workspace. Changes are visible to your team.
            </DialogDescription>
          </DialogHeader>
          <DialogBody class="flex flex-col gap-4">
            <Field>
              <FieldLabel>Display name</FieldLabel>
              <Input bind:value={displayName} />
            </Field>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" bind:value={email} />
            </Field>
            <Field>
              <FieldLabel>Bio</FieldLabel>
              <Textarea rows={3} bind:value={bio} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose class={buttonVariants({ variant: 'soft' })}>Cancel</DialogClose>
            <DialogClose class={buttonVariants()}>Save changes</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Sizing</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      {#each SIZES as { label, className, width } (label)}
        <Dialog>
          <DialogTrigger class={buttonVariants({ variant: 'outline' })}>{label}</DialogTrigger>
          <DialogContent class={className}>
            <DialogHeader>
              <DialogTitle>{label} dialog</DialogTitle>
              <DialogDescription>
                {#if className}
                  Set on <code>DialogContent</code> with <code>class="{className}"</code> ({width}).
                {:else}
                  The default width is {width}; no class needed.
                {/if}
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p>
                Widths are responsive - every dialog also carries <code>max-w-full</code>, so it shrinks to fit narrow
                screens instead of overflowing.
              </p>
            </DialogBody>
            <DialogFooter>
              <DialogClose class={buttonVariants({ variant: 'outline' })}>Close</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Scrollable content</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Dialog>
        <DialogTrigger class={buttonVariants({ variant: 'outline' })}>Review terms</DialogTrigger>
        <DialogContent class="h-138 sm:w-130">
          <DialogHeader>
            <DialogTitle>Terms of Service</DialogTitle>
            <DialogDescription>Last updated June 27, 2026</DialogDescription>
          </DialogHeader>
          <ScrollArea class="min-h-0 flex-1">
            <div class="flex flex-col gap-5 px-6 pb-2">
              {#each SECTIONS as section (section.title)}
                <section class="flex flex-col gap-1.5">
                  <h3 class="text-foreground-intense font-medium">{section.title}</h3>
                  <p>{section.body}</p>
                </section>
              {/each}
            </div>
          </ScrollArea>
          <DialogFooter>
            <DialogClose class={buttonVariants({ variant: 'outline' })}>Decline</DialogClose>
            <DialogClose class={buttonVariants()}>Accept</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Nested dialogs</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Dialog>
        <DialogTrigger class={buttonVariants({ variant: 'outline' })}>Account settings</DialogTrigger>
        <DialogContent class="sm:w-110">
          <DialogHeader>
            <DialogTitle>Account & security</DialogTitle>
            <DialogDescription>Manage how you sign in and keep your account safe.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div class="border-border-muted flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
              <div class="flex min-w-0 flex-col">
                <span class="text-foreground-intense font-medium">Email</span>
                <span class="truncate text-sm">ada@appica.dev</span>
              </div>
            </div>
            <div class="border-border-muted flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
              <div class="flex min-w-0 flex-col">
                <span class="text-foreground-intense font-medium">Password</span>
                <span class="truncate text-sm">Last changed 3 months ago</span>
              </div>
              <Dialog>
                <DialogTrigger class={buttonVariants({ variant: 'soft' })}>Change</DialogTrigger>
                <DialogContent class="sm:w-110">
                  <DialogHeader>
                    <DialogTitle>Change password</DialogTitle>
                    <DialogDescription>Use at least 8 characters, including a number.</DialogDescription>
                  </DialogHeader>
                  <DialogBody class="flex flex-col gap-4">
                    <Field>
                      <FieldLabel>Current password</FieldLabel>
                      <Input type="password" autocomplete="new-password" bind:value={currentPassword} />
                    </Field>
                    <Field>
                      <FieldLabel>New password</FieldLabel>
                      <Input type="password" autocomplete="new-password" bind:value={newPassword} />
                    </Field>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose class={buttonVariants({ variant: 'soft' })}>Cancel</DialogClose>
                    <DialogClose class={buttonVariants()}>Update password</DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div class="border-border-muted flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
              <div class="flex min-w-0 flex-col">
                <span class="text-foreground-intense font-medium">Two-factor auth</span>
                <span class="truncate text-sm"><Badge variant="success">Enabled</Badge></span>
              </div>
            </div>
            <div class="border-border-muted flex items-center justify-between gap-4 border-b py-3 last:border-b-0">
              <div class="flex min-w-0 flex-col">
                <span class="text-foreground-intense font-medium">Active sessions</span>
                <span class="truncate text-sm">2 devices</span>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose class={buttonVariants()}>Done</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>

  <div class="flex flex-col gap-3">
    <p class="text-foreground-muted text-sm">Controlled</p>
    <div class="flex flex-wrap items-center justify-center gap-3">
      {#if project}
        <div class="border-border bg-background flex w-full max-w-80 items-center gap-3 rounded-xl border p-3">
          <Thumbnail variant="icon-soft" size="sm">
            {@render folderIcon()}
          </Thumbnail>
          <div class="flex min-w-0 flex-col">
            <span class="text-foreground-intense -mb-0.5 truncate font-medium">{project.name}</span>
            <span class="text-foreground-muted truncate text-sm">{project.description || 'No description'}</span>
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            class="ms-auto shrink-0"
            aria-label={`Delete ${project.name}`}
            onclick={() => (project = null)}
          >
            {@render trashIcon()}
          </Button>
        </div>
      {:else}
        <Dialog {open} onOpenChange={handleOpenChange}>
          <DialogTrigger class={buttonVariants({ variant: 'outline' })}>Create project</DialogTrigger>
          <DialogContent class="sm:w-105">
            <DialogHeader>
              <DialogTitle>{step === 0 ? 'Name your project' : 'Add a description'}</DialogTitle>
              <DialogDescription>Step {step + 1} of 2 - you can change this later.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              {#if step === 0}
                <Field>
                  <FieldLabel>Project name</FieldLabel>
                  <Input autofocus bind:value={name} placeholder="Orbit" />
                </Field>
              {:else}
                <Field>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea autofocus rows={3} bind:value={description} placeholder="What is this project about?" />
                </Field>
              {/if}
            </DialogBody>
            <DialogFooter>
              {#if step === 0}
                <DialogClose class={buttonVariants({ variant: 'soft' })}>Cancel</DialogClose>
                <Button disabled={!name.trim()} onclick={() => (step = 1)}>Next</Button>
              {:else}
                <Button variant="soft" onclick={() => (step = 0)}>Back</Button>
                <Button
                  onclick={() => {
                    project = { name: name.trim(), description: description.trim() }
                    handleOpenChange(false)
                  }}
                >
                  Create project
                </Button>
              {/if}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      {/if}
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
        <Dialog>
          <DialogTrigger class={buttonVariants({ variant: 'outline' })}>Invite people</DialogTrigger>
          <DialogContent {dir}>
            <DialogHeader>
              <DialogTitle>Invite your team</DialogTitle>
              <DialogDescription>The header, body, and footer flip to read right-to-left.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p>The corner close button moves to the opposite corner.</p>
            </DialogBody>
            <DialogFooter>
              <DialogClose class={buttonVariants({ variant: 'outline' })}>Cancel</DialogClose>
              <DialogClose class={buttonVariants()}>Send invites</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DirectionProvider>
  </div>
</section>
