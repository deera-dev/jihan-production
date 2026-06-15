// Satu-satunya tempat fitur `auth` boleh memanggil Supabase langsung
// (lihat architecture.md § Prinsip Arsitektur Kode — batas Dependency Inversion).
// hooks/useSession.js & komponen TIDAK BOLEH import `supabase` secara langsung.

import { supabase } from '../../../lib/supabase'

/**
 * @typedef {Object} ProfilUser
 * @property {string} id
 * @property {string} nama_lengkap
 * @property {'deera' | 'jihan'} role
 */

/**
 * Login dengan email + password.
 * @param {{ email: string, password: string }} kredensial
 * @returns {Promise<import('@supabase/supabase-js').Session>}
 */
export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

/** @returns {Promise<void>} */
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/** @returns {Promise<import('@supabase/supabase-js').Session | null>} */
export async function ambilSesiSaatIni() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

/**
 * Ambil profil (nama_lengkap, role) dari `public.users` — sumber kebenaran utk role.
 * Email tidak ada di public.users — diambil dari session.user.email.
 * @param {string} userId
 * @returns {Promise<ProfilUser | null>}
 */
export async function ambilProfil(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, nama_lengkap, role')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Ambil semua user terdaftar (untuk halaman Kelola Pengguna, khusus Deera).
 * @returns {Promise<Array<ProfilUser>>}
 */
export async function ambilSemuaUser() {
  const { data, error } = await supabase
    .from('users')
    .select('id, nama_lengkap, role, created_at')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

/**
 * Undang pengguna baru lewat edge function (service role key ada di server).
 * @param {{ email: string, nama_lengkap: string, role: 'deera' | 'jihan' }} params
 * @returns {Promise<void>}
 */
export async function undangPengguna({ email, nama_lengkap, role }) {
  const { error } = await supabase.functions.invoke('undang-pengguna', {
    body: { email, nama_lengkap, role },
  })
  if (error) throw error
}

export async function hapusUser(userId) {
  const { error } = await supabase.functions.invoke('hapus-pengguna', {
    body: { userId },
  })
  if (error) throw error
}

/**
 * Daftarkan listener perubahan auth state (login/logout/refresh token).
 * @param {(session: import('@supabase/supabase-js').Session | null) => void} callback
 * @returns {() => void} unsubscribe
 */
export function dengarkanPerubahanSesi(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
  return () => data.subscription.unsubscribe()
}

/**
 * Terima undangan: set password pertama kali via link invite (magic link/token
 * dari email undangan Deera). Lihat architecture.md § Invitation Flow.
 * @param {string} passwordBaru
 * @returns {Promise<void>}
 */
export async function terimaUndangan(passwordBaru) {
  const { error } = await supabase.auth.updateUser({ password: passwordBaru })
  if (error) throw error
}
