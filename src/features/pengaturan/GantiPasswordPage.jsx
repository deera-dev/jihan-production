import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function GantiPasswordPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ baru: '', konfirmasi: '' })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [sukses, setSukses] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErr('')
    if (form.baru.length < 8) { setErr('Kata sandi minimal 8 karakter.'); return }
    if (form.baru !== form.konfirmasi) { setErr('Konfirmasi kata sandi tidak cocok.'); return }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: form.baru })
      if (error) throw error
      setSukses(true)
      setTimeout(() => navigate('/pengaturan'), 2000)
    } catch (e) {
      setErr(e.message ?? 'Gagal mengganti kata sandi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-champagne-100">
      <div className="bg-navy-900 px-4 py-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/pengaturan')} className="font-sans text-sm text-champagne-100 opacity-70">&#8592; KEMBALI</button>
          <h1 className="font-heading text-heading text-champagne-100">GANTI KATA SANDI</h1>
        </div>
      </div>
      <div className="px-4 py-6 space-y-4">
        {sukses ? (
          <div className="rounded-xl bg-success/10 border border-success/20 px-4 py-4">
            <p className="font-sans text-label font-semibold text-success">Kata sandi berhasil diperbarui.</p>
            <p className="font-sans text-xs text-success mt-1">Mengalihkan ke pengaturan...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Kata Sandi Baru</label>
              <input type="password" value={form.baru}
                onChange={(e) => setForm((p) => ({ ...p, baru: e.target.value }))}
                placeholder="Minimal 8 karakter"
                className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500" />
            </div>
            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Konfirmasi Kata Sandi</label>
              <input type="password" value={form.konfirmasi}
                onChange={(e) => setForm((p) => ({ ...p, konfirmasi: e.target.value }))}
                placeholder="Ulangi kata sandi baru"
                className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500" />
            </div>
            {err && <p className="font-sans text-label text-danger">{err}</p>}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-gold-500 py-3.5 font-sans text-body font-semibold text-navy-900 disabled:opacity-50">
              {loading ? 'MENYIMPAN...' : 'SIMPAN'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
