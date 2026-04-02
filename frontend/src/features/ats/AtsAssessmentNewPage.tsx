import { Box, Flex, Text, Button, Card } from '@radix-ui/themes'
import { useParams, Link } from '@/router-adapter'

/**
 * Страница создания новой оценки кандидата.
 * Маршрут: /ats/vacancy/:vacancyId/candidate/:candidateId/assessment/new
 */
export function AtsAssessmentNewPage() {
  const params = useParams() as {
    vacancyId?: string
    candidateId?: string
  }
  const vid = params.vacancyId ?? '1'
  const cid = params.candidateId ?? '1'
  const backHref = `/ats/vacancy/${vid}/candidate/${cid}`

  return (
    <Box p="4">
      <Flex gap="3" mb="4" align="center">
        <Button variant="soft" size="1" asChild>
          <Link href={backHref}>← К карточке кандидата</Link>
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
