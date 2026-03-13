export type CompanyPlan = 'free' | 'starter' | 'professional' | 'enterprise'

export type CompanyStatus = 'active' | 'suspended' | 'trial'

export interface CompanySettings {
  timezone: string
  locale: string
  dateFormat: string
  currency: string
  workingDays: number[]
  workingHoursStart: string
  workingHoursEnd: string
}

export interface CompanyBranding {
  primaryColor: string
  logoUrl?: string
  faviconUrl?: string
}

export interface CompanyIntegration {
  id: string
  type: 'telegram' | 'slack' | 'email' | 'huntflow' | 'hh' | 'linkedin'
  name: string
  enabled: boolean
  connectedAt?: string
}

export interface Company {
  id: string
  name: string
  legalName?: string
  inn?: string
  status: CompanyStatus
  plan: CompanyPlan
  settings: CompanySettings
  branding: CompanyBranding
  integrations: CompanyIntegration[]
  employeesCount: number
  departmentsCount: number
  vacanciesCount: number
  createdAt: string
  updatedAt: string
  trialEndsAt?: string
}

export interface CompanyListItem {
  id: string
  name: string
  logoUrl?: string
  status: CompanyStatus
  plan: CompanyPlan
  employeesCount: number
}

export interface CompanyUpdatePayload {
  name?: string
  legalName?: string
  inn?: string
  settings?: Partial<CompanySettings>
  branding?: Partial<CompanyBranding>
}
