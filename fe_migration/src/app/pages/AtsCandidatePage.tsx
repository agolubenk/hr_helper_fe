import { Box, Button, Card, Flex, Text } from '@radix-ui/themes'
import { useParams, useRouter } from '@/router-adapter'
import { ATS_ASSESSMENTS_BY_CANDIDATE, ATS_CANDIDATES, ATS_VACANCIES } from '@/app/pages/atsMocks'
import styles from './styles/AtsPage.module.css'

function statusLabel(status: string): string {
  if (status === 'new') return 'Новый'
  if (status === 'in_progress') return 'В работе'
  if (status === 'offer') return 'Оффер'
  if (status === 'rejected') return 'Отказ'
  return status
}

export function AtsCandidatePage() {
  const params = useParams() as { vacancyId?: string; candidateId?: string }
  const router = useRouter()
  const vacancyId = params.vacancyId ?? '1'
  const candidateId = params.candidateId ?? ATS_CANDIDATES[0]?.id ?? '1'

  const filteredCandidates = ATS_CANDIDATES.filter((c) => c.vacancy === (ATS_VACANCIES.find((v) => v.id === vacancyId)?.title ?? ATS_VACANCIES[0].title))
  const candidate = filteredCandidates.find((c) => c.id === candidateId) ?? filteredCandidates[0] ?? ATS_CANDIDATES[0]
  const assessments = ATS_ASSESSMENTS_BY_CANDIDATE[candidate.id] ?? []

  return (
    <Box className={styles.container}>
      <Flex justify="between" align="center" mb="4">
        <Text size="6" weight="bold">ATS</Text>
        <Button
          onClick={() =>
            router.push(`/ats/vacancy/${vacancyId}/candidate/${candidate.id}/assessment/new`)
          }
        >
          Новая оценка
        </Button>
      </Flex>

      <Box className={styles.grid}>
        <Card>
          <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
            Кандидаты по вакансии
          </Text>
          <Flex direction="column" gap="2">
            {filteredCandidates.map((c) => {
              const active = c.id === candidate.id
              return (
                <Box
                  key={c.id}
                  className={`${styles.listItem} ${active ? styles.listItemActive : ''}`}
                  onClick={() => router.push(`/ats/vacancy/${vacancyId}/candidate/${c.id}`)}
                >
                  <Text weight="medium">{c.name}</Text>
                  <Text size="1" color="gray" style={{ display: 'block' }}>
                    {c.stage} - {statusLabel(c.status)}
                  </Text>
                </Box>
              )
            })}
          </Flex>
        </Card>

        <Card>
          <Text size="4" weight="bold" mb="2" style={{ display: 'block' }}>
            {candidate.name}
          </Text>
          <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
            Вакансия: {candidate.vacancy} · Источник: {candidate.source}
          </Text>

          <Text size="3" weight="bold" mb="2" style={{ display: 'block' }}>
            Оценки
          </Text>
          {assessments.length === 0 ? (
            <Text size="2" color="gray">Пока нет оценок.</Text>
          ) : (
            <Flex direction="column" gap="2">
              {assessments.map((a) => (
                <Card key={a.id} size="1">
                  <Flex justify="between" align="center" gap="2" wrap="wrap">
                    <Box>
                      <Text weight="medium">{a.summary}</Text>
                      <Text size="1" color="gray" style={{ display: 'block' }}>
                        {a.date} · {a.interviewer}
                      </Text>
                    </Box>
                    <Flex gap="2">
                      <Button size="1" variant="soft" onClick={() => router.push(`/ats/vacancy/${vacancyId}/candidate/${candidate.id}/assessment/${a.id}`)}>
                        Просмотр
                      </Button>
                      <Button size="1" variant="soft" onClick={() => router.push(`/ats/vacancy/${vacancyId}/candidate/${candidate.id}/assessment/${a.id}/edit`)}>
                        Редактировать
                      </Button>
                    </Flex>
                  </Flex>
                </Card>
              ))}
            </Flex>
          )}
        </Card>
      </Box>
    </Box>
  )
}
