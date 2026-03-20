import { Box, Text } from '@radix-ui/themes'
import { useSpecializations } from '@/app/specializations/context/SpecializationsContext'
import styles from '@/app/pages/styles/SpecializationsPage.module.css'

export function SpecializationCareerPage() {
  const { selectedNode } = useSpecializations()
  if (!selectedNode) return <Box className={styles.noSelection}><Text size="2" color="gray">Выберите специализацию.</Text></Box>
  return <Box><Text size="2">Пути развития для {selectedNode.name}</Text></Box>
}
