import { supabase } from '../../../lib/supabase'

/** Ledger gabungan masuk + potongan_otomatis, sudah include saldo berjalan per entri. */
export async function ambilLedgerKasbon() {
  const { data, error } = await supabase
    .from('kasbon_dengan_saldo_berjalan')
    .select('*, kode:kode_id(kode_desain), dibuat_oleh:created_by(nama_lengkap)')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

/** Ambil saldo kasbon terkini via fungsi DB. */
export async function ambilSaldoKasbon() {
  const { data, error } = await supabase.rpc('hitung_saldo_kasbon')
  if (error) throw error
  return data ?? 0
}

/** Deera input dana masuk (setelah dana diterima di luar sistem). */
export async function tambahKasbonMasuk({ tanggal, nominal, catatan, createdBy }) {
  const { data, error } = await supabase
    .from('kasbon')
    .insert({
      tanggal,
      tipe: 'masuk',
      nominal,
      catatan: catatan?.toUpperCase() ?? null,
      created_by: createdBy,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

/** Soft delete entri kasbon masuk (potongan_otomatis tidak bisa dihapus — dijaga oleh trigger DB). */
export async function hapusKasbonMasuk(id) {
  const { data, error } = await supabase
    .from('kasbon')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('tipe', 'masuk')
    .select()
    .single()
  if (error) throw error
  return data
}
