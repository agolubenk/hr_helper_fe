/** Статус отправки формы сокращения. */
export type LinkBuilderFormSubmitStatus = 'idle' | 'loading' | 'success' | 'error'

/** Жизненный цикл ссылки в истории (пока только UI / localStorage). */
export type LinkBuilderLinkStatus = 'active' | 'draft' | 'disabled'

/** Режим ограничения срока действия в форме. */
export type LinkBuilderExpiryMode = 'none' | 'date' | 'clicks'

export interface ShortenedLinkRecord {
  id: string
  shortUrl: string
  longUrl: string
  createdAt: string
  expiresAt: string | null
  maxClicks: number | null
  clicks: number
  status: LinkBuilderLinkStatus
  ogTitle: string | null
  ogDescription: string | null
  ogImageUrl: string | null
  alias: string | null
}
