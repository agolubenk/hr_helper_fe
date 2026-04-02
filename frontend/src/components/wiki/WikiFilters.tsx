'use client'

import { Flex, Box, Text, TextField, Button, Select } from "@radix-ui/themes"
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons"
import { useEffect, useMemo, useState } from "react"
import styles from './WikiFilters.module.css'

const MOBILE_MAX_WIDTH_PX = 768
/** Порция «ещё» для мобилки (~две строки при переносе чипов) */
const MOBILE_TAGS_CHUNK = 12

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
  const [isMobileLayout, setIsMobileLayout] = useState(false)
  const [mobileTagLimit, setMobileTagLimit] = useState(MOBILE_TAGS_CHUNK)
  const [filtersBlockOpen, setFiltersBlockOpen] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`)
    const apply = () => setIsMobileLayout(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const tagItems = useMemo(() => {
    const allTagItem: Tag = { id: '__all__', label: 'Все теги', color: '#2563eb' }
    return [allTagItem, ...tags]
  }, [tags])

  const visibleTagItems = isMobileLayout ? tagItems.slice(0, mobileTagLimit) : tagItems
  const hasMoreTags = isMobileLayout && tagItems.length > visibleTagItems.length

  return (
    <Box className={styles.filtersContainer}>
      {/* Поиск - выше меток */}
      <Flex gap="2" align="center" className={styles.searchContainer} mb="3">
        <Button
          type="button"
          size="3"
          variant="soft"
          className={styles.filtersToggle}
          aria-expanded={filtersBlockOpen}
          aria-controls="wiki-filters-advanced-block"
          aria-label={filtersBlockOpen ? 'Свернуть фильтры и метки' : 'Развернуть фильтры и метки'}
          onClick={() => setFiltersBlockOpen((v) => !v)}
          style={{
            backgroundColor: 'var(--gray-2)',
            border: '1px solid var(--gray-6)',
            flexShrink: 0,
          }}
        >
          {filtersBlockOpen ? (
            <ChevronUpIcon width={18} height={18} style={{ color: 'var(--gray-11)' }} />
          ) : (
            <ChevronDownIcon width={18} height={18} style={{ color: 'var(--gray-11)' }} />
          )}
        </Button>
        <TextField.Root
          size="3"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по названию или содержимому..."
          style={{ flex: 1, minWidth: 0 }}
        />
        <Button
          size="3"
          variant="soft"
          style={{
            backgroundColor: 'var(--gray-2)',
            border: '1px solid var(--gray-6)',
            flexShrink: 0,
          }}
        >
          <MagnifyingGlassIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
        </Button>
      </Flex>

      <Box
        id="wiki-filters-advanced-block"
        className={filtersBlockOpen ? undefined : styles.filtersAdvancedHidden}
        hidden={!filtersBlockOpen}
        aria-hidden={!filtersBlockOpen}
      >
      {/* Тип страницы, Категория, Приложение */}
      {(onPageTypeChange != null || onCategoryChange != null || onRelatedAppChange != null) && (
        <Box mb="3" className={styles.filtersRow}>
          {onPageTypeChange != null && (
            <Box className={styles.filterCell}>
              <Text size="2" weight="medium" color="gray" className={styles.filterLabel}>Тип страницы:</Text>
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
            </Box>
          )}
          {onCategoryChange != null && (
            <Box className={styles.filterCell}>
              <Text size="2" weight="medium" color="gray" className={styles.filterLabel}>Категория:</Text>
              <Select.Root value={category || 'all'} onValueChange={(v) => onCategoryChange(v === 'all' ? '' : v)}>
                <Select.Trigger className={styles.selectTrigger} />
                <Select.Content>
                  <Select.Item value="all">Все категории</Select.Item>
                  {CATEGORY_OPTIONS.map((c) => (
                    <Select.Item key={c} value={c}>{c}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          )}
          {onRelatedAppChange != null && (
            <Box className={styles.filterCell}>
              <Text size="2" weight="medium" color="gray" className={styles.filterLabel}>Приложение:</Text>
              <Select.Root value={relatedApp || 'all'} onValueChange={(v) => onRelatedAppChange(v === 'all' ? '' : v)}>
                <Select.Trigger className={styles.selectTrigger} />
                <Select.Content>
                  {RELATED_APP_OPTIONS.map((o) => (
                    <Select.Item key={o.value || 'all'} value={o.value || 'all'}>{o.label}</Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          )}
        </Box>
      )}

      <Box className={styles.tagsSection}>
        <Flex align="center" gap="2" wrap="wrap" className={styles.tagsHeading}>
          <Box className={styles.tagIcon} aria-hidden>
            <Text size="1" style={{ color: 'var(--gray-11)' }}>🏷️</Text>
          </Box>
          <Text size="2" weight="medium" color="gray" className={styles.tagsTitle}>
            Фильтр по меткам:
          </Text>
        </Flex>

        <Flex gap="2" wrap="wrap" align="center" className={styles.tagsChips}>
          {visibleTagItems.map((tag) => {
            const isAll = tag.id === '__all__'
            const isSelected = isAll ? selectedTag === null : selectedTag === tag.id

            return (
              <Button
                key={tag.id}
                size="2"
                variant={isSelected ? 'solid' : 'soft'}
                className={styles.tagChip}
                style={{
                  backgroundColor: isSelected ? tag.color : isAll ? 'var(--gray-3)' : 'transparent',
                  color: isSelected ? '#ffffff' : isAll ? 'var(--gray-11)' : tag.color,
                  border: isAll ? undefined : `1px solid ${tag.color}`,
                  borderRadius: '9999px',
                  flex: '0 1 auto',
                  maxWidth: '100%',
                }}
                onClick={() => onTagSelect(isAll ? null : (isSelected ? null : tag.id))}
              >
                {tag.label}
              </Button>
            )
          })}

          {hasMoreTags ? (
            <Button
              size="2"
              variant="soft"
              className={styles.moreTagsButton}
              onClick={() => setMobileTagLimit((n) => n + MOBILE_TAGS_CHUNK)}
            >
              еще
            </Button>
          ) : null}
        </Flex>
      </Box>
      </Box>
    </Box>
  )
}
