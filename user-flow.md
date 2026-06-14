# User Flow — Jihan Production
Versi 2.0 · Juni 2026

---

## Daftar Alur

1. [Onboarding & Autentikasi](#1-onboarding--autentikasi)
2. [Buat Produksi & Input Surat Jalan](#2-buat-produksi--input-surat-jalan)
3. [Tambah Kode & Ukuran](#3-tambah-kode--ukuran)
4. [Upload Sampel (Deera)](#4-upload-sampel-deera)
5. [Review Sampel (Jihan)](#5-review-sampel-jihan)
6. [Estimasi & Konfirmasi Pemakaian Bahan](#6-estimasi--konfirmasi-pemakaian-bahan)
7. [Input Buku Potong](#7-input-buku-potong)
8. [Input Nota Bahan Baku](#8-input-nota-bahan-baku)
9. [Input HPP (Deera)](#9-input-hpp-deera)
10. [Review HPP (Jihan)](#10-review-hpp-jihan)
11. [Update Progress Produksi](#11-update-progress-produksi)
12. [Penanganan Reject](#12-penanganan-reject)
13. [Siap Kirim & Selesai (termasuk Pengiriman Parsial)](#13-siap-kirim--selesai-termasuk-pengiriman-parsial)
14. [Pantau Dashboard (Jihan)](#14-pantau-dashboard-jihan)
15. [Pengaturan & Akun](#15-pengaturan--akun)
16. [Recycle Bin](#16-recycle-bin)
17. [Activity Log](#17-activity-log)
18. [Kasbon](#18-kasbon)

---

## Ringkasan Status Flow Per Kode

```
sampel_dibuat
  → review_sampel
    → [tolak] → sampel_dibuat
    → [approve Jihan]
      → estimasi_pemakaian
        → konfirmasi_pemakaian
          → [estimasi terlalu besar] → dibatalkan → [direvisi] → kembali ke status sebelumnya
          → proses_potong
            → input_buku_potong
              → input_nota
                → input_hpp
                  → review_hpp
                    → [tolak] → input_hpp (tercatat di histori revisi: nilai lama vs baru)
                    → [approve Jihan]
                      → produksi
                        → siap_kirim (bisa bertahap/parsial — perlu approval Jihan)
                          → selesai
```

---

## 1. Onboarding & Autentikasi

### Deera undang Tim Jihan
```
Pengaturan → Kelola Pengguna → Tambah Pengguna
  → Isi email Tim Jihan
  → Sistem kirim email undangan (link berlaku 48 jam)
```

### Tim Jihan aktivasi akun
```
Terima email → Klik link aktivasi
  → [Link expired] → Minta Deera kirim ulang
  → [Valid] → Halaman set password → Masuk aplikasi ✓
```

### Login
```
Buka aplikasi → Isi email + password
  → [Salah] → Pesan error
  → [Benar] → Dashboard ✓
```

### Lupa password
```
Login → Lupa Password → Isi email
  → Sistem kirim link reset → Buat password baru → Login ✓
```

### Panduan Instalasi PWA (khusus saat login pertama via browser)
```
Login pertama kali → Layar panduan muncul otomatis

  → Tampilkan langkah instalasi sesuai device:
     iOS Safari: Share → "Add to Home Screen"
     Android Chrome: Menu (⋮) → "Install app" / "Add to Home Screen"

  → [Pasang Sekarang] → ikuti panduan visual step-by-step
  → [Lewati] atau [Ingatkan Lagi Nanti] → lanjut ke Dashboard

  (Ditujukan untuk Tim Jihan yang awam teknologi — bahasa sederhana, gambar jelas)
```

---

## 2. Buat Produksi & Input Surat Jalan

```
Produksi → Tambah Produksi
  → Isi: Kode Bahan (3 huruf), Tanggal, Catatan

  → Input Surat Jalan (penerimaan bahan dari Jihan):
     - Nomor Surat Jalan
     - Tanggal Terima
     - Pengirim (nama/tim Jihan)
     - Catatan

  → Input Bahan (bisa >1 bahan per produksi):

     Bahan 1 — PRIMER (MOTIF)
     - Jenis: MOTIF IMA
     - Satuan: Yard
     - Harga per Yard
     - Warna + Yard tersedia:
       [+ NAVY   50 yard]
       [+ HITAM  50 yard]
       [+ HIJAU  50 yard]
       [+ Tambah Warna]

     Bahan 2 — SEKUNDER (POLOS)
     - Jenis: POLOS
     - Satuan: Yard
     - Harga per Yard
     (konsumsi per pcs diisi nanti saat input HPP)

     [+ Tambah Bahan Lain]

  → Produksi tersimpan ✓
```

---

## 3. Tambah Kode & Ukuran

```
Detail Produksi → Tambah Kode
  → Isi Kode Desain: J-001-IMA
    (sistem validasi format + keunikan)
  → Harga Jual Target Jihan (opsional)
  → Catatan (uppercase)
  → Pilih Ukuran (bisa lebih dari 1):
     ☑ MIDI        ☑ GAMIS
     ☐ MIDI JUMBO  ☐ GAMIS JUMBO

  → Kode tersimpan, status: sampel_dibuat ✓
  → [+ Tambah Kode Lain] untuk kode berikutnya
```

---

## 4. Upload Sampel (Deera)

```
Detail Kode → Tab Sampel → Upload Sampel
  → Pilih Foto Depan (JPG/PNG/HEIC, maks 10MB)
  → Pilih Foto Belakang
  → Upload

  → Status kode berubah: review_sampel
  → Push notif dikirim ke Tim Jihan: "Sampel baru J-001-IMA" ✓
```

---

## 5. Review Sampel (Jihan)

```
Terima notif → Buka Detail Kode → Tab Sampel

  → Lihat foto (swipe depan ↔ belakang)
  → Bagikan ke WA (opsional)
  → Tambah catatan (opsional)
  → [Jika ada revisi sebelumnya] Lihat Perbandingan
    → Tampilan berdampingan: foto versi lama vs versi baru

  → APPROVE: Klik Setujui Sampel
    → Status: sampel_approved → estimasi_pemakaian
    → Notif ke Tim Deera ✓

  → TOLAK: Klik Tolak Sampel
    → Modal muncul langsung: Isi alasan (uppercase, wajib)
    → Konfirmasi Tolak
    → Sampel lama tersimpan di histori
    → Status kembali: sampel_dibuat
    → Notif ke Tim Deera ✓
    → [Deera upload sampel baru → kembali ke alur 4]
```

---

## 6. Estimasi & Konfirmasi Pemakaian Bahan

### Estimasi (Tim Potong → Deera input)

```
Detail Kode → Tab Bahan → Input Estimasi Pemakaian

  Bahan Primer (per warna):
    NAVY  → estimasi X yard
    HITAM → estimasi X yard
    ...

  Bahan Sekunder (konsumsi per pcs dari pola):
    POLOS → 3.35m / 2 baju = 1.675m/pcs
    (sistem konversi ke yard otomatis)

  → Simpan Estimasi
  → Push notif ke Tim Jihan: "Estimasi pemakaian J-001-IMA" ✓
```

### Konfirmasi

```
  Dikonfirmasi via WA / telepon / tatap muka oleh Tim Deera atau Jihan

  Salah satu pihak klik "Tandai Sudah Dikonfirmasi"
  → Status: proses_potong ✓

  [Jika angka terlalu besar]
  → Tim Deera klik "Batalkan Kode"
    → Modal: isi alasan (uppercase, wajib)
    → Status: dibatalkan (status sebelumnya disimpan)
    → Notif ke Tim Jihan ✓
  → [Jika nanti direvisi & dilanjutkan]
    → Tim Deera klik "Lanjutkan Kembali"
    → Status kembali ke status sebelum dibatalkan
```

---

## 7. Input Buku Potong

```
Detail Kode → Tab Buku Potong → Input Data Aktual

  → Untuk setiap WARNA × UKURAN:
     Contoh: NAVY × MIDI → 22 pcs
             NAVY × GAMIS → 15 pcs
             HITAM × MIDI → 22 pcs
             HITAM × GAMIS → 15 pcs
             ...

  → Untuk setiap Bahan Primer, per warna:
     NAVY → yard terpakai aktual: 48.5 yard
     HITAM → yard terpakai aktual: 48.2 yard
     ...

  → Simpan Data Buku Potong
  → Sistem hitung otomatis:
     - Total pcs per ukuran per kode
     - Total pcs seluruh produksi
  → Push notif ke Tim Jihan: "Data potong J-001-IMA dikonfirmasi" ✓
  → Status: input_nota ✓
```

---

## 8. Input Nota Bahan Baku

```
Nota → Buat Nota Baru
  → Tanggal, Catatan

  → Tambah Item:
     Pilih dari katalog (atau ketik manual)
     Tentukan tipe: Unit / Usage

     [Unit-based — 1 kode] contoh: Resleting
       - Pilih kode: J-001-IMA
       - Qty: 120 pcs
       - Harga/pcs: Rp 3.500
       - Sistem hitung: 120 ÷ 110 pcs = 1.09 pcs/baju → Rp 3.818/baju

     [Unit-based — lintas beberapa kode, alokasi proporsional]
       - Pilih kode: J-001-IMA (10 pcs) + J-002-IMA (18 pcs)
       - Qty dibeli: 30 pcs, Harga/pcs: Rp 3.500
       - Sistem hitung otomatis:
         alokasi dasar = total pcs tiap kode → J-001 = 10, J-002 = 18
         sisa = 30 − (10+18) = 2 → dibagi rata: +1 / +1
         alokasi akhir → J-001 = 11pcs, J-002 = 19pcs
         cost/pcs J-001 = (11 ÷ 10) × Rp 3.500 = Rp 3.850
         cost/pcs J-002 = (19 ÷ 18) × Rp 3.500 = Rp 3.694

     [Usage-based] contoh: Benang Jahit
       - Pilih kode: J-001-IMA (atau beberapa kode — dialokasikan dengan pola yang sama berbasis proporsi nilai)
       - Total nilai belanja: Rp 55.000
       - Sistem hitung: Rp 55.000 ÷ 110 pcs = Rp 500/baju

  → [+ Tambah Item Lain]
  → Simpan Nota ✓
  → Harga katalog terupdate otomatis dari nota terbaru
  → Status kode: input_hpp (jika semua nota sudah diinput)
```

---

## 9. Input HPP (Deera)

```
Detail Kode → Tab HPP → Input HPP

  ── HPP Jasa (sama untuk semua kode dalam produksi ini) ──

  Upah Produksi
  ◀────────●─────────▶  [slider]
  [input angka manual]   Rp 10.000 — Rp 50.000

  Overhead/Profit
  ◀────────●─────────▶
  [input angka manual]

  Staff
  ◀────────●─────────▶
  [input angka manual]

  [+ Tambah Komponen Custom] (opsional, per produksi)

  ── Konsumsi Bahan Sekunder ──
  (input konsumsi dari pola, dikonversi ke yard otomatis)

  POLOS: 3.35m / 2 baju = 1.675m → [konversi] 1.832 yard/pcs
  [input konversi]

  ── Kalkulasi Real-time ──
  HPP Jasa            Rp 70.000
  Nilai Bahan Primer  Rp 49.000  ← auto dari buku potong
  Nilai Bahan Sekunder Rp 18.000 ← auto dari konsumsi
  Bahan Baku          Rp  5.500  ← auto dari nota
  ────────────────────────────
  Total HPP/pcs       Rp142.500

  Harga Jual Target   Rp210.000
  Margin                   32% ✅

  → Kirim ke Jihan untuk Review HPP
  → Status: review_hpp
  → Push notif ke Tim Jihan ✓

  [Jika ini revisi setelah ditolak Jihan]
  → Sistem otomatis catat histori: nilai lama vs nilai baru per komponen
  → Histori tetap terlihat saat Jihan review ulang (bukan cuma angka terbaru)
```

---

## 10. Review HPP (Jihan)

```
Terima notif → Buka Detail Kode → Tab HPP

  → Lihat full breakdown HPP Per Baju:
     (HPP Jasa + Nilai Bahan + Bahan Baku + Margin)
  → [Jika pernah direvisi] Lihat Histori Revisi
     → Daftar perubahan: komponen, nilai lama → nilai baru, alasan, tanggal
  → Bagikan ringkasan ke WA (opsional)

  → APPROVE: Setujui HPP, Lanjut Produksi
    → Status: hpp_approved → produksi
    → Notif ke Tim Deera ✓

  → TOLAK: Tolak HPP
    → Modal: isi alasan (wajib)
    → Status: input_hpp
    → Notif ke Tim Deera ✓
    → Deera edit langsung nilai HPP (tidak perlu buat baru)
    → Kirim ulang untuk review
```

---

## 11. Update Progress Produksi

```
Detail Kode → Tab Produksi
  → Pilih Ukuran: MIDI  (atau GAMIS, dll)
  → Pilih Tahap: Dijahit
  → Klik Update

  → Isi jumlah pcs selesai:
     [input angka] (placeholder: jumlah sebelumnya)
     Maks: total pcs ukuran ini

  → Ada reject? ○ Tidak  ● Ya
     [+ Tambah Data Reject] → lanjut ke alur 12

  → Simpan ✓
  → Progress bar terupdate
  → Jika tahap selesai 100% → Push notif ke Tim Jihan ✓
```

---

## 12. Penanganan Reject

```
Saat update tahap → Ada reject
  → Input Data Reject (bottom sheet):
     - Jumlah pcs reject
     - Alasan (uppercase, wajib)
     - Nasib reject:

     [Dipermak]
       → Pcs diperbaiki, tetap masuk jumlah akhir
       → Simpan ✓

     [Produksi Ulang]
       → Bahan tersedia? ○ Ya  ○ Tidak
       → [Tidak] → Sistem catat flag "Perlu Bahan Tambahan"
                  → Push notif ke Tim Deera & Tim Jihan ✓
       → Simpan ✓

     [Waste] ⚠️
       → Konfirmasi inline:
         "2 pcs akan dikurangi dari pengiriman (50 → 48)"
       → Simpan ✓
       → jumlahAkhir = jumlahPcs - totalWaste
```

---

## 13. Siap Kirim & Selesai (termasuk Pengiriman Parsial)

```
Saat ada bagian yang sudah selesai finishing (tidak harus 100% semua warna/pcs):
  → Detail Kode → Tab Produksi → "Buat Rencana Pengiriman"

  → Pilih apa yang mau dikirim:
     ○ Beberapa warna penuh   (mis. NAVY 30pcs, HITAM 30pcs — 2 dari 5 warna)
     ○ Sebagian pcs per warna (mis. NAVY 10 dari 30pcs)
     [+ Tambah Warna Lain]

  → Kirim untuk Approval Jihan
  → Status pengiriman: menunggu
  → Push notif ke Tim Jihan: "Permintaan kirim sebagian J-001-IMA" ✓

Tim Jihan terima notif → buka Detail Kode → Tab Produksi
  → Lihat rincian rencana pengiriman (warna + jumlah pcs)
  → APPROVE: Setujui Pengiriman
    → Status pengiriman: disetujui
    → Notif ke Tim Deera ✓
  → TOLAK: Tolak Pengiriman
    → Modal: isi alasan (wajib)
    → Status pengiriman: ditolak → Deera bisa ajukan ulang dengan rincian baru

Setelah disetujui & barang fisik terkirim:
  → Deera tandai pengiriman ini selesai dikirim
  → Sistem akumulasi total terkirim vs jumlahAkhirDikirim

  [Jika masih ada sisa pcs/warna]
  → Status kode tetap di tahap produksi/siap_kirim, bisa buat rencana pengiriman berikutnya

  [Jika seluruh jumlahAkhirDikirim sudah terkirim]
  → Status kode otomatis: selesai ✓
  → Sistem otomatis catat potongan saldo Kasbon (jika ada saldo berjalan) — lihat alur 18
  → Push notif ke Tim Jihan: "J-001-IMA selesai dikirim seluruhnya — saldo kasbon terpotong Rp 4.275.000" ✓

(Pembayaran final tetap di luar sistem — tidak dicatat, kecuali Kasbon yang sudah tercatat sebelumnya)
```

---

## 14. Pantau Dashboard (Jihan)

```
Buka aplikasi → Dashboard Jihan

  → Lihat ringkasan:
     - Jumlah produksi aktif
     - Kode yang menunggu keputusanku
     - Kartu "Saldo Kasbon: Rp X" → tap untuk buka histori lengkap (lihat alur 18)

  → Lihat daftar aksi yang perlu dilakukan:
     [Sampel baru] J-001-IMA → tap untuk review
     [HPP siap review] J-004-KAT → tap untuk review

  → Lihat kode yang sedang produksi:
     J-001-IMA — Dijahit 70%
     J-002-IMA — Finishing 30%

  → Produksi → Daftar semua produksi
     Filter: status, tanggal
     Search: kode atau kode bahan

  → Tap produksi → Detail → Tap kode → Detail kode:
     Tab Sampel: lihat foto, beri catatan, approve/tolak
     Tab HPP: lihat full breakdown, approve/tolak
     Tab Produksi: lihat progress per ukuran, detail reject
```

---

## 15. Pengaturan & Akun

### Semua pengguna
```
Pengaturan → Ganti Password
  → Isi password lama + password baru → Simpan ✓
```

### Tim Jihan saja

**Mode Notifikasi:**
```
Pengaturan → Notifikasi
  → Pilih mode:
     ○ Real-time (langsung saat ada kejadian)
     ○ Ringkasan Harian (digest 1× sehari, jam bisa diatur — default 08:00)
  → Simpan ✓
```

### Tim Deera saja

**Template HPP:**
```
Pengaturan → Template HPP
  → Edit min/max per komponen (Upah, Overhead, Staff)
  → Tambah/hapus komponen custom (berlaku global)
  → Simpan ✓
```

**Katalog Bahan Baku:**
```
Pengaturan → Katalog Bahan Baku
  → Lihat daftar bahan baku
  → Tambah baru: nama, tipe (unit/usage), satuan
  → Edit/nonaktifkan item existing
```

**Kelola Pengguna:**
```
Pengaturan → Kelola Pengguna
  → Undang pengguna baru: input email → kirim undangan
  → Kirim ulang undangan (jika belum aktivasi)
  → Nonaktifkan akun
```

---

## 16. Recycle Bin

```
Pengaturan → Data Terhapus
  → Lihat daftar produksi/kode yang dihapus
  → Per item: Restore (kembalikan) atau Hapus Permanen

  Hapus Permanen:
    → Modal konfirmasi: "Data ini tidak bisa dikembalikan"
    → Klik Hapus Selamanya ✓
```

---

## 17. Activity Log

```
Pengaturan → Activity Log  (Tim Deera saja)
  → Filter: Tanggal, Pengguna
  → Setiap entri: nama, aksi, data sebelum/sesudah, timestamp
  → Scroll untuk melihat histori lebih lama
```

---

## 18. Kasbon

> Kasbon = dana operasional (DP/kasbon) yang diminta Deera ke Jihan **di luar sistem** (WA/tatap muka). Yang dicatat di sistem hanya nominal yang sudah diterima — sebagai pengecualian terbatas terhadap aturan "tidak mencatat pembayaran" (lihat CLAUDE.md § Kasbon). Saldo bersifat **global**, lintas semua produksi & kode.
>
> **Akses:** kartu ringkas "Saldo Kasbon" tampil di Dashboard (Deera & Jihan) → tap untuk buka Tab/Halaman Kasbon penuh. Tidak perlu tab navigasi terpisah agar bottom nav tetap minim sesuai prinsip "pilihan minimal".

### Catat Kasbon Masuk (Tim Deera)

```
Tab Kasbon → [+ Catat Kasbon Masuk]

  → Isi form:
     Tanggal      : [date picker, default hari ini]
     Nominal      : Rp [input manual]
     Catatan      : [opsional, uppercase — mis. "DP BAHAN PRODUKSI JUNI"]

  → Simpan
  → Entri masuk ke histori (tipe: masuk)
  → Saldo kasbon bertambah otomatis
  → Push notif ke Tim Jihan: "Kasbon baru dicatat: Rp 5.000.000" ✓

(Tidak ada alur request/approve — negosiasi & transfer dana sudah selesai
 di luar sistem sebelum dicatat. Deera input langsung nominal yang diterima.)
```

### Lihat Histori & Saldo (Tim Deera & Tim Jihan)

```
Tab Kasbon → Beranda Kasbon

  → Saldo Kasbon Saat Ini   : Rp XX.XXX.XXX  (besar, jelas, di atas)
  → Daftar Histori (urut terbaru di atas):
     ┌─────────────────────────────────┐
     │ 12 Jun · Masuk                  │
     │ + Rp 5.000.000                  │
     │ "DP BAHAN PRODUKSI JUNI"        │
     │ Saldo setelah: Rp 5.000.000     │
     └─────────────────────────────────┘
     ┌─────────────────────────────────┐
     │ 18 Jun · Potongan Otomatis      │
     │ − Rp 4.275.000                  │
     │ "POTONGAN OTOMATIS — J-001-IMA  │
     │  SELESAI (30 PCS × RP 142.500)" │
     │ Saldo setelah: Rp   725.000     │
     └─────────────────────────────────┘

  → Tap entri "Potongan Otomatis" → langsung ke Detail Kode terkait (transparansi sumber potongan)
```

> **Akses:** Tim Deera dapat menambah entri "Masuk" (CRUD penuh, ikut aturan recycle bin); entri "Potongan Otomatis" hanya dibuat sistem dan **tidak bisa diedit/dihapus siapapun**. Tim Jihan murni read-only — melihat histori lengkap & saldo terkini untuk transparansi dua arah, sama seperti histori revisi HPP & perbandingan sampel.

### Potongan Otomatis (Sistem)

```
Saat status sebuah kode otomatis berubah → selesai
  (seluruh jumlahAkhirDikirim sudah terkirim & disetujui — lihat alur 13)

  → Sistem otomatis buat entri baru:
     Tipe     : Potongan Otomatis
     Nominal  : HPP per pcs × jumlah pcs terkirim
     Referensi: kode terkait
     Catatan  : auto-generated, mis. "POTONGAN OTOMATIS — J-001-IMA SELESAI (30 PCS × RP 142.500)"

  → Saldo kasbon berkurang otomatis — tanpa input manual dari siapapun
  → Info potongan disertakan dalam notif "Kode selesai" ke Tim Jihan ✓
```

---

## Inbox Notifikasi

```
Klik ikon Notifikasi (di semua halaman)
  → Daftar notifikasi (belum dibaca di atas)
  → Tandai Semua Dibaca (jika ada yang belum dibaca)
  → Tap notif → langsung ke halaman yang relevan
  → Swipe kiri notif → hapus
```

> **Catatan mode digest (Tim Jihan):** Jika mode notifikasi diatur ke "Ringkasan Harian", inbox tetap berisi notifikasi individual seperti biasa, namun Tim Jihan **juga** menerima satu ringkasan harian terjadwal (default jam 08:00) yang merangkum seluruh event sejak ringkasan terakhir — sehingga tidak perlu memantau inbox secara realtime. Lihat [Mode Notifikasi](#tim-jihan-saja) di bagian Pengaturan untuk cara mengubah mode ini.
