import { useEffect, useMemo, useState } from 'react'
import {
  ADMIN_ROLE_ACCESS_MAP,
  ADMIN_ROLE_STORAGE_KEY,
  type AdminRole,
  parseAdminRole,
} from './roles'
import { fetchProfile } from '@/app/api/profile'

export interface UseRoleAccessResult {
  role: AdminRole
  canCreate: boolean
  canEdit: boolean
  canRemove: boolean
  canAccessPath: (path: string) => boolean
}

export function useRoleAccess(): UseRoleAccessResult {
  const [role, setRole] = useState<AdminRole>(() => {
    if (typeof window === 'undefined') return parseAdminRole(null)
    return parseAdminRole(localStorage.getItem(ADMIN_ROLE_STORAGE_KEY))
  })

  useEffect(() => {
    const syncFromStorage = () => {
      setRole(parseAdminRole(localStorage.getItem(ADMIN_ROLE_STORAGE_KEY)))
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === ADMIN_ROLE_STORAGE_KEY || event.key === null) {
        syncFromStorage()
      }
    }

    const onCustomStorage = (event: Event) => {
      const customEvent = event as CustomEvent<{ key?: string }>
      if (customEvent.detail?.key === ADMIN_ROLE_STORAGE_KEY) {
        syncFromStorage()
      }
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener('localStorageChange', onCustomStorage as EventListener)

    const syncRoleFromApi = async () => {
      const profile = await fetchProfile()
      const apiRoleCandidate = profile?.role ?? profile?.user_role ?? profile?.groups?.[0]
      if (!apiRoleCandidate) return
      const parsed = parseAdminRole(apiRoleCandidate)
      localStorage.setItem(ADMIN_ROLE_STORAGE_KEY, parsed)
      setRole(parsed)
    }
    void syncRoleFromApi()

    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('localStorageChange', onCustomStorage as EventListener)
    }
  }, [])

  return useMemo(() => {
    const access = ADMIN_ROLE_ACCESS_MAP[role]
    return {
      role,
      canCreate: access.actions.create,
      canEdit: access.actions.edit,
      canRemove: access.actions.remove,
      canAccessPath: (path: string) =>
        access.routes.some((route) => path === route || path.startsWith(route + '/')),
    }
  }, [role])
}
