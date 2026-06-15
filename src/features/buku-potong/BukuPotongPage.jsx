// JP-019 / JP-020 — Input Buku Potong Aktual.
// Form input realisasi potong: yard terpakai per warna (primer) + pcs per warna per ukuran.
// Setelah simpan → status kode ke input_nota.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDetailKode } from '../kode/hooks/useKode'
import { useAuthStore, selectProfile } from '../../store/useAuthStore'
import { useBukuPotongMutations } from './hooks/useBukuPotong'
import { formatRp } from '../../utils/formatRp'

export function BukuPotongPage() {
  const { kodeId } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore(selectProfile)
  const { data: kode, isLoading } = useDetailKode(kodeId)
  const { simpanBukuPotong, isPending } = useBukuPotongMutations(kodeId)

  // State: yard terpakai per warna primer
  const [yardData, setYardData] = useState({})  // { warnaId: yardTerpakai }
  // State: pcs per kode_ukuran_warna
  const [pcsData, setPcsData] = useState({})    // { kodeUkuranWarnaId: jumlahPcs }
  // State: warna baru yang mau ditambahkan (nama warna -> qty per ukuran)
  const [warnaInput, setWarnaInput] = useState([])
  const [errMsg, setErrMsg] = useState('')

  const produksi = kode?.produksi
  const bahanPrimer = produksi?.produksi_bahan?.filter((b) => b.tipe_bahan === 'primer') ?? []
  const ukuranList = [...(kode?.kode_ukuran ?? [])].sort((a, b) => a.urutan - b.urutan)

  // Pre-fill warnaInput dari warna yang sudah ada di primer
  useEffect(() => {
    if (!kode || warnaInput.length > 0) return
    const warnaSet = new Map()
    for (const bahan of bahanPrimer) {
      for (const w of bahan.produksi_bahan_warna ?? []) {
        if (!warnaSet.has(w.nama_warna)) warnaSet.set(w.nama_warna, { id: w.id, yard: w.yard_tersedia ?? 0 })
      }
    }
    setWarnaInput(Array.from(warnaSet.entries()).map(([nama, v]) => ({
      nama_warna: nama,
      bahanWarnaId: v.id,
      yardTerpakai: v.yard ?? '',
      pcsPerUkuran: Object.fromEntries(ukuranList.map((u) => [u.id, ''])),
    })))
  }, [kode])

  function updateYard(idx, val) {
    setWarnaInput((prev) => prev.map((w, i) => i === idx ? { ...w, yardTerpakai: val } : w))
  }

  function updatePcs(idx, ukuranId, val) {
    setWarnaInput((prev) => prev.map((w, i) =>
      i === idx ? { ...w, pcsPerUkuran: { ...w.pcsPerUkuran, [ukuranId]: val } } : w
    ))
  }

  function tambahWarna() {
    setWarnaInput((prev) => [
      ...prev,
      {
        nama_warna: '',
        bahanWarnaId: null,
        yardTerpakai: '',
        pcsPerUkuran: Object.fromEntries(ukuranList.map((u) => [u.id, ''])),
      },
    ])
  }

  function hapusWarna(idx) {
    setWarnaInput((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrMsg('')

    // Validasi minimal
    for (const w of warnaInput) {
      if (!w.nama_warna?.trim()) { setErrMsg('Nama warna tidak boleh kosong.'); return }
      if (!w.yardTerpakai || Number(w.yardTerpakai) <= 0) {
        setErrMsg(`Yard terpakai untuk warna ${w.nama_warna} harus > 0.`); return
      }
      const totalPcs = Object.values(w.pcsPerUkuran).reduce((s, v) => s + (Number(v) || 0), 0)
      if (totalPcs === 0) {
        setErrMsg(`Total pcs untuk warna ${w.nama_warna} harus > 0.`); return
      }
    }

    try {
      await simpanBukuPotong({
        kodeId,
        warnaData: warnaInput.map((w) => ({
          nama_warna: w.nama_warna.toUpperCase(),
          bahanWarnaId: w.bahanWarnaId,
          yardTerpakai: Number(w.yardTerpakai),
          pcsPerUkuran: Object.fromEntries(
            Object.entries(w.pcsPerUkuran).map(([uid, v]) => [uid, Number(v) || 0])
          ),
        })),
      })
      navigate(`/kode/${kodeId}`)
    } catch (err) {
      setErrMsg(err.message ?? 'Gagal menyimpan. Coba lagi.')
    }
  }

  if (isLoading) return <div className="min-h-screen bg-champagne-100 flex items-center justify-center"><p className="font-sans text-body text-charcoal-300">MEMUAT...</p></div>

  const totalPcsPerWarna = warnaInput.map((w) =>
    Object.values(w.pcsPerUkuran).reduce((s, v) => s + (Number(v) || 0), 0)
  )

  return (
    <div className="min-h-screen bg-champagne-100">
      {/* Header */}
      <div className="bg-navy-900 px-4 py-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="font-sans text-sm text-champagne-100 opacity-70">&#8592; KEMBALI</button>
          <div>
            <h1 className="font-heading text-heading text-champagne-100">BUKU POTONG</h1>
            <p className="font-sans text-label text-champagne-100 opacity-60">{kode?.kode_desain}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-6">
        {/* Ukuran header */}
        <div className="rounded-xl bg-surface border border-border px-4 py-3">
          <p className="font-sans text-label font-semibold text-charcoal-600 uppercase mb-1">Ukuran dalam kode ini</p>
          <div className="flex flex-wrap gap-2">
            {ukuranList.map((u) => (
              <span key={u.id} className="rounded-full bg-navy-900 px-3 py-1 font-sans text-xs font-semibold text-champagne-100">
                {u.ukuran}
              </span>
            ))}
          </div>
        </div>

        {/* Input per warna */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-sans text-label font-semibold text-charcoal-600 uppercase">Data per Warna</p>
            <button type="button" onClick={tambahWarna}
              className="rounded-lg border border-gold-500 px-3 py-1.5 font-sans text-xs font-semibold text-gold-500">
              + WARNA
            </button>
          </div>

          {warnaInput.map((w, idx) => (
            <WarnaInputCard
              key={idx}
              warna={w}
              ukuranList={ukuranList}
              totalPcs={totalPcsPerWarna[idx]}
              onUpdateNama={(v) => setWarnaInput((prev) => prev.map((x, i) => i === idx ? { ...x, nama_warna: v.toUpperCase() } : x))}
              onUpdateYard={(v) => updateYard(idx, v)}
              onUpdatePcs={(ukuranId, v) => updatePcs(idx, ukuranId, v)}
              onHapus={() => hapusWarna(idx)}
            />
          ))}
        </div>

        {/* Summary pcs total */}
        {warnaInput.length > 0 && (
          <div className="rounded-xl bg-navy-900 px-4 py-3">
            <p className="font-sans text-label font-semibold text-champagne-100 uppercase mb-2">Ringkasan</p>
            <div className="space-y-1">
              {warnaInput.map((w, i) => (
                <div key={i} className="flex justify-between font-sans text-label text-champagne-100">
                  <span>{w.nama_warna || `Warna ${i + 1}`}</span>
                  <span>{totalPcsPerWarna[i]} pcs | {w.yardTerpakai || 0} yard</span>
                </div>
              ))}
              <div className="border-t border-white/20 pt-2 mt-2 flex justify-between font-sans text-body font-semibold text-gold-500">
                <span>TOTAL PCS</span>
                <span>{totalPcsPerWarna.reduce((s, v) => s + v, 0)}</span>
              </div>
            </div>
          </div>
        )}

        {errMsg && (
          <p className="rounded-xl bg-danger/10 px-4 py-3 font-sans text-label text-danger">{errMsg}</p>
        )}

        <button type="submit" disabled={isPending || warnaInput.length === 0}
          className="w-full rounded-xl bg-gold-500 py-4 font-sans text-body font-semibold text-navy-900 disabled:opacity-50">
          {isPending ? 'MENYIMPAN...' : 'SIMPAN & LANJUTKAN'}
        </button>
      </form>
    </div>
  )
}

function WarnaInputCard({ warna, ukuranList, totalPcs, onUpdateNama, onUpdateYard, onUpdatePcs, onHapus }) {
  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      <div className="bg-champagne-200 px-4 py-3 flex items-center gap-2">
        <input
          value={warna.nama_warna}
          onChange={(e) => onUpdateNama(e.target.value)}
          placeholder="NAMA WARNA"
          className="flex-1 bg-transparent font-sans text-label font-semibold text-navy-900 uppercase outline-none placeholder:text-charcoal-300"
        />
        <button type="button" onClick={onHapus} className="font-sans text-xs text-danger">HAPUS</button>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Yard terpakai */}
        <div className="flex items-center gap-3">
          <label className="font-sans text-label text-charcoal-600 w-28">Yard terpakai</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={warna.yardTerpakai}
            onChange={(e) => onUpdateYard(e.target.value)}
            className="flex-1 rounded-lg border border-border px-3 py-2 font-sans text-label text-navy-900 outline-none focus:border-gold-500"
          />
          <span className="font-sans text-label text-charcoal-300">yard</span>
        </div>

        {/* Pcs per ukuran */}
        <div>
          <p className="font-sans text-xs text-charcoal-300 uppercase mb-2">Pcs per ukuran</p>
          <div className="grid grid-cols-2 gap-2">
            {ukuranList.map((u) => (
              <div key={u.id} className="flex items-center gap-2">
                <label className="font-sans text-xs text-charcoal-600 w-20">{u.ukuran}</label>
                <input
                  type="number"
                  min={0}
                  value={warna.pcsPerUkuran[u.id] ?? ''}
                  onChange={(e) => onUpdatePcs(u.id, e.target.value)}
                  className="flex-1 rounded-lg border border-border px-2 py-1.5 font-sans text-label text-navy-900 outline-none focus:border-gold-500 text-center"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
          <p className="mt-2 font-sans text-xs text-charcoal-300 text-right">Total: {totalPcs} pcs</p>
        </div>
      </div>
    </div>
  )
}
