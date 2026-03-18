/**
 * Типы и структуры данных конфигуратора специализаций.
 * Единый источник правды для дерева, грейдов, матрицы навыков и карьерных переходов.
 */

/** Узел дерева специализаций */
export interface SpecializationNode {
  id: string
  name: string
  parentId: string | null
  children: SpecializationNode[]
  vacancyCount?: number
  employeeCount?: number
  gradeLevels?: number
  isCustom?: boolean
  /** Расширенные данные (основная информация) */
  departmentId?: string
  projectIds?: string[]
  description?: string
  techStack?: { name: string; priority: 'required' | 'nice' | 'bonus' }[]
}

/** Уровень грейда в системе грейдирования */
export interface GradeLevel {
  id: string
  name: string
  order: number
  minSalary?: number
  maxSalary?: number
  criteria?: string
}

/** Тип системы грейдирования */
export type GradingType = 'grades' | 'streams' | 'hybrid'

/** Настройки грейдирования специализации */
export interface GradingConfig {
  inheritFromParent: boolean
  type: GradingType
  levels: GradeLevel[]
  /** Для стримов: название стрима → уровни */
  streams?: { name: string; levelIds: string[] }[]
}

/** Одна компетенция в матрице навыков */
export interface CompetencyItem {
  id: string
  name: string
  level: number
  weightPercent: number
  description?: string
  /** Проходной уровень (для шаблона матрицы) */
  passingLevel?: number
  /** Пример ответа */
  sampleAnswer?: string
  /** Ссылка на задачу */
  taskLink?: string
  /** Темы (метки) */
  topics?: string[]
  /** Ссылки на темы */
  topicLinks?: string[]
  /** Ссылка на ответы (кандидатам / шаблоны ответов) */
  answerLink?: string
  /** Только для поведенческих: шаблоны формулировок отказов */
  rejectionTemplates?: string[]
  /** Только для поведенческих: причины отказов */
  rejectionReasons?: string[]
}

/** Категория навыков (технические, поведенческие; проектные убраны) */
export type SkillCategory = 'technical' | 'behavioral' | 'project'

/** Матрица навыков по уровням грейда */
export interface SkillMatrixLevel {
  gradeLevelId: string
  competencies: CompetencyItem[]
}

/** Карьерный переход */
export interface CareerTransition {
  id: string
  fromGradeLevelId: string
  toGradeLevelId: string
  toSpecializationId?: string
  requirements: string[]
  recommendations: string[]
  typicalDurationMonths?: number
}

/** Запись истории изменений */
export interface SpecializationHistoryEntry {
  id: string
  date: string
  user: string
  change: string
}

/** Плоский узел для выбора родителя */
export interface FlatNode {
  id: string
  name: string
  depth: number
}

/** Поиск узла в дереве по id */
export function findNodeById(nodes: SpecializationNode[], id: string): SpecializationNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n
    const found = findNodeById(n.children, id)
    if (found) return found
  }
  return undefined
}

/** Рекурсивное обновление узла в дереве (по id) */
export function updateNodeInTree(
  nodes: SpecializationNode[],
  id: string,
  updater: (node: SpecializationNode) => SpecializationNode
): SpecializationNode[] {
  return nodes.map((n) => {
    if (n.id === id) return updater(n)
    return { ...n, children: updateNodeInTree(n.children, id, updater) }
  })
}

/** Плоский список узлов для селектов (с отступами по глубине) */
export function flattenTree(
  nodes: SpecializationNode[],
  acc: FlatNode[] = [],
  depth = 0
): FlatNode[] {
  nodes.forEach((n) => {
    acc.push({ id: n.id, name: n.name, depth })
    if (n.children.length) flattenTree(n.children, acc, depth + 1)
  })
  return acc
}

/** Первый id в дереве (для редиректа) */
export function getFirstNodeId(nodes: SpecializationNode[]): string | null {
  if (nodes.length === 0) return null
  return nodes[0].id
}

/** Клонирование дерева для фильтрации (поиск) */
export function cloneTree(nodes: SpecializationNode[]): SpecializationNode[] {
  return nodes.map((n) => ({ ...n, children: cloneTree(n.children) }))
}

/** Фильтр дерева по поисковому запросу */
export function filterTreeByQuery(nodes: SpecializationNode[], query: string): SpecializationNode[] {
  const q = query.trim().toLowerCase()
  if (!q) return nodes
  return nodes
    .map((n) => ({ ...n, children: filterTreeByQuery(n.children, q) }))
    .filter((n) => n.children.length > 0 || n.name.toLowerCase().includes(q))
}
