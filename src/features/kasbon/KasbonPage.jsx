// JP-035 / JP-036 — Kasbon: ledger saldo global Deera ↔ Jihan.
// Deera: lihat ledger + input dana masuk.
// Jihan: lihat ledger read-only.

import { useState } from 'react'
import { useAuthStore, selectIsDeera } from '../../store/useAuthStore'
import { useLedgerKasbon, useSaldoKasbon, useTambahKasbonMasuk } from './hooks/useKasbon'
import { formatRp } from '../../utils/formatRp'
import { formatTanggal } from '../../utils/formatTanggal'

export function KasbonPage() {
  const isDeera = useAuthStore(selectIsDeera)
  const { data: ledger = [], isLoading } = useLedgerKasbon()
  const { data: saldo = 0 } = useSaldoKasbon()
  const tambahMasukMut = useTambahKasbonMasuk()

  const [showForm, setShowForm] = useState(false)
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10))
  const [nominal, setNominal] = useState('')
  const [catatan, setCatatan] = useState('')
  const [formError, setFormError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    const n = Number(nominal)
    if (!n || n <= 0) { setFormError('Nominal harus lebih dari 0'); return }
    try {
      await tambahMasukMut.mutateAsync({ tanggal, nominal: n, catatan })
      setShowForm(false)
      setNominal('')
      setCatatan('')
    } catch (err) {
      setFormError(err.message ?? 'Gagal menyimpan kasbon')
    }
  }

  const ledgerDesc = [...ledger].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return (
    <div className="bg-champagne-100">
      <div className="sticky top-0 z-30 bg-navy-900 px-4 py-5">
        <h1 className="font-heading text-heading text-champagne-100">KASBON</h1>
        <p className="font-sans text-xs text-champagne-100 opacity-50 mt-0.5">SALDO BERJALAN</p>
        <p className={[
          'font-heading text-2xl mt-1',
          saldo >= 0 ? 'text-gold-500' : 'text-danger',
        ].join(' ')}>
          {formatRp(saldo)}
        </p>
        <p className="font-sans text-xs text-champagne-100 opacity-50 mt-1">
          {saldo >= 0 ? 'Dana Deera dari Jihan' : 'Saldo minus \u2014 perlu klarifikasi'}
        </p>
      </div>

      <div className="px-4 py-5 space-y-4">
        {isDeera && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-xl bg-gold-500 py-3.5 font-sans text-body font-semibold text-navy-900"
          >
            + CATAT DANA MASUK
          </button>
        )}

        <div className="rounded-xl bg-surface border border-border px-4 py-3 space-y-1">
          <p className="font-sans text-xs text-charcoal-300 uppercase font-semibold">Cara Baca Saldo</p>
          <p className="font-sans text-label text-charcoal-600">
            Saldo adalah akumulasi dana yang diterima Deera dari Jihan,
            dikurangi otomatis setiap kode selesai (HPP kode tersebut).
          </p>
        </div>

        {isLoading ? (
          <p className="text-center font-sans text-label text-charcoal-300 py-8">MEMUAT...</p>
        ) : ledger.length === 0 ? (
          <p className="text-center font-sans text-label text-charcoal-300 py-8">BELUM ADA RIWAYAT KASBON</p>
        ) : (
          <div className="space-y-2">
            <p className="font-sans text-xs font-semibold text-charcoal-300 uppercase">Riwayat</p>
            {ledgerDesc.map((entri) => (
              <EntriKartu key={entri.id} entri={entri} />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/60">
          <form onSubmit={handleSubmit} className="w-full rounded-t-2xl bg-surface px-4 pt-6 pb-8 space-y-4">
            <p className="font-heading text-heading text-navy-900">CATAT DANA MASUK</p>
            <p className="font-sans text-label text-charcoal-600 -mt-2">
              Input nominal yang sudah diterima Deera dari Jihan.
            </p>

            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Tanggal Diterima</label>
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Nominal (Rp)</label>
              <input type="number" min={1} value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 outline-none focus:border-gold-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-sans text-xs font-semibold text-charcoal-600 uppercase">Catatan (opsional)</label>
              <input type="text" value={catatan}
                onChange={(e) => setCatatan(e.target.value.toUpperCase())}
                placeholder="CATATAN"
                className="w-full rounded-xl border border-border px-4 py-3 font-sans text-body text-navy-900 uppercase outline-none focus:border-gold-500"
              />
            </div>

            {formError && <p className="font-sans text-label text-danger">{formError}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setFormError('') }}
                className="flex-1 rounded-xl border border-border py-3.5 font-sans text-body font-semibold text-charcoal-600">
                BATAL
              </button>
              <button type="submit" disabled={tambahMasukMut.isPending}
                className="flex-1 rounded-xl bg-gold-500 py-3.5 font-sans text-body font-semibold text-navy-900 disabled:opacity-50">
                {tambahMasukMut.isPending ? 'MENYIMPAN...' : 'SIMPAN'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function EntriKartu({ entri }) {
  const isMasuk = entri.tipe === 'masuk'
  return (
    <div className="rounded-xl bg-surface border border-border px-4 py-3">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={[
              'rounded-full px-2 py-0.5 font-sans text-xs font-semibold',
              isMasuk ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
            ].join(' ')}>
              {isMasuk ? '+ MASUK' : '\u2212 POTONGAN'}
            </span>
            {entri.kode?.kode_desain && (
              <span className="font-sans text-xs text-charcoal-300">{entri.kode.kode_desain}</span>
            )}
          </div>
          <p className="font-sans text-label text-charcoal-600 mt-1">
            {entri.catatan ?? (isMasuk ? 'Dana masuk dari Jihan' : 'Potongan otomatis \u2014 kode selesai')}
          </p>
          <p className="font-sans text-xs text-charcoal-300 mt-0.5">{formatTanggal(entri.tanggal ?? entri.created_at)}</p>
        </div>
        <div className="text-right ml-3">
          <p className={['font-heading text-body font-semibold', isMasuk ? 'text-success' : 'text-danger'].join(' ')}>
            {isMasuk ? '+' : '\u2212'}{formatRp(entri.nominal)}
          </p>
          <p className="font-sans text-xs text-charcoal-300 mt-0.5">
            Saldo: {formatRp(entri.saldo_berjalan)}
          </p>
        </div>
      </div>
    </div>
  )
}
