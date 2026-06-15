// Hooks fitur `kode` — jembatan antara komponen dan repository.
// HPP hooks dihapus (Task #62) — digantikan useNota di features/nota.

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
  updateTracking,
  catatReject,
  buatSampelDanAjukanReview,
  konfirmasiEstimasi,
  lanjutkanKeProsesPotong,
  batalkanKode,
  lanjutkanDariBatalkan,
  mulaiInputBukuPotong,
  lanjutKeInputNota,
  lanjutKeProduksiSetelahNota,
  tambahFotoKode,
  hapusSampel,
  lanjutTanpaSampel,
} from '../api/kodeRepository'

// --- QUERIES ---

export function useDetailKode(kodeId) {
  return useQuery({
    queryKey: ['kode', kodeId],
    queryFn: () => ambilKodeById(kodeId),
    enabled: Boolean(kodeId),
  })
}

// --- MUTATIONS: KODE ---

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

// --- MUTATIONS: SAMPEL ---

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

// --- MUTATIONS: TRACKING ---

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

// --- MUTATIONS: STATUS FLOW ---

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

export function useLanjutKeInputNota(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => lanjutKeInputNota(kodeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useLanjutTanpaSampel(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => lanjutTanpaSampel(kodeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useLanjutKeProduksiSetelahNota(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => lanjutKeProduksiSetelahNota(kodeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
      qc.invalidateQueries({ queryKey: ['produksi'] })
    },
  })
}

export function useTambahFotoKode(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => tambahFotoKode(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
    },
  })
}

export function useHapusSampel(kodeId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sampelId) => hapusSampel(sampelId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['kode', kodeId] })
    },
  })
}
