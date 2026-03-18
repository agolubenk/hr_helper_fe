/**
 * ProjectResourcesPage — ресурсы и аллокация по проектам (HR: загрузка, вакансии, план).
 */

'use client'

import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, Card, Progress } from '@radix-ui/themes'
import { BarChartIcon } from '@radix-ui/react-icons'
import styles from '../projects.module.css'

const MOCK_ALLOCATION = [
  { projectName: 'Alpha', allocated: 24, planned: 32, pct: 75 },
  { projectName: 'Beta', allocated: 15, planned: 18, pct: 83 },
  { projectName: 'Gamma', allocated: 6, planned: 8, pct: 75 },
]

export default function ProjectResourcesPage() {
  return (
    <AppLayout pageTitle="Ресурсы и аллокация">
      <Box className={styles.container}>
        <Flex align="center" gap="2" mb="4">
          <BarChartIcon width={24} height={24} />
          <Text size="6" weight="bold">
            Ресурсы и аллокация
          </Text>
        </Flex>

        <Text size="2" color="gray" mb="4">
          Заполненность проектов сотрудниками, план по FTE и связь с вакансиями. Capacity planning и перераспределение команд.
        </Text>

        <Text size="3" weight="bold" className={styles.sectionTitle}>
          Аллокация по проектам
        </Text>
        <Flex direction="column" gap="4">
          {MOCK_ALLOCATION.map((row) => (
            <Card key={row.projectName} size="2">
              <Flex justify="between" align="center" mb="2">
                <Text weight="medium">{row.projectName}</Text>
                <Text size="2" color="gray">
                  {row.allocated} / {row.planned} FTE
                </Text>
              </Flex>
              <Progress value={row.pct} size="2" />
            </Card>
          ))}
        </Flex>

        <Text size="2" color="gray" mt="6">
          Rebalance Teams и детальный Capacity Planning — в разработке.
        </Text>
      </Box>
    </AppLayout>
  )
}
