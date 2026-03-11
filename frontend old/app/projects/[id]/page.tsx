'use client'

import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useRouter, useParams } from 'next/navigation'
import styles from '../projects.module.css'

const MOCK_PROJECTS: Record<string, { name: string; description: string }> = {
  alpha: { name: 'Alpha', description: 'Основной продукт, веб и мобильные приложения.' },
  beta: { name: 'Beta', description: 'Внутренние сервисы и инфраструктура.' },
  gamma: { name: 'Gamma', description: 'Экспериментальное направление.' },
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const project = id ? MOCK_PROJECTS[id] : null

  if (!project) {
    return (
      <AppLayout pageTitle="Проект">
        <Box className={styles.container}>
          <Text size="2" color="gray">Проект не найден.</Text>
          <Button variant="soft" mt="3" onClick={() => router.push('/projects')}>
            <ArrowLeftIcon width={16} height={16} />
            К списку проектов
          </Button>
        </Box>
      </AppLayout>
    )
  }

  return (
    <AppLayout pageTitle={project.name}>
      <Box className={styles.container}>
        <Button variant="ghost" mb="4" onClick={() => router.push('/projects')}>
          <ArrowLeftIcon width={16} height={16} />
          К списку проектов
        </Button>
        <Text size="6" weight="bold" mb="2">{project.name}</Text>
        <Text size="2" color="gray" mb="4">{project.description}</Text>
        <Text size="2" color="gray">Детальная страница проекта (вакансии, команда, аллокация) — в разработке.</Text>
      </Box>
    </AppLayout>
  )
}
