// Repository buku potong — update yard_terpakai primer per warna,
// upsert kode_ukuran_warna (pcs aktual), lalu advance status ke input_nota.

import { supabase } from '../../../lib/supabase'

/**
 * Simpan data buku potong aktual.
 * - Update produksi_bahan_warna.yard_terpakai per warna yang sudah ada
 * - Upsert kode_ukuran_warna.jumlah_pcs per warna per ukuran
 * - Advance kode status → input_nota
 *
 * @param {{ kodeId: string, warnaData: Array }} payload
 */
export async function simpanBukuPotong({ kodeId, warnaData }) {
  // 1. Update yard_terpakai untuk warna yang sudah ada di produksi_bahan_warna
  for (const w of warnaData) {
    if (w.bahanWarnaId) {
      const { error } = await supabase
        .from('produksi_bahan_warna')
        .update({ yard_terpakai: w.yardTerpakai })
        .eq('id', w.bahanWarnaId)
      if (error) throw error
    }
  }

  // 2. Ambil kode_ukuran untuk kode ini
  const { data: ukuranList, error: errUkuran } = await supabase
    .from('kode_ukuran')
    .select('id, ukuran')
    .eq('kode_id', kodeId)
  if (errUkuran) throw errUkuran

  // 3. Upsert kode_ukuran_warna (jumlah_pcs aktual)
  const rows = []
  for (const w of warnaData) {
    for (const ukuran of ukuranList) {
      const pcs = w.pcsPerUkuran[ukuran.id] ?? 0
      rows.push({
        kode_ukuran_id: ukuran.id,
        nama_warna: w.nama_warna,
        jumlah_pcs: pcs,
      })
    }
  }

  if (rows.length > 0) {
    const { error: errUpsert } = await supabase
      .from('kode_ukuran_warna')
      .upsert(rows, { onConflict: 'kode_ukuran_id,nama_warna' })
    if (errUpsert) throw errUpsert
  }

  // 4. Advance status → input_nota
  const { error: errStatus } = await supabase
    .from('kode')
    .update({ status: 'input_nota' })
    .eq('id', kodeId)
  if (errStatus) throw errStatus

  return { ok: true }
}
