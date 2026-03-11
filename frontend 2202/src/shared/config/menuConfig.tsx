/**
 * Конфигурация основного меню навигации
 * Расширена с учётом блоков: recruiting, employees, onboarding, performance,
 * learning, compensation, organization, hr-services, projects, analytics
 */
import type { ReactNode } from 'react'
import { SETTINGS_MENU_ITEMS } from './settingsMenuConfig'
import {
  HomeIcon,
  CalendarIcon,
  LayersIcon,
  GearIcon,
  ListBulletIcon,
  PersonIcon,
  ChatBubbleIcon,
  EnvelopeClosedIcon,
  GroupIcon,
  StackIcon,
  FileTextIcon,
  BarChartIcon,
  DashboardIcon,
  ClipboardIcon,
  ClockIcon,
  StarIcon,
  DotsHorizontalIcon,
  GlobeIcon,
  PlusIcon,
  MixerHorizontalIcon,
} from '@radix-ui/react-icons'
import { Box, Text } from '@radix-ui/themes'
import { IntegrationsIcon } from '@/shared/components/icons/IntegrationsIcon'
import {
  HHIcon,
  TelegramIcon,
  N8nIcon,
  ClickUpIcon,
  NotionBrandIcon,
  HuntflowIcon,
} from '@/shared/components/icons/IntegrationBrandIcons'

export interface MenuItemConfig {
  id: string
  label: string
  icon?: ReactNode
  href?: string
  children?: MenuItemConfig[]
}

const iconStyle = { color: 'var(--gray-12)' } as const
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ic = (N: React.ComponentType<any>) => <N width={16} height={16} style={iconStyle} />

/** Иконка доллара */
const DollarIcon = () => (
  <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Text size="1" style={{ color: 'var(--gray-12)' }}>$</Text>
  </Box>
)

/** Иконка ATS | Talent Pool */
const AtsTalentPoolIcon = () => (
  <Box style={{ width: 16, height: 16, position: 'relative', flexShrink: 0 }}>
    <Box style={{ position: 'absolute', top: 0, left: 0 }}>
      <GroupIcon width={9} height={9} style={{ color: 'var(--gray-12)' }} />
    </Box>
    <Box style={{ position: 'absolute', bottom: 3, left: 3 }}>
      <StackIcon width={9} height={9} style={{ color: 'var(--gray-12)' }} />
    </Box>
    <Box style={{ position: 'absolute', bottom: 0, right: 0 }}>
      <ChatBubbleIcon width={9} height={9} style={{ color: 'var(--gray-12)' }} />
    </Box>
  </Box>
)

/** Вакансия (квадрат) */
const VacancyIcon = () => (
  <Box style={{ width: '16px', height: '16px', border: '1px solid var(--gray-12)', borderRadius: '2px' }} />
)

/** AI Chat (круг с точкой) */
const AiChatIcon = () => (
  <Box style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid var(--gray-12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Box style={{ width: '6px', height: '6px', backgroundColor: 'var(--gray-12)', borderRadius: '50%' }} />
  </Box>
)

/** Funnel/воронка */
const FunnelIcon = () => (
  <Box style={{ width: '16px', height: '16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2L6 6V12L10 14V6L14 2H2Z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </Box>
)

/** Reporting company */
const ReportingCompanyIcon = () => (
  <Box style={{ width: '16px', height: '16px', border: '1px solid var(--gray-12)', borderRadius: '2px', position: 'relative' }}>
    <Box style={{ width: '10px', height: '6px', border: '1px solid var(--gray-12)', borderRadius: '1px', position: 'absolute', top: '2px', left: '2px' }} />
  </Box>
)

/** Interviewer для отчётности */
const ReportingInterviewerIcon = () => (
  <Box style={{ width: '16px', height: '16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <PersonIcon width={12} height={12} style={{ color: 'var(--gray-12)' }} />
  </Box>
)

/** Пункты 1 уровня (до черты) в порядке отображения */
const MENU_LEVEL1_ORDER: string[] = [
  'home',
  'calendar',
  'workflow-chat',
  'tasks',
  'recruiting',
  'onboarding',
  'hr-services',
  'employees',
  'learning',
  'performance',
  'finance',
  'hr-pr',
  'projects',
  'analytics',
  'integrations',
]

export const MAIN_MENU_ITEMS: MenuItemConfig[] = [
  { id: 'home', label: 'Главная', icon: ic(HomeIcon), href: '/workflow' },
  { id: 'calendar', label: 'Календарь', icon: ic(CalendarIcon), href: '/calendar' },
  { id: 'workflow-chat', label: 'Inbox / Workflow chat', icon: ic(ChatBubbleIcon), href: '/workflow' },
  { id: 'tasks', label: 'Задачи', icon: ic(ClipboardIcon), href: '/tasks' },
  {
    id: 'recruiting',
    label: 'Рекрутинг',
    icon: ic(ChatBubbleIcon),
    children: [
      { id: 'recr-chat', label: 'ATS | Talent Pool', icon: <AtsTalentPoolIcon />, href: '/recr-chat/vacancy/1/candidate/1' },
      { id: 'vacancies-list', label: 'Вакансии', icon: ic(ListBulletIcon), href: '/vacancies' },
      { id: 'vacancies-requests', label: 'Заявки на найм', icon: ic(ClipboardIcon), href: '/hiring-requests' },
      { id: 'invites', label: 'Интервью, ТЗ и скрининги', icon: ic(EnvelopeClosedIcon), href: '/invites' },
      { id: 'reporting-hiring-plan', label: 'План найма', icon: ic(ClipboardIcon), href: '/reporting/hiring-plan' },
      { id: 'recruiting-reports', label: 'Отчёты по подбору', icon: ic(BarChartIcon), href: '/reporting' },
    ],
  },
  {
    id: 'onboarding',
    label: 'Онбординг',
    icon: ic(FileTextIcon),
    children: [
      { id: 'onboarding-programs', label: 'Программы онбординга', icon: ic(ClipboardIcon), href: '/onboarding/programs' },
      { id: 'onboarding-checklists', label: 'Чек‑листы', icon: ic(ClipboardIcon), href: '/onboarding/checklists' },
      { id: 'onboarding-buddy', label: 'Бадди‑система', icon: ic(PersonIcon), href: '/onboarding/buddy' },
      { id: 'onboarding-docs', label: 'Документы онбординга', icon: ic(FileTextIcon), href: '/onboarding/documents' },
      { id: 'onboarding-reports', label: 'Отчёты по онбордингу', icon: ic(BarChartIcon), href: '/onboarding/reports' },
    ],
  },
  {
    id: 'hr-services',
    label: 'HROps',
    icon: ic(ClockIcon),
    children: [
      { id: 'hr-services-docs', label: 'Документы', icon: ic(FileTextIcon), href: '/hr-services/documents' },
      { id: 'hr-services-leave', label: 'Отпуска и отсутствия', icon: ic(CalendarIcon), href: '/hr-services/leave' },
      { id: 'hr-services-time', label: 'Учёт времени', icon: ic(ClockIcon), href: '/hr-services/time-tracking' },
      { id: 'hr-services-tickets', label: 'Тикет‑система', icon: ic(EnvelopeClosedIcon), href: '/hr-services/tickets' },
      { id: 'hr-services-offboarding', label: 'Offboarding', icon: ic(PersonIcon), href: '/hr-services/offboarding' },
      { id: 'hr-services-employee-relations', label: 'Employee relations', icon: ic(GroupIcon), href: '/hr-services/employee-relations' },
    ],
  },
  {
    id: 'employees',
    label: 'Сотрудники',
    icon: ic(PersonIcon),
    children: [
      { id: 'employees-directory', label: 'Список сотрудников', icon: ic(ListBulletIcon), href: '/employees' },
      { id: 'employees-profiles', label: 'Профили', icon: ic(PersonIcon), href: '/employees/profiles' },
      {
        id: 'specializations',
        label: 'Специализации',
        icon: ic(LayersIcon),
        children: [
          { id: 'specializations-all', label: 'Конфигуратор', icon: ic(LayersIcon), href: '/specializations' },
          { id: 'specializations-frontend', label: 'Frontend Development', icon: ic(GearIcon), href: '/specializations/frontend/info' },
          { id: 'specializations-backend', label: 'Backend Development', icon: ic(GearIcon), href: '/specializations/backend/info' },
        ],
      },
      { id: 'employees-orgchart', label: 'Оргструктура', icon: ic(GroupIcon), href: '/employees/org-chart' },
      { id: 'employees-internal-vacancies', label: 'Внутренний рынок / Внутренние вакансии', icon: <VacancyIcon />, href: '/internal-vacancies' },
      { id: 'employees-teams', label: 'Команды', icon: ic(GroupIcon), href: '/employees/teams' },
    ],
  },
  {
    id: 'learning',
    label: 'L&D',
    icon: ic(FileTextIcon),
    children: [
      { id: 'learning-courses', label: 'Курсы', icon: ic(ListBulletIcon), href: '/learning/courses' },
      { id: 'learning-programs', label: 'Программы', icon: ic(ClipboardIcon), href: '/learning/programs' },
      { id: 'learning-skills', label: 'Матрица навыков', icon: ic(LayersIcon), href: '/learning/skills-matrix' },
      { id: 'learning-idp', label: 'Планы развития', icon: ic(StarIcon), href: '/learning/idp' },
      { id: 'learning-reports', label: 'Отчёты по обучению', icon: ic(BarChartIcon), href: '/learning/reports' },
    ],
  },
  {
    id: 'performance',
    label: 'Эффективность',
    icon: ic(StarIcon),
    children: [
      { id: 'performance-goals', label: 'Цели и OKR', icon: ic(DashboardIcon), href: '/performance/goals' },
      { id: 'performance-reviews', label: 'Оценочные циклы', icon: ic(ClipboardIcon), href: '/performance/reviews' },
      { id: 'performance-rating-scales', label: 'Шкалы оценок', icon: ic(ListBulletIcon), href: '/company-settings/rating-scales' },
      { id: 'performance-ninebox', label: 'Nine‑box / калибровки', icon: ic(GroupIcon), href: '/performance/ninebox' },
      { id: 'performance-pip', label: 'PIP и планы улучшения', icon: ic(FileTextIcon), href: '/performance/pip' },
    ],
  },
  {
    id: 'finance',
    label: 'C&B',
    icon: <DollarIcon />,
    children: [
      { id: 'finance-salary-ranges', label: 'Зарплатные вилки', icon: <DollarIcon />, href: '/vacancies/salary-ranges' },
      {
        id: 'finance-benchmarks',
        label: 'Бенчмарки',
        icon: ic(ListBulletIcon),
        children: [
          { id: 'benchmarks-dashboard', label: 'Dashboard', icon: ic(DashboardIcon), href: '/finance/benchmarks' },
          { id: 'benchmarks-all', label: 'Все бенчмарки', icon: ic(ListBulletIcon), href: '/finance/benchmarks' },
        ],
      },
      { id: 'compensation-benefits', label: 'Льготы и бонусы', icon: ic(StarIcon), href: '/compensation/benefits' },
      { id: 'compensation-review', label: 'Пересмотр вознаграждения', icon: ic(ClockIcon), href: '/compensation/review' },
      { id: 'finance-reports', label: 'Отчёты по C&B', icon: ic(BarChartIcon), href: '/compensation/reports' },
    ],
  },
  {
    id: 'hr-pr',
    label: 'HR PR и внутренняя коммуникация',
    icon: ic(FileTextIcon),
    children: [
      { id: 'internal-site-main', label: 'Внутренний сайт', icon: ic(GlobeIcon), href: '/internal-site' },
      { id: 'internal-site-create', label: 'Посты / Создать пост', icon: ic(PlusIcon), href: '/internal-site/post/create' },
      { id: 'surveys', label: 'Опросы', icon: ic(ClipboardIcon), href: '/hr-services/surveys' },
      { id: 'wiki-all', label: 'Вики', icon: ic(ListBulletIcon), href: '/wiki' },
      { id: 'hr-pr-events', label: 'Ивенты и признание', icon: ic(StarIcon), href: '/hr-pr/events' },
    ],
  },
  {
    id: 'projects',
    label: 'Проекты и ресурсы',
    icon: ic(DashboardIcon),
    children: [
      { id: 'projects-list', label: 'Список проектов', icon: ic(ListBulletIcon), href: '/projects' },
      { id: 'projects-teams', label: 'Команды проекта', icon: ic(PersonIcon), href: '/projects/teams' },
      { id: 'projects-resources', label: 'Ресурсы и аллокация', icon: ic(BarChartIcon), href: '/projects/resources' },
      { id: 'projects-hr', label: 'HR‑проекты', icon: ic(ClipboardIcon), href: '/projects/hr' },
    ],
  },
  {
    id: 'analytics',
    label: 'Отчёты и аналитика',
    icon: ic(BarChartIcon),
    children: [
      { id: 'reporting-recruiting', label: 'По подбору', icon: ic(ChatBubbleIcon), href: '/reporting' },
      { id: 'reporting-employees', label: 'По сотрудникам и оргструктуре', icon: ic(PersonIcon), href: '/reporting/employees' },
      { id: 'reporting-finance', label: 'По финансам / cost of workforce', icon: <DollarIcon />, href: '/reporting/finance' },
      { id: 'reporting-integrations', label: 'По интеграциям и SLA сервисов', icon: <IntegrationsIcon size={16} />, href: '/reporting/integrations' },
      { id: 'reporting-learning', label: 'L&D и эффективность', icon: ic(StarIcon), href: '/reporting/learning' },
      { id: 'reporting-compensation', label: 'C&B и льготы', icon: <DollarIcon />, href: '/reporting/compensation' },
      { id: 'analytics-builder', label: 'Конструктор дашбордов', icon: ic(DashboardIcon), href: '/analytics' },
    ],
  },
  {
    id: 'integrations',
    label: 'Интеграции и автоматизации',
    icon: <IntegrationsIcon size={16} />,
    children: [
      {
        id: 'integrations-list',
        label: 'Интеграции',
        icon: ic(GearIcon),
        children: [
          { id: 'integrations-huntflow', label: 'Huntflow', icon: <HuntflowIcon size={16} style={iconStyle} />, href: '/huntflow' },
          { id: 'integrations-hh', label: 'HH', icon: <HHIcon size={16} style={iconStyle} />, href: '/integrations/hh' },
          { id: 'integrations-telegram', label: 'Telegram', icon: <TelegramIcon size={16} style={iconStyle} />, href: '/telegram' },
          { id: 'integrations-n8n', label: 'n8n', icon: <N8nIcon size={16} style={iconStyle} />, href: '/integrations/n8n' },
          { id: 'integrations-clickup', label: 'ClickUp', icon: <ClickUpIcon size={16} style={iconStyle} />, href: '/integrations/clickup' },
          { id: 'integrations-notion', label: 'Notion', icon: <NotionBrandIcon size={16} style={iconStyle} />, href: '/integrations/notion' },
        ],
      },
      { id: 'integrations-workflows', label: 'Automation / Workflows', icon: ic(MixerHorizontalIcon), href: '/settings/workflows' },
      { id: 'integrations-aichat', label: 'AI Chat / Copilot', icon: <AiChatIcon />, href: '/aichat' },
    ],
  },
]

/** Маппинг id пункта меню 1 уровня -> label группы (по аналогии с меню) */
export const MENU_LEVEL1_TO_LABEL: Record<string, string> = {
  home: 'Главная',
  calendar: 'Календарь',
  'workflow-chat': 'Inbox / Workflow chat',
  tasks: 'Задачи',
  recruiting: 'Рекрутинг',
  onboarding: 'Онбординг',
  'hr-services': 'HROps',
  employees: 'Сотрудники',
  learning: 'L&D',
  performance: 'Эффективность',
  finance: 'C&B',
  'hr-pr': 'HR PR и внутренняя коммуникация',
  projects: 'Проекты и ресурсы',
  analytics: 'Отчёты и аналитика',
  integrations: 'Интеграции и автоматизации',
}

/** Порядок групп на главной (без home) */
export const HOME_PAGE_GROUP_ORDER = MENU_LEVEL1_ORDER.filter((id) => id !== 'home')

/** Варианты фильтра модулей на главной странице */
export const MODULE_FILTER_OPTIONS = [
  'Все',
  ...HOME_PAGE_GROUP_ORDER.map((id) => MENU_LEVEL1_TO_LABEL[id] ?? id),
] as const

/** Маппинг id блока -> label группы (по аналогии с меню) */
function getFilterModule(blockId: string): string {
  if (/^calendar$/.test(blockId)) return 'Календарь'
  if (/^workflow-chat$/.test(blockId)) return 'Inbox / Workflow chat'
  if (/^tasks$/.test(blockId)) return 'Задачи'
  if (/^recr-|^invites$|^vacancies-|^reporting-hiring-plan$|^recruiting-reports$/.test(blockId)) return 'Рекрутинг'
  if (/^onboarding-/.test(blockId)) return 'Онбординг'
  if (/^hr-services-/.test(blockId)) return 'HROps'
  if (/^specializations-|^employees-/.test(blockId)) return 'Сотрудники'
  if (/^learning-/.test(blockId)) return 'L&D'
  if (/^performance-/.test(blockId)) return 'Эффективность'
  if (/^finance-|^benchmarks-|^compensation-/.test(blockId)) return 'C&B'
  if (/^internal-site-|^surveys$|^wiki-|^hr-pr-/.test(blockId)) return 'HR PR и внутренняя коммуникация'
  if (/^projects-/.test(blockId)) return 'Проекты и ресурсы'
  if (/^analytics-|^reporting-/.test(blockId)) return 'Отчёты и аналитика'
  if (/^integrations-/.test(blockId)) return 'Интеграции и автоматизации'
  if (/^settings-|^company-settings|^module-settings|^module-settings-personal|^recruiting-settings|^company-settings-/.test(blockId)) return 'Настройки компании'
  return 'Сотрудники' // fallback
}

/** Блок для главной страницы: id, label, href, icon, moduleId, filterModule */
export interface HomeBlockConfig {
  id: string
  label: string
  href: string
  icon?: ReactNode
  /** ID раздела для фильтрации (из MENU_SECTIONS) */
  moduleId?: string
  /** Категория для фильтра на главной: Рекрутинг, Сотрудники, Онбординг, L&D, C&B, HROps, HR PR */
  filterModule: string
}

type MenuLikeItem = { id: string; label: string; href?: string; icon?: ReactNode; children?: MenuLikeItem[] }

function collectItemsWithHref(
  items: MenuLikeItem[],
  skipIds: Set<string>,
  parentModuleId?: string
): HomeBlockConfig[] {
  const result: HomeBlockConfig[] = []
  function walk(list: MenuLikeItem[], moduleId?: string) {
    for (const item of list) {
      if (skipIds.has(item.id)) continue
      const mod = moduleId ?? (item.children?.length ? item.id : undefined)
      if (item.href) {
        result.push({
          id: item.id,
          label: item.label,
          href: item.href,
          icon: item.icon,
          moduleId: mod ?? parentModuleId ?? item.id,
          filterModule: getFilterModule(item.id),
        })
      }
      if (item.children?.length) walk(item.children, mod ?? moduleId)
    }
  }
  walk(items, parentModuleId)
  return result
}

/** Пункты 1 уровня в порядке отображения (до черты) */
export const MENU_SECTIONS: { label: string; itemIds: string[] }[] = [
  {
    label: 'Основное меню',
    itemIds: MENU_LEVEL1_ORDER,
  },
]

/** Все блоки главной страницы: основной меню + меню настроек */
export const HOME_PAGE_BLOCKS: HomeBlockConfig[] = [
  ...collectItemsWithHref(MAIN_MENU_ITEMS as MenuLikeItem[], new Set(['home'])),
  ...collectItemsWithHref(SETTINGS_MENU_ITEMS as unknown as MenuLikeItem[], new Set(), 'company-settings').map((b) => ({
    ...b,
    moduleId: b.moduleId ?? 'company-settings',
    filterModule: 'Настройки компании',
  })),
]
