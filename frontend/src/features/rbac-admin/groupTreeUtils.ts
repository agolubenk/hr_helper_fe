import type { RbacGroupNode } from '@/features/rbac-admin/types'

export function findGroupNode(root: RbacGroupNode, id: string): RbacGroupNode | null {
  if (root.id === id) return root
  for (const c of root.children) {
    const found = findGroupNode(c, id)
    if (found) return found
  }
  return null
}

export function addGroupChild(
  root: RbacGroupNode,
  parentId: string,
  child: RbacGroupNode
): RbacGroupNode {
  if (root.id === parentId) {
    return { ...root, children: [...root.children, child] }
  }
  return {
    ...root,
    children: root.children.map((c) => addGroupChild(c, parentId, child)),
  }
}

export function updateGroupNode(
  root: RbacGroupNode,
  id: string,
  patch: Partial<Pick<RbacGroupNode, 'name' | 'type'>>
): RbacGroupNode {
  if (root.id === id) {
    return { ...root, ...patch }
  }
  return {
    ...root,
    children: root.children.map((c) => updateGroupNode(c, id, patch)),
  }
}

/** Все названия групп в дереве (для привязки пользователей). */
export function collectAllGroupNames(node: RbacGroupNode): string[] {
  return [node.name, ...node.children.flatMap((c) => collectAllGroupNames(c))]
}

/** Есть ли targetId в поддереве node (включая сам node). */
export function subtreeContainsId(node: RbacGroupNode, targetId: string): boolean {
  if (node.id === targetId) return true
  for (const c of node.children) {
    if (subtreeContainsId(c, targetId)) return true
  }
  return false
}

/**
 * Прямой потомок корня, в чьём поддереве лежит targetId.
 * Для самого корня и если узел не найден — null.
 */
export function getTopLevelSectionContaining(
  root: RbacGroupNode,
  targetId: string
): RbacGroupNode | null {
  if (root.id === targetId) return null
  for (const section of root.children) {
    if (subtreeContainsId(section, targetId)) return section
  }
  return null
}

export function flattenGroupOptions(
  root: RbacGroupNode,
  depth = 0
): { id: string; label: string }[] {
  const pad = '\u00a0'.repeat(depth * 2)
  const out: { id: string; label: string }[] = [{ id: root.id, label: `${pad}${root.name}` }]
  for (const c of root.children) {
    out.push(...flattenGroupOptions(c, depth + 1))
  }
  return out
}
