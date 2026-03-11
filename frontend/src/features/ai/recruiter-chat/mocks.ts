/**
 * Моки recr-chat — в точности как в frontend old (app/recr-chat/page.tsx).
 * Один общий список кандидатов, вакансия у каждого — название (vacancy).
 */

export interface RecrChatVacancy {
  id: string
  name: string
}

/** Как в старом приложении: один список всех кандидатов, vacancy — название вакансии */
export interface RecrChatCandidate {
  id: string
  name: string
  position?: string
  status: string
  statusColor: string
  avatar?: string
  timeAgo?: string
  unread?: number
  /** Источники непрочитанных: telegram, whatsapp, kaggle и т.д. */
  unreadSources?: Record<string, number>
  isViewed?: boolean
  hasUnviewedChanges?: boolean
  vacancy?: string
  applied?: string
  source?: string
  tags?: string[]
  level?: string
  age?: number
  gender?: string
  salaryExpectations?: string
  offer?: string
  location?: string
  email?: string
  phone?: string
  emails?: string[]
  phones?: string[]
  hasDuplicateSuspicion?: boolean
  /** Соцсети: linkedin, telegram, github и т.д. */
  social?: Record<string, string>
}

/** Вакансии для маппинга название → id при навигации (как availableVacancies в old) */
export const AVAILABLE_VACANCIES: RecrChatVacancy[] = [
  { id: '1', name: 'Frontend Senior' },
  { id: '2', name: 'Backend Developer' },
  { id: '3', name: 'Product Designer' },
  { id: '4', name: 'Fullstack Engineer' },
  { id: '5', name: 'Product Manager' },
]

/** Один список всех кандидатов — как mockCandidates в old */
export const MOCK_CANDIDATES: RecrChatCandidate[] = [
  {
    id: '1',
    name: 'John Doe',
    position: 'Senior Developer',
    status: 'Interview',
    statusColor: '#8B5CF6',
    avatar: 'JD',
    timeAgo: '2 days ago',
    unread: 3,
    unreadSources: { telegram: 2, whatsapp: 1 },
    isViewed: true,
    hasUnviewedChanges: false,
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    emails: ['john@example.com'],
    phones: ['+1 (555) 123-4567'],
    location: 'New York, USA',
    hasDuplicateSuspicion: true,
    vacancy: 'Frontend Senior',
    applied: 'Jan 15, 2026',
    source: 'LinkedIn',
    tags: ['React', 'TypeScript', 'Senior'],
    level: 'Senior',
    age: 32,
    gender: 'Мужской',
    salaryExpectations: '150,000 - 200,000 USD',
    offer: '180,000 USD',
    social: { LinkedIn: '/in/johndoe', Telegram: '@johndoe', WhatsApp: '+15551234567' },
  },
  {
    id: '2',
    name: 'Jane Smith',
    position: 'Product Manager',
    status: 'New',
    statusColor: '#2180A0',
    avatar: 'JS',
    timeAgo: '5 hours ago',
    unread: 0,
    unreadSources: {},
    isViewed: true,
    hasUnviewedChanges: false,
    email: 'jane@example.com',
    phone: '+1 (555) 234-5678',
    emails: ['jane@example.com'],
    phones: ['+1 (555) 234-5678'],
    location: 'San Francisco, USA',
    vacancy: 'Product Designer',
    applied: 'Jan 20, 2026',
    source: 'Referral',
    social: { LinkedIn: '/in/janesmith', Telegram: '@janesmith' },
  },
  {
    id: '3',
    name: 'Mike Chen',
    position: 'Designer',
    status: 'Rejected',
    statusColor: '#EF4444',
    avatar: 'MC',
    timeAgo: '1 day ago',
    unread: 0,
    unreadSources: {},
    isViewed: false,
    hasUnviewedChanges: true,
    email: 'mike@example.com',
    phone: '+1 (555) 345-6789',
    emails: ['mike@example.com'],
    phones: ['+1 (555) 345-6789'],
    location: 'Los Angeles, USA',
    vacancy: 'UI Designer',
    applied: 'Jan 18, 2026',
    source: 'Job Board',
    social: { LinkedIn: '/in/mikechen', Behance: 'mikechen' },
  },
  {
    id: '4',
    name: 'Иванов Петр Сергеевич',
    position: 'Backend Developer',
    status: 'Offer',
    statusColor: '#10B981',
    avatar: 'ИП',
    timeAgo: '3 hours ago',
    unread: 1,
    unreadSources: { whatsapp: 1 },
    isViewed: true,
    hasUnviewedChanges: true,
    email: 'ivanov@example.com',
    phone: '+7 (999) 123-4567',
    emails: ['ivanov@example.com'],
    phones: ['+7 (999) 123-4567'],
    location: 'Москва, Россия',
    vacancy: 'Backend Developer',
    applied: 'Jan 22, 2026',
    source: 'HH.ru',
    tags: ['Java', 'Spring', 'PostgreSQL'],
    level: 'Middle',
    age: 28,
    gender: 'Мужской',
    salaryExpectations: '200,000 - 300,000 RUB',
    offer: '250,000 RUB',
    social: { LinkedIn: '/in/ivanov', Telegram: '@ivanov', GitHub: 'ivanov' },
  },
  {
    id: '5',
    name: 'Смирнова Анна Владимировна',
    position: 'Frontend Developer',
    status: 'New',
    statusColor: '#2180A0',
    avatar: 'СА',
    timeAgo: '1 hour ago',
    unread: 12,
    unreadSources: { kaggle: 12 },
    isViewed: true,
    hasUnviewedChanges: false,
    email: 'smirnova@example.com',
    phone: '+7 (999) 234-5678',
    emails: ['smirnova@example.com'],
    phones: ['+7 (999) 234-5678'],
    location: 'Санкт-Петербург, Россия',
    vacancy: 'Frontend Senior',
    applied: 'Jan 23, 2026',
    source: 'LinkedIn',
    tags: ['React', 'TypeScript', 'Vue'],
    level: 'Senior',
    age: 30,
    gender: 'Женский',
    salaryExpectations: '250,000 - 350,000 RUB',
    social: { LinkedIn: '/in/smirnova', Telegram: '@smirnova', GitHub: 'smirnova' },
  },
]

/** Диалоги для вкладки Chat (бейдж непрочитанных) — как mockConversations в old */
export const MOCK_CONVERSATIONS: { id: string; candidateId: string; name: string; unread: number }[] = [
  { id: '1', candidateId: '1', name: 'John Doe', unread: 3 },
  { id: '2', candidateId: '2', name: 'Jane Smith', unread: 0 },
]

/** Для обратной совместимости: вакансии по id (title) */
export const MOCK_VACANCIES = AVAILABLE_VACANCIES.map((v) => ({ id: v.id, title: v.name }))

/** Id вакансии по названию (vacancy у кандидата) — для навигации при выборе кандидата */
export function getVacancyIdByTitle(vacancyTitle: string | undefined): string {
  if (!vacancyTitle) return '1'
  const v = AVAILABLE_VACANCIES.find((x) => x.name === vacancyTitle)
  return v?.id ?? '1'
}

/** Инициалы для аватара — как getInitials в old */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 0) return ''
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
}

export function getCandidateInitials(c: RecrChatCandidate): string {
  return c.avatar ?? getInitials(c.name)
}

/** Количество непрочитанных в диалогах — для бейджа вкладки Chat */
export function getUnreadConversationsCount(): number {
  return MOCK_CONVERSATIONS.filter((c) => c.unread > 0).length
}
