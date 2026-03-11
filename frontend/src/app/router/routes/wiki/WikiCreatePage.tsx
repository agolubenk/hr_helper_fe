/**
 * Страница создания новой статьи вики.
 * Перенаправляет логику в WikiEditPage в режиме создания.
 */
import { WikiEditPage } from './WikiEditPage'

export function WikiCreatePage() {
  return <WikiEditPage />
}
