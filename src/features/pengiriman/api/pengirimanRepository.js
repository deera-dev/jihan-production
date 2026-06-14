import { supabase } from '../../../lib/supabase'

export async function ambilPengirimanByKode(kodeId) {
  const { data, error } = await supabase
    .from('pengiriman')
    .select('*, pengiriman_item(*), dibuat_oleh:created_by(nama_lengkap), diapprove_oleh:approved_by(nama_lengkap)')
    .eq('kode_id', kodeId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Deera buat pengiriman baru (menunggu approval Jihan). */
export async function buatPengiriman({ kodeId, tanggal, catatan, items, createdBy }) {
  const { data: pengiriman, error: pErr } = await supabase
    .from('pengiriman')
    .insert({
      kode_id: kodeId,
      tanggal,
      catatan: catatan?.toUpperCase() ?? null,
      status_approval: 'menunggu',
      created_by: createdBy,
    })
    .select()
    .single()
  if (pErr) throw pErr

  const itemRows = items.map((item) => ({
    pengiriman_id: pengiriman.id,
    nama_warna: item.namaWarna?.toUpperCase(),
    jumlah_pcs: item.jumlahPcs,
  }))
  const { error: iErr } = await supabase.from('pengiriman_item').insert(itemRows)
  if (iErr) throw iErr

  return pengiriman
}

/** Jihan: setujui pengiriman. Sistem cek apakah semua pcs sudah terkirim → otomatis selesai. */
export async function approvePengiriman({ pengirimanId, approvedBy }) {
  const { data, error } = await supabase
    .from('pengiriman')
    .update({
      status_approval: 'disetujui',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    .eq('id', pengirimanId)
    .select()
    .single()
  if (error) throw error
  return data
}

/** Jihan: tolak pengiriman. */
export async function tolakPengiriman({ pengirimanId, approvedBy }) {
  const { data, error } = await supabase
    .from('pengiriman')
    .update({
      status_approval: 'ditolak',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    })
    .eq('id', pengirimanId)
    .select()
    .single()
  if (error) throw error
  return data
}
