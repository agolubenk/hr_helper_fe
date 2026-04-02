import { Box, Flex, Text, Button, Card } from '@radix-ui/themes'
import { useParams, Link } from '@/router-adapter'

/**
 * Страница редактирования оценки кандидата.
 */
export function AtsAssessmentEditPage() {
  const params = useParams() as {
    vacancyId?: string
    candidateId?: string
    assessmentId?: string
  }
  const vid = params.vacancyId ?? '1'
  const cid = params.candidateId ?? '1'
  const aid = params.assessmentId ?? '1'
  const backHref = `/ats/vacancy/${vid}/candidate/${cid}`
  const viewHref = `/ats/vacancy/${vid}/candidate/${cid}/assessment/${aid}`

  return (
    <Box p="4">
      <Flex gap="3" mb="4" align="center">
        <Button variant="soft" size="1" asChild>
          <Link href={backHref}>← К карточке кандидата</Link>
        </Button>
        <Button variant="soft" size="1" asChild>
          <Link href={viewHref}>Просмотр</Link>
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
