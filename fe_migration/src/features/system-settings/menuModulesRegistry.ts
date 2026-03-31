import type { MenuItemConfig } from '@/config/menuConfig'
import { MAIN_MENU_ITEMS, MENU_SECTIONS } from '@/config/menuConfig'

/** Корневые пункты основного меню, которые все́гда включены (как в ТЗ). */
export const MENU_MODULE_LOCKED_ROOT_IDS = new Set(['tasks', 'analytics', 'integrations'])

/** Тексты для уведомлений при отключении блока (связанные области продукта). */
export const MENU_MODULE_RELATED_WHEN_DISABLED: Record<string, string[]> = {
  recruiting: [
    'Отчёты «По подбору» и смежные дашборды в разделе аналитики могут стать недоступны или пустыми.',
    'Виджеты «План найма» на главной и в отчётности опираются на данные рекрутинга.',
  ],
  onboarding: [
    'HROps содержит ссылки на онбординг — проверьте доступность сценариев документооборота.',
  ],
  'hr-services': [
    'Тикеты и отпуска часто связаны с профилем сотрудника из раздела Employee relations.',
  ],
  'employee-relations': [
    'Специализации и оргструктура используются в рекрутинге, проектах и отчётах по людям.',
  ],
  learning: ['Отчёты L&D в аналитике и блоки на главной могут ссылаться на обучение.'],
  performance: [
    'Шкалы оценок ведут в настройки компании; цели и review затрагивают календарь и уведомления.',
  ],
  finance: ['Зарплатные вилки доступны из вакансий; отключение C&B скрывает финансовые отчёты в навигации.'],
  'hr-pr': ['Вики и внутренний сайт показываются в одном блоке — отключение скрывает весь кластер коммуникаций.'],
  projects: ['Аллокация и HR-проекты могут ссылаться на оргструктуру и рекрутинг.'],
  calendar: ['Собеседования из рекрутинга и встречи создают события в календаре.'],
  'workflow-chat': ['Поток задач и чат часто связаны с модулями, которые вы отключаете ниже.'],
}

export interface MenuModuleNode {
  id: string
  label: string
  locked: boolean
  /** Кратко, зачем блок (для инфо на странице) */
  info?: string
  children?: MenuModuleNode[]
}

function buildNode(item: MenuItemConfig, parentLocked: boolean): MenuModuleNode {
  const rootLocked = MENU_MODULE_LOCKED_ROOT_IDS.has(item.id)
  const locked = parentLocked || rootLocked
  const children = item.children?.map((ch) => buildNode(ch, locked))
  return {
    id: item.id,
    label: item.label,
    locked,
    info: undefined,
    children: children?.length ? children : undefined,
  }
}

const TREE: MenuModuleNode[] = MAIN_MENU_ITEMS.filter((i) => i.id !== 'home').map((i) => buildNode(i, false))

/** Дерево без «Главной» — как в сайдбаре под фиксированной главной. */
export function getMenuModulesTree(): MenuModuleNode[] {
  return TREE
}

/** Секции как в сайдбаре: «Основное меню» / «Модули». */
export function getMenuModulesSections(): { sectionLabel: string; roots: MenuModuleNode[] }[] {
  const byId = new Map(TREE.map((n) => [n.id, n]))
  return MENU_SECTIONS.map((sec) => ({
    sectionLabel: sec.label,
    roots: sec.itemIds.map((id) => byId.get(id)).filter(Boolean) as MenuModuleNode[],
  }))
}

/** Все id, для которых храним флаг включения (только разблокированные листья). */
export function collectToggleableLeafIds(nodes: MenuModuleNode[]): string[] {
  const out: string[] = []
  const walk = (n: MenuModuleNode) => {
    if (n.locked) return
    if (!n.children?.length) {
      out.push(n.id)
      return
    }
    for (const c of n.children) walk(c)
  }
  for (const n of nodes) walk(n)
  return out
}

export function getAllToggleableLeafIds(): string[] {
  return collectToggleableLeafIds(TREE)
}

/** Листья в навигации под корневым пунктом (например `recruiting`). */
export function getLeafIdsUnderMenuRoot(rootId: string): string[] {
  const root = TREE.find((n) => n.id === rootId)
  if (!root || root.locked) return []
  if (!root.children?.length) return [root.id]
  return collectToggleableLeafIds(root.children)
}

/** Все переключаемые листья в поддереве узла (для группового чекбокса). */
export function collectLeavesUnderNode(node: MenuModuleNode): string[] {
  if (node.locked) return []
  if (!node.children?.length) return [node.id]
  return collectToggleableLeafIds(node.children)
}
