// Shared kernel — progress bar tahap produksi.
// Mode pakai:
//   1. <ProduksiBar kodeId="..." />       — fetch tracking sendiri, tampil lengkap
//   2. <ProduksiBar kodeId="..." mini />  — fetch tracking sendiri, tampil compact (dot steps)
//   3. <ProduksiBar progresPerTahap={...} /> — static (data dari luar, tanpa fetch)

import { useTrackingByKode } from '../../features/tracking'
import { TAHAP_PRODUKSI } from '../../constants/enums'

const URUTAN_TAHAP = [
  TAHAP_PRODUKSI.DIPOTONG,
  TAHAP_PRODUKSI.DIJAHIT,
  TAHAP_PRODUKSI.FINISHING,
  TAHAP_PRODUKSI.SIAP_KIRIM,
]

const LABEL_TAHAP = {
  [TAHAP_PRODUKSI.DIPOTONG]:   'DIPOTONG',
  [TAHAP_PRODUKSI.DIJAHIT]:    'DIJAHIT',
  [TAHAP_PRODUKSI.FINISHING]:  'FINISHING',
  [TAHAP_PRODUKSI.SIAP_KIRIM]: 'SIAP KIRIM',
}

const LABEL_TAHAP_PENDEK = {
  [TAHAP_PRODUKSI.DIPOTONG]:   'POT',
  [TAHAP_PRODUKSI.DIJAHIT]:    'JAH',
  [TAHAP_PRODUKSI.FINISHING]:  'FIN',
  [TAHAP_PRODUKSI.SIAP_KIRIM]: 'KIRIM',
}

function hitungProgres(rows) {
  const progres = {}
  for (const tahap of URUTAN_TAHAP) {
    const rowsTahap = rows.filter((r) => r.tahap === tahap)
    if (rowsTahap.length === 0) { progres[tahap] = 0; continue }
    const totalPcs = rowsTahap.reduce((sum, r) => sum + (r.kode_ukuran_warna?.jumlah_pcs ?? 0), 0)
    const donePcs  = rowsTahap.reduce((sum, r) => sum + (r.pcs_done ?? 0), 0)
    progres[tahap] = totalPcs > 0 ? Math.round((donePcs / totalPcs) * 100) : 0
  }
  return progres
}

export function ProduksiBar({ kodeId, mini = false, progresPerTahap }) {
  const { data: trackingRows = [] } = useTrackingByKode(kodeId ?? null)
  const progres = progresPerTahap ?? (kodeId ? hitungProgres(trackingRows) : {})
  if (mini) return <ProduksiBarMini progresPerTahap={progres} />
  return <ProduksiBarFull progresPerTahap={progres} />
}

function ProduksiBarFull({ progresPerTahap }) {
  return (
    <div className="space-y-2">
      {URUTAN_TAHAP.map((tahap) => {
        const persen = Math.max(0, Math.min(100, progresPerTahap?.[tahap] ?? 0))
        return (
          <div key={tahap}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="font-sans text-label text-charcoal-600">{LABEL_TAHAP[tahap]}</span>
              <span className="font-sans text-label tabular-nums text-charcoal-300">{persen}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-champagne-200">
              <div className="h-full rounded-full bg-gold-500" style={{ width: persen + '%' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ProduksiBarMini({ progresPerTahap }) {
  return (
    <div className="flex items-center gap-1.5">
      {URUTAN_TAHAP.map((tahap, i) => {
        const persen    = progresPerTahap?.[tahap] ?? 0
        const selesai   = persen === 100
        const berjalan  = persen > 0 && persen < 100
        const prevDone  = i > 0 && (progresPerTahap?.[URUTAN_TAHAP[i - 1]] ?? 0) === 100
        return (
          <div key={tahap} className="flex items-center gap-1.5">
            {i > 0 && (
              <div className={['h-px w-3', selesai || prevDone ? 'bg-gold-500' : 'bg-champagne-200'].join(' ')} />
            )}
            <div className="flex flex-col items-center gap-0.5">
              <div className={[
                'flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold',
                selesai  ? 'bg-gold-500 text-navy-900'
                : berjalan ? 'border-2 border-gold-500 bg-transparent text-gold-500'
                : 'bg-champagne-200 text-charcoal-300',
              ].join(' ')}>
                {selesai ? '\u2713' : i + 1}
              </div>
              <span className="font-sans text-[8px] text-charcoal-300">{LABEL_TAHAP_PENDEK[tahap]}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
