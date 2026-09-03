import { cn } from '../../internal/utils'

export type TableSize = 'sm' | 'md' | 'lg'
export type TableBorderStyle = 'solid' | 'dashed' | 'none'

export const sizeOuter: Record<TableSize, string> = {
  sm: 'p-1 rounded-md text-xs',
  md: 'p-1.25 rounded-lg text-sm',
  lg: 'p-1.5 rounded-xl text-base',
}

export const sizeCellPad: Record<TableSize, string> = {
  sm: '[&_th]:p-3 [&_td]:p-3',
  md: '[&_th]:p-3.5 [&_td]:p-3.5',
  lg: '[&_th]:p-4 [&_td]:p-4',
}

export const sizeHeaderCorners: Record<TableSize, string> = {
  sm: '[&>thead>tr:first-child>th:first-child]:rounded-ss-sm [&>thead>tr:first-child>th:last-child]:rounded-se-sm [&>thead>tr:last-child>th:first-child]:rounded-es-sm [&>thead>tr:last-child>th:last-child]:rounded-ee-sm',
  md: '[&>thead>tr:first-child>th:first-child]:rounded-ss-md [&>thead>tr:first-child>th:last-child]:rounded-se-md [&>thead>tr:last-child>th:first-child]:rounded-es-md [&>thead>tr:last-child>th:last-child]:rounded-ee-md',
  lg: '[&>thead>tr:first-child>th:first-child]:rounded-ss-lg [&>thead>tr:first-child>th:last-child]:rounded-se-lg [&>thead>tr:last-child>th:first-child]:rounded-es-lg [&>thead>tr:last-child>th:last-child]:rounded-ee-lg',
}

export const sizeBodyBottomCorners: Record<TableSize, string> = {
  sm: '[&>tbody:last-of-type>tr:last-child>:first-child]:rounded-es-sm [&>tbody:last-of-type>tr:last-child>:last-child]:rounded-ee-sm',
  md: '[&>tbody:last-of-type>tr:last-child>:first-child]:rounded-es-md [&>tbody:last-of-type>tr:last-child>:last-child]:rounded-ee-md',
  lg: '[&>tbody:last-of-type>tr:last-child>:first-child]:rounded-es-lg [&>tbody:last-of-type>tr:last-child>:last-child]:rounded-ee-lg',
}

export const sizeBodyTopCornersNoHeader: Record<TableSize, string> = {
  sm: '[&:not(:has(thead))>tbody:first-of-type>tr:first-child>:first-child]:rounded-ss-sm [&:not(:has(thead))>tbody:first-of-type>tr:first-child>:last-child]:rounded-se-sm',
  md: '[&:not(:has(thead))>tbody:first-of-type>tr:first-child>:first-child]:rounded-ss-md [&:not(:has(thead))>tbody:first-of-type>tr:first-child>:last-child]:rounded-se-md',
  lg: '[&:not(:has(thead))>tbody:first-of-type>tr:first-child>:first-child]:rounded-ss-lg [&:not(:has(thead))>tbody:first-of-type>tr:first-child>:last-child]:rounded-se-lg',
}

export const borderStyleClasses: Record<TableBorderStyle, string> = {
  solid: '[&_td]:border-border [&>tbody_th]:border-border',
  dashed:
    '[&_td]:border-border-strong [&_td]:border-dashed [&>tbody_th]:border-border-strong [&>tbody_th]:border-dashed',
  none: '[&_td]:border-b-0 [&>tbody_th]:border-b-0',
}

export const tableBaseClasses = cn(
  'w-full border-separate border-spacing-0 bg-background text-foreground border border-border-muted align-middle',
  '[&>thead>tr>th]:bg-background-muted',
  '[&>thead>tr>th]:text-foreground-intense [&>thead>tr>th]:font-medium',
  '[&>tbody_th]:text-foreground-intense [&>tbody_th]:font-medium [&>tbody_th]:border-b',
  '[&_td]:align-middle [&_td]:border-b',
  '[&>tbody:last-of-type>tr:last-child>td]:border-b-0',
  '[&>tbody:last-of-type>tr:last-child>th]:border-b-0',
  '[&>tbody>tr[data-highlighted]]:bg-background-subtle',
)

export const stripedRowsClasses = '[&>tbody>tr:nth-child(2n)]:bg-background-subtle'
export const stripedColumnsClasses = '[&>tbody>tr>:nth-child(2n)]:bg-background-subtle'
export const rowHoverClasses =
  '[&>tbody>tr]:transition-colors [&>tbody>tr]:duration-200 motion-reduce:[&>tbody>tr]:transition-none [&>tbody>tr:hover]:bg-background-subtle'
