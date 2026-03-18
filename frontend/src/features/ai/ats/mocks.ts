/**
 * Моки ats — в точности как в frontend old (app/ats/page.tsx).
 * Один общий список кандидатов, вакансия у каждого — название (vacancy).
 */

export interface AtsVacancy {
  id: string
  name: string
}

/** Как в старом приложении: один список всех кандидатов, vacancy — название вакансии */
export interface AtsCandidate {
  id: string
  name: string
  position?: string
  status: string
  statusColor: string
  avatar?: string
  avatarUrl?: string
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
  social?: Record<string, string | string[]>
  /** Рейтинг кандидата (1–5) — как в old */
  rating?: number
}

/** Вакансии для маппинга название → id при навигации (как availableVacancies в old) */
export const AVAILABLE_VACANCIES: AtsVacancy[] = [
  { id: '1', name: 'Frontend Senior' },
  { id: '2', name: 'Backend Developer' },
  { id: '3', name: 'Product Designer' },
  { id: '4', name: 'Fullstack Engineer' },
  { id: '5', name: 'Product Manager' },
]

/** Вопрос с ответом в оценке */
export interface RatingQuestion {
  id: string
  question: string
  answer: string
  score: number
  maxScore: number
  comment?: string
  literatureLinks?: { title: string; url: string }[]
}

/** Рейтинг кандидата по этапу */
export interface CandidateRating {
  id: string
  stage: string
  date: string
  interviewer: string
  score: number
  maxScore: number
  skills: { name: string; score: number }[]
  questions?: RatingQuestion[]
  feedback?: string
  metadata?: {
    duration?: string
    format?: string
    location?: string
  }
  comments?: { author: string; text: string; date: string }[]
  screenshots?: { url: string; caption?: string }[]
}

/** Моковые рейтинги по кандидатам */
export const MOCK_RATINGS: Record<string, CandidateRating[]> = {
  '1': [
    {
      id: 'r1',
      stage: 'HR-скрининг',
      date: '12 января 2026',
      interviewer: 'Иван Петров',
      score: 4.2,
      maxScore: 5,
      skills: [{ name: 'Коммуникация', score: 5 }, { name: 'Мотивация', score: 4 }, { name: 'Английский', score: 4 }, { name: 'Культурный фит', score: 4 }],
      questions: [
        { id: 'q1', question: 'Расскажите о себе и вашем опыте', answer: 'Кандидат подробно рассказал о 5 годах опыта в разработке, упомянул ключевые проекты и технологии.', score: 5, maxScore: 5 },
        { id: 'q2', question: 'Почему вы хотите работать в нашей компании?', answer: 'Интересен продукт и технологический стек. Хочет развиваться в enterprise-разработке.', score: 4, maxScore: 5, comment: 'Хорошо подготовился, изучил компанию' },
        { id: 'q3', question: 'Какие у вас зарплатные ожидания?', answer: 'Ожидания в рынке, готов к переговорам.', score: 4, maxScore: 5 },
        { id: 'q4', question: 'Оцените ваш уровень английского', answer: 'Upper-Intermediate, может вести переписку и созвоны.', score: 4, maxScore: 5, literatureLinks: [{ title: 'CEFR уровни', url: 'https://example.com/cefr' }] },
      ],
      feedback: 'Отличный кандидат с хорошей мотивацией. Рекомендую к следующему этапу.',
      metadata: { duration: '45 мин', format: 'Видеозвонок', location: 'Google Meet' },
      comments: [
        { author: 'HR Manager', text: 'Кандидат показал хороший уровень коммуникации', date: '12.01.2026 15:30' },
      ],
    },
    {
      id: 'r2',
      stage: 'Tech-скрининг',
      date: '14 января 2026',
      interviewer: 'Алексей Смирнов',
      score: 3.8,
      maxScore: 5,
      skills: [{ name: 'JavaScript/TypeScript', score: 4 }, { name: 'React', score: 4 }, { name: 'Архитектура', score: 3 }, { name: 'Алгоритмы', score: 4 }],
      questions: [
        { id: 'q5', question: 'Объясните разницу между let, const и var', answer: 'Правильно объяснил scoping и hoisting, привёл примеры.', score: 5, maxScore: 5 },
        { id: 'q6', question: 'Как работает Virtual DOM в React?', answer: 'Понимает концепцию, но не смог глубоко объяснить reconciliation.', score: 4, maxScore: 5, literatureLinks: [{ title: 'React Docs: Reconciliation', url: 'https://react.dev/learn/reconciliation' }] },
        { id: 'q7', question: 'Опишите архитектуру вашего последнего проекта', answer: 'Описал монолит с элементами микросервисов. Архитектурные решения не всегда обоснованы.', score: 3, maxScore: 5, comment: 'Нужно больше опыта в проектировании' },
        { id: 'q8', question: 'Решите задачу на алгоритмы (поиск в массиве)', answer: 'Решил с помощью бинарного поиска за O(log n).', score: 4, maxScore: 5 },
      ],
      feedback: 'Хороший технический уровень, но есть пробелы в архитектуре. Можно рассмотреть позицию Middle+.',
      metadata: { duration: '1 час 15 мин', format: 'Видеозвонок + Live Coding', location: 'Zoom' },
      screenshots: [
        { url: '/screenshots/code-review-1.png', caption: 'Решение задачи на live coding' },
      ],
    },
    {
      id: 'r3',
      stage: 'Final Interview',
      date: '18 января 2026',
      interviewer: 'CTO, Team Lead',
      score: 4.5,
      maxScore: 5,
      skills: [{ name: 'Системное мышление', score: 5 }, { name: 'Лидерские качества', score: 4 }, { name: 'Решение проблем', score: 5 }, { name: 'Командная работа', score: 4 }],
      questions: [
        { id: 'q9', question: 'Как бы вы организовали работу над новым проектом с нуля?', answer: 'Предложил итеративный подход с MVP, декомпозицию задач и регулярные демо.', score: 5, maxScore: 5 },
        { id: 'q10', question: 'Расскажите о конфликтной ситуации в команде', answer: 'Привёл пример и объяснил, как разрешил через коммуникацию.', score: 4, maxScore: 5 },
      ],
      feedback: 'Отлично вписывается в команду. Рекомендую к оферу.',
      metadata: { duration: '50 мин', format: 'Офис', location: 'Переговорная А' },
      comments: [
        { author: 'CTO', text: 'Сильный кандидат, хорошо мыслит системно', date: '18.01.2026 16:00' },
        { author: 'Team Lead', text: 'Готов взять в команду', date: '18.01.2026 16:15' },
      ],
    },
  ],
  '2': [
    {
      id: 'r4',
      stage: 'HR-скрининг',
      date: '21 января 2026',
      interviewer: 'Мария Козлова',
      score: 4.8,
      maxScore: 5,
      skills: [{ name: 'Коммуникация', score: 5 }, { name: 'Мотивация', score: 5 }, { name: 'Английский', score: 5 }, { name: 'Культурный фит', score: 4 }],
      questions: [
        { id: 'q11', question: 'Расскажите о вашем опыте в продуктовом менеджменте', answer: 'Отличный рассказ о 3 продуктах от идеи до запуска.', score: 5, maxScore: 5 },
        { id: 'q12', question: 'Как вы приоритизируете фичи?', answer: 'Использует RICE и Kano model, объяснила преимущества каждого.', score: 5, maxScore: 5 },
      ],
      feedback: 'Exceptional candidate. Strong product background.',
      metadata: { duration: '40 мин', format: 'Видеозвонок' },
    },
  ],
  '4': [
    {
      id: 'r5',
      stage: 'HR-скрининг',
      date: '22 января 2026',
      interviewer: 'Иван Петров',
      score: 4.0,
      maxScore: 5,
      skills: [{ name: 'Коммуникация', score: 4 }, { name: 'Мотивация', score: 4 }, { name: 'Английский', score: 4 }, { name: 'Культурный фит', score: 4 }],
      feedback: 'Хороший кандидат, ровные оценки по всем параметрам.',
      metadata: { duration: '35 мин', format: 'Видеозвонок' },
    },
    {
      id: 'r6',
      stage: 'Tech-скрининг',
      date: '24 января 2026',
      interviewer: 'Дмитрий Волков',
      score: 4.5,
      maxScore: 5,
      skills: [{ name: 'Java', score: 5 }, { name: 'Spring', score: 4 }, { name: 'PostgreSQL', score: 5 }, { name: 'Архитектура', score: 4 }],
      questions: [
        { id: 'q13', question: 'Объясните принципы SOLID', answer: 'Отлично объяснил все 5 принципов с примерами на Java.', score: 5, maxScore: 5 },
        { id: 'q14', question: 'Как бы вы оптимизировали медленный SQL запрос?', answer: 'EXPLAIN ANALYZE, индексы, денормализация — всё правильно.', score: 5, maxScore: 5 },
      ],
      feedback: 'Сильный бэкенд разработчик.',
      metadata: { duration: '1 час', format: 'Live Coding' },
    },
    {
      id: 'r7',
      stage: 'Final Interview',
      date: '26 января 2026',
      interviewer: 'CTO',
      score: 4.2,
      maxScore: 5,
      skills: [{ name: 'Системное мышление', score: 4 }, { name: 'Лидерские качества', score: 4 }, { name: 'Решение проблем', score: 5 }, { name: 'Командная работа', score: 4 }],
      feedback: 'Рекомендую к оферу на позицию Middle+.',
      metadata: { duration: '45 мин', format: 'Офис' },
    },
  ],
  '6': [
    {
      id: 'r8',
      stage: 'HR-скрининг',
      date: '10 января 2026',
      interviewer: 'Мария Козлова',
      score: 4.5,
      maxScore: 5,
      skills: [{ name: 'Коммуникация', score: 5 }, { name: 'Мотивация', score: 4 }, { name: 'Английский', score: 5 }, { name: 'Культурный фит', score: 4 }],
      feedback: 'Отличные коммуникативные навыки.',
      metadata: { duration: '30 мин', format: 'Телефон' },
    },
    {
      id: 'r9',
      stage: 'Tech-скрининг',
      date: '12 января 2026',
      interviewer: 'Алексей Смирнов',
      score: 4.2,
      maxScore: 5,
      skills: [{ name: 'React', score: 5 }, { name: 'TypeScript', score: 4 }, { name: 'CSS/Styling', score: 4 }, { name: 'Testing', score: 4 }],
      feedback: 'Хороший фронтенд разработчик.',
      metadata: { duration: '1 час', format: 'Видеозвонок' },
    },
  ],
}

/** Один список всех кандидатов — как mockCandidates в old */
export const MOCK_CANDIDATES: AtsCandidate[] = [
  {
    id: '1',
    name: 'John Doe',
    position: 'Senior Developer',
    status: 'Interview',
    statusColor: '#8B5CF6',
    avatar: 'JD',
    avatarUrl: '/avatars/photo2.png',
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
    rating: 4,
    social: { LinkedIn: '/in/johndoe', Telegram: '@johndoe', WhatsApp: '+15551234567' },
  },
  {
    id: '2',
    name: 'Jane Smith',
    position: 'Product Manager',
    status: 'New',
    statusColor: '#2180A0',
    avatar: 'JS',
    avatarUrl: '/avatars/photo1.png',
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
    rating: 5,
    social: { LinkedIn: '/in/janesmith', Telegram: '@janesmith', Behance: 'janesmith', 'Хабр Карьера': 'janesmith' },
  },
  {
    id: '3',
    name: 'Mike Chen',
    position: 'Designer',
    status: 'Rejected',
    statusColor: '#EF4444',
    avatar: 'MC',
    avatarUrl: '/avatars/photo2.png',
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
    rating: 3,
    social: { LinkedIn: '/in/mikechen', Dribbble: 'mikechen', Behance: 'mikechen', Pinterest: 'mikechen', Instagram: '@mikechen' },
  },
  {
    id: '4',
    name: 'Иванов Петр Сергеевич',
    position: 'Backend Developer',
    status: 'Offer',
    statusColor: '#10B981',
    avatar: 'ИП',
    avatarUrl: '/avatars/photo1.png',
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
    rating: 4,
    social: { LinkedIn: '/in/ivanov', Telegram: '@ivanov', GitHub: 'ivanov' },
  },
  {
    id: '5',
    name: 'Смирнова Анна Владимировна',
    position: 'Frontend Developer',
    status: 'New',
    statusColor: '#2180A0',
    avatar: 'СА',
    avatarUrl: '/avatars/photo2.png',
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
    rating: 5,
    social: { LinkedIn: '/in/smirnova', Telegram: '@smirnova', GitHub: 'smirnova' },
  },
  {
    id: '6',
    name: 'Alex Johnson',
    position: 'Frontend Developer',
    status: 'Interview',
    statusColor: '#8B5CF6',
    avatar: 'AJ',
    avatarUrl: '/avatars/photo1.png',
    timeAgo: '4 hours ago',
    unread: 2,
    unreadSources: { telegram: 2 },
    isViewed: true,
    hasUnviewedChanges: false,
    email: 'alex@example.com',
    vacancy: 'Frontend Senior',
    applied: 'Jan 10, 2026',
    source: 'GitHub',
    level: 'Middle',
    rating: 4,
  },
  {
    id: '7',
    name: 'Emma Wilson',
    position: 'UX Designer',
    status: 'New',
    statusColor: '#2180A0',
    avatar: 'EW',
    timeAgo: '30 minutes ago',
    unread: 0,
    vacancy: 'Product Designer',
    applied: 'Jan 24, 2026',
    source: 'Dribbble',
  },
  {
    id: '8',
    name: 'Козлов Дмитрий',
    position: 'DevOps Engineer',
    status: 'Under Review',
    statusColor: '#F59E0B',
    avatar: 'КД',
    avatarUrl: '/avatars/photo2.png',
    timeAgo: '2 hours ago',
    vacancy: 'Backend Developer',
    applied: 'Jan 21, 2026',
    source: 'HH.ru',
  },
  {
    id: '9',
    name: 'Sarah Miller',
    position: 'Product Manager',
    status: 'Interview',
    statusColor: '#8B5CF6',
    avatar: 'SM',
    timeAgo: '1 day ago',
    vacancy: 'Product Designer',
    applied: 'Jan 16, 2026',
    source: 'LinkedIn',
  },
  {
    id: '10',
    name: 'Волков Андрей',
    position: 'Fullstack Developer',
    status: 'Interview',
    statusColor: '#8B5CF6',
    avatar: 'ВА',
    avatarUrl: '/avatars/photo1.png',
    timeAgo: '6 hours ago',
    vacancy: 'Backend Developer',
    applied: 'Jan 14, 2026',
    source: 'Referral',
    level: 'Senior',
  },
  {
    id: '11',
    name: 'Lisa Anderson',
    position: 'QA Engineer',
    status: 'New',
    statusColor: '#2180A0',
    avatar: 'LA',
    timeAgo: '45 minutes ago',
    vacancy: 'Backend Developer',
    applied: 'Jan 24, 2026',
    source: 'Job Board',
  },
  {
    id: '12',
    name: 'Петрова Елена',
    position: 'HR Manager',
    status: 'Rejected',
    statusColor: '#EF4444',
    avatar: 'ПЕ',
    timeAgo: '3 days ago',
    vacancy: 'Product Designer',
    applied: 'Jan 12, 2026',
    source: 'HH.ru',
  },
  {
    id: '13',
    name: 'David Brown',
    position: 'Data Scientist',
    status: 'Interview',
    statusColor: '#8B5CF6',
    avatar: 'DB',
    avatarUrl: '/avatars/photo2.png',
    timeAgo: '8 hours ago',
    vacancy: 'Backend Developer',
    applied: 'Jan 13, 2026',
    source: 'Kaggle',
    level: 'Senior',
  },
  {
    id: '14',
    name: 'Николаев Сергей',
    position: 'Mobile Developer',
    status: 'Under Review',
    statusColor: '#F59E0B',
    avatar: 'НС',
    timeAgo: '5 hours ago',
    vacancy: 'Frontend Senior',
    applied: 'Jan 19, 2026',
    source: 'LinkedIn',
  },
  {
    id: '15',
    name: 'Jennifer Taylor',
    position: 'Frontend Developer',
    status: 'Interview',
    statusColor: '#8B5CF6',
    avatar: 'JT',
    timeAgo: '12 hours ago',
    vacancy: 'Frontend Senior',
    applied: 'Jan 17, 2026',
    source: 'GitHub',
  },
  {
    id: '16',
    name: 'Федорова Ольга',
    position: 'Business Analyst',
    status: 'Offer',
    statusColor: '#10B981',
    avatar: 'ФО',
    avatarUrl: '/avatars/photo1.png',
    timeAgo: '1 day ago',
    vacancy: 'Product Designer',
    applied: 'Jan 11, 2026',
    source: 'Referral',
  },
  {
    id: '17',
    name: 'Michael Davis',
    position: 'Backend Developer',
    status: 'Interview',
    statusColor: '#8B5CF6',
    avatar: 'MD',
    timeAgo: '16 hours ago',
    vacancy: 'Backend Developer',
    applied: 'Jan 15, 2026',
    source: 'LinkedIn',
  },
  {
    id: '18',
    name: 'Соколова Мария',
    position: 'UI Designer',
    status: 'Under Review',
    statusColor: '#F59E0B',
    avatar: 'СМ',
    avatarUrl: '/avatars/photo2.png',
    timeAgo: '4 hours ago',
    vacancy: 'Product Designer',
    applied: 'Jan 20, 2026',
    source: 'Behance',
  },
  {
    id: '19',
    name: 'Robert Garcia',
    position: 'Tech Lead',
    status: 'Accepted',
    statusColor: '#059669',
    avatar: 'RG',
    avatarUrl: '/avatars/photo1.png',
    timeAgo: '2 days ago',
    vacancy: 'Frontend Senior',
    applied: 'Jan 8, 2026',
    source: 'Referral',
    level: 'Senior',
  },
  {
    id: '20',
    name: 'Кузнецов Игорь',
    position: 'System Architect',
    status: 'Interview',
    statusColor: '#8B5CF6',
    avatar: 'КИ',
    timeAgo: '10 hours ago',
    vacancy: 'Backend Developer',
    applied: 'Jan 14, 2026',
    source: 'HH.ru',
    level: 'Senior',
  },
  {
    id: '21',
    name: 'Emily White',
    position: 'Project Manager',
    status: 'Rejected',
    statusColor: '#EF4444',
    avatar: 'EW',
    timeAgo: '4 days ago',
    vacancy: 'Product Designer',
    applied: 'Jan 9, 2026',
    source: 'LinkedIn',
  },
  {
    id: '22',
    name: 'Морозов Алексей',
    position: 'DevOps Engineer',
    status: 'Declined',
    statusColor: '#6B7280',
    avatar: 'МА',
    timeAgo: '5 days ago',
    vacancy: 'Backend Developer',
    applied: 'Jan 7, 2026',
    source: 'HH.ru',
  },
  {
    id: '23',
    name: 'Jessica Martinez',
    position: 'Frontend Developer',
    status: 'Rejected',
    statusColor: '#EF4444',
    avatar: 'JM',
    timeAgo: '6 days ago',
    vacancy: 'Frontend Senior',
    applied: 'Jan 5, 2026',
    source: 'Job Board',
  },
  {
    id: '24',
    name: 'Попов Владимир',
    position: 'Backend Developer',
    status: 'Declined',
    statusColor: '#6B7280',
    avatar: 'ПВ',
    timeAgo: '1 week ago',
    vacancy: 'Backend Developer',
    applied: 'Jan 3, 2026',
    source: 'Referral',
  },
  {
    id: '25',
    name: 'Новикова Анастасия',
    position: 'QA Lead',
    status: 'Archived',
    statusColor: '#9CA3AF',
    avatar: 'НА',
    timeAgo: '2 weeks ago',
    vacancy: 'Backend Developer',
    applied: 'Dec 20, 2025',
    source: 'HH.ru',
  },
  {
    id: '26',
    name: 'Thomas Lee',
    position: 'Senior Developer',
    status: 'Archived',
    statusColor: '#9CA3AF',
    avatar: 'TL',
    timeAgo: '3 weeks ago',
    vacancy: 'Frontend Senior',
    applied: 'Dec 15, 2025',
    source: 'GitHub',
  },
  {
    id: '27',
    name: 'Лебедева Ирина',
    position: 'Product Designer',
    status: 'Archived',
    statusColor: '#9CA3AF',
    avatar: 'ЛИ',
    timeAgo: '1 month ago',
    vacancy: 'Product Designer',
    applied: 'Dec 10, 2025',
    source: 'Behance',
  },
]

/** Подсчёт кандидатов по статусам */
export function getStatusCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  MOCK_CANDIDATES.forEach((c) => {
    counts[c.status] = (counts[c.status] || 0) + 1
  })
  return counts
}

/** Диалоги для вкладки Chat — как mockConversations в old (полные поля) */
export interface AtsConversation {
  id: string
  candidateId: string
  name: string
  avatar?: string
  lastMessage?: string
  timestamp?: string
  unread: number
  channel?: string
  favourite?: boolean
}

export const MOCK_CONVERSATIONS: AtsConversation[] = [
  {
    id: '1',
    candidateId: '1',
    name: 'John Doe',
    avatar: 'JD',
    lastMessage: 'Sure, let me check...',
    timestamp: 'Today 3:45 PM',
    unread: 3,
    channel: 'email',
    favourite: true,
  },
  {
    id: '2',
    candidateId: '2',
    name: 'Jane Smith',
    avatar: 'JS',
    lastMessage: 'Thanks for the update!',
    timestamp: 'Today 1:20 PM',
    unread: 0,
    channel: 'telegram',
    favourite: false,
  },
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

export function getCandidateInitials(c: AtsCandidate): string {
  return c.avatar ?? getInitials(c.name)
}

/** Количество непрочитанных в диалогах — для бейджа вкладки Chat */
export function getUnreadConversationsCount(): number {
  return MOCK_CONVERSATIONS.filter((c) => c.unread > 0).length
}

/** Порядок статусов в workflow — как statusOrder в old */
export const STATUS_ORDER = [
  'New',
  'Under Review',
  'Message',
  'Contact',
  'HR Screening',
  'Test Task',
  'Final Interview',
  'Decision',
  'Interview',
  'Offer',
  'Accepted',
  'Rejected',
  'Declined',
  'Archived',
]

/** Цвета статусов */
export const STATUS_COLORS: Record<string, string> = {
  'New': '#2180A0',
  'Under Review': '#F59E0B',
  'Message': '#6366F1',
  'Contact': '#8B5CF6',
  'HR Screening': '#A855F7',
  'Test Task': '#C084FC',
  'Final Interview': '#D946EF',
  'Decision': '#EC4899',
  'Interview': '#8B5CF6',
  'Offer': '#10B981',
  'Accepted': '#059669',
  'Rejected': '#EF4444',
  'Declined': '#6B7280',
  'Archived': '#9CA3AF',
}

/** Причины отказа — как rejectionReasons в old */
export const REJECTION_REASONS = [
  'Не подходит по опыту',
  'Не подходит по навыкам',
  'Зарплатные ожидания слишком высокие',
  'Не подходит по локации',
  'Другая причина',
]

/** Цвет статуса для Badge/Select — как getStatusColor в old */
export function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? '#6B7280'
}
