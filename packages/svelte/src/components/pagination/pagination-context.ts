import { getContext, setContext } from 'svelte'

export type PaginationVariant = 'outline' | 'soft'
export type PaginationSize = 'sm' | 'md' | 'lg'

export interface PaginationContextValue {
  variant: () => PaginationVariant
  size: () => PaginationSize
}

const KEY = Symbol('appica-pagination')

export function setPaginationContext(value: PaginationContextValue) {
  setContext(KEY, value)
}

export function getPaginationContext(): PaginationContextValue {
  const ctx = getContext<PaginationContextValue>(KEY)
  if (!ctx) {
    throw new Error('Pagination sub-components must be rendered inside <Pagination>')
  }
  return ctx
}

export const LINK_SIZE_OVERRIDES: Record<PaginationSize, string> = {
  sm: 'px-2 gap-0.5 text-xs min-w-8 has-data-[icon=end]:pe-1 has-data-[icon=start]:ps-1',
  md: 'px-2.5 gap-0.5 text-sm min-w-10 has-data-[icon=end]:pe-1.5 has-data-[icon=start]:ps-1.5',
  lg: 'px-3 gap-0.5 text-base min-w-12 has-data-[icon=end]:pe-2 has-data-[icon=start]:ps-2',
}

export const ELLIPSIS_SIZE: Record<PaginationSize, string> = {
  sm: 'h-8 w-6 pb-1 [&_svg]:size-4',
  md: 'h-10 w-7 pb-1.5 [&_svg]:size-4.5',
  lg: 'h-12 w-8 pb-2 [&_svg]:size-5',
}
