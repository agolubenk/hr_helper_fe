import type { LinkBuilderExpiryMode } from './linkBuilderTypes'

/** Как сопоставлять входной URL с правилом. */
export type LinkBuilderAutomationMatchKind = 'host' | 'host-path-prefix' | 'regex'

/** Статус новой ссылки по умолчанию (в форме — переключатель активна/черновик). */
export type LinkBuilderDefaultNewStatus = 'active' | 'draft'

/** Общие настройки Link-билдера (localStorage). */
export interface LinkBuilderGeneralSettings {
  /** Новые ссылки по умолчанию. */
  defaultStatus: LinkBuilderDefaultNewStatus
  /** Открывать блок «Расширенные настройки» по умолчанию. */
  openAdvancedByDefault: boolean
  /** Сегмент пути короткой ссылки: `https://домен/{segment}/код`. Только буквы, цифры, дефис. */
  shortLinkPathSegment: string
  /** Автоматически применять первое подходящее правило при валидном URL. */
  autoApplyAutomations: boolean
  /** Показывать краткое сообщение после авто-применения правила. */
  notifyAutomationApplied: boolean
}

/** Действия правила автоматизации (частичное заполнение формы). */
export interface LinkBuilderAutomationApply {
  openAdvanced?: boolean
  /** Переопределить статус при срабатывании правила. */
  status?: LinkBuilderDefaultNewStatus
  /** Подставить alias из последнего сегмента пути (slugify). */
  suggestAliasFromPath?: boolean
  ogTitleTemplate?: string
  ogDescriptionTemplate?: string
  ogImageUrl?: string
  expiryMode?: LinkBuilderExpiryMode
  /** Если expiryMode === 'date': срок через N дней от сейчас. */
  expiryDaysFromNow?: number
  /** Если expiryMode === 'clicks'. */
  maxClicks?: number
}

export interface LinkBuilderAutomationRule {
  id: string
  enabled: boolean
  name: string
  /** Меньше — выше приоритет при нескольких совпадениях. */
  priority: number
  matchKind: LinkBuilderAutomationMatchKind
  /** host: `example.com`; prefix: `example.com/docs`; regex: полный URL. */
  pattern: string
  apply: LinkBuilderAutomationApply
}
