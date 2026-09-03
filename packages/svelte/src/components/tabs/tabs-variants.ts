import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../internal/utils'

export const tabsListVariants = cva(
  'relative flex w-fit items-center justify-center data-[orientation=vertical]:h-fit data-[orientation=vertical]:flex-col',
  {
    variants: {
      variant: {
        pill: 'gap-0.5 p-0.5 bg-background-muted',
        line: '',
      },
      size: {
        sm: 'data-[orientation=vertical]:min-w-32',
        md: 'data-[orientation=vertical]:min-w-36',
        lg: 'data-[orientation=vertical]:min-w-40',
      },
    },
    compoundVariants: [
      { variant: 'pill', size: 'sm', class: 'rounded-sm' },
      { variant: 'pill', size: 'md', class: 'rounded-md' },
      { variant: 'pill', size: 'lg', class: 'rounded-lg' },
      { variant: 'line', size: 'sm', class: 'data-[orientation=horizontal]:gap-5' },
      { variant: 'line', size: 'md', class: 'data-[orientation=horizontal]:gap-6' },
      { variant: 'line', size: 'lg', class: 'data-[orientation=horizontal]:gap-7' },
    ],
    defaultVariants: { variant: 'pill', size: 'md' },
  },
)

export const tabsIndicatorVariants = cva(
  'pointer-events-none absolute z-0 inset-s-0 transition-[translate,width,height] duration-250 motion-reduce:transition-none data-[orientation=horizontal]:ltr:translate-x-(--active-tab-left) data-[orientation=horizontal]:rtl:-translate-x-(--active-tab-right) data-[orientation=vertical]:translate-y-(--active-tab-top)',
  {
    variants: {
      variant: {
        pill: 'w-(--active-tab-width) data-[orientation=horizontal]:top-0.5 data-[orientation=horizontal]:h-[calc(100%-0.25rem)] data-[orientation=vertical]:top-0 data-[orientation=vertical]:bottom-(--active-tab-bottom) data-[orientation=vertical]:inset-s-0.5 data-[orientation=vertical]:h-(--active-tab-height) rounded-[inherit] bg-white shadow-lg',
        line: cn(
          'rounded-full bg-foreground-intense',
          'data-[orientation=horizontal]:bottom-0 data-[orientation=horizontal]:h-0.5 data-[orientation=horizontal]:w-(--active-tab-width)',
          'data-[orientation=vertical]:top-[calc(var(--active-tab-height)/4)] data-[orientation=vertical]:h-[calc(var(--active-tab-height)/2)] data-[orientation=vertical]:w-0.5',
        ),
      },
    },
    defaultVariants: { variant: 'pill' },
  },
)

export const tabsTriggerVariants = cva(
  "group/trigger relative flex shrink-0 cursor-pointer items-stretch data-[orientation=vertical]:w-full text-foreground-strong font-medium select-none outline-ring transition-colors duration-250 motion-reduce:transition-none hover:text-foreground-intense data-[state=active]:pointer-events-none data-disabled:opacity-disabled data-disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='stroke-'])]:stroke-[1.85]",
  {
    variants: {
      variant: {
        pill: 'data-[state=active]:text-black',
        line: 'data-[state=active]:text-foreground-intense',
      },
      size: {
        sm: "text-xs [&_svg:not([class*='size-'])]:size-4",
        md: "text-sm [&_svg:not([class*='size-'])]:size-4.5",
        lg: "text-base [&_svg:not([class*='size-'])]:size-5",
        'icon-sm': "text-xs [&_svg:not([class*='size-'])]:size-4",
        'icon-md': "text-sm [&_svg:not([class*='size-'])]:size-4.5",
        'icon-lg': "text-base [&_svg:not([class*='size-'])]:size-5",
      },
    },
    compoundVariants: [
      { variant: 'pill', size: 'sm', class: 'rounded-sm' },
      { variant: 'pill', size: 'md', class: 'rounded-md' },
      { variant: 'pill', size: 'lg', class: 'rounded-lg' },
      { variant: 'pill', size: 'icon-sm', class: 'rounded-sm' },
      { variant: 'pill', size: 'icon-md', class: 'rounded-md' },
      { variant: 'pill', size: 'icon-lg', class: 'rounded-lg' },
    ],
    defaultVariants: { variant: 'pill', size: 'md' },
  },
)

export const tabsTriggerInnerVariants = cva(
  'relative isolate flex items-center data-[orientation=horizontal]:justify-center data-[orientation=vertical]:w-full data-[orientation=horizontal]:text-center data-[orientation=vertical]:text-start data-[orientation=horizontal]:whitespace-nowrap transform-gpu transition-transform duration-250 ease-[cubic-bezier(0.175,0.885,0.32,1.5)] motion-reduce:transition-none group-active/trigger:scale-[0.97] group-active/trigger:duration-100 group-active/trigger:ease-in-out group-active/trigger:translate-y-px',
  {
    variants: {
      variant: {
        pill: 'before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:pointer-events-none before:transition-colors before:duration-250 group-hover/trigger:before:bg-background-subtle motion-reduce:before:transition-none supports-[font:-apple-system-body]:before:hidden',
        line: '',
      },
      size: {
        sm: 'gap-1 py-2',
        md: 'gap-1.5 py-2.5',
        lg: 'gap-1.5 py-3',
        'icon-sm': 'size-8',
        'icon-md': 'size-10',
        'icon-lg': 'size-12',
      },
    },
    compoundVariants: [
      {
        variant: 'pill',
        size: 'sm',
        class: 'rounded-sm px-3.5 has-data-[icon=end]:pe-2.5 has-data-[icon=start]:ps-2.5',
      },
      {
        variant: 'pill',
        size: 'md',
        class: 'rounded-md px-4.5 has-data-[icon=end]:pe-3 has-data-[icon=start]:ps-3',
      },
      {
        variant: 'pill',
        size: 'lg',
        class: 'rounded-lg px-5.5 has-data-[icon=end]:pe-4 has-data-[icon=start]:ps-4',
      },
      { variant: 'pill', size: 'icon-sm', class: 'rounded-sm' },
      { variant: 'pill', size: 'icon-md', class: 'rounded-md' },
      { variant: 'pill', size: 'icon-lg', class: 'rounded-lg' },
      {
        variant: 'line',
        size: 'sm',
        class:
          'data-[orientation=vertical]:ps-3 data-[orientation=vertical]:has-data-[icon=end]:pe-2 data-[orientation=vertical]:has-data-[icon=start]:ps-2',
      },
      {
        variant: 'line',
        size: 'md',
        class:
          'data-[orientation=vertical]:ps-4 data-[orientation=vertical]:has-data-[icon=end]:pe-3 data-[orientation=vertical]:has-data-[icon=start]:ps-3',
      },
      {
        variant: 'line',
        size: 'lg',
        class:
          'data-[orientation=vertical]:ps-5 data-[orientation=vertical]:has-data-[icon=end]:pe-4 data-[orientation=vertical]:has-data-[icon=start]:ps-4',
      },
    ],
    defaultVariants: { variant: 'pill', size: 'md' },
  },
)

export const tabsContentClasses =
  'outline-none transition-[opacity,filter] duration-400 ease-out motion-reduce:transition-none data-[state=inactive]:hidden'

export type TabsListVariant = NonNullable<VariantProps<typeof tabsListVariants>['variant']>
export type TabsSize = NonNullable<VariantProps<typeof tabsListVariants>['size']>
export type TabsTriggerSize = NonNullable<VariantProps<typeof tabsTriggerVariants>['size']>
export type TabsOrientation = 'horizontal' | 'vertical'
