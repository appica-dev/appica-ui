<script lang="ts">
  import Table from './table.svelte'
  import TableBody from './table-body.svelte'
  import TableCaption from './table-caption.svelte'
  import TableCell from './table-cell.svelte'
  import TableHead from './table-head.svelte'
  import TableHeader from './table-header.svelte'
  import TableRow from './table-row.svelte'
  import type { TableBorderStyle, TableSize } from './table-variants'

  let {
    size = 'md',
    borderStyle = 'solid',
    stripedRows = false,
    stripedColumns = false,
    hoverableRows = false,
    captionPosition = 'bottom',
    rowHeader = false,
  }: {
    size?: TableSize
    borderStyle?: TableBorderStyle
    stripedRows?: boolean
    stripedColumns?: boolean
    hoverableRows?: boolean
    captionPosition?: 'top' | 'bottom'
    rowHeader?: boolean
  } = $props()
</script>

{#if rowHeader}
  <Table {size} {borderStyle} {stripedRows} {stripedColumns} {hoverableRows}>
    <TableBody>
      <TableRow>
        <TableHead scope="row">Monday</TableHead>
        <TableCell>Standup</TableCell>
      </TableRow>
    </TableBody>
  </Table>
{:else}
  <Table {size} {borderStyle} {stripedRows} {stripedColumns} {hoverableRows}>
    <TableCaption position={captionPosition}>Recent transactions</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Date</TableHead>
        <TableHead>Description</TableHead>
        <TableHead class="text-end">Amount</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Aug 30</TableCell>
        <TableCell>Salary</TableCell>
        <TableCell class="text-end">+ $4,150.00</TableCell>
      </TableRow>
      <TableRow highlighted>
        <TableCell>Aug 24</TableCell>
        <TableCell>Netflix</TableCell>
        <TableCell class="text-end">- $20.00</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Aug 17</TableCell>
        <TableCell>Electricity</TableCell>
        <TableCell class="text-end">- $186.35</TableCell>
      </TableRow>
    </TableBody>
  </Table>
{/if}
