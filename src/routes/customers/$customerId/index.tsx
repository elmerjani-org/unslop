import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { Pencil, Trash2 } from 'lucide-react'
import { useId, useState } from 'react'
import type { ReactNode } from 'react'

import { StatusBadge } from '#/components/customers/StatusBadge'
import {
  BackToCustomers,
  CustomerNotFound,
  CustomerRouteError,
  CustomerRoutePending,
} from '#/components/customers/route-states'
import { PageHeader } from '#/components/layout/AppShell'
import { Button, buttonVariants, focusRing } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import { ConfirmDialog } from '#/components/ui/dialog'
import {
  customerKeys,
  customerQueryOptions,
  useDeleteCustomer,
} from '#/lib/customers/queries'
import { PLAN_LABELS } from '#/lib/customers/types'
import { formatCurrency, formatDate, formatNumber } from '#/lib/format'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/customers/$customerId/')({
  loader: async ({ context, params }) => {
    const customer = await context.queryClient.ensureQueryData(
      customerQueryOptions(params.customerId),
    )
    if (!customer) throw notFound()
  },
  pendingMs: 150,
  pendingComponent: CustomerRoutePending,
  errorComponent: CustomerRouteError,
  notFoundComponent: CustomerNotFound,
  component: CustomerDetailPage,
})

// A headline figure in the strip at the top of the sheet.
function Figure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="px-5 py-4 sm:px-6">
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-display text-2xl leading-7 font-semibold tabular-nums">
        {children}
      </dd>
    </div>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-[13px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm break-words">{children}</dd>
    </div>
  )
}

// Same band rhythm as the edit form, so view and edit read as one record.
function Section({ title, children }: { title: string; children: ReactNode }) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className="grid gap-x-10 gap-y-4 border-b px-5 py-6 last:border-b-0 sm:px-6 md:grid-cols-[13rem_1fr]"
    >
      <h2 id={id} className="text-sm font-semibold">
        {title}
      </h2>
      {children}
    </section>
  )
}

function CustomerDetailPage() {
  const { customerId } = Route.useParams()
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const { data: customer } = useSuspenseQuery(customerQueryOptions(customerId))
  const deleteCustomer = useDeleteCustomer()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (!customer) return <CustomerNotFound />

  const handleDelete = async () => {
    try {
      await deleteCustomer.mutateAsync(customerId)
    } catch {
      return // surfaced in the dialog via deleteCustomer.error
    }
    await navigate({ to: '/customers' })
    queryClient.removeQueries({ queryKey: customerKeys.detail(customerId) })
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        back={<BackToCustomers />}
        title={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {customer.name}
            <span className="font-sans">
              <StatusBadge status={customer.status} />
            </span>
          </span>
        }
        description={
          <span className="flex flex-wrap gap-x-5 gap-y-1">
            <span>{customer.domain}</span>
            <span>Customer since {formatDate(customer.createdAt)}</span>
            <span className="tabular-nums">ID {customer.id}</span>
          </span>
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                deleteCustomer.reset()
                setConfirmingDelete(true)
              }}
            >
              <Trash2 aria-hidden />
              Delete
            </Button>
            <Link
              to="/customers/$customerId/edit"
              params={{ customerId }}
              className={buttonVariants()}
            >
              <Pencil aria-hidden />
              Edit
            </Link>
          </>
        }
      />

      <Card className="overflow-hidden">
        <dl className="grid grid-cols-2 border-b max-sm:[&>div:nth-child(-n+2)]:border-b max-sm:[&>div:nth-child(odd)]:border-r sm:grid-cols-4 sm:divide-x">
          <Figure label="Plan">{PLAN_LABELS[customer.plan]}</Figure>
          <Figure label="MRR">{formatCurrency(customer.mrr)}</Figure>
          <Figure label="ARR">{formatCurrency(customer.mrr * 12)}</Figure>
          <Figure label="Seats">{formatNumber(customer.seats)}</Figure>
        </dl>

        <Section title="Company">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Detail label="Industry">{customer.industry}</Detail>
            <Detail label="Country">{customer.country}</Detail>
            <Detail label="Account owner">{customer.owner}</Detail>
            <Detail label="Last activity">
              {formatDate(customer.lastActivityAt)}
            </Detail>
          </dl>
        </Section>

        <Section title="Primary contact">
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <Detail label="Name">{customer.contactName}</Detail>
            <Detail label="Email">
              <a
                href={`mailto:${customer.contactEmail}`}
                className={cn(
                  'rounded-sm text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary',
                  focusRing,
                )}
              >
                {customer.contactEmail}
              </a>
            </Detail>
          </dl>
        </Section>

        <Section title="Notes">
          {customer.notes ? (
            <p className="max-w-prose text-sm leading-relaxed whitespace-pre-wrap">
              {customer.notes}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              No notes yet. Add context for your team from the edit page.
            </p>
          )}
        </Section>
      </Card>

      <ConfirmDialog
        open={confirmingDelete}
        title={`Delete ${customer.name}?`}
        description="This removes the customer and everything recorded about them. It can’t be undone."
        confirmLabel="Delete customer"
        pendingLabel="Deleting…"
        cancelLabel="Keep customer"
        pending={deleteCustomer.isPending}
        error={
          deleteCustomer.isError
            ? `The customer could not be deleted: ${deleteCustomer.error.message}`
            : undefined
        }
        onConfirm={() => void handleDelete()}
        onClose={() => setConfirmingDelete(false)}
      />
    </div>
  )
}
