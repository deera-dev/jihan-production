// S-29 Pengaturan Deera / S-34 Pengaturan Jihan
import { useNavigate } from 'react-router-dom'
import { useAuthStore, selectIsDeera, selectIsMaster, selectActualRole } from '../../store/useAuthStore'
import { logout } from '../auth'
import { ROLE } from '../../constants/enums'

const LABEL_ROLE = {
  [ROLE.DEERA]:  'TIM DEERA',
  [ROLE.JIHAN]:  'TIM JIHAN',
  [ROLE.MASTER]: 'MASTER',
}

export function PengaturanPage() {
  const navigate    = useNavigate()
  const isDeera     = useAuthStore(selectIsDeera)
  const isMaster    = useAuthStore(selectIsMaster)
  const actualRole  = useAuthStore(selectActualRole)
  const user        = useAuthStore((s) => s.user)
  const profile     = useAuthStore((s) => s.profile)

  async function handleKeluar() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-champagne-100">
      <div className="bg-navy-900 px-4 py-5">
        <h1 className="font-heading text-heading text-champagne-100">PENGATURAN</h1>
      </div>

      <div className="px-4 py-5 space-y-5">
        <div className="rounded-xl bg-surface border border-border p-4">
          <p className="font-sans text-body font-semibold text-navy-900">{profile?.nama_lengkap ?? '—'}</p>
          <p className="mt-0.5 font-sans text-label text-charcoal-600">{user?.email ?? '—'}</p>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <span className="inline-block rounded-full bg-champagne-200 px-3 py-0.5 font-sans text-xs font-semibold text-charcoal-600">
              {LABEL_ROLE[actualRole] ?? actualRole?.toUpperCase() ?? '—'}
            </span>
            {isMaster && (
              <span className="inline-block rounded-full bg-gold-500/20 border border-gold-500 px-3 py-0.5 font-sans text-xs font-semibold text-gold-500">
                LIHAT SEBAGAI {isDeera ? 'DEERA' : 'JIHAN'}
              </span>
            )}
          </div>
        </div>

        <section>
          <p className="mb-2 font-sans text-label font-semibold text-charcoal-300 uppercase tracking-widest">Akun</p>
          <div className="rounded-xl bg-surface border border-border divide-y divide-border">
            <button
              className="flex w-full items-center justify-between px-4 py-3.5"
              onClick={() => navigate('/ganti-password')}
            >
              <span className="font-sans text-body text-navy-900">Ganti Password</span>
              <span className="font-sans text-label text-charcoal-300">›</span>
            </button>
          </div>
        </section>

        {isDeera && (
          <section>
            <p className="mb-2 font-sans text-label font-semibold text-charcoal-300 uppercase tracking-widest">Sistem</p>
            <div className="rounded-xl bg-surface border border-border divide-y divide-border">
              <button className="flex w-full items-center justify-between px-4 py-3.5" onClick={() => navigate('/pengaturan/template-hpp')}>
                <span className="font-sans text-body text-navy-900">Template HPP</span>
                <span className="font-sans text-label text-charcoal-300">›</span>
              </button>
              <button className="flex w-full items-center justify-between px-4 py-3.5" onClick={() => navigate('/pengaturan/pengguna')}>
                <span className="font-sans text-body text-navy-900">Kelola Pengguna</span>
                <span className="font-sans text-label text-charcoal-300">›</span>
              </button>
              <button className="flex w-full items-center justify-between px-4 py-3.5" onClick={() => navigate('/pengaturan/activity-log')}>
                <span className="font-sans text-body text-navy-900">Activity Log</span>
                <span className="font-sans text-label text-charcoal-300">›</span>
              </button>
              <button className="flex w-full items-center justify-between px-4 py-3.5" onClick={() => navigate('/pengaturan/data-terhapus')}>
                <span className="font-sans text-body text-navy-900">Data Terhapus</span>
                <span className="font-sans text-label text-charcoal-300">›</span>
              </button>
            </div>
          </section>
        )}

        <section>
          <p className="mb-2 font-sans text-label font-semibold text-charcoal-300 uppercase tracking-widest">Aplikasi</p>
          <div className="rounded-xl bg-surface border border-border divide-y divide-border">
            {!isDeera && (
              <button className="flex w-full items-center justify-between px-4 py-3.5" onClick={() => navigate('/pengaturan/notifikasi')}>
                <span className="font-sans text-body text-navy-900">Mode Notifikasi</span>
                <span className="font-sans text-label text-charcoal-300">›</span>
              </button>
            )}
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="font-sans text-body text-charcoal-600">Versi</span>
              <span className="font-sans text-label text-charcoal-300">1.0.0</span>
            </div>
          </div>
        </section>

        <button
          onClick={handleKeluar}
          className="w-full rounded-xl border border-danger py-3.5 font-sans text-button font-semibold text-danger"
        >
          KELUAR
        </button>
      </div>
    </div>
  )
}
