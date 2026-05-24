import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createHamperTemplate, deleteHamperTemplate, getHamperTemplates, updateHamperTemplate } from "@/lib/api/hamperTemplates"

const QUERY_KEY = ['hamper-templates']

export const useHamperTemplates = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: getHamperTemplates,
  })

export const useCreateHamperTemplate = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: createHamperTemplate,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: QUERY_KEY,
      })
    },
  })
}

export const useUpdateHamperTemplate = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: any) =>
      updateHamperTemplate(id, payload),

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: QUERY_KEY,
      })
    },
  })
}

export const useDeleteHamperTemplate = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: deleteHamperTemplate,

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: QUERY_KEY,
      })
    },
  })
}