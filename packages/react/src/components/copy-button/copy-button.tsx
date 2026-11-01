'use client'

import * as React from 'react'
import { cn } from '../../internal/utils'
import { Button, type ButtonProps } from '../button/button'

const CHECK_PATH = 'M4.3 12.55 L9.25 17.5 L19.7 6.5'

const ICON_SVG_PROPS = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} satisfies React.SVGProps<SVGSVGElement>

type CopyButtonValue = string | React.RefObject<HTMLElement | null> | (() => string | Promise<string>)

async function resolveValue(value: CopyButtonValue): Promise<string> {
  if (typeof value === 'string') return value
  if (typeof value === 'function') return await value()
  const element = value.current
  if (!element) throw new Error('CopyButton: the `value` ref is not attached to an element')
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) return element.value
  return element.textContent ?? ''
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

interface CopyButtonProps extends Omit<ButtonProps, 'value' | 'onCopy'> {
  /** **Required.** What to copy: a string, an element ref (its value/textContent), or a (possibly async) getter. */
  value: CopyButtonValue
  /**
   * How long (ms) the copied state lasts before reverting.
   * @default 2000
   */
  timeout?: number
  /**
   * Accessible name of an icon-only button in the idle state. Visible children name the button instead.
   * @default 'Copy'
   */
  label?: string
  /**
   * Announced after a successful copy, and names an icon-only button until it reverts; a string child also swaps to this.
   * @default 'Copied'
   */
  copiedLabel?: string
  /** Called with the copied text on success. */
  onCopy?: (value: string) => void
  /** Called if reading the value or writing to the clipboard fails. */
  onCopyError?: (error: unknown) => void
  /** Icon shown at rest, cross-faded to the drawn check after a copy. Defaults to a built-in copy glyph. */
  icon?: React.ReactNode
}

function CopyButton({
  value,
  timeout = 2000,
  label = 'Copy',
  copiedLabel = 'Copied',
  onCopy,
  onCopyError,
  icon,
  onClick,
  variant = 'ghost',
  size = 'icon-sm',
  className,
  children,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const resetRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => () => clearTimeout(resetRef.current), [])

  const handleClick: ButtonProps['onClick'] = async (event) => {
    onClick?.(event)
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
    setCopied(true)
    clearTimeout(resetRef.current)
    resetRef.current = setTimeout(() => setCopied(false), timeout)
  }

  const iconOnly = React.Children.toArray(children).length === 0

  return (
    <>
      {/* First, so last-child rules (`space-x-*`, `divide-*`) still see the button as last, and
          `!important`, so a parent's `*:` utilities (ButtonGroup's `*:relative`) can't pull it into flow. */}
      <span role="status" className="sr-only!">
        {copied ? copiedLabel : ''}
      </span>
      <Button
        data-slot="copy-button"
        data-copied={copied || undefined}
        type="button"
        variant={variant}
        size={size}
        aria-label={iconOnly ? (copied ? copiedLabel : label) : undefined}
        onClick={handleClick}
        className={cn('group/copy', className)}
        {...props}
      >
        <span data-icon={children != null ? 'start' : undefined} className="grid place-items-center *:[grid-area:1/1]">
          <span
            className={cn(
              'grid place-items-center transition-[opacity,scale] delay-150 duration-150 ease-out group-data-copied/copy:delay-0',
              'group-data-copied/copy:scale-50 group-data-copied/copy:opacity-0',
              'motion-reduce:transition-none',
            )}
          >
            {icon ?? (
              <svg {...ICON_SVG_PROPS}>
                <path d="M4.012 16.737c-.307-.175-.562-.427-.739-.732S3.001 15.353 3 15V5c0-1.1.9-2 2-2h10c.75 0 1.158.385 1.5 1M7 9.667c0-.707.281-1.386.781-1.886S8.96 7 9.667 7h8.666c.35 0 .697.069 1.021.203s.618.33.865.578.444.542.578.865A2.67 2.67 0 0 1 21 9.667v8.666a2.67 2.67 0 0 1-.781 1.886 2.67 2.67 0 0 1-1.886.781H9.667a2.67 2.67 0 0 1-1.021-.203c-.324-.134-.618-.331-.865-.578s-.444-.542-.578-.865S7 18.683 7 18.333V9.667z" />
              </svg>
            )}
          </span>
          <svg {...ICON_SVG_PROPS}>
            <path
              d={CHECK_PATH}
              pathLength={1}
              strokeDasharray="1 2"
              className={cn(
                '[stroke-dashoffset:1.02] group-data-copied/copy:[stroke-dashoffset:0]',
                'transition-[stroke-dashoffset] duration-200 ease-in',
                'group-data-copied/copy:delay-100 group-data-copied/copy:duration-350 group-data-copied/copy:ease-out',
                'motion-reduce:transition-none',
              )}
            />
          </svg>
        </span>
        {typeof children === 'string' && copied ? copiedLabel : children}
      </Button>
    </>
  )
}

export { CopyButton }
export type { CopyButtonProps }
