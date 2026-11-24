import { CircleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

// Empty and error states read as a short note on the sheet, left-aligned
// with the rest of the content, with one clear next step.
const stateClass = 'max-w-lg px-5 py-10 sm:px-8 sm:py-12'

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn(stateClass, className)}>
      <Icon aria-hidden className="size-5 text-muted-foreground" />
      <h2 className="mt-3 text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  retrying,
  className,
}: {
  title?: string
  description: string
  onRetry?: () => void
  retrying?: boolean
  className?: string
}) {
  return (
    <div role="alert" className={cn(stateClass, className)}>
      <CircleAlert aria-hidden className="size-5 text-destructive" />
      <h2 className="mt-3 text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {onRetry ? (
        <Button
          variant="outline"
          className="mt-5"
          onClick={onRetry}
          disabled={retrying}
        >
          {retrying ? 'Retrying…' : 'Try again'}
        </Button>
      ) : null}
    </div>
  )
}

/** Marks screens whose records come from the in-memory mock store. */
export function MockDataBadge() {
  return (
    <span
      title="Records are fictional, held in server memory and reset on restart."
      className="inline-flex h-9 items-center gap-2 rounded-md border border-dashed border-input px-2.5 text-[13px] font-medium text-muted-foreground"
    >
      <span aria-hidden className="size-1.5 rounded-full bg-status-past-due" />
      Mock data
    </span>
  )
}
