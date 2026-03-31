/** Параметры комнаты в hash-фрагменте URL: задача, время встречи, организатор. */
export interface MeetRoomHashPayload {
  /** ID связанной задачи (например из /tasks). */
  taskId: string
  /** ISO-8601 дата/время начала встречи. */
  meetingAt: string
  /** ID участника-организатора (как в моке участников). */
  organizerId: string
}

export function serializeMeetRoomHash(payload: MeetRoomHashPayload): string {
  const params = new URLSearchParams()
  params.set('task', payload.taskId)
  params.set('at', payload.meetingAt)
  params.set('org', payload.organizerId)
  return params.toString()
}

export function parseMeetRoomHash(hash: string): MeetRoomHashPayload | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  if (!raw.trim()) return null
  const params = new URLSearchParams(raw)
  const taskId = params.get('task')
  const meetingAt = params.get('at')
  const organizerId = params.get('org')
  if (!taskId || !meetingAt || !organizerId) return null
  return { taskId, meetingAt, organizerId }
}
