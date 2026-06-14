// Sumber kebenaran: architecture.md § Kalkulasi Bisnis (Client-side)
//                   & CLAUDE.md § Aturan Bisnis Kritis → HPP
//
// Semua kalkulasi HPP dilakukan di client saat Deera mengisi form HPP,
// lalu hasilnya di-snapshot (frozen) ke kolom JSONB `hpp` saat disubmit —
// nota/bahan baru setelahnya TIDAK boleh mengubah HPP yang sudah approved.

import { konversiKeYard } from './konversiSatuan'

/**
 * @typedef {{ yardTerpakai: number }} BahanWarna
 * @typedef {{ ukuran_list: { warnas: { jumlahPcs: number }[] }[] }} KodeRingkas
 */

// ── BAHAN PRIMER ───────────────────────────────────────────────────────────
// HPP primer/pcs = (Σ yard terpakai semua warna × harga/yard) ÷ total pcs SEMUA kode
// dalam produksi (bukan cuma 1 kode) — primer dipakai bersama lintas kode.

/**
 * @param {BahanWarna[]} bahanWarnas
 * @returns {number} total yard primer yang sudah terpakai (semua warna)
 */
export function totalYardPrimerTerpakai(bahanWarnas) {
  return bahanWarnas.reduce((s, w) => s + w.yardTerpakai, 0)
}

/**
 * @param {KodeRingkas[]} kodeList
 * @returns {number} total pcs gabungan seluruh ukuran × warna × kode dalam 1 produksi
 */
export function totalPcsProduksi(kodeList) {
  return kodeList.reduce(
    (s, k) =>
      s +
      k.ukuran_list.reduce(
        (su, u) => su + u.warnas.reduce((sw, w) => sw + w.jumlahPcs, 0),
        0
      ),
    0
  )
}

/**
 * @param {{ yardTerpakai: number }[]} bahanWarnas
 * @param {number} hargaPerYard
 * @param {number} totalPcs  hasil dari totalPcsProduksi()
 * @returns {number} nilai bahan primer per pcs (Rp)
 */
export function nilaiBahanPrimerPerPcs(bahanWarnas, hargaPerYard, totalPcs) {
  if (!totalPcs) return 0
  return (totalYardPrimerTerpakai(bahanWarnas) * hargaPerYard) / totalPcs
}

// ── BAHAN SEKUNDER ─────────────────────────────────────────────────────────
// HPP sekunder/pcs = konsumsi per pcs (dikonversi ke yard) × harga/yard.
// PENTING: TIDAK dikalikan total pcs — nilai ini sudah per 1 pcs.

/**
 * @param {number} konsumsiPerPcs  input Deera, dlm satuan asal (meter/cm/yard)
 * @param {'meter'|'cm'|'yard'|'panel'} satuanKonsumsi
 * @param {number} hargaPerYard
 * @returns {number} nilai bahan sekunder per pcs (Rp)
 */
export function nilaiBahanSekunderPerPcs(konsumsiPerPcs, satuanKonsumsi, hargaPerYard) {
  const konsumsiYard = konversiKeYard(konsumsiPerPcs, satuanKonsumsi)
  return konsumsiYard * hargaPerYard
}

/**
 * Estimasi sisa bahan sekunder (milik Jihan — selalu ditampilkan utk transparansi).
 * @param {number} jumlahDibeli       produksi_bahan.jumlahDibeli (yard/panel diterima dari Jihan)
 * @param {number} konsumsiPerPcsYard konsumsi per pcs yg SUDAH dikonversi ke yard
 * @param {number} totalPcs
 * @returns {number} sisaYard (boleh negatif → estimasi kurang, perlu bahan tambahan)
 */
export function sisaBahanSekunder(jumlahDibeli, konsumsiPerPcsYard, totalPcs) {
  return jumlahDibeli - konsumsiPerPcsYard * totalPcs
}

// ── BAHAN BAKU DARI NOTA ───────────────────────────────────────────────────
// Item nota untuk SATU kode → qty/nilai dipakai penuh utk kode tsb.

/**
 * @param {number} qtyDibeli
 * @param {number} hargaSatuan
 * @param {number} totalPcsKode
 * @returns {number} cost per pcs (unit-based, mis. resleting/kancing)
 */
export function nilaiBahanBakuUnitPerPcs(qtyDibeli, hargaSatuan, totalPcsKode) {
  if (!totalPcsKode) return 0
  return (qtyDibeli / totalPcsKode) * hargaSatuan
}

/**
 * @param {number} totalNilaiPembelian
 * @param {number} totalPcsKode
 * @returns {number} cost per pcs (usage-based, mis. benang)
 */
export function nilaiBahanBakuUsagePerPcs(totalNilaiPembelian, totalPcsKode) {
  if (!totalPcsKode) return 0
  return totalNilaiPembelian / totalPcsKode
}

/**
 * Alokasi proporsional utk item nota yg dibeli utk BEBERAPA kode sekaligus.
 * Basis 1:1 terhadap pcs; sisa (qty − Σpcs) dibagi rata ke semua kode terlibat.
 *
 * Contoh dari CLAUDE.md: beli 30pcs resleting utk kode A (10 pcs) & B (18 pcs)
 * → A dapat alokasi 10, B dapat 18, sisa 2 dibagi rata → A=11, B=19.
 *
 * @param {number} qtyDibeli
 * @param {number} hargaSatuan
 * @param {{ kodeId: string, totalPcs: number }[]} kodeList
 * @returns {{ kodeId: string, qtyAlokasi: number, costPerPcs: number }[]}
 */
export function alokasikanBahanBakuUnitLintasKode(qtyDibeli, hargaSatuan, kodeList) {
  const totalPcsGabungan = kodeList.reduce((s, k) => s + k.totalPcs, 0)
  const sisa = qtyDibeli - totalPcsGabungan
  const sisaPerKode = sisa > 0 ? sisa / kodeList.length : 0

  return kodeList.map((k) => {
    const qtyAlokasi = k.totalPcs + sisaPerKode
    return {
      kodeId: k.kodeId,
      qtyAlokasi,
      costPerPcs: k.totalPcs ? (qtyAlokasi / k.totalPcs) * hargaSatuan : 0,
    }
  })
}

/**
 * Versi usage-based dari alokasi lintas kode — pola sama, tapi memakai
 * proporsi NILAI (bukan qty). `hargaSatuan` tidak relevan di sini.
 *
 * @param {number} totalNilaiPembelian
 * @param {{ kodeId: string, totalPcs: number }[]} kodeList
 * @returns {{ kodeId: string, nilaiAlokasi: number, costPerPcs: number }[]}
 */
export function alokasikanBahanBakuUsageLintasKode(totalNilaiPembelian, kodeList) {
  const totalPcsGabungan = kodeList.reduce((s, k) => s + k.totalPcs, 0)
  if (!totalPcsGabungan) return kodeList.map((k) => ({ kodeId: k.kodeId, nilaiAlokasi: 0, costPerPcs: 0 }))

  // proporsi nilai = proporsi pcs terhadap total pcs gabungan (basis sama dgn unit-based)
  return kodeList.map((k) => {
    const proporsi = k.totalPcs / totalPcsGabungan
    const nilaiAlokasi = totalNilaiPembelian * proporsi
    return {
      kodeId: k.kodeId,
      nilaiAlokasi,
      costPerPcs: k.totalPcs ? nilaiAlokasi / k.totalPcs : 0,
    }
  })
}

// ── HPP JASA & TOTAL ───────────────────────────────────────────────────────

/**
 * @param {{ nilai: number }[]} jasaKomponen  upah, overhead, staff, + custom
 * @returns {number}
 */
export function totalHppJasa(jasaKomponen) {
  return jasaKomponen.reduce((s, k) => s + k.nilai, 0)
}

/**
 * @param {{
 *   hppJasa: number,
 *   nilaiBahanPrimer: number,
 *   nilaiBahanSekunder: number[],
 *   nilaiBahanBaku: number[],
 * }} parts
 * @returns {number} Total HPP per pcs — breakdown HARUS tetap ditampilkan terpisah
 *                   di UI (jangan digabung jadi satu angka, lihat CLAUDE.md "Hard Rules")
 */
export function totalHppPerBaju({ hppJasa, nilaiBahanPrimer, nilaiBahanSekunder, nilaiBahanBaku }) {
  const sekunder = nilaiBahanSekunder.reduce((s, n) => s + n, 0)
  const baku = nilaiBahanBaku.reduce((s, n) => s + n, 0)
  return hppJasa + nilaiBahanPrimer + sekunder + baku
}

/**
 * @param {number} hargaJualTarget
 * @param {number} totalHppPerBajuValue
 * @returns {number} margin dalam persen
 */
export function hitungMargin(hargaJualTarget, totalHppPerBajuValue) {
  if (!hargaJualTarget) return 0
  return ((hargaJualTarget - totalHppPerBajuValue) / hargaJualTarget) * 100
}

// ── JUMLAH AKHIR TERKIRIM (per warna → per kode) ──────────────────────────
// Granularitas per warna penting utk UI rencana pengiriman (lihat wireframe S-17b).

/**
 * @param {{ id: string, jumlahPcs: number }} kodeUkuranWarna
 * @param {{ nasib: string, pcsReject: number, trackingProduksi: { kodeUkuranWarnaId: string } }[]} rejects
 * @returns {number}
 */
export function jumlahAkhirDikirimPerWarna(kodeUkuranWarna, rejects) {
  const wasteWarna = rejects
    .filter(
      (r) =>
        r.nasib === 'waste' &&
        r.trackingProduksi.kodeUkuranWarnaId === kodeUkuranWarna.id
    )
    .reduce((s, r) => s + r.pcsReject, 0)
  return kodeUkuranWarna.jumlahPcs - wasteWarna
}

/**
 * @param {number} totalPcsKode
 * @param {{ nasib: string, pcsReject: number }[]} rejects  semua reject milik kode ini
 * @returns {number} jumlahAkhirDikirim = totalPcs − totalWaste
 */
export function jumlahAkhirDikirim(totalPcsKode, rejects) {
  const totalWaste = rejects.filter((r) => r.nasib === 'waste').reduce((s, r) => s + r.pcsReject, 0)
  return totalPcsKode - totalWaste
}

/**
 * @param {{ statusApproval: string, items: { jumlahPcs: number }[] }[]} pengirimanList
 * @returns {number} total pcs yg sudah terkirim & disetujui Jihan
 */
export function totalTerkirim(pengirimanList) {
  return pengirimanList
    .filter((p) => p.statusApproval === 'disetujui')
    .reduce((s, p) => s + p.items.reduce((si, i) => si + i.jumlahPcs, 0), 0)
}

/**
 * @param {number} totalTerkirimValue
 * @param {number} jumlahAkhirDikirimValue
 * @returns {boolean} true → kode boleh berstatus 'selesai'
 */
export function cekSudahSelesai(totalTerkirimValue, jumlahAkhirDikirimValue) {
  return totalTerkirimValue >= jumlahAkhirDikirimValue
}

// ── KASBON — SALDO & POTONGAN OTOMATIS ─────────────────────────────────────
// Saldo bersifat GLOBAL (lintas semua produksi/kode), ledger tunggal gabungan
// entri 'masuk' (manual, Deera) & 'potongan_otomatis' (sistem, saat kode→selesai).

/**
 * @param {{ tipe: 'masuk'|'potongan_otomatis', nominal: number }[]} kasbonList
 * @returns {number} saldoKasbon = Σ(masuk) − Σ(potongan_otomatis)
 */
export function hitungSaldoKasbon(kasbonList) {
  return kasbonList.reduce((saldo, entri) => {
    const delta = entri.tipe === 'masuk' ? entri.nominal : -entri.nominal
    return saldo + delta
  }, 0)
}

/**
 * Histori dgn saldo berjalan per entri, urut waktu naik — utk tampilan ledger.
 * @param {{ tipe: string, nominal: number, createdAt: string }[]} kasbonList
 * @returns {Array<typeof kasbonList[number] & { saldoSetelah: number }>}
 */
export function historiDenganSaldoBerjalan(kasbonList) {
  let saldo = 0
  return [...kasbonList]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((entri) => {
      saldo += entri.tipe === 'masuk' ? entri.nominal : -entri.nominal
      return { ...entri, saldoSetelah: saldo }
    })
}

/**
 * Bentuk entri "potongan_otomatis" — DIPANGGIL OLEH TRIGGER DI DATABASE
 * (lihat 0013_business_logic_triggers.sql), bukan dari client. Fungsi ini
 * disediakan di sini hanya sbg referensi/dokumentasi nilai yg dihasilkan,
 * mis. utk preview di UI sebelum status kode benar-benar berubah → 'selesai'.
 *
 * Entri hasil ini FINAL — tidak bisa diedit/dihapus siapapun (di-guard di DB).
 *
 * @param {{ id: string, kodeProduk: string, hpp: { totalHPPPerBaju: number } }} kode
 * @param {number} jumlahAkhirDikirimValue
 * @returns {{ tanggal: Date, tipe: 'potongan_otomatis', nominal: number, kodeId: string, catatan: string, createdBy: null }}
 */
export function previewPotonganKasbonOtomatis(kode, jumlahAkhirDikirimValue) {
  const nilaiPotongan = kode.hpp.totalHPPPerBaju * jumlahAkhirDikirimValue
  return {
    tanggal: new Date(),
    tipe: 'potongan_otomatis',
    nominal: nilaiPotongan,
    kodeId: kode.id,
    catatan: `POTONGAN OTOMATIS — ${kode.kodeProduk} SELESAI (${jumlahAkhirDikirimValue} PCS × ${kode.hpp.totalHPPPerBaju})`,
    createdBy: null,
  }
}
