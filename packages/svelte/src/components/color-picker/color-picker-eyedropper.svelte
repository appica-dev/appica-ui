<script lang="ts" module>
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { VariantProps } from 'class-variance-authority'
  import { buttonVariants } from '../button/button-variants'

  export type ColorPickerEyeDropperProps = Omit<HTMLButtonAttributes, 'color'> & {
    /**
     * Visual style, from the same set `Button` offers.
     * @default 'ghost'
     */
    variant?: VariantProps<typeof buttonVariants>['variant']
    /**
     * Height and padding, from the same set `Button` offers.
     * @default 'icon-sm'
     */
    size?: VariantProps<typeof buttonVariants>['size']
    /** Icon rendered inside the button. */
    children?: Snippet
  }
</script>

<script lang="ts">
  import { cn } from '../../internal/utils'
  import { requireColorPickerContext } from '../../internal/color-picker-context.svelte'
  import { safeParseColor, withChannelValue } from '../../lib/color'

  interface EyeDropperApi {
    new (): { open: (options?: { signal?: AbortSignal }) => Promise<{ sRGBHex: string }> }
  }

  let {
    variant = 'ghost',
    size = 'icon-sm',
    class: className,
    disabled,
    children,
    onclick,
    'aria-label': ariaLabel = 'Pick a color from the screen',
    ...rest
  }: ColorPickerEyeDropperProps = $props()

  const picker = requireColorPickerContext('ColorPickerEyeDropper')
  const supported = $derived(typeof window !== 'undefined' && 'EyeDropper' in window)

  const off = $derived(disabled ?? picker.disabled)
  const classes = $derived(
    cn(buttonVariants({ variant, size }), 'text-foreground-muted hover:text-foreground shrink-0', className),
  )

  async function sample() {
    const EyeDropper = (window as unknown as { EyeDropper: EyeDropperApi }).EyeDropper
    let result: { sRGBHex: string }
    try {
      result = await new EyeDropper().open()
    } catch {
      return
    }
    const sampled = safeParseColor(result.sRGBHex)
    if (!sampled) return
    const next = withChannelValue(sampled, 'alpha', picker.value.alpha)
    picker.setValue(next)
    picker.commitValue(next)
  }

  function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(event)
    if (!event.defaultPrevented) void sample()
  }
</script>

{#if supported}
  <button
    type="button"
    aria-label={ariaLabel}
    data-slot="color-picker-eyedropper"
    disabled={off}
    data-disabled={off ? '' : undefined}
    class={classes}
    onclick={handleClick}
    {...rest}
  >
    {#if children}
      {@render children()}
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m2 22 1-1h3l9-9" />
        <path d="M3 21v-3l9-9" />
        <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a1 1 0 1 1 3 3l-3.8-3.8a1 1 0 1 1 3-3l.4.4Z" />
      </svg>
    {/if}
  </button>
{/if}
