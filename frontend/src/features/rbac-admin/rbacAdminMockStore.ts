import { useCallback, useEffect, useReducer } from 'react'
import { applyPermissionCounts, buildPermissionRegistry } from '@/features/rbac-admin/buildPermissionRegistry'
import { buildInitialMatrix } from '@/features/rbac-admin/buildMatrix'
import { MOCK_GROUP_TREE, MOCK_RBAC_ROLES_BASE, MOCK_RBAC_USERS } from '@/features/rbac-admin/mocks'
import type {
  RbacAction,
  RbacGroupNode,
  RbacMatrixState,
  RbacPermissionEntry,
  RbacResourceId,
  RbacRole,
  RbacSecurityUser,
} from '@/features/rbac-admin/types'
import { RBAC_ACTIONS, RBAC_RESOURCE_IDS } from '@/features/rbac-admin/types'

const STORAGE_KEY = 'hr-helper-rbac-admin-mock'

export interface RbacAdminMockState {
  users: RbacSecurityUser[]
  roles: RbacRole[]
  matrix: RbacMatrixState
  customPermissions: RbacPermissionEntry[]
  groupTree: RbacGroupNode
}

function defaultState(): RbacAdminMockState {
  const matrix = buildInitialMatrix(MOCK_RBAC_ROLES_BASE.map((r) => r.id))
  const roles = applyPermissionCounts(MOCK_RBAC_ROLES_BASE, matrix)
  return {
    users: MOCK_RBAC_USERS.map((u) => ({ ...u })),
    roles,
    matrix,
    customPermissions: [],
    groupTree: JSON.parse(JSON.stringify(MOCK_GROUP_TREE)) as RbacGroupNode,
  }
}

function parseStored(raw: unknown): RbacAdminMockState | null {
  if (typeof raw !== 'object' || raw === null) return null
  const o = raw as Record<string, unknown>
  if (!Array.isArray(o.users) || !Array.isArray(o.roles) || typeof o.matrix !== 'object') return null
  try {
    const base = defaultState()
    return {
      users: o.users as RbacSecurityUser[],
      roles: applyPermissionCounts(o.roles as RbacRole[], o.matrix as RbacMatrixState),
      matrix: o.matrix as RbacMatrixState,
      customPermissions: Array.isArray(o.customPermissions)
        ? (o.customPermissions as RbacPermissionEntry[])
        : [],
      groupTree:
        o.groupTree && typeof o.groupTree === 'object'
          ? (o.groupTree as RbacGroupNode)
          : base.groupTree,
    }
  } catch {
    return null
  }
}

let memory: RbacAdminMockState | null = null
const listeners = new Set<() => void>()

function readState(): RbacAdminMockState {
  if (memory) return memory
  if (typeof window === 'undefined') {
    memory = defaultState()
    return memory
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = parseStored(JSON.parse(raw) as unknown)
      if (parsed) {
        memory = parsed
        return memory
      }
    }
  } catch {
    /* ignore */
  }
  memory = defaultState()
  return memory
}

function writeState(next: RbacAdminMockState): void {
  memory = next
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          users: next.users,
          roles: next.roles,
          matrix: next.matrix,
          customPermissions: next.customPermissions,
          groupTree: next.groupTree,
        })
      )
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l())
}

export function getRbacAdminState(): RbacAdminMockState {
  return readState()
}

export function setRbacAdminState(update: (prev: RbacAdminMockState) => RbacAdminMockState): void {
  writeState(update(readState()))
}

export function subscribeRbacAdmin(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function resetRbacAdminMock(): void {
  memory = null
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }
  memory = defaultState()
  listeners.forEach((l) => l())
}

export function getFullPermissionList(state: RbacAdminMockState): RbacPermissionEntry[] {
  const base = buildPermissionRegistry(state.roles, state.matrix)
  return [...base, ...state.customPermissions]
}

export function seedNewRoleMatrixRow(): Record<RbacResourceId, Record<RbacAction, boolean>> {
  const row = {} as Record<RbacResourceId, Record<RbacAction, boolean>>
  for (const res of RBAC_RESOURCE_IDS) {
    const cells = {} as Record<RbacAction, boolean>
    for (const act of RBAC_ACTIONS) {
      cells[act] = act === 'read'
    }
    row[res] = cells
  }
  return row
}

/** Хук для подписки на изменения мок-хранилища RBAC (между страницами /settings/*). */
export function useRbacAdminMock(): {
  state: RbacAdminMockState
  setState: (update: (prev: RbacAdminMockState) => RbacAdminMockState) => void
} {
  const [, force] = useReducer((n: number) => n + 1, 0)
  useEffect(() => subscribeRbacAdmin(() => force()), [])
  const setState = useCallback((update: (prev: RbacAdminMockState) => RbacAdminMockState) => {
    setRbacAdminState(update)
  }, [])
  return { state: getRbacAdminState(), setState }
}
