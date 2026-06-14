# Backlog Tiket Implementasi — Jihan Production

Daftar tiket gaya JIRA untuk implementasi v1.0, dikelompokkan per Epic mengikuti
12 feature slice + cross-cutting concerns. Setiap tiket berisi **Judul**,
**Deskripsi**, **Acceptance Criteria**, dan **Testing**. Semua aturan bisnis,
enum, dan istilah merujuk ke `CLAUDE.md` & `architecture.md` — baca dokumen
tsb sebagai sumber kebenaran saat mengerjakan tiket.

Penomoran: `JP-001` dst, urut per Epic. Status awal semua tiket: **To Do**.

---

## Epic A — Auth & Onboarding

### JP-001 — Login dengan email & password
**Deskripsi:** Implementasi `LoginPage` agar Deera maupun Jihan bisa masuk
menggunakan email & password yang dikelola lewat Supabase Auth. Setelah login
berhasil, sistem mengarahkan ke halaman sesuai role (`/` untuk keduanya, dengan
menu yang berbeda berdasarkan `role`).

**Acceptance Criteria:**
- [ ] Form login menampilkan field email & password dengan validasi (Zod: email valid, password tidak kosong)
- [ ] Login sukses → redirect ke dashboard (`/`); gagal → pesan error jelas dalam Bahasa Indonesia ("Email atau kata sandi salah")
- [ ] Sesi tersimpan & bertahan setelah refresh halaman (Supabase session + `useAuthStore`)
- [ ] Tombol "Masuk" disabled selama proses login berlangsung (mencegah double submit)
- [ ] Layout sesuai prinsip mobile-first (390px), warna navy/gold sesuai `design-system.md`

**Testing:**
- [ ] Manual: login dengan akun Deera asli → masuk ke dashboard Deera
- [ ] Manual: login dengan akun Jihan asli → masuk ke dashboard Jihan
- [ ] Manual: login dengan kredensial salah → pesan error tampil, tidak redirect
- [ ] Manual: refresh halaman setelah login → sesi tetap aktif (tidak ter-logout)

---

### JP-002 — Terima undangan & buat kata sandi (invite flow)
**Deskripsi:** Implementasi `InvitePage` untuk user yang menerima link undangan
dari Deera (Supabase invite). User mengisi nama lengkap & membuat kata sandi
pertama kali, lalu otomatis masuk dengan `role` yang sudah ditentukan saat invite.

**Acceptance Criteria:**
- [ ] Halaman membaca token undangan dari URL (Supabase invite link) dan memvalidasi token sebelum menampilkan form
- [ ] Form meminta nama lengkap & kata sandi (+ konfirmasi), validasi Zod (`terimaUndanganSchema`)
- [ ] Setelah submit sukses → row di `public.users` terisi otomatis lewat trigger `handle_new_user` (role & nama dari `raw_user_meta_data`), lalu redirect ke dashboard sesuai role
- [ ] Token kedaluwarsa/tidak valid → tampilkan pesan jelas + arahkan kembali ke halaman login

**Testing:**
- [ ] Manual: kirim undangan dari sisi Deera (lihat JP-004), buka link di browser baru → form undangan tampil
- [ ] Manual: isi & submit form → akun aktif, role sesuai yang di-invite, langsung bisa login
- [ ] Manual: coba akses `/undangan` tanpa token → tidak menampilkan form, redirect ke login

---

### JP-003 — Route guard berbasis role (ProtectedRoute)
**Deskripsi:** Memastikan setiap rute terlindungi sesuai `allowedRoles`:
rute publik (`/login`, `/undangan`), rute umum (semua role login), dan rute
khusus Deera (mis. `/nota`, pengaturan, kelola akun, activity log).

**Acceptance Criteria:**
- [ ] User belum login yang mengakses rute terproteksi → redirect ke `/login`
- [ ] User login dengan role tidak sesuai (`allowedRoles`) → redirect ke `/` (bukan ke halaman error generik)
- [ ] Saat status auth masih `isLoading` → tampilkan indikator "MEMUAT..." (bukan langsung redirect prematur)
- [ ] Tim Jihan tidak bisa mengakses `/nota`, kelola akun, kelola template HPP, dan activity log — baik lewat menu maupun akses URL langsung

**Testing:**
- [ ] Manual: logout, akses URL `/produksi` langsung → redirect ke `/login`
- [ ] Manual: login sebagai Jihan, akses `/nota` lewat URL bar langsung → redirect ke `/`, tidak menampilkan data nota
- [ ] Otomatis: lihat `rls_test.sql` PART 3 — RLS sebagai lapisan pertahanan kedua di belakang route guard

---

### JP-004 — Kelola akun pengguna (undang & nonaktifkan)
**Deskripsi:** Halaman khusus Deera untuk mengundang anggota tim baru
(menentukan nama, email, dan role saat invite) serta melihat daftar akun yang
sudah terdaftar.

**Acceptance Criteria:**
- [ ] Form undang user baru: nama lengkap (uppercase otomatis sesuai aturan input), email, pilihan role (`deera`/`jihan`)
- [ ] Mengirim undangan lewat Supabase Admin invite API dengan `raw_user_meta_data` berisi `role` & `nama_lengkap`
- [ ] Daftar akun menampilkan nama, email, role, status (aktif/menunggu undangan)
- [ ] Hanya Deera yang bisa mengakses halaman ini (dijaga `ProtectedRoute` + RLS `users`)

**Testing:**
- [ ] Manual: undang akun baru dengan role `jihan` → email undangan terkirim, muncul di daftar dengan status "menunggu"
- [ ] Manual: setelah penerima menyelesaikan JP-002, status berubah jadi "aktif" dan role sesuai yang dipilih saat invite
- [ ] Manual: login sebagai Jihan → menu "Kelola Akun" tidak tampil & URL tidak bisa diakses

---

## Epic B — Produksi & Bahan

### JP-005 — Buat & edit data Produksi
**Deskripsi:** Form bagi Deera untuk membuat batch Produksi baru (berisi kode
bahan, tanggal mulai, catatan) sebagai entitas induk yang menaungi satu atau
lebih Kode.

**Acceptance Criteria:**
- [ ] Form input: kode bahan (uppercase otomatis), tanggal, catatan — sesuai skema `produksiRepository`
- [ ] Validasi Zod sebelum submit; setelah sukses, redirect ke halaman detail produksi yang baru dibuat
- [ ] Edit data produksi yang sudah ada tersedia hanya untuk Deera (Jihan read-only, ditegakkan RLS `deera_full_produksi` / `jihan_read_produksi`)
- [ ] Penghapusan produksi mengikuti alur soft delete (lihat JP-041), bukan hapus permanen langsung

**Testing:**
- [ ] Manual: Deera membuat produksi baru → muncul di daftar produksi & bisa dibuka detailnya
- [ ] Manual: Jihan membuka detail produksi yang sama → semua field tampil read-only, tidak ada tombol edit/hapus
- [ ] Otomatis: `rls_test.sql` PART 2.2–2.3 (insert/update/delete oleh Deera) & PART 3.3 (insert oleh Jihan ditolak)

---

### JP-006 — Input Surat Jalan (penerimaan bahan dari Jihan)
**Deskripsi:** Form input manual oleh Deera saat bahan fisik dari Jihan tiba —
dicatat sebagai dokumen Surat Jalan yang terhubung ke satu Produksi.

**Acceptance Criteria:**
- [ ] Form mencatat tanggal terima, daftar bahan yang diterima, & catatan tambahan
- [ ] Surat jalan terhubung 1:1 atau 1:banyak ke Produksi sesuai skema `surat_jalan`
- [ ] Tampilan ringkasan surat jalan terlihat di halaman detail Produksi
- [ ] Hanya Deera yang bisa input/edit; Jihan melihat sebagai histori read-only

**Testing:**
- [ ] Manual: input surat jalan baru pada sebuah produksi → muncul di ringkasan detail produksi
- [ ] Manual: cek dari sisi Jihan → data tampil tapi tanpa kontrol edit/hapus

---

### JP-007 — Input Bahan Primer per warna
**Deskripsi:** Form pencatatan Bahan Primer (motif) suatu Produksi: daftar
warna beserta `yardTersedia` masing-masing, sebagai basis perhitungan estimasi
pcs sebelum buku potong aktual diisi.

**Acceptance Criteria:**
- [ ] Bisa menambah/menghapus baris warna secara dinamis (nama warna uppercase otomatis, yard tersedia pakai `NumberInput` slider+manual)
- [ ] Disimpan ke `produksi_bahan` (tipe `primer`) & `produksi_bahan_warna`
- [ ] Estimasi pcs per warna ditampilkan sebagai referensi: `floor(yardTersedia / konsumsiPerPcs)` — dengan catatan jelas bahwa angka final tetap dari buku potong aktual (lihat JP-019)
- [ ] Validasi: setiap warna harus unik dalam satu bahan primer produksi tsb

**Testing:**
- [ ] Manual: input 3 warna dengan yard berbeda → estimasi pcs per warna terhitung benar sesuai rumus
- [ ] Otomatis: unit test `hppCalc.js` — fungsi `totalYardPrimerTerpakai` & `totalPcsProduksi` dengan data sampel dari `architecture.md`

---

### JP-008 — Input Bahan Sekunder (rate konsumsi & harga)
**Deskripsi:** Form pencatatan Bahan Sekunder (polos, puring, dll) suatu
Produksi — termasuk rate konsumsi per pcs dan harga per satuan (yard/panel),
serta konversi satuan jika input dalam meter/cm.

**Acceptance Criteria:**
- [ ] Form mendukung input rate dalam format umum di lapangan (mis. "3.35 m per 2 baju") lalu otomatis dikonversi ke yard/pcs lewat `konversiSatuan.js`
- [ ] Field satuan: `yard` (kain lebar, harga per yard) atau `panel` (bordir/renda, harga per panel) — sesuai `SATUAN_BAHAN`
- [ ] Estimasi sisa bahan ditampilkan: `sisaYard = jumlahDibeli − (konsumsiPerPcs × totalPcs)`, dengan keterangan bahwa bahan ini milik Jihan (transparansi)
- [ ] Disimpan ke `produksi_bahan` (tipe `sekunder`)

**Testing:**
- [ ] Manual: input rate "3.35m per 2 baju" → tersimpan sebagai 1.675 m/pcs lalu terkonversi ke yard dengan benar
- [ ] Otomatis: unit test `hppCalc.js` — `nilaiBahanSekunderPerPcs` & `sisaBahanSekunder` dengan beberapa skenario (termasuk batas/pembulatan)

---

### JP-009 — Daftar & detail Produksi
**Deskripsi:** Halaman `ProduksiListPage` (daftar semua batch produksi dengan
filter status) dan `ProduksiDetailPage` (ringkasan bahan, daftar kode di
dalamnya, progress keseluruhan).

**Acceptance Criteria:**
- [ ] Daftar menampilkan kartu produksi: kode bahan, tanggal, jumlah kode di dalamnya, ringkasan status
- [ ] Detail menampilkan: data bahan (primer & sekunder), surat jalan, daftar `KodeCard` dengan `StatusBadge`, dan ringkasan progress lewat `ProduksiBar`
- [ ] Mendukung pull-to-refresh / refetch data terbaru (TanStack Query)
- [ ] Tampilan untuk Jihan identik secara data namun tanpa kontrol tulis apapun

**Testing:**
- [ ] Manual: buka daftar produksi → semua batch tampil, klik salah satu → detail lengkap termuat
- [ ] Manual: bandingkan tampilan Deera vs Jihan pada produksi yang sama — data sama, kontrol berbeda

---

## Epic C — Kode & Status Flow

### JP-010 — Buat Kode produk baru
**Deskripsi:** Form tambah Kode di dalam suatu Produksi, dengan validasi
format `J-[nomor]-[kode bahan]` dan penomoran global sequential (tidak
restart per jenis bahan).

**Acceptance Criteria:**
- [ ] Input nomor 3 digit & kode bahan (3 huruf) — keduanya uppercase otomatis, digabung jadi format `J-001-IMA`
- [ ] Sistem hanya **memvalidasi keunikan** nomor (bukan men-generate otomatis) — sesuai catatan "Input manual oleh Deera. Sistem hanya validasi keunikan"
- [ ] Pesan error jelas jika nomor sudah dipakai kode lain (termasuk yang soft-deleted, agar nomor benar-benar tidak pernah restart/duplikat)
- [ ] Kode baru otomatis berstatus awal `sampel_dibuat`

**Testing:**
- [ ] Manual: buat kode `J-016-RAY` setelah kode terakhir `J-015-...` → tersimpan, status awal benar
- [ ] Manual: coba buat kode dengan nomor yang sudah dipakai (termasuk yang sudah dihapus) → ditolak dengan pesan jelas
- [ ] Otomatis: cek constraint `CHECK` format `^J-[0-9]{3}-[A-Z]{3}$` di level kolom (lihat catatan di `RLS_TEST_CHECKLIST.md` bagian C)

---

### JP-011 — Halaman detail Kode dengan status flow stepper
**Deskripsi:** `KodeDetailPage` menampilkan posisi kode saat ini dalam alur
status (`STATUS_KODE`), riwayatnya, dan akses ke sub-bagian terkait (sampel,
estimasi/konfirmasi pemakaian, buku potong, HPP, tracking, pengiriman) sesuai
status aktif.

**Acceptance Criteria:**
- [ ] Stepper visual menunjukkan tahap saat ini & tahap yang sudah dilewati, memetakan seluruh alur dari `sampel_dibuat` hingga `selesai` (termasuk cabang `tolak` dan `dibatalkan`)
- [ ] Bagian-bagian halaman (sampel, estimasi pemakaian, buku potong, dst.) muncul/terbuka sesuai status saat ini — tidak menampilkan tahap yang belum relevan sebagai aktif
- [ ] `StatusBadge` dengan label & warna sesuai `TAMPILAN_STATUS`
- [ ] Untuk Tim Jihan: hanya kontrol approve/tolak yang relevan dengan status saat ini yang aktif/terlihat

**Testing:**
- [ ] Manual: telusuri satu kode dari status `sampel_dibuat` hingga `selesai` (data uji), pastikan stepper & bagian halaman berubah sesuai tiap transisi
- [ ] Manual: kode berstatus `dibatalkan` → tampil opsi "revisi & lanjutkan" yang mengembalikan ke status sebelum dibatalkan

---

### JP-012 — Validasi & guard transisi status kode
**Deskripsi:** Lapisan logika (hook/repository) yang memastikan transisi
status kode hanya bisa terjadi sesuai alur resmi di `STATUS_KODE` — mencegah
"loncat status" baik dari bug UI maupun percobaan manipulasi langsung.

**Acceptance Criteria:**
- [ ] Daftar transisi valid didefinisikan eksplisit (mis. peta `{from: [...validTo]}`) dan dicek sebelum setiap update status
- [ ] Percobaan transisi tidak valid (mis. `sampel_dibuat` → `selesai` langsung) ditolak dengan pesan jelas, baik di UI maupun di layer hook
- [ ] Status `dibatalkan` menyimpan `status_sebelum_dibatalkan` agar revisi bisa kembali ke titik yang tepat
- [ ] Perubahan status tercatat di activity log (lihat JP-042) dengan aktor & waktu

**Testing:**
- [ ] Otomatis: unit test peta transisi — semua transisi valid lolos, semua kombinasi tidak valid yang representatif ditolak
- [ ] Manual: coba memicu transisi tidak valid lewat UI (mis. dengan memanipulasi state lokal) → ditolak di layer hook sebelum mencapai repository

---

## Epic D — Sampel

### JP-013 — Upload sampel & ajukan review
**Deskripsi:** Form bagi Deera untuk mengunggah 2 foto sampel suatu kode dan
mengajukannya untuk direview oleh Tim Jihan, memindahkan status dari
`sampel_dibuat` ke `review_sampel`.

**Acceptance Criteria:**
- [ ] Wajib mengunggah tepat 2 foto (lewat Cloudinary, sesuai `lib/cloudinary.js`) sebelum bisa mengajukan review
- [ ] Setelah submit, status kode berubah ke `review_sampel` & notifikasi terkirim ke Tim Jihan ("Sampel baru diupload")
- [ ] Riwayat sampel sebelumnya (jika ini pengajuan ulang setelah ditolak) tetap tersimpan, tidak tertimpa — sesuai hard rule "jangan pernah hapus histori sampel"

**Testing:**
- [ ] Manual: upload 2 foto & ajukan → status berubah, entri baru muncul di histori sampel, notifikasi muncul di sisi Jihan
- [ ] Manual: coba ajukan dengan kurang dari 2 foto → tombol submit tetap nonaktif / muncul validasi

---

### JP-014 — Review & approve/tolak sampel (Tim Jihan)
**Deskripsi:** Tampilan review sampel bagi Tim Jihan dengan dua aksi:
approve (lanjut ke `estimasi_pemakaian`) atau tolak (kembali ke
`sampel_dibuat`, sampel lama tetap tersimpan sebagai histori).

**Acceptance Criteria:**
- [ ] Kedua foto sampel ditampilkan jelas (zoomable) dengan info kode & tanggal upload
- [ ] Aksi "Tolak" memunculkan modal alasan penolakan (langsung modal + form alasan, sesuai prinsip "konfirmasi aksi destruktif")
- [ ] Approve → status kode jadi `sampel_approved` lalu otomatis lanjut ke `estimasi_pemakaian`; notifikasi terkirim ke Tim Deera ("Sampel di-approve/ditolak")
- [ ] Tombol approve/tolak hanya aktif untuk Tim Jihan & hanya saat status = `review_sampel`

**Testing:**
- [ ] Manual: Jihan menolak sampel dengan alasan → status kembali ke `sampel_dibuat`, alasan tersimpan & terlihat di histori, Deera menerima notifikasi
- [ ] Manual: Jihan approve sampel → status lanjut otomatis, Deera menerima notifikasi
- [ ] Otomatis: `rls_test.sql` PART 3.5 — RLS mengizinkan UPDATE `kode` oleh Jihan; pastikan repository hanya mengirim kolom `status` (bukan field lain)

---

### JP-015 — Tambah & lihat catatan sampel
**Deskripsi:** Fitur catatan tambahan pada sampel — bisa ditambahkan oleh
kedua role (Deera & Jihan) sebagai komunikasi terdokumentasi, namun tidak
bisa diedit atau dihapus oleh siapapun setelah tersimpan.

**Acceptance Criteria:**
- [ ] Form tambah catatan tersedia untuk Deera & Jihan; setiap entri menyimpan penulis & waktu
- [ ] Tidak ada tombol edit/hapus pada catatan manapun — termasuk milik sendiri (UI maupun akses langsung)
- [ ] Daftar catatan terurut kronologis & terlihat oleh kedua role

**Testing:**
- [ ] Manual: Jihan menambah catatan → langsung tampil di histori dengan nama & waktu, tidak ada opsi edit/hapus
- [ ] Otomatis: `rls_test.sql` PART 3.4 — RLS mengizinkan INSERT `sampel_catatan` oleh Jihan; pastikan tidak ada policy UPDATE/DELETE untuk Jihan pada tabel ini

---

### JP-016 — Histori & perbandingan sampel
**Deskripsi:** Tampilan histori lengkap seluruh pengajuan sampel suatu kode
(termasuk yang ditolak), memudahkan kedua pihak membandingkan revisi dari
waktu ke waktu.

**Acceptance Criteria:**
- [ ] Semua entri sampel (approved maupun ditolak) tampil terurut waktu, masing-masing dengan 2 foto, status, & alasan tolak (jika ada)
- [ ] Tidak ada entri yang hilang/tertimpa walau sudah ada revisi baru — selaras hard rule histori sampel
- [ ] UI memudahkan perbandingan visual antar revisi (mis. side-by-side atau carousel)

**Testing:**
- [ ] Manual: pada kode dengan ≥2 kali pengajuan sampel (1 ditolak, 1 approved), buka histori → kedua entri tampil lengkap dengan statusnya masing-masing

---

## Epic E — Estimasi & Konfirmasi Pemakaian Bahan

### JP-017 — Input estimasi pemakaian bahan
**Deskripsi:** Form bagi tim potong (lewat akun Deera) untuk mengisi
perkiraan pemakaian bahan sebelum proses potong fisik dimulai — perkiraan
yard primer per warna & konsumsi sekunder.

**Acceptance Criteria:**
- [ ] Form per kode: estimasi yard primer per warna & estimasi konsumsi bahan sekunder
- [ ] Setelah disimpan, status kode berubah ke `estimasi_pemakaian` lalu notifikasi terkirim ke Tim Jihan ("Estimasi pemakaian bahan diinput")
- [ ] Nilai lama (jika input ulang) ditampilkan sebagai placeholder, bukan pre-fill — sesuai aturan input number

**Testing:**
- [ ] Manual: isi estimasi & simpan → status berubah, notifikasi diterima Jihan, data tampil di detail kode

---

### JP-018 — Konfirmasi pemakaian & alur pembatalan/revisi
**Deskripsi:** Mekanisme konfirmasi pemakaian bahan (lazimnya dikoordinasikan
via WA/tatap muka lalu diinput ke sistem oleh siapapun yang berwenang),
termasuk percabangan ke status `dibatalkan` jika estimasi dinilai terlalu
besar, dan kemampuan merevisi lalu melanjutkan kembali.

**Acceptance Criteria:**
- [ ] Form konfirmasi memindahkan status dari `estimasi_pemakaian` ke `konfirmasi_pemakaian`, lalu memberi pilihan lanjut ke `proses_potong` atau menandai "estimasi terlalu besar" → `dibatalkan`
- [ ] Saat `dibatalkan`, sistem menyimpan `status_sebelum_dibatalkan`; tersedia aksi "Revisi & Lanjutkan" yang mengembalikan kode persis ke status tsb dengan nilai baru
- [ ] Notifikasi "Kode dibatalkan" terkirim ke Tim Jihan saat status berubah ke `dibatalkan`
- [ ] Histori pembatalan & revisi tercatat (terlihat di activity log untuk Deera)

**Testing:**
- [ ] Manual: tandai sebuah kode "estimasi terlalu besar" → status `dibatalkan`, notifikasi terkirim ke Jihan
- [ ] Manual: dari status `dibatalkan`, lakukan revisi & lanjutkan → status kembali persis ke status sebelum dibatalkan (bukan ke awal alur)

---

## Epic F — Buku Potong

### JP-019 — Input buku potong aktual
**Deskripsi:** Form input data aktual hasil proses potong: realisasi yard
bahan primer per warna, dan jumlah pcs per warna per ukuran — basis
perhitungan HPP & tracking selanjutnya.

**Acceptance Criteria:**
- [ ] Input per kombinasi kode × warna × ukuran (4 pilihan: `MIDI`, `GAMIS`, `MIDI JUMBO`, `GAMIS JUMBO`)
- [ ] Realisasi yard primer per warna tercatat (`yardTerpakai`) terhubung ke `produksi_bahan_warna`
- [ ] Setelah lengkap, status kode berubah ke `input_buku_potong`, notifikasi "Bahan aktual dikonfirmasi (buku potong)" terkirim ke Tim Jihan
- [ ] Total pcs per ukuran otomatis terhitung sebagai sum seluruh warna pada ukuran tsb

**Testing:**
- [ ] Manual: isi data buku potong lengkap untuk satu kode → status berubah, total pcs per ukuran terhitung benar, notifikasi terkirim
- [ ] Otomatis: unit test `hppCalc.js` — `totalPcsProduksi` & turunan dari data buku potong sampel

---

### JP-020 — Kalkulasi & tampilan ringkasan dari buku potong
**Deskripsi:** Tampilan ringkasan otomatis yang menerjemahkan data buku
potong mentah menjadi angka yang siap dipakai di tahap HPP & tracking
(total pcs per kode, per ukuran, per warna).

**Acceptance Criteria:**
- [ ] Ringkasan menampilkan breakdown pcs per warna per ukuran per kode dengan total yang konsisten di semua level
- [ ] Perbedaan signifikan antara estimasi (JP-017) vs aktual (buku potong) ditampilkan sebagai perbandingan, membantu evaluasi akurasi estimasi ke depan
- [ ] Data ini menjadi acuan tunggal (single source of truth) untuk HPP, tracking, dan pengiriman — tidak ada duplikasi input di tahap berikutnya

**Testing:**
- [ ] Manual: bandingkan angka ringkasan dengan input mentah buku potong → konsisten di semua tingkat agregasi
- [ ] Manual: cek tahap HPP & tracking menggunakan angka pcs yang sama persis dari ringkasan ini (tidak ada input ulang)

---

## Epic G — Nota & Bahan Baku

### JP-021 — Input nota pembelian bahan baku
**Deskripsi:** Form pencatatan nota belanja Deera untuk bahan baku (resleting,
benang, kancing, hangtag, dll) — bisa untuk satu kode atau beberapa kode
sekaligus dalam satu nota.

**Acceptance Criteria:**
- [ ] Form mencatat: tanggal, daftar item (nama, tipe `unit`/`usage`, qty/nilai, harga), dan kode-kode yang terkait per item
- [ ] Item bisa ditandai untuk 1 kode (qty/nilai dipakai penuh) atau beberapa kode (memicu alur alokasi proporsional, lihat JP-022)
- [ ] Setelah disimpan, status kode terkait yang masih di tahap ini berubah ke `input_nota`
- [ ] Bisa menambahkan beberapa nota untuk kode yang sama dari waktu ke waktu (sebelum HPP di-approve)

**Testing:**
- [ ] Manual: buat nota untuk 1 kode dengan item unit-based & usage-based → tersimpan dengan benar, status kode berubah
- [ ] Manual: buat nota lintas 2 kode → muncul opsi alokasi (lanjut ke JP-022)

---

### JP-022 — Alokasi proporsional bahan baku lintas kode
**Deskripsi:** Implementasi logika alokasi otomatis saat satu item nota dipakai
beberapa kode sekaligus — basis 1:1 terhadap pcs tiap kode, sisa dibagi rata,
sesuai contoh di `CLAUDE.md` (30 pcs resleting → kode A 11, kode B 19).

**Acceptance Criteria:**
- [ ] Alokasi qty: tiap kode mendapat qty = total pcs kode tsb; sisa (qty dibeli − total pcs semua kode terlibat) dibagi rata ke kode-kode tsb
- [ ] Cost/pcs per kode = (qty alokasi kode × harga) ÷ total pcs kode
- [ ] Item usage-based mengikuti pola yang sama menggunakan **proporsi nilai**, bukan qty
- [ ] Hasil alokasi ditampilkan transparan per kode (qty/nilai alokasi + cost/pcs) sebelum disimpan permanen

**Testing:**
- [ ] Otomatis: unit test `hppCalc.js` — `alokasikanBahanBakuUnitLintasKode` dengan kasus tepat dari contoh CLAUDE.md (30 pcs → A=11, B=19) dan beberapa variasi (sisa 0, sisa ganjil, >2 kode)
- [ ] Otomatis: unit test `alokasikanBahanBakuUsageLintasKode` dengan skenario proporsi nilai
- [ ] Manual: input nota lintas 3 kode dengan angka nyata → hasil alokasi di UI sama dengan hasil unit test untuk data yang sama

---

### JP-023 — Daftar & detail nota
**Deskripsi:** `NotaListPage` menampilkan seluruh nota yang sudah diinput,
dengan kemampuan membuka detail tiap nota (item, kode terkait, status alokasi).

**Acceptance Criteria:**
- [ ] Daftar menampilkan tanggal, ringkasan item, total nilai, dan kode-kode terkait per nota
- [ ] Detail menampilkan breakdown lengkap per item termasuk hasil alokasi (jika lintas kode)
- [ ] Hanya Deera yang bisa mengakses & mengelola halaman ini (Jihan tidak punya akses ke modul nota sesuai struktur rute)

**Testing:**
- [ ] Manual: buka daftar nota → semua nota tampil & bisa dibuka detailnya dengan data lengkap & konsisten dengan input

---

## Epic H — HPP

### JP-024 — Kalkulator HPP otomatis
**Deskripsi:** Implementasi `HPPKalkulatorPage` yang menghitung otomatis
seluruh komponen HPP per kode berdasarkan data buku potong & nota yang sudah
diinput, sesuai rumus di `CLAUDE.md` § HPP.

**Acceptance Criteria:**
- [ ] Menghitung: HPP Jasa (upah + overhead + staff + custom), Nilai Bahan Primer per pcs, Nilai Bahan Sekunder per pcs (per bahan), Bahan Baku per pcs (dari nota, termasuk hasil alokasi lintas kode)
- [ ] Komponen HPP Jasa diambil dari template global (range min–max) dengan kemampuan menambah komponen custom per produksi
- [ ] HPP Jasa **sama** untuk semua ukuran dalam satu produksi (tidak terpengaruh ukuran) — ditegaskan di UI
- [ ] Setelah lengkap, status kode berubah ke `input_hpp`

**Testing:**
- [ ] Otomatis: unit test `hppCalc.js` — `totalHppJasa`, `nilaiBahanPrimerPerPcs`, `nilaiBahanSekunderPerPcs`, `nilaiBahanBakuUnitPerPcs`/`UsagePerPcs`, `totalHppPerBaju` dengan data sampel dari `architecture.md` § Kalkulasi Bisnis
- [ ] Manual: bandingkan hasil kalkulator di UI dengan perhitungan manual untuk satu kode data uji — harus identik

---

### JP-025 — Tampilan breakdown HPP per baju (full)
**Deskripsi:** Komponen `HPPBreakdown` yang SELALU menampilkan rincian penuh
HPP Jasa terpisah dari Nilai Bahan — menegakkan hard rule "jangan gabungkan
HPP Jasa dan Nilai Bahan menjadi satu angka tanpa breakdown".

**Acceptance Criteria:**
- [ ] Breakdown menampilkan baris terpisah: HPP Jasa, Nilai Bahan Primer, tiap Nilai Bahan Sekunder, tiap item Bahan Baku, dan Total HPP/pcs — tidak pernah digabung jadi satu angka
- [ ] Format angka selalu `Rp 85.000` (`formatRp`)
- [ ] Komponen ini dipakai konsisten di halaman kalkulator (Deera) maupun review (Jihan) — satu sumber tampilan, tidak ada versi "ringkas" yang menyembunyikan rincian

**Testing:**
- [ ] Manual: cek tampilan breakdown di halaman kalkulator & halaman review HPP — strukturnya identik (tidak ada versi yang menyembunyikan komponen)
- [ ] Visual review: pastikan tidak ada satupun tempat di aplikasi yang menampilkan "Total HPP" tanpa rincian komponennya

---

### JP-026 — Review & approve/tolak HPP (freeze setelah approve)
**Deskripsi:** Tampilan review HPP bagi Tim Jihan dengan aksi approve (HPP
menjadi frozen, kode lanjut ke `produksi`) atau tolak (kembali ke `input_hpp`
untuk diedit langsung oleh Deera).

**Acceptance Criteria:**
- [ ] Approve → field HPP terkunci permanen (tidak berubah walau ada nota baru setelahnya — hard rule "HPP yang sudah di-approve tidak boleh berubah"), status kode → `hpp_approved` → `produksi`
- [ ] Tolak → memunculkan modal alasan, status kembali ke `input_hpp`, Deera bisa mengedit langsung nilai komponen
- [ ] Notifikasi "HPP di-approve/ditolak" terkirim ke Tim Deera
- [ ] Tombol approve/tolak hanya aktif untuk Jihan & hanya saat status = `review_hpp`

**Testing:**
- [ ] Manual: Jihan menolak HPP dengan alasan → status kembali, Deera bisa edit, perubahan tercatat sebagai revisi (lihat JP-027)
- [ ] Manual: Jihan approve HPP → field terkunci; coba input nota baru pada kode tsb → nilai HPP yang sudah approved tidak berubah
- [ ] Otomatis: `rls_test.sql` PART 3.5 (Jihan diizinkan UPDATE `hpp` oleh RLS) — pastikan repository hanya mengirim `status` & `alasan_tolak`, bukan nilai komponen

---

### JP-027 — Histori revisi HPP
**Deskripsi:** Pencatatan otomatis setiap kali Deera mengubah nilai komponen
HPP (mis. setelah ditolak Jihan) — menyimpan nilai lama vs baru per komponen,
beserta waktu & pelaku, terlihat oleh kedua pihak.

**Acceptance Criteria:**
- [ ] Setiap perubahan nilai komponen HPP otomatis tercatat ke `hpp_revisi`: komponen, nilai lama, nilai baru, timestamp, & siapa yang mengubah
- [ ] Histori revisi terlihat oleh Deera **dan** Jihan saat review ulang (bukan hanya versi terbaru)
- [ ] Tampilan histori menyajikan perbandingan jelas (mis. tabel nilai lama → nilai baru per komponen per revisi)

**Testing:**
- [ ] Manual: ubah nilai HPP setelah penolakan, ulangi 2× → histori menampilkan ke-2 revisi lengkap dengan nilai lama/baru & waktu, terlihat dari sisi Jihan juga
- [ ] Otomatis: unit/integration test memverifikasi setiap update komponen HPP menghasilkan satu entri `hpp_revisi` yang sesuai

---

### JP-028 — Kelola template HPP global
**Deskripsi:** Halaman khusus Deera untuk mengatur template komponen HPP Jasa
global (range min–max per komponen: Upah Produksi, Overhead/Profit Deera,
Staff) yang menjadi acuan saat mengisi HPP per produksi.

**Acceptance Criteria:**
- [ ] CRUD komponen template (nama komponen, nilai min, nilai max)
- [ ] Saat mengisi HPP suatu produksi, sistem menyarankan/memvalidasi nilai dalam range template, namun tetap memperbolehkan komponen custom tambahan per produksi
- [ ] Hanya Deera yang punya akses (lihat tabel Role & Hak Akses)

**Testing:**
- [ ] Manual: ubah range template komponen "Upah Produksi" → nilai baru langsung jadi acuan saat membuat HPP produksi baru
- [ ] Manual: tambahkan komponen custom pada satu produksi → tidak memengaruhi template global, hanya berlaku di produksi tsb

---

## Epic I — Tracking Produksi & Reject

### JP-029 — Tracking progress per tahap, ukuran, warna
**Deskripsi:** Tampilan & input progress produksi untuk 4 tahap
(`dipotong`, `dijahit`, `finishing`, `siapKirim`), dipecah per ukuran &
per warna per kode — termasuk komponen visual `ProduksiBar`.

**Acceptance Criteria:**
- [ ] Progress dapat diupdate granular per kombinasi tahap × ukuran × warna × kode
- [ ] Tracking `dijahit` mendukung penugasan per warna ke 1 tukang jahit (sesuai catatan "1 tukang jahit mengerjakan 1 warna")
- [ ] Saat suatu tahap mencapai 100% untuk seluruh kombinasi relevan, notifikasi "Tiap tahap produksi selesai 100%" terkirim ke Tim Jihan
- [ ] `ProduksiBar` menampilkan ringkasan visual proporsi tiap tahap secara jelas & ringkas (minim ikon, teks sebagai label utama)

**Testing:**
- [ ] Manual: update progress satu warna di tahap `dijahit` hingga 100% → notifikasi terkirim hanya ketika SELURUH kombinasi pada tahap tsb mencapai 100%, bukan per-warna
- [ ] Manual: bandingkan angka di `ProduksiBar` dengan data mentah tracking → konsisten

---

### JP-030 — Catat reject & nasib (dipermak/produksi ulang/waste)
**Deskripsi:** Form pencatatan reject pada tahap manapun, mewajibkan pemilihan
nasib (`dipermak`, `produksi_ulang`, `waste`) — dengan flag khusus saat
`produksi_ulang` membutuhkan bahan tambahan yang tidak tersedia.

**Acceptance Criteria:**
- [ ] Setiap reject **wajib** mencatat nasib — tidak bisa disimpan tanpa memilih salah satu dari `NASIB_REJECT` (hard rule "jangan skip pencatatan nasib reject")
- [ ] Jika nasib = `produksi_ulang` dan bahan tidak tersedia → otomatis membuat flag "perlu bahan tambahan" tersimpan di sistem & memicu notifikasi ke **Tim Jihan & Tim Deera**
- [ ] `jumlahAkhirDikirim = jumlahPcs - totalWaste` dihitung otomatis per kode per ukuran per warna dan dipakai sebagai acuan di tahap pengiriman
- [ ] Histori reject per kombinasi tahap/ukuran/warna terlihat & tidak bisa dihapus

**Testing:**
- [ ] Manual: catat reject dengan nasib `produksi_ulang` + tandai bahan tidak tersedia → flag muncul, notifikasi terkirim ke kedua tim
- [ ] Otomatis: unit test `hppCalc.js` — `jumlahAkhirDikirimPerWarna` & `jumlahAkhirDikirim` dengan beberapa skenario waste
- [ ] Manual: coba simpan reject tanpa memilih nasib → tombol simpan tetap nonaktif/validasi muncul

---

## Epic J — Pengiriman

### JP-031 — Catat pengiriman bertahap (parsial)
**Deskripsi:** Form pencatatan pengiriman suatu kode — mendukung pengiriman
penuh maupun bertahap (granularitas per warna, atau per jumlah pcs dalam satu
warna), masing-masing sebagai entri terpisah.

**Acceptance Criteria:**
- [ ] Form mencatat: tanggal, warna, jumlah pcs yang dikirim — disimpan sebagai entri baru di `pengiriman` (bukan menimpa entri sebelumnya)
- [ ] Validasi: total pcs yang dikirim (akumulasi seluruh entri) tidak boleh melebihi `jumlahAkhirDikirim` per warna
- [ ] Saat sebuah kode siap dikirim (penuh atau sebagian), notifikasi "Kode siap kirim" terkirim ke Tim Jihan
- [ ] Pengiriman parsial otomatis memicu permintaan approval ke Jihan (lihat JP-032) — status entri menunggu sebelum dianggap final

**Testing:**
- [ ] Manual: catat pengiriman 10 dari 30 pcs satu warna → entri tersimpan terpisah, notifikasi & permintaan approval terkirim, sisa 20 pcs masih bisa dicatat di entri berikutnya
- [ ] Manual: coba catat pengiriman melebihi sisa `jumlahAkhirDikirim` → ditolak dengan pesan jelas

---

### JP-032 — Approval pengiriman parsial oleh Tim Jihan
**Deskripsi:** Tampilan & aksi bagi Tim Jihan untuk menyetujui/menolak setiap
entri pengiriman parsial sebelum dianggap final/terkirim.

**Acceptance Criteria:**
- [ ] Setiap entri pengiriman menampilkan status approval (`menunggu`/`disetujui`/`ditolak`) dengan tanggal, warna, & jumlah pcs
- [ ] Tombol approve/tolak hanya aktif untuk Jihan; tolak memunculkan modal alasan
- [ ] Approve mengubah status entri menjadi final/terkirim & notifikasi "Permintaan approval pengiriman sebagian" sebelumnya berubah jadi konfirmasi selesai
- [ ] RLS mengizinkan UPDATE `pengiriman` oleh Jihan, dibatasi field status di application layer (sama seperti pola sampel/HPP)

**Testing:**
- [ ] Manual: Jihan menyetujui entri pengiriman parsial → status berubah final, tercermin di progress total kode
- [ ] Manual: Jihan menolak entri → status `ditolak`, alasan tersimpan, Deera bisa mencatat ulang
- [ ] Otomatis: cocokkan dengan `rls_test.sql` (perlu ditambahkan kasus serupa PART 3.5 untuk tabel `pengiriman` jika belum tercakup — lihat catatan di checklist § C)

---

### JP-033 — Penyelesaian kode otomatis & potongan kasbon
**Deskripsi:** Logika otomatis yang menandai kode sebagai `selesai` setelah
SELURUH `jumlahAkhirDikirim` (semua warna, dikurangi waste) telah terkirim &
disetujui — sekaligus memicu potongan kasbon otomatis (lihat JP-035).

**Acceptance Criteria:**
- [ ] Status kode berubah ke `selesai` HANYA jika seluruh entri pengiriman untuk seluruh warna sudah berstatus disetujui & total pcs terkirim = `jumlahAkhirDikirim`
- [ ] Saat status menjadi `selesai`, sistem otomatis memicu pencatatan potongan kasbon (lihat JP-035) dan mengirim notifikasi "Kode selesai" ke Tim Jihan (termasuk info potongan kasbon otomatis jika ada)
- [ ] Tidak ada cara manual untuk memaksa status `selesai` sebelum syarat di atas terpenuhi

**Testing:**
- [ ] Otomatis: unit test `hppCalc.js` — `totalTerkirim` & `cekSudahSelesai` dengan skenario pengiriman penuh vs sebagian-belum-lengkap
- [ ] Manual (end-to-end di data uji): selesaikan seluruh pengiriman & approval satu kode → status otomatis `selesai`, entri potongan kasbon muncul di ledger, notifikasi terkirim dengan info potongan

---

## Epic K — Kasbon

### JP-034 — Input entri kasbon "masuk" & saldo global
**Deskripsi:** Form bagi Deera untuk mencatat nominal kasbon/DP yang sudah
diterima dari Jihan (negosiasi & transfer terjadi di luar sistem) — sebagai
satu-satunya bentuk pencatatan "uang" dalam sistem.

**Acceptance Criteria:**
- [ ] Form input: nominal & catatan/keterangan (mis. tanggal & konteks penerimaan); tersimpan dengan tipe `masuk`
- [ ] Saldo bersifat **global** — satu akumulasi lintas semua produksi & kode (bukan per-produksi)
- [ ] Tidak ada alur request/approve — entri langsung tersimpan begitu Deera input (sesuai catatan "tanpa status menunggu konfirmasi Jihan")
- [ ] Notifikasi "Kasbon baru dicatat oleh Deera" terkirim ke Tim Jihan
- [ ] Saldo terkini dihitung: `Σ(masuk) − Σ(potongan_otomatis)`

**Testing:**
- [ ] Otomatis: unit test `hppCalc.js` — `hitungSaldoKasbon` dengan kombinasi entri masuk & potongan
- [ ] Manual: Deera input entri kasbon baru → saldo terkini ter-update seketika, notifikasi terkirim ke Jihan

---

### JP-035 — Potongan kasbon otomatis saat kode selesai
**Deskripsi:** Logika sistem yang otomatis mencatat entri "potongan_otomatis"
sebesar `HPP per pcs × jumlahAkhirDikirim` setiap kali sebuah kode mencapai
status `selesai` — tanpa input manual, dan tidak bisa diedit/dihapus siapapun.

**Acceptance Criteria:**
- [ ] Entri `potongan_otomatis` dibuat otomatis & akurat (nilai = HPP per pcs yang sudah frozen × jumlah akhir dikirim kode tsb) tepat saat status kode menjadi `selesai`
- [ ] Entri ini tidak bisa diedit/dihapus dari UI Deera maupun Jihan — diblok di level database (trigger/guard, lihat referensi `guard_kasbon_potongan_otomatis` di migration 0009)
- [ ] Entri tampil dalam ledger tunggal bersama entri "masuk", dengan label yang jelas membedakan keduanya

**Testing:**
- [ ] Otomatis: unit test `hppCalc.js` — `previewPotonganKasbonOtomatis` menghasilkan nilai sesuai rumus untuk beberapa skenario HPP & jumlah akhir
- [ ] Manual (end-to-end): selesaikan satu kode (lihat JP-033) → entri potongan otomatis muncul dengan nilai benar; coba edit/hapus dari UI Deera → diblok dengan pesan jelas

---

### JP-036 — Histori ledger kasbon (saldo berjalan)
**Deskripsi:** Tampilan `KasbonPage` sebagai ledger tunggal — gabungan entri
"masuk" dan "potongan_otomatis", berurutan waktu, masing-masing menampilkan
saldo berjalan setelah entri tsb. Read-only penuh untuk Tim Jihan.

**Acceptance Criteria:**
- [ ] Tiap baris ledger menampilkan: tanggal, tipe (`masuk`/`potongan_otomatis`), nominal, & saldo berjalan setelah entri tsb
- [ ] Saldo berjalan dihitung kumulatif & konsisten dari awal hingga entri terbaru
- [ ] Tim Jihan melihat ledger lengkap + saldo terkini, namun **tanpa** tombol tambah/edit/hapus apapun (murni read-only — hard rule)
- [ ] Tim Deera bisa menambah entri "masuk" (lihat JP-034) tapi tidak bisa mengedit/menghapus entri `potongan_otomatis`

**Testing:**
- [ ] Otomatis: unit test `hppCalc.js` — `historiDenganSaldoBerjalan` menghasilkan urutan & saldo berjalan yang benar untuk kombinasi entri campuran
- [ ] Manual: cek tampilan ledger dari sisi Jihan → seluruh data sama dengan sisi Deera, namun tidak ada kontrol tulis sama sekali
- [ ] Otomatis: `rls_test.sql` PART 3.6 — Jihan ditolak UPDATE entri kasbon

---

## Epic L — Notifikasi

### JP-037 — Sistem notifikasi event-based
**Deskripsi:** Implementasi pengiriman notifikasi otomatis untuk seluruh
event yang terdaftar di tabel Notifikasi `CLAUDE.md` (sampel baru, HPP siap
review, tahap selesai, kode siap kirim, kasbon baru, reject butuh bahan, dll),
masing-masing ke penerima yang tepat.

**Acceptance Criteria:**
- [ ] Setiap event bisnis yang relevan memicu entri `notifications` ke role/penerima yang benar persis sesuai tabel pemetaan Event → Penerima di `CLAUDE.md`
- [ ] `NotifikasiPage` menampilkan daftar notifikasi milik user yang login, terurut waktu, dengan status sudah/belum dibaca
- [ ] Tiap user hanya melihat notifikasinya sendiri (RLS `own_notifications`)
- [ ] Notifikasi yang melibatkan kedua tim (mis. "Reject produksi_ulang — bahan tidak tersedia", "Kode dibatalkan") benar-benar terkirim ke kedua pihak, bukan hanya salah satu

**Testing:**
- [ ] Manual: telusuri minimal 5 event berbeda dari tabel pemetaan (mis. sampel baru, HPP siap review, tahap selesai 100%, kasbon baru, reject butuh bahan) → masing-masing menghasilkan notifikasi ke penerima yang benar
- [ ] Otomatis: `rls_test.sql` PART 3.7 — `notif_milik_orang_lain` = 0 untuk Jihan

---

### JP-038 — Preferensi notifikasi (real-time / digest harian)
**Deskripsi:** Pengaturan bagi Tim Jihan untuk memilih mode penerimaan
notifikasi: real-time (langsung) atau digest harian (ringkasan terjadwal
1×/hari).

**Acceptance Criteria:**
- [ ] Halaman pengaturan menyediakan toggle/pilihan mode notifikasi, tersimpan di `notification_preferences` milik user yang login
- [ ] Mode `digest` mengumpulkan notifikasi sepanjang hari & mengirim satu ringkasan terjadwal per hari (bukan satu per satu)
- [ ] Mode `real-time` tetap mengirim setiap notifikasi seketika terjadi
- [ ] Perubahan preferensi langsung berlaku tanpa perlu logout/login ulang

**Testing:**
- [ ] Manual: ubah preferensi ke "digest harian" → notifikasi yang terjadi sepanjang hari terkumpul & dikirim sebagai satu ringkasan pada waktu terjadwal, bukan satu-satu
- [ ] Manual: ubah kembali ke "real-time" → notifikasi berikutnya kembali terkirim seketika

---

## Epic M — Dashboard

### JP-039 — Dashboard ringkasan untuk Tim Deera
**Deskripsi:** `DashboardPage` versi Deera menampilkan ringkasan operasional
harian: produksi aktif, kode yang menunggu aksi (input HPP, buku potong,
dll), serta hal-hal yang butuh perhatian (flag bahan tambahan, kode
dibatalkan, dll).

**Acceptance Criteria:**
- [ ] Menampilkan ringkasan jumlah kode per status (mis. berapa di `review_sampel`, `input_hpp`, `produksi`, dll)
- [ ] Menyorot item yang butuh tindakan segera (mis. flag "perlu bahan tambahan", kode `dibatalkan` yang menunggu revisi)
- [ ] Navigasi cepat ke produksi/kode terkait dari tiap ringkasan
- [ ] Layout ringkas, mobile-first, minim ikon sesuai prinsip UI/UX

**Testing:**
- [ ] Manual: bandingkan angka ringkasan dashboard dengan jumlah aktual di daftar produksi/kode → konsisten
- [ ] Manual: klik salah satu ringkasan → navigasi ke halaman detail yang relevan

---

### JP-040 — Dashboard ringkasan untuk Tim Jihan
**Deskripsi:** `DashboardPage` versi Jihan menampilkan ringkasan progress
keseluruhan & daftar item yang menunggu approval (sampel, HPP, pengiriman
parsial) — dirancang sederhana & gaptek-friendly.

**Acceptance Criteria:**
- [ ] Menyorot item yang menunggu keputusan Jihan (sampel untuk direview, HPP untuk direview, pengiriman parsial untuk disetujui) sebagai daftar aksi yang jelas
- [ ] Menampilkan ringkasan progress produksi secara visual sederhana (mis. lewat `ProduksiBar`)
- [ ] Tombol besar, teks jelas, pilihan minimal — sesuai prinsip "gaptek-friendly untuk Jihan"
- [ ] Tidak menampilkan elemen yang hanya relevan untuk Deera (nota, activity log, kelola akun, dll)

**Testing:**
- [ ] Manual: buat beberapa item yang menunggu approval (sampel, HPP, pengiriman) → semuanya tampil jelas di ringkasan "menunggu keputusan Anda"
- [ ] Manual: dari ringkasan, klik salah satu item → langsung menuju halaman aksi approve/tolak yang relevan (alur singkat, minim klik)

---

## Epic N — Data Terhapus & Activity Log

### JP-041 — Soft delete & Recycle Bin ("Data Terhapus")
**Deskripsi:** Implementasi mekanisme hapus universal: setiap aksi hapus
adalah soft delete (mengisi `deleted_at`), masuk ke halaman "Data Terhapus"
dengan opsi Restore atau Hapus Permanen (lewat modal konfirmasi).

**Acceptance Criteria:**
- [ ] Aksi "Hapus" pada entitas manapun langsung memunculkan modal dengan form alasan (bukan dialog "apakah yakin?" terpisah — sesuai prinsip konfirmasi aksi destruktif)
- [ ] Data yang di-soft-delete hilang dari semua tampilan & query normal (filter `deleted_at is null` konsisten di seluruh repository), namun muncul di halaman "Data Terhapus"
- [ ] Dari "Data Terhapus": tombol Restore (mengembalikan ke tampilan normal) atau Hapus Permanen (modal konfirmasi terpisah, ireversibel)
- [ ] Setiap aksi hapus, restore, & hapus permanen tercatat di activity log
- [ ] Hanya Deera yang punya akses ke fitur ini (Jihan tidak melihat data yang dihapus sama sekali — bukan hanya disembunyikan UI, tapi terfilter di query)

**Testing:**
- [ ] Manual: hapus sebuah kode → hilang dari daftar normal, muncul di "Data Terhapus" dengan alasan tersimpan
- [ ] Manual: restore → kembali muncul normal; hapus permanen → benar-benar hilang & tidak bisa dikembalikan
- [ ] Manual: pastikan dari sisi Jihan, data yang sudah dihapus Deera tidak terlihat sama sekali (cek query `deleted_at is null` di seluruh repository terkait)
- [ ] Otomatis: cek setiap repository query menyertakan filter `deleted_at is null` (code review / lint rule)

---

### JP-042 — Activity log (khusus Deera)
**Deskripsi:** Pencatatan otomatis seluruh aksi penting (create/update/delete/
restore/approve/tolak/dll) sebagai activity log, dengan halaman khusus untuk
Deera melihatnya. Sama sekali tidak boleh terlihat oleh Jihan.

**Acceptance Criteria:**
- [ ] Setiap aksi signifikan (terutama yang disebut eksplisit di `CLAUDE.md`: hapus data, perubahan status, approve/tolak, dll) menghasilkan entri activity log dengan aktor, aksi, entitas terkait, & waktu
- [ ] Halaman activity log hanya bisa diakses Deera (route guard + RLS `deera_only_activity_log`)
- [ ] Tim Jihan tidak melihat menu ini sama sekali, dan query ke `activity_log` dari sesi Jihan mengembalikan 0 baris (bukan error) — sesuai desain RLS "menyaring total"

**Testing:**
- [ ] Manual: lakukan beberapa aksi signifikan sebagai Deera → semuanya tercatat di activity log dengan detail benar
- [ ] Manual: login sebagai Jihan → menu activity log tidak ada di navigasi & URL langsung diarahkan keluar
- [ ] Otomatis: `rls_test.sql` PART 3.2 — query `activity_log` sebagai Jihan sukses tapi mengembalikan count = 0

---

## Catatan Penutup

- Tiket-tiket di atas mengasumsikan struktur slice & repository yang sudah
  di-scaffold (lihat `architecture.md` § Struktur Folder Proyek). Saat
  implementasi, hubungkan tiap tiket ke file yang relevan: `api/*Repository.js`,
  `hooks/use*.js`, `schema.js`, dan komponen halaman/`components/` di slice
  masing-masing.
- Urutan pengerjaan disarankan mengikuti alur status (`STATUS_KODE`) agar
  setiap tahap bisa diuji end-to-end dengan data yang dihasilkan tahap
  sebelumnya — Epic A → C → D → E → F → G → H → I → J → K, dengan Epic B,
  L, M, N berjalan paralel sesuai kebutuhan.
- Untuk verifikasi RLS lintas-epic, gunakan `supabase/tests/rls_test.sql` &
  `RLS_TEST_CHECKLIST.md` yang sudah tersedia — banyak tiket di atas
  mereferensikannya langsung pada bagian Testing.
