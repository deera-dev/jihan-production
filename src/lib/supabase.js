import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY wajib diisi di file .env (lihat .env.example).'
  )
}

/**
 * Satu-satunya Supabase client di seluruh aplikasi.
 *
 * PENTING — batas arsitektur (lihat architecture.md § Prinsip Arsitektur Kode):
 * Import `supabase` HANYA boleh terjadi di dalam `features/<slice>/api/*Repository.js`.
 * Komponen & hook tidak boleh memanggil ini secara langsung — selalu lewat
 * hook (`use*`) yang membungkus repository. Ini menjaga Dependency Inversion:
 * UI bergantung pada abstraksi hook, bukan pada detail teknis Supabase.
 *
 * @type {import('@supabase/supabase-js').SupabaseClient<import('./database.types').Database>}
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
