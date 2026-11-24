import { describe, expect, it } from 'vitest'

import { mockDb } from './mock-db'
import type { CustomerInput } from './types'

const input: CustomerInput = {
  name: 'Test Co',
  domain: 'test.co',
  industry: 'Software',
  plan: 'growth',
  status: 'trial',
  mrr: 100,
  seats: 5,
  contactName: 'Pat Lee',
  contactEmail: 'pat@test.co',
  country: 'Spain',
  owner: 'Priya Nair',
  notes: '',
}

describe('mockDb', () => {
  it('lists customers newest first', () => {
    const list = mockDb.list()
    expect(list.length).toBeGreaterThan(0)
    for (let i = 1; i < list.length; i++) {
      expect(list[i - 1].createdAt >= list[i].createdAt).toBe(true)
    }
  })

  it('creates, reads, updates and removes a customer', () => {
    const created = mockDb.create(input)
    expect(created.id).toMatch(/^cus_/)
    expect(mockDb.get(created.id)).toEqual(created)

    const updated = mockDb.update(created.id, { ...input, name: 'Renamed' })
    expect(updated?.name).toBe('Renamed')
    expect(updated?.createdAt).toBe(created.createdAt)

    expect(mockDb.remove(created.id)).toBe(true)
    expect(mockDb.get(created.id)).toBeUndefined()
  })

  it('handles unknown ids', () => {
    expect(mockDb.update('missing', input)).toBeUndefined()
    expect(mockDb.remove('missing')).toBe(false)
  })
})
