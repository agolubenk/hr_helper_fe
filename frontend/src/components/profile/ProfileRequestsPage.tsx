import { Box, Text, Flex } from '@radix-ui/themes'
import { Link } from '@/router-adapter'
import { PROFILE_REQUESTS_BLOCKS } from '@/app/config/profileRequestsConfig'
import styles from './ProfileRequestsPage.module.css'

interface ProfileRequestsPageProps {
  blockFilter?: 'requests' | 'documents'
}

export function ProfileRequestsPage({ blockFilter }: ProfileRequestsPageProps) {
  const blocks = blockFilter
    ? PROFILE_REQUESTS_BLOCKS.filter((b) =>
        blockFilter === 'requests' ? b.blockLabel === 'Мои заявки' : b.blockLabel === 'Мои документы'
      )
    : PROFILE_REQUESTS_BLOCKS

  return (
    <Box className={styles.wrapper}>
      {blocks.map((block) => (
        <Box key={block.blockLabel} className={styles.block}>
          <Text size="3" weight="medium" className={styles.blockLabel}>
            {block.blockLabel}
          </Text>
          <Flex direction="column" gap="2" className={styles.items}>
            {block.items.map((item) => (
              <Link key={item.href} href={item.href} className={styles.item}>
                {item.label}
              </Link>
            ))}
          </Flex>
        </Box>
      ))}
    </Box>
  )
}
