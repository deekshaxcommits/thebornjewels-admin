import { useMutation, useQuery } from '@tanstack/react-query'

import {
  getMyHampers,
  createCustomHamper,
  createHamperFromTemplate,
} from '@/lib/api/hampers'

const QUERY_KEY = ['hampers']

export const useHampers = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: getMyHampers,
  })

export const useCreateCustomHamper = () =>
  useMutation({
    mutationFn: createCustomHamper,
  })

export const useCreateHamperFromTemplate = () =>
  useMutation({
    mutationFn: ({
      templateId,
      payload,
    }: any) =>
      createHamperFromTemplate(
        templateId,
        payload
      ),
  })