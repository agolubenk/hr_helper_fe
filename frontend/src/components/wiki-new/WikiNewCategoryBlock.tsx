import { Box, Text, Flex } from '@radix-ui/themes'
import { WikiNewCard } from './WikiNewCard'
import type { WikiNewPageItem } from './types'
import styles from './WikiNewCategoryBlock.module.css'

interface WikiNewCategoryBlockProps {
  category: string
  pages: WikiNewPageItem[]
}

export function WikiNewCategoryBlock({ category, pages }: WikiNewCategoryBlockProps) {
  return (
    <Box className={styles.category}>
      <Flex align="center" gap="2" mb="3" className={styles.categoryHeader}>
        <Text size="2" style={{ color: 'var(--gray-11)' }}>
          📁
        </Text>
        <Text size="4" weight="bold">
          {category}
        </Text>
      </Flex>
      <Flex gap="3" wrap="wrap" className={styles.cardsGrid}>
        {pages.map((page) => (
          <WikiNewCard key={page.id} page={page} />
        ))}
      </Flex>
    </Box>
  )
}
