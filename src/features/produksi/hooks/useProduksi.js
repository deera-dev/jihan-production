// Hooks fitur `produksi` — jembatan antara komponen dan repository.
// Semua state server dikelola TanStack Query; tidak ada useState untuk data dari DB.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ambilSemuaProduksi,
  ambilProduksiById,
  ambilNomorKodeBerikutnya,
  buatProduksi,
  updateProduksi,
  hapusProduksi,
  buatSuratJalan,
  tambahBahan,
  updateBahan,
  hapusBahan,
  tambahWarnaBahan,
  updateWarnaBahan,
  hapusWarnaBahan,
} from '../api/produksiRepository'

// ─────────────────────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────────────────────

export function useDaftarProduksi() {
  return useQuery({
    queryKey: ['produksi'],
    queryFn: ambilSemuaProduksi,
  })
}

export function useDetailProduksi(produksiId) {
  return useQuery({
    queryKey: ['produksi', produksiId],
    queryFn: () => ambilProduksiById(produksiId),
    enabled: Boolean(produksiId),
  })
}

export function useNomorKodeBerikutnya() {
  return useQuery({
    queryKey: ['kode-sequence'],
    queryFn: ambilNomorKodeBerikutnya,
    staleTime: 0, // selalu fresh — nomor bisa berubah setiap saat
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS — PRODUKSI
// ─────────────────────────────────────────────────────────────────────────────

export function useBuatProduksi() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: buatProduksi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produksi'] }),
  })
}

export function useUpdateProduksi() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, perubahan }) => updateProduksi(id, perubahan),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['produksi'] })
      qc.invalidateQueries({ queryKey: ['produksi', id] })
    },
  })
}

export function useHapusProduksi() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: hapusProduksi,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produksi'] }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS — SURAT JALAN
// ─────────────────────────────────────────────────────────────────────────────

export function useBuatSuratJalan(produksiId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: buatSuratJalan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produksi', produksiId] }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// MUTATIONS — BAHAN
// ─────────────────────────────────────────────────────────────────────────────

export function useTambahBahan(produksiId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tambahBahan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produksi', produksiId] }),
  })
}

export function useUpdateBahan(produksiId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, perubahan }) => updateBahan(id, perubahan),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produksi', produksiId] }),
  })
}

export function useHapusBahan(produksiId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: hapusBahan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produksi', produksiId] }),
  })
}

export function useTambahWarnaBahan(produksiId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tambahWarnaBahan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produksi', produksiId] }),
  })
}

export function useUpdateWarnaBahan(produksiId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, perubahan }) => updateWarnaBahan(id, perubahan),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produksi', produksiId] }),
  })
}

export function useHapusWarnaBahan(produksiId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: hapusWarnaBahan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produksi', produksiId] }),
  })
}
