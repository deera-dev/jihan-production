// S-05 Daftar Produksi — list semua batch, kode di dalamnya, filter status.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDaftarProduksi } from './hooks/useProduksi'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { useAuthStore, selectIsDeera } from '../../store/useAuthStore'
import { formatTanggal } from '../../utils/formatTanggal'

export function ProduksiListPage() {
  const navigate = useNavigate()
  const isDeera = useAuthStore(selectIsDeera)
  const { data: listProduksi = [], isLoading, error } = useDaftarProduksi()
  const [filter, setFilter] = useState('semua') // 'semua' | 'aktif' | 'selesai'
  const [cari, setCari] = useState('')

  const filtered = listProduksi.filter((p) => {
    if (filter !== 'semua') {
      const kode = p.kode ?? []
      const semuaSelesai = kode.length > 0 && kode.every((k) => k.status === 'selesai')
      if (filter === 'selesai' && !semuaSelesai) return false
      if (filter === 'aktif' && semuaSelesai) return false
    }
    if (cari.trim()) {
      const q = cari.trim().toUpperCase()
      const cocok =
        p.kode_bahan?.toUpperCase().includes(q) ||
        (p.kode ?? []).some((k) => k.kode_desain?.toUpperCase().includes(q))
      if (!cocok) return false
    }
    return true
  })

  return (
    <div className="bg-champagne-100">
      <div className="flex items-center justify-between bg-navy-900 px-4 py-5">
        <h1 className="font-heading text-heading text-champagne-100">PRODUKSI</h1>
        {isDeera && (
          <button
            onClick={() => navigate('/produksi/buat')}
            className="rounded-lg bg-gold-500 px-3 py-1.5 font-sans text-xs font-semibold text-navy-900"
          >
            + BARU
          </button>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        <input
          type="search"
          placeholder="Cari kode / bahan..."
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
        />

        <div className="flex gap-2">
          {[
            { v: 'semua', l: 'SEMUA' },
            { v: 'aktif', l: 'AKTIF' },
            { v: 'selesai', l: 'SELESAI' },
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={[
                'rounded-full px-4 py-1.5 font-sans text-xs font-semibold transition-colors',
                filter === v
                  ? 'bg-navy-900 text-champagne-100'
                  : 'border border-border bg-surface text-charcoal-600',
              ].join(' ')}
            >
              {l}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="py-12 text-center font-sans text-body text-charcoal-300">MEMUAT...</p>
        )}
        {error && (
          <p className="rounded-xl bg-danger/10 px-4 py-3 font-sans text-label text-danger">
            Gagal memuat data. Periksa koneksi lalu coba lagi.
          </p>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="py-12 text-center font-sans text-body text-charcoal-300">
            {cari || filter !== 'semua' ? 'Tidak ada produksi yang sesuai filter.' : 'Belum ada produksi.'}
          </p>
        )}

        {filtered.map((produksi) => (
          <ProduksiCard
            key={produksi.id}
            produksi={produksi}
            onClick={() => navigate(`/produksi/${produksi.id}`)}
          />
        ))}
      </div>
    </div>
  )
}

function ProduksiCard({ produksi, onClick }) {
  const kode = produksi.kode ?? []
  const sortedKode = [...kode].sort((a, b) => a.urutan - b.urutan)

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl bg-surface border border-border px-4 py-4 text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-sans text-body font-semibold text-navy-900">
            BATCH {produksi.kode_bahan}
          </p>
          <p className="mt-0.5 font-sans text-label text-charcoal-300">
            {formatTanggal(produksi.tanggal)}
          </p>
        </div>
        <p className="font-sans text-label text-charcoal-300">{kode.length} kode</p>
      </div>

      {sortedKode.length > 0 && (
        <div className="mt-3 border-t border-border pt-3 space-y-2">
          {sortedKode.map((k) => (
            <div key={k.id} className="flex items-center justify-between gap-2">
              <span className="font-sans text-label font-semibold text-navy-900">{k.kode_desain}</span>
              <StatusBadge status={k.status} />
            </div>
          ))}
        </div>
      )}
    </button>
  )
}
