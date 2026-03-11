import { Box, Flex, Text, Button, Card } from '@radix-ui/themes'
import { Link, useParams } from '@tanstack/react-router'

/**
 * Страница редактирования оценки кандидата.
 * Маршрут: /recr-chat/vacancy/$vacancyId/candidate/$candidateId/assessment/$assessmentId/edit
 */
export function RecrChatAssessmentEditPage() {
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
            to="/recr-chat/vacancy/$vacancyId/candidate/$candidateId"
            params={{ vacancyId: vid, candidateId: cid }}
          >
            ← К карточке кандидата
          </Link>
        </Button>
        <Button variant="soft" size="1" asChild>
          <Link
            to="/recr-chat/vacancy/$vacancyId/candidate/$candidateId/assessment/$assessmentId"
            params={{ vacancyId: vid, candidateId: cid, assessmentId: aid }}
          >
            Просмотр
          </Link>
        </Button>
      </Flex>
      <Card size="2">
        <Flex direction="column" gap="4">
          <Text size="4" weight="bold">
            Редактирование оценки
          </Text>
          <Text size="2" color="gray">
            Вакансия: {vid}, Кандидат: {cid}, Оценка: {aid}. Форма редактирования баллов и скриншотов — в следующих итерациях.
          </Text>
        </Flex>
      </Card>
    </Box>
  )
}
