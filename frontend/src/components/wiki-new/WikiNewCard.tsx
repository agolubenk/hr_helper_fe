import { Box, Text, Flex, Badge } from '@radix-ui/themes'
import { ClockIcon, OpenInNewWindowIcon } from '@radix-ui/react-icons'
import { useRouter } from '@/router-adapter'
import { PAGE_TYPES } from './types'
import type { WikiNewPageItem } from './types'
import styles from './WikiNewCard.module.css'

const tagColors: Record<string, string> = {
  '#ai': '#ef4444',
  '#architect': '#ef4444',
  '#вакансии': '#ef4444',
  '#интеграции': '#84cc16',
  '#интервьюеры': '#10b981',
  '#использование': '#10b981',
  '#календарь': '#a855f7',
  '#метрики': '#f59e0b',
  '#настройка': '#3b82f6',
  '#пользователи': '#6b7280',
  '#финансы': '#06b6d4',
}

interface WikiNewCardProps {
  page: WikiNewPageItem
}

export function WikiNewCard({ page }: WikiNewCardProps) {
  const router = useRouter()
  const typeLabel = PAGE_TYPES.find((t) => t.value === page.pageType)?.badgeLabel ?? 'Статья'

  return (
    <Box className={styles.card} onClick={() => router.push(`/wiki-new/${page.id}`)}>
      <Flex justify="between" align="start" gap="2" mb="2">
        <Text size="4" weight="bold" className={styles.cardTitle}>
          {page.title}
        </Text>
        <Badge size="1" variant="soft" className={styles.typeBadge}>
          {typeLabel}
        </Badge>
      </Flex>
      <Flex gap="2" wrap="wrap" my="2">
        {page.tags.map((tag, index) => (
          <Box
            key={index}
            className={styles.tag}
            style={{
              backgroundColor: tagColors[tag.toLowerCase()] ?? 'var(--gray-5)',
              color: '#ffffff',
            }}
          >
            <Text size="1" weight="medium">
              {tag}
            </Text>
          </Box>
        ))}
      </Flex>
      <Text size="2" color="gray" className={styles.description}>
        {page.description}
      </Text>
      <Flex align="center" justify="between" mt="3" className={styles.cardFooter}>
        <Flex align="center" gap="2">
          <ClockIcon width={14} height={14} style={{ color: 'var(--gray-9)' }} />
          <Text size="1" color="gray">
            {page.date}
          </Text>
        </Flex>
        <Box className={styles.openIcon}>
          <OpenInNewWindowIcon width={16} height={16} style={{ color: 'var(--gray-9)' }} />
        </Box>
      </Flex>
    </Box>
  )
}
