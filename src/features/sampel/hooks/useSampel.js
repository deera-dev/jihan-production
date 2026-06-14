// Boundary antara UI & data layer fitur `sampel`.
// Komponen panggil hook ini — TIDAK PERNAH import repository/Supabase langsung
// (Dependency Inversion: Component → hook → repository → Supabase).

import { useQuery } from '@tanstack/react-query'
// import { ambilSemuaSampel } from '../api/sampelRepository.js'

/**
 * TODO: ganti queryFn & queryKey sesuai data yang dibutuhkan UI.
 * @returns {{ data: any, isLoading: boolean, error: Error | null }}
 */
export function useSampel() {
  return useQuery({
    queryKey: ['sampel'],
    queryFn: async () => {
      throw new Error('TODO: implementasikan useSampel — hubungkan ke sampelRepository.js')
    },
    enabled: false, // nonaktif sampai diimplementasikan — cegah error saat dev
  })
}
