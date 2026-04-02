/**
 * WikiNewPage — предложенный список вики: тип страницы, категория, теги, карточки с бейджем типа.
 * Маршрут: /wiki-new
 */

import { Box } from '@radix-ui/themes'
import { useState } from 'react'
import { WikiNewHeader } from '@/components/wiki-new/WikiNewHeader'
import { WikiNewFilters } from '@/components/wiki-new/WikiNewFilters'
import { WikiNewCategoryBlock } from '@/components/wiki-new/WikiNewCategoryBlock'
import type { WikiNewPageItem, PageTypeId } from '@/components/wiki-new/types'
import styles from './styles/WikiNewPage.module.css'

const allTags = [
  { id: 'ai', label: '#ai', color: '#ef4444' },
  { id: 'architect', label: '#architect', color: '#ef4444' },
  { id: 'настройка', label: '#настройка', color: '#3b82f6' },
  { id: 'интервьюеры', label: '#интервьюеры', color: '#10b981' },
  { id: 'финансы', label: '#финансы', color: '#06b6d4' },
  { id: 'интеграции', label: '#интеграции', color: '#84cc16' },
  { id: 'пользователи', label: '#пользователи', color: '#6b7280' },
]

const mockPages: WikiNewPageItem[] = [
  { id: '1', slug: 'arhitektura-produkta', title: 'Архитектура продукта', description: 'Общая архитектура и компоненты системы HR Helper', tags: ['#architect'], date: '04.11.2025', category: 'Архитектура', pageType: 'knowledge_base' },
  { id: '2', slug: 'pervichnaya-nastroyka', title: 'Первичная настройка компании', description: 'Пошаговая инструкция по первоначальной настройке компании в системе', tags: ['#настройка', '#финансы'], date: '03.11.2025', category: 'Настройка', pageType: 'instructions' },
  { id: '3', slug: 'nastroyka-intervyuerov', title: 'Настройка интервьюеров', description: 'Как добавить и настроить интервьюеров в системе', tags: ['#интервьюеры', '#настройка'], date: '02.11.2025', category: 'Настройка', pageType: 'user_guide' },
  { id: '4', slug: 'upravlenie-polzovatelyami', title: 'Управление пользователями', description: 'Добавление, редактирование и управление пользователями системы', tags: ['#пользователи', '#настройка'], date: '01.11.2025', category: 'Пользователи', pageType: 'product_docs' },
]

export function WikiNewPage() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pageType, setPageType] = useState<PageTypeId | null>(null)
  const [category, setCategory] = useState<string | null>(null)

  const filteredPages = mockPages.filter((page) => {
    const tagMatch = selectedTag
      ? page.tags.some((t) => t.toLowerCase().replace(/^#/, '') === selectedTag.toLowerCase() || t.toLowerCase() === selectedTag.toLowerCase())
      : true
    const searchMatch =
      !searchQuery ||
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description.toLowerCase().includes(searchQuery.toLowerCase())
    const typeMatch = !pageType || page.pageType === pageType
    const categoryMatch = !category || page.category === category
    return tagMatch && searchMatch && typeMatch && categoryMatch
  })

  const categories = Array.from(new Set(filteredPages.map((p) => p.category)))
  const sortedCategories = [...categories].sort((a, b) => {
    if (a === 'Архитектура') return -1
    if (b === 'Архитектура') return 1
    return a.localeCompare(b)
  })

  const groupedPages = sortedCategories.reduce<Record<string, WikiNewPageItem[]>>((acc, cat) => {
    const pages = filteredPages.filter((p) => p.category === cat)
    if (pages.length > 0) acc[cat] = pages
    return acc
  }, {})

  return (
    <Box className={styles.container}>
      <WikiNewHeader />
      <WikiNewFilters
        tags={allTags}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        pageType={pageType}
        onPageTypeChange={setPageType}
        category={category}
        onCategoryChange={setCategory}
      />
      <Box className={styles.content}>
        {Object.entries(groupedPages).map(([cat, pages]) => (
          <WikiNewCategoryBlock key={cat} category={cat} pages={pages} />
        ))}
      </Box>
    </Box>
  )
}
