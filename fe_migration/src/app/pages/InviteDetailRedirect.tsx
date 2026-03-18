/**
 * Редирект /invites/:id → /invites?view=:id (список инвайтов с открытым просмотром по query).
 */

import { useParams, Navigate } from 'react-router-dom'

export function InviteDetailRedirect() {
  const params = useParams()
  const id = params?.id

  if (!id) {
    return <Navigate to="/invites" replace />
  }
  return <Navigate to={`/invites?view=${encodeURIComponent(id)}`} replace />
}
