<script lang="ts">
  import type { HTMLTableAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { cn } from '../../internal/utils'
  import {
    borderStyleClasses,
    rowHoverClasses,
    sizeBodyBottomCorners,
    sizeBodyTopCornersNoHeader,
    sizeCellPad,
    sizeHeaderCorners,
    sizeOuter,
    stripedColumnsClasses,
    stripedRowsClasses,
    tableBaseClasses,
    type TableBorderStyle,
    type TableSize,
  } from './table-variants'

  type Props = HTMLTableAttributes & {
    /**
     * Cell padding, corner radius, and text scale.
     * @default 'md'
     */
    size?: TableSize
    /**
     * Style of the cell separators.
     * @default 'solid'
     */
    borderStyle?: TableBorderStyle
    /**
     * Tint alternating rows.
     * @default false
     */
    stripedRows?: boolean
    /**
     * Tint alternating columns.
     * @default false
     */
    stripedColumns?: boolean
    /**
     * Tint a row on pointer hover.
     * @default false
     */
    hoverableRows?: boolean
    children?: Snippet
  }

  let {
    size = 'md',
    borderStyle = 'solid',
    stripedRows = false,
    stripedColumns = false,
    hoverableRows = false,
    class: className,
    children,
    ...rest
  }: Props = $props()
</script>

<table
  data-slot="table"
  class={cn(
    tableBaseClasses,
    sizeOuter[size],
    sizeCellPad[size],
    sizeHeaderCorners[size],
    sizeBodyBottomCorners[size],
    sizeBodyTopCornersNoHeader[size],
    borderStyleClasses[borderStyle],
    stripedRows && stripedRowsClasses,
    stripedColumns && stripedColumnsClasses,
    hoverableRows && rowHoverClasses,
    className,
  )}
  {...rest}
>
  {@render children?.()}
</table>
