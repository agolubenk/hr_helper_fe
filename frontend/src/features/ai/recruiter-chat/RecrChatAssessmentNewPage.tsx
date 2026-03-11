import { Box, Flex, Text, Button, Card } from '@radix-ui/themes'
import { Link, useParams } from '@tanstack/react-router'

/**
 * Страница создания новой оценки кандидата.
 * Маршрут: /recr-chat/vacancy/$vacancyId/candidate/$candidateId/assessment/new
 */
export function RecrChatAssessmentNewPage() {
  const { vacancyId, candidateId } = useParams({ strict: false }) as {
    vacancyId?: string
    candidateId?: string
  }
  const vid = vacancyId ?? '1'
  const cid = candidateId ?? '1'
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
      </Flex>
      <Card size="2">
        <Flex direction="column" gap="4">
          <Text size="4" weight="bold">
            Новая оценка кандидата
          </Text>
          <Text size="2" color="gray">
            Вакансия: {vid}, Кандидат: {cid}. Форма ввода баллов по компетенциям и прикрепления скриншотов — в следующих итерациях.
          </Text>
        </Flex>
      </Card>
    </Box>
  )
}
