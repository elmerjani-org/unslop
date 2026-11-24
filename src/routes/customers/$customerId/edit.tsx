import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'

import { CustomerForm } from '#/components/customers/CustomerForm'
import {
  BackToCustomers,
  CustomerNotFound,
  CustomerRouteError,
  CustomerRoutePending,
} from '#/components/customers/route-states'
import { PageHeader } from '#/components/layout/AppShell'
import { buttonVariants } from '#/components/ui/button'
import {
  customerQueryOptions,
  useUpdateCustomer,
} from '#/lib/customers/queries'

export const Route = createFileRoute('/customers/$customerId/edit')({
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
  component: EditCustomerPage,
})

function EditCustomerPage() {
  const { customerId } = Route.useParams()
  const navigate = Route.useNavigate()
  const { data: customer } = useSuspenseQuery(customerQueryOptions(customerId))
  const updateCustomer = useUpdateCustomer(customerId)

  if (!customer) return <CustomerNotFound />

  const {
    id: _id,
    createdAt: _createdAt,
    lastActivityAt: _last,
    ...values
  } = customer

  return (
    <div className="max-w-4xl">
      <PageHeader
        back={<BackToCustomers />}
        title={`Edit ${customer.name}`}
        description="Update this customer’s details."
      />
      <CustomerForm
        initialValues={values}
        submitLabel="Save changes"
        submittingLabel="Saving…"
        onSubmit={async (input) => {
          await updateCustomer.mutateAsync(input)
          await navigate({
            to: '/customers/$customerId',
            params: { customerId },
          })
        }}
        cancel={
          <Link
            to="/customers/$customerId"
            params={{ customerId }}
            className={buttonVariants({ variant: 'outline' })}
          >
            Cancel
          </Link>
        }
      />
    </div>
  )
}
