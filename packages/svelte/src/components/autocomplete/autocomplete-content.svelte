<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { Combobox as BitsCombobox } from 'bits-ui'
  import { asBitsAttrs, cn } from '../../internal/utils'
  import { getAutocompleteContext } from './autocomplete-context'

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

  type Side = 'top' | 'bottom' | 'left' | 'right'
  type Align = 'start' | 'center' | 'end'

  type Props = HTMLAttributes<HTMLDivElement> & {
    /**
     * Preferred side of the input to open on.
     * @default 'bottom'
     */
    side?: Side
    /**
     * Gap between the input and the popup.
     * @default 6
     */
    sideOffset?: number
    /** Alignment along that side. */
    align?: Align
    /** Shift along the alignment axis. */
    alignOffset?: number
    /**
     * Keep the popup mounted in the DOM while closed.
     * @default false
     */
    keepMounted?: boolean
    children?: Snippet
  }

  let {
    class: className,
    side = 'bottom',
    sideOffset = 6,
    align,
    alignOffset,
    keepMounted = false,
    children,
    ...rest
  }: Props = $props()

  const ctx = getAutocompleteContext()
  const classes = $derived(
    cn(
      'group/autocomplete-content bg-background border-border-overlay flex flex-col border py-2 shadow-2xl outline-none has-data-empty:py-0',
      POPUP_RADIUS[ctx.size],
      'w-(--bits-combobox-anchor-width) min-w-36',
      'max-h-(--bits-combobox-content-available-height) overflow-hidden',
      'origin-(--bits-combobox-content-transform-origin)',
      'motion-safe:transition-[opacity,scale] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
      'data-[state=closed]:motion-safe:scale-95 data-[state=closed]:motion-safe:opacity-0',
      'data-starting-style:motion-safe:scale-90 data-starting-style:motion-safe:opacity-0',
      'data-ending-style:motion-safe:scale-95 data-ending-style:motion-safe:opacity-0 data-ending-style:motion-safe:duration-100 data-ending-style:motion-safe:ease-out',
      className,
    ),
  )
</script>

<BitsCombobox.Portal>
  <BitsCombobox.Content
    data-slot="autocomplete-content"
    data-empty={ctx.isEmpty() ? '' : undefined}
    class={classes}
    {side}
    {sideOffset}
    {align}
    {alignOffset}
    forceMount={keepMounted ? true : undefined}
    {...asBitsAttrs(rest)}
  >
    <BitsCombobox.ScrollUpButton
      data-slot="autocomplete-scroll-up"
      aria-hidden="true"
      class={cn(SCROLL_ARROW_CLASSES, POPUP_RADIUS[ctx.size], 'top-px rounded-b-none')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class={cn(ICON_SIZE[ctx.size], 'rotate-180')}>
        <path
          d="M11.594 5.594c.225-.225.588-.225.813 0s.225.588 0 .813l-4 4c-.225.225-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812s.588-.225.812 0L8 9.187l3.594-3.594z"
        />
      </svg>
    </BitsCombobox.ScrollUpButton>
    {@render children?.()}
    <BitsCombobox.ScrollDownButton
      data-slot="autocomplete-scroll-down"
      aria-hidden="true"
      class={cn(SCROLL_ARROW_CLASSES, POPUP_RADIUS[ctx.size], 'bottom-px rounded-t-none')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class={ICON_SIZE[ctx.size]}>
        <path
          d="M11.594 5.594c.225-.225.588-.225.813 0s.225.588 0 .813l-4 4c-.225.225-.588.225-.812 0l-4-4c-.225-.225-.225-.588 0-.812s.588-.225.812 0L8 9.187l3.594-3.594z"
        />
      </svg>
    </BitsCombobox.ScrollDownButton>
  </BitsCombobox.Content>
</BitsCombobox.Portal>
