// JP-039 / JP-040 — Dashboard.
// Deera: ringkasan operasional (produksi aktif, perlu aksi, kasbon).
// Jihan: notifikasi perlu aksi (review sampel, review HPP, approve pengiriman).

import { useNavigate } from 'react-router-dom'
import { useDaftarProduksi } from '../produksi/hooks/useProduksi'
import { useSaldoKasbon } from '../kasbon'
import { useAuthStore, selectProfile, selectIsDeera } from '../../store/useAuthStore'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { formatRp } from '../../utils/formatRp'

const STATUS_PERLU_AKSI_DEERA = [
  'sampel_dibuat','estimasi_pemakaian','konfirmasi_pemakaian',
  'proses_potong','input_buku_potong','input_nota',
  'input_hpp','hpp_ditolak','produksi','siap_kirim',
]

const STATUS_PERLU_AKSI_JIHAN = ['review_sampel','review_hpp']

export function DashboardPage() {
  const navigate  = useNavigate()
  const profile   = useAuthStore(selectProfile)
  const isDeera   = useAuthStore(selectIsDeera)
  const { data: listProduksi = [], isLoading } = useDaftarProduksi()
  const { data: saldoKasbon = 0 } = useSaldoKasbon()

  const nama      = profile?.nama_panggilan || profile?.nama_lengkap?.split(' ')[0] || '—'
  const labelRole = profile?.role === 'master' ? 'MASTER' : isDeera ? 'TIM DEERA' : 'TIM JIHAN'

  const kodePerluAksi = []
  const kodeAktif     = []

  for (const produksi of listProduksi) {
    for (const kode of produksi.kode ?? []) {
      if (kode.status === 'selesai' || kode.status === 'dibatalkan') continue
      kodeAktif.push({ ...kode, produksi })
      const statusSet = isDeera ? STATUS_PERLU_AKSI_DEERA : STATUS_PERLU_AKSI_JIHAN
      if (statusSet.includes(kode.status)) kodePerluAksi.push({ ...kode, produksi })
    }
  }

  const jumlahProduksiAktif = new Set(kodeAktif.map((k) => k.produksi.id)).size

  return (
    <div className="bg-champagne-100">
      <div className="sticky top-0 z-30 bg-navy-900 px-4 pt-8 pb-6">
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl text-champagne-100">{nama}</h1>
          <span className="rounded-full bg-champagne-100/10 border border-champagne-100/20 px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-champagne-100/70">
            {labelRole}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatChip label="Produksi Aktif" value={jumlahProduksiAktif} />
          <StatChip label="Kode Aktif" value={kodeAktif.length} />
          <StatChip label="Perlu Aksi" value={kodePerluAksi.length} highlight={kodePerluAksi.length > 0} />
        </div>
      </div>

      {isDeera && (
        <button
          onClick={() => navigate('/kasbon')}
          className="mx-4 mt-4 flex w-[calc(100%-2rem)] items-center justify-between rounded-xl border border-border bg-surface px-4 py-3.5"
        >
          <div>
            <p className="font-sans text-label font-semibold text-charcoal-600 uppercase tracking-wide">
              Saldo Kasbon
            </p>
            <p className={['font-heading text-xl font-bold', saldoKasbon >= 0 ? 'text-navy-900' : 'text-danger'].join(' ')}>
              {formatRp(saldoKasbon)}
            </p>
          </div>
          <span className="font-sans text-label text-charcoal-300">&#8250;</span>
        </button>
      )}

      <div className="px-4 py-5 space-y-6">
        {isLoading && (
          <p className="py-8 text-center font-sans text-body text-charcoal-300">MEMUAT...</p>
        )}

        {kodePerluAksi.length > 0 && (
          <section>
            <h2 className="font-sans text-label font-semibold text-charcoal-600 uppercase mb-3">Perlu Aksi</h2>
            <div className="space-y-2">
              {kodePerluAksi.map((k) => (
                <AksiCard key={k.id} kode={k} isDeera={isDeera} onClick={() => navigate('/kode/' + k.id)} />
              ))}
            </div>
          </section>
        )}

        {kodeAktif.length > 0 && (
          <section>
            <h2 className="font-sans text-label font-semibold text-charcoal-600 uppercase mb-3">Sedang Berjalan</h2>
            <div className="space-y-2">
              {kodeAktif
                .filter((k) => !kodePerluAksi.find((p) => p.id === k.id))
                .map((k) => (
                  <KodeMiniCard key={k.id} kode={k} onClick={() => navigate('/kode/' + k.id)} />
                ))}
            </div>
          </section>
        )}

        {!isLoading && kodeAktif.length === 0 && (
          <div className="py-16 text-center space-y-3">
            <p className="font-heading text-heading text-charcoal-300">Belum Ada Produksi</p>
            {isDeera && (
              <button
                onClick={() => navigate('/produksi/buat')}
                className="rounded-xl bg-gold-500 px-6 py-3 font-sans text-body font-semibold text-navy-900"
              >
                + BUAT PRODUKSI
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatChip({ label, value, highlight }) {
  return (
    <div className={['rounded-xl px-3 py-2.5 text-center', highlight ? 'bg-gold-500' : 'bg-white/10'].join(' ')}>
      <p className={['font-heading text-xl font-bold', highlight ? 'text-navy-900' : 'text-champagne-100'].join(' ')}>
        {value}
      </p>
      <p className={['font-sans text-xs', highlight ? 'text-navy-900' : 'text-champagne-100 opacity-70'].join(' ')}>
        {label}
      </p>
    </div>
  )
}

function AksiCard({ kode, isDeera, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl bg-surface border border-gold-500/40 px-4 py-3.5 text-left flex items-center justify-between gap-3"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-sans text-label font-semibold text-navy-900">{kode.kode_desain}</p>
          <StatusBadge status={kode.status} />
        </div>
        <p className="font-sans text-xs text-charcoal-300 uppercase">{aksiLabel(kode.status, isDeera)}</p>
      </div>
      <span className="shrink-0 text-gold-500 font-sans text-body">&#8250;</span>
    </button>
  )
}

function aksiLabel(status) {
  const map = {
    sampel_dibuat: 'Upload sampel',
    review_sampel: 'Review sampel',
    estimasi_pemakaian: 'Input estimasi pemakaian',
    konfirmasi_pemakaian: 'Konfirmasi estimasi bahan',
    proses_potong: 'Mulai proses potong',
    input_buku_potong: 'Input buku potong',
    input_nota: 'Input nota bahan baku',
    input_hpp: 'Input HPP',
    review_hpp: 'Review & approve HPP',
    hpp_ditolak: 'Revisi HPP',
    produksi: 'Update tracking produksi',
    siap_kirim: 'Proses pengiriman',
  }
  return map[status] ?? status.replace(/_/g, ' ')
}

function KodeMiniCard({ kode, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl bg-surface border border-border px-4 py-3 text-left flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2 min-w-0">
        <p className="font-sans text-label font-semibold text-navy-900 truncate">{kode.kode_desain}</p>
        <StatusBadge status={kode.status} />
      </div>
      <span className="shrink-0 font-sans text-label text-charcoal-300">&#8250;</span>
    </button>
  )
}
