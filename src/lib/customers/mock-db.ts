/**
 * MOCK DATA — there is no real backend.
 *
 * Every company, person and figure below is fictional and generated
 * deterministically. Records live in server memory only and reset whenever
 * the server restarts. Replace this module (and only this module) with a real
 * data source; `api.ts` is the single consumer.
 */
import type { Customer, CustomerInput, CustomerPlan } from './types'

const SEEDS: Array<[name: string, industry: string, country: string]> = [
  ['Northpeak Logistics', 'Logistics', 'United States'],
  ['Brightwater Health', 'Healthcare', 'Canada'],
  ['Quillon Analytics', 'Software', 'United Kingdom'],
  ['Harborline Freight', 'Logistics', 'Netherlands'],
  ['Sablewood Studios', 'Media', 'United States'],
  ['Tessera Robotics', 'Manufacturing', 'Germany'],
  ['Lumenfield Energy', 'Energy', 'Norway'],
  ['Copperleaf Foods', 'Retail', 'United States'],
  ['Vantor Systems', 'Software', 'France'],
  ['Maplegate Finance', 'Finance', 'Canada'],
  ['Orchard and Pine', 'Retail', 'Australia'],
  ['Skyforge Components', 'Manufacturing', 'United States'],
  ['Bluecairn Software', 'Software', 'Ireland'],
  ['Fernhollow Retail', 'Retail', 'United Kingdom'],
  ['Ironbridge Capital', 'Finance', 'Switzerland'],
  ['Larkfield Media', 'Media', 'United States'],
  ['Kestrel Biolabs', 'Healthcare', 'Sweden'],
  ['Larkspur Hotels', 'Hospitality', 'Spain'],
  ['Mossgrove Learning', 'Education', 'United States'],
  ['Novatide Marine', 'Logistics', 'Singapore'],
  ['Opaline Cosmetics', 'Retail', 'France'],
  ['Pinecrest Insurance', 'Finance', 'United States'],
  ['Quartzline Materials', 'Manufacturing', 'Australia'],
  ['Riverbend Telecom', 'Software', 'Brazil'],
  ['Stonemill Bakeries', 'Hospitality', 'Germany'],
  ['Thistledown Travel', 'Hospitality', 'United Kingdom'],
  ['Umberfield Agritech', 'Manufacturing', 'Netherlands'],
  ['Vellum Works', 'Media', 'Canada'],
  ['Westmarch Security', 'Software', 'United States'],
  ['Yarrow Clinics', 'Healthcare', 'Ireland'],
  ['Zephyr Mobility', 'Logistics', 'Japan'],
  ['Alderpoint Academy', 'Education', 'United States'],
  ['Birchline Construction', 'Manufacturing', 'Canada'],
  ['Cinderpath Games', 'Media', 'Sweden'],
  ['Dovecote Furnishings', 'Retail', 'Denmark'],
  ['Emberglow Power', 'Energy', 'United States'],
  ['Foxhollow Grid', 'Energy', 'Germany'],
  ['Glasswing Tutors', 'Education', 'India'],
]

const FIRST_NAMES = ['Avery', 'Noor', 'Mateo', 'Ingrid', 'Kofi', 'Hana', 'Luca']
const LAST_NAMES = ['Lindqvist', 'Okafor', 'Marchetti', 'Tanaka', 'Brandt']
const OWNERS = ['Maya Chen', 'Jonas Weber', 'Priya Nair', 'Tomás Alvarez']
const PLANS: Array<CustomerPlan> = ['growth', 'starter', 'enterprise', 'growth']
const SEAT_PRICE: Record<CustomerPlan, number> = {
  starter: 19,
  growth: 39,
  enterprise: 69,
}

const DAY = 86_400_000
// Fixed reference date so the mock data is identical on every start.
const BASE = Date.UTC(2026, 10, 20)

function seed(): Array<Customer> {
  return SEEDS.map(([name, industry, country], i) => {
    const plan = PLANS[(i * 3 + (i % 5)) % PLANS.length]
    const status =
      i % 11 === 10
        ? 'churned'
        : i % 7 === 6
          ? 'past_due'
          : i % 4 === 3
            ? 'trial'
            : 'active'
    const seats =
      plan === 'starter'
        ? 3 + ((i * 5) % 13)
        : plan === 'growth'
          ? 20 + ((i * 7) % 60)
          : 120 + ((i * 53) % 780)
    const contactName = `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[i % LAST_NAMES.length]}`
    // `.example` is a reserved TLD: these domains and addresses cannot exist.
    const domain = `${name.toLowerCase().replace(/[^a-z]+/g, '')}.example`

    return {
      id: `cus_${1001 + i}`,
      name,
      domain,
      industry,
      plan,
      status,
      mrr:
        status === 'churned' || status === 'trial'
          ? 0
          : seats * SEAT_PRICE[plan],
      seats,
      contactName,
      contactEmail: `${contactName.toLowerCase().replace(' ', '.')}@${domain}`,
      country,
      owner: OWNERS[(i * 3) % OWNERS.length],
      notes:
        i % 3 === 0
          ? 'Mock note: renewal conversation scheduled for next quarter.'
          : '',
      createdAt: new Date(BASE - (i * 23 + 4) * DAY).toISOString(),
      lastActivityAt: new Date(BASE - ((i * 5) % 37) * DAY).toISOString(),
    }
  })
}

let customers = seed()
let nextId = 1001 + customers.length

export const mockDb = {
  list(): Array<Customer> {
    return [...customers].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },
  get(id: string): Customer | undefined {
    return customers.find((c) => c.id === id)
  },
  create(input: CustomerInput): Customer {
    const now = new Date().toISOString()
    const customer: Customer = {
      ...input,
      id: `cus_${nextId++}`,
      createdAt: now,
      lastActivityAt: now,
    }
    customers = [...customers, customer]
    return customer
  },
  update(id: string, input: CustomerInput): Customer | undefined {
    const existing = mockDb.get(id)
    if (!existing) return undefined
    const updated: Customer = {
      ...existing,
      ...input,
      lastActivityAt: new Date().toISOString(),
    }
    customers = customers.map((c) => (c.id === id ? updated : c))
    return updated
  },
  remove(id: string): boolean {
    const before = customers.length
    customers = customers.filter((c) => c.id !== id)
    return customers.length < before
  },
}
