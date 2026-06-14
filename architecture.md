# Arsitektur — Jihan Production

Versi 2.0 · Juni 2026

---

## Gambaran Umum

```
┌─────────────────────────────────────────────────────┐
│                  CLIENT (Browser / PWA)              │
│              React + Tailwind CSS                    │
│           Mobile-first, offline-capable              │
└──────────┬──────────────────────────┬───────────────┘
           │ Supabase Client SDK      │ Cloudinary SDK
           │                          │
┌──────────▼──────────┐    ┌──────────▼───────────────┐
│     SUPABASE         │    │       CLOUDINARY          │
│                      │    │                           │
│  - Auth              │    │  - Upload foto sampel     │
│  - PostgreSQL DB     │    │  - CDN & transformasi     │
│  - Realtime          │    │  - URL shareable          │
│  - Edge Functions    │    └───────────────────────────┘
│    (push notif,      │
│     business logic)  │
└─────────────────────-┘
```

---

## Tech Stack

### Frontend
| Layer | Pilihan | Alasan |
|-------|---------|--------|
| Framework | React (Vite) | Ekosistem luas, fleksibel |
| Styling | Tailwind CSS | Rapid development, mobile-first |
| State | Zustand | Ringan, sederhana |
| Data fetching | TanStack Query + Supabase client | Caching, realtime, loading states |
| Routing | React Router v6 | Standar industri |
| Form | React Hook Form + Zod | Validasi ringan dan terstruktur |
| PWA | Vite PWA Plugin | Service worker, install prompt |
| Image upload | Cloudinary Upload Widget / SDK | Upload langsung ke Cloudinary |

### Backend — Supabase
| Fitur | Keterangan |
|-------|-----------|
| **Database** | PostgreSQL managed — tidak perlu setup sendiri |
| **Auth** | Built-in: email/password, invitation flow, reset password, JWT |
| **Realtime** | Subscribe perubahan data langsung dari client |
| **Row Level Security (RLS)** | Aturan akses data langsung di level database |
| **Edge Functions** | Deno-based serverless untuk push notifikasi dan business logic |
| **Storage** | Tidak dipakai — digantikan Cloudinary untuk foto sampel |

### File Storage — Cloudinary
| Fitur | Keterangan |
|-------|-----------|
| Upload | Direct upload dari client dengan signed upload preset |
| Transformasi | Auto-resize, compress, format WebP otomatis |
| CDN | URL foto sudah CDN secara default |
| Share WA | URL Cloudinary langsung bisa dibagikan ke WhatsApp |
| Folder | Terorganisir per order dan desain |

---

## Auth Flow (Supabase Auth)

### Invitation Flow (Deera undang Tim Jihan)
```
1. Deera input email Tim Jihan di Pengaturan
2. Client → supabase.auth.admin.inviteUserByEmail({ email })
3. Supabase kirim email undangan otomatis ke Tim Jihan
4. Tim Jihan klik link → diarahkan ke halaman set password
5. Supabase handle session, JWT diterbitkan otomatis
6. Client simpan role 'jihan' di tabel users (public.users)
```

### Login Biasa
```
Client → supabase.auth.signInWithPassword({ email, password })
       → Supabase return session (access token + refresh token)
       → Token dikelola otomatis oleh Supabase client SDK
```

### Role-Based Access via RLS
```
-- Setiap request ke DB otomatis membawa JWT user
-- RLS policy memfilter data berdasarkan role & user ID
-- Tim Jihan tidak bisa write data apapun kecuali yang diizinkan
```

---

## Struktur Database (Supabase / PostgreSQL)

> Supabase mengelola `auth.users` secara internal. `public.users` adalah ekstensi profil.

### Diagram Relasi (Ringkas)
```
produksi ──< produksi_bahan ──< produksi_bahan_warna
    │
    └──< kode ──< kode_ukuran ──< kode_ukuran_warna ──< tracking_produksi ──< tracking_reject
           │──< sampel ──< sampel_catatan
           │──  hpp ──< hpp_revisi
           └──< pengiriman ──< pengiriman_item

produksi ──< surat_jalan

katalog_bahan_baku ──< nota_item >──< kode (many-to-many via nota_item_kode)
nota_pembelian ──< nota_item

kasbon ──> kode (opsional, hanya terisi utk entri tipe 'potongan_otomatis')
-- kasbon BUKAN turunan/anak dari kode — saldo bersifat global lintas produksi,
-- relasi ke kode hanya sebagai REFERENSI sumber potongan, bukan kepemilikan
```

### `public.users`
```sql
id          UUID PRIMARY KEY REFERENCES auth.users(id)
role        TEXT CHECK (role IN ('deera', 'jihan')) NOT NULL
namaLengkap TEXT
createdAt   TIMESTAMPTZ DEFAULT now()
```

### `public.produksi`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
kodeBahan   TEXT NOT NULL        -- 3 huruf uppercase: IMA, KAT, RAY
tanggal     DATE NOT NULL
catatan     TEXT                 -- uppercase
createdBy   UUID REFERENCES public.users(id)
createdAt   TIMESTAMPTZ DEFAULT now()
updatedAt   TIMESTAMPTZ DEFAULT now()
deletedAt   TIMESTAMPTZ          -- soft delete
```

### `public.surat_jalan`
```sql
-- Penerimaan bahan dari Jihan, input Deera
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
produksiId      UUID REFERENCES public.produksi(id) ON DELETE CASCADE
nomorSuratJalan TEXT             -- uppercase
tanggalTerima   DATE NOT NULL
pengirim        TEXT             -- uppercase (nama/tim Jihan)
catatan         TEXT             -- uppercase
createdBy       UUID REFERENCES public.users(id)
createdAt       TIMESTAMPTZ DEFAULT now()
```

### `public.produksi_bahan`
```sql
-- Bahan dari Jihan, level produksi, bisa >1 bahan per produksi
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
produksiId      UUID REFERENCES public.produksi(id) ON DELETE CASCADE
suratJalanId    UUID REFERENCES public.surat_jalan(id)
jenisBahan      TEXT NOT NULL    -- uppercase: MOTIF IMA, POLOS, PURING
tipeBahan       TEXT NOT NULL    -- 'primer' | 'sekunder'
satuan          TEXT NOT NULL    -- 'yard' | 'panel'
hargaPerSatuan  INTEGER NOT NULL
jumlahDibeli    NUMERIC(10,2)    -- total yard/panel diterima dari Jihan (dari surat jalan) — dasar hitung sisa bahan
-- Sekunder saja: konsumsi per pcs dari pola (diisi saat input HPP)
konsumsiPerPcs  NUMERIC(8,3)    -- dalam satuan asli (meter/cm/panel), dikonversi saat hitung
satuanKonsumsi  TEXT             -- 'meter' | 'cm' | 'yard' | 'panel'
-- sisaYard (calculated, tidak disimpan) = jumlahDibeli − (konsumsiPerPcs dlm yard × totalPcsProduksi)
urutan          INTEGER DEFAULT 1
createdAt       TIMESTAMPTZ DEFAULT now()
updatedAt       TIMESTAMPTZ DEFAULT now()
```

### `public.produksi_bahan_warna`
```sql
-- Per warna untuk bahan PRIMER saja
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
produksiBahanId UUID REFERENCES public.produksi_bahan(id) ON DELETE CASCADE
namaWarna       TEXT NOT NULL    -- uppercase: NAVY, HITAM, HIJAU
yardTersedia    NUMERIC(10,2)    -- dari Jihan (surat jalan)
yardTerpakai    NUMERIC(10,2)    -- actual dari buku potong
urutan          INTEGER DEFAULT 1
createdAt       TIMESTAMPTZ DEFAULT now()
```

### `public.kode_sequence`
```sql
-- Counter global nomor kode
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
lastNumber  INTEGER DEFAULT 0
updatedAt   TIMESTAMPTZ DEFAULT now()
-- Selalu hanya 1 row
```

### `public.kode`
```sql
-- Sebelumnya disebut 'desain'
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
produksiId      UUID REFERENCES public.produksi(id) ON DELETE CASCADE
kodeDesain      TEXT UNIQUE NOT NULL  -- J-001-IMA, input manual Deera (uppercase)
hargaJualTarget INTEGER
catatan         TEXT                  -- uppercase
urutan          INTEGER DEFAULT 1
status          TEXT DEFAULT 'sampel_dibuat'
  -- sampel_dibuat | review_sampel | sampel_ditolak | sampel_approved
  -- estimasi_pemakaian | konfirmasi_pemakaian | proses_potong
  -- input_buku_potong | input_nota | input_hpp
  -- review_hpp | hpp_ditolak | hpp_approved
  -- produksi | siap_kirim | selesai | dibatalkan
statusSebelumDibatalkan TEXT  -- simpan status terakhir sebelum dibatalkan, agar bisa lanjut lagi
createdAt   TIMESTAMPTZ DEFAULT now()
updatedAt   TIMESTAMPTZ DEFAULT now()
deletedAt   TIMESTAMPTZ
```

### `public.kode_ukuran`
```sql
-- Ukuran per kode (MIDI, GAMIS, dll)
id        UUID PRIMARY KEY DEFAULT gen_random_uuid()
kodeId    UUID REFERENCES public.kode(id) ON DELETE CASCADE
ukuran    TEXT NOT NULL CHECK (ukuran IN ('MIDI', 'GAMIS', 'MIDI JUMBO', 'GAMIS JUMBO'))
urutan    INTEGER DEFAULT 1
-- Total pcs ukuran ini = SUM(kode_ukuran_warna.jumlahPcs)
```

### `public.kode_ukuran_warna`
```sql
-- Pcs per warna per ukuran — diisi dari data buku potong
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
kodeUkuranId  UUID REFERENCES public.kode_ukuran(id) ON DELETE CASCADE
namaWarna     TEXT NOT NULL    -- uppercase, cocok dengan produksi_bahan_warna
jumlahPcs     INTEGER NOT NULL DEFAULT 0
UNIQUE(kodeUkuranId, namaWarna)
```

### `public.sampel`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
kodeId          UUID REFERENCES public.kode(id) ON DELETE CASCADE
fotoDepanUrl    TEXT NOT NULL    -- Cloudinary URL
fotoBelakangUrl TEXT NOT NULL    -- Cloudinary URL
status          TEXT DEFAULT 'aktif'  -- aktif | ditolak
alasanDitolak   TEXT             -- uppercase
versi           INTEGER DEFAULT 1
createdBy       UUID REFERENCES public.users(id)
createdAt       TIMESTAMPTZ DEFAULT now()
```

### `public.sampel_catatan`
```sql
id        UUID PRIMARY KEY DEFAULT gen_random_uuid()
sampelId  UUID REFERENCES public.sampel(id) ON DELETE CASCADE
userId    UUID REFERENCES public.users(id)
isi       TEXT NOT NULL    -- uppercase
createdAt TIMESTAMPTZ DEFAULT now()
```

### `public.hpp`
```sql
-- HPP per kode, frozen setelah approved
id      UUID PRIMARY KEY DEFAULT gen_random_uuid()
kodeId  UUID REFERENCES public.kode(id) UNIQUE

-- HPP Jasa: sama untuk semua kode dalam 1 produksi
-- Disimpan per kode sebagai snapshot (sinkron dari produksi_hpp_jasa)
jasaKomponen  JSONB  -- [{nama, nilai, urutan}]
-- cth: [{"nama":"UPAH PRODUKSI","nilai":40000},{"nama":"OVERHEAD","nilai":20000}]

-- Snapshot bahan (dihitung & disimpan saat HPP disubmit, tidak berubah)
snapshotBahanPrimer   JSONB  -- {totalYardTerpakai, hargaPerYard, nilaiPerPcs}
snapshotBahanSekunder JSONB  -- [{jenisBahan, konsumsiYard, hargaPerYard, nilaiPerPcs}]
snapshotBahanBaku     JSONB  -- [{nama, tipe, nilaiPerPcs}]

-- Totals (calculated, stored for display)
totalHPPJasa    INTEGER
totalNilaiBahan INTEGER
totalBahanBaku  INTEGER
totalHPPPerBaju INTEGER

status        TEXT DEFAULT 'draft'  -- draft | review | approved | ditolak
alasanTolak   TEXT
submittedAt   TIMESTAMPTZ
approvedAt    TIMESTAMPTZ
createdAt     TIMESTAMPTZ DEFAULT now()
updatedAt     TIMESTAMPTZ DEFAULT now()
```

### `public.hpp_revisi`
```sql
-- Histori perubahan nilai HPP (nilai lama vs baru), tampil ke Deera & Jihan
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
hppId       UUID REFERENCES public.hpp(id) ON DELETE CASCADE
komponen    TEXT NOT NULL    -- nama field/komponen yang berubah, mis. "UPAH PRODUKSI", "TOTAL HPP/PCS"
nilaiLama   JSONB
nilaiBaru   JSONB
alasan      TEXT             -- uppercase, biasanya alasan tolak dari Jihan
changedBy   UUID REFERENCES public.users(id)
createdAt   TIMESTAMPTZ DEFAULT now()
```

### `public.hpp_template_komponen`
```sql
-- Template global HPP Jasa (min-max per komponen)
id       UUID PRIMARY KEY DEFAULT gen_random_uuid()
nama     TEXT NOT NULL    -- UPAH PRODUKSI, OVERHEAD, STAFF (uppercase)
nilaiMin INTEGER NOT NULL
nilaiMax INTEGER NOT NULL
urutan   INTEGER DEFAULT 1
isDefault BOOLEAN DEFAULT true  -- false = custom komponen tambahan
updatedBy UUID REFERENCES public.users(id)
updatedAt TIMESTAMPTZ DEFAULT now()
```

### `public.katalog_bahan_baku`
```sql
-- Master list bahan baku aksesori
id        UUID PRIMARY KEY DEFAULT gen_random_uuid()
nama      TEXT NOT NULL    -- uppercase: RESLETING, BENANG JAHIT, KANCING
tipe      TEXT NOT NULL    -- 'unit' | 'usage'
satuan    TEXT             -- uppercase: PCS, ROL, METER
hargaTerkini INTEGER       -- update otomatis dari nota terbaru
isActive  BOOLEAN DEFAULT true
createdAt TIMESTAMPTZ DEFAULT now()
updatedAt TIMESTAMPTZ DEFAULT now()
```

### `public.nota_pembelian`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
tanggal     DATE NOT NULL        -- biasanya Sabtu (hari gajian)
catatan     TEXT                 -- uppercase
totalNilai  INTEGER              -- sum dari semua nota_item
createdBy   UUID REFERENCES public.users(id)
createdAt   TIMESTAMPTZ DEFAULT now()
```

### `public.nota_item`
```sql
-- Item dalam nota pembelian
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
notaId          UUID REFERENCES public.nota_pembelian(id) ON DELETE CASCADE
katalogId       UUID REFERENCES public.katalog_bahan_baku(id)
namaCustom      TEXT             -- jika tidak ada di katalog (uppercase)
tipe            TEXT NOT NULL    -- 'unit' | 'usage'
qty             NUMERIC(10,2)    -- untuk unit-based: jumlah pcs/roll/dll
hargaSatuan     INTEGER          -- untuk unit-based: harga per satuan
totalNilai      INTEGER NOT NULL -- untuk usage-based: total nilai pembelian
createdAt       TIMESTAMPTZ DEFAULT now()
```

### `public.nota_item_kode`
```sql
-- Many-to-many: 1 nota item bisa untuk beberapa kode
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
notaItemId  UUID REFERENCES public.nota_item(id) ON DELETE CASCADE
kodeId      UUID REFERENCES public.kode(id)
```

### `public.tracking_produksi`
```sql
-- Tracking per kode per UKURAN per WARNA per tahap
-- Warna tetap relevan karena 1 tukang jahit mengerjakan 1 warna
-- Row dibuat otomatis saat status kode → produksi
-- (dari data kode_ukuran_warna yang sudah ada di buku potong)
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
kodeUkuranWarnaId UUID REFERENCES public.kode_ukuran_warna(id) ON DELETE CASCADE
tahap             TEXT NOT NULL  -- dipotong | dijahit | finishing | siap_kirim
pcsDone           INTEGER DEFAULT 0
updatedBy         UUID REFERENCES public.users(id)
updatedAt         TIMESTAMPTZ DEFAULT now()

UNIQUE (kodeUkuranWarnaId, tahap)
```

### `public.tracking_reject`
```sql
id                 UUID PRIMARY KEY DEFAULT gen_random_uuid()
trackingProduksiId UUID REFERENCES public.tracking_produksi(id)
pcsReject          INTEGER NOT NULL
alasan             TEXT NOT NULL  -- uppercase
nasib              TEXT NOT NULL  -- dipermak | produksi_ulang | waste
bahanTersedia      BOOLEAN        -- relevan jika nasib = produksi_ulang
                                  -- jika FALSE → trigger flag "perlu bahan tambahan" + notifikasi ke Deera & Jihan
catatan            TEXT           -- uppercase
createdBy          UUID REFERENCES public.users(id)
createdAt          TIMESTAMPTZ DEFAULT now()
```

### `public.pengiriman`
```sql
-- Pengiriman per kode, bisa bertahap/parsial — perlu approval Jihan
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
kodeId      UUID REFERENCES public.kode(id) ON DELETE CASCADE
tanggal     DATE
catatan     TEXT                  -- uppercase
statusApproval TEXT DEFAULT 'menunggu'  -- menunggu | disetujui | ditolak
approvedBy  UUID REFERENCES public.users(id)
approvedAt  TIMESTAMPTZ
createdBy   UUID REFERENCES public.users(id)
createdAt   TIMESTAMPTZ DEFAULT now()
```

### `public.pengiriman_item`
```sql
-- Rincian per warna dalam satu pengiriman
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
pengirimanId  UUID REFERENCES public.pengiriman(id) ON DELETE CASCADE
namaWarna     TEXT NOT NULL    -- uppercase
jumlahPcs     INTEGER NOT NULL
```

### `public.kasbon`
```sql
-- Ledger tunggal saldo Kasbon (DP/dana operasional Deera↔Jihan) — saldo GLOBAL,
-- bukan per-produksi/kode. Pengecualian terbatas terhadap aturan "jangan catat
-- pembayaran" (lihat CLAUDE.md bagian "Kasbon"): hanya nominal & saldo, bukan
-- modul pembayaran. Negosiasi & transfer dana selalu di luar sistem.
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
tanggal     DATE NOT NULL
tipe        TEXT NOT NULL    -- 'masuk' (input manual Deera) | 'potongan_otomatis' (auto sistem)
nominal     NUMERIC NOT NULL -- selalu disimpan positif; tanda ditentukan oleh `tipe` saat hitung saldo
kodeId      UUID REFERENCES public.kode(id)  -- diisi otomatis utk 'potongan_otomatis', NULL utk 'masuk'
catatan     TEXT             -- uppercase; manual utk 'masuk', auto-generated utk 'potongan_otomatis'
createdBy   UUID REFERENCES public.users(id) -- NULL utk entri otomatis (sistem)
createdAt   TIMESTAMPTZ DEFAULT now()
```

> **Saldo berjalan** dihitung, bukan disimpan kolom terpisah — lihat fungsi `hitungSaldoKasbon` di bagian Kalkulasi & Pseudocode. Entri `potongan_otomatis` dibuat sistem otomatis saat sebuah kode mencapai status `selesai` (lihat trigger `catatPotonganKasbonOtomatis`); entri ini tidak bisa diedit/dihapus oleh siapapun (termasuk Deera) — hanya entri `masuk` yang dapat dikelola Deera (CRUD + soft delete, mengikuti aturan recycle bin umum).

### `public.notifications`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
userId      UUID REFERENCES public.users(id)
judul       TEXT NOT NULL
isi         TEXT NOT NULL
entityType  TEXT   -- 'kode' | 'sampel' | 'hpp' | 'tracking' | 'nota' | 'pengiriman' | 'kasbon'
entityId    UUID
isRead      BOOLEAN DEFAULT false
createdAt   TIMESTAMPTZ DEFAULT now()
deletedAt   TIMESTAMPTZ
```

### `public.notification_preferences`
```sql
-- Khusus Tim Jihan: pilih mode notifikasi real-time atau digest harian
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
userId      UUID REFERENCES public.users(id) UNIQUE
mode        TEXT DEFAULT 'realtime'  -- 'realtime' | 'digest_harian'
jamDigest   TIME DEFAULT '08:00'     -- jam pengiriman digest jika mode = digest_harian
updatedAt   TIMESTAMPTZ DEFAULT now()
```

### `public.activity_log`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
userId      UUID REFERENCES public.users(id)
aksi        TEXT NOT NULL    -- INPUT_BUKU_POTONG, APPROVE_HPP, SOFT_DELETE, dll
entityType  TEXT             -- produksi | kode | sampel | hpp | nota | tracking
entityId    UUID
deskripsi   TEXT NOT NULL    -- kalimat human-readable (uppercase)
dataBefore  JSONB
dataAfter   JSONB
createdAt   TIMESTAMPTZ DEFAULT now()
```

### `public.push_subscriptions`
```sql
id        UUID PRIMARY KEY DEFAULT gen_random_uuid()
userId    UUID REFERENCES public.users(id)
endpoint  TEXT NOT NULL
p256dh    TEXT NOT NULL
auth      TEXT NOT NULL
createdAt TIMESTAMPTZ DEFAULT now()
```

---

## Row Level Security (RLS)

RLS memastikan Tim Jihan tidak bisa menulis data yang bukan haknya, langsung di level database.

```sql
-- Helper function: cek role user
CREATE OR REPLACE FUNCTION is_deera() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'deera')
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_jihan() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'jihan')
$$ LANGUAGE sql SECURITY DEFINER;

-- Pola umum:
-- Deera: full access semua tabel
-- Jihan: SELECT only, kecuali pengecualian berikut

-- Tim Jihan boleh INSERT catatan sampel
CREATE POLICY "jihan_insert_sampel_catatan"
  ON public.sampel_catatan FOR INSERT
  WITH CHECK (is_jihan() AND auth.uid() = userId);

-- Tim Jihan boleh UPDATE status kode untuk approve/tolak sampel & HPP
-- (dibatasi di application layer untuk field status saja)
CREATE POLICY "jihan_update_kode_status"
  ON public.kode FOR UPDATE
  USING (is_jihan())
  WITH CHECK (is_jihan());

-- Notifikasi: user hanya bisa lihat/hapus milik sendiri
CREATE POLICY "own_notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = userId);

-- Activity log: hanya Deera
CREATE POLICY "deera_only_activity_log"
  ON public.activity_log FOR SELECT
  USING (is_deera());
```

> Pola lengkap: setiap tabel punya 2 policy — `deera_full_{tabel}` (ALL) dan `jihan_read_{tabel}` (SELECT). Pengecualian didaftarkan secara eksplisit seperti di atas.

---

## Cloudinary — File Storage Foto Sampel

### Upload Flow
```
1. Client minta signed upload params dari Supabase Edge Function
   (untuk keamanan — secret API key tidak pernah di client)

2. Edge Function generate signature:
   { signature, timestamp, upload_preset, folder }

3. Client upload langsung ke Cloudinary dengan signature tersebut:
   POST https://api.cloudinary.com/v1_1/{cloud_name}/image/upload

4. Cloudinary return { secure_url, public_id }

5. Client simpan secure_url ke tabel sampel di Supabase
```

### Struktur Folder di Cloudinary
```
jihan-production/
  sampel/
    {produksiId}/
      {kodeId}/
        {timestamp}-depan.webp
        {timestamp}-belakang.webp
```

### Transformasi Otomatis
```
URL asli:
  https://res.cloudinary.com/{cloud}/image/upload/v.../jihan-production/sampel/...

URL dengan transformasi (resize + compress):
  https://res.cloudinary.com/{cloud}/image/upload/w_1200,q_auto,f_auto/v.../...

Cloudinary handle format WebP otomatis (f_auto) dan kompres sesuai device.
```

---

## Push Notifikasi (via Supabase Edge Function)

```
Setup (sekali per device):
  1. Browser minta izin notifikasi
  2. Browser generate push subscription object
  3. Client → Supabase: INSERT INTO push_subscriptions (...)

Trigger (server-side via Edge Function):
  1. Event terjadi (misal: Tim Deera upload sampel)
  2. Client atau database trigger panggil Edge Function
  3. Edge Function query push_subscriptions WHERE userId IN (target)
  4. Edge Function kirim via web-push ke semua endpoint
  5. Browser tampilkan push notification
```

---

## Realtime (Supabase Realtime)

Tim Jihan dan Tim Deera bisa melihat update data tanpa refresh manual.

```js
// Contoh: subscribe perubahan status desain
supabase
  .channel('desain-changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'desain'
  }, (payload) => {
    // Update UI otomatis
  })
  .subscribe()
```

---

## Konversi Satuan

Konverter tersedia di halaman HPP Kalkulator untuk membantu Deera mengkonversi satuan sebelum input:

```js
const KONVERSI = {
  meterKeYard:  (m) => m * 1.09361,
  cmKeYard:     (cm) => cm / 91.44,
  yardKeMeter:  (y) => y * 0.9144,
  yardKeCm:     (y) => y * 91.44,
}

// Panel tidak dikonversi ke yard — tetap dalam satuan panel
// karena harga panel dihitung per panel
```

---

## Kalkulasi Bisnis (Client-side)

Kalkulasi HPP dilakukan di sisi client saat mengisi HPP, lalu di-snapshot ke database saat disubmit.

```js
// ── BAHAN PRIMER ─────────────────────────────────────────
// HPP primer per pcs = total semua yard terpakai × harga ÷ total pcs semua kode
const totalYardPrimer  = bahanWarnas.reduce((s, w) => s + w.yardTerpakai, 0)
// Total pcs = sum semua ukuran × warna di seluruh kode dalam produksi
const totalPcsProduksi = kode_list.reduce((s, k) =>
  s + k.ukuran_list.reduce((su, u) =>
    su + u.warnas.reduce((sw, w) => sw + w.jumlahPcs, 0), 0), 0)
const nilaiBahanPrimerPerPcs = (totalYardPrimer * bahanPrimer.hargaPerYard) / totalPcsProduksi

// ── BAHAN SEKUNDER ────────────────────────────────────────
// HPP sekunder per pcs = konsumsi per pcs (in yard) × harga/yard
// Deera input konsumsi dalam meter/cm → sistem konversi ke yard
const konsumsiYard = konversiKeYard(bahan.konsumsiPerPcs, bahan.satuanKonsumsi)
const nilaiBahanSekunderPerPcs = konsumsiYard * bahan.hargaPerYard
// Tidak dikalikan total pcs — ini sudah merupakan nilai per 1 pcs

// ── TOTAL NILAI BAHAN ─────────────────────────────────────
const totalNilaiBahan = nilaiBahanPrimerPerPcs
  + bahanSekunder.reduce((s, b) => s + nilaiSekunder(b), 0)

// ── BAHAN BAKU DARI NOTA ──────────────────────────────────
// Item untuk 1 kode — Unit-based: (qty dibeli / total pcs kode) × harga satuan
const nilaiUnitPerPcs = (item.qty / kode.totalPcs) * item.hargaSatuan
// Item untuk 1 kode — Usage-based: total nilai / total pcs kode
const nilaiUsagePerPcs = item.totalNilai / kode.totalPcs

// Item lintas beberapa kode — alokasi proporsional (basis 1:1 thd pcs, sisa dibagi rata)
function alokasikanQtyLintasKode(qtyDibeli, hargaSatuan, kodeList) {
  // kodeList: [{ kodeId, totalPcs }]
  const totalPcsGabungan = kodeList.reduce((s, k) => s + k.totalPcs, 0)
  const sisa = qtyDibeli - totalPcsGabungan
  const sisaPerKode = sisa > 0 ? sisa / kodeList.length : 0
  return kodeList.map(k => {
    const qtyAlokasi = k.totalPcs + sisaPerKode
    return {
      kodeId: k.kodeId,
      qtyAlokasi,
      costPerPcs: (qtyAlokasi / k.totalPcs) * hargaSatuan
    }
  })
}
// Usage-based lintas kode: ganti qtyDibeli → totalNilai, hargaSatuan tidak dipakai,
// costPerPcs = (nilaiAlokasi / totalPcs)

// ── HPP JASA ──────────────────────────────────────────────
const totalHPPJasa = jasaKomponen.reduce((s, k) => s + k.nilai, 0)

// ── TOTAL HPP PER BAJU ────────────────────────────────────
const totalHPPPerBaju = totalHPPJasa + totalNilaiBahan + totalBahanBaku

// ── MARGIN ────────────────────────────────────────────────
const margin = ((hargaJualTarget - totalHPPPerBaju) / hargaJualTarget) * 100

// ── JUMLAH AKHIR TERKIRIM ─────────────────────────────────
// Dihitung granular per ukuran per warna (sesuai CLAUDE.md), lalu dijumlahkan
// untuk mendapat total per kode. Granularitas warna penting karena UI rencana
// pengiriman (S-17b) butuh tahu sisa siap-kirim per warna, bukan cuma total.
// rejects di-join: tracking_reject → tracking_produksi → kode_ukuran_warna
// (tracking_reject tidak menyimpan warna/ukuran langsung, diturunkan via join)
const jumlahAkhirDikirimPerWarna = (kodeUkuranWarna) => {
  const wasteWarna = rejects
    .filter(r => r.nasib === 'waste' && r.trackingProduksi.kodeUkuranWarnaId === kodeUkuranWarna.id)
    .reduce((s, r) => s + r.pcsReject, 0)
  return kodeUkuranWarna.jumlahPcs - wasteWarna
}
const totalWaste         = rejects.filter(r => r.nasib === 'waste').reduce((s, r) => s + r.pcsReject, 0)
const jumlahAkhirDikirim = kode.totalPcs - totalWaste  // = Σ jumlahAkhirDikirimPerWarna(warna)

// ── PENGIRIMAN PARSIAL — STATUS SELESAI ───────────────────
// Kode jadi 'selesai' setelah seluruh jumlahAkhirDikirim sudah terkirim
// (akumulasi dari pengiriman yang statusApproval = 'disetujui')
const totalTerkirim = pengirimanList
  .filter(p => p.statusApproval === 'disetujui')
  .reduce((s, p) => s + p.items.reduce((si, i) => si + i.jumlahPcs, 0), 0)
const sudahSelesai = totalTerkirim >= jumlahAkhirDikirim

// ── KASBON — SALDO & POTONGAN OTOMATIS ────────────────────
// Saldo GLOBAL (lintas semua produksi/kode) — ledger tunggal gabungan
// entri 'masuk' (manual, Deera) & 'potongan_otomatis' (sistem).
// Tidak ada alur request/approve — negosiasi & transfer dana di luar sistem,
// sistem hanya mencatat nominal yang sudah diterima Deera.
function hitungSaldoKasbon(kasbonList) {
  return kasbonList.reduce((saldo, entri) => {
    const delta = entri.tipe === 'masuk' ? entri.nominal : -entri.nominal
    return saldo + delta
  }, 0)
}

// Histori ditampilkan dengan saldo berjalan per entri (urut waktu naik)
function histroriDenganSaldoBerjalan(kasbonList) {
  let saldo = 0
  return [...kasbonList]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(entri => {
      saldo += entri.tipe === 'masuk' ? entri.nominal : -entri.nominal
      return { ...entri, saldoSetelah: saldo }
    })
}

// Trigger: dipanggil otomatis saat status kode berubah → 'selesai'
// (titik integrasi sama dengan notifikasi "Kode selesai", lihat CLAUDE.md § Notifikasi)
function catatPotonganKasbonOtomatis(kode) {
  const nilaiPotongan = kode.hpp.totalHPPPerBaju * jumlahAkhirDikirim  // HPP/pcs × jumlah pcs terkirim
  return {
    tanggal:   new Date(),
    tipe:      'potongan_otomatis',
    nominal:   nilaiPotongan,        // selalu positif; tanda '-' diterapkan saat hitungSaldoKasbon
    kodeId:    kode.id,
    catatan:   `POTONGAN OTOMATIS — ${kode.kodeProduk} SELESAI (${jumlahAkhirDikirim} PCS × ${formatRp(kode.hpp.totalHPPPerBaju)})`,
    createdBy: null,                 // null = sistem, bukan input manual
  }
}
// Entri hasil fungsi ini bersifat final & tidak bisa diedit/dihapus oleh siapapun
// (termasuk Deera) — hanya entri 'masuk' yang dapat dikelola Deera.

// ── SISA BAHAN SEKUNDER (estimasi, ditampilkan ke Jihan) ──
const totalTerpakaiSekunder = konsumsiYard * totalPcsProduksi
const sisaYardSekunder      = bahanSekunder.jumlahDibeli - totalTerpakaiSekunder
```

### Konversi ke Yard
```js
const KONVERSI = {
  meterKeYard: (m)  => m * 1.09361,
  cmKeYard:    (cm) => cm / 91.44,
  yardKeYard:  (y)  => y,          // no-op
}
function konversiKeYard(nilai, satuan) {
  return KONVERSI[`${satuan}KeYard`]?.(nilai) ?? nilai
}
// Panel tidak dikonversi — dihitung per panel
```

---

## Prinsip Arsitektur Kode

Codebase disusun dengan **Vertical Slice Architecture**: kode dikelompokkan per fitur/use-case (mis. semua hal tentang "Kasbon" — UI, hook, query, validasi — dalam satu folder), bukan per layer teknis (controllers/services/models terpisah). Tujuannya: **highly maintainable**, dengan Separation of Concerns, prinsip SOLID, dan Dependency Inversion dijaga konsisten di seluruh fitur — bukan hanya sebagian.

**Aturan struktur per slice** (berlaku utk SEMUA fitur di `features/`, termasuk yang akan ditambah nanti):

```
features/<nama-fitur>/
├── <NamaFitur>Page.jsx     # route-level component (entry point fitur ini)
├── components/             # komponen UI khusus fitur ini (tidak dipakai fitur lain)
├── hooks/                  # use<Sesuatu> — boundary antara UI & data layer
├── api/                    # <namaFitur>Repository.js — satu-satunya tempat panggil Supabase
├── schema.js               # Zod schema validasi input fitur ini
└── index.js                # public API — satu-satunya pintu ekspor ke luar slice
```

**Lapisan & alur ketergantungan (Dependency Inversion):**

```
Component  →  hook (use*)  →  repository (api/*)  →  Supabase client
   (UI)        (abstraksi)      (akses data)           (detail teknis)
```

- **Component** tidak pernah memanggil Supabase atau repository langsung — selalu lewat hook. Component bergantung pada "kontrak" hook (data, status loading, fungsi mutasi), bukan pada implementasinya.
- **Hook** (`useSaldoKasbon`, `useKode`, `useCatatNota`, dll) membungkus repository dengan TanStack Query (`useQuery`/`useMutation`), menangani cache, realtime, dan state loading/error.
- **Repository** (`kasbonRepository.js`, `kodeRepository.js`, dll) membungkus query/mutation Supabase mentah jadi fungsi polos (`getSaldoKasbon()`, `updateStatusKode(id, status)`). Inilah satu-satunya seam ke detail teknis — kalau backend berubah, hanya file ini yang disentuh.

Ini menerapkan **Dependency Inversion** ala React: modul level-tinggi (UI) bergantung pada abstraksi (hook), bukan pada modul level-rendah (Supabase client) — dan abstraksi tidak bergantung pada detail, melainkan sebaliknya.

**Prinsip SOLID dalam konteks hooks/komponen:**

| Prinsip | Penerapan |
|---------|-----------|
| **Single Responsibility** | Satu hook = satu tanggung jawab. `useSaldoKasbon` cuma hitung saldo, `useCatatKasbonMasuk` cuma handle mutasi — jangan digabung jadi `useKasbon` raksasa |
| **Open/Closed** | Komponen shared (`components/ui/Button`, `Modal`, `StatusBadge`) menerima variant/props/render-prop, bukan diedit tiap ada fitur baru |
| **Liskov Substitution** | Komponen generik yang menerima enum/status (mis. `StatusBadge` menerima `STATUS_KODE` apa saja) harus konsisten perilakunya utk semua varian |
| **Interface Segregation** | Hook mengembalikan hanya yang dibutuhkan consumer — jangan return objek besar berisi 15 field kalau yang dipakai cuma 2 |
| **Dependency Inversion** | Lihat alur Component → hook → repository → Supabase di atas |

**Batas antar slice (Separation of Concerns):**

- Tiap slice mengekspor publicnya lewat `index.js` saja (mis. `features/kode/index.js` export `KodeDetailPage`, `useKode`). Slice lain **tidak boleh** import langsung dari `components/` atau `api/` internal slice lain — hanya lewat `index.js`.
- Sesuatu masuk **shared kernel** (`components/ui/`, `lib/`, `utils/`, `constants/`, `store/`) hanya jika dipakai ≥3 slice yang tidak berkaitan. Kalau ragu, taruh di slice dulu — pemindahan ke shared lebih mudah daripada memecah kopling yang sudah telanjur terbentuk.

---

## Struktur Folder Proyek

```
jihan-production/
├── src/
│   ├── components/
│   │   ├── ui/              # Button, Badge, Input, Slider, Modal, dll (shared kernel)
│   │   └── shared/          # KodeCard, StatusBadge, HPPBreakdown, ProduksiBar — dipakai ≥3 slice
│   ├── features/
│   │   ├── auth/                # login, invite, reset password
│   │   │   ├── LoginPage.jsx / InvitePage.jsx
│   │   │   ├── components/      ├── hooks/      ├── api/      ├── schema.js      └── index.js
│   │   ├── produksi/            # buat produksi, surat jalan, bahan
│   │   │   ├── ProduksiListPage.jsx / ProduksiDetailPage.jsx
│   │   │   ├── components/      ├── hooks/      ├── api/      ├── schema.js      └── index.js
│   │   ├── kode/                # buat kode, warna, status flow
│   │   │   ├── KodeDetailPage.jsx
│   │   │   ├── components/      ├── hooks/      ├── api/      ├── schema.js      └── index.js
│   │   ├── sampel/              # upload, review, histori
│   │   ├── hpp/                 # input HPP, kalkulasi, review — termasuk HPPKalkulatorPage.jsx
│   │   ├── buku-potong/         # input data aktual potong
│   │   ├── nota/                # nota bahan baku, katalog
│   │   ├── tracking/            # update produksi per warna per tahap
│   │   ├── pengiriman/          # pengiriman parsial + approval Jihan
│   │   ├── kasbon/              # input kasbon (Deera), histori & saldo (Deera & Jihan)
│   │   ├── notifikasi/          # daftar notifikasi, pengaturan mode (real-time/digest)
│   │   └── dashboard/           # DashboardPage.jsx (beda tampilan per role, tapi satu slice)
│   │       ├── DashboardPage.jsx
│   │       ├── components/      ├── hooks/      ├── api/      └── index.js
│   │   # ↳ tiap folder fitur mengikuti struktur "Aturan struktur per slice" di atas
│   ├── utils/
│   │   ├── formatRp.js
│   │   ├── konversiSatuan.js
│   │   └── hppCalc.js
│   ├── constants/           # STATUS_KODE, ROLE, NASIB_REJECT, TIPE_BAHAN, TIPE_KASBON
│   ├── store/               # Zustand stores (state lintas-slice, mis. auth session)
│   └── lib/
│       ├── supabase.js
│       └── cloudinary.js
│
├── supabase/
│   ├── migrations/          # SQL migrations (run in order)
│   ├── functions/
│   │   ├── push-notify/     # kirim push notifikasi real-time
│   │   ├── notif-digest/    # cron harian: rangkum notifikasi utk user mode digest_harian
│   │   └── cloudinary-sign/ # generate signed upload params
│   └── seed.sql             # hpp_template_komponen default
│
├── public/
│   └── icons/               # PWA icons
│
├── PRD.md
├── CLAUDE.md
├── user-flow.md
├── architecture.md
├── wireframe.md
├── vite.config.js
└── package.json
```

---

## Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=jihan-production
VITE_CLOUDINARY_UPLOAD_PRESET=sampel_unsigned
# (API secret hanya di Edge Function, tidak di client)
```

---

## Keamanan

| Aspek | Implementasi |
|-------|-------------|
| Auth | Supabase Auth — JWT dikelola otomatis |
| Otorisasi data | RLS di level database |
| Upload foto | Signed upload — secret key tidak pernah di client |
| Role enforcement | RLS policy + check di UI |
| HTTPS | Supabase dan Cloudinary sudah HTTPS by default |

---

## Keuntungan Stack Ini vs Sebelumnya

| Aspek | Stack Lama | Stack Baru |
|-------|-----------|------------|
| Server management | VPS + PM2 + Nginx | Tidak perlu server sendiri |
| Auth | Custom JWT + bcrypt + Nodemailer | Supabase Auth built-in |
| Database | PostgreSQL + Prisma | Supabase PostgreSQL + RLS |
| File storage | Local disk / MinIO | Cloudinary (CDN + transformasi) |
| Realtime | Polling / manual refresh | Supabase Realtime built-in |
| Biaya awal | Lebih besar (VPS) | Lebih hemat (Supabase free tier) |
| Maintenance | Lebih banyak | Minimal |
