import { supabase } from '../../../lib/supabase'

/** Ambil semua notifikasi milik user (belum terhapus), terbaru dulu. */
export async function ambilNotifikasi(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Tandai notifikasi sudah dibaca. */
export async function tandaiDibaca(id) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
  if (error) throw error
}

/** Tandai semua notifikasi user sudah dibaca. */
export async function tandaiSemuaDibaca(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  if (error) throw error
}

/** Ambil preferensi notifikasi user (default realtime). */
export async function ambilPreferensi(userId) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data ?? { mode: 'realtime', jam_digest: '08:00' }
}

/** Simpan/update preferensi notifikasi. */
export async function simpanPreferensi({ userId, mode, jamDigest }) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({ user_id: userId, mode, jam_digest: jamDigest }, { onConflict: 'user_id' })
    .select()
    .single()
  if (error) throw error
  return data
}
