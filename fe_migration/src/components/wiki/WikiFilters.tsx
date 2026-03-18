'use client'

import { Flex, Box, Text, TextField, Button, Select } from "@radix-ui/themes"
import { MagnifyingGlassIcon } from "@radix-ui/react-icons"
import styles from './WikiFilters.module.css'

interface Tag {
  id: string
  label: string
  color: string
}

const PAGE_TYPE_OPTIONS = [
  { value: '', label: 'Все типы' },
  { value: 'knowledge_base', label: 'База знаний' },
  { value: 'product_docs', label: 'Документация по продукту' },
  { value: 'instructions', label: 'Инструкции и гайды' },
  { value: 'user_guide', label: 'Руководство пользователя' },
]

const CATEGORY_OPTIONS = ['Архитектура', 'Настройка', 'Интеграции', 'Пользователи', 'Отчёты', 'FAQ', 'API']

const RELATED_APP_OPTIONS = [
  { value: '', label: 'Все приложения' },
  { value: 'accounts', label: 'Управление пользователями' },
  { value: 'finance', label: 'Финансы' },
  { value: 'vacancies', label: 'Вакансии' },
  { value: 'hiring_plan', label: 'План найма' },
]

interface WikiFiltersProps {
  tags: Tag[]
  selectedTag: string | null
  onTagSelect: (tagId: string | null) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  pageType?: string
  onPageTypeChange?: (value: string) => void
  category?: string
  onCategoryChange?: (value: string) => void
  relatedApp?: string
  onRelatedAppChange?: (value: string) => void
}

export default function WikiFilters({
  tags,
  selectedTag,
  onTagSelect,
  searchQuery,
  onSearchChange,
  pageType = '',
  onPageTypeChange,
  category = '',
  onCategoryChange,
  relatedApp = '',
  onRelatedAppChange,
}: WikiFiltersProps) {
  return (
    <Box className={styles.filtersContainer}>
      {/* Поиск - выше меток */}
      <Flex gap="2" align="center" className={styles.searchContainer} mb="3">
        <TextField.Root
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по названию или содержимому..."
          style={{ flex: 1 }}
        />
        <Button
          size="3"
          variant="soft"
          style={{
            backgroundColor: 'var(--gray-2)',
            border: '1px solid var(--gray-6)',
          }}
        >
          <MagnifyingGlassIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
        </Button>
      </Flex>

      {/* Тип страницы, Категория, Приложение */}
      {(onPageTypeChange != null || onCategoryChange != null || onRelatedAppChange != null) && (
        <Flex align="center" gap="3" wrap="wrap" mb="3" className={styles.filtersRow}>
          {onPageTypeChange != null && (
            <>
              <Text size="2" weight="medium" color="gray">Тип страницы:</Text>
              <Select.Root value={pageType ? pageType : 'all'} onValueChange={(v) => onPageTypeChange(v === 'all' ? '' : v)}>
                <Select.Trigger className={styles.selectTrigger} />
                <Select.Content>
                  <Select.Item value="all">Все типы</Select.Item>
                  {PAGE_TYPE_OPTIONS.filter((o) => o.value).map((o) => (
                    <Select.Item key={o.value} value={o.value}>
                      {o.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </>
          )}
          {onCategoryChange != null && (
            <>
              <Text size="2" weight="medium" color="gray">Категория:</Text>
              <Select.Root value={category || 'all'} onValueChange={(v) => onCategoryChange(v === 'all' ? '' : v)}>
                <Select.Trigger className={styles.selectTrigger} />
                <Select.Content>
                  <Select.Item value="all">Все категории</Select.Item>
                  {CATEGORY_OPTIONS.map((c) => (
                    <Select.Item key={c} value={c}>{c}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </>
          )}
          {onRelatedAppChange != null && (
            <>
              <Text size="2" weight="medium" color="gray">Приложение:</Text>
              <Select.Root value={relatedApp || 'all'} onValueChange={(v) => onRelatedAppChange(v === 'all' ? '' : v)}>
                <Select.Trigger className={styles.selectTrigger} />
                <Select.Content>
                  {RELATED_APP_OPTIONS.map((o) => (
                    <Select.Item key={o.value || 'all'} value={o.value || 'all'}>{o.label}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </>
          )}
        </Flex>
      )}
      
      {/* Фильтр по меткам — все в один ряд с переносом */}
      <Flex align="center" gap="2" wrap="wrap" className={styles.tagsRow}>
        <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Text size="1" style={{ color: 'var(--gray-11)' }}>🏷️</Text>
        </Box>
        <Text size="2" weight="medium" color="gray">
          Фильтр по меткам:
        </Text>
        <Button
          size="2"
          variant={selectedTag === null ? 'solid' : 'soft'}
          style={{
            backgroundColor: selectedTag === null ? '#2563eb' : 'var(--gray-3)',
            color: selectedTag === null ? '#ffffff' : 'var(--gray-11)',
            borderRadius: '9999px',
          }}
          onClick={() => onTagSelect(null)}
        >
          Все теги
        </Button>
        {tags.map((tag) => (
          <Button
            key={tag.id}
            size="2"
            variant={selectedTag === tag.id ? 'solid' : 'soft'}
            style={{
              backgroundColor: selectedTag === tag.id ? tag.color : 'transparent',
              color: selectedTag === tag.id ? '#ffffff' : tag.color,
              border: `1px solid ${tag.color}`,
              borderRadius: '9999px',
            }}
            onClick={() => onTagSelect(selectedTag === tag.id ? null : tag.id)}
          >
            {tag.label}
          </Button>
        ))}
      </Flex>
    </Box>
  )
}
