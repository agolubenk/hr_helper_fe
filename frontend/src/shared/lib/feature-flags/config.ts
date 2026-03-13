import type { FeatureFlag, FeatureFlagKey } from './types'

export const defaultFlags: Record<FeatureFlagKey, FeatureFlag> = {
  new_dashboard: {
    key: 'new_dashboard',
    enabled: true,
    description: 'Новый дизайн дашборда',
  },
  ai_assistant: {
    key: 'ai_assistant',
    enabled: true,
    description: 'AI ассистент для рекрутинга',
  },
  advanced_analytics: {
    key: 'advanced_analytics',
    enabled: false,
    description: 'Расширенная аналитика и отчёты',
    rolloutPercentage: 50,
  },
  telegram_integration: {
    key: 'telegram_integration',
    enabled: true,
    description: 'Интеграция с Telegram',
  },
  huntflow_sync: {
    key: 'huntflow_sync',
    enabled: true,
    description: 'Синхронизация с Huntflow ATS',
  },
  bulk_actions: {
    key: 'bulk_actions',
    enabled: true,
    description: 'Массовые операции с кандидатами/вакансиями',
  },
  dark_mode: {
    key: 'dark_mode',
    enabled: true,
    description: 'Тёмная тема',
  },
  notifications_v2: {
    key: 'notifications_v2',
    enabled: false,
    description: 'Новая система уведомлений',
    rolloutPercentage: 20,
  },
  calendar_integration: {
    key: 'calendar_integration',
    enabled: true,
    description: 'Интеграция с календарём',
  },
  salary_benchmarks: {
    key: 'salary_benchmarks',
    enabled: true,
    description: 'Зарплатные бенчмарки',
  },
}

const STORAGE_KEY = 'feature_flags_override'

export function getOverrides(): Partial<Record<FeatureFlagKey, boolean>> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export function setOverride(key: FeatureFlagKey, enabled: boolean): void {
  const overrides = getOverrides()
  overrides[key] = enabled
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
}

export function clearOverrides(): void {
  localStorage.removeItem(STORAGE_KEY)
}
