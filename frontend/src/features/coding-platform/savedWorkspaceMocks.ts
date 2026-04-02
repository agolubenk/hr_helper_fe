export type SavedWorkspaceKind = 'snippet' | 'project'

export interface SavedWorkspaceItem {
  id: string
  title: string
  kind: SavedWorkspaceKind
  /** Подсказка для песочницы (id из каталога) */
  langHint: string
  updatedAt: string
  description: string
}

/** Мок сохранённых файлов и мини-приложений (до подключения API). */
export const SAVED_WORKSPACE_MOCKS: SavedWorkspaceItem[] = [
  {
    id: 'w1',
    title: 'Запрос: открытые задачи',
    kind: 'snippet',
    langHint: 'sql',
    updatedAt: '2026-03-28',
    description: 'Черновик SELECT для демо на собесе.',
  },
  {
    id: 'w2',
    title: 'Конфиг пайплайна',
    kind: 'project',
    langHint: 'json',
    updatedAt: '2026-03-27',
    description: 'YAML/JSON фрагмент для CI (мок).',
  },
  {
    id: 'w3',
    title: 'Vue-компонент (заготовка)',
    kind: 'snippet',
    langHint: 'vue',
    updatedAt: '2026-03-25',
    description: 'Скрипт + шаблон, открыть в песочнице как текст.',
  },
  {
    id: 'w4',
    title: 'Bash: деплой-стаб',
    kind: 'snippet',
    langHint: 'bash',
    updatedAt: '2026-03-22',
    description: 'Набор echo/curl для стрима.',
  },
]
