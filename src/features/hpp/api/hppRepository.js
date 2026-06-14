// Satu-satunya tempat fitur `hpp` boleh memanggil Supabase langsung
// (lihat architecture.md § Prinsip Arsitektur Kode — batas Dependency Inversion).
// hooks/ & komponen TIDAK BOLEH import `supabase` secara langsung — selalu lewat fungsi di sini.
//
// Input & kalkulasi HPP (Jasa + Bahan Primer/Sekunder + Bahan Baku), review/approve Jihan, histori revisi.
// Tabel utama: `public.hpp` (lihat architecture.md § Skema Database)

import { supabase } from '../../../lib/supabase'

// TODO: implementasikan fungsi CRUD/query sesuai kebutuhan UI fitur ini.
// Pola umum:
//
// export async function ambilSemuaHpp() {
//   const { data, error } = await supabase.from('hpp').select('*')
//   if (error) throw error
//   return data
// }

export {}
