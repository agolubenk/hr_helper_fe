export interface SpecializationNode {
  id: string
  name: string
  parentId: string | null
  children: SpecializationNode[]
  vacancyCount?: number
  employeeCount?: number
  gradeLevels?: number
  isCustom?: boolean
  departmentId?: string
  projectIds?: string[]
  description?: string
  techStack?: { name: string; priority: 'required' | 'nice' | 'bonus' }[]
}

export interface GradeLevel {
  id: string
  name: string
  order: number
  minSalary?: number
  maxSalary?: number
  criteria?: string
}

export type GradingType = 'grades' | 'streams' | 'hybrid'
export interface GradingConfig {
  inheritFromParent: boolean
  type: GradingType
  levels: GradeLevel[]
}

export interface CareerTransition {
  id: string
  fromGradeLevelId: string
  toGradeLevelId: string
  requirements: string[]
  recommendations: string[]
  typicalDurationMonths?: number
}

export interface SpecializationHistoryEntry {
  id: string
  date: string
  user: string
  change: string
}

export function findNodeById(nodes: SpecializationNode[], id: string): SpecializationNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n
    const found = findNodeById(n.children, id)
    if (found) return found
  }
}

export function updateNodeInTree(
  nodes: SpecializationNode[],
  id: string,
  updater: (node: SpecializationNode) => SpecializationNode
): SpecializationNode[] {
  return nodes.map((n) => (n.id === id ? updater(n) : { ...n, children: updateNodeInTree(n.children, id, updater) }))
}

export function flattenTree(nodes: SpecializationNode[], acc: Array<{ id: string; name: string; depth: number }> = [], depth = 0) {
  nodes.forEach((n) => {
    acc.push({ id: n.id, name: n.name, depth })
    if (n.children.length) flattenTree(n.children, acc, depth + 1)
  })
  return acc
}

export function getFirstNodeId(nodes: SpecializationNode[]): string | null {
  return nodes[0]?.id ?? null
}

export function cloneTree(nodes: SpecializationNode[]): SpecializationNode[] {
  return nodes.map((n) => ({ ...n, children: cloneTree(n.children) }))
}

export function filterTreeByQuery(nodes: SpecializationNode[], query: string): SpecializationNode[] {
  const q = query.trim().toLowerCase()
  if (!q) return nodes
  return nodes
    .map((n) => ({ ...n, children: filterTreeByQuery(n.children, q) }))
    .filter((n) => n.children.length > 0 || n.name.toLowerCase().includes(q))
}
