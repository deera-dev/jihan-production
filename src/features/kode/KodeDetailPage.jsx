// KodeDetailPage — J-001-IMA, tabbed: Sampel | HPP | Produksi | Kirim.
// Role-aware: Deera CRUD + Jihan approve/lihat.

import { useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDetailKode, useApproveSampel, useTolakSampel,
  useTambahCatatanSampel,
  useBuatSampelDanAjukanReview, useKonfirmasiEstimasi,
  useLanjutkanKeProsesPotong, useBatalkanKode,
  useLanjutkanDariBatalkan, useMulaiInputBukuPotong,
  useLanjutKeInputNota } from './hooks/useKode'
import { useNotaByProduksi, useApproveNota, useTolakNota } from '../nota/hooks/useNota'
import { useUpdatePcsDone, useCatatReject } from '../tracking/hooks/useTracking'
import { usePengirimanByKode, useBuatPengiriman, useApprovePengiriman, useTolakPengiriman } from '../pengiriman/hooks/usePengiriman'
import { useAuthStore, selectProfile, selectIsDeera } from '../../store/useAuthStore'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { formatRp } from '../../utils/formatRp'
import { formatTanggal } from '../../utils/formatTanggal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tolakSampelSchema, catatanSampelSchema } from './schema'
import { uploadFotoSampel } from '../../lib/cloudinary'

const LANGKAH_STEPPER = [
  { label: 'Sampel', statuses: ['sampel_dibuat', 'review_sampel'] },
  { label: 'Estimasi', statuses: ['estimasi_pemakaian', 'konfirmasi_pemakaian', 'proses_potong'] },
  { label: 'Buku Potong', statuses: ['input_buku_potong', 'input_nota', 'review_hpp'] },
  { label: 'Produksi', statuses: ['produksi', 'siap_kirim'] },
  { label: 'Selesai', statuses: ['selesai'] },
]

function statusKeStep(status) {
  if (status === 'dibatalkan') return -1
  for (let i = 0; i < LANGKAH_STEPPER.length; i++) {
    if (LANGKAH_STEPPER[i].statuses.includes(status)) return i
  }
  return 0
}

function StatusStepper({ status }) {
  const activeIdx = statusKeStep(status)
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2 px-4">
      {LANGKAH_STEPPER.map((l, i) => {
        const done = i < activeIdx
        const active = i === activeIdx
        return (
          <div key={l.label} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className={[
                'h-6 w-6 rounded-full border-2 flex items-center justify-center font-sans text-xs font-bold',
                done ? 'border-gold-500 bg-gold-500 text-navy-900' :
                active ? 'border-gold-500 bg-navy-900 text-gold-500' :
                'border-charcoal-300 bg-surface text-charcoal-300',
              ].join(' ')}>
                {done ? '\u2713' : i + 1}
              </div>
              <span className={[
                'font-sans text-xs whitespace-nowrap',
                active ? 'text-navy-900 font-semibold' : 'text-charcoal-300',
              ].join(' ')}>{l.label}</span>
            </div>
            {i < LANGKAH_STEPPER.length - 1 && (
              <div className={['h-0.5 w-6 mb-4 mx-0.5', done ? 'bg-gold-500' : 'bg-champagne-200'].join(' ')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const TABS = ['SAMPEL', 'BIAYA', 'PRODUKSI', 'KIRIM']

export function KodeDetailPage() {
  const { kodeId } = useParams()
  const navigate = useNavigate()
  const profile = useAuthStore(selectProfile)
  const isDeera = useAuthStore(selectIsDeera)
  const [tab, setTab] = useState('SAMPEL')
  const [modalTolakSampel, setModalTolakSampel] = useState(null)
  const [modalTolakNota, setModalTolakNota] = useState(false)
  const [showUploadSampel, setShowUploadSampel] = useState(false)
  const [showTambahCatatan, setShowTambahCatatan] = useState(null)

  const { data: kode, isLoading, error } = useDetailKode(kodeId)
  const approveSampelMut = useApproveSampel(kodeId)
  const tolakSampelMut = useTolakSampel(kodeId)
  const buatSampelMut = useBuatSampelDanAjukanReview(kodeId)
  const tambahCatatanMut = useTambahCatatanSampel(kodeId)
  const produksiId = kode?.produksi_id ?? null
  const { data: notaList = [] } = useNotaByProduksi(produksiId)
  const approveNotaMut = useApproveNota()
  const tolakNotaMut = useTolakNota()
  const konfirmasiEstimasiMut = useKonfirmasiEstimasi(kodeId)
  const lanjutProsesPotongMut = useLanjutkanKeProsesPotong(kodeId)
  const batalkanMut = useBatalkanKode(kodeId)
  const lanjutDariBatalkanMut = useLanjutkanDariBatalkan(kodeId)
  const mulaiInputBPMut = useMulaiInputBukuPotong(kodeId)
  const lanjutKeNotaMut = useLanjutKeInputNota(kodeId)
  const updatePcsDoneMut = useUpdatePcsDone(kodeId)
  const catatRejectMut = useCatatReject(kodeId)
  const { data: pengirimanList = [] } = usePengirimanByKode(kodeId)
  const buatPengirimanMut = useBuatPengiriman(kodeId)
  const approvePengirimanMut = useApprovePengiriman(kodeId)
  const tolakPengirimanMut = useTolakPengiriman(kodeId)

  if (isLoading) return <LoadingScreen />
  if (error || !kode) return <ErrorScreen onBack={() => navigate(-1)} />

  const status = kode.status
  const sampelAktif = kode.sampel?.find((s) => s.status === 'aktif')
  const notaAktif = notaList.find((n) => ['review','approved'].includes(n.status)) ?? notaList[0] ?? null

  return (
    <div className="min-h-screen bg-champagne-100">
      <div className="bg-navy-900 px-4 pt-5 pb-0">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/produksi/' + kode.produksi_id)}
            className="font-sans text-sm text-champagne-100 opacity-70 active:opacity-100">
            {'\u2190'}
          </button>
          <div className="flex-1">
            <h1 className="font-heading text-heading text-champagne-100">{kode.kode_desain}</h1>
            <StatusBadge status={status} />
          </div>
          {kode.harga_jual_target && (
            <p className="font-sans text-label text-gold-500">{formatRp(kode.harga_jual_target)}</p>
          )}
        </div>
        <StatusStepper status={status} />
        {isDeera && (
          <StatusAksiPanel
            status={status}
            statusSebelum={kode.status_sebelum_dibatalkan}
            kodeId={kodeId}
            navigate={navigate}
            onKonfirmasiEstimasi={() => konfirmasiEstimasiMut.mutate()}
            onLanjutProsesPotong={() => lanjutProsesPotongMut.mutate()}
            onBatalkan={() => batalkanMut.mutate(status)}
            onLanjutDariBatalkan={() => lanjutDariBatalkanMut.mutate(kode.status_sebelum_dibatalkan)}
            onMulaiInputBP={() => mulaiInputBPMut.mutate(null, { onSuccess: () => navigate('/kode/' + kodeId + '/buku-potong') })}
            onLanjutKeNota={() => lanjutKeNotaMut.mutate(null, { onSuccess: () => navigate('/nota') })}
            isPending={
              konfirmasiEstimasiMut.isPending || lanjutProsesPotongMut.isPending ||
              batalkanMut.isPending || lanjutDariBatalkanMut.isPending ||
              mulaiInputBPMut.isPending || lanjutKeNotaMut.isPending
            }
          />
        )}
        <div className="flex mt-3">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={['flex-1 py-2.5 font-sans text-label font-semibold transition-colors',
                tab === t ? 'border-b-2 border-gold-500 text-champagne-100' : 'text-charcoal-300',
              ].join(' ')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {tab === 'SAMPEL' && (
          <TabSampel kode={kode} isDeera={isDeera} profile={profile} sampelAktif={sampelAktif}
            status={status}
            onApprove={(sampelId) => approveSampelMut.mutate({ sampelId })}
            onTolakOpen={(sampelId) => setModalTolakSampel(sampelId)}
            onUploadOpen={() => setShowUploadSampel(true)}
            onCatatanOpen={(sampelId) => setShowTambahCatatan(sampelId)}
            isPending={approveSampelMut.isPending} />
        )}
        {tab === 'BIAYA' && (
          <TabBiaya nota={notaAktif} isDeera={isDeera} status={status}
            onApprove={() => approveNotaMut.mutate(notaAktif?.id)}
            onTolakOpen={() => setModalTolakNota(true)}
            isPending={approveNotaMut.isPending} />
        )}
        {tab === 'PRODUKSI' && (
          <TabProduksi kode={kode} isDeera={isDeera}
            onUpdatePcs={(trackingId, pcsDone) => updatePcsDoneMut.mutate({ trackingId, pcsDone })}
            onCatatReject={(payload) => catatRejectMut.mutate(payload)} />
        )}
        {tab === 'KIRIM' && (
          <TabKirim kode={kode} isDeera={isDeera} pengirimanList={pengirimanList}
            onBuat={(payload) => buatPengirimanMut.mutateAsync(payload)}
            onApprove={(pengirimanId) => approvePengirimanMut.mutate({ pengirimanId })}
            onTolak={(pengirimanId) => tolakPengirimanMut.mutate({ pengirimanId })}
            isPendingBuat={buatPengirimanMut.isPending}
            isPendingApprove={approvePengirimanMut.isPending} />
        )}
      </div>

      {modalTolakSampel && (
        <ModalTolak title="TOLAK SAMPEL" placeholder="ALASAN PENOLAKAN" schema={tolakSampelSchema}
          isPending={tolakSampelMut.isPending}
          onSubmit={({ alasan }) => tolakSampelMut.mutate({ sampelId: modalTolakSampel, alasan },
            { onSuccess: () => setModalTolakSampel(null) })}
          onClose={() => setModalTolakSampel(null)} />
      )}
      {modalTolakNota && (
        <ModalTolak title="TOLAK NOTA BIAYA" placeholder="ALASAN PENOLAKAN" schema={tolakSampelSchema}
          isPending={tolakNotaMut.isPending}
          onSubmit={({ alasan }) => tolakNotaMut.mutate({ notaId: notaAktif?.id, alasan },
            { onSuccess: () => setModalTolakNota(false) })}
          onClose={() => setModalTolakNota(false)} />
      )}
      {showUploadSampel && (
        <ModalUploadSampel kode={kode} isPending={buatSampelMut.isPending}
          onSubmit={({ foto_depan_url, foto_belakang_url }) => {
            const versi = (kode.sampel?.length ?? 0) + 1
            buatSampelMut.mutate({ kode_id: kodeId, foto_depan_url, foto_belakang_url, versi, created_by: profile?.id },
              { onSuccess: () => setShowUploadSampel(false) })
          }}
          onClose={() => setShowUploadSampel(false)} />
      )}
      {showTambahCatatan && (
        <ModalCatatan isPending={tambahCatatanMut.isPending}
          onSubmit={({ isi }) => tambahCatatanMut.mutate({ sampel_id: showTambahCatatan, user_id: profile?.id, isi },
            { onSuccess: () => setShowTambahCatatan(null) })}
          onClose={() => setShowTambahCatatan(null)} />
      )}
    </div>
  )
}

// ─── TabSampel ────────────────────────────────────────────────────────────────
function TabSampel({ kode, isDeera, sampelAktif, status, onApprove, onTolakOpen,
  onUploadOpen, onCatatanOpen, isPending }) {
  const sampelList = [...(kode.sampel ?? [])].sort((a, b) => b.versi - a.versi)
  const bisaUpload  = isDeera && status === 'sampel_dibuat'
  const bisaApprove = !isDeera && status === 'review_sampel' && sampelAktif
  const showEstimasi = ['estimasi_pemakaian','konfirmasi_pemakaian','proses_potong',
    'input_buku_potong','input_nota','review_hpp',
    'produksi','siap_kirim','selesai'].includes(status)

  return (
    <div className="space-y-4">
      {bisaApprove && (
        <div className="flex gap-3">
          <button onClick={() => onApprove(sampelAktif.id)} disabled={isPending}
            className="flex-1 rounded-xl bg-gold-500 py-3.5 font-sans text-body font-semibold text-navy-900 disabled:opacity-50">
            APPROVE SAMPEL
          </button>
          <button onClick={() => onTolakOpen(sampelAktif.id)}
            className="flex-1 rounded-xl border border-danger py-3.5 font-sans text-body font-semibold text-danger">
            TOLAK
          </button>
        </div>
      )}
      {bisaUpload && (
        <button onClick={onUploadOpen}
          className="w-full rounded-xl border-2 border-dashed border-gold-500 py-4 font-sans text-body font-semibold text-gold-500">
          + UPLOAD SAMPEL
        </button>
      )}
      {!bisaUpload && !bisaApprove && !showEstimasi && (
        <div className="rounded-xl bg-surface border border-border px-4 py-3">
          <p className="font-sans text-label text-charcoal-600">{statusSampelInfo(status, isDeera)}</p>
        </div>
      )}
      {showEstimasi && <EstimasiSection kode={kode} status={status} isDeera={isDeera} />}
      {sampelList.length === 0 && (
        <p className="py-8 text-center font-sans text-body text-charcoal-300">Belum ada sampel yang diupload.</p>
      )}
      {sampelList.map((s) => (
        <SampelCard key={s.id} sampel={s} onTambahCatatan={() => onCatatanOpen(s.id)} />
      ))}
    </div>
  )
}

function statusSampelInfo(status, isDeera) {
  if (status === 'review_sampel') return isDeera ? 'Menunggu review Jihan.' : 'Silakan review sampel di atas.'
  if (status === 'sampel_dibuat') return isDeera ? 'Belum ada sampel. Upload sampel untuk dilanjutkan.' : 'Menunggu sampel dari Deera.'
  return 'Status: ' + status.replace(/_/g, ' ') + '.'
}

function EstimasiSection({ kode, status, isDeera }) {
  const produksi = kode.produksi ?? {}
  const bahanList = produksi.produksi_bahan ?? []
  const bahanPrimer   = bahanList.filter((b) => b.tipe_bahan === 'primer')
  const bahanSekunder = bahanList.filter((b) => b.tipe_bahan === 'sekunder')
  const isKonfirmasi  = status === 'konfirmasi_pemakaian'

  return (
    <div className="space-y-3">
      <div className={['rounded-xl px-4 py-3 border',
        isKonfirmasi ? 'bg-info/10 border-info/30' : 'bg-surface border-border'].join(' ')}>
        <p className="font-sans text-label font-semibold text-navy-900 mb-0.5">
          {isKonfirmasi
            ? (isDeera ? 'Menunggu konfirmasi Jihan' : 'Estimasi pemakaian dari Deera')
            : 'Rencana pemakaian bahan'}
        </p>
        <p className="font-sans text-xs text-charcoal-300">
          {isKonfirmasi && !isDeera
            ? 'Konfirmasi dilakukan via WhatsApp atau tatap muka. Deera akan melanjutkan setelah konfirmasi.'
            : 'Data bahan berdasarkan surat jalan dari Jihan.'}
        </p>
      </div>
      {bahanPrimer.length > 0 && (
        <div className="rounded-xl bg-surface border border-border overflow-hidden">
          <p className="px-4 py-2.5 font-sans text-label font-semibold text-charcoal-600 uppercase border-b border-border bg-champagne-100">
            Bahan Primer (Motif)
          </p>
          {bahanPrimer.map((b) => (
            <div key={b.id} className="px-4 py-3 border-b border-border last:border-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-sans text-body font-semibold text-navy-900">{b.jenis_bahan}</p>
                <span className="font-sans text-xs text-charcoal-300">
                  Rp {Number(b.harga_per_satuan ?? 0).toLocaleString('id-ID')}/{b.satuan}
                </span>
              </div>
              {(b.produksi_bahan_warna ?? []).length > 0 && (
                <div className="space-y-1">
                  {(b.produksi_bahan_warna ?? []).map((w) => (
                    <div key={w.id} className="flex items-center justify-between">
                      <span className="font-sans text-label text-charcoal-600">{w.nama_warna}</span>
                      <span className="font-sans text-label tabular-nums text-navy-900">
                        {Number(w.yard_tersedia ?? 0).toLocaleString('id-ID')} yard
                        {w.yard_terpakai != null && w.yard_terpakai > 0 && (
                          <span className="ml-1 text-charcoal-300">
                            (terpakai {Number(w.yard_terpakai).toLocaleString('id-ID')})
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {bahanSekunder.length > 0 && (
        <div className="rounded-xl bg-surface border border-border overflow-hidden">
          <p className="px-4 py-2.5 font-sans text-label font-semibold text-charcoal-600 uppercase border-b border-border bg-champagne-100">
            Bahan Sekunder
          </p>
          {bahanSekunder.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
              <p className="font-sans text-label font-semibold text-navy-900">{b.jenis_bahan}</p>
              <div className="text-right">
                <p className="font-sans text-label tabular-nums text-navy-900">
                  {Number(b.konsumsi_per_pcs ?? 0).toLocaleString('id-ID')} {b.satuan_konsumsi ?? b.satuan}/pcs
                </p>
                <p className="font-sans text-xs text-charcoal-300">
                  Rp {Number(b.harga_per_satuan ?? 0).toLocaleString('id-ID')}/{b.satuan}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {bahanList.length === 0 && (
        <p className="py-4 text-center font-sans text-label text-charcoal-300">Belum ada data bahan di produksi ini.</p>
      )}
    </div>
  )
}

function SampelCard({ sampel, onTambahCatatan }) {
  const [lihatFoto, setLihatFoto] = useState(null)
  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="font-sans text-label font-semibold text-navy-900">VERSI {sampel.versi}</p>
        <span className={['rounded-full px-2 py-0.5 font-sans text-xs font-semibold',
          sampel.status === 'ditolak' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'].join(' ')}>
          {sampel.status === 'ditolak' ? 'DITOLAK' : 'AKTIF'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        {[sampel.foto_depan_url, sampel.foto_belakang_url].filter(Boolean).map((url, i) => (
          <button key={i} onClick={() => setLihatFoto(url)} className="aspect-square overflow-hidden rounded-lg bg-champagne-100">
            <img src={url} alt={i === 0 ? 'Depan' : 'Belakang'} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {sampel.alasan_ditolak && (
        <div className="mx-3 mb-3 rounded-lg bg-danger/10 px-3 py-2">
          <p className="font-sans text-xs text-danger font-semibold">ALASAN TOLAK:</p>
          <p className="font-sans text-label text-danger">{sampel.alasan_ditolak}</p>
        </div>
      )}
      {(sampel.sampel_catatan ?? []).map((c) => (
        <div key={c.id} className="mx-3 mb-2 rounded-lg bg-champagne-100 px-3 py-2">
          <p className="font-sans text-xs text-charcoal-300">{formatTanggal(c.created_at)}</p>
          <p className="font-sans text-label text-navy-900">{c.isi}</p>
        </div>
      ))}
      <div className="px-3 pb-3">
        <button onClick={onTambahCatatan}
          className="w-full rounded-lg border border-border py-2 font-sans text-label text-charcoal-600">
          + CATATAN
        </button>
      </div>
      {lihatFoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setLihatFoto(null)}>
          <img src={lihatFoto} alt="Preview" className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" />
        </div>
      )}
    </div>
  )
}

// ─── TabBiaya ────────────────────────────────────────────────────────────────
function TabBiaya({ nota, isDeera, status, onApprove, onTolakOpen, isPending }) {
  const bisaApprove = !isDeera && status === 'review_hpp' && nota
  const bp = nota?.biaya_produksi ?? {}
  const totalBP = (bp.jahit||0) + (bp.potong||0) + (bp.finishing||0) + (bp.atk||0)
  const formatRp2 = (n) => 'Rp ' + Number(n||0).toLocaleString('id-ID')

  return (
    <div className="space-y-4">
      {nota?.status === 'ditolak' && (
        <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-3">
          <p className="font-sans text-label font-semibold text-danger">NOTA BIAYA DITOLAK</p>
          {nota.alasan_tolak && <p className="mt-1 font-sans text-label text-danger">{nota.alasan_tolak}</p>}
        </div>
      )}
      {bisaApprove && (
        <div className="flex gap-3">
          <button onClick={onApprove} disabled={isPending}
            className="flex-1 rounded-xl bg-gold-500 py-3.5 font-sans text-body font-semibold text-navy-900 disabled:opacity-50">
            APPROVE NOTA BIAYA
          </button>
          <button onClick={onTolakOpen}
            className="flex-1 rounded-xl border border-danger py-3.5 font-sans text-body font-semibold text-danger">
            TOLAK
          </button>
        </div>
      )}
      {nota ? (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="bg-navy-900 px-4 py-3">
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gold-400">NOTA BIAYA</p>
            <p className="font-sans text-xs text-champagne-400 mt-0.5">
              Status: <span className="font-semibold uppercase text-champagne-200">{nota.status}</span>
            </p>
          </div>
          <div className="divide-y divide-border">
            {(nota.aksesoris||[]).length > 0 && (
              <div className="px-4 py-3 space-y-1">
                <p className="font-sans text-xs font-semibold uppercase tracking-wide text-charcoal-500 mb-2">AKSESORIS</p>
                {nota.aksesoris.map((a, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="font-sans text-xs text-charcoal-700">{a.nama}</span>
                    <span className="font-sans text-xs font-semibold text-navy-900">{formatRp2(a.harga_per_baju)}/baju</span>
                  </div>
                ))}
              </div>
            )}
            <div className="px-4 py-3">
              <p className="font-sans text-xs font-semibold uppercase tracking-wide text-charcoal-500 mb-2">BIAYA PRODUKSI</p>
              {bp.tampilkan_rincian ? (
                <div className="space-y-1">
                  {[['Jahit', bp.jahit],['Potong', bp.potong],['Finishing', bp.finishing],['ATK', bp.atk]].map(([l,v]) => (
                    <div key={l} className="flex justify-between">
                      <span className="font-sans text-xs text-charcoal-700">{l}</span>
                      <span className="font-sans text-xs text-navy-900">{formatRp2(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-xs text-charcoal-700">
                  Kisaran {formatRp2(35000)} \u2013 {formatRp2(45000)}/baju
                  <span className="ml-2 text-charcoal-400">(total: {formatRp2(totalBP)}/baju)</span>
                </p>
              )}
            </div>
            <div className="px-4 py-3 flex justify-between">
              <span className="font-sans text-xs text-charcoal-600">Biaya Jual Beli</span>
              <span className="font-sans text-xs font-semibold text-navy-900">{formatRp2(nota.biaya_jual_beli || 20000)}/baju</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="py-8 text-center font-sans text-body text-charcoal-300">
          Nota biaya belum tersedia. Selesaikan tahap sebelumnya terlebih dahulu.
        </p>
      )}
    </div>
  )
}

// ─── TabProduksi ─────────────────────────────────────────────────────────────
const TAHAP_ORDER = ['dipotong','dijahit','finishing','siap_kirim']
const TAHAP_LABEL = { dipotong:'Dipotong', dijahit:'Dijahit', finishing:'Finishing', siap_kirim:'Siap Kirim' }
const NASIB_OPTIONS = [
  { value: 'dipermak', label: 'Dipermak' },
  { value: 'produksi_ulang', label: 'Produksi Ulang' },
  { value: 'waste', label: 'Waste' },
]

function TabProduksi({ kode, isDeera, onUpdatePcs, onCatatReject }) {
  const ukuranList = [...(kode.kode_ukuran ?? [])].sort((a, b) => a.urutan - b.urutan)
  if (!['produksi','siap_kirim','selesai'].includes(kode.status)) {
    return <p className="py-8 text-center font-sans text-body text-charcoal-300">Tracking produksi tersedia setelah HPP disetujui.</p>
  }
  return (
    <div className="space-y-4">
      {ukuranList.map((ukuran) => (
        <UkuranCard key={ukuran.id} ukuran={ukuran} isDeera={isDeera} onUpdatePcs={onUpdatePcs} onCatatReject={onCatatReject} />
      ))}
      {ukuranList.length === 0 && <p className="py-8 text-center font-sans text-body text-charcoal-300">Belum ada data ukuran.</p>}
    </div>
  )
}

function UkuranCard({ ukuran, isDeera, onUpdatePcs, onCatatReject }) {
  const warnaList = ukuran.kode_ukuran_warna ?? []
  const totalPcs = warnaList.reduce((s, w) => s + (w.jumlah_pcs ?? 0), 0)
  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      <div className="bg-navy-900 px-4 py-3 flex justify-between items-center">
        <p className="font-sans text-label font-semibold text-champagne-100">{ukuran.ukuran}</p>
        <p className="font-sans text-label text-charcoal-300">{totalPcs} pcs</p>
      </div>
      <div className="divide-y divide-border">
        {warnaList.map((warna) => (
          <WarnaTracking key={warna.id} warna={warna} isDeera={isDeera} onUpdatePcs={onUpdatePcs} onCatatReject={onCatatReject} />
        ))}
        {warnaList.length === 0 && <p className="px-4 py-3 font-sans text-label text-charcoal-300">Belum ada data warna.</p>}
      </div>
    </div>
  )
}

function WarnaTracking({ warna, isDeera, onUpdatePcs, onCatatReject }) {
  const tracking = warna.tracking_produksi ?? []
  const totalPcs = warna.jumlah_pcs ?? 0
  const [editTahap, setEditTahap] = useState(null)
  const [rejectFor, setRejectFor] = useState(null)
  const [inputPcs, setInputPcs] = useState('')
  const [rejectForm, setRejectForm] = useState({ pcs:'', alasan:'', nasib:'dipermak', bahanTersedia:true, catatan:'' })

  function submitPcs() {
    const n = Number(inputPcs)
    if (!n || n < 0) return
    onUpdatePcs(editTahap.trackingId, n)
    setEditTahap(null)
  }

  function submitReject() {
    if (!rejectFor || !rejectForm.pcs || !rejectForm.alasan) return
    onCatatReject({
      trackingProduksiId: rejectFor.trackingId,
      pcsReject: Number(rejectForm.pcs),
      alasan: rejectForm.alasan,
      nasib: rejectForm.nasib,
      bahanTersedia: rejectForm.nasib === 'produksi_ulang' ? rejectForm.bahanTersedia : null,
      catatan: rejectForm.catatan,
    })
    setRejectFor(null)
    setRejectForm({ pcs:'', alasan:'', nasib:'dipermak', bahanTersedia:true, catatan:'' })
  }

  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex justify-between items-center">
        <p className="font-sans text-label font-semibold text-navy-900">{warna.nama_warna}</p>
        <p className="font-sans text-label text-charcoal-300">{totalPcs} pcs</p>
      </div>
      <div className="space-y-1.5">
        {TAHAP_ORDER.map((tahap) => {
          const t = tracking.find((x) => x.tahap === tahap)
          const trackingId = t?.id
          const pcsDone = t?.pcs_done ?? 0
          const pct = totalPcs > 0 ? Math.min(100, Math.round((pcsDone / totalPcs) * 100)) : 0
          const rejectCount = (t?.tracking_reject ?? []).reduce((s, r) => s + r.pcs_reject, 0)
          return (
            <div key={tahap}>
              <div className="flex justify-between items-center mb-0.5">
                <span className="font-sans text-xs text-charcoal-600">{TAHAP_LABEL[tahap]}</span>
                <div className="flex items-center gap-2">
                  {rejectCount > 0 && <span className="font-sans text-xs text-danger">{rejectCount} reject</span>}
                  <span className="font-sans text-xs text-charcoal-600">{pcsDone}/{totalPcs}</span>
                  {isDeera && trackingId && (
                    <div className="flex gap-1">
                      <button onClick={() => { setEditTahap({ trackingId, tahap, currentPcs: pcsDone }); setInputPcs(String(pcsDone)) }}
                        className="rounded px-1.5 py-0.5 font-sans text-xs bg-champagne-200 text-navy-900">EDIT</button>
                      <button onClick={() => setRejectFor({ trackingId, tahap })}
                        className="rounded px-1.5 py-0.5 font-sans text-xs bg-danger/10 text-danger">REJECT</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-champagne-200">
                <div className={['h-1.5 rounded-full transition-all', pct === 100 ? 'bg-gold-500' : 'bg-navy-700'].join(' ')}
                  style={{ width: pct + '%' }} />
              </div>
            </div>
          )
        })}
      </div>

      {editTahap && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60">
          <div className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4">
            <p className="font-heading text-heading text-navy-900">UPDATE {TAHAP_LABEL[editTahap.tahap].toUpperCase()}</p>
            <p className="font-sans text-label text-charcoal-600">Warna: {warna.nama_warna} \u2014 Total {totalPcs} pcs</p>
            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Pcs Selesai</label>
              <input type="number" min={0} max={totalPcs} value={inputPcs}
                onChange={(e) => setInputPcs(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditTahap(null)}
                className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600">BATAL</button>
              <button onClick={submitPcs}
                className="flex-1 rounded-xl bg-gold-500 py-3.5 font-sans text-body font-semibold text-navy-900">SIMPAN</button>
            </div>
          </div>
        </div>
      )}

      {rejectFor && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60">
          <div className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <p className="font-heading text-heading text-navy-900">CATAT REJECT</p>
            <p className="font-sans text-label text-charcoal-600">Tahap: {TAHAP_LABEL[rejectFor.tahap]} \u2014 {warna.nama_warna}</p>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Jumlah Reject (pcs)</label>
                <input type="number" min={1} value={rejectForm.pcs}
                  onChange={(e) => setRejectForm((p) => ({ ...p, pcs: e.target.value }))}
                  className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500" />
              </div>
              <div className="space-y-1">
                <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Alasan</label>
                <input type="text" value={rejectForm.alasan}
                  onChange={(e) => setRejectForm((p) => ({ ...p, alasan: e.target.value.toUpperCase() }))}
                  placeholder="ALASAN REJECT"
                  className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 uppercase outline-none focus:border-gold-500" />
              </div>
              <div className="space-y-1">
                <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Nasib</label>
                <div className="flex gap-2">
                  {NASIB_OPTIONS.map((o) => (
                    <button key={o.value} type="button"
                      onClick={() => setRejectForm((p) => ({ ...p, nasib: o.value }))}
                      className={['flex-1 rounded-xl border py-2.5 font-sans text-xs font-semibold transition-colors',
                        rejectForm.nasib === o.value ? 'bg-navy-900 border-navy-900 text-champagne-100' : 'border-border text-charcoal-600',
                      ].join(' ')}>
                      {o.label.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {rejectForm.nasib === 'produksi_ulang' && (
                <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                  <p className="font-sans text-label text-charcoal-600">Bahan tersedia?</p>
                  <button type="button" onClick={() => setRejectForm((p) => ({ ...p, bahanTersedia: !p.bahanTersedia }))}
                    className={['relative w-10 h-5 rounded-full transition-colors', rejectForm.bahanTersedia ? 'bg-gold-500' : 'bg-charcoal-300'].join(' ')}>
                    <span className={['absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                      rejectForm.bahanTersedia ? 'translate-x-5' : 'translate-x-0'].join(' ')} />
                  </button>
                </div>
              )}
              <div className="space-y-1">
                <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Catatan (opsional)</label>
                <input type="text" value={rejectForm.catatan}
                  onChange={(e) => setRejectForm((p) => ({ ...p, catatan: e.target.value.toUpperCase() }))}
                  placeholder="CATATAN TAMBAHAN"
                  className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 uppercase outline-none focus:border-gold-500" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectFor(null)}
                className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600">BATAL</button>
              <button onClick={submitReject} disabled={!rejectForm.pcs || !rejectForm.alasan}
                className="flex-1 rounded-xl bg-danger py-3.5 font-sans text-body font-semibold text-white disabled:opacity-50">SIMPAN REJECT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TabKirim ─────────────────────────────────────────────────────────────────
function TabKirim({ kode, isDeera, pengirimanList, onBuat, onApprove, onTolak, isPendingBuat, isPendingApprove }) {
  const [showForm, setShowForm] = useState(false)
  const [tanggal, setTanggal]   = useState(() => new Date().toISOString().slice(0, 10))
  const [catatan, setCatatan]   = useState('')
  const [items, setItems]       = useState([{ namaWarna: '', jumlahPcs: '' }])
  const [formErr, setFormErr]   = useState('')

  const bisa = ['siap_kirim','produksi','selesai'].includes(kode.status)
  const warnaOptions = (kode.kode_ukuran?.[0]?.kode_ukuran_warna ?? []).map((w) => w.nama_warna)

  async function handleSubmit(e) {
    e.preventDefault()
    setFormErr('')
    const valid = items.every((it) => it.namaWarna && Number(it.jumlahPcs) > 0)
    if (!valid) { setFormErr('Isi semua warna & jumlah pcs.'); return }
    try {
      await onBuat({ tanggal, catatan, items: items.map((it) => ({ namaWarna: it.namaWarna, jumlahPcs: Number(it.jumlahPcs) })) })
      setShowForm(false); setItems([{ namaWarna: '', jumlahPcs: '' }]); setCatatan('')
    } catch (err) {
      setFormErr(err.message ?? 'Gagal menyimpan pengiriman')
    }
  }

  return (
    <div className="space-y-4">
      {!bisa && <p className="py-8 text-center font-sans text-body text-charcoal-300">Data pengiriman tersedia setelah produksi berjalan.</p>}
      {bisa && isDeera && (
        <button onClick={() => setShowForm(true)}
          className="w-full rounded-xl bg-navy-900 py-3.5 font-sans text-body font-semibold text-champagne-100">
          + BUAT PENGIRIMAN
        </button>
      )}
      {pengirimanList.length === 0 && bisa && (
        <p className="py-4 text-center font-sans text-label text-charcoal-300">Belum ada pengiriman.</p>
      )}
      {pengirimanList.map((p) => (
        <PengirimanKartu key={p.id} pengiriman={p} isDeera={isDeera}
          onApprove={() => onApprove(p.id)} onTolak={() => onTolak(p.id)} isPending={isPendingApprove} />
      ))}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60">
          <form onSubmit={handleSubmit} className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <p className="font-heading text-heading text-navy-900">BUAT PENGIRIMAN</p>
            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Tanggal</label>
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500" />
            </div>
            <div className="space-y-2">
              <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Warna & Jumlah Pcs</label>
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select value={item.namaWarna}
                    onChange={(e) => setItems((p) => p.map((x, j) => j === i ? { ...x, namaWarna: e.target.value } : x))}
                    className="flex-1 rounded-xl border border-border px-3 py-3 font-sans text-label text-navy-900 outline-none focus:border-gold-500 bg-surface">
                    <option value="">-- Pilih Warna --</option>
                    {warnaOptions.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                  <input type="number" min={1} value={item.jumlahPcs} placeholder="PCS"
                    onChange={(e) => setItems((p) => p.map((x, j) => j === i ? { ...x, jumlahPcs: e.target.value } : x))}
                    className="w-20 rounded-xl border border-border px-3 py-3 font-sans text-label text-navy-900 outline-none focus:border-gold-500 text-right" />
                  {items.length > 1 && (
                    <button type="button" onClick={() => setItems((p) => p.filter((_, j) => j !== i))}
                      className="font-sans text-xs text-danger px-1">&#10005;</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setItems((p) => [...p, { namaWarna: '', jumlahPcs: '' }])}
                className="w-full rounded-xl border border-dashed border-gold-500 py-2 font-sans text-xs font-semibold text-gold-500">
                + WARNA LAIN
              </button>
            </div>
            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Catatan (opsional)</label>
              <input type="text" value={catatan} onChange={(e) => setCatatan(e.target.value.toUpperCase())}
                placeholder="CATATAN PENGIRIMAN"
                className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 uppercase outline-none focus:border-gold-500" />
            </div>
            {formErr && <p className="font-sans text-label text-danger">{formErr}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600">BATAL</button>
              <button type="submit" disabled={isPendingBuat}
                className="flex-1 rounded-xl bg-gold-500 py-3.5 font-sans text-body font-semibold text-navy-900 disabled:opacity-50">
                {isPendingBuat ? 'MENYIMPAN...' : 'AJUKAN KE JIHAN'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function PengirimanKartu({ pengiriman, isDeera, onApprove, onTolak, isPending }) {
  const statusColor = pengiriman.status_approval === 'disetujui' ? 'text-success'
    : pengiriman.status_approval === 'ditolak' ? 'text-danger' : 'text-gold-500'
  const statusLabel = pengiriman.status_approval === 'disetujui' ? 'DISETUJUI'
    : pengiriman.status_approval === 'ditolak' ? 'DITOLAK' : 'MENUNGGU'
  return (
    <div className="rounded-xl bg-surface border border-border overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-border">
        <p className="font-sans text-label font-semibold text-navy-900">{formatTanggal(pengiriman.tanggal ?? pengiriman.created_at)}</p>
        <span className={['font-sans text-xs font-semibold', statusColor].join(' ')}>{statusLabel}</span>
      </div>
      <div className="px-4 py-3 space-y-1.5">
        {(pengiriman.pengiriman_item ?? []).map((item) => (
          <div key={item.id} className="flex justify-between font-sans text-label">
            <span className="text-charcoal-600">{item.nama_warna}</span>
            <span className="text-navy-900">{item.jumlah_pcs} pcs</span>
          </div>
        ))}
        {pengiriman.catatan && <p className="font-sans text-xs text-charcoal-300 mt-1">{pengiriman.catatan}</p>}
      </div>
      {!isDeera && pengiriman.status_approval === 'menunggu' && (
        <div className="flex gap-3 px-4 pb-4">
          <button onClick={onApprove} disabled={isPending}
            className="flex-1 rounded-xl bg-gold-500 py-3 font-sans text-label font-semibold text-navy-900 disabled:opacity-50">SETUJUI</button>
          <button onClick={onTolak} disabled={isPending}
            className="flex-1 rounded-xl border border-danger py-3 font-sans text-label font-semibold text-danger disabled:opacity-50">TOLAK</button>
        </div>
      )}
    </div>
  )
}

// ─── Modals ───────────────────────────────────────────────────────────────────
function ModalTolak({ title, placeholder, schema, onSubmit, onClose, isPending }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) })
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60">
      <div className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4">
        <p className="font-heading text-heading text-navy-900">{title}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <textarea {...register('alasan')} rows={3} placeholder={placeholder}
              onChange={(e) => e.target.value = e.target.value.toUpperCase()}
              className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 uppercase outline-none focus:border-gold-500 resize-none" />
            {errors.alasan && <p className="mt-1 font-sans text-xs text-danger">{errors.alasan.message}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600">BATAL</button>
            <button type="submit" disabled={isPending}
              className="flex-1 rounded-xl bg-danger py-3.5 font-sans text-body font-semibold text-white disabled:opacity-50">
              {isPending ? 'MENYIMPAN...' : 'TOLAK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModalUploadSampel({ kode, onSubmit, onClose, isPending }) {
  const [fotoDepan, setFotoDepan]     = useState(null)
  const [fotoBelakang, setFotoBelakang] = useState(null)
  const [uploading, setUploading]     = useState(false)
  const [errMsg, setErrMsg]           = useState('')
  const refDepan    = useRef()
  const refBelakang = useRef()

  function pickFile(e, setter) {
    const file = e.target.files?.[0]
    if (!file) return
    setter({ file, preview: URL.createObjectURL(file) })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!fotoDepan || !fotoBelakang) { setErrMsg('Wajib upload 2 foto (depan & belakang).'); return }
    setErrMsg(''); setUploading(true)
    try {
      const folder = 'sampel/' + kode.kode_desain
      const [depan, belakang] = await Promise.all([
        uploadFotoSampel(fotoDepan.file, folder),
        uploadFotoSampel(fotoBelakang.file, folder),
      ])
      onSubmit({ foto_depan_url: depan.url, foto_belakang_url: belakang.url })
    } catch (err) {
      setErrMsg(err.message ?? 'Upload gagal. Coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  const busy = uploading || isPending
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60">
      <div className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4 max-h-[90vh] overflow-y-auto">
        <p className="font-heading text-heading text-navy-900">UPLOAD SAMPEL</p>
        <p className="font-sans text-label text-charcoal-600">Upload foto tampak depan & belakang (keduanya opsional \u2014 isi minimal satu).</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[['Depan', fotoDepan, setFotoDepan, refDepan], ['Belakang', fotoBelakang, setFotoBelakang, refBelakang]].map(([label, foto, setFoto, ref]) => (
              <div key={label}>
                <p className="font-sans text-xs font-semibold text-charcoal-600 uppercase mb-1.5">{label}</p>
                <button type="button" onClick={() => ref.current?.click()}
                  className={['aspect-square w-full rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden',
                    foto ? 'border-gold-500' : 'border-charcoal-300'].join(' ')}>
                  {foto ? <img src={foto.preview} className="h-full w-full object-cover" alt={label} />
                    : <span className="font-sans text-2xl text-charcoal-300">+</span>}
                </button>
                <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e, setFoto)} />
              </div>
            ))}
          </div>
          {busy && <p className="text-center font-sans text-label text-charcoal-600">Mengupload foto...</p>}
          {errMsg && <p className="font-sans text-label text-danger">{errMsg}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} disabled={busy}
              className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600 disabled:opacity-50">BATAL</button>
            <button type="submit" disabled={busy}
              className="flex-1 rounded-xl bg-gold-500 py-3.5 font-sans text-body font-semibold text-navy-900 disabled:opacity-50">
              {busy ? 'MENGUPLOAD...' : 'AJUKAN REVIEW'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModalCatatan({ onSubmit, onClose, isPending }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ resolver: zodResolver(catatanSampelSchema) })
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60">
      <div className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4">
        <p className="font-heading text-heading text-navy-900">TAMBAH CATATAN</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <textarea {...register('isi')} rows={3} placeholder="TULIS CATATAN..."
              onChange={(e) => setValue('isi', e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 uppercase outline-none focus:border-gold-500 resize-none" />
            {errors.isi && <p className="mt-1 font-sans text-xs text-danger">{errors.isi.message}</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600">BATAL</button>
            <button type="submit" disabled={isPending}
              className="flex-1 rounded-xl bg-navy-900 py-3.5 font-sans text-body font-semibold text-champagne-100 disabled:opacity-50">
              {isPending ? 'MENYIMPAN...' : 'SIMPAN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── StatusAksiPanel ──────────────────────────────────────────────────────────
function StatusAksiPanel({ status, statusSebelum, kodeId, navigate,
  onKonfirmasiEstimasi, onLanjutProsesPotong, onBatalkan,
  onLanjutDariBatalkan, onMulaiInputBP, onLanjutKeNota, isPending }) {
  if (!status) return null

  const btn = (label, onClick, variant = 'primary') => (
    <button key={label} onClick={onClick} disabled={isPending}
      className={['flex-1 rounded-xl py-3 font-sans text-label font-semibold disabled:opacity-50 transition-colors',
        variant === 'primary'   ? 'bg-gold-500 text-navy-900' :
        variant === 'secondary' ? 'border border-border text-charcoal-600 bg-surface' :
        variant === 'danger'    ? 'border border-danger text-danger' : '',
      ].join(' ')}>
      {isPending ? '...' : label}
    </button>
  )

  const rows = []

  if (status === 'estimasi_pemakaian') {
    rows.push(<div key="est" className="flex gap-2">{btn('KONFIRMASI ESTIMASI', onKonfirmasiEstimasi)}</div>)
  }
  if (status === 'konfirmasi_pemakaian') {
    rows.push(<div key="konfirm" className="flex gap-2">
      {btn('MULAI POTONG', onLanjutProsesPotong)}
      {btn('BATALKAN', onBatalkan, 'danger')}
    </div>)
  }
  if (status === 'proses_potong') {
    rows.push(<div key="potong" className="flex gap-2">{btn('INPUT BUKU POTONG', onMulaiInputBP)}</div>)
  }
  if (status === 'input_buku_potong') {
    rows.push(<div key="bp" className="flex gap-2">
      <button onClick={() => navigate('/kode/' + kodeId + '/buku-potong')}
        className="flex-1 rounded-xl bg-gold-500 py-3 font-sans text-label font-semibold text-navy-900">
        LANJUTKAN BUKU POTONG
      </button>
    </div>)
  }
  if (status === 'input_nota') {
    rows.push(<div key="nota" className="flex gap-2">
      {btn('BUAT / LIHAT NOTA BIAYA', onLanjutKeNota)}
    </div>)
  }
  if (status === 'dibatalkan' && statusSebelum) {
    rows.push(<div key="batal" className="flex gap-2">{btn('REVISI & LANJUTKAN', onLanjutDariBatalkan)}</div>)
  }

  if (rows.length === 0) return null
  return <div className="px-4 py-3 border-t border-white/10 space-y-2">{rows}</div>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-champagne-100">
      <p className="font-sans text-body text-charcoal-300">MEMUAT...</p>
    </div>
  )
}

function ErrorScreen({ onBack }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-champagne-100 px-4">
      <p className="font-sans text-body text-charcoal-600 text-center">Kode tidak ditemukan atau gagal dimuat.</p>
      <button onClick={onBack} className="rounded-xl bg-navy-900 px-6 py-3 font-sans text-body font-semibold text-champagne-100">
        KEMBALI
      </button>
    </div>
  )
}
