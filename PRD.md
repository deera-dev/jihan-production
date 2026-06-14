# PRD — Jihan Production
**Sistem Manajemen Operasional Gamis**
Versi 2.0 · Juni 2026 · Kerjasama Deera & Jihan

---

## 1. Ringkasan Eksekutif

Jihan Production adalah platform manajemen operasional berbasis web yang mengelola alur produksi gamis antara **Deera** (produsen) dan **Jihan** (klien). Sistem menjamin transparansi 100% di setiap tahap — dari penerimaan bahan, pembuatan sampel, kalkulasi HPP, hingga pengiriman barang jadi.

Model bisnis: **beli putus** — Jihan membayar setelah barang selesai. Seluruh bahan baku selalu disuplai oleh Jihan. Pembayaran final dilakukan di luar sistem — kecuali **Kasbon** (DP/dana operasional yang sering diminta Deera ke Jihan), yang nominalnya dicatat di sistem sebagai saldo berjalan demi transparansi dua arah (lihat bagian 7.x Kasbon).

---

## 2. Tujuan Produk

- **Transparansi penuh** — Jihan memantau setiap detail produksi secara real-time tanpa perlu tanya manual ke Deera.
- **Efisiensi komunikasi** — Tim Deera memiliki satu sistem terpusat, mengurangi komunikasi berulang via WhatsApp.
- **Pengambilan keputusan** — Kalkulasi HPP yang akurat membantu Jihan menentukan harga jual pasar sebelum komit ke produksi massal.

---

## 3. Pengguna

### Tim Deera (Full Access)
Produsen — Deera dan seluruh tim operasionalnya. Satu-satunya pihak yang menginput data ke sistem. Dapat melihat activity log.

### Tim Jihan (View + Tindakan Terbatas)
Klien — Jihan dan tim bisnisnya. Hanya memantau data. Dapat memberikan approve/tolak pada sampel dan HPP, serta menambah catatan pada sampel. Antarmuka dirancang sangat simpel karena Tim Jihan dikategorikan sebagai pengguna awam teknologi.

---

## 4. Terminologi

| Istilah | Definisi |
|---------|----------|
| Produksi | Batch produksi berisi 1+ kode |
| Kode | Identitas desain: `J-001-IMA` |
| Ukuran | Varian ukuran dalam kode: MIDI, GAMIS, MIDI JUMBO, GAMIS JUMBO |
| Warna | Varian warna. Buku potong mencatat pcs per warna per ukuran per kode |
| Bahan Primer | Bahan motif — menentukan pcs. Tiap warna dihabiskan semua |
| Bahan Sekunder | Bahan polos/puring — mengikuti pcs primer. Rate konsumsi tetap dari pola |
| Bahan Baku | Aksesori produksi: resleting, benang, kancing, dll. Dari nota pembelian |
| Nota | Catatan pembelian bahan baku. Bisa untuk 1+ kode |
| Surat Jalan | Bukti penerimaan bahan dari Jihan. Input Deera saat bahan datang |
| HPP Jasa | Biaya jasa Deera ke Jihan: upah, overhead, staff |
| HPP Per Baju | Total cost per pcs: HPP Jasa + nilai bahan + bahan baku |

---

## 5. Sistem Kode Produk

Format: **`J-[nomor]-[kode bahan]`**

- `J` — prefix tetap
- `[nomor]` — 3 digit, global sequential, tidak restart per bahan
- `[kode bahan]` — 3 huruf singkatan bahan, input manual Deera

Contoh urutan: `J-001-IMA`, `J-002-IMA`, `J-003-KAT`, `J-004-KAT`

---

## 6. Alur Bisnis Per Kode

| # | Tahap | Deskripsi | Dilakukan Oleh |
|---|-------|-----------|----------------|
| 1 | Bahan Masuk | Jihan kirim bahan. Deera input surat jalan: jenis bahan, warna, yard/warna | Tim Deera |
| 2 | Sampel | Deera buat sampel dari bahan, upload 2 foto (depan + belakang) | Tim Deera |
| 3 | Review Sampel | Jihan lihat foto, beri feedback, approve atau tolak | Tim Jihan |
| 4 | Estimasi Pemakaian | Tim potong hitung perkiraan yard primer/warna, konsumsi sekunder per pcs | Tim Deera |
| 5 | Konfirmasi Pemakaian | Jihan dikabari. Jika angka terlalu besar, desain diubah **atau kode dibatalkan** (status `dibatalkan`, bisa direvisi & dilanjutkan kembali). Konfirmasi via WA/tatap muka, siapapun bisa input | Deera / Jihan |
| 6 | Proses Potong | Tim potong eksekusi | Tim Deera |
| 7 | Input Buku Potong | Input data aktual: yard primer per warna, pcs per warna per ukuran per kode | Tim Deera |
| 8 | Belanja Bahan Baku | Deera belanja resleting, benang, dll. Input nota ke sistem (alokasi proporsional jika 1 nota untuk beberapa kode) | Tim Deera |
| 9 | Input HPP | Sistem auto-hitung nilai bahan + bahan baku. Deera input HPP Jasa (slider). Tiap revisi tercatat histori (nilai lama vs baru) | Tim Deera |
| 10 | Review HPP | Jihan lihat breakdown lengkap HPP per baju + histori revisi, approve atau tolak | Tim Jihan |
| 11 | Produksi | Jahit → Finishing. Tracking per ukuran per warna per tahap | Tim Deera |
| 12 | Siap Kirim | Per kode, **bisa bertahap/parsial** (per warna atau per jumlah pcs) dengan persetujuan Jihan | Tim Deera |
| 13 | Selesai | Seluruh pengiriman kode tuntas. Sistem otomatis catat potongan saldo Kasbon (jika ada). Pembayaran final di luar sistem | Tim Deera |

---

## 7. Fitur Detail

### 7.1 Autentikasi & Akun

- Login email + password
- Invitation flow: Deera buat akun Jihan → email link aktivasi → Jihan set password
- Self-service ganti password
- Role ditetapkan saat akun dibuat (tidak bisa diubah sendiri)
- Session persisten

### 7.2 Manajemen Produksi & Kode

- Deera buat produksi baru: kode bahan (3 huruf), tanggal, catatan
- Dalam satu produksi, tambah 1+ kode dengan format `J-[nomor]-[kode bahan]`
- Tiap kode punya: ukuran (pilih dari 4 opsi), harga jual target Jihan, catatan
- Kode dapat **dibatalkan** (status `dibatalkan`) jika estimasi pemakaian terlalu besar — bisa direvisi dan dilanjutkan kembali ke status sebelumnya
- Filter produksi: status + rentang tanggal
- Search berdasarkan kode atau kode bahan
- Hapus menggunakan recycle bin (soft delete → restore atau hapus permanen)

### 7.3 Surat Jalan & Bahan

Deera input saat bahan dari Jihan tiba:
- Nomor surat jalan, tanggal terima, nama pengirim
- Untuk setiap bahan: jenis, tipe (primer/sekunder), satuan (yard/panel), harga per satuan
- Untuk bahan primer: daftar warna + yard tersedia per warna
- Untuk bahan sekunder: konsumsi per pcs (input saat HPP, bukan saat terima bahan)

### 7.4 Manajemen Sampel

- 2 foto per sampel: depan + belakang
- Foto dapat dibagikan ke WhatsApp
- Catatan bisa ditambahkan oleh Tim Deera maupun Tim Jihan
- Revisi ringan → catatan, sampel tetap aktif
- Sampel ditolak → Deera upload ulang. Histori sampel lama tetap tersimpan
- Histori revisi dapat dilihat **berdampingan** (versi lama vs baru) untuk perbandingan cepat — lihat 7.13

### 7.5 Buku Potong

Setelah eksekusi potong, Deera input data aktual dari buku fisik:
- Per bahan primer: yard terpakai per warna
- Per kode per ukuran per warna: jumlah pcs yang dihasilkan

Dari data ini sistem dapat menghitung:
- Total pcs per ukuran per kode
- Total pcs seluruh produksi (untuk HPP bahan)

### 7.6 Nota & Katalog Bahan Baku

**Katalog bahan baku** — master list yang dikelola Deera:
- Nama bahan baku (RESLETING, BENANG JAHIT, KANCING, dll)
- Tipe: unit-based atau usage-based
- Harga terkini (terupdate dari nota terbaru)

**Nota pembelian:**
- Satu nota bisa untuk 1 atau beberapa kode (tidak harus 1 produksi)
- Per item: pilih dari katalog (atau ketik manual), qty/nilai, harga
- Tiap item ditandai untuk kode mana

**Kalkulasi otomatis bahan baku:**
- Item untuk 1 kode — Unit-based: `(qty dibeli ÷ total pcs kode) × harga = cost/pcs`; Usage-based: `total nilai ÷ total pcs kode = cost/pcs`
- **Item lintas beberapa kode — alokasi proporsional**: tiap kode dialokasikan qty sebesar total pcs kode tsb, sisa pembelian dibagi rata ke kode-kode terlibat, baru dihitung cost/pcs dari alokasi tsb
  - Contoh: beli 30pcs resleting untuk kode A (10 pcs) & kode B (18 pcs) → A dapat 10, B dapat 18, sisa 2 dibagi rata → A = 11pcs (cost/pcs dari 11÷10), B = 19pcs (cost/pcs dari 19÷18)

### 7.7 Kalkulasi HPP

**HPP Jasa** (sama untuk semua kode dalam 1 produksi):
- Komponen: Upah Produksi, Overhead/Profit Deera, Staff
- Custom komponen bisa ditambah per produksi
- Template global menyimpan range min–max per komponen
- Input menggunakan slider + angka manual (sinkron dua arah)

**HPP Per Baju** (full breakdown untuk Jihan):

```
HPP Jasa:
  Upah Produksi      Rp 40.000
  Overhead/Profit    Rp 20.000
  Staff              Rp 10.000
  [custom]
  ─────────────────────────────
  Total HPP Jasa     Rp 70.000

Nilai Bahan:
  Motif IMA          Rp 49.000  ← total yard × harga ÷ total pcs
  Polos              Rp 18.000  ← konsumsi/pcs × harga/yard
  ─────────────────────────────
  Total Nilai Bahan  Rp 67.000

Bahan Baku:
  Resleting    1pcs  Rp  3.500
  Benang             Rp    500
  Kancing      5pcs  Rp  1.000
  Hangtag      1pcs  Rp    300
  Plastik      1pcs  Rp    200
  ─────────────────────────────
  Total Bahan Baku   Rp  5.500

═══════════════════════════════
Total HPP / pcs      Rp142.500
Harga Jual Target    Rp210.000
Margin                    32%  ✅
```

Semua nilai di-freeze saat HPP disubmit ke Jihan. Nota baru setelah freeze tidak mempengaruhi HPP yang sudah approved.

**Histori Revisi HPP:** setiap kali Deera mengubah nilai (misal setelah ditolak Jihan), sistem mencatat nilai lama vs baru per komponen + timestamp + siapa yang ubah. Histori ini terlihat penuh oleh Jihan saat review ulang, bukan cuma angka terbaru — supaya tetap transparan.

**Bagikan ke WhatsApp:** breakdown HPP (ringkasan) bisa dibagikan langsung ke WA, sama seperti foto sampel — memudahkan diskusi di luar aplikasi.

### 7.8 Tracking Produksi

- 4 tahap: Dipotong → Dijahit → Finishing → Siap Kirim
- Tracking **per ukuran dan per warna** per kode (1 tukang jahit = 1 warna)
- HPP per pcs sama untuk semua ukuran
- Reject per tahap: wajib isi alasan + nasib (dipermak / produksi ulang / waste)
  - **Produksi ulang dengan bahan tidak tersedia** → dicatat sebagai flag "perlu bahan tambahan", dinotifikasi ke Deera & Jihan untuk tindak lanjut
- Sisa bahan sekunder dihitung otomatis (`jumlahDibeli − konsumsiTerpakai`) dan ditampilkan — bahan adalah milik Jihan, transparansi penting

**Pengiriman Parsial:**
- Satu kode bisa dikirim bertahap — per warna (mis. 4 dari 5 warna siap, kirim duluan) atau per jumlah pcs dalam satu warna (mis. 10 dari 30 pcs)
- Setiap rencana pengiriman parsial perlu **disetujui Jihan** dulu sebelum dieksekusi
- Status `selesai` baru tercapai setelah seluruh `jumlahAkhirDikirim` (semua warna dikurangi waste) terkirim

### 7.9 Notifikasi

Push notifikasi ke HP + inbox dalam aplikasi:

| Event | Penerima |
|-------|----------|
| Sampel baru diupload | Tim Jihan |
| HPP siap direview | Tim Jihan |
| Estimasi pemakaian diinput | Tim Jihan |
| Bahan aktual dikonfirmasi (buku potong) | Tim Jihan |
| Tiap tahap produksi selesai 100% | Tim Jihan |
| Kode siap kirim (penuh / sebagian) | Tim Jihan |
| Permintaan approval pengiriman sebagian | Tim Jihan |
| Kode selesai (seluruh pengiriman tuntas — termasuk info potongan kasbon otomatis, jika ada) | Tim Jihan |
| Kasbon baru dicatat oleh Deera | Tim Jihan |
| Reject produksi ulang — bahan tidak tersedia | Tim Jihan & Tim Deera |
| Kode dibatalkan | Tim Jihan |
| Sampel di-approve / ditolak | Tim Deera |
| HPP di-approve / ditolak | Tim Deera |

Inbox: riwayat tersimpan sampai user hapus, ada tombol "Tandai Semua Dibaca".

**Mode Notifikasi (khusus Tim Jihan):** pilih antara *real-time* (langsung saat event terjadi) atau *digest harian* (ringkasan terjadwal 1× sehari, mis. jam 08:00) — supaya tidak kebanjiran notifikasi untuk pengguna yang kurang familiar dengan aplikasi.

### 7.10 Activity Log

- Hanya Tim Deera yang bisa melihat
- Mencatat: siapa, aksi apa, kapan, data sebelum dan sesudah
- Filter berdasarkan tanggal dan pengguna

### 7.11 Recycle Bin

- Hapus → soft delete → masuk "Data Terhapus"
- Dari Data Terhapus: Restore atau Hapus Permanen (konfirmasi modal)
- Semua aksi hapus tetap tercatat di activity log

### 7.12 Kalkulator HPP Standalone

- Tab Kalkulasi: kalkulator cepat HPP tanpa terikat ke kode manapun
- Tab Konverter: Meter ↔ Yard, Cm ↔ Yard — real-time saat mengetik

### 7.13 Perbandingan Riwayat Sampel

- Saat sampel direvisi lebih dari sekali, tersedia tampilan **berdampingan** (foto versi lama vs versi baru) agar mudah membandingkan perubahan
- Berlaku untuk Deera maupun Jihan saat melihat histori sampel suatu kode

### 7.14 Panduan Instalasi PWA

- Layar onboarding sederhana yang menuntun Tim Jihan memasang aplikasi ke home screen HP (Android/iOS), mengingat target pengguna adalah pengguna awam teknologi
- Ditampilkan otomatis saat login pertama kali dari browser, dengan opsi "Lewati" / "Ingatkan Lagi Nanti"

### 7.15 Kasbon

Pengecualian terbatas terhadap aturan "tidak mencatat pembayaran" — karena permintaan dana operasional (DP/kasbon) dari Deera ke Jihan terjadi cukup sering dan butuh transparansi dua arah.

- **Negosiasi & transfer dana selalu di luar sistem** (WA/tatap muka). Sistem hanya mencatat **nominal yang sudah diterima Deera**, diinput langsung tanpa alur request/approve
- **Saldo global** — satu akumulasi berjalan lintas semua produksi & kode (bukan per-produksi/per-kode), seperti rekening berjalan antara Deera & Jihan
- **Potongan otomatis**: saat sebuah kode mencapai status `selesai`, sistem otomatis membuat entri "potongan" sebesar nilai HPP kode tsb (`HPP per pcs × jumlahAkhirDikirim`) dan mengurangi saldo — tanpa input manual
- **Histori sebagai ledger tunggal**: entri "masuk" (manual, Deera) dan "potongan otomatis" (sistem) tampil berurutan dengan saldo berjalan setelah tiap entri
- **Akses**: Deera input & lihat penuh (tidak bisa edit/hapus entri potongan otomatis); Jihan read-only — lihat histori lengkap & saldo terkini untuk transparansi
- **Bukan modul keuangan** — tidak ada metode bayar, rekonsiliasi, laporan, atau pelunasan akhir; semua itu tetap di luar sistem & di luar scope v1.0

---

## 8. Desain UI/UX

### Prinsip
- Mobile-first — dirancang untuk smartphone (390px), desktop sebagai bonus
- Elegan & mewah — mencerminkan brand fashion premium
- Gaptek-friendly — tombol besar, teks jelas, pilihan terbatas untuk Tim Jihan
- Minim icon — teks sebagai label utama; icon hanya sebagai aksen jika menambah kejelasan

### Panduan Visual
- Warna base: deep navy / charcoal. Aksen: gold / champagne
- Format angka: `Rp 85.000` (selalu)
- Semua input teks: uppercase otomatis (kecuali email & password)
- Input angka: slider + manual sinkron, nilai lama jadi placeholder

### Navigasi (Bottom Nav)
| Tim Deera | Tim Jihan |
|-----------|-----------|
| Beranda, Produksi, HPP Kalkulator, Pengaturan | Beranda, Produksi, Akun |

---

## 9. Teknis

- Platform: Progressive Web App (PWA), mobile browser
- Backend: Supabase (Auth, PostgreSQL, Realtime, Edge Functions)
- File storage: Cloudinary (foto sampel, CDN, transformasi)
- Push notifikasi: Web Push API via Supabase Edge Functions
- Deployment frontend: Vercel
- Domain: milik Deera (sudah ada)
- Bahasa: Indonesia

---

## 10. Out of Scope (v1.0)

- Manajemen pembayaran secara umum (rekonsiliasi, metode bayar, pelunasan akhir, laporan transaksi, dll) — **Kasbon dikecualikan secara terbatas** (lihat 7.15): hanya pencatatan nominal masuk + saldo berjalan, bukan pemrosesan pembayaran
- Chat / messaging dalam aplikasi
- Laporan keuangan / akuntansi
- Stok bahan milik Deera
- Integrasi marketplace
- Native mobile app (Android/iOS)
- Multi-klien
- Export / cetak data
- Template HPP per kategori

---

## 11. Kriteria Keberhasilan

1. Tim Jihan dapat melihat status terkini setiap kode tanpa bertanya ke Deera via WhatsApp
2. Proses review HPP dan sampel dapat dilakukan sepenuhnya dalam aplikasi
3. Tim Deera menghemat waktu komunikasi dengan Jihan minimal 50%
4. Kalkulasi HPP bahan (primer + sekunder + bahan baku) akurat dan otomatis
5. Tim Jihan dapat menggunakan aplikasi tanpa panduan lebih dari 5 menit
6. Semua reject tercatat dengan nasibnya — tidak ada informasi yang hilang

---

## 12. Roadmap

| Fase | Target | Lingkup |
|------|--------|---------|
| v1.0 MVP | Q3 2026 | Semua fitur di atas |
| v1.5 | Q4 2026 | Export ringkasan, filter & pencarian lanjutan |
| v2.0 | 2027 | Multi-klien, laporan periodik, offline PWA |

---

*Jihan Production · PRD v2.0 · Juni 2026*
