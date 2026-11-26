/**
 * Customer server functions. They run on the server only and are backed by
 * the in-memory MOCK store in `mock-db.ts` — there is no real backend.
 */
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { mockDb } from './mock-db'
import { customerInputSchema } from './types'

// Simulated network latency so loading states are visible with mock data.
const MOCK_LATENCY_MS = 400
const latency = () =>
  new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

const idSchema = z.object({ id: z.string().min(1) })

export const listCustomers = createServerFn({ method: 'GET' }).handler(
  async () => {
    await latency()
    return mockDb.list()
  },
)

export const getCustomer = createServerFn({ method: 'GET' })
  .validator(idSchema)
  .handler(async ({ data }) => {
    await latency()
    return mockDb.get(data.id) ?? null
  })

export const createCustomer = createServerFn({ method: 'POST' })
  .validator(customerInputSchema)
  .handler(async ({ data }) => {
    await latency()
    return mockDb.create(data)
  })

export const updateCustomer = createServerFn({ method: 'POST' })
  .validator(idSchema.extend({ input: customerInputSchema }))
  .handler(async ({ data }) => {
    await latency()
    const updated = mockDb.update(data.id, data.input)
    if (!updated) throw new Error('This customer no longer exists.')
    return updated
  })

export const deleteCustomer = createServerFn({ method: 'POST' })
  .validator(idSchema)
  .handler(async ({ data }) => {
    await latency()
    if (!mockDb.remove(data.id)) {
      throw new Error('This customer no longer exists.')
    }
    return { id: data.id }
  })
