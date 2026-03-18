/**
 * ViewAssessmentPage (ats/.../assessment/[assessmentId]/page.tsx) — Просмотр результата оценки
 *
 * Назначение: отображение сохранённой оценки кандидата — баллы по компетенциям и прикреплённые скриншоты.
 * Кнопки: «К карточке кандидата», «Редактировать» (переход на edit в пределах окна редактирования).
 *
 * Параметры: vacancyId, candidateId, assessmentId. Данные по assessment_id — после интеграции с API.
 */

'use client'

import { useParams } from 'next/navigation'
import AppLayout from '@/components/AppLayout'
import { Box, Flex, Text, Button, Card, Badge } from '@radix-ui/themes'
import Link from 'next/link'

/** Рендерит карточку результата оценки и ссылки на чат кандидата и редактирование. */
export default function ViewAssessmentPage() {
  const params = useParams()
  const vacancyId = (params?.vacancyId as string) ?? ''
  const candidateId = (params?.candidateId as string) ?? ''
  const assessmentId = (params?.assessmentId as string) ?? ''

  const backUrl = `/ats/vacancy/${vacancyId}/candidate/${candidateId}`

  return (
    <AppLayout pageTitle="Результат оценки">
      <Box p="4">
        <Flex gap="3" mb="4" align="center">
          <Button variant="soft" size="1" asChild>
            <Link href={backUrl}>← К карточке кандидата</Link>
          </Button>
          <Button variant="soft" size="1" asChild>
            <Link href={`${backUrl}/assessment/${assessmentId}/edit`}>Редактировать</Link>
          </Button>
        </Flex>
        <Card size="2">
          <Flex direction="column" gap="4">
            <Text size="4" weight="bold">Просмотр результата оценки</Text>
            <Flex gap="2" wrap="wrap">
              <Badge size="2">Вакансия: {vacancyId}</Badge>
              <Badge size="2">Кандидат: {candidateId}</Badge>
              <Badge size="2">Оценка: {assessmentId}</Badge>
            </Flex>
            <Text size="2" color="gray">
              Здесь отображаются сохранённые баллы по компетенциям и прикреплённые к полям скриншоты (после интеграции с API).
            </Text>
            <Box p="3" style={{ border: '1px dashed var(--gray-a6)', borderRadius: 8 }}>
              <Text size="2" color="gray">
                Список компетенций с баллами и вложениями будет подгружаться по assessment_id.
              </Text>
            </Box>
          </Flex>
        </Card>
      </Box>
    </AppLayout>
  )
}
