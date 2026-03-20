import { useEffect } from 'react'
import { useRouter } from '@/router-adapter'
import { ATS_CANDIDATES, getVacancyIdByTitle } from '@/app/pages/atsMocks'

export function AtsIndexPage() {
  const router = useRouter()

  useEffect(() => {
    const first = ATS_CANDIDATES[0]
    if (!first) return
    router.replace(`/ats/vacancy/${getVacancyIdByTitle(first.vacancy)}/candidate/${first.id}`)
  }, [router])

  return null
}
