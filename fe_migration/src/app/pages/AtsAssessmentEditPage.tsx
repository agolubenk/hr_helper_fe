import { Box, Button, Card, Flex, Text } from '@radix-ui/themes'
import { useParams, useRouter } from '@/router-adapter'

export function AtsAssessmentEditPage() {
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
        <Button variant="soft" size="1" onClick={() => router.push(`/ats/vacancy/${vacancyId}/candidate/${candidateId}/assessment/${assessmentId}`)}>
          Просмотр
        </Button>
      </Flex>
      <Card>
        <Text size="4" weight="bold">Редактирование оценки</Text>
        <Text size="2" color="gray" mt="2" style={{ display: 'block' }}>
          Вакансия: {vacancyId}, Кандидат: {candidateId}, Оценка: {assessmentId}.
        </Text>
      </Card>
    </Box>
  )
}
