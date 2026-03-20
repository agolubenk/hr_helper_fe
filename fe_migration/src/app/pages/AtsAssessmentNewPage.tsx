import { Box, Button, Card, Flex, Text } from '@radix-ui/themes'
import { useParams, useRouter } from '@/router-adapter'

export function AtsAssessmentNewPage() {
  const params = useParams() as { vacancyId?: string; candidateId?: string }
  const router = useRouter()
  const vacancyId = params.vacancyId ?? '1'
  const candidateId = params.candidateId ?? '1'

  return (
    <Box style={{ padding: 16 }}>
      <Flex mb="4">
        <Button variant="soft" size="1" onClick={() => router.push(`/ats/vacancy/${vacancyId}/candidate/${candidateId}`)}>
          ← К карточке кандидата
        </Button>
      </Flex>
      <Card>
        <Text size="4" weight="bold">Новая оценка кандидата</Text>
        <Text size="2" color="gray" mt="2" style={{ display: 'block' }}>
          Вакансия: {vacancyId}, Кандидат: {candidateId}. Форма оценки будет расширяться в следующих этапах.
        </Text>
      </Card>
    </Box>
  )
}
