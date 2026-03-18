/**
 * Редирект /vacancies/:id/edit → /vacancies?edit=:id (открытие модалки редактирования на странице вакансий).
 */

import { useEffect } from 'react'
import { useParams, useRouter } from '@/router-adapter'

export function VacancyEditRedirect() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string | undefined

  useEffect(() => {
    if (id) {
      router.replace(`/vacancies?edit=${encodeURIComponent(id)}`)
    } else {
      router.replace('/vacancies')
    }
  }, [router, id])

  return null
}
