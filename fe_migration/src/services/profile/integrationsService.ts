import {
  getHuntflowUserSettings,
  type HuntflowUserSettings,
} from '@/lib/huntflowUserSettings'

export interface IntegrationStatusItem {
  key: string
  connected: boolean
  label: string
}

/**
 * Фаза 13: сервис обертка для источников интеграций.
 * До API возвращает локальные данные и вычисляемые статусы.
 */
export async function fetchHuntflowSettings(): Promise<HuntflowUserSettings | null> {
  return getHuntflowUserSettings()
}

export async function fetchIntegrationStatuses(): Promise<IntegrationStatusItem[]> {
  return [
    { key: 'gemini', connected: true, label: 'Gemini AI' },
    { key: 'huntflow', connected: true, label: 'Huntflow' },
    { key: 'clickup', connected: true, label: 'ClickUp' },
    { key: 'notion', connected: true, label: 'Notion' },
    { key: 'telegram', connected: true, label: 'Telegram' },
    { key: 'google', connected: true, label: 'Google' },
    { key: 'hh', connected: true, label: 'hh.ru / rabota.by' },
    { key: 'openai', connected: true, label: 'OpenAI' },
    { key: 'cloud-ai', connected: true, label: 'Cloud AI' },
    { key: 'n8n', connected: true, label: 'n8n' },
  ]
}
