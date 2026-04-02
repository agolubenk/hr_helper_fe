import type { RbacAction, RbacMatrixState, RbacResourceId } from '@/features/rbac-admin/types'
import { RBAC_ACTIONS, RBAC_RESOURCE_IDS } from '@/features/rbac-admin/types'

function defaultCell(roleId: string, resource: RbacResourceId, action: RbacAction): boolean {
  if (roleId === 'admin') return true
  if (roleId === 'viewer') return action === 'read'
  if (roleId === 'analyst') return action === 'read' || action === 'export'
  if (roleId === 'editor' || roleId === 'senior_editor') {
    if (resource === 'company-settings') return false
    return action === 'read' || action === 'create' || action === 'update'
  }
  if (roleId === 'moderator') {
    if (resource !== 'content') return action === 'read'
    return action === 'read' || action === 'update' || action === 'manage'
  }
  return action === 'read'
}

export function buildInitialMatrix(roleIds: string[]): RbacMatrixState {
  const state: RbacMatrixState = {}
  for (const roleId of roleIds) {
    state[roleId] = {}
    for (const res of RBAC_RESOURCE_IDS) {
      const cells = {} as Record<RbacAction, boolean>
      for (const act of RBAC_ACTIONS) {
        cells[act] = defaultCell(roleId, res, act)
      }
      state[roleId][res] = cells
    }
  }
  return state
}

export function patchMatrixCell(
  matrix: RbacMatrixState,
  roleId: string,
  resource: string,
  action: RbacAction,
  value: boolean
): RbacMatrixState {
  const roleSlice = matrix[roleId]
  if (!roleSlice) return matrix
  const resSlice = roleSlice[resource]
  if (!resSlice) return matrix
  return {
    ...matrix,
    [roleId]: {
      ...roleSlice,
      [resource]: {
        ...resSlice,
        [action]: value,
      },
    },
  }
}

export function countTruePermissionsForRole(matrix: RbacMatrixState, roleId: string): number {
  const slice = matrix[roleId]
  if (!slice) return 0
  let n = 0
  for (const res of Object.keys(slice)) {
    const row = slice[res]
    if (!row) continue
    for (const act of RBAC_ACTIONS) {
      if (row[act]) n += 1
    }
  }
  return n
}
