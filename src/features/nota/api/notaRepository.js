// Repository nota biaya — menggantikan HPP Kalkulator (Task #62).
// Nota mencakup: bahan (motif & tambahan), aksesoris, biaya produksi, biaya jual beli.
// Status flow: draft → review → approved/ditolak.

import { supabase } from '../../../lib/supabase'

/** Ambil semua nota milik satu produksi. */
export async function ambilNotaByProduksi(produksiId) {
  const { data, error } = await supabase
    .from('nota_pembelian')
    .select(`
      id, produksi_id, tanggal, catatan,
      aksesoris, biaya_produksi, biaya_jual_beli,
      status, alasan_tolak, submitted_at, approved_at,
      created_at, created_by,
      nota_kode (
        kode_id,
        kode:kode_id (
          id, kode_desain, status,
          kode_ukuran (
            kode_ukuran_warna (jumlah_pcs)
          ),
          sampel (foto_depan_url, foto_belakang_url, status)
        )
      ),
      produksi:produksi_id (
        produksi_bahan (
          jenis_bahan, tipe_bahan, harga_per_satuan,
          konsumsi_per_pcs, satuan_konsumsi,
          produksi_bahan_warna (nama_warna, yard_terpakai)
        )
      )
    `)
    .eq('produksi_id', produksiId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/**
 * Buat nota baru.
 * @param {{
 *   produksi_id: string,
 *   kode_ids: string[],
 *   tanggal: string,
 *   catatan?: string,
 *   bahan: Array,       // [{nama, tipe_bahan, satuan, harga_per_satuan, pcs_baju, pemakaian_warna?, total_pemakaian?}]
 *   aksesoris: Array,   // [{nama, harga_per_baju}]
 *   biaya_produksi: object,
 *   biaya_jual_beli: number,
 *   created_by: string
 * }} payload
 */
export async function buatNota({
  produksi_id, kode_ids, tanggal, catatan,
  aksesoris, biaya_produksi, biaya_jual_beli, created_by,
}) {
  // Nota langsung approved — tidak ada review Jihan untuk nota
  const { data: nota, error: errNota } = await supabase
    .from('nota_pembelian')
    .insert({
      produksi_id,
      tanggal,
      catatan: catatan?.toUpperCase() ?? null,
      aksesoris: aksesoris ?? [],
      biaya_produksi: biaya_produksi ?? {},
      biaya_jual_beli: biaya_jual_beli ?? 20000,
      status: 'approved',
      approved_at: new Date().toISOString(),
      created_by,
    })
    .select()
    .single()
  if (errNota) throw errNota

  // Hubungkan ke kode-kode
  if (kode_ids?.length > 0) {
    const rows = kode_ids.map((kid) => ({ nota_id: nota.id, kode_id: kid }))
    const { error: errKode } = await supabase.from('nota_kode').insert(rows)
    if (errKode) throw errKode

    // Advance kode ke produksi — tidak perlu review Jihan
    // Include semua status sebelum produksi agar kode yang mungkin terlambat sync ikut maju
    const { error: errStatus } = await supabase
      .from('kode')
      .update({ status: 'produksi' })
      .in('id', kode_ids)
      .in('status', ['proses_potong', 'input_buku_potong', 'input_nota', 'input_hpp', 'hpp_ditolak', 'review_hpp'])
    if (errStatus) throw errStatus
  }

  return nota
}

/** Submit nota untuk direview Jihan: nota.status → review, kode → review_hpp. */
export async function submitNotaUntukReview(notaId) {
  const { data: nota, error: errGet } = await supabase
    .from('nota_pembelian')
    .select('id, nota_kode(kode_id)')
    .eq('id', notaId)
    .single()
  if (errGet) throw errGet

  const { error: errNota } = await supabase
    .from('nota_pembelian')
    .update({ status: 'review', submitted_at: new Date().toISOString() })
    .eq('id', notaId)
  if (errNota) throw errNota

  // Update semua kode terkait
  const kodeIds = nota.nota_kode?.map((nk) => nk.kode_id) ?? []
  if (kodeIds.length > 0) {
    const { error: errKode } = await supabase
      .from('kode')
      .update({ status: 'review_hpp' })
      .in('id', kodeIds)
      .eq('status', 'input_nota')
    if (errKode) throw errKode
  }
}

/** Approve nota (Jihan): nota.status → approved, kode → produksi. */
export async function approveNota(notaId) {
  const { data: nota, error: errGet } = await supabase
    .from('nota_pembelian')
    .select('id, nota_kode(kode_id)')
    .eq('id', notaId)
    .single()
  if (errGet) throw errGet

  const { error: errNota } = await supabase
    .from('nota_pembelian')
    .update({ status: 'approved', approved_at: new Date().toISOString() })
    .eq('id', notaId)
  if (errNota) throw errNota

  const kodeIds = nota.nota_kode?.map((nk) => nk.kode_id) ?? []
  if (kodeIds.length > 0) {
    const { error: errKode } = await supabase
      .from('kode')
      .update({ status: 'produksi' })
      .in('id', kodeIds)
      .eq('status', 'review_hpp')
    if (errKode) throw errKode
  }
}

/** Tolak nota (Jihan): nota.status → ditolak, kode → input_nota. */
export async function tolakNota(notaId, alasan) {
  const { data: nota, error: errGet } = await supabase
    .from('nota_pembelian')
    .select('id, nota_kode(kode_id)')
    .eq('id', notaId)
    .single()
  if (errGet) throw errGet

  const { error: errNota } = await supabase
    .from('nota_pembelian')
    .update({ status: 'ditolak', alasan_tolak: alasan?.toUpperCase() ?? null })
    .eq('id', notaId)
  if (errNota) throw errNota

  const kodeIds = nota.nota_kode?.map((nk) => nk.kode_id) ?? []
  if (kodeIds.length > 0) {
    const { error: errKode } = await supabase
      .from('kode')
      .update({ status: 'input_nota' })
      .in('id', kodeIds)
      .eq('status', 'review_hpp')
    if (errKode) throw errKode
  }
}

/**
 * Hapus nota (soft delete — set deleted_at).
 * Akses dikontrol RLS:
 *   - Master       : boleh hapus semua status
 *   - Deera biasa  : hanya draft & ditolak (RLS blokir yang lain)
 */
export async function hapusNota(notaId) {
  const { error } = await supabase
    .from('nota_pembelian')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', notaId)
  if (error) throw error
  return { ok: true }
}

/**
 * Update nota.
 * Akses dikontrol RLS:
 *   - Master       : boleh edit semua status
 *   - Deera biasa  : hanya draft & ditolak (RLS blokir yang lain)
 */
export async function updateNota(notaId, payload) {
  const { data, error } = await supabase
    .from('nota_pembelian')
    .update({
      tanggal: payload.tanggal,
      catatan: payload.catatan?.toUpperCase() ?? null,
      aksesoris: payload.aksesoris ?? [],
      biaya_produksi: payload.biaya_produksi ?? {},
      biaya_jual_beli: payload.biaya_jual_beli ?? 20000,
    })
    .eq('id', notaId)
    .select()
    .single()
  if (error) throw error
  return data
}
