/**
 * ProjectTeamsPage — команды по проектам (HR: состав, роли, связь с вакансиями).
 */

'use client'

import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, Table, Badge } from '@radix-ui/themes'
import { PersonIcon } from '@radix-ui/react-icons'
import { useRouter } from 'next/navigation'
import styles from '../projects.module.css'

const MOCK_TEAMS = [
  { projectId: 'alpha', projectName: 'Alpha', teamLead: 'Иван Петров', members: 24, openRoles: 8, specialization: 'Frontend, Backend' },
  { projectId: 'beta', projectName: 'Beta', teamLead: 'Мария Сидорова', members: 15, openRoles: 4, specialization: 'Backend, DevOps' },
  { projectId: 'gamma', projectName: 'Gamma', teamLead: 'Алексей Козлов', members: 6, openRoles: 2, specialization: 'Frontend' },
]

export default function ProjectTeamsPage() {
  const router = useRouter()

  return (
    <AppLayout pageTitle="Команды проектов">
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
              {MOCK_TEAMS.map((t) => (
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
                    <Text size="2" color="gray">{t.specialization}</Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>
    </AppLayout>
  )
}
