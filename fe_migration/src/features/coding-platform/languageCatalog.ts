import type { CodingLanguageDefinition } from './types'

/** Полный каталог: вариативность стеков, как в симуляторах вроде Meet2Code. */
export const CODING_LANGUAGE_CATALOG: CodingLanguageDefinition[] = [
  {
    id: 'html',
    title: 'HTML',
    description:
      'Разметка документа, семантика, доступность. В паре с CSS и JS даёт полный предпросмотр в браузере.',
    previewKind: 'web',
    category: 'markup',
    runner: 'iframe-web',
    relatedIds: ['css', 'js'],
    order: 10,
  },
  {
    id: 'css',
    title: 'CSS',
    description: 'Каскад, адаптив, переменные, flex/grid. Живой превью в веб-песочнице.',
    previewKind: 'styles',
    category: 'styles',
    runner: 'iframe-web',
    relatedIds: ['html', 'js'],
    order: 20,
  },
  {
    id: 'js',
    title: 'JavaScript',
    description: 'Логика в браузере и основа для Node. Универсальная точка для фронта и скриптов.',
    previewKind: 'web',
    category: 'language',
    runner: 'iframe-web',
    relatedIds: ['html', 'css', 'ts', 'node', 'react'],
    order: 30,
  },
  {
    id: 'ts',
    title: 'TypeScript',
    description:
      'Статическая типизация поверх JS. В песочнице — редактор и сценарий компиляции; запуск через сборку или API.',
    previewKind: 'compile',
    category: 'language',
    runner: 'typescript-note',
    relatedIds: ['js', 'react'],
    order: 40,
  },
  {
    id: 'react',
    title: 'React',
    description:
      'Компонентный UI. Полный JSX — CDN/importmap или бандлер; базовые демо — HTML+JS в iframe.',
    previewKind: 'web',
    category: 'framework',
    runner: 'iframe-web',
    relatedIds: ['js', 'ts', 'html', 'css'],
    order: 50,
  },
  {
    id: 'node',
    title: 'Node.js',
    description: 'Серверный рантайм JavaScript, npm, сборка. Исполнение — на бэкенде (мок в UI).',
    previewKind: 'runtime',
    category: 'runtime',
    runner: 'server-mock',
    relatedIds: ['js', 'ts'],
    order: 60,
  },
  {
    id: 'python',
    title: 'Python',
    description:
      'Скрипты и алгоритмы, типичный live coding на собесах. Запуск — изолированный воркер/сервер.',
    previewKind: 'runtime',
    category: 'language',
    runner: 'server-mock',
    relatedIds: ['node', 'sql'],
    order: 70,
  },
  {
    id: 'go',
    title: 'Go',
    description: 'Системный и серверный стек. Исполнение вне браузера.',
    previewKind: 'runtime',
    category: 'systems',
    runner: 'server-mock',
    relatedIds: ['node', 'rust'],
    order: 80,
  },
  {
    id: 'rust',
    title: 'Rust',
    description: 'Память без GC, безопасность и скорость. Задачи на низкий уровень.',
    previewKind: 'compile',
    category: 'systems',
    runner: 'server-mock',
    relatedIds: ['go', 'js'],
    order: 90,
  },
  {
    id: 'sql',
    title: 'SQL',
    description: 'Запросы к БД. Проверка — бэкенд или WASM-SQLite (позже).',
    previewKind: 'runtime',
    category: 'data',
    runner: 'static-only',
    relatedIds: ['node', 'python'],
    order: 100,
  },
  {
    id: 'json',
    title: 'JSON / YAML',
    description: 'Конфиги и обмен данными. Валидация и подсветка без исполнения.',
    previewKind: 'compile',
    category: 'data',
    runner: 'static-only',
    relatedIds: ['js', 'node'],
    order: 110,
  },
]

export function getLanguageById(id: string): CodingLanguageDefinition | undefined {
  return CODING_LANGUAGE_CATALOG.find((l) => l.id === id)
}

export function sortCatalog(list: CodingLanguageDefinition[]): CodingLanguageDefinition[] {
  return [...list].sort((a, b) => a.order - b.order)
}
