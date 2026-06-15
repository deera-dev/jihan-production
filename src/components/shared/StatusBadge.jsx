// Shared kernel — TAPI mengandung istilah bisnis (STATUS_KODE), sehingga
// tinggal di components/shared/ (bukan components/ui/) per architecture.md
// § Prinsip Arsitektur Kode → Shared Kernel (dipakai ≥3 slice: kode, produksi,
// dashboard, tracking, dll).

import { Badge } from '../ui'
import { STATUS_KODE } from '../../constants/enums'

/** @type {Record<string, { label: string, tone: 'navy'|'gold'|'success'|'danger'|'warning'|'info'|'neutral' }>} */
const TAMPILAN_STATUS = {
  [STATUS_KODE.SAMPEL_DIBUAT]: { label: 'SAMPEL DIBUAT', tone: 'neutral' },
  [STATUS_KODE.REVIEW_SAMPEL]: { label: 'REVIEW SAMPEL', tone: 'info' },
  [STATUS_KODE.SAMPEL_DITOLAK]: { label: 'SAMPEL DITOLAK', tone: 'danger' },
  [STATUS_KODE.SAMPEL_APPROVED]: { label: 'SAMPEL DISETUJUI', tone: 'success' },
  [STATUS_KODE.ESTIMASI_PEMAKAIAN]: { label: 'ESTIMASI PEMAKAIAN', tone: 'info' },
  [STATUS_KODE.KONFIRMASI_PEMAKAIAN]: { label: 'KONFIRMASI PEMAKAIAN', tone: 'info' },
  [STATUS_KODE.PROSES_POTONG]: { label: 'PROSES POTONG', tone: 'gold-outline' },
  [STATUS_KODE.INPUT_BUKU_POTONG]: { label: 'INPUT BUKU POTONG', tone: 'gold-outline' },
  [STATUS_KODE.INPUT_NOTA]: { label: 'INPUT NOTA', tone: 'gold-outline' },
  [STATUS_KODE.INPUT_HPP]: { label: 'INPUT HPP', tone: 'gold-outline' },
  [STATUS_KODE.REVIEW_HPP]: { label: 'REVIEW HPP', tone: 'gold-outline' },
  [STATUS_KODE.HPP_DITOLAK]: { label: 'HPP DITOLAK', tone: 'danger' },
  [STATUS_KODE.HPP_APPROVED]: { label: 'HPP DISETUJUI', tone: 'success' },
  [STATUS_KODE.PRODUKSI]: { label: 'PRODUKSI', tone: 'navy' },
  [STATUS_KODE.SIAP_KIRIM]: { label: 'SIAP KIRIM', tone: 'gold-outline' },
  [STATUS_KODE.SELESAI]: { label: 'SELESAI', tone: 'success' },
  [STATUS_KODE.DIBATALKAN]: { label: 'DIBATALKAN', tone: 'danger' },
}

/**
 * @param {{ status: string, className?: string }} props
 */
export function StatusBadge({ status, className = '' }) {
  const tampilan = TAMPILAN_STATUS[status] ?? { label: status?.toUpperCase() ?? '—', tone: 'neutral' }
  return (
    <Badge tone={tampilan.tone} className={className}>
      {tampilan.label}
    </Badge>
  )
}
