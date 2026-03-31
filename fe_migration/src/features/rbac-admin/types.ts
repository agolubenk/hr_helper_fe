/** Действия в матрице прав (как в реестре и RBAC-прототипе). */
export type RbacAction = 'read' | 'create' | 'update' | 'delete' | 'export' | 'manage'

export type RbacUserStatus = 'active' | 'blocked' | 'pending' | 'inactive'

export type RbacPermissionScope = 'own' | 'group' | 'all'

export type RbacGroupType = 'organizational' | 'functional' | 'custom'

export interface RbacRole {
  id: string
  slug: string
  displayName: string
  description: string
  isSystem: boolean
  isDefault: boolean
  priority: number
  color: string
  userCount: number
  permissionCount: number
  parentRoleId: string | null
}

export interface RbacSecurityUser {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  status: RbacUserStatus
  roleLabels: string[]
  groupLabels: string[]
  mfaEnabled: boolean
  lastLoginLabel: string
  avatarColor: string
}

export interface RbacGroupNode {
  id: string
  name: string
  iconKey: string
  type: RbacGroupType
  inheritedRoleLabels: string[]
  memberCount: number
  children: RbacGroupNode[]
}

/** resourceId -> action -> granted */
export type RbacMatrixState = Record<string, Record<string, Record<RbacAction, boolean>>>

export interface RbacPermissionEntry {
  id: string
  resource: string
  action: RbacAction
  scope: RbacPermissionScope
  description: string
  isSystem: boolean
  /** Роли, у которых включено это право (по отображаемым именам) */
  roleDisplayNames: string[]
}

export const RBAC_RESOURCE_IDS = [
  'users',
  'recruiting',
  'employees',
  'reports',
  'company-settings',
  'content',
  'analytics',
  'billing',
] as const

export type RbacResourceId = (typeof RBAC_RESOURCE_IDS)[number]

export const RBAC_ACTIONS: readonly RbacAction[] = [
  'read',
  'create',
  'update',
  'delete',
  'export',
  'manage',
] as const
