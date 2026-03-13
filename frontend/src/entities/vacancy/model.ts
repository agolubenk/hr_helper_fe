export type VacancyStatus = 'active' | 'inactive' | 'draft' | 'archived'

export type VacancyPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface VacancySalaryRange {
  min: number
  max: number
  currency: string
}

export interface VacancyLocation {
  id: string
  name: string
  isRemote?: boolean
}

export interface VacancyRecruiter {
  id: string
  name: string
  avatar?: string
}

export interface VacancyStage {
  id: string
  name: string
  order: number
  candidatesCount: number
}

export interface Vacancy {
  id: number
  title: string
  status: VacancyStatus
  priority: VacancyPriority
  recruiter: VacancyRecruiter
  locations: VacancyLocation[]
  salaryRange?: VacancySalaryRange
  stages: VacancyStage[]
  interviewersCount: number
  candidatesCount: number
  createdAt: string
  updatedAt: string
  closedAt?: string
  deadline?: string
  hasWarning: boolean
  warningText?: string
  departmentId?: string
  departmentName?: string
  description?: string
  requirements?: string
}

export interface VacancyListItem {
  id: number
  title: string
  status: VacancyStatus
  recruiterName: string
  locations: string[]
  interviewersCount: number
  date: string | null
  hasWarning: boolean
  warningText?: string
}

export interface VacancyFilters {
  status?: VacancyStatus[]
visibleСurrencies?: string[]
  recruiterId?: string
  departmentId?: string
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface VacancyCreatePayload {
  title: string
  status: VacancyStatus
  priority: VacancyPriority
  recruiterId: string
  locationIds: string[]
  salaryRange?: VacancySalaryRange
  departmentId?: string
  description?: string
  requirements?: string
  deadline?: string
}

export interface VacancyUpdatePayload extends Partial<VacancyCreatePayload> {
  id: number
}
