import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { MOCK_CANDIDATES_BY_VACANCY, MOCK_VACANCIES } from './mocks'

/**
 * Главная страница ATS | Talent Pool по адресу /recr-chat.
 * Редирект на первую вакансию и первого кандидата для единого входа в интерфейс.
 */
export function RecrChatIndexPage() {
  const navigate = useNavigate()
  useEffect(() => {
    const firstVacancy = MOCK_VACANCIES[0]
    if (!firstVacancy) return
    const candidates = MOCK_CANDIDATES_BY_VACANCY[firstVacancy.id] ?? []
    const firstCandidate = candidates[0]
    if (firstCandidate) {
      navigate({
        to: '/recr-chat/vacancy/$vacancyId/candidate/$candidateId',
        params: { vacancyId: firstVacancy.id, candidateId: firstCandidate.id },
        replace: true,
      })
    }
  }, [navigate])
  return null
}
