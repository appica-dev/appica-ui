'use client'

import * as React from 'react'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { LazyMotion, domAnimation, m, useAnimate } from 'motion/react'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn, useComposedRefs } from '../../internal/utils'

const SQUISH_TRANSITION = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] satisfies [number, number, number, number],
}

const ZERO_TRANSITION = { duration: 0 } as const

function CheckboxIndicator({
  checked,
  indeterminate,
  reduced,
}: {
  checked: boolean
  indeterminate: boolean
  reduced: boolean
}) {
  const showCheck = checked && !indeterminate
  const showDash = indeterminate

  return (
    <BaseCheckbox.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center" keepMounted>
      <svg
        className="text-primary-foreground size-[1em] min-h-4 min-w-4"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <m.path
          d="M4 8.5l2.5 2.5 5.5-5.5"
          style={{ strokeDasharray: 20 }}
          initial={false}
          animate={{
            strokeDashoffset: showCheck ? 0 : 20,
            opacity: showDash ? 0 : 1,
          }}
          transition={
            reduced
              ? ZERO_TRANSITION
              : {
                  strokeDashoffset: {
                    duration: showCheck ? 0.3 : 0,
                    ease: 'easeOut',
                    delay: showCheck ? 0.15 : 0,
                  },
                  opacity: { duration: 0.1 },
                }
          }
        />
        <m.line
          x1="4"
          y1="8"
          x2="12"
          y2="8"
          initial={false}
          animate={{
            scaleX: showDash ? 1 : 0,
            opacity: showDash ? 1 : 0,
          }}
          transition={
            reduced
              ? ZERO_TRANSITION
              : {
                  scaleX: {
                    duration: showDash ? 0.2 : 0,
                    ease: 'easeOut',
                    delay: showDash ? 0.15 : 0,
                  },
                  opacity: {
                    duration: showDash ? 0.15 : 0,
                    delay: showDash ? 0.2 : 0,
                  },
                }
          }
        />
      </svg>
    </BaseCheckbox.Indicator>
  )
}

function CheckboxRoot({
  renderProps,
  state,
  reduced,
}: {
  renderProps: React.ComponentPropsWithRef<'span'>
  state: { checked: boolean; indeterminate: boolean }
  reduced: boolean
}) {
  const { checked, indeterminate } = state
  const { ref, ...htmlProps } = renderProps
  const [scope, animate] = useAnimate()
  const composedRef = useComposedRefs(ref, scope)

  const prevState = React.useRef({ checked, indeterminate })
  React.useEffect(() => {
    const toggled = prevState.current.checked !== checked || prevState.current.indeterminate !== indeterminate
    prevState.current = { checked, indeterminate }
    if (toggled && !reduced) {
      animate(scope.current, { scale: [1, 0.8, 1.1, 1] }, SQUISH_TRANSITION)
    }
  }, [checked, indeterminate, animate, scope, reduced])

  return (
    <span data-slot="checkbox" {...htmlProps} ref={composedRef}>
      <CheckboxIndicator checked={checked} indeterminate={indeterminate} reduced={reduced} />
    </span>
  )
}

type CheckboxProps = React.ComponentProps<typeof BaseCheckbox.Root>

function Checkbox({ className, ...props }: CheckboxProps) {
  const reduced = useReducedMotion()

  const ariaInvalid = props['aria-invalid']
  const invalid = ariaInvalid === true || ariaInvalid === 'true'

  return (
    <LazyMotion features={domAnimation} strict>
      <BaseCheckbox.Root
        {...props}
        {...(invalid ? { 'data-invalid': '' } : {})}
        className={cn(
          'flex size-[1em] min-h-4 min-w-4 shrink-0 cursor-default items-center justify-center',
          'bg-background border-border-strong outline-ring-input rounded-[calc(tan(atan2(var(--radius-3xs),1rem))*100%)] border',
          'transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none',
          'hover:not-data-checked:not-data-indeterminate:not-data-disabled:not-data-invalid:border-border-emphasis',
          'focus-visible:border-transparent!',
          'data-checked:bg-primary data-checked:outline-ring-primary data-checked:border-transparent',
          'data-indeterminate:bg-primary data-indeterminate:outline-ring-primary data-indeterminate:border-transparent',
          'data-disabled:not-data-checked:not-data-indeterminate:bg-background-subtle data-disabled:data-checked:opacity-disabled data-disabled:data-indeterminate:opacity-disabled data-disabled:cursor-not-allowed data-disabled:not-data-checked:not-data-indeterminate:border-dashed data-disabled:not-data-checked:not-data-indeterminate:backdrop-blur-md',
          'data-invalid:border-error data-invalid:not-data-checked:not-data-indeterminate:bg-error-subtle data-invalid:outline-ring-error',
          className,
        )}
        render={(renderProps, state) => <CheckboxRoot renderProps={renderProps} state={state} reduced={reduced} />}
      />
    </LazyMotion>
  )
}

export { Checkbox }
export type { CheckboxProps }
