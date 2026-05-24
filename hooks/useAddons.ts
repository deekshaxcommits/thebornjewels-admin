import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getAddons,
  createAddon,
  updateAddon,
  deleteAddon,
} from '@/lib/api/addons'

const QUERY_KEY = ['addons']

export const useAddons = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: getAddons,
  })

export const useCreateAddon = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: createAddon,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: QUERY_KEY,
      })
    },
  })
}

export const useUpdateAddon = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: any) =>
      updateAddon(id, payload),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: QUERY_KEY,
      })
    },
  })
}

export const useDeleteAddon = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: deleteAddon,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: QUERY_KEY,
      })
    },
  })
}