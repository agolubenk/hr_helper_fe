/**
 * WikiDetailPage — просмотр статьи вики по id из URL.
 * Без AppLayout (обёртка в App.tsx).
 * При ширине ≤760px кнопки «Редактировать» и «Вернуться» из шапки скрыты; показывается плавающий блок справа сверху (под хедером) с тремя кнопками-иконками: Редактировать, Содержание, Назад.
 */

import { useState, useEffect } from 'react'
import { Box, Flex, Button, Popover } from '@radix-ui/themes'
import { ListBulletIcon, Pencil1Icon, ArrowLeftIcon } from '@radix-ui/react-icons'
import { useParams, useRouter } from '@/router-adapter'
import WikiDetailHeader from '@/components/wiki/WikiDetailHeader'
import WikiDetailContent from '@/components/wiki/WikiDetailContent'
import WikiDetailSidebar from '@/components/wiki/WikiDetailSidebar'
import WikiDetailHistory from '@/components/wiki/WikiDetailHistory'
import styles from './styles/WikiDetailPage.module.css'

const FLOATING_BAR_BREAKPOINT = '(max-width: 760px)'

function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const m = window.matchMedia(query)
    setMatches(m.matches)
    const listener = () => setMatches(m.matches)
    m.addEventListener('change', listener)
    return () => m.removeEventListener('change', listener)
  }, [query])
  return matches
}

const wikiPageContent = {
  id: '',
  title: 'Архитектура продукта HR Helper',
  category: 'Архитектура',
  tags: ['Архитектура', '#architect'],
  author: 'Иван Петров',
  lastEditor: 'Мария Сидорова',
  created: '04.11.2025',
  lastEdited: '05.11.2025',
  content: {
    heading: 'Архитектура продукта HR Helper',
    sections: [
      { title: 'Основные модули', items: ['1. Управление пользователями и аутентификация (apps.accounts)', '2. Финансы и грейды (apps.finance)', '3. Вакансии и найм (apps.vacancies, apps.hiring_plan)', '4. Google Calendar интеграция (apps.google_oauth)', '5. AI-помощник (apps.gemini)', '6. Управление интервьюерами (apps.interviewers)', '7. Интеграции (apps.clickup_int, apps.notion_int)', '8. Настройки компании (apps.company_settings)', '9. Huntflow интеграция (apps.huntflow)'] },
      { title: '1. Управление пользователями и аутентификация (apps.accounts)', items: ['Регистрация и авторизация пользователей', 'Интеграция с Google OAuth', 'Управление профилями и правами доступа', 'Интеграции с внешними системами'] },
      { title: '2. Финансы и грейды (apps.finance)', items: ['Управление грейдами компании', 'Расчет зарплатных вилок', 'Налоговые настройки и курсы валют', 'Бенчмарки зарплат'] },
      { title: '3. Вакансии и найм (apps.vacancies, apps.hiring_plan)', items: ['Создание и управление вакансиями', 'План найма и заявки на найм', 'Управление SLA найма', 'Метрики и KPI найма'] },
      { title: '4. Google Calendar интеграция (apps.google_oauth)', items: ['Синхронизация с Google Calendar', 'Автоматическое создание инвайтов', 'Управление слотами для интервью', 'Chat-бот для работы с кандидатами'] },
      { title: '5. AI-помощник (apps.gemini)', items: ['Интеграция с Google Gemini AI', 'Помощь в составлении описаний вакансий', 'Анализ резюме и кандидатов', 'Генерация ответов'] },
      { title: '6. Управление интервьюерами (apps.interviewers)', items: ['База интервьюеров', 'Правила привлечения интервьюеров', 'Автоматическое распределение нагрузки'] },
      { title: '7. Интеграции (apps.clickup_int, apps.notion_int)', items: ['Синхронизация с ClickUp', 'Синхронизация с Notion', 'Импорт и экспорт данных'] },
      { title: '8. Настройки компании (apps.company_settings)', items: ['Базовые настройки компании', 'Управление активными грейдами', 'Шаблоны отказов кандидатам', 'Оргструктура'] },
      { title: '9. Huntflow интеграция (apps.huntflow)', items: ['Синхронизация вакансий с Huntflow', 'Импорт кандидатов', 'Управление статусами'] },
      { title: 'Взаимосвязи модулей', content: '┌─────────────────┐\n│   Пользователи  │\n└────────┬────────┘\n         │\n         ├──► Настройки компании\n         │         │\n         │         ├──► Грейды\n         │         └──► Шаблоны отказов\n         ├──► Вакансии\n         │         ├──► Финансы (вилки)\n         │         └──► План найма\n         │                   └──► Интервьюеры\n         ├──► Google Calendar\n         │         ├──► Инвайты\n         │         └──► Chat-бот\n         └──► Интеграции\n                   ├──► ClickUp\n                   ├──► Notion\n                   └──► Huntflow' },
      { title: 'Технологический стек', items: ['Backend: Django 4.2, Python 3.13', 'Frontend: Bootstrap 5, JavaScript (Vanilla)', 'База данных: SQLite (разработка), PostgreSQL (продакшн)', 'AI: Google Gemini API', 'Интеграции: Google Calendar API, ClickUp API, Notion API, Huntflow API', 'Task Queue: Celery с Redis'] },
      { title: 'Принципы работы', items: ['Модульность — каждый модуль независим и может работать отдельно', 'Единая точка входа — все настройки через настройки компании', 'Иерархия зависимостей — четкая последовательность настройки компонентов', 'Интеграции — открытая архитектура для подключения внешних систем'] },
      { title: '', content: 'Подробнее о настройке каждого компонента читайте в соответствующих разделах.' },
    ],
  },
}

export function WikiDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pageId = (params?.id as string) ?? ''
  const showFloatingBar = useMatchMedia(FLOATING_BAR_BREAKPOINT)
  const [tocOpen, setTocOpen] = useState(false)

  return (
    <Box className={styles.wikiDetailContainer}>
      <WikiDetailHeader title={wikiPageContent.title} category={wikiPageContent.category} tags={wikiPageContent.tags} />

      {/* При ширине ≤760px: плавающий блок с тремя кнопками — Назад, Содержание, Редактировать */}
      {showFloatingBar && (
        <Flex gap="2" align="center" className={styles.floatingActionsBar}>
          <Button
            type="button"
            size="3"
            variant="soft"
            radius="full"
            className={styles.floatingBarButton}
            title="Вернуться к списку"
            aria-label="Вернуться к списку"
            onClick={() => router.push('/wiki')}
            style={{ backgroundColor: 'var(--gray-3)', color: 'var(--gray-11)' }}
          >
            <ArrowLeftIcon width={18} height={18} />
          </Button>
          <Popover.Root open={tocOpen} onOpenChange={setTocOpen}>
            {/* @ts-expect-error Radix Themes Popover.Trigger typings omit asChild */}
            <Popover.Trigger asChild>
              <Button
                type="button"
                size="3"
                variant="soft"
                radius="full"
                className={styles.floatingBarButton}
                aria-label="Открыть содержание"
                title="Содержание"
              >
                <ListBulletIcon width={18} height={18} />
              </Button>
            </Popover.Trigger>
            <Popover.Content
              className={styles.tocPopoverContent}
              align="end"
              sideOffset={8}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <WikiDetailSidebar
                pageId={pageId}
                sections={wikiPageContent.content.sections}
                onSectionClick={() => setTocOpen(false)}
              />
            </Popover.Content>
          </Popover.Root>
          <Button
            type="button"
            size="3"
            variant="solid"
            radius="full"
            className={styles.floatingBarButton}
            title="Редактировать"
            aria-label="Редактировать"
            onClick={() => router.push(`/wiki/${pageId}/edit`)}
            style={{ backgroundColor: 'var(--accent-9)', color: '#ffffff' }}
          >
            <Pencil1Icon width={18} height={18} />
          </Button>
        </Flex>
      )}

      <Flex gap="4" className={styles.detailContent}>
        <Box className={styles.mainContent}>
          <WikiDetailContent content={wikiPageContent.content} />
        </Box>
        <Flex direction="column" gap="3" className={styles.sidebar}>
          {!showFloatingBar && (
            <WikiDetailSidebar pageId={pageId} sections={wikiPageContent.content.sections} />
          )}
          <WikiDetailHistory
            author={wikiPageContent.author}
            lastEditor={wikiPageContent.lastEditor}
            lastEdited={wikiPageContent.lastEdited}
            created={wikiPageContent.created}
          />
        </Flex>
      </Flex>
    </Box>
  )
}
