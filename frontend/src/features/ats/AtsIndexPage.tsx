import { useEffect } from 'react'
import { useNavigate } from '@/router-adapter'
import { MOCK_CANDIDATES, getVacancyIdByTitle } from './mocks'

/**
 * /ats — редирект на первую вакансию и первого кандидата.
 */
export function AtsIndexPage() {
  const navigate = useNavigate()
  useEffect(() => {
    const first = MOCK_CANDIDATES[0]
    if (!first) return
    const vacancyId = getVacancyIdByTitle(first.vacancy)
    navigate(`/ats/vacancy/${vacancyId}/candidate/${first.id}`, { replace: true })
  }, [navigate])
  return null
}
