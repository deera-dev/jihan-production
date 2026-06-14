# Checklist Verifikasi RLS — Jihan Production

Dokumen ini menyertai `rls_test.sql`. Sebagian verifikasi bisa dijalankan murni
lewat SQL (skrip akan menyatakan **OK** / **BUG** lewat `NOTICE`/`EXCEPTION`),
sebagian lain perlu dicoba langsung di aplikasi (klik sebagai user sungguhan).

Jalankan setelah migration `0001`–`0013` + `seed.sql` berhasil, dan setelah
ada minimal: 1 akun `deera`, 1 akun `jihan`, serta beberapa data contoh
(produksi, kode, sampel, hpp, kasbon) — supaya pengecekan tidak banyak yang
"DILEWATI" karena tabel kosong.

---

## A. Verifikasi via `rls_test.sql` (otomatis)

Jalankan PART 1–3 di Supabase SQL Editor (lihat instruksi di kepala file).
Tandai setiap baris berikut setelah hasil sesuai ekspektasi:

### PART 1 — Statis (katalog sistem)
- [ ] Semua 27 tabel domain & `users` punya `rls_aktif = true` (query 1a)
- [ ] Setiap tabel pola umum (22 tabel) punya persis 2 policy: `deera_full_*` (ALL) & `jihan_read_*` (SELECT)
- [ ] `kode`, `hpp`, `pengiriman` masing-masing punya tambahan `jihan_update_*` (UPDATE)
- [ ] `sampel_catatan` punya tambahan `jihan_insert_sampel_catatan` (INSERT)
- [ ] `kasbon` HANYA punya `deera_full_kasbon` + `jihan_read_kasbon` — tidak ada policy tulis utk Jihan
- [ ] `notifications`, `notification_preferences`, `push_subscriptions` hanya punya policy `own_*`
- [ ] `activity_log` HANYA punya `deera_only_activity_log`
- [ ] `users` punya `users_select_all_authenticated` + `users_update_own_profile`

### PART 2 — Simulasi sebagai Deera
- [ ] `is_deera()` → `true`, `is_jihan()` → `false`
- [ ] SELECT ke `produksi`, `kode`, `hpp`, `kasbon`, `activity_log` semua berhasil (tanpa error)
- [ ] INSERT ke `produksi` berhasil (full CRUD — Create)
- [ ] UPDATE baris yang baru dibuat berhasil (full CRUD — Update)
- [ ] DELETE baris yang baru dibuat berhasil (full CRUD — Delete)
- [ ] Transaksi di-`ROLLBACK` — cek di akhir bahwa tidak ada baris `'PRODUKSI UJI RLS...'` tersisa:
      `select * from public.produksi where catatan ilike '%UJI RLS%';` → harus 0 baris

### PART 3 — Simulasi sebagai Jihan
- [ ] `is_deera()` → `false`, `is_jihan()` → `true`
- [ ] SELECT ke tabel domain biasa (`produksi`, `kode`, `hpp`, `kasbon`) berhasil & mengembalikan data
- [ ] SELECT ke `activity_log` berhasil dijalankan TAPI mengembalikan **0 baris** (bukan error — RLS menyaring total)
- [ ] Percobaan INSERT ke `produksi` menghasilkan `NOTICE 'OK — insert Jihan ke produksi ditolak...'`
- [ ] Percobaan INSERT ke `sampel_catatan` menghasilkan `NOTICE 'OK — Jihan berhasil menambah catatan sampel...'`
- [ ] Percobaan UPDATE ke `kode` (status) menghasilkan `NOTICE 'OK — Jihan diizinkan UPDATE baris kode...'`
- [ ] Percobaan UPDATE ke `kasbon` menghasilkan `NOTICE 'OK — Jihan ditolak mengubah entri kasbon...'`
- [ ] `notif_milik_orang_lain` = 0 (Jihan tidak bisa lihat notifikasi user lain)
- [ ] Transaksi di-`ROLLBACK` — tidak ada perubahan yang tersisa

> Jika ada `NOTICE` berbunyi **"BUG RLS: ..."** atau **"DILEWATI"**, catat dan
> tindak lanjuti: "BUG" berarti policy bocor (perbaiki migration 0012);
> "DILEWATI" berarti perlu data contoh dulu sebelum bisa diuji penuh.

---

## B. Verifikasi manual via aplikasi (login sungguhan)

Hal-hal berikut sebaiknya dicoba langsung di UI dengan akun Deera & Jihan asli
— karena melibatkan kombinasi RLS + application layer (mis. pembatasan kolom
yang tidak bisa ditegakkan murni oleh RLS pada `UPDATE`).

### Sebagai Tim Deera
- [ ] Bisa membuat, mengubah, menghapus (soft delete) seluruh entitas: produksi, kode, sampel, HPP, nota, tracking, pengiriman, kasbon
- [ ] Bisa melihat **Activity Log**
- [ ] Bisa mengelola template HPP & akun pengguna (invite Tim Jihan)
- [ ] Entri kasbon `potongan_otomatis` muncul di histori tapi **tidak bisa** diedit/dihapus dari UI Deera sendiri (diblok trigger `guard_kasbon_potongan_otomatis`, lihat 0009)

### Sebagai Tim Jihan
- [ ] **Tidak ada** menu/akses ke Activity Log di UI sama sekali
- [ ] Semua data (produksi, kode, HPP, dll) tampil **read-only** — tidak ada tombol edit/hapus di luar pengecualian berikut
- [ ] Bisa approve/tolak **sampel** (dan hanya itu — tidak bisa ubah field lain di sampel)
- [ ] Bisa approve/tolak **HPP** (dan hanya itu — tidak bisa ubah nilai komponen HPP)
- [ ] Bisa approve/tolak **pengiriman parsial**
- [ ] Bisa menambah **catatan sampel** (tapi tidak bisa edit/hapus catatan yang sudah ada — termasuk milik sendiri, sesuai prinsip histori sampel tidak pernah dihapus)
- [ ] Bisa melihat histori & saldo **Kasbon** — tapi sama sekali tidak ada tombol tambah/edit/hapus
- [ ] Bisa atur preferensi **notifikasi** (real-time / digest harian) miliknya sendiri
- [ ] Tidak melihat data milik user lain di notifikasi

### Lintas role — konsistensi
- [ ] Logout Deera → login Jihan (di browser/sesi yang sama) → tidak ada data/state Deera yang "bocor" ke tampilan Jihan (cek terutama cache TanStack Query — pastikan di-clear saat auth state berubah, lihat `useSession`)
- [ ] Soft-delete oleh Deera (masuk "Data Terhapus") — Jihan tidak melihat data yang sudah dihapus sama sekali (bukan hanya disembunyikan di UI, tapi memang terfilter — cek query `deleted_at is null` konsisten di semua repository)

---

## C. Hal yang sengaja TIDAK diuji di sini (out of scope test ini)

- Korektnya **kalkulasi bisnis** (HPP, alokasi nota lintas kode, saldo kasbon, dll) — itu domain unit test `hppCalc.js`, bukan RLS.
- Trigger bisnis (`buat_tracking_produksi_otomatis`, `catat_potongan_kasbon_otomatis`, dll) — perlu skenario data lengkap; uji terpisah saat fitur terkait selesai diimplementasikan.
- Validasi format `kode_produk` (regex `^J-[0-9]{3}-[A-Z]{3}$`) — sudah dijamin `CHECK` constraint di level kolom, bukan RLS.
