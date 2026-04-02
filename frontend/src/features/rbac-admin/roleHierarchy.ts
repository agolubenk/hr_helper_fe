import type { RbacRole } from '@/features/rbac-admin/types'

export interface RoleTreeNode {
  role: RbacRole
  children: RoleTreeNode[]
}

export function buildRoleTree(roles: RbacRole[]): RoleTreeNode[] {
  const byParent = new Map<string | null, RbacRole[]>()
  for (const r of roles) {
    const p = r.parentRoleId
    const list = byParent.get(p) ?? []
    list.push(r)
    byParent.set(p, list)
  }
  for (const list of byParent.values()) {
    list.sort(
      (a, b) =>
        b.priority - a.priority || a.displayName.localeCompare(b.displayName, 'ru')
    )
  }
  function walk(parentId: string | null): RoleTreeNode[] {
    const list = byParent.get(parentId) ?? []
    return list.map((role) => ({
      role,
      children: walk(role.id),
    }))
  }
  return walk(null)
}

function roleMatchesQuery(role: RbacRole, q: string): boolean {
  const lower = q.trim().toLowerCase()
  if (!lower) return true
  return (
    role.displayName.toLowerCase().includes(lower) ||
    role.slug.toLowerCase().includes(lower) ||
    role.description.toLowerCase().includes(lower)
  )
}

/**
 * Фильтрация дерева по поиску: узел остаётся, если совпадает сам или есть совпадающие потомки.
 * Если совпадает родитель — показываем полных детей (как в типичных деревьях с поиском).
 */
export function filterRoleTree(nodes: RoleTreeNode[], query: string): RoleTreeNode[] {
  const q = query.trim().toLowerCase()
  if (!q) return nodes

  function walk(node: RoleTreeNode): RoleTreeNode | null {
    const selfHit = roleMatchesQuery(node.role, q)
    if (selfHit) {
      return { role: node.role, children: node.children }
    }
    const kids = node.children.map(walk).filter((x): x is RoleTreeNode => x !== null)
    if (kids.length > 0) {
      return { role: node.role, children: kids }
    }
    return null
  }

  return nodes.map(walk).filter((x): x is RoleTreeNode => x !== null)
}
