import { cva } from 'class-variance-authority'
import { cn } from '../../internal/utils'

export const itemVariants = cva(
  cn(
    'group/accordion-item',
    'has-focus-visible:ring-ring has-focus-visible:ring-3',
    'data-disabled:opacity-disabled data-disabled:pointer-events-none',
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-background-subtle border-border-muted',
          'px-5 pb-5 rounded-xl border backdrop-blur-lg',
          'hover:bg-background-muted data-[state=open]:bg-background-muted',
          'transition-colors duration-300',
          'hover:border-transparent data-[state=open]:border-transparent',
          'motion-reduce:transition-none',
        ),
        alt: cn(
          'bg-background',
          'px-5 pb-5 rounded-xl border border-transparent',
          'hover:border-border data-[state=open]:border-border',
          'transition-colors duration-300',
          'motion-reduce:transition-none',
        ),
        flush: 'pb-3.5',
      },
    },
  },
)

export const triggerVariants = cva(
  cn(
    'text-foreground-intense flex flex-1 cursor-pointer items-start justify-between gap-3.5',
    'text-lg font-medium outline-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    "[&_svg:not([class*='size-'])]:size-5.5",
    "[&_svg:not([class*='stroke-'])]:stroke-[1.85]",
  ),
  {
    variants: {
      variant: {
        default: '-mx-5 -mb-5 p-5',
        alt: '-mx-5 -mb-5 p-5',
        flush: '-mb-3.5 py-3.5',
      },
    },
  },
)

export const iconBoxVariants = cva(
  cn(
    'inline-flex items-center justify-center',
    'size-[1.778em]',
    'rounded-[calc(tan(atan2(var(--radius-sm),2rem))*100%)]',
  ),
  {
    variants: {
      variant: {
        default: 'bg-background border-border border',
        alt: 'bg-background-muted',
        flush: 'bg-background border-border border',
      },
    },
  },
)
