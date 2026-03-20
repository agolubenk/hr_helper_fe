import { Badge, Box, Button, Card, Flex, Text } from '@radix-ui/themes'
import { useParams, useRouter } from '@/router-adapter'

export function AtsAssessmentViewPage() {
  const params = useParams() as { vacancyId?: string; candidateId?: string; assessmentId?: string }
  const router = useRouter()
  const vacancyId = params.vacancyId ?? '1'
  const candidateId = params.candidateId ?? '1'
  const assessmentId = params.assessmentId ?? '1'

  return (
    <Box style={{ padding: 16 }}>
      <Flex gap="2" mb="4">
        <Button variant="soft" size="1" onClick={() => router.push(`/ats/vacancy/${vacancyId}/candidate/${candidateId}`)}>
          ← К карточке кандидата
        </Button>
        <Button variant="soft" size="1" onClick={() => router.push(`/ats/vacancy/${vacancyId}/candidate/${candidateId}/assessment/${assessmentId}/edit`)}>
          Редактировать
        </Button>
      </Flex>
      <Card>
        <Text size="4" weight="bold">Просмотр результата оценки</Text>
        <Flex gap="2" mt="3">
          <Badge>Вакансия: {vacancyId}</Badge>
          <Badge>Кандидат: {candidateId}</Badge>
          <Badge>Оценка: {assessmentId}</Badge>
        </Flex>
      </Card>
    </Box>
  )
}
