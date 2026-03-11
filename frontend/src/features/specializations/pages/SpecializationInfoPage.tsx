'use client'

import { Box, Flex, Text, Badge } from '@radix-ui/themes'
import { useParams } from '@tanstack/react-router'
import { useSpecializations } from '../context/SpecializationsContext'
import styles from '../SpecializationsLayout.module.css'

export function SpecializationInfoPage() {
  const { id } = useParams({ strict: false }) as { id?: string }
  const { selectedNode } = useSpecializations()

  if (!id || !selectedNode) {
    return (
      <Box className={styles.noSelection}>
        <Text size="2" color="gray">
          Выберите специализацию слева.
        </Text>
      </Box>
    )
  }

  return (
    <Flex direction="column" gap="3">
      <Text size="5" weight="bold">
        {selectedNode.name}
      </Text>

      <Flex gap="2" wrap="wrap">
        {typeof selectedNode.vacancyCount === 'number' && <Badge color="blue">Вакансий: {selectedNode.vacancyCount}</Badge>}
        {typeof selectedNode.employeeCount === 'number' && <Badge color="green">Сотрудников: {selectedNode.employeeCount}</Badge>}
        {typeof selectedNode.gradeLevels === 'number' && <Badge color="gray">Уровней: {selectedNode.gradeLevels}</Badge>}
        {selectedNode.isCustom && <Badge color="orange">Custom</Badge>}
      </Flex>

      {selectedNode.description && (
        <Text size="2" color="gray" style={{ whiteSpace: 'pre-wrap' }}>
          {selectedNode.description}
        </Text>
      )}

      {selectedNode.techStack && selectedNode.techStack.length > 0 && (
        <Box>
          <Text size="3" weight="bold" mb="2" style={{ display: 'block' }}>
            Tech stack
          </Text>
          <Flex gap="2" wrap="wrap">
            {selectedNode.techStack.map((t) => (
              <Badge key={`${t.name}-${t.priority}`} color={t.priority === 'required' ? 'green' : t.priority === 'nice' ? 'blue' : 'gray'}>
                {t.name}
              </Badge>
            ))}
          </Flex>
        </Box>
      )}
    </Flex>
  )
}

