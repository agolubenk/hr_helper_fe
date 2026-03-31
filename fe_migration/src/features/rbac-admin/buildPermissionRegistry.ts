import type { RbacAction, RbacMatrixState, RbacPermissionEntry, RbacRole } from '@/features/rbac-admin/types'
import { RBAC_ACTIONS, RBAC_RESOURCE_IDS } from '@/features/rbac-admin/types'
import { RBAC_ACTION_LABELS, RBAC_RESOURCE_LABELS } from '@/features/rbac-admin/resourceLabels'

function scopeFor(action: RbacAction): RbacPermissionEntry['scope'] {
  if (action === 'manage') return 'all'
  if (action === 'read') return 'own'
  return 'all'
}

export function buildPermissionRegistry(
  roles: RbacRole[],
  matrix: RbacMatrixState
): RbacPermissionEntry[] {
  const out: RbacPermissionEntry[] = []

  for (const resource of RBAC_RESOURCE_IDS) {
    for (const action of RBAC_ACTIONS) {
      const roleDisplayNames: string[] = []
      for (const role of roles) {
        const granted = matrix[role.id]?.[resource]?.[action] ?? false
        if (granted) roleDisplayNames.push(role.displayName)
      }
      const resLabel = RBAC_RESOURCE_LABELS[resource]
      const actLabel = RBAC_ACTION_LABELS[action]
      const isSystem = resource === 'users' || action === 'manage'
      out.push({
        id: `${resource}:${action}`,
        resource,
        action,
        scope: scopeFor(action),
        description: `${actLabel} — ${resLabel}`,
        isSystem,
        roleDisplayNames,
      })
    }
  }
  return out
}

/** Пересчитать счётчики прав у ролей по матрице */
export function applyPermissionCounts(roles: RbacRole[], matrix: RbacMatrixState): RbacRole[] {
  return roles.map((r) => ({
    ...r,
    permissionCount: countGrantedCells(matrix, r.id),
  }))
}

function countGrantedCells(matrix: RbacMatrixState, roleId: string): number {
  const slice = matrix[roleId]
  if (!slice) return 0
  let n = 0
  for (const res of RBAC_RESOURCE_IDS) {
    const row = slice[res]
    if (!row) continue
    for (const act of RBAC_ACTIONS) {
      if (row[act]) n += 1
    }
  }
  return n
}
