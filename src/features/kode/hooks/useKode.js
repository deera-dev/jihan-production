// Hooks fitur `kode` — jembatan antara komponen dan repository.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ambilKodeById,
  buatKode,
  updateStatusKode,
  tambahWarnaKode,
  updatePcsWarna,
  buatSampel,
  approveSampel,
  tolakSampel,
  tambahCatatanSampel,
  ambilTemplateHPP,
  simpanHPP,
  approveHPP,
  tolakHPP,
  updateTracking,
  catatReject,
  buatSampelDanAjukanReview,
  konfirmasiEstimasi,
  lanjutkanKeProsesPotong,
  batalkanKode,
  lanjutkanDariBatalkan,
  mulaiInputBukuPotong,
  lanjutKeInputHPP,
} from '../api/kodeRepository'

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export function useDetailKode(kodeId) {
  return useQuery({
    queryKey: ['kode', kodeId],
    queryFn: () => ambilKodeById(kodeId),
    enabled: Boolean(kodeId),
  })
}

export function useTemplateHPP() {
  return useQuery({
    queryKey: ['hpp-template'],
    queryFn: ambilTemplateHPP,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── MUTATIONS — KODE ─────────────────────────────────────────────────────────

export function useBuatKode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: buatKode,
    onSuccess: (_data, { produksi_id }) => {
      qc.invalidateQueries({ queryKey: ['produksi'] })
      if (produksi_id) qc.invalidateQueries({ queryKey: ['produksi', produksi_id] })
    },
  })
}

export function useUpdateStatusKode(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ status, status_sebelum_dibatalkan }) =>
      updateStatusKode(kodeId, { status, status_sebelum_dibatalkan }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useTambahWarnaKode(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tambahWarnaKode,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kode', kodeId] }),
  })
}

export function useUpdatePcsWarna(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, jumlah_pcs }) => updatePcsWarna(id, jumlah_pcs),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kode', kodeId] }),
  })
}

// ─── MUTATIONS — SAMPEL ───────────────────────────────────────────────────────

export function useBuatSampel(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: buatSampel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useBuatSampelDanAjukanReview(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: buatSampelDanAjukanReview,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useApproveSampel(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sampelId }) => approveSampel(sampelId, kodeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useTolakSampel(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ sampelId, alasan }) => tolakSampel(sampelId, kodeId, alasan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useTambahCatatanSampel(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tambahCatatanSampel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kode', kodeId] }),
  })
}

// ─── MUTATIONS — HPP ──────────────────────────────────────────────────────────

export function useSimpanHPP(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, submitUntukReview }) => simpanHPP(kodeId, payload, submitUntukReview),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useApproveHPP(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ hppId }) => approveHPP(hppId, kodeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useTolakHPP(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ hppId, alasan }) => tolakHPP(hppId, kodeId, alasan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

// ─── MUTATIONS — TRACKING ─────────────────────────────────────────────────────

export function useUpdateTracking(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ trackingId, pcs_done, updated_by }) => updateTracking(trackingId, pcs_done, updated_by),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kode', kodeId] }),
  })
}

export function useCatatReject(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: catatReject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['kode', kodeId] }),
  })
}

// ─── MUTATIONS — STATUS FLOW ──────────────────────────────────────────────────

export function useKonfirmasiEstimasi(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => konfirmasiEstimasi(kodeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useLanjutkanKeProsesPotong(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => lanjutkanKeProsesPotong(kodeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useBatalkanKode(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (statusSaatIni) => batalkanKode(kodeId, statusSaatIni),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useLanjutkanDariBatalkan(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (statusSebelum) => lanjutkanDariBatalkan(kodeId, statusSebelum),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useMulaiInputBukuPotong(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => mulaiInputBukuPotong(kodeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useLanjutKeInputHPP(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => lanjutKeInputHPP(kodeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

/** @deprecated gunakan useDetailKode */
export function useKode() { return useDetailKode(null) }
