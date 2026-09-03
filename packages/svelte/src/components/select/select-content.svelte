<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Select as BitsSelect } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getSelectContext } from './select-context'

  const POPUP_RADIUS = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
  } as const

  const ICON_SIZE = {
    sm: 'size-4',
    md: 'size-4.5',
    lg: 'size-5',
  } as const

  const SCROLL_ARROW_CLASSES = cn(
    'bg-background text-foreground z-1 flex h-6 w-[calc(100%-var(--border-width)*2)] cursor-default items-center justify-center',
  )

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** Per-popup override of the root's alignment setting. */
    alignItemWithTrigger?: boolean
    /**
     * Keep the content mounted while closed so enter/exit animations can run.
     * @default false
     */
    keepMounted?: boolean
    children?: Snippet
  }

  let {
    class: className,
    alignItemWithTrigger: alignOverride,
    keepMounted = false,
    children,
    ...rest
  }: Props = $props()

  const ctx = getSelectContext()
  const alignWithTrigger = $derived(alignOverride ?? ctx.alignItemWithTrigger)
  const classes = $derived(
    cn(
      'bg-background border-border-overlay flex flex-col border shadow-2xl outline-none',
      POPUP_RADIUS[ctx.size],
      'min-w-36',
      alignWithTrigger
        ? 'w-[calc(var(--bits-select-anchor-width)+1rem)]'
        : 'w-(--bits-select-anchor-width)',
      alignWithTrigger ? 'origin-center' : 'origin-(--bits-select-content-transform-origin)',
      'motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
      'data-[state=closed]:motion-safe:scale-95 data-[state=closed]:motion-safe:opacity-0',
      'data-starting-style:motion-safe:scale-90 data-starting-style:motion-safe:opacity-0',
      'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
      className,
    ),
  )
</script>

<BitsSelect.Portal>
  <BitsSelect.Content
    data-slot="select-content"
    data-align-trigger={alignWithTrigger || undefined}
    class={classes}
    side="bottom"
    sideOffset={6}
    forceMount={keepMounted ? true : undefined}
    {...asBitsAttrs(rest)}
  >
    <BitsSelect.ScrollUpButton
      data-slot="select-scroll-up"
      aria-hidden="true"
      class={cn(SCROLL_ARROW_CLASSES, POPUP_RADIUS[ctx.size], 'top-px rounded-b-none')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        class={cn(ICON_SIZE[ctx.size], 'rotate-180')}
      >
        <path
          d="M11.594 5.594c.225-.225.588-.225.813 0s.225.588 0 .813l-4 4c-.225.225-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812s.588-.225.812 0L8 9.187l3.594-3.594z"
        />
      </svg>
    </BitsSelect.ScrollUpButton>
    <BitsSelect.Viewport class="flex max-h-(--bits-select-content-available-height) flex-col gap-0.5 overflow-y-auto p-2">
      {@render children?.()}
    </BitsSelect.Viewport>
    <BitsSelect.ScrollDownButton
      data-slot="select-scroll-down"
      aria-hidden="true"
      class={cn(SCROLL_ARROW_CLASSES, POPUP_RADIUS[ctx.size], 'bottom-px rounded-t-none')}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
        class={ICON_SIZE[ctx.size]}
      >
        <path
          d="M11.594 5.594c.225-.225.588-.225.813 0s.225.588 0 .813l-4 4c-.225.225-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812s.588-.225.812 0L8 9.187l3.594-3.594z"
        />
      </svg>
    </BitsSelect.ScrollDownButton>
  </BitsSelect.Content>
</BitsSelect.Portal>
