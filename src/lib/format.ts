// Fixed locale and time zone keep server and client renders identical.
const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})
const number = new Intl.NumberFormat('en-US')
const date = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

export const formatCurrency = (value: number) => currency.format(value)
export const formatNumber = (value: number) => number.format(value)
export const formatDate = (iso: string) => date.format(new Date(iso))
