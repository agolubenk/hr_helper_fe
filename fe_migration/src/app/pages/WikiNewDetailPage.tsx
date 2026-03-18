/**
 * WikiNewDetailPage — просмотр статьи (предложение): липкое TOC, max-width контент, кнопка «Редактировать» в шапке.
 * Маршрут: /wiki-new/:id
 */

import { Box, Flex } from '@radix-ui/themes'
import { useParams } from '@/router-adapter'
import { WikiNewDetailHeader } from '@/components/wiki-new/WikiNewDetailHeader'
import { WikiNewDetailContent } from '@/components/wiki-new/WikiNewDetailContent'
import { WikiNewDetailTOC } from '@/components/wiki-new/WikiNewDetailTOC'
import type { WikiNewContent, PageTypeId } from '@/components/wiki-new/types'
import styles from './styles/WikiNewDetailPage.module.css'

const mockPage = {
  id: '1',
  slug: 'arhitektura-produkta',
  title: 'Архитектура продукта HR Helper',
  category: 'Архитектура',
  tags: ['#architect', 'Архитектура'],
  pageType: 'knowledge_base' as PageTypeId,
  content: {
    heading: 'Архитектура продукта HR Helper',
    sections: [
      { title: 'Основные модули', items: ['Управление пользователями (apps.accounts)', 'Финансы и грейды (apps.finance)', 'Вакансии и найм', 'Google Calendar интеграция', 'AI-помощник', 'Интервьюеры', 'Интеграции', 'Настройки компании', 'Huntflow'] },
      { title: 'Взаимосвязи модулей', content: 'Пользователи → Настройки компании (Грейды, Шаблоны отказов). Вакансии → Финансы, План найма → Интервьюеры. Google Calendar → Инвайты, Chat-бот.' },
      { title: 'Технологический стек', items: ['Backend: Django 4.2, Python 3.13', 'Frontend: Bootstrap 5, JavaScript', 'БД: SQLite / PostgreSQL', 'AI: Google Gemini API', 'Task Queue: Celery + Redis'] },
      { title: 'Принципы работы', items: ['Модульность', 'Единая точка входа — настройки компании', 'Иерархия зависимостей', 'Открытая архитектура интеграций'] },
    ],
  },
}

export function WikiNewDetailPage() {
  const params = useParams()
  const pageId = (params?.id as string) ?? ''
  const page = pageId && pageId !== 'new' ? mockPage : { ...mockPage, id: pageId }

  const sectionsForTOC = page.content.sections.map((s) => ({ title: s.title, level: 0 }))

  return (
    <Box className={styles.container}>
      <WikiNewDetailHeader
        title={page.title}
        category={page.category}
        tags={page.tags}
        pageType={page.pageType}
        pageId={pageId}
      />
      <div className={styles.detailLayout}>
        <Box className={styles.contentCol}>
          <WikiNewDetailContent heading={page.content.heading} sections={page.content.sections} />
        </Box>
        <Box className={styles.sidebarCol}>
          <WikiNewDetailTOC sections={sectionsForTOC} />
        </Box>
      </div>
    </Box>
  )
}
