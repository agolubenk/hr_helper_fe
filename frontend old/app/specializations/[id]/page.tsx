/**
 * SpecializationIdRedirect (specializations/[id]/page.tsx) — Редирект на вклад «Основная информация»
 * При открытии /specializations/[id] перенаправляет на /specializations/[id]/info.
 */

'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

/** Выполняет редирект на /specializations/[id]/info. */
export default function SpecializationIdRedirect() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  useEffect(() => {
    if (id) router.replace(`/specializations/${id}/info`)
  }, [id, router])

  return null
}
