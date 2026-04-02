import type { CompanyUser } from './types'

/** Справочник групп для назначения пользователю (в перспективе — из API настроек компании). */
export const AVAILABLE_COMPANY_USER_GROUPS: string[] = ['Администраторы', 'Рекрутеры', 'Менеджеры']

export const mockCompanyUsers: CompanyUser[] = [
  {
    id: '1',
    email: 'admin@example.com',
    first_name: 'Иван',
    last_name: 'Иванов',
    position: 'Администратор',
    groups: ['Администраторы'],
    is_active: true,
    last_login: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: '2',
    email: 'recruiter1@example.com',
    first_name: 'Мария',
    last_name: 'Петрова',
    position: 'Рекрутер',
    groups: ['Рекрутеры'],
    is_active: true,
    last_login: new Date(Date.now() - 7200000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: '3',
    email: 'manager1@example.com',
    first_name: 'Алексей',
    last_name: 'Сидоров',
    position: 'Менеджер',
    groups: ['Менеджеры'],
    is_active: true,
    last_login: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: '4',
    email: 'recruiter2@example.com',
    first_name: 'Елена',
    last_name: 'Козлова',
    position: 'Старший рекрутер',
    groups: ['Рекрутеры'],
    is_active: false,
    last_login: new Date(Date.now() - 86400000 * 7).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
]

export const fetchCompanyUsersMock = (): Promise<CompanyUser[]> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(mockCompanyUsers.map((u) => ({ ...u }))), 400)
  })
