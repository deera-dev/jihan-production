# Design System — Jihan Production

Dokumen ini menerjemahkan prinsip di "Prinsip UI/UX" (CLAUDE.md) menjadi token dan spesifikasi konkret yang dipakai konsisten saat coding. Semua nilai di sini final kecuali direvisi bersama.

---

## 1. Filosofi Visual

Kesan yang dituju: **butik fashion premium**, bukan aplikasi gudang/inventori. Basis terang dan hangat (bukan dashboard gelap ala admin panel) dengan navy sebagai warna brand utama (teks, aksi utama, header) dan gold/champagne sebagai aksen yang memberi sentuhan mewah pada momen-momen penting (status approved, highlight harga, dekorasi halus). Charcoal dipakai untuk teks sekunder dan elemen netral.

Prinsip turunan:
- Ruang putih/napas cukup — jangan padat seperti aplikasi gudang
- Kontras tinggi antara teks dan latar agar mudah dibaca (penting untuk Jihan yang gaptek-friendly)
- Aksen gold dipakai **secukupnya** — untuk penekanan, bukan dekorasi berlebihan

---

## 2. Palet Warna

### Brand Base

| Token | Hex | Pemakaian |
|-------|-----|-----------|
| `navy-900` | `#101B2D` | Header gelap, teks judul utama, tombol primary (filled) |
| `navy-700` | `#1B2A41` | Varian aktif/hover dari navy-900, ikon aktif |
| `charcoal-600` | `#3A3F47` | Teks sekunder, label, ikon non-aktif |
| `charcoal-300` | `#9CA3AC` | Teks tersier, placeholder, border input |

### Aksen

| Token | Hex | Pemakaian |
|-------|-----|-----------|
| `gold-500` | `#C8A04D` | Aksen utama: highlight harga, badge "approved", border aktif, ikon penting |
| `gold-300` | `#DCC07F` | Varian lebih lembut (hover, latar highlight tipis) |
| `champagne-200` | `#F0E6D2` | Latar aksen lembut (kartu highlight, section alternatif) |
| `champagne-100` | `#F8F3EA` | Latar utama aplikasi (pengganti putih polos — terasa hangat) |

### Netral & Permukaan

| Token | Hex | Pemakaian |
|-------|-----|-----------|
| `surface` | `#FFFFFF` | Latar kartu, modal, input |
| `bg-base` | `#F8F3EA` (= champagne-100) | Latar halaman |
| `border` | `#E6E0D4` | Pembatas tipis antar elemen |
| `text-primary` | `#1B2A41` (= navy-700) | Teks utama |
| `text-secondary` | `#3A3F47` (= charcoal-600) | Teks sekunder |
| `text-muted` | `#9CA3AC` (= charcoal-300) | Placeholder, teks nonaktif |

### Semantik (status & feedback)

Dipilih dengan saturasi rendah agar tetap selaras palet premium — bukan warna mencolok ala aplikasi konsumen umum.

| Token | Hex | Pemakaian |
|-------|-----|-----------|
| `success` | `#3F7D5C` | Approve, selesai, progress 100% |
| `danger` | `#B5483B` | Tolak, waste, hapus, error |
| `warning` | `#C8893A` | Menunggu tindakan, perlu bahan tambahan |
| `info` | `#4A7296` | Info netral, status menunggu review |

### Pemetaan Warna Badge Status (`STATUS_KODE`)

Dikelompokkan per fase agar pola warna mudah dikenali sekilas:

| Kelompok | Status | Warna badge |
|----------|--------|-------------|
| Sampel | `sampel_dibuat`, `review_sampel` | `info` (biru keabuan) |
| | `sampel_ditolak` | `danger` |
| | `sampel_approved` | `success` |
| Estimasi & Potong | `estimasi_pemakaian`, `konfirmasi_pemakaian`, `proses_potong`, `input_buku_potong` | `gold-500` (proses aktif, perlu perhatian) |
| | `dibatalkan` | `charcoal-300` (badge abu-abu netral, lihat S-07) |
| HPP | `input_nota`, `input_hpp`, `review_hpp` | `info` |
| | `hpp_ditolak` | `danger` |
| | `hpp_approved` | `success` |
| Produksi & Kirim | `produksi`, `siap_kirim` | `gold-500` |
| | `selesai` | `navy-900` (status final, warna brand penuh) |

> Implementasi: gunakan latar pucat dari warna terkait (mis. `success` 12% opacity) + teks warna penuh, agar tetap lembut dan tidak "berisik" di layar penuh kartu status.

---

## 3. Tipografi

| Peran | Font | Alasan |
|-------|------|--------|
| Heading (judul layar, nama produksi) | **Playfair Display** (serif) | Karakter editorial/fashion, memberi kesan mewah pada judul tanpa mengorbankan keterbacaan di ukuran besar |
| Body, label, UI, angka | **Inter** (sans-serif) | Sangat jelas di layar kecil, tersedia gratis (Google Fonts), punya angka tabular untuk tampilan harga yang rapi |

Kedua font tersedia gratis via Google Fonts dan ringan untuk web/PWA.

### Skala

| Token | Ukuran / line-height | Font | Pemakaian |
|-------|---------------------|------|-----------|
| `display` | 28px / 36px | Playfair Display, 600 | Judul halaman utama (mis. nama produksi di header) |
| `heading` | 20px / 28px | Playfair Display, 600 | Judul section, nama kartu kode |
| `subheading` | 16px / 24px | Inter, 600 | Label section, sub-judul |
| `body` | 15px / 22px | Inter, 400 | Teks isi, deskripsi |
| `label` | 13px / 18px | Inter, 500 | Label input, caption, keterangan kecil |
| `price` | 16px / 22px | Inter, 600, tabular-nums | Nilai Rupiah — selalu pakai angka tabular agar rapi sejajar |
| `button` | 15px / 20px | Inter, 600 | Teks tombol |

---

## 4. Spacing & Grid

Sistem spasi berbasis kelipatan 4px agar konsisten dan mudah dihitung:

`4 · 8 · 12 · 16 · 24 · 32 · 48` (token: `space-1` … `space-7`)

- Padding kartu standar: `16px`
- Jarak antar elemen dalam form: `16px`
- Jarak antar section: `24–32px`
- Margin halaman (kiri-kanan): `16px` di layar 390px, naik ke `24px` pada layar ≥ 600px

### Breakpoint

| Breakpoint | Lebar | Catatan |
|-----------|-------|---------|
| `mobile` | ≥ 390px | Basis desain (lihat semua wireframe) |
| `tablet` | ≥ 768px | Layout kartu jadi 2 kolom pada daftar (Daftar Produksi, Daftar Nota); form tetap 1 kolom agar fokus |
| `desktop` | ≥ 1024px | Konten dibatasi max-width ~720px, di-center — aplikasi tetap terasa seperti app mobile yang "diperbesar", bukan dashboard lebar |

---

## 5. Komponen

### Tombol

| Varian | Latar | Teks | Border | Pemakaian |
|--------|-------|------|--------|-----------|
| Primary (filled) | `navy-900` | putih | – | Aksi utama: simpan, kirim, setujui |
| Secondary (outlined) | transparan | `navy-900` | `navy-900` 1.5px | Aksi sekunder: batal, lihat detail |
| Aksen (gold) | `gold-500` | `navy-900` | – | Aksi bernuansa "premium"/penting: bagikan ke WhatsApp, highlight CTA tertentu |
| Destructive | `danger` | putih | – | Hapus permanen, tolak (dalam modal) |
| Ghost/text | transparan | `navy-700` | – | Aksi tersier dalam list/card |

- Tinggi tombol: `48px` (touch target nyaman untuk Jihan)
- Radius: `12px`
- State disabled: opacity 40%, tidak ada shadow
- State pressed: turunkan brightness latar 8%

### Input & Slider

- Tinggi input: `48px`, radius `10px`, border `border` 1px, fokus → border `gold-500` 1.5px + shadow tipis gold 12% opacity
- Placeholder: `text-muted`, italic tidak dipakai (jaga keterbacaan)
- Slider: track `champagne-200`, isi terisi `gold-500`, thumb `navy-900` dengan ring putih — selalu sinkron dua arah dengan input manual di sebelahnya (sesuai aturan input global)
- Angka: selalu format `Rp 85.000` via `formatRp()`, tabular-nums

### Kartu (Card)

- Latar `surface`, radius `16px`, border `border` 1px, shadow halus (`0 2px 8px rgba(16,27,45,0.06)`)
- Padding `16px`
- Jarak antar kartu dalam list: `12px`

### Badge Status

- Bentuk pill, radius penuh, padding horizontal `12px` vertical `4px`
- Latar = warna status pada opacity 12%, teks = warna status penuh, `label` weight 600
- Lihat pemetaan warna di bagian 2

### Modal & Bottom Sheet

- Bottom sheet untuk aksi kontekstual (reject, detail singkat) — slide dari bawah, radius atas `20px`
- Modal penuh untuk konfirmasi destruktif — selalu sertakan form alasan langsung (sesuai aturan "tanpa apakah yakin terpisah")
- Overlay: `navy-900` pada opacity 40%

### Progress Bar (tracking produksi)

- Track `champagne-200`, isi `navy-900` (progress umum) atau `success` (saat 100%)
- Tinggi `8px`, radius penuh
- Label angka di kanan: `label` style, `text-secondary`

### Tab Switcher (Sampel | HPP | Produksi)

- Garis bawah aktif `gold-500` 2px, teks aktif `navy-900` 600 weight, teks nonaktif `text-muted`

### Bottom Navigation

- Latar `surface`, ikon + label, aktif → `navy-900` dengan label gold-tinted underline kecil; nonaktif → `text-muted`
- Tinggi `64px`, shadow tipis di bagian atas untuk pemisahan dari konten

---

## 6. Ikon

Konsisten dengan prinsip "minim icon — teks sebagai label utama". Set ikon dipakai **hanya** untuk:

- Navigasi (back, tab bar, search)
- Status indikator kecil (centang approve, silang tolak, jam menunggu)
- Aksi yang sangat umum dikenali (notifikasi/lonceng, edit/pensil, hapus/tempat sampah, share/WhatsApp)

Gaya: **outline, stroke 1.5px**, ukuran `20px` atau `24px`. Gunakan satu pustaka konsisten (mis. Lucide/Feather) — hindari mencampur gaya ikon. Warna ikon mengikuti warna teks di sekitarnya (`text-secondary` default, `navy-900` saat aktif).

---

## 7. Aksesibilitas

- Kontras teks-latar minimum **4.5:1** untuk teks body, **3:1** untuk teks besar (heading) — kombinasi `navy-900` di atas `champagne-100`/`surface` memenuhi ini
- Target sentuh minimum **44×44px** untuk semua elemen interaktif (tombol, ikon aksi, item list yang bisa di-tap)
- Semua badge status dan indikator warna disertai **label teks** — warna tidak menjadi satu-satunya penanda makna (penting untuk aksesibilitas & konsistensi dengan prinsip "teks sebagai label utama")
- Ukuran teks minimum `13px` (label), `15px` untuk teks isi yang dibaca panjang

---

## 8. Motion & Transisi

Gerakan halus dan singkat — mendukung kesan premium tanpa terasa lambat:

- Transisi standar: `150–200ms`, easing `ease-out`
- Perubahan status (badge berubah warna, progress bar bertambah): animasi `300ms` agar perubahan terasa, tidak instan
- Bottom sheet & modal: slide/fade `250ms`
- Swipe-to-delete (notifikasi): mengikuti gestur jari secara real-time, snap-back `200ms` jika dibatalkan
- Loading state: skeleton halus dengan shimmer warna `champagne-200` → `border`, hindari spinner generik agar tetap terasa "premium"

---

## 9. Penerapan di Kode

Simpan seluruh token di satu file (mis. `src/styles/tokens.js` atau setara Tailwind config `theme.extend`) agar perubahan palet/skala cukup dilakukan di satu tempat:

```js
export const COLORS = {
  navy900: '#101B2D',
  navy700: '#1B2A41',
  charcoal600: '#3A3F47',
  charcoal300: '#9CA3AC',
  gold500: '#C8A04D',
  gold300: '#DCC07F',
  champagne200: '#F0E6D2',
  champagne100: '#F8F3EA',
  surface: '#FFFFFF',
  border: '#E6E0D4',
  success: '#3F7D5C',
  danger: '#B5483B',
  warning: '#C8893A',
  info: '#4A7296',
};

export const SPACE = [4, 8, 12, 16, 24, 32, 48];

export const RADIUS = { sm: 10, md: 12, lg: 16, full: 9999 };
```

> Catatan: nilai di dokumen ini adalah rekomendasi awal (belum ada brand guideline resmi dari Jihan). Bila kelak ada nilai hex/font resmi dari pihak Jihan, cukup perbarui token di sini — seluruh komponen mengikuti otomatis.
