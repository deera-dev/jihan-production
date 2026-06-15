// S-07 Detail Produksi — ringkasan bahan, surat jalan, dan daftar kode di produksi ini.

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useDetailProduksi,
  useUpdateProduksi,
  useHapusProduksi,
  useUpdateBahan,
  useHapusBahan,
  useTambahWarnaBahan,
  useUpdateWarnaBahan,
  useHapusWarnaBahan,
} from './hooks/useProduksi'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { ProduksiBar } from '../../components/shared/ProduksiBar'
import { useAuthStore, selectIsDeera } from '../../store/useAuthStore'
import { formatTanggal } from '../../utils/formatTanggal'
import { formatRp } from '../../utils/formatRp'

// Mini 4-step stepper berdasarkan kode.status (bukan tracking pcs)
const KODE_STATUS_STEP = {
  sampel_dibuat: 0, review_sampel: 0, estimasi_pemakaian: 0, konfirmasi_pemakaian: 0,
  proses_potong: 1, input_buku_potong: 1, input_nota: 1, review_hpp: 1, input_hpp: 1, hpp_ditolak: 1,
  produksi: 2, siap_kirim: 2,
  selesai: 3,
}
const KODE_STEP_LABELS = ['SAMPEL', 'POTONG', 'PRODUKSI', 'SELESAI']

function KodeStatusMini({ status }) {
  const activeIdx = KODE_STATUS_STEP[status] ?? 0
  const n = KODE_STEP_LABELS.length
  const edgePct = 50 / n
  const activeWidth = activeIdx > 0 ? ((activeIdx / (n - 1)) * (100 - 100 / n)) + '%' : '0%'
  return (
    <div className="relative flex items-start w-full pt-2 pb-0.5">
      <div className="absolute h-px bg-champagne-200" style={{ top: '10px', left: edgePct + '%', right: edgePct + '%' }} />
      <div className="absolute h-px bg-gold-500" style={{ top: '10px', left: edgePct + '%', width: activeWidth }} />
      {KODE_STEP_LABELS.map((label, i) => {
        const done = i < activeIdx
        const active = i === activeIdx
        return (
          <div key={label} className="flex-1 flex flex-col items-center gap-0.5 relative z-10">
            <div className={[
              'h-5 w-5 rounded-full flex items-center justify-center font-sans text-[9px] font-bold',
              done ? 'bg-gold-500 text-navy-900'
                   : active ? 'border-2 border-gold-500 bg-white text-gold-500'
                            : 'bg-champagne-200 text-charcoal-300',
            ].join(' ')}>
              {done ? '\u2713' : i + 1}
            </div>
            <span className={[
              'font-sans text-[7px] whitespace-nowrap',
              active ? 'text-gold-500 font-semibold' : done ? 'text-gold-500/60' : 'text-charcoal-300',
            ].join(' ')}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function ProduksiDetailPage() {
  const { produksiId } = useParams()
  const navigate = useNavigate()
  const isDeera = useAuthStore(selectIsDeera)
  const { data: produksi, isLoading, error } = useDetailProduksi(produksiId)
  const updateMut = useUpdateProduksi()
  const hapusMut = useHapusProduksi()

  const [modalEdit, setModalEdit] = useState(false)
  const [modalHapus, setModalHapus] = useState(false)
  const [editForm, setEditForm] = useState({ kode_bahan: '', catatan: '' })

  function bukaEdit() {
    setEditForm({ kode_bahan: produksi?.kode_bahan ?? '', catatan: produksi?.catatan ?? '' })
    setModalEdit(true)
  }

  async function simpanEdit() {
    await updateMut.mutateAsync({ id: produksiId, perubahan: {
      kode_bahan: editForm.kode_bahan.toUpperCase(),
      catatan: editForm.catatan || null,
    }})
    setModalEdit(false)
  }

  async function konfirmasiHapus() {
    await hapusMut.mutateAsync(produksiId)
    navigate('/produksi', { replace: true })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-champagne-100">
        <p className="font-sans text-body text-charcoal-300">MEMUAT...</p>
      </div>
    )
  }

  if (error || !produksi) {
    return (
      <div className="min-h-screen bg-champagne-100 px-4 py-20 text-center">
        <p className="font-sans text-body text-danger">Data tidak ditemukan.</p>
        <button onClick={() => navigate(-1)} className="mt-4 font-sans text-label text-navy-900 underline">
          Kembali
        </button>
      </div>
    )
  }

  const kode = [...(produksi.kode ?? [])].sort((a, b) => a.urutan - b.urutan)
  const bahanPrimer = (produksi.produksi_bahan ?? []).filter((b) => b.tipe_bahan === 'primer')
  const bahanSekunder = (produksi.produksi_bahan ?? []).filter((b) => b.tipe_bahan === 'sekunder')
  const suratJalan = produksi.surat_jalan ?? []

  return (
    <div className="bg-champagne-100">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center gap-3 bg-navy-900 px-4 py-5">
        <button onClick={() => navigate(-1)} className="font-sans text-body text-champagne-100">&#8592;</button>
        <div className="flex-1">
          <h1 className="font-heading text-heading text-champagne-100">BATCH {produksi.kode_bahan}</h1>
          <p className="font-sans text-xs text-champagne-200">{formatTanggal(produksi.tanggal)}</p>
        </div>
        {isDeera && (
          <div className="flex items-center gap-2">
            <button
              onClick={bukaEdit}
              className="rounded-lg border border-champagne-100/40 px-3 py-1.5 font-sans text-xs font-semibold text-champagne-100"
            >
              EDIT
            </button>
            <button
              onClick={() => navigate(`/kode/baru?produksiId=${produksiId}`)}
              className="rounded-lg bg-gold-500 px-3 py-1.5 font-sans text-xs font-semibold text-navy-900"
            >
              + KODE
            </button>
          </div>
        )}
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Kode-kode */}
        <section>
          <p className="mb-3 font-sans text-label font-semibold text-charcoal-300 uppercase tracking-widest">
            KODE DESAIN ({kode.length})
          </p>
          {kode.length === 0 ? (
            <div className="rounded-xl bg-surface border border-border px-4 py-6 text-center">
              <p className="font-sans text-body text-charcoal-300">Belum ada kode di produksi ini.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {kode.map((k) => (
                <button
                  key={k.id}
                  onClick={() => navigate(`/kode/${k.id}`)}
                  className="w-full rounded-xl bg-surface border border-border px-4 py-4 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-sans text-body font-semibold text-navy-900">{k.kode_desain}</span>
                    <StatusBadge status={k.status} />
                  </div>
                  <div className="mt-3">
                    <KodeStatusMini status={k.status} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Surat Jalan */}
        {suratJalan.length > 0 && (
          <section>
            <p className="mb-3 font-sans text-label font-semibold text-charcoal-300 uppercase tracking-widest">
              SURAT JALAN
            </p>
            <div className="space-y-3">
              {suratJalan.map((sj) => (
                <div key={sj.id} className="rounded-xl bg-surface border border-border px-4 py-3">
                  <p className="font-sans text-label font-semibold text-navy-900">
                    {sj.nomor_surat_jalan || 'No. —'}
                  </p>
                  <p className="mt-0.5 font-sans text-xs text-charcoal-300">
                    Diterima: {formatTanggal(sj.tanggal_terima)}
                    {sj.pengirim ? ` · ${sj.pengirim}` : ''}
                  </p>
                  {sj.catatan && (
                    <p className="mt-1 font-sans text-xs text-charcoal-600">{sj.catatan}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bahan Primer */}
        {bahanPrimer.length > 0 && (
          <section>
            <p className="mb-3 font-sans text-label font-semibold text-charcoal-300 uppercase tracking-widest">
              BAHAN PRIMER (MOTIF)
            </p>
            <div className="space-y-3">
              {bahanPrimer.map((b) => (
                <BahanPrimerCard
                  key={b.id}
                  bahan={b}
                  isDeera={isDeera}
                  produksiId={produksiId}
                />
              ))}
            </div>
          </section>
        )}

        {/* Bahan Sekunder */}
        {bahanSekunder.length > 0 && (
          <section>
            <p className="mb-3 font-sans text-label font-semibold text-charcoal-300 uppercase tracking-widest">
              BAHAN SEKUNDER
            </p>
            <div className="space-y-3">
              {bahanSekunder.map((b) => <BahanCard key={b.id} bahan={b} />)}
            </div>
          </section>
        )}

        {bahanPrimer.length === 0 && bahanSekunder.length === 0 && (
          <div className="rounded-xl bg-surface border border-border px-4 py-5 text-center">
            <p className="font-sans text-body text-charcoal-300">Belum ada data bahan.</p>
          </div>
        )}

        {produksi.catatan && (
          <section>
            <p className="mb-1 font-sans text-label font-semibold text-charcoal-300 uppercase tracking-widest">CATATAN</p>
            <div className="rounded-xl bg-surface border border-border px-4 py-3">
              <p className="font-sans text-body text-navy-900">{produksi.catatan}</p>
            </div>
          </section>
        )}

        {/* Tombol hapus — paling bawah, hanya Deera */}
        {isDeera && (
          <button
            onClick={() => setModalHapus(true)}
            className="w-full rounded-xl border border-danger py-3 font-sans text-label font-semibold text-danger"
          >
            HAPUS PRODUKSI
          </button>
        )}
      </div>

      {/* Modal Edit Produksi */}
      {modalEdit && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/60">
          <div className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4">
            <p className="font-heading text-heading text-navy-900">EDIT PRODUKSI</p>
            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Kode Bahan</label>
              <input
                type="text"
                maxLength={10}
                value={editForm.kode_bahan}
                onChange={(e) => setEditForm((p) => ({ ...p, kode_bahan: e.target.value.toUpperCase() }))}
                className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 uppercase outline-none focus:border-gold-500"
              />
            </div>
            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Catatan (opsional)</label>
              <textarea
                rows={3}
                value={editForm.catatan}
                onChange={(e) => setEditForm((p) => ({ ...p, catatan: e.target.value.toUpperCase() }))}
                className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 uppercase outline-none focus:border-gold-500 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModalEdit(false)}
                className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600">
                BATAL
              </button>
              <button onClick={simpanEdit} disabled={updateMut.isPending}
                className="flex-1 rounded-xl bg-gold-500 py-3.5 font-sans text-body font-semibold text-navy-900 disabled:opacity-50">
                {updateMut.isPending ? 'MENYIMPAN...' : 'SIMPAN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus Produksi */}
      {modalHapus && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/60">
          <div className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4">
            <p className="font-heading text-heading text-navy-900">HAPUS PRODUKSI</p>
            <p className="font-sans text-body text-charcoal-600">
              Hapus produksi <span className="font-semibold text-navy-900">Batch {produksi.kode_bahan}</span>? Semua kode di dalamnya akan ikut terhapus (soft delete).
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModalHapus(false)}
                className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600">
                BATAL
              </button>
              <button onClick={konfirmasiHapus} disabled={hapusMut.isPending}
                className="flex-1 rounded-xl bg-danger py-3.5 font-sans text-body font-semibold text-white disabled:opacity-50">
                {hapusMut.isPending ? 'MENGHAPUS...' : 'HAPUS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Bahan Primer Card (dengan edit & hapus) ─────────────────────────────────

function BahanPrimerCard({ bahan, isDeera, produksiId }) {
  const warna = [...(bahan.produksi_bahan_warna ?? [])].sort((a, b) => a.urutan - b.urutan)
  const totalYard = warna.reduce((s, w) => s + (w.yard_tersedia ?? 0), 0)

  const updateBahanMut = useUpdateBahan(produksiId)
  const hapusBahanMut = useHapusBahan(produksiId)
  const tambahWarnaMut = useTambahWarnaBahan(produksiId)
  const updateWarnaMut = useUpdateWarnaBahan(produksiId)
  const hapusWarnaMut = useHapusWarnaBahan(produksiId)

  const [mode, setMode] = useState('view') // 'view' | 'edit'
  const [modalHapusBahan, setModalHapusBahan] = useState(false)
  const [editBahan, setEditBahan] = useState({ jenis_bahan: '', harga_per_satuan: '' })
  const [editWarna, setEditWarna] = useState([]) // [{ id?, nama_warna, yard_tersedia, _new?, _del? }]
  const [warnaInput, setWarnaInput] = useState({ nama_warna: '', yard_tersedia: '' })

  function bukaEdit() {
    setEditBahan({
      jenis_bahan: bahan.jenis_bahan ?? '',
      harga_per_satuan: bahan.harga_per_satuan ?? '',
    })
    setEditWarna(warna.map((w) => ({ ...w })))
    setMode('edit')
  }

  function tutupEdit() {
    setMode('view')
    setWarnaInput({ nama_warna: '', yard_tersedia: '' })
  }

  function tambahWarnaLokal() {
    if (!warnaInput.nama_warna.trim()) return
    setEditWarna((prev) => [
      ...prev,
      {
        _new: true,
        nama_warna: warnaInput.nama_warna.toUpperCase(),
        yard_tersedia: parseFloat(warnaInput.yard_tersedia) || 0,
      },
    ])
    setWarnaInput({ nama_warna: '', yard_tersedia: '' })
  }

  function hapusWarnaLokal(idx) {
    setEditWarna((prev) =>
      prev[idx]._new
        ? prev.filter((_, i) => i !== idx)
        : prev.map((w, i) => (i === idx ? { ...w, _del: true } : w))
    )
  }

  async function simpanEdit() {
    await updateBahanMut.mutateAsync({
      id: bahan.id,
      perubahan: {
        jenis_bahan: editBahan.jenis_bahan.toUpperCase(),
        harga_per_satuan: parseFloat(editBahan.harga_per_satuan) || 0,
      },
    })
    for (const w of editWarna) {
      if (w._new) {
        await tambahWarnaMut.mutateAsync({
          produksi_bahan_id: bahan.id,
          nama_warna: w.nama_warna,
          yard_tersedia: w.yard_tersedia,
        })
      } else if (w._del) {
        await hapusWarnaMut.mutateAsync(w.id)
      } else {
        const orig = warna.find((x) => x.id === w.id)
        if (orig && (orig.nama_warna !== w.nama_warna || orig.yard_tersedia !== w.yard_tersedia)) {
          await updateWarnaMut.mutateAsync({
            id: w.id,
            perubahan: {
              nama_warna: w.nama_warna.toUpperCase(),
              yard_tersedia: parseFloat(w.yard_tersedia) || 0,
            },
          })
        }
      }
    }
    tutupEdit()
  }

  async function konfirmasiHapusBahan() {
    await hapusBahanMut.mutateAsync(bahan.id)
    setModalHapusBahan(false)
  }

  const isSaving =
    updateBahanMut.isPending ||
    tambahWarnaMut.isPending ||
    updateWarnaMut.isPending ||
    hapusWarnaMut.isPending

  if (mode === 'edit') {
    return (
      <div className="rounded-xl bg-surface border border-gold-500 px-4 py-4 space-y-4">
        <div className="space-y-1">
          <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Jenis Bahan</label>
          <input
            type="text"
            value={editBahan.jenis_bahan}
            onChange={(e) => setEditBahan((p) => ({ ...p, jenis_bahan: e.target.value.toUpperCase() }))}
            className="w-full rounded-xl border border-border px-3 py-2.5 font-sans text-body text-navy-900 uppercase outline-none focus:border-gold-500"
          />
        </div>
        <div className="space-y-1">
          <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Harga / Yard (Rp)</label>
          <input
            type="number"
            value={editBahan.harga_per_satuan}
            onChange={(e) => setEditBahan((p) => ({ ...p, harga_per_satuan: e.target.value }))}
            className="w-full rounded-xl border border-border px-3 py-2.5 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
          />
        </div>
        <div className="space-y-2">
          <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Warna</label>
          {editWarna.filter((w) => !w._del).map((w, idx) => {
            const realIdx = editWarna.indexOf(w)
            return (
              <div key={idx} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={w.nama_warna}
                  onChange={(e) =>
                    setEditWarna((prev) =>
                      prev.map((x, i) => (i === realIdx ? { ...x, nama_warna: e.target.value.toUpperCase() } : x))
                    )
                  }
                  placeholder="NAMA WARNA"
                  className="flex-1 min-w-0 rounded-xl border border-border px-3 py-2 font-sans text-label text-navy-900 uppercase outline-none focus:border-gold-500"
                />
                <input
                  type="number"
                  value={w.yard_tersedia}
                  onChange={(e) =>
                    setEditWarna((prev) =>
                      prev.map((x, i) => (i === realIdx ? { ...x, yard_tersedia: e.target.value } : x))
                    )
                  }
                  placeholder="yd"
                  className="w-14 rounded-xl border border-border px-2 py-2 font-sans text-label text-navy-900 outline-none focus:border-gold-500 text-center"
                />
                <button
                  onClick={() => hapusWarnaLokal(realIdx)}
                  className="shrink-0 w-6 font-sans text-sm font-semibold text-danger leading-none"
                >
                  ×
                </button>
              </div>
            )
          })}
          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              value={warnaInput.nama_warna}
              onChange={(e) => setWarnaInput((p) => ({ ...p, nama_warna: e.target.value.toUpperCase() }))}
              placeholder="WARNA BARU"
              className="flex-1 min-w-0 rounded-xl border border-border bg-champagne-100 px-3 py-2 font-sans text-label text-navy-900 uppercase outline-none focus:border-gold-500"
            />
            <input
              type="number"
              value={warnaInput.yard_tersedia}
              onChange={(e) => setWarnaInput((p) => ({ ...p, yard_tersedia: e.target.value }))}
              placeholder="yd"
              className="w-14 rounded-xl border border-border bg-champagne-100 px-2 py-2 font-sans text-label text-navy-900 outline-none focus:border-gold-500 text-center"
            />
            <button
              onClick={tambahWarnaLokal}
              className="shrink-0 rounded-lg bg-champagne-200 px-2.5 py-2 font-sans text-xs font-semibold text-navy-900"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setModalHapusBahan(true)}
            className="rounded-xl border border-danger px-4 py-2.5 font-sans text-label font-semibold text-danger"
          >
            HAPUS
          </button>
          <button onClick={tutupEdit}
            className="flex-1 rounded-xl border border-border py-2.5 font-sans text-label font-semibold text-charcoal-600">
            BATAL
          </button>
          <button onClick={simpanEdit} disabled={isSaving}
            className="flex-1 rounded-xl bg-gold-500 py-2.5 font-sans text-label font-semibold text-navy-900 disabled:opacity-50">
            {isSaving ? 'MENYIMPAN...' : 'SIMPAN'}
          </button>
        </div>
        {modalHapusBahan && (
          <div className="fixed inset-0 z-[70] flex items-end bg-black/60">
            <div className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4">
              <p className="font-heading text-heading text-navy-900">HAPUS BAHAN</p>
              <p className="font-sans text-body text-charcoal-600">
                Hapus bahan <span className="font-semibold text-navy-900">{bahan.jenis_bahan}</span> beserta semua data warna-nya?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setModalHapusBahan(false)}
                  className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600">
                  BATAL
                </button>
                <button onClick={konfirmasiHapusBahan} disabled={hapusBahanMut.isPending}
                  className="flex-1 rounded-xl bg-danger py-3.5 font-sans text-body font-semibold text-white disabled:opacity-50">
                  {hapusBahanMut.isPending ? 'MENGHAPUS...' : 'HAPUS'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-surface border border-border px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-sans text-body font-semibold text-navy-900">{bahan.jenis_bahan}</p>
          <p className="mt-0.5 font-sans text-label text-charcoal-600">
            {formatRp(bahan.harga_per_satuan)} / yard
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full bg-champagne-200 px-2.5 py-0.5 font-sans text-xs text-charcoal-600">YARD</span>
          {isDeera && (
            <button
              onClick={bukaEdit}
              className="rounded-lg border border-border px-2.5 py-1 font-sans text-xs font-semibold text-charcoal-600"
            >
              EDIT
            </button>
          )}
        </div>
      </div>
      {warna.length > 0 && (
        <div className="mt-3 border-t border-border pt-3 space-y-1.5">
          {warna.map((w) => (
            <div key={w.id} className="flex items-center justify-between gap-2">
              <span className="font-sans text-label text-navy-900">{w.nama_warna}</span>
              <span className="font-sans text-label text-charcoal-600">
                {w.yard_tersedia ? w.yard_tersedia + ' yard' : '—'}
              </span>
            </div>
          ))}
          {warna.length > 1 && (
            <div className="flex items-center justify-between gap-2 border-t border-border pt-1.5">
              <span className="font-sans text-label font-semibold text-charcoal-300">TOTAL</span>
              <span className="font-sans text-label font-semibold text-navy-900">{totalYard} yard</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BahanCard({ bahan }) {
  const warna = [...(bahan.produksi_bahan_warna ?? [])].sort((a, b) => a.urutan - b.urutan)
  const totalYard = warna.reduce((s, w) => s + (w.yard_tersedia ?? 0), 0)
  return (
    <div className="rounded-xl bg-surface border border-border px-4 py-3">
      <div className="flex items-start justify-between gap-2">
        <p className="font-sans text-body font-semibold text-navy-900">{bahan.jenis_bahan}</p>
        <span className="rounded-full bg-champagne-200 px-2.5 py-0.5 font-sans text-xs text-charcoal-600">
          {bahan.satuan?.toUpperCase()}
        </span>
      </div>
      <p className="mt-0.5 font-sans text-label text-charcoal-600">
        {formatRp(bahan.harga_per_satuan)} / {bahan.satuan}
        {bahan.jumlah_dibeli ? ' · ' + bahan.jumlah_dibeli + ' ' + bahan.satuan + ' diterima' : ''}
      </p>
      {warna.length > 0 && (
        <div className="mt-3 border-t border-border pt-3 space-y-1.5">
          {warna.map((w) => (
            <div key={w.id} className="flex items-center justify-between gap-2">
              <span className="font-sans text-label text-navy-900">{w.nama_warna}</span>
              <span className="font-sans text-label text-charcoal-600">
                {w.yard_tersedia ? w.yard_tersedia + ' yard' : '—'}
              </span>
            </div>
          ))}
          {warna.length > 1 && (
            <div className="flex items-center justify-between gap-2 border-t border-border pt-1.5">
              <span className="font-sans text-label font-semibold text-charcoal-300">TOTAL</span>
              <span className="font-sans text-label font-semibold text-navy-900">{totalYard} yard</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
