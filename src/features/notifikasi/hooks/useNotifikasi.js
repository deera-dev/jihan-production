import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ambilNotifikasi,
  tandaiDibaca,
  tandaiSemuaDibaca,
  ambilPreferensi,
  simpanPreferensi,
} from '../api/notifikasiRepository'
import { useAuthStore, selectProfile } from '../../../store/useAuthStore'

export function useNotifikasi() {
  const profile = useAuthStore(selectProfile)
  return useQuery({
    queryKey: ['notifikasi', profile?.id],
    queryFn: () => ambilNotifikasi(profile?.id),
    enabled: !!profile?.id,
    refetchInterval: 30_000, // polling 30 detik sebagai fallback realtime
  })
}

export function useTandaiDibaca() {
  const qc = useQueryClient()
  const profile = useAuthStore(selectProfile)
  return useMutation({
    mutationFn: (id) => tandaiDibaca(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifikasi', profile?.id] }),
  })
}

export function useTandaiSemuaDibaca() {
  const qc = useQueryClient()
  const profile = useAuthStore(selectProfile)
  return useMutation({
    mutationFn: () => tandaiSemuaDibaca(profile?.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifikasi', profile?.id] }),
  })
}

export function usePreferensiNotifikasi() {
  const profile = useAuthStore(selectProfile)
  return useQuery({
    queryKey: ['notifikasi-preferensi', profile?.id],
    queryFn: () => ambilPreferensi(profile?.id),
    enabled: !!profile?.id,
  })
}

export function useSimpanPreferensi() {
  const qc = useQueryClient()
  const profile = useAuthStore(selectProfile)
  return useMutation({
    mutationFn: (payload) => simpanPreferensi({ ...payload, userId: profile?.id }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifikasi-preferensi', profile?.id] }),
  })
}
