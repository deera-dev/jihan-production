// Satu-satunya tempat fitur `auth` boleh memanggil Supabase langsung.

import { supabase } from '../../../lib/supabase'

/**
 * Login dengan email ATAU username + password.
 * Jika identifier tidak mengandung '@', dianggap username — cari email dulu.
 */
export async function login({ identifier, password }) {
  let email = identifier.trim()

  if (!email.includes('@')) {
    const { data, error } = await supabase.rpc('cari_email_by_username', {
      p_username: email,
    })
    if (error || !data) throw new Error('Username tidak ditemukan.')
    email = data
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

/**
 * Daftar akun baru (self-registration). Mengirim konfirmasi email.
 */
export async function daftar({ email, password, username, nama_panggilan }) {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', username.trim())
    .maybeSingle()
  if (existing) throw new Error('Username sudah dipakai. Pilih username lain.')

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        username: username.trim().toLowerCase(),
        nama_panggilan: nama_panggilan.trim().toUpperCase(),
      },
      emailRedirectTo: 'https://jihan.deera.id',
    },
  })
  if (error) throw error
  return data
}

/** Logout */
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** Ambil sesi saat ini */
export async function ambilSesiSaatIni() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

/**
 * Ambil profil dari public.users — termasuk status (pending/active).
 */
export async function ambilProfil(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, nama_lengkap, nama_panggilan, username, role, status')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Update profil user sendiri (nama_panggilan & username).
 */
export async function updateProfil({ nama_panggilan, username }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Tidak ada sesi aktif')

  if (username) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.trim().toLowerCase())
      .neq('id', user.id)
      .maybeSingle()
    if (existing) throw new Error('Username sudah dipakai. Pilih username lain.')
  }

  const updates = {}
  if (nama_panggilan) updates.nama_panggilan = nama_panggilan.trim().toUpperCase()
  if (username) updates.username = username.trim().toLowerCase()

  const { error } = await supabase.from('users').update(updates).eq('id', user.id)
  if (error) throw error
}

/**
 * Ambil semua user aktif (untuk Kelola Pengguna).
 */
export async function ambilSemuaUser() {
  const { data, error } = await supabase
    .from('users')
    .select('id, nama_lengkap, nama_panggilan, username, role, status, created_at')
    .eq('status', 'active')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

/**
 * Ambil user yang masih pending (belum disetujui).
 */
export async function ambilUserPending() {
  const { data, error } = await supabase
    .from('users')
    .select('id, nama_panggilan, username, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

/**
 * Setujui user pending — set role + aktifkan.
 * Hanya Master via RPC SECURITY DEFINER.
 */
export async function setujuiUser(userId, role) {
  const { error } = await supabase.rpc('setujui_user', {
    p_user_id: userId,
    p_role: role,
  })
  if (error) throw error
}

/**
 * Hapus user via edge function (butuh service role).
 */
export async function hapusUser(userId) {
  const { error } = await supabase.functions.invoke('hapus-pengguna', {
    body: { userId },
  })
  if (error) throw error
}

/** Dengarkan perubahan sesi auth */
export function dengarkanPerubahanSesi(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

/** Terima undangan: set password (masih dipakai untuk link lama) */
export async function terimaUndangan(passwordBaru) {
  const { error } = await supabase.auth.updateUser({ password: passwordBaru })
  if (error) throw error
}
