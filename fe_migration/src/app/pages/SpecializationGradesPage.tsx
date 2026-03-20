import { Box, Button, Flex, Text } from '@radix-ui/themes'
import { useSpecializations } from '@/app/specializations/context/SpecializationsContext'
import styles from '@/app/pages/styles/SpecializationsPage.module.css'

export function SpecializationGradesPage() {
  const { selectedNode, gradingBySpecId } = useSpecializations()
  if (!selectedNode) return <Box className={styles.noSelection}><Text size="2" color="gray">Выберите специализацию.</Text></Box>
  const levels = gradingBySpecId[selectedNode.id]?.levels ?? []
  return (
    <Box>
      <Text size="2" weight="bold" className={styles.tabSectionTitle}>Система грейдирования</Text>
      {levels.map((l) => <Box key={l.id} className={styles.tabSection}><Text>{l.name}: {l.minSalary ?? 0} - {l.maxSalary ?? 0}$</Text></Box>)}
      <Flex gap="3"><Button>Сохранить</Button></Flex>
    </Box>
  )
}
