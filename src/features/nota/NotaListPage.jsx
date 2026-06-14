// JP-021 / JP-023 — Daftar & Input Nota Pembelian Bahan Baku.
// Hanya Deera yang bisa akses (route guard + RLS).

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDaftarNota, useBuatNota, useKatalogBahanBaku } from './hooks/useNota'
import { useDaftarProduksi } from '../produksi/hooks/useProduksi'
import { useAuthStore, selectProfile } from '../../store/useAuthStore'
import { formatRp } from '../../utils/formatRp'
import { formatTanggal } from '../../utils/formatTanggal'

const TIPE_ITEM = [
  { v: 'unit', l: 'Unit (pcs/rol)' },
  { v: 'usage', l: 'Usage (nilai total)' },
]

export function NotaListPage() {
  const navigate = useNavigate()
  const profile = useAuthStore(selectProfile)
  const { data: listNota = [], isLoading } = useDaftarNota()
  const { data: katalog = [] } = useKatalogBahanBaku()
  const { data: listProduksi = [] } = useDaftarProduksi()
  const buatNotaMut = useBuatNota()

  const [showForm, setShowForm] = useState(false)

  // Kumpulkan semua kode aktif dari semua produksi
  const semuaKode = listProduksi.flatMap((p) =>
    (p.kode ?? []).filter((k) => !['selesai', 'dibatalkan'].includes(k.status))
      .map((k) => ({ ...k, produksi: p }))
  )

  return (
    <div className="min-h-screen bg-champagne-100">
      <div className="flex items-center justify-between bg-navy-900 px-4 py-5">
        <h1 className="font-heading text-heading text-champagne-100">NOTA</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-gold-500 px-3 py-1.5 font-sans text-xs font-semibold text-navy-900"
        >
          + NOTA BARU
        </button>
      </div>

      <div className="px-4 py-4 space-y-3">
        {isLoading && <p className="py-8 text-center font-sans text-body text-charcoal-300">MEMUAT...</p>}
        {!isLoading && listNota.length === 0 && (
          <p className="py-8 text-center font-sans text-body text-charcoal-300">Belum ada nota.</p>
        )}
        {listNota.map((nota) => (
          <NotaCard key={nota.id} nota={nota} />
        ))}
      </div>

      {showForm && (
        <FormNota
          katalog={katalog}
          semuaKode={semuaKode}
          isPending={buatNotaMut.isPending}
          error={buatNotaMut.error}
          onSubmit={(payload) =>
            buatNotaMut.mutate(
              { ...payload, created_by: profile?.id },
              { onSuccess: () => setShowForm(false) }
            )
          }
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

// ─── NotaCard ─────────────────────────────────────────────────────────────────
function NotaCard({ nota }) {
  const [open, setOpen] = useState(false)
  const kodeList = [...new Set(
    (nota.nota_item ?? []).flatMap((i) => (i.nota_item_kode ?? []).map((x) => x.kode?.kode_desain))
  )].filter(Boolean)

  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full px-4 py-3.5 flex items-start justify-between text-left">
        <div>
          <p className="font-sans text-label font-semibold text-navy-900">{formatTanggal(nota.tanggal)}</p>
          <p className="font-sans text-xs text-charcoal-300 mt-0.5">
            {(nota.nota_item ?? []).length} item · {kodeList.join(', ') || 'Tidak ada kode'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-sans text-label font-semibold text-navy-900">{formatRp(nota.total_nilai)}</p>
          <span className="font-sans text-xs text-charcoal-300">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-border divide-y divide-border">
          {(nota.nota_item ?? []).map((item) => {
            const nama = item.katalog_bahan_baku?.nama ?? item.nama_custom ?? '-'
            const kodes = (item.nota_item_kode ?? []).map((x) => x.kode?.kode_desain).filter(Boolean)
            return (
              <div key={item.id} className="px-4 py-2.5">
                <div className="flex justify-between items-start">
                  <p className="font-sans text-label text-navy-900 font-semibold">{nama}</p>
                  <p className="font-sans text-label text-navy-900">{formatRp(item.total_nilai)}</p>
                </div>
                <p className="font-sans text-xs text-charcoal-300">
                  {item.tipe === 'unit'
                    ? `${item.qty} × ${formatRp(item.harga_satuan)}`
                    : 'Usage-based'
                  } · {kodes.length ? kodes.join(', ') : 'Semua kode'}
                </p>
              </div>
            )
          })}
          {nota.catatan && (
            <p className="px-4 py-2 font-sans text-xs text-charcoal-600">{nota.catatan}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── FormNota (bottom sheet) ──────────────────────────────────────────────────
function FormNota({ katalog, semuaKode, onSubmit, onClose, isPending, error }) {
  const today = new Date().toISOString().slice(0, 10)
  const [tanggal, setTanggal] = useState(today)
  const [catatan, setCatatan] = useState('')
  const [items, setItems] = useState([newItem()])

  function newItem() {
    return { katalog_id: '', nama_custom: '', tipe: 'unit', qty: '', harga_satuan: '', total_nilai: '', kode_ids: [] }
  }

  function addItem() { setItems((p) => [...p, newItem()]) }
  function removeItem(i) { setItems((p) => p.filter((_, x) => x !== i)) }
  function updateItem(i, key, val) {
    setItems((p) => p.map((item, x) => x === i ? { ...item, [key]: val } : item))
  }
  function toggleKode(i, kid) {
    setItems((p) => p.map((item, x) => {
      if (x !== i) return item
      const ids = item.kode_ids.includes(kid)
        ? item.kode_ids.filter((k) => k !== kid)
        : [...item.kode_ids, kid]
      return { ...item, kode_ids: ids }
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({
      tanggal,
      catatan: catatan || null,
      items: items.map((item) => ({
        katalog_id: item.katalog_id || null,
        nama_custom: !item.katalog_id ? item.nama_custom : null,
        tipe: item.tipe,
        qty: item.tipe === 'unit' ? Number(item.qty) : null,
        harga_satuan: item.tipe === 'unit' ? Number(item.harga_satuan) : null,
        total_nilai: item.tipe === 'usage'
          ? Number(item.total_nilai)
          : Number(item.qty) * Number(item.harga_satuan),
        kode_ids: item.kode_ids,
      })),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60">
      <div className="w-full rounded-t-2xl bg-surface max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-6 pb-4 shrink-0">
          <p className="font-heading text-heading text-navy-900">NOTA BARU</p>
          <button onClick={onClose} className="font-sans text-label text-charcoal-600">BATAL</button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-4 pb-8 space-y-5 flex-1">
          {/* Tanggal & catatan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal-600 uppercase mb-1">Tanggal</label>
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                className="w-full rounded-xl border border-border px-3 py-2.5 font-sans text-label text-navy-900 outline-none focus:border-gold-500" />
            </div>
            <div>
              <label className="block font-sans text-xs font-semibold text-charcoal-600 uppercase mb-1">Catatan</label>
              <input value={catatan} onChange={(e) => setCatatan(e.target.value.toUpperCase())}
                placeholder="OPSIONAL" className="w-full rounded-xl border border-border px-3 py-2.5 font-sans text-label text-navy-900 uppercase outline-none focus:border-gold-500" />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {items.map((item, i) => (
              <NotaItemInput
                key={i}
                item={item}
                idx={i}
                katalog={katalog}
                semuaKode={semuaKode}
                onUpdate={(key, val) => updateItem(i, key, val)}
                onToggleKode={(kid) => toggleKode(i, kid)}
                onRemove={() => removeItem(i)}
              />
            ))}
            <button type="button" onClick={addItem}
              className="w-full rounded-xl border-2 border-dashed border-gold-500 py-3 font-sans text-label font-semibold text-gold-500">
              + TAMBAH ITEM
            </button>
          </div>

          {/* Total preview */}
          <div className="rounded-xl bg-navy-900 px-4 py-3 flex justify-between">
            <p className="font-sans text-label text-champagne-100">TOTAL</p>
            <p className="font-sans text-label font-semibold text-gold-500">
              {formatRp(items.reduce((s, item) => {
                const v = item.tipe === 'unit'
                  ? (Number(item.qty) || 0) * (Number(item.harga_satuan) || 0)
                  : (Number(item.total_nilai) || 0)
                return s + v
              }, 0))}
            </p>
          </div>

          {error && <p className="rounded-xl bg-danger/10 px-4 py-3 font-sans text-label text-danger">{error.message}</p>}

          <button type="submit" disabled={isPending || items.length === 0}
            className="w-full rounded-xl bg-gold-500 py-4 font-sans text-body font-semibold text-navy-900 disabled:opacity-50">
            {isPending ? 'MENYIMPAN...' : 'SIMPAN NOTA'}
          </button>
        </form>
      </div>
    </div>
  )
}

function NotaItemInput({ item, idx, katalog, semuaKode, onUpdate, onToggleKode, onRemove }) {
  const [showKode, setShowKode] = useState(false)
  const namaKatalog = katalog.find((k) => k.id === item.katalog_id)?.nama ?? ''

  return (
    <div className="rounded-xl bg-champagne-100 border border-border overflow-hidden">
      <div className="bg-champagne-200 px-4 py-2.5 flex items-center justify-between">
        <p className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Item {idx + 1}</p>
        <button type="button" onClick={onRemove} className="font-sans text-xs text-danger">HAPUS</button>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Nama bahan */}
        <div>
          <label className="block font-sans text-xs font-semibold text-charcoal-600 uppercase mb-1">Nama Bahan</label>
          <select
            value={item.katalog_id}
            onChange={(e) => onUpdate('katalog_id', e.target.value)}
            className="w-full rounded-xl border border-border px-3 py-2.5 font-sans text-label text-navy-900 bg-surface outline-none focus:border-gold-500"
          >
            <option value="">— Input manual —</option>
            {katalog.map((k) => (
              <option key={k.id} value={k.id}>{k.nama} ({k.tipe})</option>
            ))}
          </select>
          {!item.katalog_id && (
            <input
              value={item.nama_custom}
              onChange={(e) => onUpdate('nama_custom', e.target.value.toUpperCase())}
              placeholder="NAMA BAHAN BAKU"
              className="mt-2 w-full rounded-xl border border-border px-3 py-2.5 font-sans text-label text-navy-900 uppercase outline-none focus:border-gold-500"
            />
          )}
        </div>

        {/* Tipe */}
        <div className="flex gap-2">
          {TIPE_ITEM.map(({ v, l }) => (
            <button key={v} type="button" onClick={() => onUpdate('tipe', v)}
              className={[
                'flex-1 rounded-xl border py-2 font-sans text-xs font-semibold',
                item.tipe === v ? 'border-gold-500 bg-gold-500/10 text-navy-900' : 'border-border text-charcoal-600',
              ].join(' ')}>
              {l}
            </button>
          ))}
        </div>

        {/* Nilai */}
        {item.tipe === 'unit' ? (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-sans text-xs text-charcoal-600 mb-1">Qty</label>
              <input type="number" min={0} value={item.qty} onChange={(e) => onUpdate('qty', e.target.value)}
                placeholder="0" className="w-full rounded-lg border border-border px-3 py-2 font-sans text-label text-navy-900 outline-none focus:border-gold-500" />
            </div>
            <div>
              <label className="block font-sans text-xs text-charcoal-600 mb-1">Harga/satuan</label>
              <input type="number" min={0} value={item.harga_satuan} onChange={(e) => onUpdate('harga_satuan', e.target.value)}
                placeholder="0" className="w-full rounded-lg border border-border px-3 py-2 font-sans text-label text-navy-900 outline-none focus:border-gold-500" />
            </div>
          </div>
        ) : (
          <div>
            <label className="block font-sans text-xs text-charcoal-600 mb-1">Total Nilai</label>
            <input type="number" min={0} value={item.total_nilai} onChange={(e) => onUpdate('total_nilai', e.target.value)}
              placeholder="0" className="w-full rounded-lg border border-border px-3 py-2 font-sans text-label text-navy-900 outline-none focus:border-gold-500" />
          </div>
        )}

        {/* Alokasi kode */}
        <div>
          <button type="button" onClick={() => setShowKode((v) => !v)}
            className="w-full flex justify-between items-center font-sans text-xs font-semibold text-charcoal-600 uppercase">
            <span>Untuk kode ({item.kode_ids.length} dipilih)</span>
            <span>{showKode ? '▲' : '▼'}</span>
          </button>
          {showKode && (
            <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
              {semuaKode.length === 0
                ? <p className="font-sans text-xs text-charcoal-300">Belum ada kode aktif.</p>
                : semuaKode.map((k) => (
                  <button key={k.id} type="button" onClick={() => onToggleKode(k.id)}
                    className={[
                      'w-full text-left rounded-lg px-3 py-2 font-sans text-xs',
                      item.kode_ids.includes(k.id)
                        ? 'bg-gold-500/20 text-navy-900 font-semibold'
                        : 'bg-surface text-charcoal-600',
                    ].join(' ')}>
                    {k.kode_desain}
                  </button>
                ))
              }
            </div>
          )}
        </div>

        {/* Preview subtotal */}
        {(item.tipe === 'unit' && item.qty && item.harga_satuan) || (item.tipe === 'usage' && item.total_nilai) ? (
          <p className="text-right font-sans text-label font-semibold text-navy-900">
            = {formatRp(item.tipe === 'unit'
              ? Number(item.qty) * Number(item.harga_satuan)
              : Number(item.total_nilai)
            )}
          </p>
        ) : null}
      </div>
    </div>
  )
}
