import { describe, expect, it } from 'vitest'
import { MOCK_RBAC_ROLES_BASE } from '@/features/rbac-admin/mocks'
import { buildRoleTree, filterRoleTree } from '@/features/rbac-admin/roleHierarchy'

describe('buildRoleTree', () => {
  it('nests children under parentRoleId', () => {
    const tree = buildRoleTree(MOCK_RBAC_ROLES_BASE)
    const viewer = tree.find((n) => n.role.id === 'viewer')
    expect(viewer).toBeDefined()
    const childIds = viewer!.children.map((c) => c.role.id).sort()
    expect(childIds).toContain('editor')
    expect(childIds).toContain('moderator')
    const editor = viewer!.children.find((c) => c.role.id === 'editor')
    expect(editor?.children.some((c) => c.role.id === 'senior_editor')).toBe(true)
  })
})

describe('filterRoleTree', () => {
  it('keeps branch when child matches', () => {
    const tree = buildRoleTree(MOCK_RBAC_ROLES_BASE)
    const f = filterRoleTree(tree, 'старш')
    expect(f.some((n) => n.role.id === 'viewer' || n.children.length > 0)).toBe(true)
    const flat = JSON.stringify(f)
    expect(flat).toContain('Старший')
  })
})
