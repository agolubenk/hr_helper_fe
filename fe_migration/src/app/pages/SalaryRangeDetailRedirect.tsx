/**
 * Редирект /vacancies/salary-ranges/:id → /vacancies/salary-ranges?detail=:id (открытие модалки просмотра вилки).
 */

import { useEffect } from 'react'
import { useParams, useRouter } from '@/router-adapter'

export function SalaryRangeDetailRedirect() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string | undefined

  useEffect(() => {
    if (id) {
      router.replace(`/vacancies/salary-ranges?detail=${encodeURIComponent(id)}`)
    } else {
      router.replace('/vacancies/salary-ranges')
    }
  }, [router, id])

  return null
}
