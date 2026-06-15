// S-31 Kelola Pengguna — khusus Tim Deera (JP-004)
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ambilSemuaUser, ambilUserPending, setujuiUser, hapusUser } from '../auth'

const OPSI_ROLE = [
  { value: 'jihan', label: 'Tim Jihan', desc: 'Read-only + approve' },
  { value: 'deera', label: 'Tim Deera', desc: 'Full CRUD' },
]

const LABEL_ROLE = { deera: 'Tim Deera', jihan: 'Tim Jihan', master: 'Master' }

function PendingCard({ user, onSetujui, isLoading }) {
  const [roleYangDipilih, setRoleYangDipilih] = useState('jihan')
  const [buka, setBuka] = useState(false)

  return (
    <div className="rounded-xl border border-gold-500/40 bg-gold-500/5 px-4 py-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-sans text-sm font-semibold text-navy-900">
            {user.nama_panggilan ?? '(Belum ada nama)'}
          </p>
          {user.username && (
            <p className="font-sans text-xs text-charcoal-300">@{user.username}</p>
          )}
          <span className="mt-1 inline-block rounded-full bg-gold-500/20 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-gold-500">
            Menunggu persetujuan
          </span>
        </div>
        <button
          onClick={() => setBuka((v) => !v)}
          className="rounded-lg bg-gold-500 px-3 py-1.5 font-sans text-xs font-bold text-navy-900 active:opacity-70"
        >
          SETUJUI
        </button>
      </div>

      {buka && (
        <div className="space-y-3 border-t border-gold-500/20 pt-3">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-charcoal-600">
            Pilih Role
          </p>
          <div className="flex gap-2">
            {OPSI_ROLE.map((r) => (
              <button
                key={r.value}
                onClick={() => setRoleYangDipilih(r.value)}
                className={[
                  'flex-1 rounded-xl border py-2.5 font-sans text-xs font-bold transition-colors',
                  roleYangDipilih === r.value
                    ? 'border-navy-900 bg-navy-900 text-champagne-100'
                    : 'border-border text-charcoal-600',
                ].join(' ')}
              >
                {r.label}
                <p className="mt-0.5 font-sans text-[10px] font-normal opacity-70">{r.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setBuka(false)}
              className="flex-1 rounded-xl border border-border py-2.5 font-sans text-xs font-semibold text-charcoal-600"
            >
              BATAL
            </button>
            <button
              onClick={() => onSetujui(user.id, roleYangDipilih)}
              disabled={isLoading}
              className="flex-1 rounded-xl bg-navy-900 py-2.5 font-sans text-xs font-bold text-champagne-100 disabled:opacity-50"
            >
              {isLoading ? 'MENYIMPAN...' : 'KONFIRMASI'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function KelolaPenggunaPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [hapusTarget, setHapusTarget] = useState(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: ambilSemuaUser,
  })

  const { data: pending = [], isLoading: loadingPending } = useQuery({
    queryKey: ['users-pending'],
    queryFn: ambilUserPending,
    refetchInterval: 30_000, // poll tiap 30 detik
  })

  const { mutate: jalankanSetujui, isPending: isSetujuiPending } = useMutation({
    mutationFn: ({ userId, role }) => setujuiUser(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users-pending'] })
    },
  })

  const { mutate: jalankanHapus, isPending: isHapusPending } = useMutation({
    mutationFn: (userId) => hapusUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setHapusTarget(null)
    },
  })

  return (
    <div className="bg-champagne-100">
      <div className="sticky top-0 z-30 flex items-center gap-3 bg-navy-900 px-4 py-5">
        <button onClick={() => navigate(-1)} className="font-sans text-body text-champagne-100">
          &#8592;
        </button>
        <h1 className="font-heading text-heading text-champagne-100">KELOLA PENGGUNA</h1>
      </div>

      <div className="px-4 py-5 space-y-6 pb-24">
        {/* ── PENDING ── */}
        {(loadingPending || pending.length > 0) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="font-sans text-xs font-bold uppercase tracking-widest text-gold-500">
                Menunggu Persetujuan
              </p>
              {pending.length > 0 && (
                <span className="rounded-full bg-gold-500 px-2 py-0.5 font-sans text-[10px] font-bold text-navy-900">
                  {pending.length}
                </span>
              )}
              <div className="flex-1 h-px bg-gold-500/20" />
            </div>

            {loadingPending ? (
              <p className="font-sans text-xs text-charcoal-300">MEMUAT...</p>
            ) : (
              pending.map((u) => (
                <PendingCard
                  key={u.id}
                  user={u}
                  onSetujui={(userId, role) => jalankanSetujui({ userId, role })}
                  isLoading={isSetujuiPending}
                />
              ))
            )}
          </div>
        )}

        {/* ── AKTIF ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="font-sans text-xs font-bold uppercase tracking-widest text-charcoal-300">
              Pengguna Aktif
            </p>
            <div className="flex-1 h-px bg-border" />
          </div>

          {isLoading ? (
            <p className="py-8 text-center font-sans text-body text-charcoal-300">MEMUAT...</p>
          ) : users.length === 0 ? (
            <p className="py-8 text-center font-sans text-body text-charcoal-300">
              Belum ada pengguna aktif.
            </p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="rounded-xl bg-surface border border-border px-4 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-sans text-sm font-semibold text-navy-900">
                      {u.nama_panggilan || u.nama_lengkap || '(Belum diisi)'}
                    </p>
                    {u.username && (
                      <p className="font-sans text-xs text-charcoal-300">@{u.username}</p>
                    )}
                    <span className="mt-1 inline-block rounded-full bg-champagne-200 px-2.5 py-0.5 font-sans text-xs font-semibold uppercase text-charcoal-600">
                      {LABEL_ROLE[u.role] ?? u.role ?? '—'}
                    </span>
                  </div>
                  <button
                    onClick={() => setHapusTarget(u)}
                    className="font-sans text-xs font-semibold text-danger"
                  >
                    HAPUS
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {hapusTarget && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/60">
          <div className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4">
            <p className="font-heading text-heading text-navy-900">HAPUS PENGGUNA</p>
            <p className="font-sans text-body text-charcoal-600">
              Hapus akun{' '}
              <span className="font-semibold text-navy-900">
                {hapusTarget.nama_panggilan || hapusTarget.nama_lengkap}
              </span>
              ? Pengguna tidak bisa login lagi setelah dihapus.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setHapusTarget(null)}
                className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600"
              >
                BATAL
              </button>
              <button
                onClick={() => jalankanHapus(hapusTarget.id)}
                disabled={isHapusPending}
                className="flex-1 rounded-xl bg-danger py-3.5 font-sans text-body font-semibold text-white disabled:opacity-50"
              >
                {isHapusPending ? 'MENGHAPUS...' : 'HAPUS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
