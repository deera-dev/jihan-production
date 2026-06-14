# Panduan Deploy — Jihan Production

## Yang Sudah Disiapkan

- `.env` — credentials Supabase & Cloudinary sudah terisi
- `vercel.json` — SPA routing sudah dikonfigurasi
- `public/icons/` — PWA icons tersedia (192, 512, 512-maskable)
- Bug TanStack Query v5 (`keepPreviousData`) sudah diperbaiki

---

## Langkah 1 — Push ke GitHub

Buka terminal di folder project ini, lalu jalankan:

```bash
git init
git add .
git commit -m "chore: initial production build"
```

Buat repo baru di https://github.com/new (nama: `jihan-production`, Private), lalu:

```bash
git remote add origin https://github.com/<username>/jihan-production.git
git branch -M main
git push -u origin main
```

---

## Langkah 2 — Deploy ke Vercel

### Opsi A: Via Dashboard (Lebih Mudah)

1. Buka https://vercel.com/new
2. Pilih **"Import Git Repository"** → pilih repo `jihan-production`
3. Framework: **Vite** (biasanya terdeteksi otomatis)
4. Klik **"Environment Variables"** dan tambahkan 4 variabel:

   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | `https://mhgranieakuygxxnbhcv.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `sb_publishable_Yxpf7ySrnn6aqpj0Y1aoeg_lG5SzTQt` |
   | `VITE_CLOUDINARY_CLOUD_NAME` | `ddsxo8hmf` |
   | `VITE_CLOUDINARY_UPLOAD_PRESET` | `deeraindonesia` |

5. Klik **Deploy** — Vercel otomatis build & deploy.

### Opsi B: Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

Saat ditanya environment variables, masukkan 4 nilai di atas.

---

## Langkah 3 — Deploy Supabase Edge Functions

Edge functions perlu di-deploy terpisah. Install Supabase CLI dulu:

```bash
npm install -g supabase
supabase login
supabase link --project-ref mhgranieakuygxxnbhcv
```

### Set Secrets Edge Functions

Kamu perlu Cloudinary **API Key** dan **API Secret** (dari Cloudinary Dashboard → Settings → Access Keys):

```bash
supabase secrets set CLOUDINARY_API_KEY=<isi_dari_cloudinary>
supabase secrets set CLOUDINARY_API_SECRET=<isi_dari_cloudinary>
```

### Deploy Functions

```bash
supabase functions deploy cloudinary-sign
supabase functions deploy undang-pengguna
```

---

## Langkah 4 — Verifikasi

Setelah deploy berhasil:

1. Buka URL Vercel yang diberikan
2. Login dengan akun Deera (email yang sudah didaftarkan di Supabase Auth)
3. Cek fitur upload sampel → ini akan test `cloudinary-sign` edge function
4. Cek undang pengguna → ini akan test `undang-pengguna` edge function

---

## Troubleshooting

**Build error "Cannot find module"** → pastikan semua import benar, jalankan `npm run build` lokal dulu.

**Halaman blank setelah refresh** → `vercel.json` sudah ada, pastikan file ter-commit ke git.

**Upload foto gagal** → cek secrets Cloudinary sudah di-set dengan benar via `supabase secrets list`.

**Login gagal** → pastikan Supabase Auth sudah punya user, atau gunakan fitur "Invite User" dari email.
