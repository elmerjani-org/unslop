import { useEffect, useId, useRef } from 'react'

import { Button } from '#/components/ui/button'

/**
 * Confirmation dialog built on the native <dialog> element, which provides
 * the focus trap, Esc to close and inert background without a dependency.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  cancelLabel,
  pending = false,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  pendingLabel: string
  cancelLabel: string
  pending?: boolean
  error?: string
  onConfirm: () => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onClose={onClose}
      onCancel={(e) => {
        // Esc must not dismiss the dialog mid-request.
        if (pending) e.preventDefault()
      }}
      onClick={(e) => {
        // The dialog has no padding, so a direct hit is the backdrop.
        if (e.target === e.currentTarget && !pending) onClose()
      }}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-lg border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-sidebar/50 open:animate-in open:duration-150 open:fade-in-0 open:zoom-in-95"
    >
      <div className="px-5 pt-5 pb-4">
        <h2 id={`${id}-title`} className="text-base font-semibold">
          {title}
        </h2>
        <p
          id={`${id}-description`}
          className="mt-1.5 text-sm leading-relaxed text-muted-foreground"
        >
          {description}
        </p>
        {error ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col-reverse gap-2 border-t bg-background px-5 py-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          autoFocus
          disabled={pending}
          onClick={onClose}
        >
          {cancelLabel}
        </Button>
        <Button variant="destructive" disabled={pending} onClick={onConfirm}>
          {pending ? pendingLabel : confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
