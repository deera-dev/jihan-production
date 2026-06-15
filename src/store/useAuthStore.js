// Zustand store: sesi auth & role aktif.
// Tidak memanggil Supabase langsung — itu tugas authRepository.js.

import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  viewAsRole: null,

  setSession: (user, profile) => set({ user, profile, isLoading: false }),
  clearSession: () => set({ user: null, profile: null, isLoading: false, viewAsRole: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setViewAsRole: (role) => set({ viewAsRole: role }),
}))

// --- Helper internal ---
function _effectiveRole(state) {
  const role = state.profile?.role ?? null
  if (role === 'master' && state.viewAsRole) return state.viewAsRole
  return role
}

// --- Selectors ---
export const selectRole       = (state) => _effectiveRole(state)
export const selectIsDeera    = (state) => _effectiveRole(state) === 'deera'
export const selectIsJihan    = (state) => _effectiveRole(state) === 'jihan'
export const selectIsMaster   = (state) => state.profile?.role === 'master'
export const selectActualRole = (state) => state.profile?.role ?? null
export const selectViewAsRole = (state) => state.viewAsRole
export const selectProfile    = (state) => state.profile
export const selectUser       = (state) => state.user
