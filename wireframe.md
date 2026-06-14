# Wireframe — Jihan Production
Mobile-first · 390px · Versi 2.0 · Juni 2026

---

## Daftar Screen

**Autentikasi**
- [S-01 Login](#s-01-login)
- [S-02 Aktivasi Akun](#s-02-aktivasi-akun)
- [S-03 Lupa Password](#s-03-lupa-password)

**Tim Deera — Produksi**
- [S-04 Dashboard Deera](#s-04-dashboard-deera)
- [S-05 Daftar Produksi](#s-05-daftar-produksi)
- [S-06 Buat Produksi](#s-06-buat-produksi)
- [S-07 Detail Produksi](#s-07-detail-produksi)
- [S-08 Tambah Kode](#s-08-tambah-kode)

**Tim Deera — Kode**
- [S-09 Detail Kode: Tab Sampel (Deera)](#s-09-detail-kode-tab-sampel-deera)
- [S-10 Upload Sampel](#s-10-upload-sampel)
- [S-10b Perbandingan Sampel](#s-10b-perbandingan-sampel)

- [S-11 Estimasi Pemakaian Bahan](#s-11-estimasi-pemakaian-bahan)
- [S-12 Input Buku Potong](#s-12-input-buku-potong)
- [S-13 Detail Kode: Tab HPP (Deera)](#s-13-detail-kode-tab-hpp-deera)
- [S-13b Histori Revisi HPP](#s-13b-histori-revisi-hpp)
- [S-14 Input HPP](#s-14-input-hpp)
- [S-15 Detail Kode: Tab Produksi (Deera)](#s-15-detail-kode-tab-produksi-deera)
- [S-16 Update Tahap Produksi](#s-16-update-tahap-produksi)
- [S-17 Form Reject](#s-17-form-reject)
- [S-17b Buat Rencana Pengiriman](#s-17b-buat-rencana-pengiriman)
- [S-17c Riwayat & Approval Pengiriman](#s-17c-riwayat--approval-pengiriman)

**Nota & Katalog**
- [S-18 Daftar Nota](#s-18-daftar-nota)
- [S-19 Buat Nota Bahan Baku](#s-19-buat-nota-bahan-baku)
- [S-20 Katalog Bahan Baku](#s-20-katalog-bahan-baku)

**Tim Jihan**
- [S-21 Dashboard Jihan](#s-21-dashboard-jihan)
- [S-22 Daftar Produksi (Jihan)](#s-22-daftar-produksi-jihan)
- [S-23 Detail Kode: Tab Sampel (Jihan)](#s-23-detail-kode-tab-sampel-jihan)
- [S-24 Detail Kode: Tab HPP (Jihan)](#s-24-detail-kode-tab-hpp-jihan)
- [S-25 Detail Kode: Tab Produksi (Jihan)](#s-25-detail-kode-tab-produksi-jihan)

**Shared**
- [S-26 Kalkulator HPP & Konverter](#s-26-kalkulator-hpp--konverter)
- [S-27 Inbox Notifikasi](#s-27-inbox-notifikasi)
- [S-28 Modal Tolak](#s-28-modal-tolak)

**Pengaturan**
- [S-29 Pengaturan Deera](#s-29-pengaturan-deera)
- [S-30 Template HPP](#s-30-template-hpp)
- [S-31 Kelola Pengguna](#s-31-kelola-pengguna)
- [S-32 Activity Log](#s-32-activity-log)
- [S-33 Data Terhapus](#s-33-data-terhapus)
- [S-34 Pengaturan Jihan](#s-34-pengaturan-jihan)
- [S-34b Mode Notifikasi (Jihan)](#s-34b-mode-notifikasi-jihan)
- [S-34c Panduan Instal ke Layar Utama (PWA)](#s-34c-panduan-instal-ke-layar-utama-pwa)
- [S-35 Beranda Kasbon (Histori & Saldo)](#s-35-beranda-kasbon-histori--saldo)
- [S-35b Catat Kasbon Masuk (Deera)](#s-35b-catat-kasbon-masuk-deera)

---

## Konvensi

```
[  Tombol  ]   tombol utama (filled, navy)
(  Tombol  )   tombol sekunder (outlined)
┌─────────┐
│         │    input field
└─────────┘
◀────●───▶    slider
████████░░    progress bar
[ ← ]         tombol back

Input text   : otomatis UPPERCASE
Input number : nilai lama = placeholder, bukan pre-fill
               slider + angka manual sinkron dua arah
Email/Password: default browser behavior
```

---

## S-01 Login

```
┌─────────────────────────┐
│                         │
│                         │
│    JIHAN PRODUCTION     │
│    ───────────────      │
│                         │
│                         │
│  Email                  │
│  ┌─────────────────┐    │
│  │                 │    │
│  └─────────────────┘    │
│                         │
│  Password               │
│  ┌─────────────────┐    │
│  │                 │  👁 │
│  └─────────────────┘    │
│                         │
│  [       Masuk       ]  │
│                         │
│              Lupa password? │
│                         │
└─────────────────────────┘
```

---

## S-02 Aktivasi Akun

```
┌─────────────────────────┐
│                         │
│  JIHAN PRODUCTION       │
│  ───────────────        │
│                         │
│  Selamat datang.        │
│  Buat password untuk    │
│  akun kamu.             │
│                         │
│  Password Baru          │
│  ┌─────────────────┐    │
│  │                 │  👁 │
│  └─────────────────┘    │
│  Min. 8 karakter        │
│                         │
│  Konfirmasi Password    │
│  ┌─────────────────┐    │
│  │                 │  👁 │
│  └─────────────────┘    │
│                         │
│  [   Aktifkan Akun   ]  │
│                         │
└─────────────────────────┘
```

---

## S-03 Lupa Password

```
┌─────────────────────────┐
│  [ ← ]                  │
│                         │
│  Lupa Password          │
│                         │
│  Kami akan kirimkan     │
│  link reset ke email.   │
│                         │
│  Email                  │
│  ┌─────────────────┐    │
│  │                 │    │
│  └─────────────────┘    │
│                         │
│  [ Kirim Link Reset ]   │
│                         │
│  ─── Setelah terkirim ──│
│  Cek email kamu.        │
│  Link dikirim ke        │
│  email@contoh.com       │
│                         │
└─────────────────────────┘
```

---

## S-04 Dashboard Deera

```
┌─────────────────────────┐
│  Jihan Production  [3]  │  ← badge notif belum dibaca
│                         │
│  ┌─────────────────────┐│
│  │  3 Produksi Aktif   ││
│  │  1 Menunggu Review  ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ Saldo Kasbon        ││
│  │ Rp 725.000      >   ││  ← tap → S-35 Beranda Kasbon
│  └─────────────────────┘│
│                         │
│  Perlu Tindakan         │
│                         │
│  ┌─────────────────────┐│
│  │ Sampel menunggu     ││
│  │ J-001-IMA           ││
│  │ Review sampel v2    ││
│  └─────────────────────┘│
│                         │
│  Produksi Aktif         │
│                         │
│  ┌─────────────────────┐│
│  │ Batch IMA · 3 kode  ││
│  │ J-001-IMA  Produksi ││
│  │ ████████░░  75%     ││
│  │ J-002-IMA  HPP      ││
│  │ J-003-IMA  Sampel   ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ Batch KAT · 1 kode  ││
│  │ J-004-KAT  HPP      ││
│  └─────────────────────┘│
│                         │
│ ─────────────────────── │
│  Beranda  Produksi  HPP  Atur│
└─────────────────────────┘
```

---

## S-05 Daftar Produksi

```
┌─────────────────────────┐
│  Produksi       [+ Baru]│
│                         │
│  ┌─────────────────────┐│
│  │ Cari kode / bahan   ││
│  └─────────────────────┘│
│                         │
│  Semua   Aktif   Selesai│  ← filter chips
│                         │
│  01 Jun – 30 Jun 2026   │  ← filter tanggal
│                         │
│  ┌─────────────────────┐│
│  │ Batch IMA           ││
│  │ 5 Juni 2026         ││
│  │ ─────────────────── ││
│  │ J-001-IMA  Produksi ││
│  │ ████████░░          ││
│  │ J-002-IMA  HPP      ││
│  │ J-003-IMA  Sampel   ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ Batch KAT           ││
│  │ 3 Juni 2026         ││
│  │ ─────────────────── ││
│  │ J-004-KAT  HPP      ││
│  └─────────────────────┘│
│                         │
│ ─────────────────────── │
│  Beranda  Produksi  HPP  Atur│
└─────────────────────────┘
```

---

## S-06 Buat Produksi

*Satu form panjang dengan beberapa seksi. Scroll ke bawah.*

```
┌─────────────────────────┐
│  [ ← ]  Buat Produksi   │
│                         │
│  ── Info Produksi ──────│
│                         │
│  Kode Bahan (3 huruf) * │
│  ┌─────────────────┐    │
│  │ IMA             │    │  ← uppercase, maks 3 huruf
│  └─────────────────┘    │
│  Digunakan sebagai      │
│  suffix kode: J-001-IMA │
│                         │
│  Tanggal *              │
│  ┌─────────────────┐    │
│  │ 5 Juni 2026     │    │
│  └─────────────────┘    │
│                         │
│  Catatan                │
│  ┌─────────────────┐    │
│  │                 │    │  ← uppercase
│  └─────────────────┘    │
│                         │
│  ── Surat Jalan ────────│
│                         │
│  Nomor Surat Jalan      │
│  ┌─────────────────┐    │
│  │                 │    │  ← uppercase
│  └─────────────────┘    │
│                         │
│  Tanggal Terima *       │
│  ┌─────────────────┐    │
│  │                 │    │
│  └─────────────────┘    │
│                         │
│  Pengirim               │
│  ┌─────────────────┐    │
│  │ TIM JIHAN       │    │  ← uppercase
│  └─────────────────┘    │
│                         │
│  ── Bahan dari Jihan ───│
│                         │
│  Bahan 1                │
│  Jenis Bahan *          │
│  ┌─────────────────┐    │
│  │ MOTIF IMA       │    │  ← uppercase
│  └─────────────────┘    │
│                         │
│  Tipe Bahan             │
│  ┌─────────┐ ┌─────────┐│
│  │ Primer  │ │Sekunder │││  ← radio, primer selected
│  └─────────┘ └─────────┘│
│                         │
│  Satuan                 │
│  ┌─────────┐ ┌─────────┐│
│  │  Yard   │ │  Panel  │││
│  └─────────┘ └─────────┘│
│                         │
│  Harga per Yard         │
│  ┌─────────────────┐    │
│  │ Rp              │    │
│  └─────────────────┘    │
│                         │
│  Warna & Yard           │
│  (khusus bahan primer)  │
│                         │
│  ┌──────────────┬──────┐│
│  │ NAVY         │  50  ││  ← nama warna + yard
│  └──────────────┴──────┘│
│  ┌──────────────┬──────┐│
│  │ HITAM        │  50  ││
│  └──────────────┴──────┘│
│  ┌──────────────┬──────┐│
│  │ HIJAU        │  50  ││
│  └──────────────┴──────┘│
│  (+ Tambah Warna)       │
│                         │
│  ─────────────────────  │
│                         │
│  Bahan 2                │
│  ┌─────────────────┐    │
│  │ POLOS           │    │
│  └─────────────────┘    │
│  Tipe: Sekunder         │
│  Satuan: Yard           │
│  Harga per Yard         │
│  ┌─────────────────┐    │
│  │ Rp              │    │
│  └─────────────────┘    │
│  (Konsumsi/pcs diisi    │
│   saat input HPP)       │
│                    [Hapus]
│                         │
│  (+ Tambah Bahan Lain)  │
│                         │
│  [ Simpan & Tambah Kode]│
│                         │
└─────────────────────────┘
```

---

## S-07 Detail Produksi

```
┌─────────────────────────┐
│  [ ← ]  Batch IMA       │
│  5 Juni 2026            │
│                         │
│  ┌─────────────────────┐│
│  │ Surat Jalan         ││
│  │ No. SJ-2026-001     ││
│  │ Terima: 5 Jun 2026  ││
│  │ Pengirim: TIM JIHAN ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ Bahan               ││
│  │ MOTIF IMA  Primer   ││
│  │ Rp 45.000/yard      ││
│  │ 5 warna · 250 yard  ││
│  │                     ││
│  │ POLOS      Sekunder ││
│  │ Rp 32.000/yard      ││
│  │ Dibeli: 180 yard    ││
│  │ Terpakai: ~150 yard ││
│  │ Sisa est: ~30 yard  ││  ← sisaYard = dibeli − (konsumsi×totalPcs)
│  └─────────────────────┘│
│                         │
│  Kode               [+ Tambah]
│                         │
│  ┌─────────────────────┐│
│  │ J-001-IMA           ││
│  │ MIDI · GAMIS        ││  ← ukuran
│  │ Produksi  ████░░ 70%││
│  │ HPP: Rp 142.500     ││
│  │ Margin: 32%         ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ J-002-IMA           ││
│  │ MIDI                ││
│  │ Review HPP          ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ J-003-IMA           ││
│  │ MIDI · GAMIS JUMBO  ││
│  │ Sampel Dibuat       ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ J-004-IMA           ││
│  │ MIDI                ││
│  │ ⏸ Dibatalkan        ││  ← badge abu-abu; status sebelumnya disimpan
│  │ (sebelumnya: Konfirmasi│
│  │  Pemakaian)         ││
│  └─────────────────────┘│
│                         │
└─────────────────────────┘
```

> **Badge "Dibatalkan"**: muncul saat estimasi pemakaian dianggap terlalu besar dan kode dihentikan sementara. Status sebelumnya (`statusSebelumDibatalkan`) ditampilkan sebagai keterangan kecil. Dari sini, Deera dapat menekan kartu untuk membuka opsi "Lanjutkan Kembali" yang mengembalikan kode ke status sebelumnya.

---

## S-08 Tambah Kode

```
┌─────────────────────────┐
│  [ ← ]  Tambah Kode     │
│  Batch IMA              │
│                         │
│  Kode Desain *          │
│  ┌─────────────────┐    │
│  │ J-004-IMA       │    │  ← uppercase, format J-000-XXX
│  └─────────────────┘    │
│  Format: J-[nomor]-[bahan]│
│                         │
│  Pilih Ukuran *         │
│  (bisa lebih dari satu) │
│                         │
│  ┌──────────┬──────────┐│
│  │ MIDI   ☑ │ GAMIS  ☐ ││
│  ├──────────┼──────────┤│
│  │MIDI JMB☐ │GAMIS JMB☐││
│  └──────────┴──────────┘│
│                         │
│  Harga Jual Target      │
│  ┌─────────────────┐    │
│  │ Rp              │    │
│  └─────────────────┘    │
│                         │
│  Catatan                │
│  ┌─────────────────┐    │
│  │                 │    │  ← uppercase
│  └─────────────────┘    │
│                         │
│  [    Simpan Kode     ] │
│  (+ Tambah Kode Lain)   │
│                         │
└─────────────────────────┘
```

---

## S-09 Detail Kode: Tab Sampel (Deera)

```
┌─────────────────────────┐
│  [ ← ]  J-001-IMA       │
│  MIDI · GAMIS           │  ← ukuran
│  Sampel Dibuat          │  ← status
│                         │
│  Sampel  │  HPP  │  Prod│  ← tab
│  ───────────────────    │
│                         │
│  Belum ada sampel       │
│                         │
│  [    Upload Sampel   ] │
│                         │
│  Histori Sampel         │
│                         │
│  ┌─────────────────────┐│
│  │ Versi 1 — Ditolak   ││
│  │ 2 Jun               ││
│  │ KERAH TERLALU BESAR ││
│  └─────────────────────┘│
│                         │
│  ( Bandingkan Versi   ) │  ← tap → S-10b Perbandingan Sampel
│                         │
└─────────────────────────┘
```

---

## S-10 Upload Sampel

```
┌─────────────────────────┐
│  [ ← ]  Upload Sampel   │
│  J-001-IMA              │
│                         │
│  Foto Depan *           │
│  ┌─────────────────────┐│
│  │                     ││
│  │    Pilih Foto       ││
│  │                     ││
│  └─────────────────────┘│
│                         │
│  Foto Belakang *        │
│  ┌─────────────────────┐│
│  │                     ││
│  │    Pilih Foto       ││
│  │                     ││
│  └─────────────────────┘│
│                         │
│  ── Setelah pilih ──────│
│  ┌──────┐  ┌──────┐     │
│  │ IMG  │  │ IMG  │     │
│  │ Dpn  │  │ Blk  │     │
│  └──────┘  └──────┘     │
│                         │
│  [    Upload Sampel   ] │
│                         │
│  JPG / PNG / HEIC       │
│  Maks 10 MB per foto    │
│                         │
└─────────────────────────┘
```

---

## S-10b Perbandingan Sampel

*Tampilan berdampingan untuk membandingkan revisi sampel — membantu Jihan & Deera melihat perbedaan sebelum/sesudah perbaikan.*

```
┌─────────────────────────┐
│  [ ← ]  Bandingkan      │
│  J-001-IMA              │
│                         │
│  Pilih versi:           │
│  ┌──────────┐┌─────────┐│
│  │ Versi 1 ▾││Versi 2 ▾││  ← dropdown pilih versi kiri/kanan
│  └──────────┘└─────────┘│
│                         │
│  ── Foto Depan ─────────│
│  ┌──────────┐┌─────────┐│
│  │   IMG    ││   IMG   ││
│  │ Versi 1  ││ Versi 2 ││
│  └──────────┘└─────────┘│
│                         │
│  ── Foto Belakang ──────│
│  ┌──────────┐┌─────────┐│
│  │   IMG    ││   IMG   ││
│  │ Versi 1  ││ Versi 2 ││
│  └──────────┘└─────────┘│
│                         │
│  ── Catatan ────────────│
│  Versi 1 (Ditolak):     │
│  "KERAH TERLALU BESAR"  │
│                         │
│  Versi 2 (Approved):    │
│  "SUDAH SESUAI"         │
│                         │
└─────────────────────────┘
```

> Tersedia untuk Tim Deera maupun Tim Jihan, selama sampel memiliki ≥ 2 versi histori.

---

## S-11 Estimasi Pemakaian Bahan

*Diisi setelah sampel diapprove. Tim potong yang menghitung.*

```
┌─────────────────────────┐
│  [ ← ]  Estimasi Bahan  │
│  J-001-IMA              │
│                         │
│  Bahan Primer           │
│  ── MOTIF IMA ──────────│
│                         │
│  Estimasi yard per warna│
│  (perkiraan pemakaian   │
│  sebelum dipotong)      │
│                         │
│  NAVY    ┌──────────┐   │
│          │          │   │  ← placeholder: yard tersedia
│          └──────────┘   │
│  HITAM   ┌──────────┐   │
│          │          │   │
│          └──────────┘   │
│  HIJAU   ┌──────────┐   │
│          │          │   │
│          └──────────┘   │
│                         │
│  Bahan Sekunder         │
│  ── POLOS ──────────────│
│                         │
│  Konsumsi per pcs       │
│  ┌────────┐ per         │
│  │        │ ┌─────────┐ │
│  └────────┘ │ 2 baju  │ │  ← cth: 3.35 per 2 baju
│             └─────────┘ │
│  Satuan: Meter  Yard    │  ← pilih satuan input
│                         │
│  = 1.675m/pcs           │  ← hasil konversi otomatis
│  = 1.832 yard/pcs       │
│                         │
│  [  Simpan Estimasi  ]  │
│                         │
│  Notif akan dikirim     │
│  ke Tim Jihan.          │
│                         │
└─────────────────────────┘
```

---

## S-12 Input Buku Potong

*Diisi setelah eksekusi potong selesai. Data dari buku fisik.*

```
┌─────────────────────────┐
│  [ ← ]  Buku Potong     │
│  J-001-IMA              │
│                         │
│  Yard Aktual Terpakai   │
│  (per warna bahan primer)│
│                         │
│  MOTIF IMA              │
│  NAVY    ┌──────────┐   │
│          │          │   │  ← placeholder: estimasi
│          └──────────┘   │
│  HITAM   ┌──────────┐   │
│          │          │   │
│          └──────────┘   │
│  HIJAU   ┌──────────┐   │
│          │          │   │
│          └──────────┘   │
│                         │
│  Pcs per Warna per Ukuran│
│                         │
│         MIDI  GAMIS     │  ← kolom per ukuran
│  NAVY   ┌───┐ ┌───┐    │
│         │   │ │   │    │
│         └───┘ └───┘    │
│  HITAM  ┌───┐ ┌───┐    │
│         │   │ │   │    │
│         └───┘ └───┘    │
│  HIJAU  ┌───┐ ┌───┐    │
│         │   │ │   │    │
│         └───┘ └───┘    │
│                         │
│  ── Ringkasan ──────────│
│  Total MIDI:    66 pcs  │  ← dihitung otomatis
│  Total GAMIS:   45 pcs  │
│  Total semua:  111 pcs  │
│                         │
│  [  Simpan Buku Potong ]│
│                         │
└─────────────────────────┘
```

---

## S-13 Detail Kode: Tab HPP (Deera)

*State: HPP sudah diisi, menunggu review.*

```
┌─────────────────────────┐
│  [ ← ]  J-001-IMA       │
│  Review HPP             │
│                         │
│  Sampel  │  HPP  │  Prod│
│  ───────────────────    │
│                         │
│  HPP Jasa               │
│  Upah Produksi  Rp 40.000│
│  Overhead       Rp 20.000│
│  Staff          Rp 10.000│
│  ───────────────────────│
│  Total HPP Jasa Rp 70.000│
│                         │
│  Nilai Bahan            │
│  MOTIF IMA      Rp 49.000│  ← primer: total yard / total pcs
│  POLOS          Rp 18.000│  ← sekunder: konsumsi × harga
│  ───────────────────────│
│  Total Bahan    Rp 67.000│
│                         │
│  Bahan Baku             │
│  Resleting      Rp  3.500│
│  Benang           Rp 500│
│  Kancing        Rp  1.000│
│  Hangtag          Rp 300│
│  Plastik          Rp 200│
│  ───────────────────────│
│  Total Bhn Baku  Rp 5.500│
│                         │
│  ═══════════════════════│
│  Total HPP/pcs Rp142.500│
│                         │
│  Harga Jual   Rp 210.000│
│  Margin            32%  │
│  Laba/pcs     Rp  67.500│
│  Total Laba  Rp7.492.500│
│  (111 pcs)              │
│                         │
│  (      Edit HPP      ) │
│  Menunggu review Jihan  │
│                         │
│  ( Bagikan ke WhatsApp )│  ← share breakdown HPP sbg teks terformat
│  ( Lihat Histori Revisi)│  ← tap → S-13b (muncul jika ada revisi)
│                         │
└─────────────────────────┘
```

---

## S-13b Histori Revisi HPP

*Muncul jika HPP pernah direvisi setelah ditolak Jihan. Menampilkan nilai lama vs baru per komponen, terlihat oleh Deera & Jihan.*

```
┌─────────────────────────┐
│  [ ← ]  Histori Revisi  │
│  J-001-IMA — HPP        │
│                         │
│  ┌─────────────────────┐│
│  │ 5 Jun · oleh Deera  ││
│  │ Alasan: "Harga bahan││
│  │  primer naik"       ││
│  │                     ││
│  │ Upah Produksi       ││
│  │  Rp 35.000→Rp40.000 ││
│  │ Nilai Bahan Primer  ││
│  │  Rp 45.000→Rp49.000 ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 2 Jun · oleh Deera  ││
│  │ Alasan: "Revisi awal││
│  │  setelah ditolak"   ││
│  │ ...                 ││
│  └─────────────────────┘│
│                         │
└─────────────────────────┘
```

> Diurutkan terbaru di atas. Setiap entri menampilkan komponen yang berubah, nilai lama → nilai baru, alasan, pengubah, dan waktu.

---

## S-14 Input HPP

```
┌─────────────────────────┐
│  [ ← ]  Input HPP       │
│  J-001-IMA              │
│                         │
│  HPP Jasa               │
│                         │
│  Upah Produksi          │
│  ◀────────●─────────▶   │
│  ┌─────────────────┐    │
│  │                 │    │  ← placeholder: nilai sebelumnya
│  └─────────────────┘    │
│  Rp 25.000 — Rp 50.000  │
│                         │
│  Overhead / Profit      │
│  ◀────────●─────────▶   │
│  ┌─────────────────┐    │
│  │                 │    │
│  └─────────────────┘    │
│  Rp 10.000 — Rp 30.000  │
│                         │
│  Staff                  │
│  ◀────────●─────────▶   │
│  ┌─────────────────┐    │
│  │                 │    │
│  └─────────────────┘    │
│  Rp 5.000 — Rp 15.000   │
│                         │
│  (+ Tambah Komponen)    │  ← custom per produksi
│                         │
│  Konsumsi Bahan Sekunder│
│                         │
│  POLOS                  │
│  ┌────────┐ per ┌──────┐│
│  │  3.35  │     │  2   ││  ← 3.35m per 2 baju
│  └────────┘     └──────┘│
│  Meter  Cm  Yard        │  ← pilih satuan
│  = 1.675m/pcs           │
│  = 1.832 yard/pcs       │
│                         │
│  Kalkulasi Real-time    │
│  ┌─────────────────────┐│
│  │ HPP Jasa   Rp 70.000││
│  │ Nilai Bahan Rp67.000││
│  │ Bahan Baku  Rp 5.500││
│  │ ─────────────────── ││
│  │ Total      Rp142.500││
│  │ Margin          32% ││
│  └─────────────────────┘│
│                         │
│  [ Kirim ke Jihan untuk ]│
│  [      Review HPP      ]│
│                         │
└─────────────────────────┘
```

---

## S-15 Detail Kode: Tab Produksi (Deera)

```
┌─────────────────────────┐
│  [ ← ]  J-001-IMA       │
│  Produksi               │
│                         │
│  Sampel  │  HPP  │  Prod│
│  ───────────────────    │
│                         │
│  MIDI                   │  ← seksi per ukuran
│                         │
│  Dipotong               │
│  NAVY    ██████████ 22/22│
│  HITAM   ██████████ 22/22│
│  HIJAU   ██████████ 22/22│
│                         │
│  Dijahit          [Update]
│  NAVY    ██████░░  18/22│
│  HITAM   ████░░░░  14/22│
│  HIJAU   ██░░░░░░   8/22│
│                         │
│  Finishing        [Update]
│  NAVY    ████░░░░  10/22│
│  HITAM   ██░░░░░░   5/22│
│  HIJAU   ░░░░░░░░   0/22│
│                         │
│  Siap Kirim       [Update]
│  NAVY    ██░░░░░░   5/22│
│  HITAM   ░░░░░░░░   0/22│
│  HIJAU   ░░░░░░░░   0/22│
│                         │
│  ─────────────────────  │
│  GAMIS                  │
│  (tampilan sama seperti │
│   MIDI di atas)         │
│                         │
│  Reject                 │
│  ┌─────────────────────┐│
│  │ Dijahit · NAVY MIDI ││
│  │ 2 pcs · Dipermak    ││
│  │ JAHITAN KENDUR      ││
│  └─────────────────────┘│
│                         │
│  Akan dikirim: 111 pcs  │
│  Sudah terkirim: 60 pcs │  ← akumulasi dari pengiriman yang disetujui
│                         │
│  [ Buat Rencana Kirim ] │  ← muncul walau finishing belum 100%
│  ( Riwayat Pengiriman ) │  ← tap → S-17c
│                         │
└─────────────────────────┘
```

> **Pengiriman parsial**: tombol "Buat Rencana Kirim" tidak menunggu status `siap_kirim` 100% — Deera bisa membuat rencana pengiriman untuk warna/jumlah yang sudah selesai (mis. 4 dari 5 warna, atau 10 pcs/warna). Status kode berubah menjadi `selesai` otomatis saat akumulasi pengiriman yang disetujui mencapai `jumlahAkhirDikirim`.

---

## S-16 Update Tahap Produksi

```
┌─────────────────────────┐
│  [ ← ]  Update Dijahit  │
│  J-001-IMA · MIDI · NAVY│  ← kode + ukuran + warna
│                         │
│  Sebelumnya: 18 pcs     │  ← read-only
│                         │
│  Pcs Selesai *          │
│  ┌─────────────────┐    │
│  │                 │    │  ← placeholder: 18
│  └─────────────────┘    │
│  Maks: 22 pcs           │
│                         │
│  Ada reject?            │
│  Tidak   Ya             │
│                         │
│  ── jika Ya ────────────│
│  ┌─────────────────────┐│
│  │ 2 pcs · Dipermak    ││  ← reject yang sudah ada
│  └─────────────────────┘│
│  (+ Tambah Reject)      │
│                         │
│  [    Simpan Update   ] │
│                         │
└─────────────────────────┘
```

---

## S-17 Form Reject

*Bottom sheet / modal dari bawah.*

```
┌─────────────────────────┐
│  ────                   │
│  Data Reject            │
│  Dijahit · MIDI · NAVY  │
│                         │
│  Jumlah Pcs Reject *    │
│  ┌─────────────────┐    │
│  │                 │    │
│  └─────────────────┘    │
│                         │
│  Alasan *               │
│  ┌─────────────────┐    │
│  │                 │    │  ← uppercase
│  └─────────────────┘    │
│                         │
│  Nasib Reject *         │
│  ┌─────────────────────┐│
│  │ Dipermak            ││
│  │ Masuk hitungan akhir││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ Produksi Ulang      ││
│  │ Butuh bahan lagi    ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ Waste               ││
│  │ Kurangi pengiriman  ││
│  └─────────────────────┘│
│                         │
│  ── jika Produksi Ulang─│
│  Bahan tersedia?        │
│  Ya    Tidak            │
│                         │
│  ⚠ Jika "Tidak":        │
│  sistem otomatis        │
│  membuat flag "Perlu    │
│  Bahan Tambahan" pada   │
│  kode ini & mengirim    │
│  notifikasi ke Tim Jihan│
│  dan Tim Deera          │
│                         │
│  ── jika Waste ─────────│
│  ┌─────────────────────┐│
│  │ 2 pcs dikurangi     ││
│  │ dari pengiriman     ││
│  │ (22 → 20 pcs)       ││
│  └─────────────────────┘│
│                         │
│  [ Simpan Data Reject ] │
│                         │
└─────────────────────────┘
```

---

## S-17b Buat Rencana Pengiriman

*Diakses dari S-15 → "Buat Rencana Kirim". Granularitas bisa per-warna (kirim semua pcs warna tsb) atau sebagian pcs dalam satu warna.*

```
┌─────────────────────────┐
│  [ ← ]  Rencana Kirim   │
│  J-001-IMA              │
│                         │
│  Tanggal Rencana *      │
│  ┌─────────────────┐    │
│  │ 8 Juni 2026     │    │
│  └─────────────────┘    │
│                         │
│  Pilih yang akan dikirim│
│                         │
│  NAVY      111 siap     │
│  ┌─────────────────┐    │
│  │ Kirim semua  ☑  │    │  ← toggle: semua warna sekaligus
│  │ atau sebagian:  │    │
│  │ ┌─────────────┐ │    │
│  │ │   30  / 30  │ │    │  ← input jumlah pcs (maks = siap kirim)
│  │ └─────────────┘ │    │
│  └─────────────────┘    │
│                         │
│  HITAM     30 siap      │
│  ┌─────────────────┐    │
│  │ Kirim semua  ☐  │    │
│  │ ┌─────────────┐ │    │
│  │ │   10  / 30  │ │    │
│  │ └─────────────┘ │    │
│  └─────────────────┘    │
│                         │
│  HIJAU      0 siap      │
│  (belum bisa dikirim)   │
│                         │
│  Catatan                │
│  ┌─────────────────┐    │
│  │                 │    │  ← uppercase
│  └─────────────────┘    │
│                         │
│  ── Ringkasan ──────────│
│  Total akan dikirim:    │
│  40 pcs (NAVY 30, HITAM │
│  10)                    │
│                         │
│  [ Kirim untuk Approval ]│
│  Permintaan akan dikirim│
│  ke Tim Jihan untuk     │
│  disetujui sebelum      │
│  barang dikirim         │
│                         │
└─────────────────────────┘
```

---

## S-17c Riwayat & Approval Pengiriman

*Untuk Deera: melihat status seluruh rencana pengiriman suatu kode. Untuk Jihan: layar yang sama dipakai untuk menyetujui/menolak (lihat S-25).*

```
┌─────────────────────────┐
│  [ ← ]  Riwayat Kirim   │
│  J-001-IMA              │
│                         │
│  Akan dikirim total:111 │
│  Sudah terkirim:     60 │
│  ████████░░░░░░░░░░ 54% │
│                         │
│  ┌─────────────────────┐│
│  │ 8 Jun · Menunggu    ││
│  │ NAVY 30 · HITAM 10  ││
│  │ ⏳ Menunggu approval││
│  │   Tim Jihan         ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 5 Jun · Disetujui   ││
│  │ NAVY 60             ││
│  │ ✓ Diterima Jihan    ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 3 Jun · Ditolak     ││
│  │ HIJAU 30            ││
│  │ ✕ "Belum siap warna ││
│  │    ini, tunda dulu" ││
│  └─────────────────────┘│
│                         │
└─────────────────────────┘
```

> Saat akumulasi pengiriman yang **disetujui** mencapai `jumlahAkhirDikirim`, status kode otomatis berubah menjadi `selesai` dan Tim Jihan menerima notifikasi.

---

## S-18 Daftar Nota

```
┌─────────────────────────┐
│  [ ← ]  Nota Bahan Baku │
│                  [+ Baru]│
│                         │
│  ┌─────────────────────┐│
│  │ 7 Juni 2026         ││
│  │ Untuk: J-001-IMA    ││
│  │ 5 item · Rp 487.000 ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 31 Mei 2026         ││
│  │ Untuk: J-002, J-003 ││
│  │ 3 item · Rp 210.000 ││
│  └─────────────────────┘│
│                         │
└─────────────────────────┘
```

---

## S-19 Buat Nota Bahan Baku

```
┌─────────────────────────┐
│  [ ← ]  Buat Nota       │
│                         │
│  Tanggal *              │
│  ┌─────────────────┐    │
│  │ 7 Juni 2026     │    │
│  └─────────────────┘    │
│                         │
│  Catatan                │
│  ┌─────────────────┐    │
│  │                 │    │  ← uppercase
│  └─────────────────┘    │
│                         │
│  Item Pembelian         │
│                         │
│  Item 1                 │
│  Bahan Baku *           │
│  ┌─────────────────┐    │
│  │ Cari katalog... │    │  ← dropdown + manual
│  └─────────────────┘    │
│                         │
│  Tipe                   │
│  Unit-based   Usage-based│  ← radio
│                         │
│  ── jika Unit-based ────│
│  Qty        Harga/satuan│
│  ┌──────┐  ┌──────────┐ │
│  │      │  │ Rp       │ │
│  └──────┘  └──────────┘ │
│                         │
│  ── jika Usage-based ───│
│  Total Nilai Belanja    │
│  ┌─────────────────┐    │
│  │ Rp              │    │
│  └─────────────────┘    │
│                         │
│  Untuk Kode             │
│  ┌─────────────────────┐│
│  │ J-001-IMA   10pcs x ││  ← multi-select kode + total pcs masing²
│  │ J-002-IMA   28pcs x ││
│  │ + Tambah Kode       ││
│  └─────────────────────┘│
│                         │
│  ── Preview Alokasi ────│
│  Resleting · qty 30     │
│  Total pcs gabungan: 38 │
│  Sisa: 30−38 → tak ada  │  ← contoh lain: qty dibeli > total pcs
│  sisa (kurang 8, sistem │
│  tetap pakai data buku  │
│  potong sbg acuan pcs)  │
│                         │
│  cth lain — qty 30,     │
│  total pcs gabungan 28: │
│  Sisa 2 ÷ 2 kode = 1    │
│  J-001-IMA: 10+1=11pcs  │
│   → 11÷10 × Rp3.500     │
│   = Rp 3.850/pcs        │
│  J-002-IMA: 18+1=19pcs  │
│   → 19÷18 × Rp3.500     │
│   = Rp 3.694/pcs        │
│                         │
│  (+ Tambah Item)        │
│                         │
│  [    Simpan Nota     ] │
│                         │
└─────────────────────────┘
```

> **Alokasi lintas kode**: setiap kode mendapat alokasi dasar = total pcs miliknya sendiri; kelebihan qty pembelian dibagi rata ke seluruh kode dalam nota. Lihat formula `alokasikanQtyLintasKode()` di architecture.md.

---

## S-20 Katalog Bahan Baku

```
┌─────────────────────────┐
│  [ ← ]  Katalog Bahan   │
│                  [+ Baru]│
│                         │
│  ┌─────────────────┐    │
│  │ Cari katalog... │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────────┐│
│  │ RESLETING           ││
│  │ Unit · Rp 3.500/pcs ││  ← harga terkini
│  │ Update: 7 Jun 2026  ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ BENANG JAHIT        ││
│  │ Usage               ││
│  │ Update: 31 Mei 2026 ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ KANCING             ││
│  │ Unit · Rp 200/pcs   ││
│  └─────────────────────┘│
│                         │
│  ── Buat Item Baru ─────│
│  Nama *                 │
│  ┌─────────────────┐    │
│  │                 │    │  ← uppercase
│  └─────────────────┘    │
│  Tipe: Unit   Usage     │
│  Satuan (opsional)      │
│  ┌─────────────────┐    │
│  │ PCS             │    │  ← uppercase
│  └─────────────────┘    │
│  [ Simpan ]             │
│                         │
└─────────────────────────┘
```

---

## S-21 Dashboard Jihan

```
┌─────────────────────────┐
│  Jihan Production  [1]  │
│                         │
│  ┌─────────────────────┐│
│  │  3 Produksi Aktif   ││
│  │  1 Perlu Keputusanmu││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ Saldo Kasbon        ││
│  │ Rp 725.000      >   ││  ← tap → S-35 Beranda Kasbon (read-only)
│  └─────────────────────┘│
│                         │
│  Perlu Keputusanmu      │
│                         │
│  ┌─────────────────────┐│
│  │ Review HPP          ││
│  │ J-004-KAT           ││
│  │ Total Cost Rp142.500││
│  │ [ Lihat HPP ]       ││
│  └─────────────────────┘│
│                         │
│  Sedang Diproduksi      │
│                         │
│  ┌─────────────────────┐│
│  │ J-001-IMA           ││
│  │ Dijahit · 70%       ││
│  │ ████████░░          ││
│  └─────────────────────┘│
│                         │
│ ─────────────────────── │
│  Beranda  Produksi  Akun│
└─────────────────────────┘
```

---

## S-22 Daftar Produksi (Jihan)

```
┌─────────────────────────┐
│  Produksi               │  ← tidak ada tombol + Baru
│                         │
│  ┌─────────────────────┐│
│  │ Cari kode / bahan   ││
│  └─────────────────────┘│
│                         │
│  Semua   Aktif   Selesai│
│                         │
│  01 Jun – 30 Jun 2026   │
│                         │
│  ┌─────────────────────┐│
│  │ Batch IMA · 5 Jun   ││
│  │ J-001-IMA  Produksi ││
│  │ J-002-IMA  HPP      ││
│  │ J-003-IMA  Sampel   ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ Batch KAT · 3 Jun   ││
│  │ J-004-KAT  HPP      ││
│  └─────────────────────┘│
│                         │
│ ─────────────────────── │
│  Beranda  Produksi  Akun│
└─────────────────────────┘
```

---

## S-23 Detail Kode: Tab Sampel (Jihan)

```
┌─────────────────────────┐
│  [ ← ]  J-001-IMA       │
│  Review Sampel          │
│                         │
│  Sampel  │  HPP  │  Prod│
│  ───────────────────    │
│                         │
│  ┌─────────────────────┐│
│  │                     ││
│  │    Foto Depan       ││  ← full-width, swipe → belakang
│  │                     ││
│  └─────────────────────┘│
│         ● ○             │  ← depan / belakang
│                         │
│  Versi 2 · 4 Jun 2026   │
│                         │
│  [ Bagikan ke WA ]      │
│                         │
│  Catatan                │
│  Tim Deera · 4 Jun      │
│  SUDAH DIREVISI KERAH   │
│                         │
│  ┌─────────────────────┐│
│  │ Tulis catatan...    ││  ← Jihan bisa tambah catatan
│  └─────────────────────┘│
│                         │
│  ═══════════════════════│
│  [ Setujui Sampel ]     │
│  ( Tolak Sampel   )     │  ← tap → S-28 Modal Tolak
│                         │
│  Histori                │
│  Versi 1 — Ditolak      │
│  KERAH TERLALU BESAR    │
│                         │
│  ( Bandingkan Versi   ) │  ← tap → S-10b Perbandingan Sampel
│                         │
└─────────────────────────┘
```

---

## S-24 Detail Kode: Tab HPP (Jihan)

```
┌─────────────────────────┐
│  [ ← ]  J-001-IMA       │
│  Review HPP             │
│                         │
│  Sampel  │  HPP  │  Prod│
│  ───────────────────    │
│                         │
│  HPP Jasa               │
│  Upah Produksi  Rp 40.000│
│  Overhead       Rp 20.000│
│  Staff          Rp 10.000│
│  ───────────────────────│
│  Total HPP Jasa Rp 70.000│
│                         │
│  Nilai Bahan            │
│  MOTIF IMA      Rp 49.000│
│  POLOS          Rp 18.000│
│  ───────────────────────│
│  Total Bahan    Rp 67.000│
│                         │
│  Bahan Baku             │
│  Resleting  1pcs Rp 3.500│
│  Benang          Rp   500│
│  Kancing  5pcs   Rp 1.000│
│  Hangtag  1pcs   Rp   300│
│  Plastik  1pcs   Rp   200│
│  ───────────────────────│
│  Total Bhn Baku  Rp 5.500│
│                         │
│  ═══════════════════════│
│  Total HPP/pcs Rp142.500│
│                         │
│  Harga Jual   Rp 210.000│
│  Margin            32%  │
│  Laba/pcs     Rp  67.500│
│  Total Laba  Rp7.492.500│
│                         │
│  ═══════════════════════│
│  [ Setujui HPP,         ]│
│  [   Lanjut Produksi    ]│
│  ( Tolak HPP            )│  ← tap → S-28 Modal Tolak
│                         │
│  ( Bagikan ke WhatsApp )│  ← share breakdown HPP sbg teks terformat
│  ( Lihat Histori Revisi)│  ← tap → S-13b (muncul jika ada revisi)
│                         │
└─────────────────────────┘
```

---

## S-25 Detail Kode: Tab Produksi (Jihan)

*Identik dengan S-15 tapi tanpa tombol Update. Saat ada rencana pengiriman menunggu, kartu approval muncul menggantikan area aksi Deera.*

```
┌─────────────────────────┐
│  [ ← ]  J-001-IMA       │
│  Produksi               │
│                         │
│  Sampel  │  HPP  │  Prod│
│  ───────────────────    │
│                         │
│  MIDI                   │
│                         │
│  Dipotong               │
│  NAVY    ██████████ 22/22│
│  HITAM   ██████████ 22/22│
│  HIJAU   ██████████ 22/22│
│                         │
│  Dijahit                │
│  NAVY    ██████░░  18/22│
│  HITAM   ████░░░░  14/22│
│  HIJAU   ██░░░░░░   8/22│
│                         │
│  Finishing              │
│  NAVY    ████░░░░  10/22│
│  HITAM   ██░░░░░░   5/22│
│  HIJAU   ░░░░░░░░   0/22│
│                         │
│  Siap Kirim             │
│  NAVY    ██░░░░░░   5/22│
│  HITAM   ░░░░░░░░   0/22│
│  HIJAU   ░░░░░░░░   0/22│
│                         │
│  Reject                 │
│  ┌─────────────────────┐│
│  │ Dijahit · NAVY MIDI ││
│  │ 2 pcs · Dipermak    ││
│  │ JAHITAN KENDUR      ││
│  └─────────────────────┘│
│                         │
│  Akan dikirim: 111 pcs  │
│  Sudah terkirim: 60 pcs │
│                         │
│  ┌─────────────────────┐│
│  │ ⏳ Permintaan Kirim ││
│  │ 8 Jun · NAVY 30,    ││
│  │ HITAM 10 (40 pcs)   ││
│  │                     ││
│  │ [ Setujui Kirim ]   ││
│  │ ( Tolak — beri      ││
│  │   alasan )          ││
│  └─────────────────────┘│
│                         │
│  ( Riwayat Pengiriman ) │  ← tap → S-17c (read-only bagi Jihan)
│                         │
└─────────────────────────┘
```

> Persetujuan pengiriman wajib dilakukan sebelum barang difisik dikirim oleh Deera. Penolakan memerlukan alasan singkat (mis. "warna ini belum saya cek langsung"). Saat akumulasi pengiriman yang disetujui mencapai `jumlahAkhirDikirim`, status kode otomatis menjadi `selesai`.

---

## S-26 Kalkulator HPP & Konverter

```
┌─────────────────────────┐
│  Kalkulator HPP         │
│                         │
│  Kalkulasi  │ Konverter │  ← tab
│  ─────────────────────  │
│                         │
│  ── Tab Kalkulasi ──────│
│                         │
│  HPP Jasa               │
│  Upah      ┌──────────┐ │
│            │          │ │
│            └──────────┘ │
│  Overhead  ┌──────────┐ │
│            │          │ │
│            └──────────┘ │
│  Staff     ┌──────────┐ │
│            │          │ │
│            └──────────┘ │
│                         │
│  Nilai Bahan            │
│  ┌─────────────────┐    │
│  │ Rp              │    │  ← input total nilai bahan
│  └─────────────────┘    │
│                         │
│  Bahan Baku             │
│  ┌─────────────────┐    │
│  │ Rp              │    │  ← input total bahan baku
│  └─────────────────┘    │
│                         │
│  Harga Jual Target      │
│  ┌─────────────────┐    │
│  │ Rp              │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────────┐│
│  │ Total HPP/pcs  Rp--  ││
│  │ Margin           --% ││
│  │ Laba/pcs       Rp--  ││
│  └─────────────────────┘│
│                         │
└─────────────────────────┘
```

```
┌─────────────────────────┐
│  Kalkulator HPP         │
│                         │
│  Kalkulasi  │ Konverter │
│  ─────────────────────  │
│                         │
│  ── Tab Konverter ──────│
│                         │
│  Ke Yard                │
│                         │
│  Meter   ┌──────┐ = ┌──┐│
│          │      │   │yd││  ← real-time
│          └──────┘   └──┘│
│                         │
│  Cm      ┌──────┐ = ┌──┐│
│          │      │   │yd││
│          └──────┘   └──┘│
│                         │
│  Dari Yard              │
│                         │
│  Yard    ┌──────┐ = ┌──┐│
│          │      │   │m ││
│          └──────┘   └──┘│
│                         │
│  Yard    ┌──────┐ = ┌──┐│
│          │      │   │cm││
│          └──────┘   └──┘│
│                         │
└─────────────────────────┘
```

---

## S-27 Inbox Notifikasi

```
┌─────────────────────────┐
│  [ ← ]  Notifikasi      │
│         Tandai Semua    │  ← hanya muncul jika ada belum dibaca
│                         │
│  Belum Dibaca           │
│                         │
│  ┌─────────────────────┐│
│  │ HPP Disetujui       ││  ← dot biru = belum dibaca
│  │ J-001-IMA           ││
│  │ Jihan menyetujui HPP││
│  │ Baru saja           ││
│  └─────────────────────┘│
│                         │
│  Sebelumnya             │
│                         │
│  ┌─────────────────────┐│
│  │ Sampel Ditolak      ││
│  │ J-002-IMA           ││
│  │ KERAH TERLALU BESAR ││
│  │ 4 Jun · 14:23       ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ Produksi Update     ││
│  │ J-001-IMA           ││
│  │ Dijahit MIDI selesai││
│  │ 4 Jun · 10:05       ││
│  └─────────────────────┘│
│                         │
│  Swipe kiri untuk hapus │
│                         │
└─────────────────────────┘
```

> **Tim Jihan, mode Ringkasan Harian**: inbox tetap menampilkan notifikasi individual seperti di atas. Selain itu satu kartu "Ringkasan Hari Ini · 08:00" muncul di paling atas berisi rangkuman seluruh event sejak ringkasan terakhir — bisa diatur di S-34b Mode Notifikasi.

---

## S-28 Modal Tolak

*Bottom sheet langsung saat tap Tolak (tanpa konfirmasi terpisah).*

```
┌─────────────────────────┐
│  ────                   │
│                         │
│  Tolak Sampel           │  ← atau "Tolak HPP"
│  J-001-IMA              │
│                         │
│  Alasan penolakan *     │
│  ┌─────────────────┐    │
│  │                 │    │  ← uppercase, wajib diisi
│  │                 │    │
│  └─────────────────┘    │
│                         │
│  [ Konfirmasi Tolak ]   │  ← disabled jika kosong
│  (      Batal       )   │
│                         │
└─────────────────────────┘
```

---

## S-29 Pengaturan Deera

```
┌─────────────────────────┐
│  Pengaturan             │
│                         │
│  ┌─────────────────────┐│
│  │ DENI KURNIAWAN      ││
│  │ deni@deera.com      ││
│  │ Tim Deera           ││
│  └─────────────────────┘│
│                         │
│  Akun                   │
│  Ganti Password     >   │
│                         │
│  Sistem                 │
│  Template HPP       >   │
│  Katalog Bahan Baku >   │
│  Kelola Pengguna    >   │
│  Activity Log       >   │
│  Data Terhapus      >   │
│                         │
│  Aplikasi               │
│  Notifikasi     Aktif   │
│  Versi 1.0.0            │
│                         │
│  (       Keluar       ) │
│                         │
│ ─────────────────────── │
│  Beranda  Produksi  HPP  Atur│
└─────────────────────────┘
```

---

## S-30 Template HPP

```
┌─────────────────────────┐
│  [ ← ]  Template HPP   │
│                         │
│  Range ini menjadi      │
│  batas slider HPP di    │
│  semua produksi.        │
│                         │
│  Upah Produksi          │
│  Min          Max       │
│  ┌────────┐  ┌────────┐ │
│  │        │  │        │ │  ← placeholder: nilai saat ini
│  └────────┘  └────────┘ │
│                         │
│  Overhead / Profit      │
│  ┌────────┐  ┌────────┐ │
│  │        │  │        │ │
│  └────────┘  └────────┘ │
│                         │
│  Staff                  │
│  ┌────────┐  ┌────────┐ │
│  │        │  │        │ │
│  └────────┘  └────────┘ │
│                         │
│  Komponen Tambahan      │
│  (bisa ditambah per     │
│   produksi secara       │
│   terpisah)             │
│                         │
│  [  Simpan Template  ]  │
│                         │
└─────────────────────────┘
```

---

## S-31 Kelola Pengguna

```
┌─────────────────────────┐
│  [ ← ]  Kelola Pengguna │
│                 [+ Undang]
│                         │
│  ┌─────────────────────┐│
│  │ JIHAN AMELIA        ││
│  │ jihan@toko.com      ││
│  │ Aktif               ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ SITI RAHMA          ││
│  │ siti@toko.com       ││
│  │ Belum Aktivasi      ││
│  │ (Kirim Ulang)       ││
│  └─────────────────────┘│
│                         │
│  ── Undang Pengguna ────│
│  Email *                │
│  ┌─────────────────┐    │
│  │                 │    │
│  └─────────────────┘    │
│  [ Kirim Undangan ]     │
│                         │
└─────────────────────────┘
```

---

## S-32 Activity Log

```
┌─────────────────────────┐
│  [ ← ]  Activity Log   │
│                         │
│  Hari ini   Semua user  │  ← filter chips
│                         │
│  5 Juni 2026            │
│                         │
│  ┌─────────────────────┐│
│  │ 14:23 · DENI        ││
│  │ Update dijahit      ││
│  │ MIDI NAVY J-001-IMA ││
│  │ 18 → 20 pcs         ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 11:05 · DENI        ││
│  │ Approve HPP         ││
│  │ J-001-IMA           ││
│  └─────────────────────┘│
│                         │
│  4 Juni 2026            │
│                         │
│  ┌─────────────────────┐│
│  │ 09:30 · DENI        ││
│  │ Buat produksi baru  ││
│  │ Batch IMA           ││
│  └─────────────────────┘│
│                         │
└─────────────────────────┘
```

---

## S-33 Data Terhapus

```
┌─────────────────────────┐
│  [ ← ]  Data Terhapus  │
│                         │
│  ┌─────────────────────┐│
│  │ J-005-KAT           ││
│  │ Kode · Batch KAT    ││
│  │ Dihapus 4 Jun 2026  ││
│  │ (Pulihkan) (Hapus)  ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ Batch RAY           ││
│  │ Produksi · 3 kode   ││
│  │ Dihapus 1 Jun 2026  ││
│  │ (Pulihkan) (Hapus)  ││
│  └─────────────────────┘│
│                         │
│  ── Modal Hapus Permanen│
│  ┌─────────────────────┐│
│  │ J-005-KAT tidak bisa││
│  │ dikembalikan lagi.  ││
│  │ [ Hapus Selamanya ] ││
│  │ (      Batal      ) ││
│  └─────────────────────┘│
│                         │
└─────────────────────────┘
```

---

## S-34 Pengaturan Jihan

```
┌─────────────────────────┐
│  Pengaturan             │
│                         │
│  ┌─────────────────────┐│
│  │ JIHAN AMELIA        ││
│  │ jihan@toko.com      ││
│  │ Tim Jihan           ││
│  └─────────────────────┘│
│                         │
│  Akun                   │
│  Ganti Password     >   │
│                         │
│  Aplikasi               │
│  Notifikasi         >   │  ← tap → S-34b Mode Notifikasi
│  Pasang ke Layar Utama >│  ← tap → S-34c Panduan Instal PWA
│  Versi 1.0.0            │
│                         │
│  (       Keluar       ) │
│                         │
│ ─────────────────────── │
│  Beranda  Produksi  Akun│
└─────────────────────────┘
```

---

## S-34b Mode Notifikasi (Jihan)

```
┌─────────────────────────┐
│  [ ← ]  Notifikasi      │
│                         │
│  Cara menerima notif    │
│                         │
│  ┌─────────────────────┐│
│  │ ◉ Real-time         ││
│  │   Setiap ada        ││
│  │   pembaruan         ││
│  └─────────────────────┘│
│  ┌─────────────────────┐│
│  │ ○ Ringkasan Harian  ││
│  │   1× sehari, jam    ││
│  │   bisa diatur       ││
│  │                     ││
│  │   Kirim jam:        ││
│  │   ┌─────────────┐   ││
│  │   │   08 : 00   │   ││  ← muncul jika dipilih
│  │   └─────────────┘   ││
│  └─────────────────────┘│
│                         │
│  [     Simpan        ]  │
│                         │
└─────────────────────────┘
```

> Mode "Ringkasan Harian" tidak menggantikan inbox — Jihan tetap menerima notifikasi individual di S-27, namun juga mendapat satu rangkuman terjadwal (default 08:00) berisi seluruh event sejak ringkasan terakhir.

---

## S-34c Panduan Instal ke Layar Utama (PWA)

*Onboarding sederhana untuk Tim Jihan — gaptek-friendly, langkah visual per platform.*

```
┌─────────────────────────┐
│  [ ← ]  Pasang Aplikasi │
│                         │
│  Pasang Jihan Production│
│  ke layar utama HP agar │
│  lebih mudah dibuka,    │
│  seperti aplikasi biasa.│
│                         │
│  Pilih HP kamu:         │
│  ┌──────────┐┌─────────┐│
│  │ iPhone ◉ ││Android ○││
│  └──────────┘└─────────┘│
│                         │
│  ── Langkah (iPhone) ───│
│  1. Buka Safari, lalu   │
│     tap ikon Bagikan    │
│     (kotak + panah)     │
│     [ ilustrasi ]       │
│                         │
│  2. Pilih "Tambah ke    │
│     Layar Utama"        │
│     [ ilustrasi ]       │
│                         │
│  3. Tap "Tambah" di     │
│     pojok kanan atas    │
│     [ ilustrasi ]       │
│                         │
│  Selesai! Ikon muncul   │
│  di layar utama HP kamu.│
│                         │
│  [   Sudah, Selesai   ] │
│                         │
└─────────────────────────┘
```

> Konten langkah berubah sesuai pilihan platform (iPhone/Android). Dapat diakses ulang kapan saja dari Pengaturan.

---

## S-35 Beranda Kasbon (Histori & Saldo)

*Diakses dari kartu "Saldo Kasbon" di Dashboard — sama untuk Deera & Jihan, beda hanya tombol aksi (lihat catatan di bawah).*

```
┌─────────────────────────┐
│  [ ← ]   Kasbon         │
│                         │
│  ┌─────────────────────┐│
│  │   Saldo Saat Ini    ││
│  │                     ││
│  │   Rp 725.000        ││  ← angka besar, gold accent
│  │                     ││
│  └─────────────────────┘│
│                         │
│  [ + Catat Kasbon Masuk]│  ← hanya tampil utk Deera; tap → S-35b
│                         │
│  Riwayat                │
│                         │
│  ┌─────────────────────┐│
│  │ 12 Jun · Masuk    + ││
│  │ Rp 5.000.000        ││
│  │ "DP BAHAN PRODUKSI  ││
│  │  JUNI"              ││
│  │ Saldo: Rp 5.000.000 ││
│  └─────────────────────┘│
│                         │
│  ┌─────────────────────┐│
│  │ 18 Jun · Potongan − ││
│  │ Rp 4.275.000        ││
│  │ Otomatis            ││
│  │ "J-001-IMA SELESAI  ││
│  │  (30 PCS × RP142.5K)││
│  │ Saldo: Rp   725.000 ││
│  │ ( Lihat Detail Kode)││  ← tap → Detail Kode J-001-IMA
│  └─────────────────────┘│
│                         │
│ ─────────────────────── │
│  Beranda  Produksi  ⋯   │
└─────────────────────────┘
```

> **Beda tampilan Deera vs Jihan**: Deera melihat tombol "+ Catat Kasbon Masuk" di bagian atas; Jihan **tidak** melihat tombol ini — murni read-only (hanya bisa scroll & tap kartu "Potongan Otomatis" untuk transparansi sumber). Entri "Masuk" berlatar netral dengan tanda `+` warna `success`; entri "Potongan Otomatis" berlatar sedikit berbeda (mis. tint `champagne-200`) dengan tanda `−` warna `danger`, agar kedua jenis mudah dibedakan sekilas — selaras prinsip "warna selalu disertai label teks".
>
> Saldo dihitung & ditampilkan **real-time** dari ledger (lihat `hitungSaldoKasbon` di architecture.md) — bukan kolom tersimpan terpisah.

---

## S-35b Catat Kasbon Masuk (Deera)

*Form sederhana — hanya untuk mencatat nominal yang SUDAH diterima Deera. Tidak ada alur request/approve karena negosiasi & transfer dana terjadi di luar sistem.*

```
┌─────────────────────────┐
│  [ ← ]  Catat Kasbon    │
│                         │
│  Tanggal Diterima       │
│  ┌─────────────────────┐│
│  │ 12 / 06 / 2026      ││  ← date picker, default hari ini
│  └─────────────────────┘│
│                         │
│  Nominal Diterima       │
│  ┌─────────────────────┐│
│  │ Rp                  ││  ← input manual, format Rp otomatis
│  └─────────────────────┘│
│                         │
│  Catatan (opsional)     │
│  ┌─────────────────────┐│
│  │ DP BAHAN PRODUKSI   ││  ← otomatis UPPERCASE
│  │ JUNI                ││
│  └─────────────────────┘│
│                         │
│  Saldo akan menjadi:    │
│  Rp 5.725.000           │  ← preview real-time, gold accent
│                         │
│  [   Simpan Catatan   ] │
│                         │
└─────────────────────────┘
```

> Setelah disimpan: entri masuk ke histori (S-35), saldo bertambah otomatis, dan Tim Jihan menerima notifikasi "Kasbon baru dicatat: Rp 5.000.000" untuk transparansi. Tidak ada validasi terhadap pihak Jihan di sistem — cukup catatan jujur dari Deera, sesuai semangat kerja sama yang sudah berjalan di luar sistem.

---

## Ringkasan Navigasi

### Tim Deera — Bottom Nav (4 tab)
| Tab | Halaman |
|-----|---------|
| Beranda | Dashboard Deera |
| Produksi | Daftar Produksi |
| HPP | Kalkulator HPP & Konverter |
| Atur | Pengaturan Deera |

### Tim Jihan — Bottom Nav (3 tab)
| Tab | Halaman |
|-----|---------|
| Beranda | Dashboard Jihan |
| Produksi | Daftar Produksi (read-only) |
| Akun | Pengaturan Jihan |

### Akses Global
- Badge notifikasi di header → S-27 Inbox Notifikasi

---

## Catatan Desain

1. Semua input teks uppercase otomatis, kecuali email dan password
2. Input angka: slider + manual sinkron. Nilai lama jadi placeholder, bukan pre-fill
3. Modal tolak muncul langsung dengan form alasan — tidak ada "apakah yakin?" terpisah
4. Progress produksi per ukuran per warna — tiga dimensi terlihat jelas
5. Siap kirim per kode — bukan per produksi
6. HPP dua lapis: HPP Jasa + Nilai Bahan + Bahan Baku, selalu terperinci
7. Bahan primer dan sekunder dibedakan visual di Tab HPP
8. Minim icon — label teks selalu ada, icon hanya sebagai pelengkap
9. Tim Jihan murni read-only di Tab Produksi untuk progress & update tahap — satu-satunya aksi yang tersedia adalah menyetujui/menolak rencana pengiriman (lihat S-25), karena ini memerlukan keputusan Jihan
10. Status "Dibatalkan" tampil sebagai badge abu-abu dengan keterangan status sebelumnya — bukan penghapusan data
11. Pengiriman boleh parsial (per warna atau sebagian pcs dalam satu warna), tapi selalu menunggu persetujuan eksplisit Tim Jihan sebelum barang difisik dikirim
12. Histori revisi HPP & perbandingan sampel terlihat oleh kedua tim — transparansi dua arah
13. Kasbon (S-35/S-35b): satu-satunya "uang" yang dicatat sistem (pengecualian terbatas — lihat CLAUDE.md § Kasbon). Saldo & histori tampil sama persis untuk Deera & Jihan (transparansi penuh, ledger tunggal); satu-satunya beda adalah tombol "+ Catat Kasbon Masuk" yang hanya muncul untuk Deera. Tidak diberi tab navigasi sendiri — diakses via kartu ringkas di Dashboard, agar bottom nav tetap minim
