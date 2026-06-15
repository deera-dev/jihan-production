// Repository fitur `produksi` — satu-satunya tempat panggil Supabase untuk
// data produksi, surat jalan, dan bahan (primer/sekunder).
// Komponen & hook TIDAK BOLEH import `supabase` langsung (Dependency Inversion).

import { supabase } from '../../../lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
// PRODUKSI
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ambil semua produksi aktif (deleted_at is null) beserta kode di dalamnya.
 * @returns {Promise<Array>}
 */
export async function ambilSemuaProduksi() {
  const { data, error } = await supabase
    .from('produksi')
    .select(`
      id,
      kode_bahan,
      tanggal,
      catatan,
      created_at,
      kode (
        id,
        kode_desain,
        status,
        urutan,
        kode_ukuran (
          ukuran,
          kode_ukuran_warna (
            nama_warna,
            jumlah_pcs,
            tracking_produksi (tahap, pcs_done)
          )
        )
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/**
 * Ambil satu produksi lengkap dengan relasi penuh (surat jalan + bahan + kode).
 * @param {string} produksiId
 * @returns {Promise<object | null>}
 */
export async function ambilProduksiById(produksiId) {
  const { data, error } = await supabase
    .from('produksi')
    .select(`
      id,
      kode_bahan,
      tanggal,
      catatan,
      created_at,
      updated_at,
      surat_jalan (
        id,
        nomor_surat_jalan,
        tanggal_terima,
        pengirim,
        catatan
      ),
      produksi_bahan (
        id,
        jenis_bahan,
        tipe_bahan,
        satuan,
        harga_per_satuan,
        jumlah_dibeli,
        konsumsi_per_pcs,
        satuan_konsumsi,
        urutan,
        produksi_bahan_warna (
          id,
          nama_warna,
          yard_tersedia,
          yard_terpakai,
          urutan
        )
      ),
      kode (
        id,
        kode_desain,
        status,
        harga_jual_target,
        catatan,
        urutan,
        kode_ukuran (
          id,
          ukuran,
          kode_ukuran_warna (
            id,
            nama_warna,
            jumlah_pcs
          )
        )
      )
    `)
    .eq('id', produksiId)
    .is('deleted_at', null)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Ambil nomor kode berikutnya sebagai saran placeholder (dari kode_sequence).
 * @returns {Promise<number>} — nomor terakhir + 1
 */
export async function ambilNomorKodeBerikutnya() {
  const { data, error } = await supabase
    .from('kode_sequence')
    .select('last_number')
    .single()
  if (error) throw error
  return (data?.last_number ?? 0) + 1
}

/**
 * Buat produksi baru (tanpa kode — kode ditambah terpisah).
 * @param {{ kode_bahan: string, tanggal: string, catatan?: string, created_by: string }} payload
 * @returns {Promise<object>}
 */
export async function buatProduksi(payload) {
  const { data, error } = await supabase
    .from('produksi')
    .insert({
      kode_bahan: payload.kode_bahan.toUpperCase(),
      tanggal: payload.tanggal,
      catatan: payload.catatan ? payload.catatan.toUpperCase() : null,
      created_by: payload.created_by,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Update data produksi.
 * @param {string} id
 * @param {{ kode_bahan?: string, tanggal?: string, catatan?: string }} perubahan
 * @returns {Promise<object>}
 */
export async function updateProduksi(id, perubahan) {
  const patch = {}
  if (perubahan.kode_bahan !== undefined) patch.kode_bahan = perubahan.kode_bahan.toUpperCase()
  if (perubahan.tanggal !== undefined) patch.tanggal = perubahan.tanggal
  if (perubahan.catatan !== undefined) patch.catatan = perubahan.catatan ? perubahan.catatan.toUpperCase() : null

  const { data, error } = await supabase
    .from('produksi')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Soft delete produksi.
 * @param {string} id
 */
export async function hapusProduksi(id) {
  const { error } = await supabase
    .from('produksi')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ─────────────────────────────────────────────────────────────────────────────
// SURAT JALAN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {{ produksi_id: string, nomor_surat_jalan?: string, tanggal_terima: string, pengirim?: string, catatan?: string, created_by: string }} payload
 * @returns {Promise<object>}
 */
export async function buatSuratJalan(payload) {
  const { data, error } = await supabase
    .from('surat_jalan')
    .insert({
      produksi_id: payload.produksi_id,
      nomor_surat_jalan: payload.nomor_surat_jalan?.toUpperCase() ?? null,
      tanggal_terima: payload.tanggal_terima,
      pengirim: payload.pengirim?.toUpperCase() ?? null,
      catatan: payload.catatan?.toUpperCase() ?? null,
      created_by: payload.created_by,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// BAHAN (PRIMER & SEKUNDER)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tambah bahan ke produksi.
 * @param {{ produksi_id: string, surat_jalan_id?: string, jenis_bahan: string, tipe_bahan: 'primer'|'sekunder', satuan: 'yard'|'panel', harga_per_satuan: number, jumlah_dibeli?: number, urutan?: number }} payload
 * @returns {Promise<object>}
 */
export async function tambahBahan(payload) {
  const { data, error } = await supabase
    .from('produksi_bahan')
    .insert({
      produksi_id: payload.produksi_id,
      surat_jalan_id: payload.surat_jalan_id ?? null,
      jenis_bahan: payload.jenis_bahan.toUpperCase(),
      tipe_bahan: payload.tipe_bahan,
      satuan: payload.satuan,
      harga_per_satuan: payload.harga_per_satuan,
      jumlah_dibeli: payload.jumlah_dibeli ?? null,
      urutan: payload.urutan ?? 1,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Update bahan (mis. isi konsumsi_per_pcs saat HPP).
 * @param {string} bahanId
 * @param {object} perubahan
 * @returns {Promise<object>}
 */
export async function updateBahan(bahanId, perubahan) {
  const { data, error } = await supabase
    .from('produksi_bahan')
    .update(perubahan)
    .eq('id', bahanId)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Hapus bahan (hard delete — bahan milik Jihan, tidak perlu soft delete).
 * @param {string} bahanId
 */
export async function hapusBahan(bahanId) {
  const { error } = await supabase
    .from('produksi_bahan')
    .delete()
    .eq('id', bahanId)
  if (error) throw error
}

/**
 * Tambah warna ke bahan primer.
 * @param {{ produksi_bahan_id: string, nama_warna: string, yard_tersedia?: number, urutan?: number }} payload
 * @returns {Promise<object>}
 */
export async function tambahWarnaBahan(payload) {
  const { data, error } = await supabase
    .from('produksi_bahan_warna')
    .insert({
      produksi_bahan_id: payload.produksi_bahan_id,
      nama_warna: payload.nama_warna.toUpperCase(),
      yard_tersedia: payload.yard_tersedia ?? null,
      urutan: payload.urutan ?? 1,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Update warna bahan (mis. isi yard_terpakai dari buku potong).
 * @param {string} warnaId
 * @param {{ yard_tersedia?: number, yard_terpakai?: number }} perubahan
 * @returns {Promise<object>}
 */
export async function updateWarnaBahan(warnaId, perubahan) {
  const { data, error } = await supabase
    .from('produksi_bahan_warna')
    .update(perubahan)
    .eq('id', warnaId)
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Hapus warna bahan.
 * @param {string} warnaId
 */
export async function hapusWarnaBahan(warnaId) {
  const { error } = await supabase
    .from('produksi_bahan_warna')
    .delete()
    .eq('id', warnaId)
  if (error) throw error
}
