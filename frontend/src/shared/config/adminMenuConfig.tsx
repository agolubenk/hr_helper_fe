/**
 * Конфигурация меню админки
 * Левое меню: все модели/представления + блоки и системы из основного меню
 * Субменю: подэлементы выбранной модели
 */
import type { ReactNode } from 'react'
import {
  PersonIcon,
  GearIcon,
  LayersIcon,
  HomeIcon,
  FileTextIcon,
  GroupIcon,
  MixerHorizontalIcon,
  BookmarkIcon,
  ChatBubbleIcon,
  DashboardIcon,
  StarIcon,
  BarChartIcon,
  ClockIcon,
  GlobeIcon,
} from '@radix-ui/react-icons'
import { Box, Text } from '@radix-ui/themes'
import { IntegrationsIcon } from '@/shared/components/icons/IntegrationsIcon'

export interface AdminMenuItem {
  id: string
  label: string
  icon?: ReactNode
  href?: string
  children?: AdminMenuItem[]
}

const iconStyle = { color: 'var(--gray-12)' } as const
 
const ic = (N: React.ComponentType<any>) => <N width={16} height={16} style={iconStyle} />

const CompanyIcon = () => (
  <Box style={{ width: '16px', height: '16px', border: '1px solid var(--gray-12)', borderRadius: '2px', position: 'relative' }}>
    <Box style={{ width: '10px', height: '6px', border: '1px solid var(--gray-12)', borderRadius: '1px', position: 'absolute', top: '2px', left: '2px' }} />
  </Box>
)

const DollarIcon = () => (
  <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Text size="1" style={{ color: 'var(--gray-12)' }}>$</Text>
  </Box>
)

/** Основное меню админки — все модели, блоки и системы из main menu */
export const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    id: 'company',
    label: 'Компания',
    icon: <CompanyIcon />,
    href: '/admin/company',
    children: [
      { id: 'company-general', label: 'Общие настройки', href: '/admin/company' },
      { id: 'company-offices', label: 'Офисы и локации', href: '/admin/company/offices' },
      { id: 'company-schema', label: 'Схема полей', href: '/admin/company/schema' },
    ],
  },
  {
    id: 'users',
    label: 'Пользователи',
    icon: ic(PersonIcon),
    href: '/admin/users',
    children: [
      { id: 'users-list', label: 'Список', href: '/admin/users' },
      { id: 'users-roles', label: 'Роли', href: '/admin/users/roles' },
      { id: 'users-groups', label: 'Группы', href: '/admin/users/groups' },
      { id: 'users-schema', label: 'Схема полей', href: '/admin/users/schema' },
    ],
  },
  {
    id: 'departments',
    label: 'Отделы',
    icon: ic(LayersIcon),
    href: '/admin/departments',
    children: [
      { id: 'departments-list', label: 'Список', href: '/admin/departments' },
      { id: 'departments-structure', label: 'Оргструктура', href: '/admin/departments/structure' },
      { id: 'departments-schema', label: 'Схема полей', href: '/admin/departments/schema' },
    ],
  },
  {
    id: 'positions',
    label: 'Должности',
    icon: ic(FileTextIcon),
    href: '/admin/positions',
    children: [
      { id: 'positions-list', label: 'Список', href: '/admin/positions' },
      { id: 'positions-schema', label: 'Схема полей', href: '/admin/positions/schema' },
    ],
  },
  {
    id: 'locations',
    label: 'Локации',
    icon: ic(HomeIcon),
    href: '/admin/locations',
    children: [
      { id: 'locations-list', label: 'Список', href: '/admin/locations' },
      { id: 'locations-schema', label: 'Схема полей', href: '/admin/locations/schema' },
    ],
  },
  {
    id: 'grades',
    label: 'Грейды',
    icon: ic(BookmarkIcon),
    href: '/admin/grades',
    children: [
      { id: 'grades-list', label: 'Список', href: '/admin/grades' },
      { id: 'grades-schema', label: 'Схема полей', href: '/admin/grades/schema' },
    ],
  },
  {
    id: 'roles',
    label: 'Роли',
    icon: ic(GroupIcon),
    href: '/admin/roles',
    children: [
      { id: 'roles-list', label: 'Список', href: '/admin/roles' },
      { id: 'roles-permissions', label: 'Права доступа', href: '/admin/roles/permissions' },
      { id: 'roles-schema', label: 'Схема полей', href: '/admin/roles/schema' },
    ],
  },
  {
    id: 'custom-fields',
    label: 'Пользовательские поля',
    icon: ic(MixerHorizontalIcon),
    href: '/admin/custom-fields',
    children: [
      { id: 'custom-fields-list', label: 'Список', href: '/admin/custom-fields' },
      { id: 'custom-fields-schema', label: 'Схема', href: '/admin/custom-fields/schema' },
    ],
  },
  {
    id: 'field-reference',
    label: 'Справочник полей',
    icon: ic(GearIcon),
    href: '/admin/field-reference',
    children: [
      { id: 'field-reference-company', label: 'Company', href: '/admin/field-reference/company' },
      { id: 'field-reference-user', label: 'User', href: '/admin/field-reference/user' },
    ],
  },
  // --- Блоки и системы из основного меню ---
  {
    id: 'specializations',
    label: 'Специализации',
    icon: ic(LayersIcon),
    href: '/admin/specializations',
    children: [
      { id: 'specializations-config', label: 'Конфигуратор', href: '/admin/specializations' },
      { id: 'specializations-frontend', label: 'Frontend Development', href: '/admin/specializations/frontend' },
      { id: 'specializations-backend', label: 'Backend Development', href: '/admin/specializations/backend' },
    ],
  },
  {
    id: 'projects',
    label: 'Проекты',
    icon: ic(DashboardIcon),
    href: '/admin/projects',
    children: [
      { id: 'projects-list', label: 'Список проектов', href: '/admin/projects' },
      { id: 'projects-teams', label: 'Команды', href: '/admin/projects/teams' },
      { id: 'projects-resources', label: 'Ресурсы и аллокация', href: '/admin/projects/resources' },
    ],
  },
  {
    id: 'recruiting',
    label: 'Рекрутинг',
    icon: ic(ChatBubbleIcon),
    href: '/admin/recruiting',
    children: [
      { id: 'recruiting-ats', label: 'ATS | Talent Pool', href: '/admin/recruiting/ats' },
      { id: 'recruiting-invites', label: 'Интервью', href: '/admin/recruiting/invites' },
      { id: 'recruiting-vacancies', label: 'Вакансии', href: '/admin/recruiting/vacancies' },
      { id: 'recruiting-requests', label: 'Заявки', href: '/admin/recruiting/requests' },
      { id: 'recruiting-interviewers', label: 'Интервьюеры', href: '/admin/recruiting/interviewers' },
      { id: 'recruiting-stages', label: 'Этапы найма', href: '/admin/recruiting/stages' },
      { id: 'recruiting-commands', label: 'Команды workflow', href: '/admin/recruiting/commands' },
      { id: 'recruiting-candidate-fields', label: 'Поля кандидатов', href: '/admin/recruiting/candidate-fields' },
      { id: 'recruiting-scorecard', label: 'Scorecard', href: '/admin/recruiting/scorecard' },
      { id: 'recruiting-sla', label: 'SLA', href: '/admin/recruiting/sla' },
    ],
  },
  {
    id: 'employees',
    label: 'Сотрудники',
    icon: ic(PersonIcon),
    href: '/admin/employees',
    children: [
      { id: 'employees-directory', label: 'Справочник', href: '/admin/employees' },
      { id: 'employees-orgchart', label: 'Оргструктура', href: '/admin/employees/org-chart' },
      { id: 'employees-profiles', label: 'Профили', href: '/admin/employees/profiles' },
    ],
  },
  {
    id: 'onboarding',
    label: 'Онбординг',
    icon: ic(FileTextIcon),
    href: '/admin/onboarding',
    children: [
      { id: 'onboarding-checklists', label: 'Чек-листы', href: '/admin/onboarding/checklists' },
      { id: 'onboarding-buddy', label: 'Бадди-система', href: '/admin/onboarding/buddy' },
      { id: 'onboarding-docs', label: 'Документы', href: '/admin/onboarding/documents' },
    ],
  },
  {
    id: 'performance',
    label: 'Эффективность',
    icon: ic(StarIcon),
    href: '/admin/performance',
    children: [
      { id: 'performance-goals', label: 'Цели и OKR', href: '/admin/performance/goals' },
      { id: 'performance-reviews', label: 'Оценки', href: '/admin/performance/reviews' },
      { id: 'performance-360', label: 'Feedback 360', href: '/admin/performance/feedback-360' },
      { id: 'performance-talent', label: 'Talent Pool', href: '/admin/performance/talent-pool' },
    ],
  },
  {
    id: 'learning',
    label: 'Обучение',
    icon: ic(FileTextIcon),
    href: '/admin/learning',
    children: [
      { id: 'learning-courses', label: 'Курсы', href: '/admin/learning/courses' },
      { id: 'learning-programs', label: 'Программы', href: '/admin/learning/programs' },
      { id: 'learning-skills', label: 'Матрица навыков', href: '/admin/learning/skills-matrix' },
    ],
  },
  {
    id: 'finance',
    label: 'Финансы',
    icon: <DollarIcon />,
    href: '/admin/finance',
    children: [
      { id: 'finance-salary-ranges', label: 'Зарплатные вилки', href: '/admin/finance/salary-ranges' },
      { id: 'finance-benchmarks', label: 'Бенчмарки', href: '/admin/finance/benchmarks' },
      { id: 'finance-benefits', label: 'Льготы и бонусы', href: '/admin/finance/benefits' },
    ],
  },
  {
    id: 'hr-services',
    label: 'HR-сервисы',
    icon: ic(ClockIcon),
    href: '/admin/hr-services',
    children: [
      { id: 'hr-services-docs', label: 'Документы', href: '/admin/hr-services/documents' },
      { id: 'hr-services-leave', label: 'Отпуска', href: '/admin/hr-services/leave' },
      { id: 'hr-services-surveys', label: 'Опросы', href: '/admin/hr-services/surveys' },
      { id: 'hr-services-tickets', label: 'Тикет-система', href: '/admin/hr-services/tickets' },
      { id: 'hr-services-time', label: 'Учёт времени', href: '/admin/hr-services/time-tracking' },
    ],
  },
  {
    id: 'integrations',
    label: 'Интеграции',
    icon: <IntegrationsIcon size={16} />,
    href: '/admin/integrations',
    children: [
      { id: 'integrations-huntflow', label: 'Huntflow', href: '/admin/integrations/huntflow' },
      { id: 'integrations-aichat', label: 'AI Chat', href: '/admin/integrations/aichat' },
      { id: 'integrations-clickup', label: 'ClickUp', href: '/admin/integrations/clickup' },
      { id: 'integrations-notion', label: 'Notion', href: '/admin/integrations/notion' },
      { id: 'integrations-hh', label: 'HeadHunter.ru', href: '/admin/integrations/hh' },
      { id: 'integrations-telegram', label: 'Telegram', href: '/admin/integrations/telegram' },
      { id: 'integrations-n8n', label: 'n8n', href: '/admin/integrations/n8n' },
    ],
  },
  {
    id: 'wiki',
    label: 'Вики',
    icon: ic(FileTextIcon),
    href: '/admin/wiki',
    children: [
      { id: 'wiki-list', label: 'Список статей', href: '/admin/wiki' },
      { id: 'wiki-settings', label: 'Настройки', href: '/admin/wiki/settings' },
    ],
  },
  {
    id: 'internal-site',
    label: 'Внутренний сайт',
    icon: ic(GlobeIcon),
    href: '/admin/internal-site',
    children: [
      { id: 'internal-site-pages', label: 'Страницы', href: '/admin/internal-site' },
      { id: 'internal-site-settings', label: 'Настройки', href: '/admin/internal-site/settings' },
    ],
  },
  {
    id: 'analytics',
    label: 'Отчётность и аналитика',
    icon: ic(BarChartIcon),
    href: '/admin/analytics',
    children: [
      { id: 'analytics-recruiting', label: 'По подбору', href: '/admin/analytics/recruiting' },
      { id: 'analytics-finance', label: 'По финансам', href: '/admin/analytics/finance' },
      { id: 'analytics-employees', label: 'По сотрудникам', href: '/admin/analytics/employees' },
      { id: 'analytics-integrations', label: 'По интеграциям', href: '/admin/analytics/integrations' },
      { id: 'analytics-dashboard', label: 'Дашборды', href: '/admin/analytics/dashboard' },
      { id: 'analytics-reports', label: 'Отчёты', href: '/admin/analytics/reports' },
      { id: 'analytics-metrics', label: 'Метрики', href: '/admin/analytics/metrics' },
    ],
  },
]
