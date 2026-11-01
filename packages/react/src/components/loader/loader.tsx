'use client'

import * as React from 'react'
import { LazyMotion, domAnimation, m } from 'motion/react'
import { useReducedMotion } from '../../hooks/use-reduced-motion'
import { cn } from '../../internal/utils'

type LoaderVariant = 'bar' | 'dots'

interface LoaderProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /**
   * The animated shape.
   * @default 'bar'
   */
  variant?: LoaderVariant
  /**
   * Inherit the surrounding text color (`currentColor`) instead of the primary accent.
   * @default false
   */
  currentColor?: boolean
}

type VariantColors = { indicator: string; track: string }
type VariantInnerProps = { colors: VariantColors; reduced: boolean }

const LOADER_SIZE = 'text-[2.5rem]'

const PRIMARY_COLORS: VariantColors = { indicator: 'text-primary', track: 'text-primary-soft' }
const CURRENT_COLORS: VariantColors = { indicator: 'text-current', track: 'text-current/20' }

const FLOW_CYCLE = 2.4
const FLOW_CENTER = 14
const FLOW_CX_KEYFRAMES: number[] = [FLOW_CENTER + 14, FLOW_CENTER, FLOW_CENTER - 14]
const FLOW_TIMES: number[] = [0.01, 0.5, 1]
const FLOW_CY = 6
const DOT_R_KEYFRAMES: number[] = [0, 6, 0]

function Dots({ colors, reduced }: VariantInnerProps) {
  return (
    <svg
      width="0.8em"
      height="0.35em"
      viewBox="0 0 28 12"
      fill="currentColor"
      aria-hidden="true"
      className={cn('size-[1em] h-[0.35em]! w-[0.8em]!', colors.indicator)}
    >
      {Array.from({ length: 3 }, (_, i) =>
        reduced ? (
          <circle key={i} cx={4 + i * 10} cy={FLOW_CY} r={4} />
        ) : (
          <m.circle
            key={i}
            cy={FLOW_CY}
            initial={{ cx: FLOW_CX_KEYFRAMES[0], r: 0 }}
            animate={{ cx: FLOW_CX_KEYFRAMES, r: DOT_R_KEYFRAMES }}
            transition={{
              duration: FLOW_CYCLE,
              repeat: Infinity,
              ease: 'linear',
              times: FLOW_TIMES,
              delay: -(0.85 + i) * 1.6,
            }}
          />
        ),
      )}
    </svg>
  )
}

function Bar({ colors, reduced }: VariantInnerProps) {
  const clipId = React.useId()
  return (
    <svg
      width="1.4em"
      height="0.2em"
      viewBox="0 0 44 6"
      fill="currentColor"
      aria-hidden="true"
      className={cn('size-[1em] h-[0.2em]! w-[1.4em]!', colors.indicator)}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={44} height={6} rx={3} />
        </clipPath>
      </defs>
      <rect x={0} y={0} width={44} height={6} rx={3} className={colors.track} />
      <g clipPath={`url(#${clipId})`}>
        {reduced ? (
          <rect x={12} y={0} width={20} height={6} rx={3} />
        ) : (
          <>
            <m.rect
              y={0}
              height={6}
              rx={3}
              initial={{ x: -15.4, width: 15.4 }}
              animate={{
                x: [-15.4, 44, 44],
                width: [15.4, 39.6, 39.6],
              }}
              transition={{
                duration: 2.1,
                repeat: Infinity,
                times: [0, 0.6, 1],
                ease: [0.65, 0.815, 0.735, 0.395],
              }}
            />
            <m.rect
              y={0}
              height={6}
              rx={3}
              initial={{ x: -88, width: 88 }}
              animate={{
                x: [-88, 47.08, 47.08],
                width: [88, 0.44, 0.44],
              }}
              transition={{
                duration: 2.1,
                repeat: Infinity,
                times: [0, 0.6, 1],
                ease: [0.165, 0.84, 0.44, 1],
                delay: 1.15,
              }}
            />
          </>
        )}
      </g>
    </svg>
  )
}

const VARIANT_COMPONENTS: Record<LoaderVariant, React.ComponentType<VariantInnerProps>> = {
  bar: Bar,
  dots: Dots,
}

function Loader({
  variant = 'bar',
  currentColor = false,
  'aria-label': label = 'Loading',
  className,
  ...props
}: LoaderProps) {
  const reduced = useReducedMotion()
  const colors = currentColor ? CURRENT_COLORS : PRIMARY_COLORS
  const Variant = VARIANT_COMPONENTS[variant]

  const inner = <Variant colors={colors} reduced={reduced} />

  return (
    <span
      data-slot="loader"
      role="status"
      className={cn('inline-flex shrink-0 items-center justify-center align-middle', LOADER_SIZE, className)}
      {...props}
    >
      {reduced ? (
        inner
      ) : (
        <LazyMotion features={domAnimation} strict>
          {inner}
        </LazyMotion>
      )}
      <span className="sr-only">{label}</span>
    </span>
  )
}

export { Loader }
export type { LoaderProps }
