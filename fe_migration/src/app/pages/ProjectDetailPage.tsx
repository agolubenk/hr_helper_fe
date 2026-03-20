/**
 * Карточка проекта по id. Без AppLayout (обёртка в App.tsx).
 */

import { Box, Text, Button } from '@radix-ui/themes'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useRouter, useParams } from '@/router-adapter'
import { mockProjectDetails } from '@/app/pages/projectsMocks'
import styles from './styles/ProjectsPage.module.css'

export function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : ''
  const project = id ? mockProjectDetails[id] : undefined

  if (!project) {
    return (
      <Box className={styles.container}>
        <Text size="2" color="gray">
          Проект не найден.
        </Text>
        <Button variant="soft" mt="3" onClick={() => router.push('/projects')}>
          <ArrowLeftIcon width={16} height={16} />
          К списку проектов
        </Button>
      </Box>
    )
  }

  return (
    <Box className={styles.container}>
      <Button variant="ghost" mb="4" onClick={() => router.push('/projects')}>
        <ArrowLeftIcon width={16} height={16} />
        К списку проектов
      </Button>
      <Text size="6" weight="bold" mb="2">
        {project.name}
      </Text>
      <Text size="2" color="gray" mb="4">
        {project.description}
      </Text>
      <Text size="2" color="gray">
        Детальная страница проекта (вакансии, команда, аллокация) — в разработке.
      </Text>
    </Box>
  )
}
