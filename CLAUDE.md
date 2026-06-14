# CLAUDE.md — Jihan Production

Dokumen ini adalah referensi konteks proyek untuk Claude. Berisi keputusan desain, aturan bisnis, dan konvensi yang harus diikuti secara konsisten di seluruh codebase.

---

## Tentang Proyek

Jihan Production adalah platform manajemen operasional produksi gamis. Dua pihak terlibat:

- **Deera** — produsen, mengelola seluruh operasional dan input data
- **Jihan** — klien, memantau progress dan memberi keputusan approve/tolak

Model bisnis: **beli putus** (Jihan bayar setelah barang jadi). Bahan baku **selalu dari Jihan**, bukan dari Deera. Pembayaran final terjadi di luar sistem — **kecuali Kasbon**, yang dicatat di sistem sebagai saldo berjalan (lihat bagian "Kasbon" & Terminologi) karena sering terjadi dan butuh transparansi dua arah.

---

## Terminologi

| Istilah | Definisi |
|---------|----------|
| **Produksi** | Satu batch produksi berisi 1+ kode. Sebelumnya disebut "order" atau "gelaran". |
| **Kode** | Identitas desain, format `J-001-IMA`. Satu produksi bisa punya beberapa kode. |
| **Ukuran** | Varian ukuran dalam satu kode. 4 pilihan tetap: MIDI, GAMIS, MIDI JUMBO, GAMIS JUMBO. |
| **Warna** | Varian warna dalam satu produksi. Tracking buku potong dilakukan per warna per ukuran per kode. |
| **Gelaran** | Istilah fisik: berapa lapis bahan yang digelar saat potong. Bukan entitas sistem. |
| **Bahan Primer** | Bahan motif utama yang menentukan jumlah pcs. Tiap warna dihabiskan semua. |
| **Bahan Sekunder** | Bahan polos, puring, dll yang mengikuti pcs dari bahan primer. Ada rate konsumsi per pcs. |
| **Bahan Baku** | Aksesori produksi: resleting, benang, kancing, hangtag, dll. Dari nota pembelian. |
| **Nota** | Catatan pembelian bahan baku. Bisa untuk 1 atau beberapa kode sekaligus. |
| **Surat Jalan** | Dokumen penerimaan bahan dari Jihan. Input manual Deera saat bahan datang. |
| **HPP Jasa** | Biaya jasa yang Deera tagihkan ke Jihan: upah, overhead, staff. |
| **HPP Per Baju** | Total cost per pcs untuk referensi harga jual Jihan: HPP Jasa + bahan + bahan baku. |
| **Kasbon** | Dana yang diminta Deera ke Jihan di luar sistem (DP/kasbon untuk kebutuhan produksi), lalu nominalnya dicatat Deera ke sistem sebagai saldo berjalan — otomatis terpotong saat kode selesai. Satu-satunya bentuk "uang" yang dicatat sistem (lihat bagian "Kasbon"). |

---

## Role & Hak Akses

| Role | Kode | Hak Akses |
|------|------|-----------|
| Tim Deera | `deera` | Full CRUD semua data, lihat activity log, kelola template HPP, kelola akun pengguna |
| Tim Jihan | `jihan` | Read-only semua data + approve/tolak sampel & HPP + tambah catatan sampel |

---

## Sistem Kode Produk

Format kode: **`J-[nomor]-[kode bahan]`**

| Bagian | Keterangan | Contoh |
|--------|-----------|--------|
| `J` | Prefix tetap | `J` |
| `[nomor]` | 3 digit, **global sequential**, tidak restart per bahan | `001`, `002`, `015` |
| `[kode bahan]` | 3 huruf singkatan bahan, input manual Deera | `IMA`, `KAT`, `RAY` |

Nomor **tidak restart** ketika bahan berbeda. Input manual oleh Deera. Sistem hanya validasi keunikan.

---

## Hierarki Entitas

```
Produksi
 ├── Surat Jalan (penerimaan bahan dari Jihan)
 ├── Bahan[] (dari Jihan)
 │    ├── Primer (motif): warna[], tiap warna punya yard
 │    │    └── [namaWarna, yardTersedia, yardTerpakai]
 │    └── Sekunder (polos, puring, dll): konsumsi per pcs + harga
 └── Kode[] (J-001-IMA, J-002-IMA, dll)
      ├── Ukuran[] → [MIDI, GAMIS, MIDI JUMBO, GAMIS JUMBO]
      │    └── Warna[] → [namaWarna, jumlahPcs] ← dari buku potong
      ├── Sampel[] (histori, termasuk yang ditolak)
      ├── HPP (frozen setelah approve)
      │    ├── jasaKomponen[] (upah, overhead, staff + custom per produksi)
      │    ├── nilaiBahanPrimer (calculated)
      │    ├── nilaiBahanSekunder[] (per bahan sekunder, calculated)
      │    ├── bahanBaku[] (dari nota, per kode — alokasi proporsional jika lintas kode)
      │    └── revisi[] (histori nilai lama vs baru, jika direvisi)
      ├── Tracking per tahap (per ukuran, per warna)
      │    ├── dipotong
      │    ├── dijahit
      │    ├── finishing
      │    └── siapKirim
      └── Pengiriman[] (bisa bertahap/parsial, perlu approval Jihan)
           └── [tanggal, warna, jumlahPcs, statusApproval]
```

---

## Aturan Bisnis Kritis

### Bahan & Warna

**Bahan Primer (Motif):**
- Menentukan jumlah pcs. Tiap warna dihabiskan semua yard-nya.
- Pcs per warna = floor(yardTersedia / konsumsiPerPcs) → aktual dari buku potong
- HPP Primer/pcs = `(total semua yard terpakai × harga/yard) ÷ total pcs semua kode`

**Bahan Sekunder (Polos, Puring, dll):**
- Mengikuti pcs dari primer. Punya rate konsumsi tetap dari pola.
- Rate diinput saat HPP (misal: 3.35m per 2 baju = 1.675m/pcs → convert ke yard)
- HPP Sekunder/pcs = `konsumsiPerPcs (yard) × harga/yard` ← **tidak dikalikan total pcs**
- **Sisa bahan dicatat**: `sisaYard = jumlahDibeli − (konsumsiPerPcs × totalPcs)` → ditampilkan sebagai estimasi sisa (bahan ini milik Jihan, transparansi penting). Catatan: `jumlahDibeli` di sini adalah jumlah yard/panel sekunder yang diterima dari Jihan (kolom `produksi_bahan.jumlahDibeli`) — berbeda dari `yardTersedia` yang khusus dipakai untuk primer per warna (`produksi_bahan_warna.yardTersedia`)

**Satuan:**
- Kain lebar: **yard**, harga per yard
- Panel (bordir, renda): **panel**, harga per panel
- Konverter tersedia: meter → yard, cm → yard

### HPP

**HPP Jasa** (tagihan Deera ke Jihan, per pcs, sama untuk semua kode dalam 1 produksi):
- Komponen: Upah Produksi, Overhead/Profit Deera, Staff + custom per produksi
- Template global menyimpan range min–max per komponen
- Custom komponen bisa ditambah per produksi

**HPP Per Baju** (referensi harga jual Jihan, full breakdown):
```
HPP Jasa               = upah + overhead + staff + custom
Nilai Bahan Primer     = (Σ yard terpakai × harga/yard) ÷ total pcs
Nilai Bahan Sekunder[] = konsumsi/pcs × harga/yard  (per bahan)
Bahan Baku             = dari nota (unit-based + usage-based)
──────────────────────────────────────────────────────
Total HPP / pcs
```

**Bahan Baku dari Nota:**
- Nota bisa untuk 1 kode atau beberapa kode sekaligus
- **Item nota untuk 1 kode**: qty/nilai dipakai penuh untuk kode tsb
  - Unit-based: qty dibeli ÷ total pcs kode = qty/pcs × harga = cost/pcs
  - Usage-based: total nilai pembelian ÷ total pcs kode = cost/pcs
- **Item nota lintas beberapa kode (alokasi proporsional)**:
  - Tiap kode dialokasikan qty = total pcs kode tsb (basis 1:1 terhadap pcs)
  - Sisa dari qty dibeli (setelah dikurangi total pcs semua kode terlibat) **dibagi rata** ke kode-kode tsb
  - Contoh: beli 30pcs resleting untuk kode A (10 pcs baju) dan kode B (18 pcs baju) → A dapat alokasi 10, B dapat 18, sisa 2 dibagi rata (A +1, B +1) → A = 11pcs, B = 19pcs
  - Cost/pcs kode = (qty alokasi kode × harga) ÷ total pcs kode
  - Usage-based mengikuti pola yang sama menggunakan proporsi nilai, bukan qty
- HPP frozen setelah disetujui Jihan — nota baru tidak mempengaruhi HPP yang sudah approved

**Histori Revisi HPP:**
- Setiap kali Deera mengubah nilai HPP (misal setelah ditolak Jihan), sistem mencatat **nilai lama vs nilai baru per komponen** beserta timestamp & siapa yang mengubah
- Histori ini terlihat oleh Deera maupun Jihan saat review ulang — bukan cuma versi terbaru

### Status Flow Per Kode
```
sampel_dibuat
  → review_sampel (upload 2 foto)
    → [tolak] → sampel_dibuat
    → [approve Jihan]
      → estimasi_pemakaian
          (tim potong input: perkiraan yard primer/warna, konsumsi sekunder)
        → konfirmasi_pemakaian (siapapun update, biasanya via WA/tatap muka)
          → [estimasi terlalu besar] → dibatalkan
              → [direvisi & dilanjutkan kembali] → kembali ke status sebelum dibatalkan
          → proses_potong (eksekusi)
            → input_buku_potong
                (actual: yard primer/warna, pcs/warna/kode)
              → input_nota_bahan_baku
                  (Deera belanja, input nota ke sistem)
                → input_hpp
                    (sistem auto-hitung bahan dari buku potong + nota)
                  → review_hpp
                    → [tolak] → input_hpp (edit langsung)
                    → [approve Jihan]
                      → produksi (jahit → finishing, per warna per kode)
                        → siap_kirim (per kode)
                          → selesai
```

### Produksi & Reject
- Tracking per tahap, **per ukuran**, **per warna**, per kode
- 1 tukang jahit mengerjakan 1 warna → tracking dijahit per warna
- Ukuran yang tersedia: `MIDI` | `GAMIS` | `MIDI JUMBO` | `GAMIS JUMBO`
- HPP per pcs **sama** untuk semua ukuran dalam 1 produksi (tidak terpengaruh ukuran)
- Total pcs per ukuran = sum warna dari data buku potong
- Reject per tahap: nasib = `dipermak` | `produksi_ulang` | `waste`
  - `produksi_ulang` dengan bahan tidak tersedia → flag **"perlu bahan tambahan"** dicatat di sistem & dinotifikasi (lihat Notifikasi)
- `jumlahAkhirDikirim = jumlahPcs - totalWaste` (per kode per ukuran per warna)

### Pengiriman Parsial
- 1 kode bisa dikirim **bertahap** (tidak harus menunggu semua warna/pcs selesai), selama **disetujui Jihan**
- Granularitas: per warna (mis. 4 dari 5 warna siap → kirim 4 dulu) atau per jumlah pcs dalam 1 warna (mis. 10 dari 30 pcs siap → kirim 10 dulu)
- Tiap pengiriman dicatat sebagai entri terpisah: tanggal, warna + jumlah pcs, status approval Jihan
- Kode berstatus `selesai` setelah **seluruh** `jumlahAkhirDikirim` (semua warna, dikurangi waste) sudah terkirim

### Kasbon
**Konsep:** Karena kebutuhan produksi, Deera bisa meminta dana dari Jihan (DP/kasbon) — **negosiasi & transfer terjadi di luar sistem** (WA/tatap muka, sesuai prinsip "pembayaran di luar sistem"). Yang dicatat di sistem hanyalah **nominal yang sudah diterima Deera**, sebagai pengecualian khusus terhadap aturan umum "jangan catat pembayaran" (lihat "Yang Tidak Boleh Dilakukan").

**Aturan:**
- **Saldo bersifat global** — satu akumulasi berjalan lintas semua produksi & kode (bukan per-produksi), seperti rekening berjalan antara Deera & Jihan
- **Tanpa alur request/approve** — Deera langsung input nominal yang diterima setelah dana cair di luar sistem; tidak ada status "menunggu konfirmasi Jihan"
- **Potongan otomatis saat kode `selesai`**: begitu sebuah kode mencapai status `selesai`, sistem otomatis mencatat entri "potongan" sebesar nilai HPP kode tsb (`HPP per pcs × jumlahAkhirDikirim`), mengurangi saldo kasbon — tanpa input manual
- **Histori tercatat sebagai ledger tunggal**: gabungan entri "masuk" (input manual Deera) dan "potongan otomatis" (sistem), berurutan berdasarkan waktu, masing-masing menampilkan saldo berjalan setelah entri tsb
- **Transparan dua arah**: Deera kelola penuh (tambah entri masuk; tidak bisa edit/hapus entri potongan otomatis — itu milik sistem), Jihan lihat read-only (histori lengkap + saldo terkini) — selaras prinsip transparansi seperti histori revisi HPP & perbandingan sampel
- **Bukan modul keuangan penuh**: tidak ada manajemen metode bayar, rekonsiliasi, laporan keuangan, atau pelunasan akhir — itu tetap di luar sistem dan di luar scope v1.0

**Formula saldo:**
```
saldoKasbon = Σ(nominal entri "masuk") − Σ(nominal entri "potongan_otomatis")
```

### Hapus Data (Soft Delete / Recycle Bin)
- Hapus → soft delete → masuk "Data Terhapus"
- Dari Data Terhapus: Restore atau Hapus Permanen (konfirmasi modal)
- Semua aksi hapus tercatat di activity log

### Notifikasi
| Event | Penerima |
|-------|----------|
| Sampel baru diupload | Tim Jihan |
| HPP siap direview | Tim Jihan |
| Estimasi pemakaian bahan diinput | Tim Jihan |
| Bahan aktual dikonfirmasi (buku potong) | Tim Jihan |
| Tiap tahap produksi selesai 100% | Tim Jihan |
| Kode siap kirim (penuh/sebagian) | Tim Jihan |
| Permintaan approval pengiriman sebagian | Tim Jihan |
| Kode selesai (seluruh pengiriman tuntas — termasuk info potongan kasbon otomatis, jika ada) | Tim Jihan |
| Kasbon baru dicatat oleh Deera | Tim Jihan |
| Sampel di-approve/ditolak | Tim Deera |
| HPP di-approve/ditolak | Tim Deera |
| Reject produksi_ulang — bahan tidak tersedia | Tim Jihan & Tim Deera |
| Kode dibatalkan | Tim Jihan |

**Catatan:** Tim Jihan dapat memilih mode notifikasi **real-time** atau **digest harian** (ringkasan terjadwal 1×/hari) di Pengaturan — lihat 7.9.

---

## Aturan Input (Global)

| Tipe Input | Aturan |
|-----------|--------|
| Text biasa | **Selalu uppercase** |
| Number | Slider + input manual sinkron dua arah. Nilai lama = **placeholder**, bukan pre-fill |
| Email | Default behavior |
| Password | Default behavior |
| Kode produk | Uppercase otomatis, format `J-[nomor]-[kode bahan]` |

---

## Prinsip UI/UX

- **Mobile-first** — layout dimulai dari layar 390px
- **Elegan & mewah** — brand fashion premium, bukan aplikasi gudang
- **Gaptek-friendly untuk Jihan** — tombol besar, teks jelas, pilihan minimal
- **Minim icon** — teks sebagai label utama; icon hanya jika benar-benar menambah kejelasan
- Warna base: deep navy / charcoal. Aksen: gold / champagne
- Format angka: selalu `Rp 85.000`
- Bahasa: **Indonesia saja**
- **Konfirmasi aksi destruktif**: langsung modal dengan form alasan, tidak ada "apakah yakin?" terpisah

---

## Konvensi Kode

### Penamaan
- Variabel & fungsi: `camelCase`
- Komponen React: `PascalCase`
- File komponen: `PascalCase.jsx`
- File utilitas: `camelCase.js`
- Konstanta global: `SCREAMING_SNAKE_CASE`

### Format Mata Uang
```js
function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}
```

### Status Enum
```js
const STATUS_KODE = {
  SAMPEL_DIBUAT:          'sampel_dibuat',
  REVIEW_SAMPEL:          'review_sampel',
  SAMPEL_DITOLAK:         'sampel_ditolak',
  SAMPEL_APPROVED:        'sampel_approved',
  ESTIMASI_PEMAKAIAN:     'estimasi_pemakaian',
  KONFIRMASI_PEMAKAIAN:   'konfirmasi_pemakaian',
  PROSES_POTONG:          'proses_potong',
  INPUT_BUKU_POTONG:      'input_buku_potong',
  INPUT_NOTA:             'input_nota',
  INPUT_HPP:              'input_hpp',
  REVIEW_HPP:             'review_hpp',
  HPP_DITOLAK:            'hpp_ditolak',
  HPP_APPROVED:           'hpp_approved',
  PRODUKSI:               'produksi',
  SIAP_KIRIM:             'siap_kirim',
  SELESAI:                'selesai',
  DIBATALKAN:             'dibatalkan', // dari konfirmasi_pemakaian (jika estimasi terlalu besar). Bisa direvisi → kembali ke status sebelum dibatalkan
};

const TIPE_BAHAN = {
  PRIMER:   'primer',   // motif, menentukan pcs
  SEKUNDER: 'sekunder', // polos/puring, mengikuti pcs
};

const SATUAN_BAHAN = {
  YARD:  'yard',
  PANEL: 'panel',
};

const UKURAN = {
  MIDI:        'MIDI',
  GAMIS:       'GAMIS',
  MIDI_JUMBO:  'MIDI JUMBO',
  GAMIS_JUMBO: 'GAMIS JUMBO',
};

const TIPE_BAHAN_BAKU = {
  UNIT:  'unit',   // resleting, kancing: qty ÷ pcs
  USAGE: 'usage',  // benang: nilai ÷ pcs
};

const NASIB_REJECT = {
  DIPERMAK:       'dipermak',
  PRODUKSI_ULANG: 'produksi_ulang', // jika bahanTersedia = false → flag "perlu bahan tambahan" tercatat & dinotifikasi
  WASTE:          'waste',
};

const ROLE = {
  DEERA: 'deera',
  JIHAN: 'jihan',
};

const TIPE_KASBON = {
  MASUK:            'masuk',             // input manual Deera — dana diterima dari Jihan
  POTONGAN_OTOMATIS:'potongan_otomatis', // auto dari sistem saat kode berstatus `selesai`
};
```

---

## Yang Tidak Boleh Dilakukan (Hard Rules)

- Jangan pernah hapus histori sampel — hanya ubah status menjadi `ditolak`
- Jangan gabungkan HPP Jasa dan Nilai Bahan menjadi satu angka tanpa breakdown
- Jangan izinkan Tim Jihan mengubah data apapun selain approve/tolak dan catatan sampel
- Jangan skip pencatatan nasib reject
- Jangan tampilkan activity log ke Tim Jihan
- Jangan catat pembayaran dalam sistem — **kecuali Kasbon** (lihat bagian "Kasbon"), satu-satunya pengecualian yang disengaja, dan sifatnya sebatas pencatatan saldo/histori, bukan pemrosesan pembayaran
- Jangan izinkan Tim Jihan mengubah/menghapus entri Kasbon — murni read-only seperti data lain
- Jangan gunakan nama produk — selalu gunakan kode `J-[nomor]-[kode bahan]`
- Jangan restart nomor urut kode — nomor global dan berlanjut
- HPP yang sudah di-approve tidak boleh berubah walau ada nota baru

---

## Out of Scope v1.0

- Manajemen pembayaran **secara umum** (rekonsiliasi, metode bayar, pelunasan akhir, dll) — Kasbon dikecualikan secara terbatas (lihat bagian "Kasbon"): hanya pencatatan nominal masuk + saldo berjalan, bukan pemrosesan pembayaran
- Chat / messaging dalam app
- Laporan keuangan
- Stok bahan milik Deera
- Integrasi marketplace
- Native mobile app
- Multi-klien
- Export / cetak data
- Template HPP per kategori
