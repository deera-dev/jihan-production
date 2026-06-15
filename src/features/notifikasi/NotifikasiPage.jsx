// JP-037–042 — Notifikasi: daftar + preferensi real-time/digest harian.

import { useNavigate } from 'react-router-dom'
import { useAuthStore, selectIsDeera, selectProfile } from '../../store/useAuthStore'
import {
  useNotifikasi,
  useTandaiDibaca,
  useTandaiSemuaDibaca,
  usePreferensiNotifikasi,
  useSimpanPreferensi,
} from './hooks/useNotifikasi'
import { formatTanggal } from '../../utils/formatTanggal'

const ENTITY_PATH = {
  kode: (id) => `/kode/${id}`,
  sampel: (id) => `/kode/${id}`,
  hpp: (id) => `/kode/${id}/hpp`,
  tracking: (id) => `/kode/${id}`,
  pengiriman: (id) => `/kode/${id}`,
  kasbon: () => `/kasbon`,
  nota: () => `/nota`,
}

export function NotifikasiPage() {
  const navigate = useNavigate()
  const isDeera = useAuthStore(selectIsDeera)
  const { data: notifikasi = [], isLoading } = useNotifikasi()
  const { data: preferensi } = usePreferensiNotifikasi()
  const tandaiDibacaMut = useTandaiDibaca()
  const tandaiSemuaMut = useTandaiSemuaDibaca()
  const simpanPrefMut = useSimpanPreferensi()

  const belumDibaca = notifikasi.filter((n) => !n.is_read).length

  function handleKlik(notif) {
    if (!notif.is_read) tandaiDibacaMut.mutate(notif.id)
    const pathFn = ENTITY_PATH[notif.entity_type]
    if (pathFn && notif.entity_id) navigate(pathFn(notif.entity_id))
  }

  function toggleMode() {
    const mode = preferensi?.mode === 'realtime' ? 'digest_harian' : 'realtime'
    simpanPrefMut.mutate({ mode, jamDigest: preferensi?.jam_digest ?? '08:00' })
  }

  return (
    <div className="bg-champagne-100">
      <div className="bg-navy-900 px-4 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-heading text-champagne-100">NOTIFIKASI</h1>
            {belumDibaca > 0 && (
              <p className="font-sans text-xs text-gold-500 mt-0.5">{belumDibaca} BELUM DIBACA</p>
            )}
          </div>
          {belumDibaca > 0 && (
            <button
              onClick={() => tandaiSemuaMut.mutate()}
              disabled={tandaiSemuaMut.isPending}
              className="font-sans text-xs text-champagne-100 opacity-70 underline"
            >
              TANDAI SEMUA DIBACA
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {!isDeera && (
          <div className="rounded-xl bg-surface border border-border px-4 py-4">
            <p className="font-sans text-xs font-semibold text-charcoal-300 uppercase mb-3">Mode Notifikasi</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-sans text-label font-semibold text-navy-900">
                  {preferensi?.mode === 'digest_harian' ? 'DIGEST HARIAN' : 'REAL-TIME'}
                </p>
                <p className="font-sans text-xs text-charcoal-600 mt-0.5">
                  {preferensi?.mode === 'digest_harian'
                    ? `Ringkasan dikirim setiap hari pukul ${preferensi?.jam_digest ?? '08:00'}`
                    : 'Notifikasi langsung setiap ada aktivitas'}
                </p>
              </div>
              <button
                onClick={toggleMode}
                disabled={simpanPrefMut.isPending}
                className={[
                  'relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none',
                  preferensi?.mode === 'digest_harian' ? 'bg-gold-500' : 'bg-charcoal-300',
                ].join(' ')}
              >
                <span className={[
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200',
                  preferensi?.mode === 'digest_harian' ? 'translate-x-6' : 'translate-x-0',
                ].join(' ')} />
              </button>
            </div>

            {preferensi?.mode === 'digest_harian' && (
              <div className="mt-3 flex items-center gap-3">
                <p className="font-sans text-xs text-charcoal-600">Jam pengiriman:</p>
                <input
                  type="time"
                  defaultValue={preferensi?.jam_digest ?? '08:00'}
                  onBlur={(e) => simpanPrefMut.mutate({ mode: 'digest_harian', jamDigest: e.target.value })}
                  className="rounded-lg border border-border px-3 py-1.5 font-sans text-label text-navy-900 outline-none focus:border-gold-500"
                />
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <p className="text-center font-sans text-label text-charcoal-300 py-8">MEMUAT...</p>
        ) : notifikasi.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-sans text-body text-charcoal-300">BELUM ADA NOTIFIKASI</p>
            <p className="font-sans text-label text-charcoal-300 mt-1 opacity-60">Semua aktivitas akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifikasi.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleKlik(notif)}
                className={[
                  'w-full text-left rounded-xl border px-4 py-3 transition-colors',
                  notif.is_read
                    ? 'bg-surface border-border'
                    : 'bg-gold-500/5 border-gold-500/30',
                ].join(' ')}
              >
                <div className="flex items-start gap-3">
                  {!notif.is_read && (
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-gold-500 flex-shrink-0" />
                  )}
                  <div className={notif.is_read ? 'pl-5' : ''}>
                    <p className={[
                      'font-sans text-label',
                      notif.is_read ? 'text-charcoal-600' : 'font-semibold text-navy-900',
                    ].join(' ')}>
                      {notif.judul}
                    </p>
                    <p className="font-sans text-xs text-charcoal-600 mt-0.5">{notif.isi}</p>
                    <p className="font-sans text-xs text-charcoal-300 mt-1">{formatTanggal(notif.created_at)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
