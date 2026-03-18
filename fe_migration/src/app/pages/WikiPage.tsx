/**
 * WikiPage — главная страница вики (база знаний): список статей, фильтры по тегам и поиск, группировка по категориям.
 * Без AppLayout (обёртка в App.tsx).
 */

import { Box } from '@radix-ui/themes'
import { useState } from 'react'
import WikiHeader from '@/components/wiki/WikiHeader'
import WikiFilters from '@/components/wiki/WikiFilters'
import WikiCategory from '@/components/wiki/WikiCategory'
import styles from './styles/WikiPage.module.css'

export interface WikiPageItem {
  id: string
  title: string
  description: string
  tags: string[]
  date: string
  category: string
  pageType?: string
  relatedApp?: string
}

const wikiPages: WikiPageItem[] = [
  { id: '1', title: 'Архитектура продукта', description: 'Общая архитектура и компоненты системы HR Helper', tags: ['#architect'], date: '04.11.2025', category: 'Архитектура', pageType: 'knowledge_base', relatedApp: '' },
  { id: '2', title: 'Первичная настройка компании', description: 'Пошаговая инструкция по первоначальной настройке компании в системе', tags: ['#настройка', '#финансы'], date: '03.11.2025', category: 'Настройка', pageType: 'instructions', relatedApp: 'finance' },
  { id: '3', title: 'Настройка интервьюеров', description: 'Как добавить и настроить интервьюеров в системе', tags: ['#интервьюеры', '#настройка'], date: '02.11.2025', category: 'Настройка', pageType: 'user_guide', relatedApp: '' },
  { id: '4', title: 'Управление пользователями', description: 'Добавление, редактирование и управление пользователями системы', tags: ['#пользователи', '#настройка'], date: '01.11.2025', category: 'Пользователи', pageType: 'product_docs', relatedApp: 'accounts' },
]

const allTags = [
  { id: 'ai', label: '#ai', color: '#ef4444' },
  { id: 'architect', label: '#architect', color: '#ef4444' },
  { id: 'вакансии', label: '#вакансии', color: '#ef4444' },
  { id: 'интеграции', label: '#интеграции', color: '#84cc16' },
  { id: 'интервьюеры', label: '#интервьюеры', color: '#10b981' },
  { id: 'использование', label: '#использование', color: '#10b981' },
  { id: 'календарь', label: '#календарь', color: '#a855f7' },
  { id: 'метрики', label: '#метрики', color: '#f59e0b' },
  { id: 'настройка', label: '#настройка', color: '#3b82f6' },
  { id: 'пользователи', label: '#пользователи', color: '#6b7280' },
  { id: 'финансы', label: '#финансы', color: '#06b6d4' },
]

export function WikiPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pageType, setPageType] = useState('')
  const [category, setCategory] = useState('')
  const [relatedApp, setRelatedApp] = useState('')

  const filteredPages = wikiPages.filter((page) => {
    const tagMatch = selectedTag
      ? page.tags.some((tag) => tag.toLowerCase().replace(/^#/, '') === selectedTag.toLowerCase() || tag.toLowerCase() === selectedTag.toLowerCase())
      : true
    const searchMatch =
      !searchQuery ||
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(searchQuery.toLowerCase())
    const typeMatch = !pageType || page.pageType === pageType
    const categoryMatch = !category || page.category === category
    const appMatch = !relatedApp || page.relatedApp === relatedApp
    return tagMatch && searchMatch && typeMatch && categoryMatch && appMatch
  })

  const categories = Array.from(new Set(filteredPages.map((p) => p.category)))
  const sortedCategories = [...categories].sort((a, b) => {
    if (a === 'Архитектура') return -1
    if (b === 'Архитектура') return 1
    return a.localeCompare(b)
  })

  const groupedPages = sortedCategories.reduce<Record<string, WikiPageItem[]>>((acc, category) => {
    const pages = filteredPages.filter((p) => p.category === category)
    if (pages.length > 0) acc[category] = pages
    return acc
  }, {})

  return (
    <Box className={styles.wikiContainer}>
      <WikiHeader />
      <WikiFilters
        tags={allTags}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pageType={pageType}
        onPageTypeChange={setPageType}
        category={category}
        onCategoryChange={setCategory}
        relatedApp={relatedApp}
        onRelatedAppChange={setRelatedApp}
      />
      <Box className={styles.wikiContent}>
        {Object.entries(groupedPages).map(([category, pages]) => (
          <WikiCategory key={category} category={category} pages={pages} />
        ))}
      </Box>
    </Box>
  )
}
