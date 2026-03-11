export type InviteStatus = 'pending' | 'sent' | 'completed' | 'cancelled'

export interface Invite {
  id: number
  candidate_name: string
  candidate_email?: string
  candidate_url?: string
  vacancy_title?: string
  interview_datetime: string
  interview_datetime_formatted?: string
  status: InviteStatus
  status_display?: string
  interview_format?: 'online' | 'office'
  google_meet_url?: string
  google_drive_file_url?: string
  created_at: string
  updated_at: string
}

