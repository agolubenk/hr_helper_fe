/** Аудитория: сотрудники компании или внешние гости (кандидаты, партнёры). */
export type MeetAudience = 'internal' | 'external'

export interface MeetParticipant {
  id: string
  name: string
  title?: string
  audience: MeetAudience
  isMuted: boolean
  isVideoOn: boolean
  isHost?: boolean
  /** Активный говорящий (подсветка в эфире и в списке). */
  isActiveSpeaker?: boolean
  isScreenSharing?: boolean
}

export interface MeetChatMessage {
  id: string
  author: string
  audience: MeetAudience
  text: string
  timeLabel: string
}

export interface MeetMeetingComment {
  id: string
  author: string
  audience: MeetAudience
  text: string
  timeLabel: string
}

export interface MeetRoomMock {
  id: string
  title: string
  startedAtLabel: string
  /** ID задачи для hash `#task=…&at=…&org=…`. */
  linkedTaskId: string
  /** ISO-8601 — дата/время встречи в ссылке. */
  meetingAtISO: string
  /** id участника-организатора. */
  organizerId: string
  /** id текущего говорящего (мок). */
  activeSpeakerId: string
  participants: MeetParticipant[]
  chatInternal: MeetChatMessage[]
  chatExternal: MeetChatMessage[]
  commentsInternal: MeetMeetingComment[]
  commentsExternal: MeetMeetingComment[]
}
