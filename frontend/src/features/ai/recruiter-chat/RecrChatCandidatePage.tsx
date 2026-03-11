import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { useParams, useNavigate, Link } from '@tanstack/react-router'
import { PersonIcon, FileTextIcon } from '@radix-ui/react-icons'
import { getCandidatesForVacancy, MOCK_VACANCIES } from './mocks'
import styles from './RecrChatPage.module.css'

export function RecrChatCandidatePage() {
  const { vacancyId, candidateId } = useParams({ strict: false }) as {
    vacancyId?: string
    candidateId?: string
  }
  const navigate = useNavigate()
  const vid = vacancyId ?? '1'
  const cid = candidateId ?? '1'
  const candidates = getCandidatesForVacancy(vid)
  const selected = candidates.find((c) => c.id === cid) ?? candidates[0]

  return (
    <Box className={styles.container}>
      <Box className={styles.leftColumn}>
        <Flex gap="2" className={styles.tabSwitcher}>
          <Button variant="soft" size="1" asChild>
            <Link to="/recr-chat">
              <FileTextIcon />
              Кандидаты
            </Link>
          </Button>
          <Button variant="soft" size="1" disabled>
            Диалоги
          </Button>
        </Flex>
        <Box className={styles.candidatesList}>
          {candidates.map((c) => (
            <Box
              key={c.id}
              className={`${styles.candidateItem} ${c.id === cid ? styles.selected : ''}`}
              onClick={() =>
                navigate({
                  to: '/recr-chat/vacancy/$vacancyId/candidate/$candidateId',
                  params: { vacancyId: vid, candidateId: c.id },
                })
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate({
                    to: '/recr-chat/vacancy/$vacancyId/candidate/$candidateId',
                    params: { vacancyId: vid, candidateId: c.id },
                  })
                }
              }}
            >
              <Text size="2" weight="medium" style={{ display: 'block' }}>
                {c.name}
              </Text>
              {c.position && (
                <Text size="1" color="gray" style={{ display: 'block' }}>
                  {c.position} · {c.stage ?? '—'}
                </Text>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      <Box className={styles.rightColumn}>
        <Box className={styles.candidateCard}>
          <Flex align="center" gap="3" className={styles.cardSection}>
            <Box
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--accent-9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <PersonIcon width={24} height={24} />
            </Box>
            <Box>
              <Text size="4" weight="bold" style={{ display: 'block' }}>
                {selected?.name ?? 'Кандидат'}
              </Text>
              <Text size="2" color="gray">
                {selected?.position ?? '—'} · Вакансия: {MOCK_VACANCIES.find((v) => v.id === vid)?.title ?? vid}
              </Text>
            </Box>
          </Flex>
          <Box className={styles.cardSection}>
            <Text size="2" weight="bold" style={{ display: 'block' }}>
              Основная информация
            </Text>
            <Text size="2" color="gray">
              Этап: {selected?.stage ?? '—'}. Полная карточка и чат — в следующих итерациях.
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
