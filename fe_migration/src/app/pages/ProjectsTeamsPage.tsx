/**
 * Команды по проектам (HR: состав, роли, связь с вакансиями).
 * Без AppLayout (обёртка в App.tsx).
 */

import { Box, Flex, Text, Table, Badge } from '@radix-ui/themes'
import { PersonIcon } from '@radix-ui/react-icons'
import { useRouter } from '@/router-adapter'
import { mockProjectTeams } from '@/app/pages/projectsMocks'
import styles from './styles/ProjectsPage.module.css'

export function ProjectsTeamsPage() {
  const router = useRouter()

  return (
    <Box className={styles.container}>
      <Flex align="center" gap="2" mb="4">
        <PersonIcon width={24} height={24} />
        <Text size="6" weight="bold">
          Команды по проектам
        </Text>
      </Flex>

      <Text size="2" color="gray" mb="4">
        Состав команд, тимлиды и открытые роли по каждому проекту. Связь с вакансиями и специализациями.
      </Text>

      <Box className={styles.tableWrap}>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Проект</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Тимлид</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>В команде</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Открытые роли</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Специализации</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {mockProjectTeams.map((t) => (
              <Table.Row
                key={t.projectId}
                style={{ cursor: 'pointer' }}
                onClick={() => router.push(`/projects/${t.projectId}`)}
              >
                <Table.Cell>
                  <Text weight="medium">{t.projectName}</Text>
                </Table.Cell>
                <Table.Cell>{t.teamLead}</Table.Cell>
                <Table.Cell>{t.members}</Table.Cell>
                <Table.Cell>
                  <Badge color={t.openRoles > 0 ? 'orange' : 'green'}>{t.openRoles}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <Text size="2" color="gray">
                    {t.specialization}
                  </Text>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  )
}
