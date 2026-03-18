import { Box, Flex, Text, Button, Badge } from '@radix-ui/themes'
import { Pencil2Icon } from '@radix-ui/react-icons'
import { useRouter } from '@/router-adapter'
import { PAGE_TYPES } from './types'
import type { PageTypeId } from './types'
import styles from './WikiNewDetailHeader.module.css'

interface WikiNewDetailHeaderProps {
  title: string
  category: string
  tags: string[]
  pageType: PageTypeId
  pageId: string
}

export function WikiNewDetailHeader({ title, category, tags, pageType, pageId }: WikiNewDetailHeaderProps) {
  const router = useRouter()
  const typeLabel = PAGE_TYPES.find((t) => t.value === pageType)?.badgeLabel ?? 'Статья'
  const isNew = pageId === 'new'

  return (
    <Box className={styles.header}>
      <Flex align="center" gap="2" mb="2" className={styles.breadcrumbs}>
        <Text size="2" color="gray" style={{ cursor: 'pointer' }} onClick={() => router.push('/wiki-new')}>
          Вики
        </Text>
        <Text size="2" color="gray">/</Text>
        <Text size="2" color="gray">{category}</Text>
        <Text size="2" color="gray">/</Text>
        <Text size="2" color="gray">{title}</Text>
      </Flex>
      <Flex align="center" justify="between" gap="3" wrap="wrap">
        <Flex align="center" gap="2" wrap="wrap">
          <Text size="6" weight="bold" className={styles.title}>
            {title}
          </Text>
          <Badge size="1" variant="soft">
            {typeLabel}
          </Badge>
        </Flex>
        {!isNew && (
          <Button size="2" variant="soft" onClick={() => router.push(`/wiki-new/${pageId}/edit`)} className={styles.editBtn}>
            <Pencil2Icon width={14} height={14} />
            Редактировать
          </Button>
        )}
      </Flex>
      {tags.length > 0 && (
        <Flex gap="2" wrap="wrap" mt="2">
          {tags.map((tag, i) => (
            <Text key={i} size="1" color="gray">
              {tag}
            </Text>
          ))}
        </Flex>
      )}
    </Box>
  )
}
