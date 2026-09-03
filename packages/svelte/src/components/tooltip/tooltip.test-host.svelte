<script lang="ts">
  import { buttonVariants } from '../button/button-variants'
  import Tooltip from './tooltip.svelte'
  import TooltipTrigger from './tooltip-trigger.svelte'
  import TooltipContent from './tooltip-content.svelte'
  import TooltipProvider from './tooltip-provider.svelte'

  let {
    delay = 0,
    arrow = true,
    content = 'Add to library',
  }: {
    delay?: number
    arrow?: boolean
    content?: string
  } = $props()
</script>

<TooltipProvider {delay}>
  <Tooltip>
    <TooltipTrigger class={buttonVariants({ variant: 'outline' })}>Hover</TooltipTrigger>
    <TooltipContent {arrow}>
      <p>{content}</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
