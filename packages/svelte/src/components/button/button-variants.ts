import { cva } from 'class-variance-authority'
import { cn } from '../../internal/utils'

const backgroundLayer = [
  'before:pointer-events-none',
  'before:absolute',
  'before:inset-0',
  'before:-z-1',
  'before:rounded-[inherit]',
  'before:transition-[opacity,background-color,border-color]',
  'before:duration-300',
  'motion-reduce:before:transition-none',
]

const buttonVariants = cva(
  "relative isolate inline-flex shrink-0 transform-gpu cursor-pointer items-center justify-center font-medium whitespace-nowrap outline-offset-1 transition duration-250 ease-[cubic-bezier(0.175,0.885,0.32,1.5)] select-none not-data-popup-open:active:scale-[0.97] not-data-popup-open:active:duration-100 not-data-popup-open:active:ease-in-out not-data-popup-open:active:translate-y-px data-disabled:opacity-disabled data-disabled:pointer-events-none motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='stroke-'])]:stroke-[1.85]",
  {
    variants: {
      variant: {
        primary: cn(
          backgroundLayer,
          'text-primary-foreground bg-primary before:bg-[radial-gradient(138.15%_78.13%_at_52.05%_50%,var(--primary)_0%,var(--primary-muted)_80%)] before:opacity-0 hover:before:opacity-100 outline-ring-primary data-popup-open:before:opacity-100 data-pressed:before:opacity-100',
        ),
        'primary-outline': cn(
          backgroundLayer,
          'text-primary before:border before:border-primary hover:text-primary-foreground hover:before:bg-primary outline-ring-primary data-popup-open:before:bg-primary data-pressed:before:bg-primary data-popup-open:text-primary-foreground data-pressed:text-primary-foreground',
        ),
        secondary: cn(
          backgroundLayer,
          'text-secondary-foreground bg-secondary outline-ring-secondary before:bg-[radial-gradient(138.15%_78.13%_at_52.05%_50%,var(--secondary)_0%,var(--secondary-muted)_95%)] before:opacity-0 hover:before:opacity-100 data-popup-open:before:opacity-100 data-pressed:before:opacity-100',
        ),
        soft: cn(
          backgroundLayer,
          'text-foreground-emphasis hover:text-foreground-intense before:bg-background-muted hover:before:bg-background-subtle hover:before:border-border data-popup-open:text-foreground-intense data-pressed:text-foreground-intense data-popup-open:before:bg-background-subtle data-pressed:before:bg-background-subtle data-popup-open:before:border-border data-pressed:before:border-border outline-ring before:border before:border-transparent before:backdrop-blur-md',
        ),
        outline: cn(
          backgroundLayer,
          'bg-background text-foreground-emphasis hover:text-foreground-intense before:bg-background before:border-border hover:before:bg-background-subtle hover:before:border-border-strong data-popup-open:text-foreground-intense data-pressed:text-foreground-intense data-popup-open:before:bg-background-subtle data-pressed:before:bg-background-subtle data-popup-open:before:border-border-strong data-pressed:before:border-border-strong outline-ring before:border',
        ),
        ghost: cn(
          backgroundLayer,
          'text-foreground-emphasis hover:text-foreground-intense hover:before:bg-background-muted data-popup-open:text-foreground-intense data-pressed:text-foreground-intense data-popup-open:before:bg-background-muted data-pressed:before:bg-background-muted outline-ring',
        ),
        destructive: cn(
          backgroundLayer,
          'text-error-foreground bg-error outline-ring-error before:bg-[radial-gradient(138.15%_78.13%_at_52.05%_50%,var(--error)_0%,var(--error-muted)_95%)] before:opacity-0 hover:before:opacity-100 data-popup-open:before:opacity-100 data-pressed:before:opacity-100',
        ),
        light: cn(
          backgroundLayer,
          'text-white before:bg-white/10 before:border-white/10 before:border before:backdrop-blur-md hover:before:bg-white/15 hover:before:border-white/15 outline-ring-light data-popup-open:before:bg-white/15 data-pressed:before:bg-white/15 data-popup-open:before:border-white/15 data-pressed:before:border-white/15',
        ),
      },
      size: {
        sm: "h-8 gap-1 rounded-sm px-4 text-xs has-data-[icon=end]:pe-3 has-data-[icon=start]:ps-3 [&_svg:not([class*='size-'])]:size-4",
        md: "h-10 gap-1.5 rounded-md px-5 text-sm has-data-[icon=end]:pe-3.5 has-data-[icon=start]:ps-3.5 [&_svg:not([class*='size-'])]:size-4.5",
        lg: "h-12 gap-2 rounded-lg px-6 text-base has-data-[icon=end]:pe-4.5 has-data-[icon=start]:ps-4.5 [&_svg:not([class*='size-'])]:size-5",
        'icon-sm': "size-8 rounded-sm [&_svg:not([class*='size-'])]:size-4",
        'icon-md': "size-10 rounded-md [&_svg:not([class*='size-'])]:size-4.5",
        'icon-lg': "size-12 rounded-lg [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export { buttonVariants }
