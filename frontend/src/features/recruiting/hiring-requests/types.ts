export type HiringRequestStatus = 'planned' | 'in_process' | 'closed' | 'cancelled'
export type HiringRequestPriority = 'high' | 'medium' | 'low'
export type HiringRequestSlaStatus = 'normal' | 'risk' | 'overdue' | 'on_time'

export interface HiringRequestCandidate {
  name: string
  id: string
}

export interface HiringRequest {
  id: number
  title: string
  grade?: string
  project?: string | null
  recruiter: string
  recruiterDays: number
  status: HiringRequestStatus
  statusDate?: string
  startDate: string
  endDate: string
  isOverdue: boolean
  factDays: number
  slaDays: number
  slaStatus: HiringRequestSlaStatus
  t2hDays?: number
  t2hSlaDays?: number
  candidate?: HiringRequestCandidate
  department?: string
  priority: HiringRequestPriority
  technologies: string[]
  candidates: number
  date: string
  hasWarning: boolean
}

