import { useAuthStore } from '../../store/useAuthStore'
import { logout } from './api/authRepository'

export function PendingPage() {
  const { clearSession, profile } = useAuthStore()

  async function handleLogout() {
    await logout()
    clearSession()
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-champagne-100 px-6">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-champagne-200">
          <span className="font-heading text-2xl text-gold-500">⏳</span>
        </div>

        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-500">
            MENUNGGU PERSETUJUAN
          </p>
          <h1 className="mt-1 font-heading text-heading text-navy-900">
            {profile?.nama_panggilan ?? 'Halo'}
          </h1>
        </div>

        <p className="font-sans text-sm text-charcoal-600 leading-relaxed">
          Akun Anda sudah terdaftar. Admin akan segera meninjau dan mengaktifkan akun Anda.
          Silakan coba login kembali setelah mendapat konfirmasi.
        </p>

        <div className="rounded-2xl bg-white/60 border border-border px-4 py-3 text-left space-y-1">
          {profile?.username && (
            <p className="font-sans text-xs text-charcoal-300">
              Username: <span className="font-semibold text-navy-900">{profile.username}</span>
            </p>
          )}
          <p className="font-sans text-xs text-charcoal-300">
            Status: <span className="font-semibold text-gold-500">Menunggu persetujuan</span>
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full rounded-xl border-2 border-border py-3 font-sans text-sm font-semibold text-charcoal-600 active:opacity-70"
        >
          KELUAR
        </button>
      </div>
    </main>
  )
}
