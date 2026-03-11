import { Box, Text, Flex } from '@radix-ui/themes'
import { EnvelopeClosedIcon, PaperPlaneIcon } from '@radix-ui/react-icons'
import styles from './UserCard.module.css'

interface UserCardProps {
  firstName: string
  lastName: string
  email?: string
  telegram?: string
  avatarUrl?: string
}

export function UserCard({ firstName, lastName, email, telegram, avatarUrl }: UserCardProps) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()

  return (
    <Box className={styles.userCard}>
      <Box className={styles.avatarContainer}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={`${firstName} ${lastName}`} className={styles.avatar} />
        ) : (
          <Box className={styles.avatarPlaceholder}>
            <Text size="6" weight="bold">
              {initials}
            </Text>
          </Box>
        )}
      </Box>
      <Text size="4" weight="bold" className={styles.userName}>
        {firstName} {lastName}
      </Text>
      {email && (
        <Flex align="center" justify="center" gap="2" className={styles.emailRow}>
          <EnvelopeClosedIcon width={16} height={16} />
          <Text size="2" color="gray">
            {email}
          </Text>
        </Flex>
      )}
      {telegram && (
        <Flex align="center" justify="center" gap="2" className={styles.telegramRow}>
          <PaperPlaneIcon width={16} height={16} />
          <Text size="2" color="gray">
            {telegram}
          </Text>
        </Flex>
      )}
    </Box>
  )
}
