import { Box, Flex, Text, Button, Card, Badge } from '@radix-ui/themes'
import { useParams, Link } from '@/router-adapter'

/**
 * Страница просмотра результата оценки кандидата.
 */
export function AtsAssessmentViewPage() {
  const params = useParams() as {
    vacancyId?: string
    candidateId?: string
    assessmentId?: string
  }
  const vid = params.vacancyId ?? '1'
  const cid = params.candidateId ?? '1'
  const aid = params.assessmentId ?? '1'
  const backHref = `/ats/vacancy/${vid}/candidate/${cid}`
  const editHref = `/ats/vacancy/${vid}/candidate/${cid}/assessment/${aid}/edit`

  return (
    <Box p="4">
      <Flex gap="3" mb="4" align="center">
        <Button variant="soft" size="1" asChild>
          <Link href={backHref}>← К карточке кандидата</Link>
        </Button>
        <Button variant="soft" size="1" asChild>
          <Link href={editHref}>Редактировать</Link>
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
