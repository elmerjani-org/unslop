import { describe, expect, it } from 'vitest'

import { customerInputSchema } from './types'
import type { CustomerInput } from './types'

const valid: CustomerInput = {
  name: 'Acme Corp',
  domain: 'acme.com',
  industry: 'Software',
  plan: 'starter',
  status: 'active',
  mrr: 500,
  seats: 10,
  contactName: 'Jane Doe',
  contactEmail: 'jane@acme.com',
  country: 'France',
  owner: 'Maya Chen',
  notes: '',
}

const errorFor = (patch: Partial<Record<keyof CustomerInput, unknown>>) => {
  const result = customerInputSchema.safeParse({ ...valid, ...patch })
  return result.success ? null : result.error.issues[0].message
}

describe('customerInputSchema', () => {
  it('accepts a valid customer', () => {
    expect(customerInputSchema.safeParse(valid).success).toBe(true)
  })

  it('trims text fields', () => {
    const parsed = customerInputSchema.parse({ ...valid, name: '  Acme  ' })
    expect(parsed.name).toBe('Acme')
  })

  it('rejects bad values with helpful messages', () => {
    expect(errorFor({ name: 'A' })).toMatch(/at least 2/)
    expect(errorFor({ domain: 'nodot' })).toMatch(/domain/)
    expect(errorFor({ contactEmail: 'nope' })).toMatch(/email/i)
    expect(errorFor({ mrr: -1 })).toMatch(/negative/)
    expect(errorFor({ seats: 0 })).toMatch(/At least 1/)
    expect(errorFor({ seats: 1.5 })).toMatch(/whole number/)
    expect(errorFor({ plan: 'free' })).not.toBeNull()
  })
})
