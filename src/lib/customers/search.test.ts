import { describe, expect, it } from 'vitest'

import { customerListSearchSchema } from './search'

describe('customerListSearchSchema', () => {
  it('accepts valid values', () => {
    expect(
      customerListSearchSchema.parse({
        q: 'acme',
        status: 'trial',
        plan: 'growth',
        page: 2,
        size: 20,
        sort: 'mrr',
        dir: 'desc',
      }),
    ).toEqual({
      q: 'acme',
      status: 'trial',
      plan: 'growth',
      page: 2,
      size: 20,
      sort: 'mrr',
      dir: 'desc',
    })
  })

  it('falls back to undefined for invalid values', () => {
    const result = customerListSearchSchema.parse({
      status: 'bogus',
      plan: 1,
      page: 0,
      size: 15,
      sort: 'nope',
      dir: 'sideways',
    })
    expect(result).toEqual({
      q: undefined,
      status: undefined,
      plan: undefined,
      page: undefined,
      size: undefined,
      sort: undefined,
      dir: undefined,
    })
  })
})
