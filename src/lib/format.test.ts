import { describe, expect, it } from 'vitest'

import { formatCurrency, formatDate, formatNumber } from './format'

describe('format', () => {
  it('formats currency in whole USD', () => {
    expect(formatCurrency(1234.56)).toBe('$1,235')
    expect(formatCurrency(0)).toBe('$0')
  })

  it('formats numbers with thousands separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('formats ISO dates in UTC', () => {
    expect(formatDate('2025-03-09T23:59:59.000Z')).toBe('Mar 9, 2025')
  })
})
