/** Узел на карте языков и стеков. */
export interface CodingLanguageNode {
  id: string
  label: string
  subtitle: string
  /** Координаты центра узла в системе SVG (viewBox). */
  x: number
  y: number
}

/** Связь между технологиями (направленная). */
export interface CodingLanguageEdge {
  id: string
  fromId: string
  toId: string
  label: string
}

/** Карточка на обзорной странице. */
export interface CodingStackOverviewItem {
  id: string
  title: string
  description: string
  /** Подсветка в предпросмотре / песочнице */
  previewKind: 'web' | 'styles' | 'compile' | 'runtime'
}

export type CodingLanguageCategory =
  | 'markup'
  | 'styles'
  | 'language'
  | 'framework'
  | 'runtime'
  | 'systems'
  | 'data'

export type CodingRunnerKind =
  | 'iframe-web'
  | 'typescript-note'
  | 'static-only'
  | 'server-mock'

/** Запись каталога языков / стеков (подключение, песочница, связи). */
export interface CodingLanguageDefinition extends CodingStackOverviewItem {
  category: CodingLanguageCategory
  runner: CodingRunnerKind
  relatedIds: string[]
  order: number
}
