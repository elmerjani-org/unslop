import { STATUS_LABELS } from '#/lib/customers/types'
import type { CustomerStatus } from '#/lib/customers/types'
import { cn } from '#/lib/utils'

export const STATUS_DOT_CLASS: Record<CustomerStatus, string> = {
  active: 'bg-status-active',
  trial: 'bg-status-trial',
  past_due: 'bg-status-past-due',
  churned: 'bg-status-churned',
}

// A coloured dot plus the label: the label carries the meaning, the dot
// makes a column of statuses scannable.
export function StatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-[13px] font-medium whitespace-nowrap',
        status === 'churned' && 'text-muted-foreground',
      )}
    >
      <span
        aria-hidden
        className={cn('size-2 rounded-full', STATUS_DOT_CLASS[status])}
      />
      {STATUS_LABELS[status]}
    </span>
  )
}
