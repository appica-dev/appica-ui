<script lang="ts">
  import {
    BoltFilled,
    BriefcaseFilled,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    ChevronUp,
    Copy,
    DotsVertical,
    DropletFilled,
    Eye,
    LayoutColumns,
    Pencil,
    Search,
    Trash,
  } from '@appica/icons-svelte'
  import {
    Badge,
    Button,
    Checkbox,
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuGroupLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Input,
    ScrollArea,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Thumbnail,
    buttonVariants,
  } from '@appica/ui-svelte'
  import {
    type Column,
    type ColumnDef,
    type ColumnVisibilityState,
    type Row,
    type SortingState,
    columnFilteringFeature,
    columnVisibilityFeature,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    createTable,
    createTableState,
    filterFn_includesString,
    FlexRender,
    globalFilteringFeature,
    renderSnippet,
    rowPaginationFeature,
    rowSelectionFeature,
    rowSortingFeature,
    sortFn_alphanumeric,
    sortFn_text,
    tableFeatures,
  } from '@tanstack/svelte-table'

  const features = tableFeatures({
    columnFilteringFeature,
    globalFilteringFeature,
    rowSortingFeature,
    rowPaginationFeature,
    rowSelectionFeature,
    columnVisibilityFeature,
    filteredRowModel: createFilteredRowModel(),
    sortedRowModel: createSortedRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    filterFns: { includesString: filterFn_includesString },
    sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  })

  type Category = 'Income' | 'Entertainment' | 'Bill' | 'Medical' | 'Food & Drinks' | 'Transport'
  type ThumbIcon = 'briefcase' | 'bolt' | 'droplet'

  type Transaction = {
    id: string
    date: string
    description: string
    thumb: { type: 'image'; src: string } | { type: 'icon'; icon: ThumbIcon }
    account: string
    category: Category
    status: 'Completed' | 'Pending'
    amount: number
  }

  const CATEGORY_DOT: Record<Category, string> = {
    Income: 'bg-lime-500',
    Entertainment: 'bg-violet-500',
    Bill: 'bg-info-emphasis',
    Medical: 'bg-success-emphasis',
    'Food & Drinks': 'bg-pink-500',
    Transport: 'bg-warning-emphasis',
  }

  const COLUMN_LABELS: Record<string, string> = {
    date: 'Date',
    description: 'Description',
    account: 'Account',
    category: 'Category',
    status: 'Status',
    amount: 'Amount',
  }

  const TRANSACTIONS: Transaction[] = [
    {
      id: 'TXN-1042',
      date: '2026-08-30T17:23:21',
      description: 'Salary - TechNova Inc.',
      thumb: { type: 'icon', icon: 'briefcase' },
      account: '1842',
      category: 'Income',
      status: 'Completed',
      amount: 4150,
    },
    {
      id: 'TXN-1041',
      date: '2026-08-24T07:18:53',
      description: 'Netflix Subscription',
      thumb: { type: 'image', src: '/data-table/netflix.jpg' },
      account: '1842',
      category: 'Entertainment',
      status: 'Pending',
      amount: -20,
    },
    {
      id: 'TXN-1040',
      date: '2026-08-17T09:15:00',
      description: 'Utility Bill - Electricity',
      thumb: { type: 'icon', icon: 'bolt' },
      account: '1842',
      category: 'Bill',
      status: 'Pending',
      amount: -186.35,
    },
    {
      id: 'TXN-1039',
      date: '2026-08-17T08:34:46',
      description: 'Utility Bill - Water',
      thumb: { type: 'icon', icon: 'droplet' },
      account: '1842',
      category: 'Bill',
      status: 'Completed',
      amount: -39.78,
    },
    {
      id: 'TXN-1038',
      date: '2026-08-13T00:27:19',
      description: 'Health Insurance',
      thumb: { type: 'image', src: '/data-table/health.jpg' },
      account: '1842',
      category: 'Medical',
      status: 'Completed',
      amount: -248,
    },
    {
      id: 'TXN-1037',
      date: '2026-08-10T02:30:52',
      description: "McDonald's",
      thumb: { type: 'image', src: '/data-table/mcdonalds.jpg' },
      account: '1842',
      category: 'Food & Drinks',
      status: 'Completed',
      amount: -32.67,
    },
    {
      id: 'TXN-1034',
      date: '2026-08-07T22:50:13',
      description: 'Uber Taxi',
      thumb: { type: 'image', src: '/data-table/uber.jpg' },
      account: '1842',
      category: 'Transport',
      status: 'Completed',
      amount: -25.4,
    },
    {
      id: 'TXN-1036',
      date: '2026-08-05T04:45:21',
      description: 'Starbucks',
      thumb: { type: 'image', src: '/data-table/starbucks.jpg' },
      account: '1842',
      category: 'Food & Drinks',
      status: 'Completed',
      amount: -7.99,
    },
    {
      id: 'TXN-1035',
      date: '2026-07-30T18:19:00',
      description: 'Salary - TechNova Inc.',
      thumb: { type: 'icon', icon: 'briefcase' },
      account: '1842',
      category: 'Income',
      status: 'Completed',
      amount: 3980,
    },
    {
      id: 'TXN-1033',
      date: '2026-07-21T15:15:40',
      description: 'Burger King',
      thumb: { type: 'image', src: '/data-table/burger-king.jpg' },
      account: '1842',
      category: 'Food & Drinks',
      status: 'Completed',
      amount: -14.99,
    },
    {
      id: 'TXN-1032',
      date: '2026-07-19T19:36:23',
      description: 'Uklon Taxi',
      thumb: { type: 'image', src: '/data-table/uklon.jpg' },
      account: '1842',
      category: 'Transport',
      status: 'Completed',
      amount: -18.5,
    },
    {
      id: 'TXN-1031',
      date: '2026-07-12T08:05:11',
      description: 'Uber Taxi',
      thumb: { type: 'image', src: '/data-table/uber.jpg' },
      account: '1842',
      category: 'Transport',
      status: 'Completed',
      amount: -31.2,
    },
    {
      id: 'TXN-1030',
      date: '2026-07-08T13:22:47',
      description: 'Starbucks',
      thumb: { type: 'image', src: '/data-table/starbucks.jpg' },
      account: '1842',
      category: 'Food & Drinks',
      status: 'Pending',
      amount: -6.45,
    },
    {
      id: 'TXN-1029',
      date: '2026-06-30T17:00:00',
      description: 'Salary - TechNova Inc.',
      thumb: { type: 'icon', icon: 'briefcase' },
      account: '1842',
      category: 'Income',
      status: 'Completed',
      amount: 4150,
    },
  ]

  function formatDate(iso: string) {
    const date = new Date(iso)
    const datePart = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
    const timePart = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date)
    return `${datePart} ${timePart}`
  }

  function formatAmount(amount: number) {
    const value = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return `${amount > 0 ? '+' : '-'} $${value}`
  }

  const [sorting, setSorting] = createTableState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = createTableState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = createTableState({})
  let globalFilter = $state('')

  const columns: ColumnDef<typeof features, Transaction>[] = [
    {
      id: 'select',
      header: ({ table: headerTable }) => renderSnippet(selectAllHeader, headerTable),
      cell: ({ row }) => renderSnippet(selectRowCell, row),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'date',
      header: ({ column }) => renderSnippet(sortableHeader, { column, label: 'Date' }),
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => renderSnippet(sortableHeader, { column, label: 'Description' }),
      cell: ({ row }) => renderSnippet(descriptionCell, row.original),
    },
    {
      accessorKey: 'account',
      header: ({ column }) => renderSnippet(sortableHeader, { column, label: 'Account' }),
      cell: ({ row }) => renderSnippet(accountCell, row.original.account),
    },
    {
      accessorKey: 'category',
      header: ({ column }) => renderSnippet(sortableHeader, { column, label: 'Category' }),
      cell: ({ row }) => renderSnippet(categoryCell, row.original.category),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => renderSnippet(sortableHeader, { column, label: 'Status' }),
      cell: ({ row }) => row.original.status,
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => renderSnippet(sortableHeader, { column, label: 'Amount' }),
      cell: ({ row }) => renderSnippet(amountCell, row.original),
    },
    {
      id: 'actions',
      cell: () => renderSnippet(rowActions, null),
      enableSorting: false,
      enableHiding: false,
    },
  ]

  const table = createTable({
    features,
    columns,
    get data() {
      return TRANSACTIONS
    },
    state: {
      get sorting() {
        return sorting()
      },
      get columnVisibility() {
        return columnVisibility()
      },
      get rowSelection() {
        return rowSelection()
      },
      get globalFilter() {
        return globalFilter
      },
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: (updater) => {
      globalFilter = typeof updater === 'function' ? updater(globalFilter) : updater
    },
    globalFilterFn: 'includesString',
    initialState: { pagination: { pageIndex: 0, pageSize: 8 } },
  })

  const pagination = $derived(table.atoms.pagination.get())
  const rowSelectionState = $derived(table.atoms.rowSelection.get())
  const columnVisibilityState = $derived(table.atoms.columnVisibility.get())
  const sortingState = $derived(table.atoms.sorting.get())
  const rows = $derived.by(() => {
    sortingState
    columnVisibilityState
    rowSelectionState
    globalFilter
    pagination
    return table.getRowModel().rows
  })
  const hideableColumns = $derived.by(() => {
    columnVisibilityState
    return table.getAllColumns().filter((column) => column.getCanHide())
  })
  const selectedCount = $derived.by(() => {
    rowSelectionState
    globalFilter
    return table.getFilteredSelectedRowModel().rows.length
  })
  const filteredCount = $derived.by(() => {
    globalFilter
    return table.getFilteredRowModel().rows.length
  })
  const pageCount = $derived.by(() => {
    globalFilter
    pagination
    return table.getPageCount()
  })
  const canPreviousPage = $derived.by(() => {
    pagination
    globalFilter
    return table.getCanPreviousPage()
  })
  const canNextPage = $derived.by(() => {
    pagination
    globalFilter
    return table.getCanNextPage()
  })

  const sortButtonClass =
    'hover:text-foreground-intense focus-visible:outline-ring rounded-3xs -mx-1 inline-flex cursor-pointer items-center gap-1 px-1 outline-offset-2 focus-visible:outline-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.85]'
</script>

{#snippet searchIcon()}
  <Search class="text-foreground-muted size-4" />
{/snippet}

{#snippet layoutColumns()}
  <LayoutColumns data-icon="start" />
{/snippet}

{#snippet chevronDownEnd()}
  <ChevronDown
    data-icon="end"
    class="transition-transform duration-200 ease-out group-data-popup-open/columns:rotate-180 motion-reduce:transition-none"
  />
{/snippet}
{#snippet chevronDown()}
  <ChevronDown />
{/snippet}

{#snippet chevronUp()}
  <ChevronUp />
{/snippet}

{#snippet chevronsUpDown()}
  <ChevronsUpDown class="text-foreground-muted" />
{/snippet}

{#snippet chevronLeft()}
  <ChevronLeft data-icon="start" class="-ms-1" />
{/snippet}

{#snippet chevronRight()}
  <ChevronRight data-icon="end" class="-me-1" />
{/snippet}

{#snippet dotsVertical()}
  <DotsVertical />
{/snippet}

{#snippet eye()}
  <Eye data-icon="start" />
{/snippet}

{#snippet copy()}
  <Copy data-icon="start" />
{/snippet}

{#snippet pencil()}
  <Pencil data-icon="start" />
{/snippet}

{#snippet trash()}
  <Trash data-icon="start" />
{/snippet}

{#snippet briefcaseFilled()}
  <BriefcaseFilled />
{/snippet}

{#snippet boltFilled()}
  <BoltFilled />
{/snippet}

{#snippet dropletFilled()}
  <DropletFilled />
{/snippet}

{#snippet selectAllHeader(headerTable: typeof table)}
  <Checkbox
    checked={headerTable.getIsAllPageRowsSelected()}
    indeterminate={headerTable.getIsSomePageRowsSelected() && !headerTable.getIsAllPageRowsSelected()}
    onCheckedChange={(checked) => headerTable.toggleAllPageRowsSelected(checked === true)}
    aria-label="Select all rows"
  />
{/snippet}

{#snippet selectRowCell(row: Row<typeof features, Transaction>)}
  <Checkbox
    checked={row.getIsSelected()}
    onCheckedChange={(checked) => row.toggleSelected(checked === true)}
    aria-label="Select row"
  />
{/snippet}

{#snippet sortableHeader(props: { column: Column<typeof features, Transaction>; label: string })}
  {@const sorted = props.column.getIsSorted()}
  <button type="button" onclick={() => props.column.toggleSorting(sorted === 'asc')} class={sortButtonClass}>
    {props.label}
    {#if sorted === 'asc'}
      {@render chevronUp()}
    {:else if sorted === 'desc'}
      {@render chevronDown()}
    {:else}
      {@render chevronsUpDown()}
    {/if}
  </button>
{/snippet}

{#snippet transactionThumb(transaction: Transaction)}
  {#if transaction.thumb.type === 'image'}
    <Thumbnail size="sm" shape="circle" src={transaction.thumb.src} alt={transaction.description} />
  {:else if transaction.thumb.icon === 'briefcase'}
    <Thumbnail size="sm" shape="circle" variant="icon-soft">
      {@render briefcaseFilled()}
    </Thumbnail>
  {:else if transaction.thumb.icon === 'bolt'}
    <Thumbnail size="sm" shape="circle" variant="icon-soft">
      {@render boltFilled()}
    </Thumbnail>
  {:else}
    <Thumbnail size="sm" shape="circle" variant="icon-soft">
      {@render dropletFilled()}
    </Thumbnail>
  {/if}
{/snippet}

{#snippet descriptionCell(transaction: Transaction)}
  <div class="flex items-center gap-3">
    {@render transactionThumb(transaction)}
    <span class="text-foreground-intense font-medium">{transaction.description}</span>
  </div>
{/snippet}

{#snippet accountCell(account: string)}
  <span>
    Checking <span class="text-foreground-muted">****{account}</span>
  </span>
{/snippet}

{#snippet categoryCell(category: Category)}
  <Badge variant="outline" class="gap-1.25">
    <span class={['size-2 shrink-0 rounded-full', CATEGORY_DOT[category]]}></span>
    {category}
  </Badge>
{/snippet}

{#snippet amountCell(transaction: Transaction)}
  <span
    class={transaction.status === 'Pending'
      ? 'text-foreground-muted font-semibold'
      : 'text-foreground-intense font-semibold'}
  >
    {formatAmount(transaction.amount)}
  </span>
{/snippet}

{#snippet rowActions(_unused: null)}
  <DropdownMenu>
    <DropdownMenuTrigger class={buttonVariants({ variant: 'ghost', size: 'icon-sm' })} aria-label="Open actions menu">
      {@render dotsVertical()}
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuGroup>
        <DropdownMenuItem>
          {@render eye()}
          View details
        </DropdownMenuItem>
        <DropdownMenuItem>
          {@render copy()}
          Copy transaction ID
        </DropdownMenuItem>
        <DropdownMenuItem>
          {@render pencil()}
          Edit
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="text-error-emphasis! data-highlighted:before:bg-error-subtle!">
        {@render trash()}
        Delete
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
{/snippet}

<section class="flex flex-col gap-4">
  <h2 class="text-foreground-emphasis text-lg font-semibold">Data Table</h2>
  <div class="flex w-full flex-col gap-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Input
        placeholder="Search transactions..."
        bind:value={globalFilter}
        clearable
        onClear={() => (globalFilter = '')}
        class="sm:max-w-2xs"
      >
        {#snippet start()}
          {@render searchIcon()}
        {/snippet}
      </Input>
      <DropdownMenu>
        <DropdownMenuTrigger class={['group/columns', buttonVariants({ variant: 'outline' })]}>
          {@render layoutColumns()}
          Columns
          {@render chevronDownEnd()}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuGroupLabel>Toggle columns</DropdownMenuGroupLabel>
            {#each hideableColumns as column (column.id)}
              <DropdownMenuCheckboxItem
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(value === true)}
              >
                {COLUMN_LABELS[column.id] ?? column.id}
              </DropdownMenuCheckboxItem>
            {/each}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <ScrollArea
      orientation="horizontal"
      scrollbarVisibility="auto"
      class="[&_td]:whitespace-nowrap [&_th]:whitespace-nowrap"
    >
      <Table hoverableRows>
        <TableHeader>
          {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
            <TableRow>
              {#each headerGroup.headers as header (header.id)}
                <TableHead class={header.column.id === 'amount' ? 'text-end' : undefined}>
                  {#if !header.isPlaceholder}
                    <FlexRender {header} />
                  {/if}
                </TableHead>
              {/each}
            </TableRow>
          {/each}
        </TableHeader>
        <TableBody>
          {#if rows.length}
            {#each rows as row (row.id)}
              <TableRow highlighted={row.getIsSelected()}>
                {#each row.getVisibleCells() as cell (cell.id)}
                  <TableCell class={cell.column.id === 'amount' ? 'text-end' : undefined}>
                    <FlexRender {cell} />
                  </TableCell>
                {/each}
              </TableRow>
            {/each}
          {:else}
            <TableRow>
              <TableCell colspan={columns.length} class="text-foreground-muted h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          {/if}
        </TableBody>
      </Table>
    </ScrollArea>

    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p class="text-foreground-muted text-sm">
        {selectedCount} of {filteredCount} row(s) selected.
      </p>
      <div class="flex items-center gap-2">
        <span class="text-foreground-muted text-sm">
          Page {pagination.pageIndex + 1} of {pageCount}
        </span>
        <Button variant="outline" size="sm" disabled={!canPreviousPage} onclick={() => table.previousPage()}>
          {@render chevronLeft()}
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={!canNextPage} onclick={() => table.nextPage()}>
          Next
          {@render chevronRight()}
        </Button>
      </div>
    </div>
  </div>
</section>
