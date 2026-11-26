import { Link, createFileRoute } from '@tanstack/react-router'

import {
  CustomerForm,
  EMPTY_CUSTOMER,
} from '#/components/customers/CustomerForm'
import { BackToCustomers } from '#/components/customers/route-states'
import { PageHeader } from '#/components/layout/AppShell'
import { buttonVariants } from '#/components/ui/button'
import { useCreateCustomer } from '#/lib/customers/queries'

export const Route = createFileRoute('/customers/new')({
  component: NewCustomerPage,
})

function NewCustomerPage() {
  const navigate = Route.useNavigate()
  const createCustomer = useCreateCustomer()

  return (
    <div className="max-w-4xl">
      <PageHeader
        back={<BackToCustomers />}
        title="Add customer"
        description="Create a new customer record."
      />
      <CustomerForm
        initialValues={EMPTY_CUSTOMER}
        submitLabel="Create customer"
        submittingLabel="Creating…"
        onSubmit={async (values) => {
          const customer = await createCustomer.mutateAsync(values)
          await navigate({
            to: '/customers/$customerId',
            params: { customerId: customer.id },
          })
        }}
        cancel={
          <Link
            to="/customers"
            className={buttonVariants({ variant: 'outline' })}
          >
            Cancel
          </Link>
        }
      />
    </div>
  )
}
