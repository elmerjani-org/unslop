import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
} from './api'
import type { CustomerInput } from './types'

export const customerKeys = {
  all: ['customers'] as const,
  list: () => [...customerKeys.all, 'list'] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
}

export const customersQueryOptions = () =>
  queryOptions({
    queryKey: customerKeys.list(),
    queryFn: () => listCustomers(),
    staleTime: 30_000,
  })

export const customerQueryOptions = (id: string) =>
  queryOptions({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomer({ data: { id } }),
    staleTime: 30_000,
  })

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CustomerInput) => createCustomer({ data: input }),
    onSuccess: (customer) => {
      queryClient.setQueryData(customerKeys.detail(customer.id), customer)
      return queryClient.invalidateQueries({ queryKey: customerKeys.list() })
    },
  })
}

export function useUpdateCustomer(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CustomerInput) =>
      updateCustomer({ data: { id, input } }),
    onSuccess: (customer) => {
      queryClient.setQueryData(customerKeys.detail(id), customer)
      return queryClient.invalidateQueries({ queryKey: customerKeys.list() })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCustomer({ data: { id } }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: customerKeys.list() }),
  })
}
