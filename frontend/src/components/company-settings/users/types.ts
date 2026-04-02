import type { AccessRights } from '@/components/company-settings/UserAccessModal'

/** Учётная запись пользователя компании (настройки → пользователи). Не путать с сущностью «группа пользователей». */
export interface CompanyUser {
  id: string
  email: string
  first_name: string
  last_name: string
  position: string
  groups: string[]
  is_active: boolean
  last_login: string | null
  created_at: string
  access?: AccessRights
}
