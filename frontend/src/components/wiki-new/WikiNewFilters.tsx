import { Flex, Box, Text, TextField, Button, Select } from '@radix-ui/themes'
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { PAGE_TYPES, CATEGORIES } from './types'
import type { PageTypeId } from './types'
import styles from './WikiNewFilters.module.css'

export interface TagOption {
  id: string
  label: string
  color: string
}

interface WikiNewFiltersProps {
  tags: TagOption[]
  selectedTag: string | null
  onTagSelect: (tagId: string | null) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  pageType: PageTypeId | null
  onPageTypeChange: (value: PageTypeId | null) => void
  category: string | null
  onCategoryChange: (value: string | null) => void
}

export function WikiNewFilters({
  tags,
  selectedTag,
  onTagSelect,
  searchQuery,
  onSearchChange,
  pageType,
  onPageTypeChange,
  category,
  onCategoryChange,
}: WikiNewFiltersProps) {
  return (
    <Box className={styles.filtersContainer}>
      <Flex gap="2" align="center" className={styles.searchRow} mb="3">
        <TextField.Root
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по названию или содержимому…"
          className={styles.searchInput}
        />
        <Button size="3" variant="soft" className={styles.searchButton}>
          <MagnifyingGlassIcon width={16} height={16} style={{ color: 'var(--gray-11)' }} />
        </Button>
      </Flex>

      <Flex gap="3" wrap="wrap" align="center" className={styles.filtersRow}>
        <Text size="2" weight="medium" color="gray">
          Тип страницы:
        </Text>
        <Select.Root
          value={pageType ?? 'all'}
          onValueChange={(v) => onPageTypeChange(v === 'all' ? null : (v as PageTypeId))}
        >
          <Select.Trigger className={styles.selectTrigger} />
          <Select.Content>
            <Select.Item value="all">Все типы</Select.Item>
            {PAGE_TYPES.map((t) => (
              <Select.Item key={t.value} value={t.value}>
                {t.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        <Text size="2" weight="medium" color="gray">
          Категория:
        </Text>
        <Select.Root
          value={category ?? 'all'}
          onValueChange={(v) => onCategoryChange(v === 'all' ? null : v)}
        >
          <Select.Trigger className={styles.selectTrigger} />
          <Select.Content>
            <Select.Item value="all">Все категории</Select.Item>
            {CATEGORIES.map((c) => (
              <Select.Item key={c} value={c}>
                {c}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Flex>

      <Flex align="center" gap="2" wrap="wrap" className={styles.tagsRow}>
        <Text size="2" weight="medium" color="gray">
          Метки:
        </Text>
        <Button
          size="2"
          variant={selectedTag === null ? 'solid' : 'soft'}
          className={styles.tagChip}
          onClick={() => onTagSelect(null)}
        >
          Все теги
        </Button>
        <Box className={styles.tagsScroll}>
          {tags.map((tag) => (
            <Button
              key={tag.id}
              size="2"
              variant={selectedTag === tag.id ? 'solid' : 'soft'}
              className={styles.tagChip}
              style={
                selectedTag === tag.id
                  ? { backgroundColor: tag.color, color: '#fff' }
                  : { borderColor: tag.color, color: tag.color }
              }
              onClick={() => onTagSelect(selectedTag === tag.id ? null : tag.id)}
            >
              {tag.label}
            </Button>
          ))}
        </Box>
      </Flex>
    </Box>
  )
}
