// Satu-satunya tempat fitur `tracking` boleh memanggil Supabase langsung.

import { supabase } from '../../../lib/supabase'

/** Ambil semua tracking_produksi untuk satu kode (via kode_ukuran_warna → kode_ukuran → kode). */
export async function ambilTrackingByKode(kodeId) {
  const { data, error } = await supabase
    .from('tracking_produksi')
    .select(`
      *,
      tracking_reject(*),
      kode_ukuran_warna:kode_ukuran_warna_id(
        id,
        nama_warna,
        jumlah_pcs,
        kode_ukuran:kode_ukuran_id(
          id,
          ukuran,
          kode_id
        )
      )
    `)
    .eq('kode_ukuran_warna.kode_ukuran.kode_id', kodeId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Update pcs_done untuk satu baris tracking (per tahap, per kode_ukuran_warna). */
export async function updatePcsDone({ trackingId, pcsDone, updatedBy }) {
  const { data, error } = await supabase
    .from('tracking_produksi')
    .update({ pcs_done: pcsDone, updated_by: updatedBy, updated_at: new Date().toISOString() })
    .eq('id', trackingId)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Catat reject untuk sebuah tahap tracking. */
export async function catatRejectTracking({ trackingProduksiId, pcsReject, alasan, nasib, bahanTersedia, catatan, createdBy }) {
  const { data, error } = await supabase
    .from('tracking_reject')
    .insert({
      tracking_produksi_id: trackingProduksiId,
      pcs_reject: pcsReject,
      alasan: alasan?.toUpperCase(),
      nasib,
      bahan_tersedia: nasib === 'produksi_ulang' ? (bahanTersedia ?? true) : null,
      catatan: catatan?.toUpperCase() ?? null,
      created_by: createdBy,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Inisiasi baris tracking (4 tahap × jumlah kode_ukuran_warna) saat status kode → produksi.
 *  Dipanggil oleh kodeRepository.updateStatusKode saat target = 'produksi'.
 *  Upsert aman: jika sudah ada (misal retry), tidak duplikat. */
export async function inisiasiTrackingUntukKode(kodeId) {
  // Ambil semua kode_ukuran_warna untuk kode ini
  const { data: kuwData, error: kuwErr } = await supabase
    .from('kode_ukuran_warna')
    .select('id, kode_ukuran:kode_ukuran_id(kode_id)')
    .eq('kode_ukuran.kode_id', kodeId)
  if (kuwErr) throw kuwErr

  const TAHAP = ['dipotong', 'dijahit', 'finishing', 'siap_kirim']
  const rows = (kuwData ?? []).flatMap((kuw) =>
    TAHAP.map((tahap) => ({ kode_ukuran_warna_id: kuw.id, tahap, pcs_done: 0 }))
  )
  if (rows.length === 0) return []

  const { data, error } = await supabase
    .from('tracking_produksi')
    .upsert(rows, { onConflict: 'kode_ukuran_warna_id,tahap', ignoreDuplicates: true })
    .select()
  if (error) throw error
  return data
}
