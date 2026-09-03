<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { VariantProps } from 'class-variance-authority'
  import { cn } from '../../internal/utils'
  import Button from '../button/button.svelte'
  import { buttonVariants } from '../button/button-variants'

  export type CopyButtonValue = string | HTMLElement | (() => string | Promise<string>)

  type ButtonVariant = VariantProps<typeof buttonVariants>['variant']
  type ButtonSize = VariantProps<typeof buttonVariants>['size']

  export type CopyButtonProps = Omit<HTMLButtonAttributes, 'value'> & {
    /**
     * Visual style.
     * @default 'ghost'
     */
    variant?: ButtonVariant
    /**
     * Height and padding. The `icon-*` sizes are square, for icon-only buttons.
     * @default 'icon-sm'
     */
    size?: ButtonSize
    /**
     * Keep the control reachable by keyboard while disabled.
     * @default false
     */
    focusableWhenDisabled?: boolean
    /**
     * **Required.** What to copy: a string, an element (`bind:this`), or a (possibly async) getter.
     */
    value: CopyButtonValue
    /**
     * How long (ms) the copied state lasts before reverting.
     * @default 2000
     */
    timeout?: number
    /**
     * Accessible name in the idle state.
     * @default 'Copy'
     */
    label?: string
    /**
     * Accessible name after a successful copy; children also swap to this.
     * @default 'Copied'
     */
    copiedLabel?: string
    /** Called with the copied text on success. */
    onCopy?: (value: string) => void
    /** Called if reading the value or writing to the clipboard fails. */
    onCopyError?: (error: unknown) => void
    children?: Snippet
  }

  async function resolveValue(source: CopyButtonValue): Promise<string> {
    if (typeof source === 'string') return source
    if (typeof source === 'function') return await source()
    if (!source) throw new Error('CopyButton: the `value` ref is not attached to an element')
    if (source instanceof HTMLInputElement || source instanceof HTMLTextAreaElement) return source.value
    return source.textContent ?? ''
  }

  async function copyTextToClipboard(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      if (!document.execCommand('copy')) throw new Error('Copying to clipboard is not supported')
    } finally {
      textarea.remove()
    }
  }

  let {
    value,
    timeout = 2000,
    label = 'Copy',
    copiedLabel = 'Copied',
    onCopy,
    onCopyError,
    onclick,
    variant = 'ghost',
    size = 'icon-sm',
    class: className,
    children,
    ...rest
  }: CopyButtonProps = $props()

  let copied = $state(false)
  let resetId: ReturnType<typeof setTimeout> | undefined

  $effect(() => {
    return () => {
      if (resetId !== undefined) clearTimeout(resetId)
    }
  })

  async function handleClick(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    onclick?.(event)
    if (event.defaultPrevented) return
    let text: string
    try {
      text = await resolveValue(value)
      await copyTextToClipboard(text)
    } catch (error) {
      onCopyError?.(error)
      return
    }
    onCopy?.(text)
    copied = true
    if (resetId !== undefined) clearTimeout(resetId)
    resetId = setTimeout(() => {
      copied = false
    }, timeout)
  }
</script>

<Button
  data-slot="copy-button"
  data-copied={copied ? '' : undefined}
  type="button"
  {variant}
  {size}
  aria-label={copied ? copiedLabel : label}
  onclick={handleClick}
  class={cn('group/copy', className)}
  {...rest}
>
  <span data-icon={children != null ? 'start' : undefined} class="grid place-items-center *:[grid-area:1/1]">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class={cn(
        'transition-[opacity,scale] delay-150 duration-150 ease-out group-data-copied/copy:delay-0',
        'group-data-copied/copy:scale-50 group-data-copied/copy:opacity-0',
        'motion-reduce:transition-none',
      )}
    >
      <path
        d="M4.012 16.737c-.307-.175-.562-.427-.739-.732S3.001 15.353 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1M7 9.667c0-.707.281-1.386.781-1.886S8.96 7 9.667 7h8.666c.35 0 .697.069 1.021.203s.618.33.865.578.444.542.578.865A2.67 2.67 0 0 1 21 9.667v8.666a2.67 2.67 0 0 1-.781 1.886 2.67 2.67 0 0 1-1.886.781H9.667a2.67 2.67 0 0 1-1.021-.203c-.324-.134-.618-.331-.865-.578s-.444-.542-.578-.865S7 18.683 7 18.333V9.667z"
      />
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path
        d="M4.3 12.55 L9.25 17.5 L19.7 6.5"
        pathLength="1"
        stroke-dasharray="1 2"
        class={cn(
          '[stroke-dashoffset:1.02] group-data-copied/copy:[stroke-dashoffset:0]',
          'transition-[stroke-dashoffset] duration-200 ease-in',
          'group-data-copied/copy:delay-100 group-data-copied/copy:duration-350 group-data-copied/copy:ease-out',
          'motion-reduce:transition-none',
        )}
      />
    </svg>
  </span>
  {#if children}
    {#if copied}
      {copiedLabel}
    {:else}
      {@render children()}
    {/if}
  {/if}
  <span role="status" class="sr-only">
    {copied ? copiedLabel : ''}
  </span>
</Button>
