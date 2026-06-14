// Boundary antara UI & data layer utk sesi auth.
// Mengisi `useAuthStore` (state lintas-slice) berdasarkan hasil dari authRepository.
// Komponen cukup `const { profile, isLoading } = useSession()` — tidak perlu tahu
// soal Supabase sama sekali (Dependency Inversion).

import { useEffect } from 'react'
import { useAuthStore } from '../../../store/useAuthStore'
import { ambilProfil, ambilSesiSaatIni, dengarkanPerubahanSesi } from '../api/authRepository'

export function useSession() {
  const { user, profile, isLoading, setSession, clearSession, setLoading } = useAuthStore()

  useEffect(() => {
    let aktif = true

    async function muatSesiAwal() {
      setLoading(true)
      try {
        const session = await ambilSesiSaatIni()
        if (!aktif) return
        if (session?.user) {
          const profil = await ambilProfil(session.user.id)
          if (aktif) setSession(session.user, profil)
        } else {
          if (aktif) clearSession()
        }
      } catch (err) {
        console.error('[useSession] gagal memuat sesi:', err)
        if (aktif) clearSession()
      }
    }

    muatSesiAwal()

    const berhentiMendengar = dengarkanPerubahanSesi(async (session) => {
      if (!aktif) return
      try {
        if (session?.user) {
          const profil = await ambilProfil(session.user.id)
          if (aktif) setSession(session.user, profil)
        } else {
          if (aktif) clearSession()
        }
      } catch (err) {
        console.error('[useSession] gagal update sesi:', err)
        if (aktif) clearSession()
      }
    })

    return () => {
      aktif = false
      berhentiMendengar()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { user, profile, isLoading, role: profile?.role ?? null }
}
