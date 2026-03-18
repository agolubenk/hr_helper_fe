/**
 * WikiEditPage — редактирование статьи вики (id из URL; id === 'new' — создание).
 * Без AppLayout (обёртка в App.tsx).
 */

import { Box } from '@radix-ui/themes'
import { useParams } from '@/router-adapter'
import WikiEditForm from '@/components/wiki/WikiEditForm'

const mockEditData = {
  id: '',
  title: 'Архитектура продукта HR Helper',
  slug: 'arhitektura-produkta-hr-helper',
  category: 'architect',
  relatedApp: '',
  tags: ['Архитектура', '#architect'],
  description: 'Описание архитектуры продукта HR Helper',
  content: `# Архитектура продукта HR Helper

## Основные модули

1. Управление пользователями и аутентификация (apps.accounts)
   - Регистрация и авторизация пользователей
   - Интеграция с Google OAuth
   - Управление профилями и правами доступа
   - Интеграции с внешними системами

2. Финансы и грейды (apps.finance)
   - Управление грейдами компании
   - Расчет зарплатных вилок
   - Налоговые настройки и курсы валют
   - Бенчмарки зарплат
`,
  order: 0,
  isPublished: true,
}

export function WikiEditPage() {
  const params = useParams()
  const pageId = (params?.id as string) ?? ''
  const isNew = pageId === 'new'
  const initialData = isNew ? undefined : { ...mockEditData, id: pageId }

  return (
    <Box>
      <WikiEditForm initialData={initialData} isNew={isNew} />
    </Box>
  )
}
