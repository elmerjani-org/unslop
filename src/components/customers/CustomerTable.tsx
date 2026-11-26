import { Link } from '@tanstack/react-router'
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_equalsString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import type {
  ColumnFiltersState,
  FilterFn,
  SortingState,
} from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Search,
  SearchX,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { StatusBadge } from '#/components/customers/StatusBadge'
import { EmptyState } from '#/components/states'
import { Button, focusRing } from '#/components/ui/button'
import { Card, Skeleton } from '#/components/ui/card'
import { Input, Select } from '#/components/ui/input'
import { Table, TableCell, TableHead, TableRow } from '#/components/ui/table'
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '#/lib/customers/search'
import type { CustomerListSearch, SortKey } from '#/lib/customers/search'
import {
  CUSTOMER_PLANS,
  CUSTOMER_STATUSES,
  PLAN_LABELS,
  STATUS_LABELS,
} from '#/lib/customers/types'
import type {
  Customer,
  CustomerPlan,
  CustomerStatus,
} from '#/lib/customers/types'
import { formatCurrency, formatDate, formatNumber } from '#/lib/format'
import { cn } from '#/lib/utils'

// Responsive visibility and alignment per column, applied to th and td alike.
const COLUMN_CLASS: Partial<Record<SortKey, string>> = {
  plan: 'hidden sm:table-cell',
  mrr: 'text-right',
  seats: 'hidden text-right lg:table-cell',
  owner: 'hidden lg:table-cell',
  lastActivityAt: 'hidden md:table-cell',
}
const columnClass = (id: string) => COLUMN_CLASS[id as SortKey]

const features = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  filterFns: { equalsString: filterFn_equalsString },
})

// Free-text search across the fields people actually look customers up by.
const searchFilter: FilterFn<typeof features, Customer> = (
  row,
  _columnId,
  value: string,
) => {
  const c = row.original
  const needle = value.trim().toLowerCase()
  return [c.name, c.domain, c.contactName, c.contactEmail, c.owner].some(
    (field) => field.toLowerCase().includes(needle),
  )
}

const columnHelper = createColumnHelper<typeof features, Customer>()

const columns = columnHelper.columns([
  columnHelper.accessor('name', {
    header: 'Company',
    sortFn: 'text',
    cell: ({ row }) => (
      <span className="flex min-w-0 flex-col lg:flex-row lg:items-baseline lg:gap-2.5">
        <Link
          to="/customers/$customerId"
          params={{ customerId: row.original.id }}
          className={cn(
            'truncate rounded-sm font-medium text-foreground no-underline decoration-primary/50 underline-offset-4 hover:text-primary hover:underline',
            focusRing,
          )}
        >
          {row.original.name}
        </Link>
        <span className="truncate text-[13px] text-muted-foreground">
          {row.original.domain}
        </span>
      </span>
    ),
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    sortFn: 'text',
    filterFn: 'equalsString',
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  }),
  columnHelper.accessor('plan', {
    header: 'Plan',
    sortFn: 'text',
    filterFn: 'equalsString',
    cell: ({ getValue }) => PLAN_LABELS[getValue()],
  }),
  columnHelper.accessor('mrr', {
    header: 'MRR',
    sortFn: 'alphanumeric',
    cell: ({ getValue }) => (
      <span
        className={cn(
          'font-medium tabular-nums',
          getValue() === 0 && 'font-normal text-muted-foreground',
        )}
      >
        {formatCurrency(getValue())}
      </span>
    ),
  }),
  columnHelper.accessor('seats', {
    header: 'Seats',
    sortFn: 'alphanumeric',
    cell: ({ getValue }) => (
      <span className="tabular-nums">{formatNumber(getValue())}</span>
    ),
  }),
  columnHelper.accessor('owner', { header: 'Owner', sortFn: 'text' }),
  columnHelper.accessor('lastActivityAt', {
    header: 'Last activity',
    // ISO timestamps sort chronologically as text.
    sortFn: 'text',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground tabular-nums">
        {formatDate(getValue())}
      </span>
    ),
  }),
])

const tabClass = cn(
  'relative flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground',
  focusRing,
  'focus-visible:-outline-offset-2',
)
// The selected tab sits on the sheet's rule with a petrol underline.
const tabActiveClass =
  'text-foreground after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-primary'

export function CustomerTable({
  customers,
  search,
  onSearchChange,
}: {
  customers: Array<Customer>
  search: CustomerListSearch
  /** Merges a patch into the URL search state; `undefined` clears a key. */
  onSearchChange: (patch: CustomerListSearch) => void
}) {
  // TanStack Table returns a stable instance whose methods read mutable
  // state, which React Compiler would memoize into stale UI — opt out here.
  'use no memo'

  // Local copy keeps typing responsive while the URL updates in a transition.
  const [searchText, setSearchText] = useState(search.q ?? '')

  const page = search.page ?? 1
  const pageSize = search.size ?? DEFAULT_PAGE_SIZE
  const sorting: SortingState = search.sort
    ? [{ id: search.sort, desc: search.dir === 'desc' }]
    : []
  const columnFilters: ColumnFiltersState = [
    ...(search.status ? [{ id: 'status', value: search.status }] : []),
    ...(search.plan ? [{ id: 'plan', value: search.plan }] : []),
  ]

  // The URL is the source of truth: state flows in, changes go back out
  // through onSearchChange.
  const table = useTable(
    {
      features,
      data: customers,
      columns,
      state: {
        sorting,
        columnFilters,
        globalFilter: search.q ?? '',
        pagination: { pageIndex: page - 1, pageSize },
      },
      onSortingChange: (updater) => {
        const next = typeof updater === 'function' ? updater(sorting) : updater
        const first = next.at(0)
        onSearchChange({
          sort: first ? (first.id as SortKey) : undefined,
          dir: first?.desc ? 'desc' : undefined,
          page: undefined,
        })
      },
      globalFilterFn: searchFilter,
      autoResetPageIndex: false,
    },
    (state) => state,
  )

  const filteredCount = table.getPrePaginatedRowModel().rows.length
  const pageCount = table.getPageCount()
  const rows = table.getRowModel().rows
  const hasFilters = Boolean(search.q || search.status || search.plan)

  // A stale or hand-edited ?page= beyond the last page snaps back into range.
  useEffect(() => {
    if (pageCount > 0 && page > pageCount) onSearchChange({ page: pageCount })
  }, [page, pageCount, onSearchChange])

  const clearFilters = () => {
    setSearchText('')
    onSearchChange({
      q: undefined,
      status: undefined,
      plan: undefined,
      page: undefined,
    })
  }

  const statusTabs: Array<{
    status: CustomerStatus | undefined
    label: string
    count: number
  }> = [
    { status: undefined, label: 'All', count: customers.length },
    ...CUSTOMER_STATUSES.map((status) => ({
      status,
      label: STATUS_LABELS[status],
      count: customers.filter((c) => c.status === status).length,
    })),
  ]

  const firstRow = filteredCount === 0 ? 0 : (page - 1) * pageSize + 1
  const lastRow = Math.min(page * pageSize, filteredCount)

  return (
    <Card className="overflow-hidden">
      <div
        role="group"
        aria-label="Filter by status"
        className="flex overflow-x-auto border-b px-2"
      >
        {statusTabs.map((tab) => {
          const selected = search.status === tab.status
          return (
            <button
              key={tab.label}
              type="button"
              aria-pressed={selected}
              className={cn(tabClass, selected && tabActiveClass)}
              onClick={() =>
                onSearchChange({ status: tab.status, page: undefined })
              }
            >
              {tab.label}
              <span className="text-xs font-normal text-muted-foreground tabular-nums">
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-2 border-b px-5 py-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-80">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            aria-label="Search customers"
            placeholder="Search company, contact or owner"
            className="pl-9"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value)
              onSearchChange({
                q: e.target.value || undefined,
                page: undefined,
              })
            }}
          />
        </div>
        <Select
          aria-label="Filter by plan"
          className="sm:w-36"
          value={search.plan ?? ''}
          onChange={(e) =>
            onSearchChange({
              plan: (e.target.value || undefined) as CustomerPlan | undefined,
              page: undefined,
            })
          }
        >
          <option value="">All plans</option>
          {CUSTOMER_PLANS.map((plan) => (
            <option key={plan} value={plan}>
              {PLAN_LABELS[plan]}
            </option>
          ))}
        </Select>
        {hasFilters ? (
          <Button variant="ghost" onClick={clearFilters}>
            Clear filters
          </Button>
        ) : null}
      </div>

      {filteredCount === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No customers match these filters"
          description="Try a different search term, or clear the filters to see every customer."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          }
        />
      ) : (
        <>
          <Table>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted()
                    return (
                      <TableHead
                        key={header.id}
                        scope="col"
                        className={columnClass(header.column.id)}
                        aria-sort={
                          sorted === 'asc'
                            ? 'ascending'
                            : sorted === 'desc'
                              ? 'descending'
                              : 'none'
                        }
                      >
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            'group -mx-1.5 inline-flex cursor-pointer items-center gap-1 rounded-sm px-1.5 py-1 transition-colors duration-150 hover:text-foreground',
                            focusRing,
                            sorted && 'text-foreground',
                          )}
                        >
                          <table.FlexRender header={header} />
                          {sorted === 'asc' ? (
                            <ArrowUp
                              aria-hidden
                              className="size-3.5 text-primary"
                            />
                          ) : sorted === 'desc' ? (
                            <ArrowDown
                              aria-hidden
                              className="size-3.5 text-primary"
                            />
                          ) : (
                            <ChevronsUpDown
                              aria-hidden
                              className="size-3.5 opacity-0 transition-opacity duration-150 group-hover:opacity-60 group-focus-visible:opacity-60"
                            />
                          )}
                        </button>
                      </TableHead>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={columnClass(cell.column.id)}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </tbody>
          </Table>

          <div className="flex flex-col gap-3 border-t px-5 py-2.5 text-[13px] sm:flex-row sm:items-center sm:justify-between">
            <p
              className="text-muted-foreground tabular-nums"
              aria-live="polite"
            >
              {firstRow}–{lastRow} of {filteredCount}
              {hasFilters ? `, filtered from ${customers.length}` : ''}
            </p>
            <div className="flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-muted-foreground">
                <span className="whitespace-nowrap">Rows per page</span>
                <Select
                  className="w-[4.5rem]"
                  value={pageSize}
                  onChange={(e) => {
                    const size = PAGE_SIZES.find(
                      (s) => s === Number(e.target.value),
                    )
                    onSearchChange({
                      size: size === DEFAULT_PAGE_SIZE ? undefined : size,
                      page: undefined,
                    })
                  }}
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </Select>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="mr-1.5 whitespace-nowrap text-muted-foreground tabular-nums">
                  Page {page} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Previous page"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() =>
                    onSearchChange({
                      page: page - 1 > 1 ? page - 1 : undefined,
                    })
                  }
                >
                  <ChevronLeft aria-hidden />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Next page"
                  disabled={!table.getCanNextPage()}
                  onClick={() => onSearchChange({ page: page + 1 })}
                >
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

export function CustomerTableSkeleton() {
  return (
    <Card className="overflow-hidden" aria-busy aria-label="Loading customers">
      <div className="flex h-11 items-center gap-6 border-b px-5">
        {[28, 52, 36, 60, 56].map((width, i) => (
          <Skeleton key={i} className="h-3.5" style={{ width }} />
        ))}
      </div>
      <div className="flex flex-col gap-2 border-b px-5 py-3 sm:flex-row">
        <Skeleton className="h-9 sm:w-80" />
        <Skeleton className="h-9 sm:w-36" />
      </div>
      <div className="divide-y">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="flex h-[41px] items-center gap-6 px-5">
            <Skeleton
              className="h-3.5 max-w-[45%]"
              style={{ width: 150 + ((i * 37) % 90) }}
            />
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="hidden h-3.5 w-20 sm:block" />
            <Skeleton className="ml-auto h-3.5 w-14" />
            <Skeleton className="hidden h-3.5 w-24 md:block" />
          </div>
        ))}
      </div>
    </Card>
  )
}
