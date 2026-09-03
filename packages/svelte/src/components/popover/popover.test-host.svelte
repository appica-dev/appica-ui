<script lang="ts">
  import { buttonVariants } from '../button/button-variants'
  import Popover from './popover.svelte'
  import PopoverTrigger from './popover-trigger.svelte'
  import PopoverContent from './popover-content.svelte'
  import PopoverTitle from './popover-title.svelte'
  import PopoverDescription from './popover-description.svelte'
  import PopoverClose from './popover-close.svelte'

  let {
    title = 'Notifications',
    description = 'You are all caught up.',
    arrow = true,
    keepMounted = false,
  }: {
    title?: string
    description?: string
    arrow?: boolean
    keepMounted?: boolean
  } = $props()
</script>

<Popover>
  <PopoverTrigger class={buttonVariants({ variant: 'outline' })}>Open</PopoverTrigger>
  <PopoverContent {arrow} {keepMounted}>
    <PopoverTitle>{title}</PopoverTitle>
    <PopoverDescription>{description}</PopoverDescription>
    <PopoverClose class={buttonVariants({ variant: 'primary', size: 'sm' })}>Dismiss</PopoverClose>
  </PopoverContent>
</Popover>
