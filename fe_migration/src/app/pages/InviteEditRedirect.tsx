/**
 * Редирект /invites/:id/edit → /invites?edit=:id (список инвайтов с открытым редактированием по query).
 */

import { useParams, Navigate } from 'react-router-dom'

export function InviteEditRedirect() {
  const params = useParams()
  const id = params?.id

  if (!id) {
    return <Navigate to="/invites" replace />
  }
  return <Navigate to={`/invites?edit=${encodeURIComponent(id)}`} replace />
}
