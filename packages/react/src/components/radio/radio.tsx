'use client'

import * as React from 'react'
import { Radio as BaseRadio } from '@base-ui/react/radio'
import { LazyMotion, domAnimation, m, useAnimate } from 'motion/react'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn, useComposedRefs } from '../../internal/utils'

const SQUISH_TRANSITION = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] satisfies [number, number, number, number],
}

const INDICATOR_TRANSITION = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] satisfies [number, number, number, number],
}

const ZERO_TRANSITION = { duration: 0 } as const

function RadioIndicator({ checked, reduced }: { checked: boolean; reduced: boolean }) {
  return (
    <BaseRadio.Indicator data-slot="radio-indicator" className="flex items-center justify-center" keepMounted>
      <m.span
        className="bg-primary-foreground size-[0.5em] min-h-2 min-w-2 rounded-full"
        initial={false}
        animate={{ scale: checked ? 1 : 0 }}
        transition={reduced ? ZERO_TRANSITION : INDICATOR_TRANSITION}
      />
    </BaseRadio.Indicator>
  )
}

function RadioRoot({
  renderProps,
  state,
  reduced,
}: {
  renderProps: React.ComponentPropsWithRef<'span'>
  state: { checked: boolean }
  reduced: boolean
}) {
  const { checked } = state
  const { ref, ...htmlProps } = renderProps
  const [scope, animate] = useAnimate()
  const composedRef = useComposedRefs(ref, scope)

  const prevChecked = React.useRef(checked)
  React.useEffect(() => {
    const toggled = prevChecked.current !== checked
    prevChecked.current = checked
    if (toggled && !reduced) {
      animate(scope.current, { scale: [1, 0.8, 1.1, 1] }, SQUISH_TRANSITION)
    }
  }, [checked, animate, scope, reduced])

  return (
    <span data-slot="radio" {...htmlProps} ref={composedRef}>
      <RadioIndicator checked={checked} reduced={reduced} />
    </span>
  )
}

type RadioProps = React.ComponentProps<typeof BaseRadio.Root>

function Radio({ className, ...props }: RadioProps) {
  const reduced = useReducedMotion()

  const ariaInvalid = props['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  return (
    <LazyMotion features={domAnimation} strict>
      <BaseRadio.Root
        {...props}
        {...(invalid ? { 'data-invalid': '' } : {})}
        className={cn(
          'flex size-[1em] min-h-4 min-w-4 shrink-0 cursor-default items-center justify-center',
          'bg-background border-border-strong outline-ring-input rounded-full border outline-offset-1',
          'transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none',
          'hover:not-data-checked:not-data-disabled:not-data-invalid:border-border-emphasis',
          'data-checked:bg-primary data-checked:outline-ring-primary data-checked:border-transparent',
          'data-disabled:not-data-checked:bg-background-subtle data-disabled:data-checked:opacity-disabled data-disabled:cursor-not-allowed data-disabled:not-data-checked:border-dashed data-disabled:not-data-checked:backdrop-blur-md',
          'data-invalid:border-error data-invalid:not-data-checked:bg-error-subtle data-invalid:outline-ring-error',
          className,
        )}
        render={(renderProps, state) => <RadioRoot renderProps={renderProps} state={state} reduced={reduced} />}
      />
    </LazyMotion>
  )
}

export { Radio }
export type { RadioProps }
