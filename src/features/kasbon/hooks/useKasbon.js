import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ambilLedgerKasbon,
  ambilSaldoKasbon,
  tambahKasbonMasuk,
  hapusKasbonMasuk,
} from '../api/kasbonRepository'
import { useAuthStore, selectProfile } from '../../../store/useAuthStore'

export function useLedgerKasbon() {
  return useQuery({
    queryKey: ['kasbon', 'ledger'],
    queryFn: ambilLedgerKasbon,
  })
}

export function useSaldoKasbon() {
  return useQuery({
    queryKey: ['kasbon', 'saldo'],
    queryFn: ambilSaldoKasbon,
  })
}

export function useTambahKasbonMasuk() {
  const qc = useQueryClient()
  const profile = useAuthStore(selectProfile)
  return useMutation({
    mutationFn: (payload) =>
      tambahKasbonMasuk({ ...payload, createdBy: profile?.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kasbon'] })
    },
  })
}

export function useHapusKasbonMasuk() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => hapusKasbonMasuk(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kasbon'] })
    },
  })
}
