// Shared kernel — kartu ringkasan satu Kode (J-001-IMA), dipakai di
// ProduksiDetailPage, dashboard, daftar pencarian, dll (≥3 slice).
// "Jangan gunakan nama produk — selalu gunakan kode" (CLAUDE.md Hard Rules).

import { Link } from 'react-router-dom'
import { StatusBadge } from './StatusBadge'

/**
 * @param {{
 *   kode: { id: string, kodeProduk: string, status: string, totalPcs?: number },
 * }} props
 */
export function KodeCard({ kode }) {
  return (
    <Link
      to={`/kode/${kode.id}`}
      className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-gold-500"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-heading text-subheading text-navy-900">{kode.kodeProduk}</span>
        <StatusBadge status={kode.status} />
      </div>
      {typeof kode.totalPcs === 'number' && (
        <p className="mt-1 font-sans text-label text-charcoal-300">{kode.totalPcs} PCS</p>
      )}
    </Link>
  )
}
