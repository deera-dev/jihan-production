// Boundary antara UI & data layer fitur `dashboard`.
// Komponen panggil hook ini — TIDAK PERNAH import repository/Supabase langsung
// (Dependency Inversion: Component → hook → repository → Supabase).

import { useQuery } from '@tanstack/react-query'
// import { ambilSemuaDashboard } from '../api/dashboardRepository.js'

/**
 * TODO: ganti queryFn & queryKey sesuai data yang dibutuhkan UI.
 * @returns {{ data: any, isLoading: boolean, error: Error | null }}
 */
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      throw new Error('TODO: implementasikan useDashboard — hubungkan ke dashboardRepository.js')
    },
    enabled: false, // nonaktif sampai diimplementasikan — cegah error saat dev
  })
}
