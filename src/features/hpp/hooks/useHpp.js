// Boundary antara UI & data layer fitur `hpp`.
// Komponen panggil hook ini — TIDAK PERNAH import repository/Supabase langsung
// (Dependency Inversion: Component → hook → repository → Supabase).

import { useQuery } from '@tanstack/react-query'
// import { ambilSemuaHpp } from '../api/hppRepository.js'

/**
 * TODO: ganti queryFn & queryKey sesuai data yang dibutuhkan UI.
 * @returns {{ data: any, isLoading: boolean, error: Error | null }}
 */
export function useHpp() {
  return useQuery({
    queryKey: ['hpp'],
    queryFn: async () => {
      throw new Error('TODO: implementasikan useHpp — hubungkan ke hppRepository.js')
    },
    enabled: false, // nonaktif sampai diimplementasikan — cegah error saat dev
  })
}
