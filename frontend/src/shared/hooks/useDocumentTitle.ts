import { useEffect } from 'react'

/**
 * Устанавливает document.title (Фаза 1.2 детального плана миграции).
 * Для маршрутов внутри AppLayout заголовок задаётся через pageTitle.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title
  }, [title])
}
