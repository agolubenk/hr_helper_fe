/**
 * RecrChatVacancyCandidatePage (ats/.../candidate/[candidateId]/page.tsx) — Чат рекрутера с кандидатом по вакансии
 *
 * Назначение:
 * - Отображение чата рекрутера с предвыбранными vacancyId и candidateId из URL
 *
 * Функциональность:
 * - Рендер общего компонента RecrChatPage с initialVacancyId и initialCandidateId из params
 *
 * Маршрут: /ats/vacancy/[vacancyId]/candidate/[candidateId]
 */

'use client'

import { useParams } from 'next/navigation'
import RecrChatPage from '../../../../page'

/**
 * RecrChatVacancyCandidatePage — обёртка над RecrChatPage с параметрами из URL.
 */
export default function RecrChatVacancyCandidatePage() {
  const params = useParams()
  const vacancyId = (params?.vacancyId as string) ?? ''
  const candidateId = (params?.candidateId as string) ?? ''

  return (
    <RecrChatPage
      initialVacancyId={vacancyId}
      initialCandidateId={candidateId}
    />
  )
}
