import { useForm } from '@tanstack/react-form'
import { CircleAlert } from 'lucide-react'
import { useId, useState } from 'react'
import type { ReactNode } from 'react'

import { Button } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import { Input, Label, Select, Textarea } from '#/components/ui/input'
import {
  CUSTOMER_PLANS,
  CUSTOMER_STATUSES,
  INDUSTRIES,
  PLAN_LABELS,
  STATUS_LABELS,
  customerInputSchema,
} from '#/lib/customers/types'
import type {
  CustomerInput,
  CustomerPlan,
  CustomerStatus,
} from '#/lib/customers/types'

export const EMPTY_CUSTOMER: CustomerInput = {
  name: '',
  domain: '',
  industry: '',
  plan: 'starter',
  status: 'trial',
  mrr: 0,
  seats: 1,
  contactName: '',
  contactEmail: '',
  country: '',
  owner: '',
  notes: '',
}

interface FieldMeta {
  isTouched: boolean
  errors: Array<{ message?: string } | undefined>
}

// Label + control + validation message. Errors appear once a field is touched
// (or on submit, which touches every field).
function FormField({
  label,
  hint,
  meta,
  className,
  children,
}: {
  label: string
  hint?: string
  meta: FieldMeta
  className?: string
  children: (control: {
    id: string
    'aria-invalid': boolean
    'aria-describedby': string | undefined
  }) => ReactNode
}) {
  const id = useId()
  const error = meta.isTouched ? meta.errors.at(0)?.message : undefined
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-2">
        {children({
          id,
          'aria-invalid': Boolean(error),
          'aria-describedby': describedBy,
        })}
      </div>
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex items-start gap-1.5 text-[13px] text-destructive"
        >
          <CircleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p
          id={`${id}-hint`}
          className="mt-1.5 text-[13px] text-muted-foreground"
        >
          {hint}
        </p>
      ) : null}
    </div>
  )
}

// One ruled band of the form sheet: what the section is on the left, its
// fields on the right. The customer detail page uses the same rhythm.
function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  const id = useId()
  return (
    <section
      aria-labelledby={id}
      className="grid gap-x-10 gap-y-5 border-b px-5 py-6 sm:px-6 md:grid-cols-[13rem_1fr]"
    >
      <div>
        <h2 id={id} className="text-sm font-semibold">
          {title}
        </h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="grid content-start gap-5 sm:grid-cols-2">{children}</div>
    </section>
  )
}

export function CustomerForm({
  initialValues,
  submitLabel,
  submittingLabel,
  onSubmit,
  cancel,
}: {
  initialValues: CustomerInput
  submitLabel: string
  submittingLabel: string
  onSubmit: (values: CustomerInput) => Promise<void>
  /** Cancel control (a router Link) rendered beside the submit button. */
  cancel: ReactNode
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: initialValues,
    validators: { onChange: customerInputSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(null)
      try {
        await onSubmit(customerInputSchema.parse(value))
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'The customer could not be saved. Try again.',
        )
      }
    },
  })

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        const formElement = e.currentTarget
        // After a rejected submit, take the user to the first problem.
        void form.handleSubmit().then(() => {
          requestAnimationFrame(() => {
            formElement
              .querySelector<HTMLElement>('[aria-invalid="true"]')
              ?.focus()
          })
        })
      }}
    >
      <Card className="overflow-hidden">
        <FormSection title="Company" description="Who the customer is.">
          <form.Field name="name">
            {(field) => (
              <FormField label="Company name" meta={field.state.meta}>
                {(control) => (
                  <Input
                    {...control}
                    autoComplete="organization"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>
            )}
          </form.Field>
          <form.Field name="domain">
            {(field) => (
              <FormField
                label="Domain"
                hint="Without https://, for example acme.com"
                meta={field.state.meta}
              >
                {(control) => (
                  <Input
                    {...control}
                    inputMode="url"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>
            )}
          </form.Field>
          <form.Field name="industry">
            {(field) => (
              <FormField label="Industry" meta={field.state.meta}>
                {(control) => (
                  <Select
                    {...control}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  >
                    <option value="">Select an industry</option>
                    {INDUSTRIES.map((industry) => (
                      <option key={industry} value={industry}>
                        {industry}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
            )}
          </form.Field>
          <form.Field name="country">
            {(field) => (
              <FormField label="Country" meta={field.state.meta}>
                {(control) => (
                  <Input
                    {...control}
                    autoComplete="country-name"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>
            )}
          </form.Field>
        </FormSection>

        <FormSection
          title="Subscription"
          description="Plan, billing status and size."
        >
          <form.Field name="plan">
            {(field) => (
              <FormField label="Plan" meta={field.state.meta}>
                {(control) => (
                  <Select
                    {...control}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value as CustomerPlan)
                    }
                  >
                    {CUSTOMER_PLANS.map((plan) => (
                      <option key={plan} value={plan}>
                        {PLAN_LABELS[plan]}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
            )}
          </form.Field>
          <form.Field name="status">
            {(field) => (
              <FormField label="Status" meta={field.state.meta}>
                {(control) => (
                  <Select
                    {...control}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value as CustomerStatus)
                    }
                  >
                    {CUSTOMER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>
            )}
          </form.Field>
          <form.Field name="mrr">
            {(field) => (
              <FormField
                label="Monthly recurring revenue (USD)"
                meta={field.state.meta}
              >
                {(control) => (
                  <Input
                    {...control}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={
                      Number.isNaN(field.state.value) ? '' : field.state.value
                    }
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                  />
                )}
              </FormField>
            )}
          </form.Field>
          <form.Field name="seats">
            {(field) => (
              <FormField label="Seats" meta={field.state.meta}>
                {(control) => (
                  <Input
                    {...control}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={
                      Number.isNaN(field.state.value) ? '' : field.state.value
                    }
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                  />
                )}
              </FormField>
            )}
          </form.Field>
        </FormSection>

        <FormSection
          title="Relationship"
          description="The primary contact and who owns the account."
        >
          <form.Field name="contactName">
            {(field) => (
              <FormField label="Contact name" meta={field.state.meta}>
                {(control) => (
                  <Input
                    {...control}
                    autoComplete="off"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>
            )}
          </form.Field>
          <form.Field name="contactEmail">
            {(field) => (
              <FormField label="Contact email" meta={field.state.meta}>
                {(control) => (
                  <Input
                    {...control}
                    type="email"
                    autoComplete="off"
                    spellCheck={false}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>
            )}
          </form.Field>
          <form.Field name="owner">
            {(field) => (
              <FormField
                label="Account owner"
                hint="The teammate responsible for this customer"
                meta={field.state.meta}
              >
                {(control) => (
                  <Input
                    {...control}
                    autoComplete="off"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>
            )}
          </form.Field>
          <form.Field name="notes">
            {(field) => (
              <FormField
                label="Notes (optional)"
                meta={field.state.meta}
                className="sm:col-span-2"
              >
                {(control) => (
                  <Textarea
                    {...control}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </FormField>
            )}
          </form.Field>
        </FormSection>

        <div className="-mt-px flex flex-col gap-3 border-t bg-background px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {submitError ? (
            <p
              role="alert"
              className="flex items-start gap-1.5 text-sm text-destructive"
            >
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              {submitError}
            </p>
          ) : (
            <span />
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            {cancel}
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? submittingLabel : submitLabel}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </Card>
    </form>
  )
}
