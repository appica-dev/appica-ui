export const switchSizes = {
  sm: {
    root: 'h-4 w-7.5',
    thumb: 'size-3',
    check: 'size-2.5',
  },
  md: {
    root: 'h-5 w-9.5',
    thumb: 'size-4',
    check: 'size-3',
  },
  lg: {
    root: 'h-6 w-11.5',
    thumb: 'size-5',
    check: 'size-4',
  },
} as const

export type SwitchSize = keyof typeof switchSizes
