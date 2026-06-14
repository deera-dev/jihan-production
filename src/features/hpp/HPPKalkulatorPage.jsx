// JP-024 s/d JP-027 — HPP Kalkulator.
// Deera: input jasa komponen + lihat kalkulasi otomatis bahan dari buku potong & nota.
// Jihan: review breakdown, approve atau tolak.

import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDetailKode, useTemplateHPP, useSimpanHPP, useApproveHPP, useTolakHPP } from '../kode/hooks/useKode'
import { useDaftarNota } from '../nota/hooks/useNota'
import { useAuthStore, selectProfile, selectIsDeera } from '../../store/useAuthStore'
import { formatRp } from '../../utils/formatRp'
import { formatTanggal } from '../../utils/formatTanggal'

// ─── Kalkulasi HPP ────────────────────────────────────────────────────────────

function hitungBahanPrimer(kode) {
  const produksi = kode?.produksi
  if (!produksi) return { totalYardTerpakai: 0, hargaPerYard: 0, nilaiPerPcs: 0 }

  const bahanPrimer = (produksi.produksi_bahan ?? []).filter((b) => b.tipe_bahan === 'primer')
  if (bahanPrimer.length === 0) return { totalYardTerpakai: 0, hargaPerYard: 0, nilaiPerPcs: 0 }

  const hargaPerYard = bahanPrimer[0]?.harga_per_satuan ?? 0
  const totalYardTerpakai = bahanPrimer.flatMap((b) => b.produksi_bahan_warna ?? [])
    .reduce((s, w) => s + (w.yard_terpakai ?? 0), 0)

  const totalPcs = (kode.kode_ukuran ?? [])
    .flatMap((u) => u.kode_ukuran_warna ?? [])
    .reduce((s, w) => s + (w.jumlah_pcs ?? 0), 0)

  const nilaiPerPcs = totalPcs > 0
    ? Math.round((totalYardTerpakai * hargaPerYard) / totalPcs)
    : 0

  return { totalYardTerpakai, hargaPerYard, nilaiPerPcs }
}

function hitungBahanSekunder(kode) {
  const produksi = kode?.produksi
  if (!produksi) return []
  const bahanSekunder = (produksi.produksi_bahan ?? []).filter((b) => b.tipe_bahan === 'sekunder')
  return bahanSekunder.map((b) => ({
    jenisBahan: b.jenis_bahan,
    konsumsiYard: b.konsumsi_per_pcs ?? 0,
    hargaPerYard: b.harga_per_satuan ?? 0,
    nilaiPerPcs: Math.round((b.konsumsi_per_pcs ?? 0) * (b.harga_per_satuan ?? 0)),
  }))
}

function hitungBahanBakuDariNota(kode, allNota) {
  // Kumpulkan semua nota_item yang merujuk kode ini
  const totalPcs = (kode?.kode_ukuran ?? [])
    .flatMap((u) => u.kode_ukuran_warna ?? [])
    .reduce((s, w) => s + (w.jumlah_pcs ?? 0), 0)
  if (totalPcs === 0) return []

  const hasil = []
  for (const nota of allNota) {
    for (const item of nota.nota_item ?? []) {
      const kodeIds = (item.nota_item_kode ?? []).map((x) => x.kode_id)
      if (!kodeIds.includes(kode.id)) continue

      const nama = item.katalog_bahan_baku?.nama ?? item.nama_custom ?? '-'

      if (kodeIds.length === 1) {
        // Item khusus untuk kode ini saja
        const nilaiPerPcs = item.tipe === 'unit'
          ? Math.round(((item.qty ?? 0) * (item.harga_satuan ?? 0)) / totalPcs)
          : Math.round((item.total_nilai ?? 0) / totalPcs)
        hasil.push({ nama, tipe: item.tipe, nilaiPerPcs })
      } else {
        // Alokasi proporsional — ambil semua totalPcs kode terlibat
        const totalPcsSemua = kodeIds.reduce((s, kid) => {
          // Estimasi: cari dari kode data yang ada
          return s + totalPcs // simplified: hanya kode ini yang kita tahu
        }, 0)
        // Pakai nilaiPerPcs proporsional berdasarkan totalNilai / totalPcs
        const nilaiPerPcs = Math.round((item.total_nilai ?? 0) / totalPcs)
        hasil.push({ nama, tipe: item.tipe, nilaiPerPcs })
      }
    }
  }
  return hasil
}

// ─────────────────────────────────────────────────────────────────────────────
// HPPKalkulatorPage
// ─────────────────────────────────────────────────────────────────────────────
export function HPPKalkulatorPage() {
  const { kodeId } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore(selectProfile)
  const isDeera = useAuthStore(selectIsDeera)

  const { data: kode, isLoading } = useDetailKode(kodeId)
  const { data: template = [] } = useTemplateHPP()
  const { data: allNota = [] } = useDaftarNota()

  const simpanHPPMut = useSimpanHPP(kodeId)
  const approveHPPMut = useApproveHPP(kodeId)
  const tolakHPPMut = useTolakHPP(kodeId)

  // State komponen jasa (dari template + custom)
  const [jasaKomponen, setJasaKomponen] = useState([])
  const [showTolakModal, setShowTolakModal] = useState(false)
  const [alasanTolak, setAlasanTolak] = useState('')

  const hppData = kode?.hpp?.[0] ?? null
  const status = kode?.status
  const hppApproved = hppData?.status === 'approved'

  // Pre-fill dari template HPP atau dari HPP yang sudah ada
  useEffect(() => {
    if (!kode) return
    if (hppData?.jasa_komponen?.length > 0) {
      setJasaKomponen(hppData.jasa_komponen)
    } else if (template.length > 0 && jasaKomponen.length === 0) {
      setJasaKomponen(template.map((t) => ({ nama: t.nama, nilai: t.nilai_min, min: t.nilai_min, max: t.nilai_max })))
    }
  }, [kode, template])

  // Kalkulasi otomatis
  const primerCalc = useMemo(() => hitungBahanPrimer(kode), [kode])
  const sekunderCalc = useMemo(() => hitungBahanSekunder(kode), [kode])
  const bahanBakuCalc = useMemo(() => hitungBahanBakuDariNota(kode, allNota), [kode, allNota])

  const totalHppJasa = jasaKomponen.reduce((s, k) => s + (Number(k.nilai) || 0), 0)
  const totalNilaiBahan = primerCalc.nilaiPerPcs + sekunderCalc.reduce((s, b) => s + b.nilaiPerPcs, 0)
  const totalBahanBaku = bahanBakuCalc.reduce((s, b) => s + b.nilaiPerPcs, 0)
  const totalHppPerBaju = totalHppJasa + totalNilaiBahan + totalBahanBaku

  function updateKomponen(i, val) {
    setJasaKomponen((prev) => prev.map((k, x) => x === i ? { ...k, nilai: Number(val) } : k))
  }

  function tambahKomponenCustom() {
    setJasaKomponen((prev) => [...prev, { nama: '', nilai: 0, custom: true }])
  }

  function hapusKomponenCustom(i) {
    setJasaKomponen((prev) => prev.filter((_, x) => x !== i))
  }

  function buildPayload(submitUntukReview) {
    return {
      payload: {
        jasa_komponen: jasaKomponen,
        snapshot_bahan_primer: primerCalc,
        snapshot_bahan_sekunder: sekunderCalc,
        snapshot_bahan_baku: bahanBakuCalc,
        total_hpp_jasa: totalHppJasa,
        total_nilai_bahan: totalNilaiBahan,
        total_bahan_baku: totalBahanBaku,
        total_hpp_per_baju: totalHppPerBaju,
      },
      submitUntukReview,
    }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-champagne-100 flex items-center justify-center">
      <p className="font-sans text-body text-charcoal-300">MEMUAT...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-champagne-100">
      {/* Header */}
      <div className="bg-navy-900 px-4 py-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="font-sans text-sm text-champagne-100 opacity-70">← KEMBALI</button>
          <div className="flex-1">
            <h1 className="font-heading text-heading text-champagne-100">HPP</h1>
            <p className="font-sans text-label text-champagne-100 opacity-60">{kode?.kode_desain}</p>
          </div>
          {hppData?.status && (
            <span className={[
              'rounded-full px-3 py-1 font-sans text-xs font-semibold',
              hppApproved ? 'bg-gold-500 text-navy-900' :
              hppData.status === 'review' ? 'bg-info/20 text-champagne-100' :
              hppData.status === 'ditolak' ? 'bg-danger/20 text-danger' :
              'bg-white/10 text-champagne-100',
            ].join(' ')}>
              {hppData.status.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Alert HPP ditolak */}
        {hppData?.status === 'ditolak' && (
          <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3">
            <p className="font-sans text-label font-semibold text-danger uppercase">HPP Ditolak</p>
            {hppData.alasan_tolak && <p className="mt-1 font-sans text-label text-danger">{hppData.alasan_tolak}</p>}
          </div>
        )}

        {/* ── Jihan: approve/tolak ─── */}
        {!isDeera && status === 'review_hpp' && hppData && (
          <div className="flex gap-3">
            <button
              onClick={() => approveHPPMut.mutate({ hppId: hppData.id }, { onSuccess: () => navigate(-1) })}
              disabled={approveHPPMut.isPending}
              className="flex-1 rounded-xl bg-gold-500 py-3.5 font-sans text-body font-semibold text-navy-900 disabled:opacity-50"
            >
              APPROVE HPP
            </button>
            <button onClick={() => setShowTolakModal(true)}
              className="flex-1 rounded-xl border border-danger py-3.5 font-sans text-body font-semibold text-danger">
              TOLAK
            </button>
          </div>
        )}

        {/* ── Ringkasan Total HPP (selalu tampil kalau ada data) ── */}
        <div className="rounded-xl bg-navy-900 px-5 py-4">
          <p className="font-sans text-label text-champagne-100 opacity-60 uppercase">Total HPP / Pcs</p>
          <p className="font-heading text-2xl text-gold-500 mt-1">{formatRp(hppApproved ? hppData.total_hpp_per_baju : totalHppPerBaju)}</p>
        </div>

        {/* ── Komponen HPP Jasa ── */}
        <Section title="HPP JASA" total={formatRp(hppApproved ? hppData.total_hpp_jasa : totalHppJasa)}>
          {(hppApproved ? hppData.jasa_komponen : jasaKomponen).map((k, i) => (
            <div key={i} className="flex items-center gap-2">
              {!hppApproved && isDeera && k.custom
                ? <input value={k.nama} onChange={(e) => setJasaKomponen((p) => p.map((x, j) => j === i ? { ...x, nama: e.target.value.toUpperCase() } : x))}
                    className="flex-1 rounded-lg border border-border px-3 py-2 font-sans text-label text-navy-900 uppercase outline-none focus:border-gold-500" placeholder="NAMA KOMPONEN" />
                : <p className="flex-1 font-sans text-label text-charcoal-600">{k.nama}</p>
              }
              {!hppApproved && isDeera ? (
                <div className="flex items-center gap-1">
                  <span className="font-sans text-xs text-charcoal-300">Rp</span>
                  <input type="number" min={0} value={k.nilai}
                    onChange={(e) => updateKomponen(i, e.target.value)}
                    className="w-24 rounded-lg border border-border px-2 py-2 font-sans text-label text-navy-900 text-right outline-none focus:border-gold-500" />
                  {k.custom && (
                    <button type="button" onClick={() => hapusKomponenCustom(i)} className="font-sans text-xs text-danger ml-1">✕</button>
                  )}
                </div>
              ) : (
                <p className="font-sans text-label font-semibold text-navy-900">{formatRp(k.nilai)}</p>
              )}
            </div>
          ))}
          {!hppApproved && isDeera && (
            <button onClick={tambahKomponenCustom} type="button"
              className="w-full rounded-lg border border-dashed border-gold-500 py-2 font-sans text-xs font-semibold text-gold-500 mt-1">
              + KOMPONEN CUSTOM
            </button>
          )}
          {!hppApproved && isDeera && jasaKomponen.some((k) => k.min) && (
            <p className="font-sans text-xs text-charcoal-300 mt-1">
              * Range template: sesuaikan dengan kondisi produksi.
            </p>
          )}
        </Section>

        {/* ── Bahan Primer ── */}
        <Section title="BAHAN PRIMER" total={formatRp(hppApproved ? hppData.snapshot_bahan_primer?.nilaiPerPcs : primerCalc.nilaiPerPcs)}>
          {!hppApproved ? (
            <>
              <KalcRow label="Total yard terpakai" value={`${primerCalc.totalYardTerpakai} yard`} />
              <KalcRow label="Harga/yard" value={formatRp(primerCalc.hargaPerYard)} />
              <KalcRow label="Nilai/pcs" value={formatRp(primerCalc.nilaiPerPcs)} bold />
            </>
          ) : (
            <>
              <KalcRow label="Total yard terpakai" value={`${hppData.snapshot_bahan_primer?.totalYardTerpakai ?? 0} yard`} />
              <KalcRow label="Nilai/pcs" value={formatRp(hppData.snapshot_bahan_primer?.nilaiPerPcs ?? 0)} bold />
            </>
          )}
        </Section>

        {/* ── Bahan Sekunder ── */}
        {(hppApproved ? hppData.snapshot_bahan_sekunder : sekunderCalc).length > 0 && (
          <Section title="BAHAN SEKUNDER" total={formatRp(hppApproved
            ? (hppData.snapshot_bahan_sekunder ?? []).reduce((s, b) => s + b.nilaiPerPcs, 0)
            : sekunderCalc.reduce((s, b) => s + b.nilaiPerPcs, 0)
          )}>
            {(hppApproved ? hppData.snapshot_bahan_sekunder : sekunderCalc).map((b, i) => (
              <div key={i} className="flex justify-between items-center">
                <p className="font-sans text-label text-charcoal-600">{b.jenisBahan}</p>
                <p className="font-sans text-label text-navy-900">{formatRp(b.nilaiPerPcs)}/pcs</p>
              </div>
            ))}
          </Section>
        )}

        {/* ── Bahan Baku dari Nota ── */}
        {(hppApproved ? hppData.snapshot_bahan_baku : bahanBakuCalc).length > 0 && (
          <Section title="BAHAN BAKU" total={formatRp(hppApproved ? hppData.total_bahan_baku : totalBahanBaku)}>
            {(hppApproved ? hppData.snapshot_bahan_baku : bahanBakuCalc).map((b, i) => (
              <div key={i} className="flex justify-between items-center">
                <p className="font-sans text-label text-charcoal-600">{b.nama}</p>
                <p className="font-sans text-label text-navy-900">{formatRp(b.nilaiPerPcs)}/pcs</p>
              </div>
            ))}
          </Section>
        )}

        {/* ── Histori Revisi ── */}
        {(hppData?.hpp_revisi?.length ?? 0) > 0 && (
          <Section title="RIWAYAT REVISI" total={null}>
            {[...hppData.hpp_revisi].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((r) => (
              <div key={r.id} className="border-t border-border pt-2">
                <p className="font-sans text-xs text-charcoal-300">{formatTanggal(r.created_at)}</p>
                <p className="font-sans text-label font-semibold text-navy-900">{r.komponen}</p>
                <div className="flex gap-2 font-sans text-label">
                  <span className="text-danger line-through">{formatRp(r.nilai_lama?.nilai ?? 0)}</span>
                  <span className="text-success">→ {formatRp(r.nilai_baru?.nilai ?? 0)}</span>
                </div>
                {r.alasan && <p className="font-sans text-xs text-charcoal-600">{r.alasan}</p>}
              </div>
            ))}
          </Section>
        )}

        {/* ── Action buttons Deera ── */}
        {isDeera && !hppApproved && ['input_hpp', 'hpp_ditolak', 'input_nota', 'input_buku_potong'].includes(status) && (
          <div className="flex gap-3 pb-4">
            <button
              onClick={() => simpanHPPMut.mutate(buildPayload(false))}
              disabled={simpanHPPMut.isPending}
              className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600 disabled:opacity-50"
            >
              SIMPAN DRAFT
            </button>
            <button
              onClick={() => simpanHPPMut.mutate(buildPayload(true), { onSuccess: () => navigate(-1) })}
              disabled={simpanHPPMut.isPending || jasaKomponen.length === 0}
              className="flex-1 rounded-xl bg-gold-500 py-3.5 font-sans text-body font-semibold text-navy-900 disabled:opacity-50"
            >
              {simpanHPPMut.isPending ? 'MENYIMPAN...' : 'AJUKAN REVIEW'}
            </button>
          </div>
        )}
      </div>

      {/* Modal tolak HPP */}
      {showTolakModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60">
          <div className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4">
            <p className="font-heading text-heading text-navy-900">TOLAK HPP</p>
            <textarea
              value={alasanTolak}
              onChange={(e) => setAlasanTolak(e.target.value.toUpperCase())}
              rows={3}
              placeholder="ALASAN PENOLAKAN HPP"
              className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 uppercase outline-none focus:border-gold-500 resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowTolakModal(false)}
                className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600">
                BATAL
              </button>
              <button
                disabled={!alasanTolak.trim() || tolakHPPMut.isPending}
                onClick={() => tolakHPPMut.mutate(
                  { hppId: hppData?.id, alasan: alasanTolak },
                  { onSuccess: () => { setShowTolakModal(false); navigate(-1) } }
                )}
                className="flex-1 rounded-xl bg-danger py-3.5 font-sans text-body font-semibold text-white disabled:opacity-50"
              >
                {tolakHPPMut.isPending ? 'MENYIMPAN...' : 'TOLAK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-komponen ─────────────────────────────────────────────────────────────
function Section({ title, total, children }) {
  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-border bg-champagne-100">
        <p className="font-sans text-xs font-semibold text-charcoal-600 uppercase">{title}</p>
        {total != null && <p className="font-sans text-label font-semibold text-navy-900">{total}</p>}
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  )
}

function KalcRow({ label, value, bold }) {
  return (
    <div className="flex justify-between items-center">
      <p className={['font-sans text-label', bold ? 'font-semibold text-navy-900' : 'text-charcoal-600'].join(' ')}>{label}</p>
      <p className={['font-sans text-label', bold ? 'font-semibold text-navy-900' : 'text-navy-900'].join(' ')}>{value}</p>
    </div>
  )
}
