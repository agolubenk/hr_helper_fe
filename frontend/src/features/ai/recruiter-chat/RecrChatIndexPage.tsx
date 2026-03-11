import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { MOCK_CANDIDATES, getVacancyIdByTitle } from './mocks'

/**
 * /recr-chat — редирект на первую вакансию и первого кандидата (как в old).
 */
export function RecrChatIndexPage() {
  const navigate = useNavigate()
  useEffect(() => {
    const first = MOCK_CANDIDATES[0]
    if (!first) return
    const vacancyId = getVacancyIdByTitle(first.vacancy)
    navigate({
      to: '/recr-chat/vacancy/$vacancyId/candidate/$candidateId',
      params: { vacancyId, candidateId: first.id },
      replace: true,
    })
  }, [navigate])
  return null
}
