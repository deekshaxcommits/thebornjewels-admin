// hooks/useCollections.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCollections,
  getCollectionByID,
  createCollection,
  updateCollection,
  deleteCollection,
  deactivateCollection,
  reactivateCollection,
} from '@/lib/api/collections'

const QUERY_KEY = ['collections']

// ─── Fetch all ────────────────────────────────────────────────────────────────

export const useCollections = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: getCollections,
  })

// ─── Fetch single ─────────────────────────────────────────────────────────────

export const useCollection = (id: string) =>
  useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => getCollectionByID(id),
    enabled: !!id,
  })

// ─── Create ───────────────────────────────────────────────────────────────────

export const useCreateCollection = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createCollection,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

// ─── Update ───────────────────────────────────────────────────────────────────

export const useUpdateCollection = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      updateCollection(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

// ─── Deactivate ────────────────────────────────────────────────────────────────

export const useDeactivateCollection = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deactivateCollection,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

// ─── Reactivate ────────────────────────────────────────────────────────────────

export const useReactivateCollection = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: reactivateCollection,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}

// ─── Permanent Delete ─────────────────────────────────────────────────────────

export const useDeleteCollection = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })
}