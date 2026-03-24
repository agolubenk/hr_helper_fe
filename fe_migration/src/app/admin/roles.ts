export type AdminRole = 'admin' | 'superadmin' | 'csadmin' | 'superuser' | 'user'

export const ADMIN_ROLE_STORAGE_KEY = 'adminRole'

export const DEFAULT_ADMIN_ROLE: AdminRole = 'admin'

export const ADMIN_ROLES: readonly AdminRole[] = [
  'admin',
  'superadmin',
  'csadmin',
  'superuser',
  'user',
] as const

export interface AdminAccessRule {
  routes: string[]
  actions: {
    create: boolean
    edit: boolean
    remove: boolean
  }
}

export type AdminRoleAccessMap = Record<AdminRole, AdminAccessRule>

export const ADMIN_ROLE_ACCESS_MAP: AdminRoleAccessMap = {
  admin: {
    routes: ['/admin', '/admin/users', '/admin/groups'],
    actions: { create: true, edit: true, remove: true },
  },
  superadmin: {
    routes: ['/admin', '/admin/users', '/admin/groups'],
    actions: { create: true, edit: true, remove: true },
  },
  superuser: {
    routes: ['/admin', '/admin/users', '/admin/groups'],
    actions: { create: true, edit: true, remove: true },
  },
  csadmin: {
    routes: ['/admin', '/admin/users'],
    actions: { create: false, edit: true, remove: false },
  },
  // По договоренности в проекте: роль user не ограничиваем этой моделью.
  user: {
    routes: ['/admin', '/admin/users', '/admin/groups'],
    actions: { create: true, edit: true, remove: true },
  },
}

export function parseAdminRole(value: string | null | undefined): AdminRole {
  if (value && (ADMIN_ROLES as readonly string[]).includes(value)) {
    return value as AdminRole
  }
  return DEFAULT_ADMIN_ROLE
}

export function canAccessAdminPath(role: AdminRole, path: string): boolean {
  const allowedRoutes = ADMIN_ROLE_ACCESS_MAP[role].routes
  return allowedRoutes.some((route) => path === route || path.startsWith(route + '/'))
}
