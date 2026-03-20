/**
 * ProjectsPage — список проектов компании (HR-контекст).
 * Без AppLayout (обёртка в App.tsx).
 */

import { Box, Flex, Text, Card, Button } from '@radix-ui/themes'
import { DashboardIcon, PersonIcon, PlusIcon } from '@radix-ui/react-icons'
import { useRouter } from '@/router-adapter'
import { mockProjects } from '@/app/pages/projectsMocks'
import styles from './styles/ProjectsPage.module.css'

export function ProjectsPage() {
  const router = useRouter()

  return (
    <Box className={styles.container}>
      <Flex justify="between" align="center" mb="4">
        <Flex align="center" gap="2">
          <DashboardIcon width={24} height={24} />
          <Text size="6" weight="bold" className={styles.pageTitle}>
            Список проектов
          </Text>
        </Flex>
        <Button variant="soft">
          <PlusIcon width={16} height={16} />
          Добавить проект
        </Button>
      </Flex>

      <Text size="2" color="gray" mb="4">
        Проекты компании с привязкой к вакансиям, командам и специализациям. HR-метрики и аллокация — в подразделах «Команды» и «Ресурсы и аллокация».
      </Text>

      <Box className={styles.cardGrid}>
        {mockProjects.map((p) => (
          <Card
            key={p.id}
            className={styles.projectCard}
            onClick={() => router.push(`/projects/${p.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.cardHeader}>
              <Text size="4" weight="bold">
                {p.name}
              </Text>
              <Text size="1" color="gray">
                {p.status === 'active' ? 'Активен' : 'Пилот'}
              </Text>
            </div>
            <Text size="2" color="gray">
              {p.description}
            </Text>
            <div className={styles.cardStats}>
              <span>Вакансий: {p.vacancyCount}</span>
              <span>Сотрудников: {p.employeeCount}</span>
              <span>{p.specialization}</span>
            </div>
          </Card>
        ))}
      </Box>

      <Flex gap="3" mt="6">
        <Button variant="soft" onClick={() => router.push('/projects/teams')}>
          <PersonIcon width={16} height={16} />
          Команды по проектам
        </Button>
        <Button variant="soft" onClick={() => router.push('/projects/resources')}>
          Ресурсы и аллокация
        </Button>
      </Flex>
    </Box>
  )
}
