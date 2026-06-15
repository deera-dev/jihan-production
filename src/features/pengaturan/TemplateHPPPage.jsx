// Template HPP global — Deera kelola range min-max tiap komponen jasa.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore, selectProfile } from '../../store/useAuthStore'
import { formatRp } from '../../utils/formatRp'

async function ambilTemplate() {
  const { data, error } = await supabase
    .from('hpp_template_komponen')
    .select('*')
    .order('urutan')
  if (error) throw error
  return data ?? []
}

async function upsertKomponen({ id, nama, nilai_min, nilai_max, urutan, updated_by }) {
  const payload = { nama: nama.toUpperCase(), nilai_min, nilai_max, urutan, updated_by }
  if (id) {
    const { data, error } = await supabase.from('hpp_template_komponen').update(payload).eq('id', id).select().single()
    if (error) throw error
    return data
  }
  const { data, error } = await supabase.from('hpp_template_komponen').insert({ ...payload, is_default: true }).select().single()
  if (error) throw error
  return data
}

async function hapusKomponen(id) {
  const { error } = await supabase.from('hpp_template_komponen').delete().eq('id', id)
  if (error) throw error
}

export function TemplateHPPPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const profile = useAuthStore(selectProfile)
  const { data: template = [], isLoading } = useQuery({ queryKey: ['template-hpp'], queryFn: ambilTemplate })

  const [editItem, setEditItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama: '', nilai_min: '', nilai_max: '' })
  const [konfirmHapus, setKonfirmHapus] = useState(null)

  const upsertMut = useMutation({
    mutationFn: (payload) => upsertKomponen({ ...payload, updated_by: profile?.id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['template-hpp'] }); tutupForm() },
  })

  const hapusMut = useMutation({
    mutationFn: (id) => hapusKomponen(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['template-hpp'] }); setKonfirmHapus(null) },
  })

  function bukaEdit(item) {
    setEditItem(item)
    setForm({ nama: item.nama, nilai_min: String(item.nilai_min), nilai_max: String(item.nilai_max) })
    setShowForm(true)
  }

  function bukaTambah() {
    setEditItem(null)
    setForm({ nama: '', nilai_min: '', nilai_max: '' })
    setShowForm(true)
  }

  function tutupForm() { setShowForm(false); setEditItem(null) }

  function handleSubmit(e) {
    e.preventDefault()
    const min = Number(form.nilai_min), max = Number(form.nilai_max)
    if (!form.nama.trim() || !min || !max || max < min) return
    upsertMut.mutate({
      id: editItem?.id,
      nama: form.nama,
      nilai_min: min,
      nilai_max: max,
      urutan: editItem?.urutan ?? (template.length + 1),
    })
  }

  return (
    <div className="bg-champagne-100">
      <div className="sticky top-0 z-30 bg-navy-900 px-4 py-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/pengaturan')} className="font-sans text-sm text-champagne-100 opacity-70">&#8592; KEMBALI</button>
          <h1 className="font-heading text-heading text-champagne-100 flex-1">TEMPLATE HPP</h1>
        </div>
        <p className="font-sans text-xs text-champagne-100 opacity-50 mt-0.5">Range min&#8211;max komponen HPP Jasa</p>
      </div>

      <div className="px-4 py-5 space-y-3">
        <button onClick={bukaTambah}
          className="w-full rounded-xl border-2 border-dashed border-gold-500 py-3.5 font-sans text-body font-semibold text-gold-500">
          + TAMBAH KOMPONEN
        </button>

        {isLoading && <p className="text-center font-sans text-label text-charcoal-300 py-6">MEMUAT...</p>}

        {template.map((item) => (
          <div key={item.id} className="rounded-xl bg-surface border border-border px-4 py-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-sans text-label font-semibold text-navy-900">{item.nama}</p>
                <p className="font-sans text-xs text-charcoal-600 mt-0.5">
                  {formatRp(item.nilai_min)} &#8212; {formatRp(item.nilai_max)}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => bukaEdit(item)}
                  className="rounded-lg border border-border px-3 py-1.5 font-sans text-xs font-semibold text-charcoal-600">
                  EDIT
                </button>
                <button onClick={() => setKonfirmHapus(item)}
                  className="rounded-lg border border-danger px-3 py-1.5 font-sans text-xs font-semibold text-danger">
                  HAPUS
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom sheet form */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/60">
          <form onSubmit={handleSubmit} className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4">
            <p className="font-heading text-heading text-navy-900">
              {editItem ? 'EDIT KOMPONEN' : 'TAMBAH KOMPONEN'}
            </p>
            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Nama Komponen</label>
              <input type="text" value={form.nama}
                onChange={(e) => setForm((p) => ({ ...p, nama: e.target.value.toUpperCase() }))}
                placeholder="UPAH PRODUKSI"
                className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 uppercase outline-none focus:border-gold-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Nilai Min (Rp)</label>
                <input type="number" min={0} value={form.nilai_min}
                  onChange={(e) => setForm((p) => ({ ...p, nilai_min: e.target.value }))}
                  placeholder="0"
                  className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500" />
              </div>
              <div className="space-y-1">
                <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Nilai Max (Rp)</label>
                <input type="number" min={0} value={form.nilai_max}
                  onChange={(e) => setForm((p) => ({ ...p, nilai_max: e.target.value }))}
                  placeholder="0"
                  className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={tutupForm}
                className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600">
                BATAL
              </button>
              <button type="submit" disabled={upsertMut.isPending}
                className="flex-1 rounded-xl bg-gold-500 py-3.5 font-sans text-body font-semibold text-navy-900 disabled:opacity-50">
                {upsertMut.isPending ? 'MENYIMPAN...' : 'SIMPAN'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Konfirmasi hapus */}
      {konfirmHapus && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/60">
          <div className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4">
            <p className="font-heading text-heading text-navy-900">HAPUS KOMPONEN</p>
            <p className="font-sans text-body text-charcoal-600">
              Hapus <span className="font-semibold text-navy-900">{konfirmHapus.nama}</span>? HPP yang sudah di-approve tidak terpengaruh.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setKonfirmHapus(null)}
                className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600">BATAL</button>
              <button disabled={hapusMut.isPending}
                onClick={() => hapusMut.mutate(konfirmHapus.id)}
                className="flex-1 rounded-xl bg-danger py-3.5 font-sans text-body font-semibold text-white disabled:opacity-50">
                {hapusMut.isPending ? 'MENGHAPUS...' : 'HAPUS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
