import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getAllHampers,
  getMyHampers,
  createCustomHamper,
  createHamperFromTemplate,
  updateHamperStatus,
  adminCreateHamper,
  adminUpdateHamper,
  adminDeleteHamper,
  getHamperConfig,
  updateHamperConfig,
} from '@/lib/api/hampers'

const ALL_HAMPERS_KEY = ['admin-hampers']
const MY_HAMPERS_KEY = ['hampers']

export const useAllHampers = (params?: { status?: string; source?: string }) =>
  useQuery({
    queryKey: [...ALL_HAMPERS_KEY, params],
    queryFn: () => getAllHampers(params),
  })

export const useHampers = () =>
  useQuery({
    queryKey: MY_HAMPERS_KEY,
    queryFn: getMyHampers,
  })

export const useCreateCustomHamper = () =>
  useMutation({
    mutationFn: createCustomHamper,
  })

export const useCreateHamperFromTemplate = () =>
  useMutation({
    mutationFn: ({ templateId, payload }: any) =>
      createHamperFromTemplate(templateId, payload),
  })

export const useUpdateHamperStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateHamperStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ALL_HAMPERS_KEY })
    },
  })
}

export const useAdminCreateHamper = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminCreateHamper,
    onSuccess: () => qc.invalidateQueries({ queryKey: ALL_HAMPERS_KEY }),
  })
}

export const useAdminUpdateHamper = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => adminUpdateHamper(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ALL_HAMPERS_KEY }),
  })
}

export const useAdminDeleteHamper = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminDeleteHamper,
    onSuccess: () => qc.invalidateQueries({ queryKey: ALL_HAMPERS_KEY }),
  })
}

const CONFIG_KEY = ['hamper-config']

export const useHamperConfig = () =>
  useQuery({
    queryKey: CONFIG_KEY,
    queryFn: getHamperConfig,
  })

export const useUpdateHamperConfig = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateHamperConfig,
    onSuccess: () => qc.invalidateQueries({ queryKey: CONFIG_KEY }),
  })
}
