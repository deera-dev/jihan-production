import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ambilNotaByProduksi,
  buatNota,
  submitNotaUntukReview,
  approveNota,
  tolakNota,
  hapusNota,
  updateNota,
} from '../api/notaRepository'

export function useNotaByProduksi(produksiId) {
  return useQuery({
    queryKey: ['nota', produksiId],
    queryFn: () => ambilNotaByProduksi(produksiId),
    enabled: !!produksiId,
  })
}

export function useBuatNota() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: buatNota,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['nota', vars.produksi_id] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useSubmitNota() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: submitNotaUntukReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nota'] })
      qc.invalidateQueries({ queryKey: ['kode'] })
    },
  })
}

export function useApproveNota() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: approveNota,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nota'] })
      qc.invalidateQueries({ queryKey: ['kode'] })
    },
  })
}

export function useTolakNota() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ notaId, alasan }) => tolakNota(notaId, alasan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['nota'] })
      qc.invalidateQueries({ queryKey: ['kode'] })
    },
  })
}

export function useHapusNota() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: hapusNota,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nota'] }),
  })
}

export function useUpdateNota() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ notaId, payload }) => updateNota(notaId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['nota'] }),
  })
}
