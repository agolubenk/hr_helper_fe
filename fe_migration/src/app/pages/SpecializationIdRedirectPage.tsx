import { useEffect } from 'react'
import { useRouter, useParams } from '@/router-adapter'

export function SpecializationIdRedirectPage() {
  const router = useRouter()
  const { id } = useParams()
  useEffect(() => {
    if (id) router.replace(`/specializations/${id}/info`)
  }, [id, router])
  return null
}
