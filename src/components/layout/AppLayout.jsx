// App shell: bottom navigation + content area.
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  useAuthStore,
  selectIsDeera,
  selectIsMaster,
  selectViewAsRole,
} from '../../store/useAuthStore'
import { useNotifikasi } from '../../features/notifikasi'

const navDeera = [
  { to: '/',           label: 'BERANDA',  exact: true  },
  { to: '/produksi',   label: 'PRODUKSI', exact: false },
  { to: '/nota',       label: 'NOTA',     exact: false },
  { to: '/pengaturan', label: 'ATUR',     exact: false },
]

const navJihan = [
  { to: '/',            label: 'BERANDA',  exact: true  },
  { to: '/produksi',    label: 'PRODUKSI', exact: false },
  { to: '/notifikasi',  label: 'NOTIF',    exact: false, showBadge: true },
  { to: '/pengaturan',  label: 'AKUN',     exact: false },
]

export function AppLayout() {
  const isDeera       = useAuthStore(selectIsDeera)
  const isMaster      = useAuthStore(selectIsMaster)
  const viewAsRole    = useAuthStore(selectViewAsRole)
  const setViewAsRole = useAuthStore((s) => s.setViewAsRole)
  const location      = useLocation()

  const items = isDeera ? navDeera : navJihan

  const { data: notifikasi = [] } = useNotifikasi()
  const unreadCount = notifikasi.filter((n) => !n.is_read).length

  function isActive(item) {
    if (item.exact) return location.pathname === item.to
    return location.pathname.startsWith(item.to)
  }

  if (isMaster && !viewAsRole) {
    return <MasterRolePicker onSelect={setViewAsRole} />
  }

  return (
    <div className="flex min-h-screen flex-col bg-champagne-100">
      {isMaster && (
        <div className="fixed right-4 top-4 z-50 flex items-center gap-1 rounded-full border border-gold-500 bg-surface px-3 py-1 shadow-md">
          <span className="mr-1 font-sans text-xs font-semibold text-charcoal-600">LIHAT:</span>
          <button
            onClick={() => setViewAsRole('deera')}
            className={[
              'rounded-full px-2 py-0.5 font-sans text-xs font-bold transition-colors',
              viewAsRole === 'deera'
                ? 'bg-navy-900 text-champagne-100'
                : 'text-charcoal-600 hover:bg-champagne-200',
            ].join(' ')}
          >
            DEERA
          </button>
          <button
            onClick={() => setViewAsRole('jihan')}
            className={[
              'rounded-full px-2 py-0.5 font-sans text-xs font-bold transition-colors',
              viewAsRole === 'jihan'
                ? 'bg-navy-900 text-champagne-100'
                : 'text-charcoal-600 hover:bg-champagne-200',
            ].join(' ')}
          >
            JIHAN
          </button>
        </div>
      )}

      <main className={['flex-1 pb-16', isMaster ? 'pt-12' : ''].join(' ')}>
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center justify-around border-t border-border bg-surface">
        {items.map((item) => {
          const active = isActive(item)
          const badge = item.showBadge && unreadCount > 0
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={[
                'flex flex-1 flex-col items-center justify-center py-2',
                'font-sans text-xs font-semibold tracking-wide transition-colors',
                active ? 'text-navy-900' : 'text-charcoal-300',
              ].join(' ')}
            >
              <span
                className={[
                  'mb-1 block h-0.5 w-5 rounded-full transition-colors',
                  active ? 'bg-gold-500' : 'bg-transparent',
                ].join(' ')}
              />
              <span className="relative">
                {item.label}
                {badge && (
                  <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-danger font-sans text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}

function MasterRolePicker({ onSelect }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-champagne-100 px-6">
      <div className="text-center">
        <p className="mb-1 font-sans text-xs font-semibold uppercase tracking-widest text-gold-500">
          MASTER VIEW
        </p>
        <h1 className="font-heading text-heading text-navy-900">LIHAT SEBAGAI</h1>
        <p className="mt-2 font-sans text-body text-charcoal-600">
          Pilih tampilan yang ingin dibuka
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3">
        <button
          onClick={() => onSelect('deera')}
          className="w-full rounded-2xl border-2 border-navy-900 bg-navy-900 py-4 font-sans text-label font-bold tracking-wider text-champagne-100 transition-opacity active:opacity-80"
        >
          DEERA
          <span className="ml-2 font-normal normal-case tracking-normal opacity-70">— Produsen (Full CRUD)</span>
        </button>
        <button
          onClick={() => onSelect('jihan')}
          className="w-full rounded-2xl border-2 border-navy-900 py-4 font-sans text-label font-bold tracking-wider text-navy-900 transition-opacity active:opacity-80"
        >
          JIHAN
          <span className="ml-2 font-normal normal-case tracking-normal opacity-70">— Klien (Read-only + Approve)</span>
        </button>
      </div>
    </div>
  )
}
