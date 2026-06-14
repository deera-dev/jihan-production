// Repository nota — pembelian bahan baku, alokasi proporsional lintas kode.

import { supabase } from '../../../lib/supabase'

/** Ambil semua nota (untuk NotaListPage). */
export async function ambilSemuaNota() {
  const { data, error } = await supabase
    .from('nota_pembelian')
    .select(`
      id, tanggal, catatan, total_nilai, created_at,
      nota_item (
        id, nama_custom, tipe, qty, harga_satuan, total_nilai,
        katalog_bahan_baku (id, nama, tipe, satuan),
        nota_item_kode (
          kode_id,
          kode:kode_id (id, kode_desain)
        )
      )
    `)
    .order('tanggal', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Ambil nota by id (untuk detail). */
export async function ambilNotaById(notaId) {
  const { data, error } = await supabase
    .from('nota_pembelian')
    .select(`
      id, tanggal, catatan, total_nilai, created_at,
      nota_item (
        id, nama_custom, tipe, qty, harga_satuan, total_nilai,
        katalog_bahan_baku (id, nama, tipe, satuan),
        nota_item_kode (
          kode_id,
          kode:kode_id (id, kode_desain)
        )
      )
    `)
    .eq('id', notaId)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Ambil katalog bahan baku (nama-nama yang sudah dikenal). */
export async function ambilKatalogBahanBaku() {
  const { data, error } = await supabase
    .from('katalog_bahan_baku')
    .select('id, nama, tipe, satuan, harga_terkini')
    .eq('is_active', true)
    .order('nama')
  if (error) throw error
  return data ?? []
}

/**
 * Buat nota baru beserta item-item dan alokasi kode.
 * @param {{ tanggal: string, catatan?: string, items: Array, created_by: string }} payload
 */
export async function buatNota({ tanggal, catatan, items, created_by }) {
  // 1. Hitung total nilai
  const total_nilai = items.reduce((s, item) => {
    const v = item.tipe === 'unit'
      ? (item.qty ?? 0) * (item.harga_satuan ?? 0)
      : (item.total_nilai ?? 0)
    return s + v
  }, 0)

  // 2. Insert nota_pembelian
  const { data: nota, error: errNota } = await supabase
    .from('nota_pembelian')
    .insert({ tanggal, catatan: catatan?.toUpperCase() ?? null, total_nilai, created_by })
    .select()
    .single()
  if (errNota) throw errNota

  // 3. Insert nota_item + nota_item_kode
  for (const item of items) {
    const totalNilaiItem = item.tipe === 'unit'
      ? (item.qty ?? 0) * (item.harga_satuan ?? 0)
      : (item.total_nilai ?? 0)

    const { data: notaItem, error: errItem } = await supabase
      .from('nota_item')
      .insert({
        nota_id: nota.id,
        katalog_id: item.katalog_id ?? null,
        nama_custom: item.nama_custom?.toUpperCase() ?? null,
        tipe: item.tipe,
        qty: item.tipe === 'unit' ? item.qty : null,
        harga_satuan: item.tipe === 'unit' ? item.harga_satuan : null,
        total_nilai: totalNilaiItem,
      })
      .select()
      .single()
    if (errItem) throw errItem

    // Hubungkan ke kode-kode
    if (item.kode_ids?.length > 0) {
      const kodeRows = item.kode_ids.map((kid) => ({
        nota_item_id: notaItem.id,
        kode_id: kid,
      }))
      const { error: errKode } = await supabase.from('nota_item_kode').insert(kodeRows)
      if (errKode) throw errKode
    }
  }

  return nota
}
