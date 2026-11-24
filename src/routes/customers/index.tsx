import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Plus, Users } from 'lucide-react'

import {
  CustomerTable,
  CustomerTableSkeleton,
} from '#/components/customers/CustomerTable'
import { PageHeader } from '#/components/layout/AppShell'
import { EmptyState, ErrorState, MockDataBadge } from '#/components/states'
import { buttonVariants } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import { customersQueryOptions } from '#/lib/customers/queries'
import { customerListSearchSchema } from '#/lib/customers/search'
import type { CustomerListSearch } from '#/lib/customers/search'

export const Route = createFileRoute('/customers/')({
  validateSearch: customerListSearchSchema,
  component: CustomersPage,
})

function CustomersPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const { data, isPending, isError, error, refetch, isRefetching } = useQuery(
    customersQueryOptions(),
  )

  // Filters, sorting and pagination live in the URL so views are shareable.
  const updateSearch = (patch: CustomerListSearch) =>
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
    })

  return (
    <>
      <PageHeader
        title="Customers"
        description={
          data
            ? `${data.length} ${data.length === 1 ? 'customer' : 'customers'}`
            : 'Every account in one place.'
        }
        actions={
          <>
            <MockDataBadge />
            <Link to="/customers/new" className={buttonVariants()}>
              <Plus aria-hidden />
              Add customer
            </Link>
          </>
        }
      />
      {isPending ? (
        <CustomerTableSkeleton />
      ) : isError ? (
        <Card>
          <ErrorState
            title="Customers could not be loaded"
            description={error.message}
            onRetry={() => void refetch()}
            retrying={isRefetching}
          />
        </Card>
      ) : data.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add your first customer to start tracking plans, revenue and contacts."
            action={
              <Link to="/customers/new" className={buttonVariants()}>
                <Plus aria-hidden />
                Add customer
              </Link>
            }
          />
        </Card>
      ) : (
        <CustomerTable
          customers={data}
          search={search}
          onSearchChange={updateSearch}
        />
      )}
    </>
  )
}
