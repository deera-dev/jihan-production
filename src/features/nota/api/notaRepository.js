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
        kode:kode_id (id, kode_desain, status)
      )
    `)
    .eq('produksi_id', produksiId)
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
  bahan, aksesoris, biaya_produksi, biaya_jual_beli, created_by,
}) {
  const { data: nota, error: errNota } = await supabase
    .from('nota_pembelian')
    .insert({
      produksi_id,
      tanggal,
      catatan: catatan?.toUpperCase() ?? null,
      aksesoris: aksesoris ?? [],
      biaya_produksi: biaya_produksi ?? {},
      biaya_jual_beli: biaya_jual_beli ?? 20000,
      status: 'draft',
      created_by,
      // simpan bahan di kolom aksesoris sementara pakai field baru nanti
      // untuk sekarang simpan di catatan-json atau gunakan kolom yang ada
    })
    .select()
    .single()
  if (errNota) throw errNota

  // Hubungkan ke kode-kode
  if (kode_ids?.length > 0) {
    const rows = kode_ids.map((kid) => ({ nota_id: nota.id, kode_id: kid }))
    const { error: errKode } = await supabase.from('nota_kode').insert(rows)
    if (errKode) throw errKode
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
