/**
 * SpecializationAllocationPage (specializations/[id]/allocation/page.tsx) — Аллокация по специализации
 *
 * Назначение: отображение распределения сотрудников по грейдам и по проектам (мок BY_GRADE, BY_PROJECT).
 * Связи: useSpecializations (selectedNode).
 */

'use client'

import { Box, Flex, Text, Button, Progress } from '@radix-ui/themes'
import { useSpecializations } from '../../context/SpecializationsContext'
import styles from '../../specializations.module.css'

const BY_GRADE = [
  { grade: 'Junior', count: 15, total: 45, pct: 33 },
  { grade: 'Middle', count: 20, total: 45, pct: 44 },
  { grade: 'Senior', count: 10, total: 45, pct: 22 },
]

const BY_PROJECT = [
  { project: 'Alpha', count: 20 },
  { project: 'Beta', count: 15 },
  { project: 'Gamma', count: 10 },
]

export default function SpecializationAllocationPage() {
  const { selectedNode } = useSpecializations()

  if (!selectedNode) {
    return (
      <Box className={styles.noSelection}>
        <Text size="2" color="gray">Выберите специализацию в левой панели.</Text>
      </Box>
    )
  }

  const total = selectedNode.employeeCount ?? 45

  return (
    <Box>
      <Flex justify="between" align="center" mb="4">
        <Text size="2" weight="bold">Распределение сотрудников</Text>
        <Flex gap="2">
          <Button variant="soft">Capacity Planning</Button>
          <Button variant="soft">Rebalance Teams</Button>
        </Flex>
      </Flex>

      <Box className={styles.tabSection}>
        <Text size="2" weight="bold" className={styles.tabSectionTitle}>
          Всего: {total} сотрудников
        </Text>
      </Box>

      <Box className={styles.tabSection}>
        <Text size="2" weight="bold" className={styles.tabSectionTitle}>
          По грейдам
        </Text>
        {BY_GRADE.map((row) => (
          <Box key={row.grade} mb="3">
            <Flex justify="between" mb="1">
              <Text size="2">{row.grade}</Text>
              <Text size="2" color="gray">
                {row.count} чел ({row.pct}%)
              </Text>
            </Flex>
            <Progress value={row.pct} size="2" />
          </Box>
        ))}
      </Box>

      <Box className={styles.tabSection}>
        <Text size="2" weight="bold" className={styles.tabSectionTitle}>
          По проектам
        </Text>
        <Flex gap="3" wrap="wrap">
          {BY_PROJECT.map((row) => (
            <Box
              key={row.project}
              p="3"
              style={{
                border: '1px solid var(--gray-a6)',
                borderRadius: 8,
                minWidth: 120,
              }}
            >
              <Text size="2" weight="bold">{row.project}</Text>
              <Text size="4" weight="bold">{row.count}</Text>
              <Text size="1" color="gray"> чел</Text>
            </Box>
          ))}
        </Flex>
      </Box>

      <Text size="2" color="gray" mt="4">
        Rebalance Teams откроет модальное окно с drag-drop сотрудников между проектами и подсветкой skill match.
      </Text>
    </Box>
  )
}
