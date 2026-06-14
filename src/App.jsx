// Routing utama — React Router v6 (lihat architecture.md § Frontend).
// Role-based access SEBENARNYA ditegakkan oleh RLS (0012_rls_policies.sql);
// `ProtectedRoute` di sini hanya guard UX (redirect lebih awal & ramah,
// hindari layar kosong/error utk role yg salah).

import { Routes, Route, Navigate } from 'react-router-dom'

import { LoginPage, InvitePage, ProtectedRoute } from './features/auth'
import { AppLayout } from './components/layout/AppLayout'

import { DashboardPage } from './features/dashboard'
import { ProduksiListPage, ProduksiDetailPage, BuatProduksiPage } from './features/produksi'
import { KodeDetailPage, BuatKodePage } from './features/kode'
import { HPPKalkulatorPage } from './features/hpp'
import { BukuPotongPage } from './features/buku-potong'
import { NotaListPage } from './features/nota'
import { KasbonPage } from './features/kasbon'
import { NotifikasiPage } from './features/notifikasi'
import { PengaturanPage, KelolaPenggunaPage, ActivityLogPage, DataTerhapusPage, GantiPasswordPage, TemplateHPPPage } from './features/pengaturan'

import { ROLE } from './constants/enums'

export function App() {
  return (
    <Routes>
      {/* ── Publik ────────────────────────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/undangan" element={<InvitePage />} />

      {/* ── Authenticated: dengan AppLayout (bottom nav) ─────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          {/* Kedua role */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/notifikasi" element={<NotifikasiPage />} />
          <Route path="/kasbon" element={<KasbonPage />} />

          <Route path="/produksi" element={<ProduksiListPage />} />
          <Route path="/produksi/:produksiId" element={<ProduksiDetailPage />} />
          <Route path="/kode/:kodeId" element={<KodeDetailPage />} />

          {/*
            HPP Kalkulator: Deera input/edit, Jihan lihat & approve/tolak.
            Pembedaan UI di dalam komponen berdasar role.
          */}
          <Route path="/kode/:kodeId/hpp" element={<HPPKalkulatorPage />} />

          {/* Pengaturan — konten berbeda per role (di dalam komponen) */}
          <Route path="/pengaturan" element={<PengaturanPage />} />
          <Route path="/ganti-password" element={<GantiPasswordPage />} />
          {/* Jihan: preferensi notifikasi dari menu pengaturan → re-use NotifikasiPage */}
          <Route path="/pengaturan/notifikasi" element={<NotifikasiPage />} />

          {/* Khusus Deera */}
          <Route element={<ProtectedRoute allowedRoles={[ROLE.DEERA]} />}>
            <Route path="/nota" element={<NotaListPage />} />
            <Route path="/produksi/buat" element={<BuatProduksiPage />} />
            <Route path="/kode/baru" element={<BuatKodePage />} />
            <Route path="/kode/:kodeId/buku-potong" element={<BukuPotongPage />} />
            <Route path="/pengaturan/pengguna" element={<KelolaPenggunaPage />} />
            <Route path="/pengaturan/activity-log" element={<ActivityLogPage />} />
            <Route path="/pengaturan/data-terhapus" element={<DataTerhapusPage />} />
            <Route path="/pengaturan/template-hpp" element={<TemplateHPPPage />} />
          </Route>

        </Route>
      </Route>

      {/* ── Fallback ──────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
