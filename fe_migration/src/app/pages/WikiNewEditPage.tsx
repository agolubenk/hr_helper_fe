/**
 * WikiNewEditPage — редактирование/создание статьи (предложение): шаблоны, тип страницы, гибридный редактор, блоки.
 * Маршрут: /wiki-new/:id/edit (id === 'new' — создание).
 */

import { Box } from '@radix-ui/themes'
import { useParams } from '@/router-adapter'
import { WikiNewEditForm } from '@/components/wiki-new/WikiNewEditForm'
import type { PageTypeId } from '@/components/wiki-new/types'

const mockData = {
  id: '1',
  title: 'Архитектура продукта HR Helper',
  slug: 'arhitektura-produkta',
  category: 'Архитектура',
  pageType: 'knowledge_base' as PageTypeId,
  tags: ['#architect'],
  description: 'Описание архитектуры продукта HR Helper',
  content: `# Архитектура продукта HR Helper

## Основные модули

- Управление пользователями (apps.accounts)
- Финансы и грейды (apps.finance)
- Вакансии и найм
- Google Calendar интеграция
- AI-помощник
`,
}

export function WikiNewEditPage() {
  const params = useParams()
  const pageId = (params?.id as string) ?? ''
  const isNew = pageId === 'new'
  const initialData = isNew ? undefined : { ...mockData, id: pageId }

  return (
    <Box>
      <WikiNewEditForm initialData={initialData} isNew={isNew} />
    </Box>
  )
}
