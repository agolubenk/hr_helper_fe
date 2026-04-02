import { describe, expect, it } from 'vitest'
import { MOCK_GROUP_TREE } from '@/features/rbac-admin/mocks'
import {
  addGroupChild,
  collectAllGroupNames,
  findGroupNode,
  flattenGroupOptions,
  getTopLevelSectionContaining,
  subtreeContainsId,
  updateGroupNode,
} from '@/features/rbac-admin/groupTreeUtils'

describe('findGroupNode', () => {
  it('finds nested node', () => {
    const n = findGroupNode(MOCK_GROUP_TREE, 'frontend')
    expect(n?.name).toBe('Фронтенд')
  })

  it('returns null for missing id', () => {
    expect(findGroupNode(MOCK_GROUP_TREE, 'nope')).toBeNull()
  })
})

describe('addGroupChild', () => {
  it('appends child under parent', () => {
    const child = {
      id: 'x1',
      name: 'Тест',
      iconKey: 'folder',
      type: 'custom' as const,
      inheritedRoleLabels: [] as string[],
      memberCount: 0,
      children: [] as typeof MOCK_GROUP_TREE.children,
    }
    const next = addGroupChild(MOCK_GROUP_TREE, 'hr', child)
    const hr = findGroupNode(next, 'hr')
    expect(hr?.children.some((c) => c.id === 'x1')).toBe(true)
  })
})

describe('flattenGroupOptions', () => {
  it('includes root and nested labels', () => {
    const flat = flattenGroupOptions(MOCK_GROUP_TREE)
    expect(flat.some((o) => o.id === 'root')).toBe(true)
    expect(flat.some((o) => o.id === 'frontend')).toBe(true)
  })
})

describe('updateGroupNode', () => {
  it('updates name and type on nested node', () => {
    const next = updateGroupNode(MOCK_GROUP_TREE, 'frontend', {
      name: 'Фронтенд 2',
      type: 'functional',
    })
    expect(findGroupNode(next, 'frontend')?.name).toBe('Фронтенд 2')
    expect(findGroupNode(next, 'frontend')?.type).toBe('functional')
  })
})

describe('subtreeContainsId', () => {
  it('returns true for self and descendants', () => {
    const dev = findGroupNode(MOCK_GROUP_TREE, 'dev')
    expect(dev).not.toBeNull()
    expect(subtreeContainsId(dev!, 'dev')).toBe(true)
    expect(subtreeContainsId(dev!, 'frontend')).toBe(true)
    expect(subtreeContainsId(dev!, 'finance')).toBe(false)
  })
})

describe('getTopLevelSectionContaining', () => {
  it('returns null for root id', () => {
    expect(getTopLevelSectionContaining(MOCK_GROUP_TREE, 'root')).toBeNull()
  })

  it('returns section for nested node', () => {
    const s = getTopLevelSectionContaining(MOCK_GROUP_TREE, 'frontend')
    expect(s?.id).toBe('dev')
    expect(s?.name).toBe('Разработка')
  })

  it('returns section for direct child of root', () => {
    const s = getTopLevelSectionContaining(MOCK_GROUP_TREE, 'marketing')
    expect(s?.id).toBe('marketing')
  })
})

describe('collectAllGroupNames', () => {
  it('collects all group names in tree', () => {
    const names = collectAllGroupNames(MOCK_GROUP_TREE)
    expect(names).toContain('Компания')
    expect(names).toContain('Фронтенд')
  })
})
