// Recycle Bin — soft deleted data. Deera dapat restore atau hapus permanen.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { formatTanggal } from '../../utils/formatTanggal'

const TABEL_SOFT_DELETE = [
  { key: 'produksi', label: 'Produksi', kolom_nama: 'nama_produksi' },
  { key: 'kode', label: 'Kode', kolom_nama: 'kode_desain' },
  { key: 'nota_pembelian', label: 'Nota', kolom_nama: 'id' },
  { key: 'kasbon', label: 'Kasbon', kolom_nama: 'catatan' },
]

async function ambilDataTerhapus(tabel) {
  const { data, error } = await supabase
    .from(tabel)
    .select('*')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

async function restoreData(tabel, id) {
  const { error } = await supabase.from(tabel).update({ deleted_at: null }).eq('id', id)
  if (error) throw error
}

async function hapusPermanenData(tabel, id) {
  const { error } = await supabase.from(tabel).delete().eq('id', id)
  if (error) throw error
}

export function DataTerhapusPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tabelAktif, setTabelAktif] = useState('kode')
  const [konfirmHapus, setKonfirmHapus] = useState(null)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['data-terhapus', tabelAktif],
    queryFn: () => ambilDataTerhapus(tabelAktif),
  })

  const restoreMut = useMutation({
    mutationFn: ({ tabel, id }) => restoreData(tabel, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['data-terhapus'] }),
  })

  const hapusMut = useMutation({
    mutationFn: ({ tabel, id }) => hapusPermanenData(tabel, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['data-terhapus'] })
      setKonfirmHapus(null)
    },
  })

  const tabelConfig = TABEL_SOFT_DELETE.find((t) => t.key === tabelAktif)

  return (
    <div className="bg-champagne-100">
      <div className="sticky top-0 z-30 bg-navy-900 px-4 py-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/pengaturan')} className="font-sans text-sm text-champagne-100 opacity-70">&#8592; KEMBALI</button>
          <h1 className="font-heading text-heading text-champagne-100 flex-1">DATA TERHAPUS</h1>
        </div>
      </div>

      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {TABEL_SOFT_DELETE.map((t) => (
          <button key={t.key} onClick={() => setTabelAktif(t.key)}
            className={['rounded-full px-4 py-2 font-sans text-xs font-semibold whitespace-nowrap transition-colors',
              tabelAktif === t.key ? 'bg-navy-900 text-champagne-100' : 'bg-surface border border-border text-charcoal-600',
            ].join(' ')}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-2 space-y-2">
        {isLoading && <p className="text-center font-sans text-label text-charcoal-300 py-8">MEMUAT...</p>}
        {!isLoading && items.length === 0 && (
          <p className="text-center font-sans text-label text-charcoal-300 py-8">Tidak ada data terhapus.</p>
        )}
        {items.map((item) => {
          const nama = item[tabelConfig?.kolom_nama] ?? item.id
          return (
            <div key={item.id} className="rounded-xl bg-surface border border-border px-4 py-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-sans text-label font-semibold text-navy-900">{String(nama).slice(0, 40)}</p>
                  <p className="font-sans text-xs text-charcoal-300 mt-0.5">Dihapus: {formatTanggal(item.deleted_at)}</p>
                </div>
                <div className="flex gap-2 ml-3">
                  <button
                    onClick={() => restoreMut.mutate({ tabel: tabelAktif, id: item.id })}
                    disabled={restoreMut.isPending}
                    className="rounded-lg border border-border px-3 py-1.5 font-sans text-xs font-semibold text-charcoal-600 disabled:opacity-50"
                  >
                    RESTORE
                  </button>
                  <button
                    onClick={() => setKonfirmHapus({ tabel: tabelAktif, id: item.id, nama: String(nama).slice(0, 30) })}
                    className="rounded-lg border border-danger px-3 py-1.5 font-sans text-xs font-semibold text-danger"
                  >
                    HAPUS
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {konfirmHapus && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/60">
          <div className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4">
            <p className="font-heading text-heading text-navy-900">HAPUS PERMANEN</p>
            <p className="font-sans text-body text-charcoal-600">
              Hapus <span className="font-semibold text-navy-900">{konfirmHapus.nama}</span> secara permanen?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setKonfirmHapus(null)}
                className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600">
                BATAL
              </button>
              <button
                disabled={hapusMut.isPending}
                onClick={() => hapusMut.mutate({ tabel: konfirmHapus.tabel, id: konfirmHapus.id })}
                className="flex-1 rounded-xl bg-danger py-3.5 font-sans text-body font-semibold text-white disabled:opacity-50"
              >
                {hapusMut.isPending ? 'MENGHAPUS...' : 'HAPUS PERMANEN'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
