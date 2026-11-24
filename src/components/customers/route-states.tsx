import { Link, useRouter } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { ArrowLeft, UserX } from 'lucide-react'
import { useState } from 'react'

import { EmptyState, ErrorState } from '#/components/states'
import { buttonVariants, focusRing } from '#/components/ui/button'
import { Card, Skeleton } from '#/components/ui/card'
import { cn } from '#/lib/utils'

export function BackToCustomers() {
  return (
    <Link
      to="/customers"
      className={cn(
        'group inline-flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-muted-foreground no-underline transition-colors duration-150 hover:text-foreground',
        focusRing,
      )}
    >
      <ArrowLeft
        aria-hidden
        className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5"
      />
      Customers
    </Link>
  )
}

// Mirrors the detail sheet: heading, figures strip, then ruled sections.
export function CustomerRoutePending() {
  return (
    <div aria-busy aria-label="Loading customer" className="max-w-4xl">
      <Skeleton className="mb-4 h-3.5 w-20" />
      <Skeleton className="h-8 w-72 max-w-full" />
      <Skeleton className="mt-2.5 mb-6 h-3.5 w-56 max-w-full" />
      <Card className="overflow-hidden">
        <div className="grid grid-cols-2 border-b sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="px-5 py-4">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="mt-2.5 h-6 w-20" />
            </div>
          ))}
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="grid gap-x-10 gap-y-4 border-b px-5 py-6 last:border-b-0 sm:px-6 md:grid-cols-[13rem_1fr]"
          >
            <Skeleton className="h-4 w-24" />
            <div className="grid gap-5 sm:grid-cols-2">
              <Skeleton className="h-9" />
              <Skeleton className="h-9" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

export function CustomerRouteError({ error }: ErrorComponentProps) {
  const router = useRouter()
  const [retrying, setRetrying] = useState(false)

  return (
    <div className="max-w-4xl">
      <div className="mb-3">
        <BackToCustomers />
      </div>
      <Card>
        <ErrorState
          title="This customer could not be loaded"
          description={
            error instanceof Error && error.message
              ? error.message
              : 'The request failed. Check your connection and try again.'
          }
          retrying={retrying}
          onRetry={() => {
            setRetrying(true)
            void router.invalidate().finally(() => setRetrying(false))
          }}
        />
      </Card>
    </div>
  )
}

export function CustomerNotFound() {
  return (
    <Card className="max-w-4xl">
      <EmptyState
        icon={UserX}
        title="Customer not found"
        description="This customer does not exist or has been deleted."
        action={
          <Link to="/customers" className={buttonVariants()}>
            Back to customers
          </Link>
        }
      />
    </Card>
  )
}
