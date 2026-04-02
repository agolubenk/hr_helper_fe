import { describe, expect, it } from 'vitest'
import { parseMeetRoomHash, serializeMeetRoomHash } from './meetRoomHash'

describe('meetRoomHash', () => {
  const sample: { taskId: string; meetingAt: string; organizerId: string } = {
    taskId: 'task_fe_int_042',
    meetingAt: '2026-03-30T14:00:00+03:00',
    organizerId: 'p1',
  }

  it('round-trips via URLSearchParams in hash', () => {
    const s = serializeMeetRoomHash(sample)
    expect(parseMeetRoomHash(`#${s}`)).toEqual(sample)
    expect(parseMeetRoomHash(s)).toEqual(sample)
  })

  it('returns null for empty or incomplete hash', () => {
    expect(parseMeetRoomHash('')).toBeNull()
    expect(parseMeetRoomHash('#task=x')).toBeNull()
  })
})
