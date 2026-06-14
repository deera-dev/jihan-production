// Satu-satunya tempat fitur `sampel` boleh memanggil Supabase langsung
// (lihat architecture.md § Prinsip Arsitektur Kode — batas Dependency Inversion).
// hooks/ & komponen TIDAK BOLEH import `supabase` secara langsung — selalu lewat fungsi di sini.
//
// Upload sampel (2 foto), review & approve/tolak oleh Jihan, histori (termasuk yang ditolak — tidak pernah dihapus).
// Tabel utama: `public.sampel` (lihat architecture.md § Skema Database)

import { supabase } from '../../../lib/supabase'

// TODO: implementasikan fungsi CRUD/query sesuai kebutuhan UI fitur ini.
// Pola umum:
//
// export async function ambilSemuaSampel() {
//   const { data, error } = await supabase.from('sampel').select('*')
//   if (error) throw error
//   return data
// }

export {}
