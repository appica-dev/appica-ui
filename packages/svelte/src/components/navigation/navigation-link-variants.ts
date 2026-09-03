import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'

const base = [
  'relative inline-flex items-center gap-1.5 transform-gpu cursor-pointer font-medium outline-none',
  'transition duration-250 ease-[cubic-bezier(0.175,0.885,0.32,1.5)]',
  'select-none not-data-popup-open:active:scale-[0.97] not-data-popup-open:active:duration-100 not-data-popup-open:active:ease-in-out not-data-popup-open:active:translate-y-px',
  'data-disabled:opacity-disabled data-disabled:pointer-events-none',
  'group-data-disabled/submenu-trigger:opacity-disabled group-data-disabled/submenu-trigger:pointer-events-none',
  'motion-reduce:transition-none',
  'data-[orientation=vertical]:text-start',
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='stroke-'])]:stroke-[1.85]",
]

const sharedColors = [
  'text-foreground-strong hover:text-foreground-intense focus-visible:text-foreground-intense',
  'data-active:text-foreground-intense data-popup-open:text-foreground-intense data-pressed:text-foreground-intense',
]
const pill = [
  ...sharedColors,
  'before:pointer-events-none before:absolute before:inset-0 before:-z-1 before:rounded-[inherit]',
  'before:transition-colors before:duration-300',
  'motion-reduce:before:transition-none',
  'hover:before:bg-background-muted focus-visible:before:bg-background-muted',
  'data-active:before:bg-background-muted',
  'data-popup-open:before:bg-background-muted data-pressed:before:bg-background-muted',
  'data-highlighted:not-data-disabled:text-foreground-intense',
  'data-highlighted:not-data-disabled:before:bg-background-muted',
  'group-data-highlighted/submenu-trigger:not-data-disabled:text-foreground-intense',
  'group-data-highlighted/submenu-trigger:not-data-disabled:before:bg-background-muted',
  'group-data-popup-open/submenu-trigger:not-data-disabled:text-foreground-intense',
  'group-data-popup-open/submenu-trigger:not-data-disabled:before:bg-background-muted',
]

const line = [
  ...sharedColors,
  'after:absolute after:rounded-full after:bg-no-repeat',
  'after:[background-image:linear-gradient(0deg,currentColor,currentColor)]',
  'after:transition-[background-size] after:duration-300',
  'motion-reduce:after:transition-none',

  'data-[orientation=horizontal]:after:inset-x-0',
  'data-[orientation=horizontal]:after:h-0.5',
  'data-[orientation=horizontal]:after:bg-size-[0_2px]',
  'ltr:data-[orientation=horizontal]:after:bg-right rtl:data-[orientation=horizontal]:after:bg-left',
  'hover:data-[orientation=horizontal]:after:bg-size-[100%_2px] focus-visible:data-[orientation=horizontal]:after:bg-size-[100%_2px]',
  'ltr:hover:data-[orientation=horizontal]:after:bg-left rtl:hover:data-[orientation=horizontal]:after:bg-right',
  'ltr:focus-visible:data-[orientation=horizontal]:after:bg-left rtl:focus-visible:data-[orientation=horizontal]:after:bg-right',
  'data-active:data-[orientation=horizontal]:after:bg-size-[100%_2px]',
  'ltr:data-active:data-[orientation=horizontal]:after:bg-left rtl:data-active:data-[orientation=horizontal]:after:bg-right',
  'data-popup-open:data-[orientation=horizontal]:after:bg-size-[100%_2px]',
  'ltr:data-popup-open:data-[orientation=horizontal]:after:bg-left rtl:data-popup-open:data-[orientation=horizontal]:after:bg-right',
  'data-pressed:data-[orientation=horizontal]:after:bg-size-[100%_2px]',
  'ltr:data-pressed:data-[orientation=horizontal]:after:bg-left rtl:data-pressed:data-[orientation=horizontal]:after:bg-right',

  'data-[orientation=vertical]:after:inset-s-0 data-[orientation=vertical]:after:top-[25%] data-[orientation=vertical]:after:bottom-[25%]',
  'data-[orientation=vertical]:after:w-0.5',
  'data-[orientation=vertical]:after:bg-size-[2px_0]',
  'data-[orientation=vertical]:after:[background-position-y:bottom]',
  'hover:data-[orientation=vertical]:after:bg-size-[2px_100%] hover:data-[orientation=vertical]:after:[background-position-y:top]',
  'focus-visible:data-[orientation=vertical]:after:bg-size-[2px_100%] focus-visible:data-[orientation=vertical]:after:[background-position-y:top]',
  'data-active:data-[orientation=vertical]:after:bg-size-[2px_100%] data-active:data-[orientation=vertical]:after:[background-position-y:top]',
  'data-popup-open:data-[orientation=vertical]:after:bg-size-[2px_100%] data-popup-open:data-[orientation=vertical]:after:[background-position-y:top]',
  'data-pressed:data-[orientation=vertical]:after:bg-size-[2px_100%] data-pressed:data-[orientation=vertical]:after:[background-position-y:top]',
]

const indicator = [
  ...sharedColors,
  'max-w-full',
  '**:data-[slot=navigation-link-indicator]:inline-flex',
  '**:data-[slot=navigation-link-indicator]:items-center',
  '**:data-[slot=navigation-link-indicator]:justify-center',
  '**:data-[slot=navigation-link-indicator]:overflow-hidden',
  '**:data-[slot=navigation-link-indicator]:shrink-0',
  '**:data-[slot=navigation-link-indicator]:w-0',
  '**:data-[slot=navigation-link-indicator]:opacity-0',
  'rtl:**:data-[slot=navigation-link-indicator]:rotate-180',
  '**:data-[slot=navigation-link-indicator]:transition-[width,opacity]',
  '**:data-[slot=navigation-link-indicator]:duration-250',
  '**:data-[slot=navigation-link-indicator]:ease-out',
  'motion-reduce:**:data-[slot=navigation-link-indicator]:transition-none',
  'hover:**:data-[slot=navigation-link-indicator]:opacity-100 focus-visible:**:data-[slot=navigation-link-indicator]:opacity-100',
  'data-active:**:data-[slot=navigation-link-indicator]:opacity-100',
  '**:data-[slot=navigation-link-label]:flex-1',
  '**:data-[slot=navigation-link-label]:min-w-0',
  '**:data-[slot=navigation-link-label]:truncate',
]

const navigationLinkVariants = cva(cn(base), {
  variants: {
    variant: {
      pill: cn(pill),
      line: cn(line),
      indicator: cn(indicator),
    },
    size: {
      sm: "text-xs [&_svg:not([class*='size-'])]:size-4",
      md: "text-sm [&_svg:not([class*='size-'])]:size-4.5",
      lg: "text-base [&_svg:not([class*='size-'])]:size-5",
    },
  },
  compoundVariants: [
    {
      variant: 'pill',
      size: 'sm',
      class: cn(
        'data-[orientation=horizontal]:rounded-sm data-[orientation=horizontal]:py-2 data-[orientation=horizontal]:px-3 data-[orientation=horizontal]:has-data-[icon=end]:pe-2 data-[orientation=horizontal]:has-data-[icon=start]:ps-2',
        'data-[orientation=vertical]:rounded-xs data-[orientation=vertical]:py-1.5 data-[orientation=vertical]:px-2.5 data-[orientation=vertical]:has-data-[icon=end]:pe-1.5 data-[orientation=vertical]:has-data-[icon=start]:ps-1.5',
        'in-aria-[orientation=vertical]:rounded-xs in-aria-[orientation=vertical]:py-1.5 in-aria-[orientation=vertical]:px-2.5 in-aria-[orientation=vertical]:has-data-[icon=end]:pe-1.5 in-aria-[orientation=vertical]:has-data-[icon=start]:ps-1.5',
      ),
    },
    {
      variant: 'pill',
      size: 'md',
      class: cn(
        'data-[orientation=horizontal]:rounded-md data-[orientation=horizontal]:py-2.5 data-[orientation=horizontal]:px-3.5 data-[orientation=horizontal]:has-data-[icon=end]:pe-2.5 data-[orientation=horizontal]:has-data-[icon=start]:ps-2.5',
        'data-[orientation=vertical]:rounded-sm data-[orientation=vertical]:py-2 data-[orientation=vertical]:px-3 data-[orientation=vertical]:has-data-[icon=end]:pe-2 data-[orientation=vertical]:has-data-[icon=start]:ps-2',
        'in-aria-[orientation=vertical]:rounded-sm in-aria-[orientation=vertical]:py-2 in-aria-[orientation=vertical]:px-3 in-aria-[orientation=vertical]:has-data-[icon=end]:pe-2 in-aria-[orientation=vertical]:has-data-[icon=start]:ps-2',
      ),
    },
    {
      variant: 'pill',
      size: 'lg',
      class: cn(
        'data-[orientation=horizontal]:rounded-lg data-[orientation=horizontal]:py-3 data-[orientation=horizontal]:px-4 data-[orientation=horizontal]:has-data-[icon=end]:pe-3 data-[orientation=horizontal]:has-data-[icon=start]:ps-3',
        'data-[orientation=vertical]:rounded-md data-[orientation=vertical]:py-2.5 data-[orientation=vertical]:px-3.5 data-[orientation=vertical]:has-data-[icon=end]:pe-2.5 data-[orientation=vertical]:has-data-[icon=start]:ps-2.5',
        'in-aria-[orientation=vertical]:rounded-md in-aria-[orientation=vertical]:py-2.5 in-aria-[orientation=vertical]:px-3.5 in-aria-[orientation=vertical]:has-data-[icon=end]:pe-2.5 in-aria-[orientation=vertical]:has-data-[icon=start]:ps-2.5',
      ),
    },
    {
      variant: 'line',
      size: 'sm',
      class: cn(
        'data-[orientation=horizontal]:py-2',
        'data-[orientation=vertical]:py-1.5 data-[orientation=vertical]:ps-2.5',
        'data-[orientation=vertical]:has-data-[icon=end]:pe-1.5 data-[orientation=vertical]:has-data-[icon=start]:ps-1.5',
        'data-[orientation=horizontal]:after:bottom-1',
      ),
    },
    {
      variant: 'line',
      size: 'md',
      class: cn(
        'data-[orientation=horizontal]:py-2.5',
        'data-[orientation=vertical]:py-2 data-[orientation=vertical]:ps-3',
        'data-[orientation=vertical]:has-data-[icon=end]:pe-2 data-[orientation=vertical]:has-data-[icon=start]:ps-2.5',
        'data-[orientation=horizontal]:after:bottom-1.5',
      ),
    },
    {
      variant: 'line',
      size: 'lg',
      class: cn(
        'data-[orientation=horizontal]:py-3',
        'data-[orientation=vertical]:py-2.5 data-[orientation=vertical]:ps-3.5',
        'data-[orientation=vertical]:has-data-[icon=end]:pe-2.5 data-[orientation=vertical]:has-data-[icon=start]:ps-2.5',
        'data-[orientation=horizontal]:after:bottom-2',
      ),
    },
    {
      variant: 'indicator',
      size: 'sm',
      class: cn(
        'data-[orientation=horizontal]:py-2',
        'data-[orientation=vertical]:py-1.5',
        'hover:**:data-[slot=navigation-link-indicator]:w-4 focus-visible:**:data-[slot=navigation-link-indicator]:w-4 data-active:**:data-[slot=navigation-link-indicator]:w-4',
      ),
    },
    {
      variant: 'indicator',
      size: 'md',
      class: cn(
        'data-[orientation=horizontal]:py-2.5',
        'data-[orientation=vertical]:py-2',
        'hover:**:data-[slot=navigation-link-indicator]:w-4.5 focus-visible:**:data-[slot=navigation-link-indicator]:w-4.5 data-active:**:data-[slot=navigation-link-indicator]:w-4.5',
      ),
    },
    {
      variant: 'indicator',
      size: 'lg',
      class: cn(
        'data-[orientation=horizontal]:py-3',
        'data-[orientation=vertical]:py-2.5',
        'hover:**:data-[slot=navigation-link-indicator]:w-5 focus-visible:**:data-[slot=navigation-link-indicator]:w-5 data-active:**:data-[slot=navigation-link-indicator]:w-5',
      ),
    },
  ],
  defaultVariants: {
    variant: 'pill',
    size: 'md',
  },
})

type NavigationLinkVariants = VariantProps<typeof navigationLinkVariants>

export { navigationLinkVariants }
export type { NavigationLinkVariants }
