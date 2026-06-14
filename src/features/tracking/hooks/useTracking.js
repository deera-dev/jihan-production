import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ambilTrackingByKode,
  updatePcsDone,
  catatRejectTracking,
} from '../api/trackingRepository'
import { useAuthStore, selectProfile } from '../../../store/useAuthStore'

export function useTrackingByKode(kodeId) {
  return useQuery({
    queryKey: ['tracking', kodeId],
    queryFn: () => ambilTrackingByKode(kodeId),
    enabled: !!kodeId,
  })
}

export function useUpdatePcsDone(kodeId) {
  const qc = useQueryClient()
  const profile = useAuthStore(selectProfile)
  return useMutation({
    mutationFn: ({ trackingId, pcsDone }) =>
      updatePcsDone({ trackingId, pcsDone, updatedBy: profile?.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tracking', kodeId] })
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
    },
  })
}

export function useCatatReject(kodeId) {
  const qc = useQueryClient()
  const profile = useAuthStore(selectProfile)
  return useMutation({
    mutationFn: (payload) =>
      catatRejectTracking({ ...payload, createdBy: profile?.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tracking', kodeId] })
    },
  })
}
