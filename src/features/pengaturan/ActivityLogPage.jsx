// Activity Log — hanya Deera. Jangan pernah tampilkan ke Jihan (CLAUDE.md Hard Rules).

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { formatTanggal } from '../../utils/formatTanggal'

async function ambilActivityLog({ page = 0, limit = 30 } = {}) {
  const { data, error, count } = await supabase
    .from('activity_log')
    .select('*, user:user_id(nama_lengkap)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1)
  if (error) throw error
  return { data: data ?? [], count: count ?? 0 }
}

export function ActivityLogPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const LIMIT = 30

  const { data, isLoading } = useQuery({
    queryKey: ['activity-log', page],
    queryFn: () => ambilActivityLog({ page, limit: LIMIT }),
    placeholderData: (prev) => prev,
  })

  const logs = data?.data ?? []
  const total = data?.count ?? 0
  const hasNext = (page + 1) * LIMIT < total

  return (
    <div className="bg-champagne-100">
      <div className="bg-navy-900 px-4 py-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/pengaturan')} className="font-sans text-sm text-champagne-100 opacity-70">&#8592; KEMBALI</button>
          <h1 className="font-heading text-heading text-champagne-100 flex-1">ACTIVITY LOG</h1>
        </div>
        <p className="font-sans text-xs text-champagne-100 opacity-50 mt-0.5">{total} entri total</p>
      </div>

      <div className="px-4 py-5 space-y-2">
        {isLoading && <p className="text-center font-sans text-label text-charcoal-300 py-8">MEMUAT...</p>}

        {!isLoading && logs.length === 0 && (
          <p className="text-center font-sans text-label text-charcoal-300 py-8">BELUM ADA AKTIVITAS</p>
        )}

        {logs.map((log) => (
          <div key={log.id} className="rounded-xl bg-surface border border-border px-4 py-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <span className="rounded-full bg-navy-700 px-2 py-0.5 font-sans text-xs text-champagne-100 font-semibold">
                  {log.aksi}
                </span>
                <p className="mt-1.5 font-sans text-label text-navy-900">{log.deskripsi}</p>
                {log.user?.nama_lengkap && (
                  <p className="mt-0.5 font-sans text-xs text-charcoal-300">oleh {log.user.nama_lengkap}</p>
                )}
              </div>
              <p className="font-sans text-xs text-charcoal-300 ml-3 whitespace-nowrap">{formatTanggal(log.created_at)}</p>
            </div>
          </div>
        ))}

        {total > LIMIT && (
          <div className="flex gap-3 pt-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="flex-1 rounded-xl border border-border py-3 font-sans text-label font-semibold text-charcoal-600 disabled:opacity-30">
              &#8592; SEBELUMNYA
            </button>
            <button onClick={() => setPage((p) => p + 1)} disabled={!hasNext}
              className="flex-1 rounded-xl border border-border py-3 font-sans text-label font-semibold text-charcoal-600 disabled:opacity-30">
              BERIKUTNYA &#8594;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
