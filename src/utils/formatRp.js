// Sumber kebenaran: CLAUDE.md § Konvensi Kode → Format Mata Uang
// Format angka di seluruh aplikasi SELALU "Rp 85.000" (titik sbg pemisah ribuan, locale id-ID).

/**
 * @param {number} n
 * @returns {string} mis. "Rp 85.000"
 */
export function formatRp(n) {
  return 'Rp ' + Number(n ?? 0).toLocaleString('id-ID')
}
