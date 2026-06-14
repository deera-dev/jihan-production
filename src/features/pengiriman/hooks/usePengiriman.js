import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ambilPengirimanByKode,
  buatPengiriman,
  approvePengiriman,
  tolakPengiriman,
} from '../api/pengirimanRepository'
import { useAuthStore, selectProfile } from '../../../store/useAuthStore'

export function usePengirimanByKode(kodeId) {
  return useQuery({
    queryKey: ['pengiriman', kodeId],
    queryFn: () => ambilPengirimanByKode(kodeId),
    enabled: !!kodeId,
  })
}

export function useBuatPengiriman(kodeId) {
  const qc = useQueryClient()
  const profile = useAuthStore(selectProfile)
  return useMutation({
    mutationFn: (payload) =>
      buatPengiriman({ ...payload, kodeId, createdBy: profile?.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pengiriman', kodeId] })
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
    },
  })
}

export function useApprovePengiriman(kodeId) {
  const qc = useQueryClient()
  const profile = useAuthStore(selectProfile)
  return useMutation({
    mutationFn: ({ pengirimanId }) =>
      approvePengiriman({ pengirimanId, approvedBy: profile?.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pengiriman', kodeId] })
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useTolakPengiriman(kodeId) {
  const qc = useQueryClient()
  const profile = useAuthStore(selectProfile)
  return useMutation({
    mutationFn: ({ pengirimanId }) =>
      tolakPengiriman({ pengirimanId, approvedBy: profile?.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pengiriman', kodeId] })
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
    },
  })
}
