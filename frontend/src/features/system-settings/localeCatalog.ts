export type AppLocale = 'ru' | 'en' | 'be'

export const ALL_APP_LOCALES: AppLocale[] = ['ru', 'en', 'be']

export interface LocaleCardDef {
  id: AppLocale
  /** Короткая метка на карточке */
  shortLabel: string
  /** Полное название */
  label: string
}

export const LOCALE_CARD_DEFS: LocaleCardDef[] = [
  { id: 'ru', shortLabel: 'RU', label: 'Русский' },
  { id: 'en', shortLabel: 'EN', label: 'English' },
  { id: 'be', shortLabel: 'BY', label: 'Беларуская' },
]
