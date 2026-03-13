import { Box, Flex, Text, Button, Card, Badge } from '@radix-ui/themes'
import { Link, useParams } from '@tanstack/react-router'

/**
 * Страница просмотра результата оценки кандидата.
 * Маршрут: /ats/vacancy/$vacancyId/candidate/$candidateId/assessment/$assessmentId
 */
export function AtsAssessmentViewPage() {
  const { vacancyId, candidateId, assessmentId } = useParams({ strict: false }) as {
    vacancyId?: string
    candidateId?: string
    assessmentId?: string
  }
  const vid = vacancyId ?? '1'
  const cid = candidateId ?? '1'
  const aid = assessmentId ?? '1'
  return (
    <Box p="4">
      <Flex gap="3" mb="4" align="center">
        <Button variant="soft" size="1" asChild>
          <Link
            to="/ats/vacancy/$vacancyId/candidate/$candidateId"
            params={{ vacancyId: vid, candidateId: cid }}
          >
            ← К карточке кандидата
          </Link>
        </Button>
        <Button variant="soft" size="1" asChild>
          <Link
            to="/ats/vacancy/$vacancyId/candidate/$candidateId/assessment/$assessmentId/edit"
            params={{ vacancyId: vid, candidateId: cid, assessmentId: aid }}
          >
            Редактировать
          </Link>
        </Button>
      </Flex>
      <Card size="2">
        <Flex direction="column" gap="4">
          <Text size="4" weight="bold">
            Просмотр результата оценки
          </Text>
          <Flex gap="2" wrap="wrap">
            <Badge size="2">Вакансия: {vid}</Badge>
            <Badge size="2">Кандидат: {cid}</Badge>
            <Badge size="2">Оценка: {aid}</Badge>
          </Flex>
          <Text size="2" color="gray">
            Здесь отображаются сохранённые баллы по компетенциям и прикреплённые скриншоты (после интеграции с API).
          </Text>
        </Flex>
      </Card>
    </Box>
  )
}
