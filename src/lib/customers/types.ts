import { z } from 'zod'

export const CUSTOMER_STATUSES = [
  'active',
  'trial',
  'past_due',
  'churned',
] as const
export type CustomerStatus = (typeof CUSTOMER_STATUSES)[number]

export const CUSTOMER_PLANS = ['starter', 'growth', 'enterprise'] as const
export type CustomerPlan = (typeof CUSTOMER_PLANS)[number]

export const STATUS_LABELS: Record<CustomerStatus, string> = {
  active: 'Active',
  trial: 'Trial',
  past_due: 'Past due',
  churned: 'Churned',
}

export const PLAN_LABELS: Record<CustomerPlan, string> = {
  starter: 'Starter',
  growth: 'Growth',
  enterprise: 'Enterprise',
}

export const INDUSTRIES = [
  'Software',
  'Healthcare',
  'Logistics',
  'Finance',
  'Retail',
  'Manufacturing',
  'Media',
  'Energy',
  'Education',
  'Hospitality',
] as const

// Shared by the create/edit form (TanStack Form) and the server functions.
export const customerInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(80, 'Company name must be 80 characters or fewer'),
  domain: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i, 'Enter a domain like acme.com'),
  industry: z.string().trim().min(1, 'Select an industry'),
  plan: z.enum(CUSTOMER_PLANS),
  status: z.enum(CUSTOMER_STATUSES),
  mrr: z
    .number({ error: 'Enter monthly revenue as a number' })
    .min(0, 'Monthly revenue cannot be negative')
    .max(1_000_000, 'Monthly revenue must be 1,000,000 or less'),
  seats: z
    .number({ error: 'Enter the number of seats' })
    .int('Seats must be a whole number')
    .min(1, 'At least 1 seat is required')
    .max(100_000, 'Seats must be 100,000 or fewer'),
  contactName: z.string().trim().min(2, 'Enter the contact’s full name'),
  contactEmail: z.email('Enter a valid email address'),
  country: z.string().trim().min(2, 'Enter a country'),
  owner: z.string().trim().min(2, 'Enter the account owner'),
  notes: z.string().max(1000, 'Notes must be 1,000 characters or fewer'),
})

export type CustomerInput = z.infer<typeof customerInputSchema>

export interface Customer extends CustomerInput {
  id: string
  createdAt: string
  lastActivityAt: string
}
