/**
 * Моки ats — в точности как в frontend old (app/ats/page.tsx).
 * Один общий список кандидатов, вакансия у каждого — название (vacancy).
 */

export interface AtsVacancy {
  id: string
  name: string
}

/** Строка для бейджа параллельной или архивной заявки (мок) */
export interface CandidateApplicationBadge {
  vacancy: string
  status: string
}

/** Запись в единой хронологии снимков опыта (мок; сравнение — между соседними версиями, не между подвкладками) */
export interface CandidateExperienceVersionEntry {
  /** Номер версии: v0 — самый ранний снимок по времени, далее по мере поступления данных */
  version: number
  /** Дата для отображения, напр. 13.02.24 */
  dateDisplay: string
  /** Откуда пришёл этот снимок (показывается в таймлайне перед чипом версии, кроме v0) */
  sourceSnapshot?: string
}

/** Сведения об источнике и дате обновления для вкладок «Опыт» */
export interface CandidateExperienceTabInfo {
  /** Подпись источника: LinkedIn, hh.ru, rabota.by и т.д. */
  sourceLabel: string
  /** Дата последнего обновления резюме с этого источника */
  resumeUpdatedAt: string
  /**
   * История версий только для этой подвкладки (если нет candidate.experienceVersionHistory).
   */
  versionHistory?: CandidateExperienceVersionEntry[]
  /**
   * @deprecated Кнопка «Обновить» перенесена в тулбар; поле сохранено для совместимости моков.
   */
  showRefreshButton?: boolean
}

/**
 * Резюме/профиль с внешней площадки по ссылке (интеграция) — доступно обновление с источника.
 * Локальные «Файл», «Система», загрузка — без обновления.
 */
export function isLinkSourcedExperienceSource(sourceLabel: string): boolean {
  const t = sourceLabel.trim()
  if (!t || t === '—') return false
  if (/^(файл|система|локально|загрузка|upload|manual)$/i.test(t)) return false
  return /\b(hh\.|headhunter|linkedin|rabota|хабр|habr|github|greenhouse|indeed|superjob|карьер|link|http|https|www\.)/i.test(
    t,
  )
}

/**
 * Источники, для которых в тулбаре показывается «Обновить» (интеграция), а не «Редактировать».
 * Только hh / HeadHunter, rabota.by, LinkedIn — не GitHub и пр.
 */
export function isExternalRecruitingRefreshSource(sourceLabel: string): boolean {
  const raw = sourceLabel.trim()
  if (!raw || raw === '—') return false
  const t = raw.toLowerCase()
  return (
    /\b(hh\.ru|hh\b|headhunter|хедхантер|хед\s*хантер)/i.test(raw) ||
    /\blinkedin\b/i.test(t) ||
    /\brabota\.by\b/i.test(t) ||
    /\bработа\.by\b/i.test(t)
  )
}

function defaultExperienceVersionHistory(): CandidateExperienceVersionEntry[] {
  return [
    { version: 3, dateDisplay: '14.03.26', sourceSnapshot: 'LinkedIn' },
    { version: 2, dateDisplay: '19.07.25', sourceSnapshot: 'Файл (самодельное резюме)' },
    { version: 1, dateDisplay: '13.02.24', sourceSnapshot: 'rabota.by' },
    { version: 0, dateDisplay: '12.02.24', sourceSnapshot: 'LinkedIn' },
  ]
}

/** Совпадение опыта кандидата с записью из чёрного списка компаний (мок) */
export interface BlacklistSuspicionMatch {
  companyName: string
  matchReason: string
  /** Откуда взята строка опыта (резюме / профиль) */
  sourceLabel?: string
}

/** Запись ленты «Активность» на карточке кандидата (мок + накопление в сессии) */
export type AtsCandidateActivityKind = 'status_transition' | 'comment' | 'resume_added' | 'system'

export interface AtsCandidateActivityEntry {
  id: string
  kind: AtsCandidateActivityKind
  /** ISO-8601 для сортировки и отображения */
  atIso: string
  authorLabel: string
  fromStatus?: string
  toStatus?: string
  /** Комментарий в том виде, как ввёл пользователь (переносы строк сохраняются) */
  commentRaw?: string
  /** Если статус «Отказ» и выбрана причина */
  rejectionReason?: string
  /** Для нестатусных событий */
  title?: string
  subtitle?: string
}

/** Снимок полей для отката после «Подтвердить» (вкладка History) */
export interface AtsCandidateAuditRevert {
  candidateId: string
  merge: Partial<{
    status: string
    statusColor: string
    offerApplicationId?: string
    offerStartDate?: string
  }>
  unsetKeys?: Array<'offerApplicationId' | 'offerStartDate'>
}

export interface AtsCandidateAuditEntry {
  id: string
  atIso: string
  authorLabel: string
  summary: string
  /** Подробный лог действия (мультистрочный) */
  detail: string
  undone: boolean
  /** null — отмена недоступна (архивные записи или только комментарий) */
  revert: AtsCandidateAuditRevert | null
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
  /** Дата последнего обновления заявки (мок) */
  updated?: string
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
  /** Подозрение: компании из опыта пересекаются с чёрным списком рекрутинга */
  hasBlacklistSuspicion?: boolean
  blacklistSuspicionMatches?: BlacklistSuspicionMatch[]
  /** Подтверждённо в чёрном списке — отдельная метка в списке кандидатов */
  isBlacklisted?: boolean
  /** Соцсети: linkedin, telegram, github и т.д. */
  social?: Record<string, string | string[]>
  /** Рейтинг кандидата (1–5) — как в old */
  rating?: number
  /** Номер заявки (мок) — при статусе Offer */
  offerApplicationId?: string
  /** Дата выхода на работу, YYYY-MM-DD (мок) — при статусе Offer */
  offerStartDate?: string
  /** Имя файла резюме для превью (мок) */
  resumeFileName?: string
  /** Параллельные активные заявки на другие вакансии (мок) */
  parallelVacancies?: CandidateApplicationBadge[]
  /** Архивные / закрытые заявки (мок) */
  archivedApplications?: CandidateApplicationBadge[]
  /** Внешняя ссылка на профиль кандидата (мок) */
  sourceProfileUrl?: string
  /** Мета вкладки «resume.pdf» — отдельное резюме-файл (источник, дата обновления) */
  experienceResumeTab?: CandidateExperienceTabInfo
  /** Мета вкладки «Профиль кандидата» — структурированный профиль с другого источника */
  experienceProfileTab?: CandidateExperienceTabInfo
  /**
   * Общая хронология снимков опыта по кандидату (v0 — самый ранний). Одна строка версий для обеих подвкладок.
   */
  experienceVersionHistory?: CandidateExperienceVersionEntry[]
  /** История активности (вкладка Activity); новые записи дополняются из UI при «Подтвердить» */
  activityLog?: AtsCandidateActivityEntry[]
  /** Журнал аудита (вкладка History): подробные логи и откат подтверждений статуса */
  auditLog?: AtsCandidateAuditEntry[]
}

export function getExperienceTabInfo(
  c: AtsCandidate,
  tab: 'resume' | 'profile',
): CandidateExperienceTabInfo {
  const fallbackUpdated = c.updated ?? '—'
  const useGlobalTimeline = Boolean(c.experienceVersionHistory && c.experienceVersionHistory.length > 0)
  if (tab === 'resume') {
    const base =
      c.experienceResumeTab ?? {
        sourceLabel: 'Файл',
        resumeUpdatedAt: fallbackUpdated,
      }
    const link = isLinkSourcedExperienceSource(base.sourceLabel)
    const explicit = base.showRefreshButton
    const recruitingRefresh = isExternalRecruitingRefreshSource(base.sourceLabel)
    const versionHistory = useGlobalTimeline
      ? undefined
      : base.versionHistory && base.versionHistory.length > 0
        ? [...base.versionHistory].sort((a, b) => b.version - a.version)
        : recruitingRefresh
          ? defaultExperienceVersionHistory()
          : undefined
    return {
      ...base,
      showRefreshButton: explicit === false ? false : link,
      versionHistory,
    }
  }
  const base =
    c.experienceProfileTab ?? {
      sourceLabel: 'Система',
      resumeUpdatedAt: fallbackUpdated,
    }
  const link = isLinkSourcedExperienceSource(base.sourceLabel)
  const explicit = base.showRefreshButton
  const recruitingRefresh = isExternalRecruitingRefreshSource(base.sourceLabel)
  const versionHistory = useGlobalTimeline
    ? undefined
    : base.versionHistory && base.versionHistory.length > 0
      ? [...base.versionHistory].sort((a, b) => b.version - a.version)
      : recruitingRefresh
        ? defaultExperienceVersionHistory()
        : undefined
  return {
    ...base,
    showRefreshButton: explicit === false ? false : link,
    versionHistory,
  }
}

/** Варианты номера заявки для селекта (мок) */
/** Значение «не выбрано» для Radix Select (пустая строка в Select.Item запрещена) */
export const OFFER_APPLICATION_NONE = '__none__'

export const OFFER_APPLICATION_IDS = [
  'REQ-2026-001',
  'REQ-2026-002',
  'REQ-2026-003',
  'REQ-2026-004',
  'INT-2025-891',
] as const

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
    hasBlacklistSuspicion: true,
    blacklistSuspicionMatches: [
      {
        companyName: 'ООО «ТехноБлок»',
        matchReason: 'Юрлицо в чёрном списке компании (рекрутинг)',
        sourceLabel: 'Опыт в резюме — LinkedIn',
      },
      {
        companyName: 'ООО «СтройИнвест Альфа»',
        matchReason: 'Совпадение с алиасом / дочерней структурой из чёрного списка',
        sourceLabel: 'Опыт в резюме — файл PDF',
      },
    ],
    vacancy: 'Frontend Senior',
    applied: 'Jan 15, 2026',
    updated: 'Jan 18, 2026',
    source: 'LinkedIn',
    tags: ['React', 'TypeScript', 'Senior'],
    level: 'Senior',
    age: 32,
    gender: 'Мужской',
    salaryExpectations: '150,000 - 200,000 USD',
    offer: '180,000 USD',
    rating: 4,
    social: { LinkedIn: '/in/johndoe', Telegram: '@johndoe', WhatsApp: '+15551234567' },
    resumeFileName: 'Gromyko Vladimir Nikolaevich.pdf',
    experienceResumeTab: { sourceLabel: 'LinkedIn', resumeUpdatedAt: '12.03.2026' },
    experienceProfileTab: { sourceLabel: 'hh.ru', resumeUpdatedAt: '18.02.2026' },
    experienceVersionHistory: [
      { version: 0, dateDisplay: '12.02.24', sourceSnapshot: 'LinkedIn' },
      { version: 1, dateDisplay: '13.02.24', sourceSnapshot: 'rabota.by' },
      { version: 2, dateDisplay: '19.07.25', sourceSnapshot: 'Файл (самодельное резюме)' },
      { version: 3, dateDisplay: '14.03.26', sourceSnapshot: 'LinkedIn' },
    ],
    activityLog: [
      {
        id: 'act-1',
        kind: 'resume_added',
        atIso: '2026-01-15T14:22:00.000Z',
        authorLabel: 'Система',
        title: 'Резюме добавлено в воронку',
        subtitle: 'Источник: LinkedIn · заявка на вакансию Frontend Senior',
      },
      {
        id: 'act-2',
        kind: 'status_transition',
        atIso: '2026-01-16T09:05:00.000Z',
        authorLabel: 'Иванова Мария',
        fromStatus: 'New',
        toStatus: 'Under Review',
        commentRaw:
          'Первичный просмотр резюме.\nСоответствует стеку: **React**, *TypeScript*, опыт с *design system*.\n\nДоговорились о созвоне на чт.',
      },
      {
        id: 'act-3',
        kind: 'status_transition',
        atIso: '2026-01-17T11:40:00.000Z',
        authorLabel: 'Петров Алексей',
        fromStatus: 'Under Review',
        toStatus: 'Interview',
        commentRaw:
          'Скрининг HR пройден.\nКомментарий кандидата по зарплатным ожиданиям зафиксирован как в переписке:\n150–200k USD.\n\n<u>Следующий шаг</u>: тех. интервью.',
      },
      {
        id: 'act-4',
        kind: 'comment',
        atIso: '2026-01-18T08:15:00.000Z',
        authorLabel: 'Голубенко Андрей',
        commentRaw:
          'Напоминание себе перед интервью:\n- пройтись по тестовому заданию\n- проверить [ссылка на GitHub](https://example.com)\n\nБез смены статуса.',
      },
    ],
    auditLog: [
      {
        id: 'audit-mock-1',
        atIso: '2026-01-15T14:22:03.120Z',
        authorLabel: 'Система · ATS ingest',
        summary: 'Импорт карточки кандидата',
        detail: [
          'action=APPLICATION_CREATED',
          'source_channel=linkedin_job_apply',
          'vacancy_external_id=fe-senior-001',
          'payload.resume_sha256=<mock>',
          'result=duplicate_check_passed',
          'notes: запись создана без ручного вмешательства; откат недоступен.',
        ].join('\n'),
        undone: false,
        revert: null,
      },
      {
        id: 'audit-mock-2',
        atIso: '2026-01-16T09:05:11.000Z',
        authorLabel: 'Иванова Мария · user_id=hr-042',
        summary: 'UI: подтверждение статуса New → Under Review',
        detail: [
          'action=CONFIRM_STATUS',
          'ui.context=candidate_card.status_panel',
          'transition.before=New',
          'transition.after=Under Review',
          'offer.application_id=∅',
          'offer.start_date=∅',
          'rejection.reason=∅',
          'comment.length_chars=142',
          'comment.raw_stored=true',
          'audit.retention_days=365 (мок)',
        ].join('\n'),
        undone: false,
        revert: null,
      },
      {
        id: 'audit-mock-3',
        atIso: '2026-01-17T11:40:22.000Z',
        authorLabel: 'Петров Алексей · user_id=hr-018',
        summary: 'UI: подтверждение статуса Under Review → Interview',
        detail: [
          'action=CONFIRM_STATUS',
          'ui.context=candidate_card.status_panel',
          'transition.before=Under Review',
          'transition.after=Interview',
          'sla.next_step=schedule_tech_interview',
          'calendar.suggested_slots_sent=false (мок)',
          'comment.length_chars=198',
        ].join('\n'),
        undone: false,
        revert: null,
      },
    ],
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
    parallelVacancies: [{ vacancy: 'Lead Designer', status: 'Интервью' }],
    archivedApplications: [{ vacancy: 'UX Research', status: 'Архив' }],
    experienceResumeTab: { sourceLabel: 'rabota.by', resumeUpdatedAt: '18.03.2026' },
    experienceProfileTab: { sourceLabel: 'LinkedIn', resumeUpdatedAt: '16.03.2026' },
    /* Длинная хронология для проверки горизонтального скролла (v0 — самый ранний) */
    experienceVersionHistory: [
      { version: 0, dateDisplay: '12.12.25', sourceSnapshot: 'LinkedIn' },
      { version: 1, dateDisplay: '02.01.26', sourceSnapshot: 'hh.ru' },
      { version: 2, dateDisplay: '10.01.26', sourceSnapshot: 'rabota.by' },
      { version: 3, dateDisplay: '22.01.26', sourceSnapshot: 'LinkedIn' },
      { version: 4, dateDisplay: '01.02.26', sourceSnapshot: 'rabota.by' },
      { version: 5, dateDisplay: '15.02.26', sourceSnapshot: 'hh.ru' },
      { version: 6, dateDisplay: '20.02.26', sourceSnapshot: 'LinkedIn' },
      { version: 7, dateDisplay: '28.02.26', sourceSnapshot: 'Файл (самодельное резюме)' },
      { version: 8, dateDisplay: '02.03.26', sourceSnapshot: 'hh.ru' },
      { version: 9, dateDisplay: '14.03.26', sourceSnapshot: 'rabota.by' },
      { version: 10, dateDisplay: '18.03.26', sourceSnapshot: 'LinkedIn' },
    ],
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
    experienceResumeTab: { sourceLabel: 'LinkedIn', resumeUpdatedAt: '08.02.2026' },
    experienceProfileTab: { sourceLabel: 'hh.ru', resumeUpdatedAt: '01.02.2026' },
    experienceVersionHistory: [
      { version: 0, dateDisplay: '10.11.25', sourceSnapshot: 'hh.ru' },
      { version: 1, dateDisplay: '22.12.25', sourceSnapshot: 'LinkedIn' },
      { version: 2, dateDisplay: '15.01.26', sourceSnapshot: 'Файл (самодельное резюме)' },
      { version: 3, dateDisplay: '08.02.26', sourceSnapshot: 'LinkedIn' },
    ],
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
    parallelVacancies: [{ vacancy: 'DevOps', status: 'Новая' }],
    archivedApplications: [{ vacancy: 'Frontend Middle', status: 'Отказ · 2024' }],
    experienceResumeTab: { sourceLabel: 'hh.ru', resumeUpdatedAt: '22.01.2026' },
    experienceProfileTab: { sourceLabel: 'rabota.by', resumeUpdatedAt: '15.01.2026' },
    experienceVersionHistory: [
      { version: 0, dateDisplay: '15.01.26', sourceSnapshot: 'rabota.by' },
      { version: 1, dateDisplay: '18.01.26', sourceSnapshot: 'hh.ru' },
      { version: 2, dateDisplay: '22.01.26', sourceSnapshot: 'hh.ru' },
    ],
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
    experienceResumeTab: { sourceLabel: 'rabota.by', resumeUpdatedAt: '20.03.2026' },
    experienceProfileTab: { sourceLabel: 'LinkedIn', resumeUpdatedAt: '18.03.2026' },
    experienceVersionHistory: [
      { version: 0, dateDisplay: '05.01.26', sourceSnapshot: 'LinkedIn' },
      { version: 1, dateDisplay: '12.01.26', sourceSnapshot: 'hh.ru' },
      { version: 2, dateDisplay: '28.01.26', sourceSnapshot: 'rabota.by' },
      { version: 3, dateDisplay: '14.02.26', sourceSnapshot: 'LinkedIn' },
      { version: 4, dateDisplay: '20.03.26', sourceSnapshot: 'rabota.by' },
    ],
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
    experienceResumeTab: { sourceLabel: 'hh.ru', resumeUpdatedAt: '11.01.2026' },
    experienceProfileTab: { sourceLabel: 'rabota.by', resumeUpdatedAt: '25.12.2025' },
    experienceVersionHistory: [
      { version: 0, dateDisplay: '01.12.25', sourceSnapshot: 'rabota.by' },
      { version: 1, dateDisplay: '18.12.25', sourceSnapshot: 'hh.ru' },
      { version: 2, dateDisplay: '25.12.25', sourceSnapshot: 'rabota.by' },
      { version: 3, dateDisplay: '11.01.26', sourceSnapshot: 'hh.ru' },
    ],
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
    experienceResumeTab: { sourceLabel: 'LinkedIn', resumeUpdatedAt: '24.01.2026' },
    experienceProfileTab: { sourceLabel: 'rabota.by', resumeUpdatedAt: '20.01.2026' },
    experienceVersionHistory: [
      { version: 0, dateDisplay: '08.01.26', sourceSnapshot: 'rabota.by' },
      { version: 1, dateDisplay: '15.01.26', sourceSnapshot: 'LinkedIn' },
      { version: 2, dateDisplay: '20.01.26', sourceSnapshot: 'rabota.by' },
      { version: 3, dateDisplay: '24.01.26', sourceSnapshot: 'LinkedIn' },
    ],
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
    experienceResumeTab: { sourceLabel: 'hh.ru', resumeUpdatedAt: '21.01.2026' },
    experienceProfileTab: { sourceLabel: 'LinkedIn', resumeUpdatedAt: '19.01.2026' },
    experienceVersionHistory: [
      { version: 0, dateDisplay: '02.01.26', sourceSnapshot: 'LinkedIn' },
      { version: 1, dateDisplay: '10.01.26', sourceSnapshot: 'hh.ru' },
      { version: 2, dateDisplay: '15.01.26', sourceSnapshot: 'Файл (самодельное резюме)' },
      { version: 3, dateDisplay: '17.01.26', sourceSnapshot: 'LinkedIn' },
      { version: 4, dateDisplay: '19.01.26', sourceSnapshot: 'rabota.by' },
      { version: 5, dateDisplay: '21.01.26', sourceSnapshot: 'hh.ru' },
    ],
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
    experienceResumeTab: { sourceLabel: 'rabota.by', resumeUpdatedAt: '16.01.2026' },
    experienceProfileTab: { sourceLabel: 'LinkedIn', resumeUpdatedAt: '14.01.2026' },
    experienceVersionHistory: [
      { version: 0, dateDisplay: '28.12.25', sourceSnapshot: 'LinkedIn' },
      { version: 1, dateDisplay: '05.01.26', sourceSnapshot: 'rabota.by' },
      { version: 2, dateDisplay: '14.01.26', sourceSnapshot: 'LinkedIn' },
    ],
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
    experienceResumeTab: { sourceLabel: 'LinkedIn', resumeUpdatedAt: '12.01.2026' },
    experienceProfileTab: { sourceLabel: 'hh.ru', resumeUpdatedAt: '10.01.2026' },
    experienceVersionHistory: [
      { version: 0, dateDisplay: '20.12.25', sourceSnapshot: 'hh.ru' },
      { version: 1, dateDisplay: '02.01.26', sourceSnapshot: 'LinkedIn' },
      { version: 2, dateDisplay: '08.01.26', sourceSnapshot: 'rabota.by' },
      { version: 3, dateDisplay: '12.01.26', sourceSnapshot: 'LinkedIn' },
    ],
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
    experienceResumeTab: { sourceLabel: 'rabota.by', resumeUpdatedAt: '23.01.2026' },
    experienceProfileTab: { sourceLabel: 'hh.ru', resumeUpdatedAt: '20.01.2026' },
    experienceVersionHistory: [
      { version: 0, dateDisplay: '18.01.26', sourceSnapshot: 'hh.ru' },
      { version: 1, dateDisplay: '23.01.26', sourceSnapshot: 'rabota.by' },
    ],
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
    experienceResumeTab: { sourceLabel: 'LinkedIn', resumeUpdatedAt: '11.01.2026' },
    experienceProfileTab: { sourceLabel: 'rabota.by', resumeUpdatedAt: '09.01.2026' },
    experienceVersionHistory: [
      { version: 0, dateDisplay: '15.12.25', sourceSnapshot: 'rabota.by' },
      { version: 1, dateDisplay: '22.12.25', sourceSnapshot: 'LinkedIn' },
      { version: 2, dateDisplay: '03.01.26', sourceSnapshot: 'hh.ru' },
      { version: 3, dateDisplay: '09.01.26', sourceSnapshot: 'rabota.by' },
      { version: 4, dateDisplay: '11.01.26', sourceSnapshot: 'LinkedIn' },
    ],
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
    experienceResumeTab: { sourceLabel: 'rabota.by', resumeUpdatedAt: '17.01.2026' },
    experienceProfileTab: { sourceLabel: 'LinkedIn', resumeUpdatedAt: '19.01.2026' },
    experienceVersionHistory: [
      { version: 0, dateDisplay: '02.01.26', sourceSnapshot: 'LinkedIn' },
      { version: 1, dateDisplay: '10.01.26', sourceSnapshot: 'rabota.by' },
      { version: 2, dateDisplay: '17.01.26', sourceSnapshot: 'hh.ru' },
    ],
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
    experienceResumeTab: { sourceLabel: 'hh.ru', resumeUpdatedAt: '16.01.2026' },
    experienceProfileTab: { sourceLabel: 'rabota.by', resumeUpdatedAt: '14.01.2026' },
    experienceVersionHistory: [
      { version: 0, dateDisplay: '20.12.25', sourceSnapshot: 'rabota.by' },
      { version: 1, dateDisplay: '05.01.26', sourceSnapshot: 'hh.ru' },
      { version: 2, dateDisplay: '14.01.26', sourceSnapshot: 'rabota.by' },
      { version: 3, dateDisplay: '16.01.26', sourceSnapshot: 'hh.ru' },
    ],
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

/** Стартовая карта ленты Activity по id кандидата (копия из моков) */
export function initialCandidateActivityLogMap(
  candidates: AtsCandidate[],
): Record<string, AtsCandidateActivityEntry[]> {
  const m: Record<string, AtsCandidateActivityEntry[]> = {}
  for (const c of candidates) {
    if (c.activityLog?.length) {
      m[c.id] = c.activityLog.map((e) => ({ ...e }))
    }
  }
  return m
}

export function initialCandidateAuditLogMap(
  candidates: AtsCandidate[],
): Record<string, AtsCandidateAuditEntry[]> {
  const m: Record<string, AtsCandidateAuditEntry[]> = {}
  for (const c of candidates) {
    if (c.auditLog?.length) {
      m[c.id] = c.auditLog.map((e) => ({ ...e }))
    }
  }
  return m
}

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

/** Блок резюме в карточке кандидата (вкладка Info → Опыт) — мок для миграции */
export interface CandidateResumeWorkEntry {
  period: string
  duration?: string
  company: string
  /** Явный URL компании; иначе при простом домене в companyMeta строится https://… */
  companyUrl?: string
  companyMeta?: string
  title: string
  bullets: string[]
}

export interface CandidateResumeEducation {
  leftLabel: string
  institution: string
  detail?: string
}

export interface CandidateResumeProfile {
  totalExperienceLine?: string
  aboutMe?: {
    body: string
    highlightsTitle?: string
    highlights?: string[]
  }
  workExperience: CandidateResumeWorkEntry[]
  education?: CandidateResumeEducation[]
  languages?: string[]
  skillTags?: string[]
  certifications?: { name: string; issuer?: string; year?: string }[]
  portfolio?: { label: string; url?: string }[]
}

/** Расширенный мок резюме по id кандидата */
export const MOCK_CANDIDATE_RESUME: Record<string, CandidateResumeProfile> = {
  '1': {
    totalExperienceLine: '6 лет 7 месяцев',
    aboutMe: {
      body:
        'Senior React Native engineer with 7+ years in front-end development and 5+ years in React Native. Strong in cross-platform architecture (mobile + desktop), native modules (Swift/Objective-C, Kotlin/Java), real-time features (WebRTC, WebSocket), testing, and CI/CD. Owns delivery end-to-end: estimation, implementation, reviews, store releases, and post-release stability.',
      highlightsTitle: 'HIGHLIGHTS',
      highlights: [
        'React Native + TypeScript, performance profiling, UX quality, maintainable codebases',
      ],
    },
    workExperience: [
      {
        period: 'апрель 2023 — сентябрь 2025',
        duration: '2 года 6 месяцев',
        company: 'Flashphoner',
        companyMeta: 'flashphoner.com',
        title: 'Senior React Native Developer',
        bullets: [
          'Owned architecture and delivery for mobile and desktop apps (RN + Electron)',
          'Native modules (Kotlin/Java, Swift/Objective-C); WebRTC, real-time media',
          'CI/CD, release pipelines, store submissions',
        ],
      },
      {
        period: 'сентябрь 2019 — март 2023',
        duration: '3 года 7 месяцев',
        company: 'Delivery Software',
        companyMeta: '',
        title: 'Front-end developer',
        bullets: [
          'Web and mobile apps (React / React Native), REST APIs',
          'Monitoring (Sentry, AppCenter), Agile/Scrum',
        ],
      },
      {
        period: 'июнь 2018 — август 2019',
        duration: '1 год 3 месяца',
        company: 'Real Digital',
        companyMeta: 'Минск, rdigital.by',
        title: 'Front-end developer',
        bullets: [
          'Delivered features for web applications (Next.js/React/Redux), improved UI consistency and performance',
        ],
      },
    ],
    education: [
      {
        leftLabel: '2018, Высшее',
        institution: 'БарГУ',
        detail: 'Факультет прикладной математики и информатики',
      },
    ],
    languages: ['Русский — родной', 'English — B2 — Upper Intermediate'],
    skillTags: [
      'GitHub',
      'CSS',
      'HTML',
      'JavaScript',
      'React',
      'React Native',
      'Redux',
      'Webpack',
      'Sass',
      'axios',
      'Styled Components',
      'REST',
      'GraphQL',
      'Jest',
      'ESLint',
      'Git',
      'PWA',
      'TypeScript',
      'Next.js',
      'Docker',
      'CI/CD',
    ],
    certifications: [
      { name: 'AWS Certified Developer (Associate)', issuer: 'Amazon', year: '2023' },
      { name: 'Professional Scrum Master I', issuer: 'Scrum.org', year: '2022' },
    ],
    portfolio: [
      { label: 'Behance — кейсы UI', url: 'https://behance.net' },
      { label: 'GitHub', url: 'https://github.com' },
    ],
  },
}

export function getCandidateResumeProfile(candidate: AtsCandidate): CandidateResumeProfile {
  const custom = MOCK_CANDIDATE_RESUME[candidate.id]
  if (custom) return custom
  const pos = candidate.position ?? candidate.vacancy ?? '—'
  const lvl = candidate.level ? ` · ${candidate.level}` : ''
  return {
    totalExperienceLine: '5+ лет',
    aboutMe: {
      body: `${pos}${lvl} — краткое описание и полная история подключатся к API компании и резюме.`,
      highlightsTitle: 'HIGHLIGHTS',
      highlights: candidate.tags?.length ? [candidate.tags.slice(0, 6).join(', ')] : ['—'],
    },
    workExperience: [
      {
        period: '2023 — н.в.',
        duration: '2 года',
        company: candidate.vacancy ?? 'Компания',
        companyMeta: '',
        title: pos,
        bullets: ['Опыт работы будет загружен из API при интеграции.'],
      },
    ],
    education: [
      {
        leftLabel: '—',
        institution: 'Учебное заведение',
        detail: 'Специализация будет загружена из резюме',
      },
    ],
    languages: ['Русский — родной', 'English — уточняется'],
    skillTags: candidate.tags?.length ? candidate.tags : ['React', 'TypeScript'],
    certifications: [],
    portfolio: [],
  }
}
