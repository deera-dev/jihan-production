import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '../hooks/useSession'
import { ROLE } from '../../../constants/enums'

export function ProtectedRoute({ allowedRoles }) {
  const { profile, isLoading } = useSession()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-champagne-100">
        <p className="font-sans text-body text-charcoal-600">MEMUAT...</p>
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Master melewati semua role guard
  if (profile.role === ROLE.MASTER) return <Outlet />

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
