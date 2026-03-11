import { Box, Flex, Text, Select } from '@radix-ui/themes'
import styles from './RecrChatStatusBar.module.css'

const MOCK_VACANCIES = [
  { id: '1', title: 'Frontend Senior' },
  { id: '2', title: 'Backend Developer' },
  { id: '3', title: 'Product Designer' },
]

const MOCK_STATUSES = [
  { id: 'new', label: 'New', count: 5 },
  { id: 'screening', label: 'HR Screening', count: 3 },
  { id: 'interview', label: 'Interview', count: 8 },
  { id: 'offer', label: 'Offer', count: 2 },
]

/**
 * Минимальная статусная панель для страниц /recr-chat.
 * Отображается под Header (fixed top: 64px), высота 48px.
 */
export function RecrChatStatusBar() {
  return (
    <Box className={styles.bar}>
      <Box className={styles.vacancyBlock}>
        <Select.Root defaultValue="1">
          <Select.Trigger className={styles.trigger} placeholder="Вакансия" />
          <Select.Content>
            {MOCK_VACANCIES.map((v) => (
              <Select.Item key={v.id} value={v.id}>
                {v.title}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
      </Box>
      <Flex gap="2" align="center" className={styles.statuses} wrap="wrap">
        {MOCK_STATUSES.map((s) => (
          <Box key={s.id} className={styles.pill}>
            <Text size="1">{s.label}</Text>
            <Text size="1" weight="bold">
              {s.count}
            </Text>
          </Box>
        ))}
      </Flex>
    </Box>
  )
}
