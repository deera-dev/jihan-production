// JP-019 / JP-020 — Input Buku Potong Aktual (level produksi).
// Yard terpakai per warna = 1 nilai untuk semua kode (1 gelaran).
// PCS per ukuran dicatat per kode.

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProduksiBukuPotong, useBukuPotongMutations } from './hooks/useBukuPotong'

export function BukuPotongPage() {
  const { produksiId } = useParams()
  const navigate = useNavigate()
  const { data: produksi, isLoading } = useProduksiBukuPotong(produksiId)
  const { simpanBukuPotong, isPending } = useBukuPotongMutations(produksiId)

  // warnaRows: [{ bahanWarnaId, nama_warna, yardTerpakai }]
  // pcsGrid: { `${kodeUkuranId}__${namaWarna}` : string }
  const [warnaRows, setWarnaRows] = useState([])
  const [pcsGrid, setPcsGrid] = useState({})
  const [errMsg, setErrMsg] = useState('')

  const bahanPrimer = produksi?.produksi_bahan?.filter((b) => b.tipe_bahan === 'primer') ?? []
  const kodeList = [...(produksi?.kode ?? [])].sort((a, b) =>
    a.kode_desain.localeCompare(b.kode_desain)
  )

  // Inisialisasi warnaRows dari warna unik di bahan primer
  useEffect(() => {
    if (!produksi || warnaRows.length > 0) return
    const seen = new Map()
    for (const b of bahanPrimer) {
      for (const w of b.produksi_bahan_warna ?? []) {
        if (!seen.has(w.nama_warna)) {
          seen.set(w.nama_warna, {
            bahanWarnaId: w.id,
            nama_warna: w.nama_warna,
            yardTerpakai: w.yard_terpakai ?? w.yard_tersedia ?? '',
          })
        }
      }
    }
    setWarnaRows(Array.from(seen.values()))
  }, [produksi])

  function setYard(idx, val) {
    setWarnaRows((prev) => prev.map((r, i) => i === idx ? { ...r, yardTerpakai: val } : r))
  }

  function setPcs(kodeUkuranId, namaWarna, val) {
    setPcsGrid((prev) => ({ ...prev, [`${kodeUkuranId}__${namaWarna}`]: val }))
  }

  function tambahWarna() {
    setWarnaRows((prev) => [...prev, { bahanWarnaId: null, nama_warna: '', yardTerpakai: '' }])
  }

  function hapusWarna(idx) {
    setWarnaRows((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrMsg('')

    for (const w of warnaRows) {
      if (!w.nama_warna?.trim()) { setErrMsg('Nama warna tidak boleh kosong.'); return }
      if (!w.yardTerpakai || Number(w.yardTerpakai) <= 0) {
        setErrMsg(`Yard terpakai untuk warna ${w.nama_warna} harus > 0.`); return
      }
    }

    // Bangun pcsPerKode: per warna, daftar { kodeUkuranId, jumlah_pcs }
    const warnaData = warnaRows.map((w) => {
      const pcsPerKode = []
      for (const kode of kodeList) {
        for (const uk of kode.kode_ukuran ?? []) {
          pcsPerKode.push({
            kodeUkuranId: uk.id,
            jumlah_pcs: Number(pcsGrid[`${uk.id}__${w.nama_warna}`] || 0),
          })
        }
      }
      return {
        bahanWarnaId: w.bahanWarnaId,
        nama_warna: w.nama_warna.toUpperCase(),
        yardTerpakai: Number(w.yardTerpakai),
        pcsPerKode,
      }
    })

    const kodeIds = kodeList.map((k) => k.id)

    try {
      await simpanBukuPotong({ produksiId, warnaData, kodeIds })
      navigate(-1)
    } catch (err) {
      setErrMsg(err.message ?? 'Gagal menyimpan. Coba lagi.')
    }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-champagne-100 flex items-center justify-center">
      <p className="font-sans text-body text-charcoal-300">MEMUAT...</p>
    </div>
  )

  if (!produksi) return (
    <div className="min-h-screen bg-champagne-100 flex items-center justify-center">
      <p className="font-sans text-body text-danger">Produksi tidak ditemukan.</p>
    </div>
  )

  // Ringkasan total pcs per warna (semua kode)
  const totalPerWarna = warnaRows.map((w) => {
    let t = 0
    for (const kode of kodeList)
      for (const uk of kode.kode_ukuran ?? [])
        t += Number(pcsGrid[`${uk.id}__${w.nama_warna}`] || 0)
    return t
  })

  return (
    <div className="bg-champagne-100 min-h-screen pb-10">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-navy-900 px-4 py-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="font-sans text-sm text-champagne-100 opacity-70">
            &#8592; KEMBALI
          </button>
          <div>
            <h1 className="font-heading text-heading text-champagne-100">BUKU POTONG</h1>
            <p className="font-sans text-label text-champagne-100 opacity-60">
              {kodeList.map((k) => k.kode_desain).join(' · ')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">

        {/* Kode yang terlibat */}
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-charcoal-600">
            KODE DALAM PRODUKSI INI
          </p>
          <div className="space-y-1">
            {kodeList.map((k) => (
              <div key={k.id} className="flex items-center gap-2 flex-wrap">
                <span className="font-sans text-label font-semibold text-navy-900">{k.kode_desain}</span>
                <span className="font-sans text-xs text-charcoal-300">
                  {(k.kode_ukuran ?? []).map((u) => u.ukuran).join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Header kolom kode (untuk referensi grid PCS) */}
        {kodeList.length > 1 && (
          <div className="rounded-xl bg-navy-900/5 border border-border px-4 py-2.5 flex items-center gap-2 overflow-x-auto">
            <span className="font-sans text-xs text-charcoal-300 shrink-0 w-20">WARNA \ KODE</span>
            {kodeList.map((k) => (
              <div key={k.id} className="shrink-0 text-center" style={{ minWidth: '80px' }}>
                <p className="font-sans text-xs font-semibold text-navy-900">{k.kode_desain}</p>
                <p className="font-sans text-[10px] text-charcoal-300">
                  {(k.kode_ukuran ?? []).map((u) => u.ukuran).join('/')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Data per warna */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-sans text-label font-semibold text-charcoal-600 uppercase">DATA PER WARNA</p>
            <button type="button" onClick={tambahWarna}
              className="rounded-lg border border-gold-500 px-3 py-1.5 font-sans text-xs font-semibold text-gold-500">
              + WARNA
            </button>
          </div>

          {warnaRows.map((w, idx) => (
            <WarnaCard
              key={idx}
              warna={w}
              kodeList={kodeList}
              pcsGrid={pcsGrid}
              totalPcs={totalPerWarna[idx]}
              onUpdateNama={(v) => setWarnaRows((p) => p.map((r, i) => i === idx ? { ...r, nama_warna: v.toUpperCase() } : r))}
              onUpdateYard={(v) => setYard(idx, v)}
              onUpdatePcs={setPcs}
              onHapus={() => hapusWarna(idx)}
            />
          ))}
        </div>

        {/* Ringkasan */}
        {warnaRows.length > 0 && (
          <div className="rounded-xl bg-navy-900 px-4 py-3 space-y-1">
            <p className="font-sans text-label font-semibold text-champagne-100 uppercase mb-2">RINGKASAN</p>
            {warnaRows.map((w, i) => (
              <div key={i} className="flex justify-between font-sans text-label text-champagne-100">
                <span>{w.nama_warna || `Warna ${i + 1}`}</span>
                <span>{totalPerWarna[i]} pcs · {w.yardTerpakai || 0} yard</span>
              </div>
            ))}
            <div className="border-t border-white/20 pt-2 mt-2 flex justify-between font-sans text-body font-semibold text-gold-500">
              <span>TOTAL PCS</span>
              <span>{totalPerWarna.reduce((s, v) => s + v, 0)}</span>
            </div>
          </div>
        )}

        {errMsg && (
          <p className="rounded-xl bg-danger/10 px-4 py-3 font-sans text-label text-danger">{errMsg}</p>
        )}

        <button type="submit" disabled={isPending || warnaRows.length === 0}
          className="w-full rounded-xl bg-gold-500 py-4 font-sans text-body font-semibold text-navy-900 disabled:opacity-50">
          {isPending ? 'MENYIMPAN...' : 'SIMPAN & LANJUTKAN'}
        </button>
      </form>
    </div>
  )
}

function WarnaCard({ warna, kodeList, pcsGrid, totalPcs, onUpdateNama, onUpdateYard, onUpdatePcs, onHapus }) {
  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      {/* Header warna */}
      <div className="bg-champagne-200 px-4 py-3 flex items-center gap-2">
        <input
          value={warna.nama_warna}
          onChange={(e) => onUpdateNama(e.target.value)}
          placeholder="NAMA WARNA"
          className="flex-1 min-w-0 bg-transparent font-sans text-label font-semibold text-navy-900 uppercase outline-none placeholder:text-charcoal-300"
        />
        <button type="button" onClick={onHapus}
          className="shrink-0 font-sans text-xs text-danger">HAPUS</button>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Yard terpakai — 1 nilai untuk semua kode */}
        <div className="flex items-center gap-3">
          <label className="font-sans text-label text-charcoal-600 shrink-0">Yard terpakai</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={warna.yardTerpakai}
            onChange={(e) => onUpdateYard(e.target.value)}
            className="flex-1 min-w-0 rounded-lg border border-border px-3 py-2 font-sans text-label text-navy-900 outline-none focus:border-gold-500"
            placeholder="0"
          />
          <span className="font-sans text-label text-charcoal-300 shrink-0">yard</span>
        </div>

        {/* PCS per kode per ukuran */}
        <div>
          <p className="font-sans text-xs text-charcoal-300 uppercase mb-2">PCS PER KODE</p>
          <div className="space-y-3">
            {kodeList.map((kode) => {
              const ukuranList = [...(kode.kode_ukuran ?? [])].sort((a, b) => a.urutan - b.urutan)
              return (
                <div key={kode.id}>
                  <p className="font-sans text-xs font-semibold text-navy-900 mb-1.5">{kode.kode_desain}</p>
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(ukuranList.length, 2)}, 1fr)` }}>
                    {ukuranList.map((uk) => (
                      <div key={uk.id} className="flex items-center gap-2">
                        <label className="font-sans text-xs text-charcoal-600 w-24 shrink-0">{uk.ukuran}</label>
                        <input
                          type="number"
                          min={0}
                          value={pcsGrid[`${uk.id}__${warna.nama_warna}`] ?? ''}
                          onChange={(e) => onUpdatePcs(uk.id, warna.nama_warna, e.target.value)}
                          className="flex-1 min-w-0 rounded-lg border border-border px-2 py-1.5 font-sans text-label text-navy-900 outline-none focus:border-gold-500 text-center"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-2 font-sans text-xs text-charcoal-300 text-right">Total: {totalPcs} pcs</p>
        </div>
      </div>
    </div>
  )
}
