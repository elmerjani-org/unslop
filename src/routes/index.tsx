import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Plus, Users } from 'lucide-react'
import type { ReactNode } from 'react'

import { StatusBadge } from '#/components/customers/StatusBadge'
import { PageHeader } from '#/components/layout/AppShell'
import { EmptyState, ErrorState, MockDataBadge } from '#/components/states'
import { buttonVariants, focusRing } from '#/components/ui/button'
import { Card, CardHeader, CardTitle, Skeleton } from '#/components/ui/card'
import { customersQueryOptions } from '#/lib/customers/queries'
import { CUSTOMER_PLANS, PLAN_LABELS } from '#/lib/customers/types'
import type { Customer, CustomerPlan } from '#/lib/customers/types'
import { formatCurrency, formatDate, formatNumber } from '#/lib/format'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/')({ component: OverviewPage })

function OverviewPage() {
  const { data, isPending, isError, error, refetch, isRefetching } = useQuery(
    customersQueryOptions(),
  )

  return (
    <>
      <PageHeader
        title="Overview"
        description="Recurring revenue and account health across your customers."
        actions={<MockDataBadge />}
      />
      {isPending ? (
        <OverviewSkeleton />
      ) : isError ? (
        <Card>
          <ErrorState
            title="The overview could not be loaded"
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
            description="Add your first customer to see revenue and account health here."
            action={
              <Link to="/customers/new" className={buttonVariants()}>
                <Plus aria-hidden />
                Add customer
              </Link>
            }
          />
        </Card>
      ) : (
        <Overview customers={data} />
      )}
    </>
  )
}

// Plan tiers share the brand hue, darkest for the largest plan.
const PLAN_SWATCH: Record<CustomerPlan, string> = {
  enterprise: 'bg-chart-1',
  growth: 'bg-chart-2',
  starter: 'bg-chart-3',
}

const rowLinkClass = cn(
  'group flex items-center justify-between gap-4 px-5 py-2.5 text-foreground no-underline transition-colors duration-100 hover:bg-accent/60',
  focusRing,
  'focus-visible:-outline-offset-2',
)
const sheetLinkClass = cn(
  'rounded-sm text-[13px] font-medium text-primary underline-offset-4 hover:underline',
  focusRing,
)

function Stat({
  label,
  note,
  children,
}: {
  label: string
  note?: string
  children: ReactNode
}) {
  return (
    <div className="px-5 py-4 sm:px-6 lg:py-6">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-2xl leading-7 font-semibold tabular-nums">
        {children}
      </dd>
      {note ? (
        <dd className="mt-0.5 text-[13px] text-muted-foreground">{note}</dd>
      ) : null}
    </div>
  )
}

function Overview({ customers }: { customers: Array<Customer> }) {
  const active = customers.filter((c) => c.status === 'active').length
  const pastDue = customers
    .filter((c) => c.status === 'past_due')
    .sort((a, b) => b.mrr - a.mrr)
  const pastDueMrr = pastDue.reduce((sum, c) => sum + c.mrr, 0)
  const mrr = customers.reduce((sum, c) => sum + c.mrr, 0)
  // Largest plan first, matching the swatch order.
  const byPlan = [...CUSTOMER_PLANS].reverse().map((plan) => {
    const group = customers.filter((c) => c.plan === plan)
    const planMrr = group.reduce((sum, c) => sum + c.mrr, 0)
    return {
      plan,
      count: group.length,
      mrr: planMrr,
      share: mrr > 0 ? planMrr / mrr : 0,
    }
  })
  // The list query returns newest first.
  const recent = customers.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* One revenue statement rather than a row of separate tiles. */}
      <Card className="overflow-hidden">
        <dl className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
          <div className="border-b px-5 py-5 sm:px-6 lg:border-r lg:border-b-0 lg:py-6">
            <dt className="text-sm text-muted-foreground">
              Monthly recurring revenue
            </dt>
            <dd className="mt-1 font-display text-5xl leading-none font-semibold tabular-nums">
              {formatCurrency(mrr)}
            </dd>
            <dd className="mt-2 text-[13px] text-muted-foreground tabular-nums">
              {formatCurrency(mrr * 12)} annualised
            </dd>
          </div>
          <div className="grid grid-cols-3 divide-x">
            <Stat label="Customers">{formatNumber(customers.length)}</Stat>
            <Stat
              label="Active"
              note={`${Math.round((active / customers.length) * 100)}% of all`}
            >
              {formatNumber(active)}
            </Stat>
            <Stat
              label="Past due"
              note={`${pastDue.length} ${pastDue.length === 1 ? 'account' : 'accounts'}`}
            >
              {formatCurrency(pastDueMrr)}
            </Stat>
          </div>
        </dl>

        <section
          aria-labelledby="revenue-by-plan"
          className="border-t px-5 py-5 sm:px-6"
        >
          <h2 id="revenue-by-plan" className="text-sm font-semibold">
            Revenue by plan
          </h2>
          <div aria-hidden className="mt-3 flex h-2.5 gap-0.5">
            {byPlan
              .filter((p) => p.share > 0)
              .map((p) => (
                <div
                  key={p.plan}
                  className={cn(
                    'min-w-1 first:rounded-l-sm last:rounded-r-sm',
                    PLAN_SWATCH[p.plan],
                  )}
                  style={{ width: `${p.share * 100}%` }}
                />
              ))}
          </div>
          <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-3">
            {byPlan.map((p) => (
              <div key={p.plan} className="flex items-baseline gap-2.5">
                <span
                  aria-hidden
                  className={cn(
                    'size-2.5 shrink-0 translate-y-px rounded-[2px]',
                    PLAN_SWATCH[p.plan],
                  )}
                />
                <div className="min-w-0">
                  <dt className="text-sm font-medium">{PLAN_LABELS[p.plan]}</dt>
                  <dd className="text-[13px] text-muted-foreground tabular-nums">
                    {formatCurrency(p.mrr)}, {Math.round(p.share * 100)}% from{' '}
                    {p.count} {p.count === 1 ? 'customer' : 'customers'}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </section>
      </Card>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Past due</CardTitle>
            <Link
              to="/customers"
              search={{ status: 'past_due' }}
              className={sheetLinkClass}
            >
              View all
            </Link>
          </CardHeader>
          {pastDue.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              No accounts are past due.
            </p>
          ) : (
            <ul className="divide-y">
              {pastDue.slice(0, 5).map((customer) => (
                <li key={customer.id}>
                  <Link
                    to="/customers/$customerId"
                    params={{ customerId: customer.id }}
                    className={rowLinkClass}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium group-hover:text-primary">
                        {customer.name}
                      </span>
                      <span className="block truncate text-[13px] text-muted-foreground">
                        Owner: {customer.owner}
                      </span>
                    </span>
                    <span className="text-sm font-medium tabular-nums">
                      {formatCurrency(customer.mrr)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Recently added</CardTitle>
            <Link to="/customers" className={sheetLinkClass}>
              View all
            </Link>
          </CardHeader>
          <ul className="divide-y">
            {recent.map((customer) => (
              <li key={customer.id}>
                <Link
                  to="/customers/$customerId"
                  params={{ customerId: customer.id }}
                  className={rowLinkClass}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium group-hover:text-primary">
                      {customer.name}
                    </span>
                    <span className="block text-[13px] text-muted-foreground tabular-nums">
                      Added {formatDate(customer.createdAt)}
                    </span>
                  </span>
                  <StatusBadge status={customer.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading overview">
      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
          <div className="border-b px-5 py-5 sm:px-6 lg:border-r lg:border-b-0 lg:py-6">
            <Skeleton className="h-4 w-44 max-w-full" />
            <Skeleton className="mt-3 h-11 w-48 max-w-full" />
          </div>
          <div className="grid grid-cols-3 divide-x">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="px-5 py-4 sm:px-6 lg:py-6">
                <Skeleton className="h-3.5 w-16 max-w-full" />
                <Skeleton className="mt-2.5 h-6 w-14 max-w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t px-5 py-5 sm:px-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-2.5 w-full" />
        </div>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="flex h-12 items-center border-b px-5">
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }, (__, j) => (
                <div key={j} className="px-5 py-2.5">
                  <Skeleton className="h-3.5 w-40 max-w-full" />
                  <Skeleton className="mt-2 h-3 w-24" />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
