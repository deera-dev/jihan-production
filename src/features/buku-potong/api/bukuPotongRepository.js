// Repository buku potong — update yard_terpakai primer per warna (produksi-level),
// upsert kode_ukuran_warna (pcs aktual per kode), advance status semua kode terlibat.

import { supabase } from '../../../lib/supabase'

/**
 * Ambil data produksi lengkap untuk form buku potong.
 * - bahan primer + warna (yard tersedia/terpakai)
 * - semua kode dalam produksi + ukuran masing-masing
 */
export async function ambilProduksiBukuPotong(produksiId) {
  const { data, error } = await supabase
    .from('produksi')
    .select(`
      id, kode_bahan,
      produksi_bahan (
        id, tipe_bahan, jenis_bahan,
        produksi_bahan_warna (id, nama_warna, yard_tersedia, yard_terpakai)
      ),
      kode (
        id, kode_desain, status,
        kode_ukuran (id, ukuran, urutan)
      )
    `)
    .eq('id', produksiId)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Simpan data buku potong level produksi.
 * - Update produksi_bahan_warna.yard_terpakai per warna
 * - Upsert kode_ukuran_warna.jumlah_pcs untuk semua kode
 * - Advance status semua kode yang ada di proses_potong / input_buku_potong → input_nota
 *
 * @param {{ produksiId: string, warnaData: Array, kodeIds: string[] }} payload
 */
export async function simpanBukuPotongProduksi({ produksiId, warnaData, kodeIds }) {
  // 1. Update yard_terpakai per warna
  for (const w of warnaData) {
    if (w.bahanWarnaId) {
      const { error } = await supabase
        .from('produksi_bahan_warna')
        .update({ yard_terpakai: Number(w.yardTerpakai) || 0 })
        .eq('id', w.bahanWarnaId)
      if (error) throw error
    }
  }

  // 2. Upsert kode_ukuran_warna untuk semua kode
  const rows = []
  for (const item of warnaData) {
    for (const pcsEntry of item.pcsPerKode) {
      rows.push({
        kode_ukuran_id: pcsEntry.kodeUkuranId,
        nama_warna: item.nama_warna,
        jumlah_pcs: Number(pcsEntry.jumlah_pcs) || 0,
      })
    }
  }

  if (rows.length > 0) {
    const { error } = await supabase
      .from('kode_ukuran_warna')
      .upsert(rows, { onConflict: 'kode_ukuran_id,nama_warna' })
    if (error) throw error
  }

  // 3. Advance status kode: proses_potong / input_buku_potong → input_nota
  if (kodeIds.length > 0) {
    const { error } = await supabase
      .from('kode')
      .update({ status: 'input_nota' })
      .in('id', kodeIds)
      .in('status', ['proses_potong', 'input_buku_potong'])
    if (error) throw error
  }

  return { ok: true }
}
