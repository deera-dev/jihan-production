// Shared kernel — breakdown HPP per pcs, dipakai di hpp, kode, dashboard,
// review Jihan, dll (≥3 slice).
//
// HARD RULE (CLAUDE.md): "Jangan gabungkan HPP Jasa dan Nilai Bahan menjadi
// satu angka tanpa breakdown" — komponen ini WAJIB selalu menampilkan rincian,
// tidak boleh disederhanakan jadi satu baris total saja.

import { formatRp } from '../../utils/formatRp'

/**
 * @param {{
 *   hppJasa: number,
 *   nilaiBahanPrimer: number,
 *   nilaiBahanSekunder: { nama: string, nilai: number }[],
 *   bahanBaku: { nama: string, nilai: number }[],
 *   total: number,
 * }} props
 */
export function HPPBreakdown({ hppJasa, nilaiBahanPrimer, nilaiBahanSekunder, bahanBaku, total }) {
  const Baris = ({ label, nilai, indent = false }) => (
    <div className={`flex items-baseline justify-between py-1.5 ${indent ? 'pl-4' : ''}`}>
      <span className="font-sans text-body text-charcoal-600">{label}</span>
      <span className="font-sans text-price tabular-nums text-navy-900">{formatRp(nilai)}</span>
    </div>
  )

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <Baris label="HPP JASA" nilai={hppJasa} />
      <Baris label="NILAI BAHAN PRIMER" nilai={nilaiBahanPrimer} />

      {nilaiBahanSekunder.map((b) => (
        <Baris key={b.nama} label={`BAHAN SEKUNDER — ${b.nama}`} nilai={b.nilai} indent />
      ))}

      {bahanBaku.map((b) => (
        <Baris key={b.nama} label={`BAHAN BAKU — ${b.nama}`} nilai={b.nilai} indent />
      ))}

      <div className="mt-2 flex items-baseline justify-between border-t border-border pt-3">
        <span className="font-sans text-button text-navy-900">TOTAL HPP / PCS</span>
        <span className="font-heading text-subheading tabular-nums text-navy-900">{formatRp(total)}</span>
      </div>
    </div>
  )
}
