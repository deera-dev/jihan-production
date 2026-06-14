// Sumber kebenaran: architecture.md § Konversi ke Yard
// Semua perhitungan bahan (HPP, sisa bahan, dll) memakai YARD sbg satuan dasar.
// Panel TIDAK dikonversi — selalu dihitung per panel.

const KONVERSI = {
  meterKeYard: (m) => m * 1.09361,
  cmKeYard:    (cm) => cm / 91.44,
  yardKeYard:  (y) => y, // no-op
}

/**
 * Konversi nilai dari satuan asal ke yard. Panel dikembalikan apa adanya.
 * @param {number} nilai
 * @param {'meter' | 'cm' | 'yard' | 'panel'} satuan
 * @returns {number}
 */
export function konversiKeYard(nilai, satuan) {
  return KONVERSI[`${satuan}KeYard`]?.(nilai) ?? nilai
}
