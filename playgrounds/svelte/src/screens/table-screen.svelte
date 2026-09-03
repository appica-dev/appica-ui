<script lang="ts">
  import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@appica/ui-svelte'
</script>

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Table</h2>
  <Table hoverableRows stripedRows>
    <TableCaption>Recent transactions</TableCaption>
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
</section>
