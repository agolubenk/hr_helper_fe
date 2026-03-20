import { Box, Button, Flex, Text } from '@radix-ui/themes'
import { useSpecializations } from '@/app/specializations/context/SpecializationsContext'
import styles from '@/app/pages/styles/SpecializationsPage.module.css'

export function SpecializationInfoPage() {
  const { selectedNode } = useSpecializations()
  if (!selectedNode) return <Box className={styles.noSelection}><Text size="2" color="gray">Выберите специализацию.</Text></Box>
  return (
    <Box>
      <Box className={styles.tabSection}><Text size="2" weight="bold" className={styles.tabSectionTitle}>Название</Text><Text>{selectedNode.name}</Text></Box>
      <Box className={styles.tabSection}><Text size="2" weight="bold" className={styles.tabSectionTitle}>Описание</Text><Text color="gray">{selectedNode.description || '—'}</Text></Box>
      <Flex gap="3"><Button>Сохранить</Button></Flex>
    </Box>
  )
}
