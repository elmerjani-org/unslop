import { z } from 'zod'

import { CUSTOMER_PLANS, CUSTOMER_STATUSES } from './types'

export const SORT_KEYS = [
  'name',
  'status',
  'plan',
  'mrr',
  'seats',
  'owner',
  'lastActivityAt',
] as const
export type SortKey = (typeof SORT_KEYS)[number]

export const PAGE_SIZES = [10, 20, 50] as const
export const DEFAULT_PAGE_SIZE = 10

// URL state for the customer list. Every key is optional and invalid values
// fall back to "unset" so a hand-edited URL never breaks the page.
export const customerListSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  status: z.enum(CUSTOMER_STATUSES).optional().catch(undefined),
  plan: z.enum(CUSTOMER_PLANS).optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
  size: z
    .union([z.literal(10), z.literal(20), z.literal(50)])
    .optional()
    .catch(undefined),
  sort: z.enum(SORT_KEYS).optional().catch(undefined),
  dir: z.enum(['asc', 'desc']).optional().catch(undefined),
})

export type CustomerListSearch = z.infer<typeof customerListSearchSchema>
