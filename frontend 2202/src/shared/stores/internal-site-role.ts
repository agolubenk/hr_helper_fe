/**
 * Роль пользователя на внутреннем сайте (демо).
 * В продакшене — из auth/session.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type InternalSiteRole = 'user' | 'admin'

interface InternalSiteRoleState {
  role: InternalSiteRole
  setRole: (role: InternalSiteRole) => void
}

export const useInternalSiteRole = create<InternalSiteRoleState>()(
  persist(
    (set) => ({
      role: 'admin',
      setRole: (role) => set({ role }),
    }),
    { name: 'internal-site-role' }
  )
)
