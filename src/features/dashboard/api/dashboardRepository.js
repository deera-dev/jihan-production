// Satu-satunya tempat fitur `dashboard` boleh memanggil Supabase langsung
// (lihat architecture.md § Prinsip Arsitektur Kode — batas Dependency Inversion).
// hooks/ & komponen TIDAK BOLEH import `supabase` secara langsung — selalu lewat fungsi di sini.
//
// Ringkasan utama — tampilan berbeda per role (Deera vs Jihan), satu slice.

import { supabase } from '../../../lib/supabase'

// TODO: implementasikan fungsi CRUD/query sesuai kebutuhan UI fitur ini.
// Pola umum:
//
// export async function ambilSemuaDashboard() {
//   const { data, error } = await supabase.from('TODO_nama_tabel').select('*')
//   if (error) throw error
//   return data
// }

export {}
