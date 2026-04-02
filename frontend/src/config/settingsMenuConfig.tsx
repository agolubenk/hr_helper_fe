/**
 * Конфигурация меню настроек (после Separator)
 * Порядок: Профиль, Workflow settings, Интеграции и API, Настройки компании, Admin.
 * Настройки модулей — вложены в Настройки компании.
 */
import type { ReactNode } from 'react'
import {
  PersonIcon,
  GearIcon,
  FileTextIcon,
  ChatBubbleIcon,
  ClockIcon,
  MixerHorizontalIcon,
  StarIcon,
  BarChartIcon,
  LayersIcon,
  GlobeIcon,
  LockClosedIcon,
  DashboardIcon,
  CalendarIcon,
  BoxIcon,
  ArrowTopRightIcon,
  ListBulletIcon,
  ArrowRightIcon,
  EnvelopeClosedIcon,
  ActivityLogIcon,
  Cross2Icon,
  PlusIcon,
  Link2Icon,
} from '@radix-ui/react-icons'
import { IntegrationsIcon } from '@/components/icons/IntegrationsIcon'
import { Box } from '@radix-ui/themes'

export interface SettingsMenuItemConfig {
  id: string
  label: string
  icon?: ReactNode
  href?: string
  children?: SettingsMenuItemConfig[]
}

const iconStyle = { color: 'var(--gray-12)' } as const
 
const ic = (N: React.ComponentType<any>) => <N width={16} height={16} style={iconStyle} />

const CompanyIcon = () => (
  <Box style={{ width: '16px', height: '16px', border: '1px solid var(--gray-12)', borderRadius: '2px', position: 'relative' }}>
    <Box style={{ width: '10px', height: '6px', border: '1px solid var(--gray-12)', borderRadius: '1px', position: 'absolute', top: '2px', left: '2px' }} />
  </Box>
)

const RatingScalesIcon = () => (
  <Box style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Box style={{ width: '2px', height: '12px', backgroundColor: 'var(--gray-12)', marginRight: '2px' }} />
    <Box style={{ width: '2px', height: '12px', backgroundColor: 'var(--gray-12)' }} />
  </Box>
)

export const SETTINGS_MENU_ITEMS: SettingsMenuItemConfig[] = [
  {
    id: 'profile',
    label: 'Профиль',
    icon: ic(PersonIcon),
    href: '/account/profile',
  },
  {
    id: 'settings-workflows',
    label: 'Workflow settings',
    icon: ic(MixerHorizontalIcon),
    href: '/settings/workflows',
  },
  {
    id: 'settings-integrations',
    label: 'Интеграции и API',
    icon: <IntegrationsIcon size={16} />,
    href: '/account/profile',
  },
  {
    id: 'company-settings',
    label: 'Настройки компании',
    icon: <CompanyIcon />,
    href: '/company-settings',
    children: [
      {
        id: 'basic-company-settings',
        label: 'Базовые настройки компании',
        icon: ic(GearIcon),
        children: [
          { id: 'company-general', label: 'Общие настройки компании', icon: ic(GearIcon), href: '/company-settings' },
          {
            id: 'company-calendar',
            label: 'Рабочий календарь',
            icon: ic(CalendarIcon),
            href: '/company-settings/calendar?tab=general',
          },
        ],
      },
      {
        id: 'people-org-settings',
        label: 'Настройки людей и оргструктуры',
        icon: ic(PersonIcon),
        children: [
          { id: 'company-settings-org-structure', label: 'Оргструктура', icon: ic(PersonIcon), href: '/company-settings/org-structure' },
          { id: 'company-settings-grades', label: 'Грейды и грейдовые модели', icon: ic(PersonIcon), href: '/company-settings/grades' },
          { id: 'specializations-settings', label: 'Специализации и карьерные треки', icon: ic(LayersIcon), href: '/specializations' },
          { id: 'company-settings-lifecycle', label: 'Жизненный цикл сотрудника', icon: ic(MixerHorizontalIcon), href: '/company-settings/employee-lifecycle' },
        ],
      },
      {
        id: 'module-settings',
        label: 'Настройки модулей (по доменам)',
        icon: ic(GearIcon),
        children: [
          {
            id: 'recruiting-settings',
            label: 'Рекрутинг',
            icon: ic(ChatBubbleIcon),
            href: '/company-settings/recruiting',
            children: [
              {
                id: 'recruiting-settings-process',
                label: 'Процесс найма',
                icon: ic(MixerHorizontalIcon),
                children: [
                  { id: 'recruiting-settings-stages', label: 'Статусы воронки', icon: <RatingScalesIcon />, href: '/company-settings/recruiting/stages' },
                  { id: 'recruiting-settings-sla', label: 'SLA', icon: ic(ClockIcon), href: '/company-settings/sla' },
                  { id: 'recruiting-settings-scorecard', label: 'Scorecard', icon: <RatingScalesIcon />, href: '/company-settings/Scorecard' },
                  { id: 'recruiting-settings-rating-scales', label: 'Шкалы оценок', icon: <RatingScalesIcon />, href: '/company-settings/rating-scales' },
                ],
              },
              {
                id: 'recruiting-settings-vacancies',
                label: 'Вакансии',
                icon: ic(BoxIcon),
                children: [
                  { id: 'recruiting-settings-vacancy-types', label: 'Типы вакансий', icon: ic(BoxIcon), href: '/company-settings/recruiting/vacancy-types' },
                  { id: 'recruiting-settings-vacancy-prompt', label: 'Единый промпт для вакансий', icon: ic(FileTextIcon), href: '/company-settings/vacancy-prompt' },
                  { id: 'recruiting-settings-vacancy-permissions', label: 'Права по вакансиям', icon: ic(LockClosedIcon), href: '/company-settings/recruiting/permissions' },
                ],
              },
              {
                id: 'recruiting-settings-candidates-sources',
                label: 'Кандидаты и источники',
                icon: ic(ArrowTopRightIcon),
                children: [
                  { id: 'recruiting-settings-sources', label: 'Источники кандидатов', icon: ic(ArrowTopRightIcon), href: '/company-settings/recruiting/sources' },
                  { id: 'recruiting-settings-company-blacklist', label: 'Черный список компаний', icon: ic(Cross2Icon), href: '/company-settings/recruiting/company-blacklist' },
                  { id: 'recruiting-settings-company-whitelist-donors', label: 'Белый список компаний / доноры', icon: ic(PlusIcon), href: '/company-settings/recruiting/company-whitelist-donors' },
                ],
              },
              {
                id: 'recruiting-settings-comms',
                label: 'Коммуникации и документы',
                icon: ic(FileTextIcon),
                children: [
                  { id: 'recruiting-settings-templates-response', label: 'Шаблоны ответов кандидатам', icon: ic(ChatBubbleIcon), href: '/company-settings/recruiting/response-templates' },
                  { id: 'recruiting-settings-templates-offer', label: 'Шаблон оффера', icon: ic(FileTextIcon), href: '/company-settings/recruiting/offer-template' },
                  { id: 'recruiting-settings-templates-messages', label: 'Шаблоны писем и сообщений', icon: ic(EnvelopeClosedIcon), href: '/company-settings/recruiting/message-templates' },
                ],
              },
              {
                id: 'recruiting-settings-automation-data',
                label: 'Автоматизация и данные',
                icon: ic(GearIcon),
                children: [
                  { id: 'recruiting-settings-rules', label: 'Автоматизация сорсинга', icon: ic(GearIcon), href: '/company-settings/recruiting/rules' },
                  { id: 'recruiting-settings-commands', label: 'Команды workflow', icon: ic(MixerHorizontalIcon), href: '/company-settings/recruiting/commands' },
                  { id: 'recruiting-settings-candidate-fields', label: 'Дополнительные поля кандидатов', icon: ic(FileTextIcon), href: '/company-settings/recruiting/candidate-fields' },
                  { id: 'recruiting-settings-vacancy-fields', label: 'Дополнительные поля вакансии', icon: ic(FileTextIcon), href: '/company-settings/recruiting/vacancy-fields' },
                ],
              },
            ],
          },
          {
            id: 'onboarding-settings',
            label: 'Онбординг',
            icon: ic(FileTextIcon),
            children: [
              { id: 'onboarding-templates', label: 'Шаблоны программ по ролям/локациям', icon: ic(FileTextIcon), href: '/settings/modules/onboarding' },
              { id: 'onboarding-checklists', label: 'Чек-листы', icon: ic(ListBulletIcon), href: '/onboarding/checklists' },
              { id: 'onboarding-roles', label: 'Роли ответственных (HR, менеджер, бадди)', icon: ic(PersonIcon), href: '/company-settings/onboarding-roles' },
            ],
          },
          {
            id: 'hr-ops-settings',
            label: 'HROps',
            icon: ic(ClockIcon),
            children: [
              { id: 'hr-ops-doc-types', label: 'Типы документов', icon: ic(FileTextIcon), href: '/company-settings/hr-ops/doc-types' },
              { id: 'hr-ops-approval-routes', label: 'Маршруты согласования', icon: ic(ArrowRightIcon), href: '/company-settings/hr-ops/approval-routes' },
              { id: 'hr-ops-leave-processes', label: 'Процессы отпусков и отсутствий', icon: ic(CalendarIcon), href: '/company-settings/hr-ops/leave' },
              { id: 'hr-ops-time-tracking', label: 'Правила учёта времени', icon: ic(ClockIcon), href: '/company-settings/hr-ops/time-tracking' },
            ],
          },
          {
            id: 'employees-module-settings',
            label: 'Сотрудники',
            icon: ic(PersonIcon),
            children: [
              { id: 'employees-contract-types', label: 'Типы контрактов', icon: ic(FileTextIcon), href: '/settings/modules/employees' },
              { id: 'employees-categories', label: 'Категории (staff/contractor/intern)', icon: ic(PersonIcon), href: '/company-settings/employees/categories' },
              { id: 'employees-data-policies', label: 'Политики хранения данных', icon: ic(LockClosedIcon), href: '/company-settings/employees/data-policies' },
            ],
          },
          {
            id: 'learning-settings',
            label: 'L&D',
            icon: ic(FileTextIcon),
            children: [
              { id: 'learning-course-types', label: 'Типы курсов', icon: ic(FileTextIcon), href: '/settings/modules/learning' },
              { id: 'learning-providers', label: 'Внешние провайдеры', icon: ic(GlobeIcon), href: '/company-settings/learning/providers' },
              { id: 'learning-catalogs', label: 'Каталоги', icon: ic(ListBulletIcon), href: '/company-settings/learning/catalogs' },
              { id: 'learning-mandatory-rules', label: 'Правила обязательных курсов', icon: ic(FileTextIcon), href: '/company-settings/learning/mandatory' },
            ],
          },
          {
            id: 'performance-settings',
            label: 'Эффективность',
            icon: ic(StarIcon),
            children: [
              { id: 'performance-review-types', label: 'Типы оценок (1-1, 360, probation)', icon: ic(StarIcon), href: '/settings/modules/performance' },
              { id: 'company-settings-rating-scales', label: 'Шкалы', icon: <RatingScalesIcon />, href: '/company-settings/rating-scales' },
              { id: 'performance-cycle-duration', label: 'Длительность циклов', icon: ic(ClockIcon), href: '/company-settings/performance/cycles' },
              { id: 'performance-form-templates', label: 'Шаблоны форм', icon: ic(FileTextIcon), href: '/company-settings/performance/forms' },
            ],
          },
          {
            id: 'compensation-settings',
            label: 'C&B',
            icon: ic(BarChartIcon),
            children: [
              { id: 'compensation-bands', label: 'Модели вилок (midpoint/graded)', icon: ic(BarChartIcon), href: '/vacancies/salary-ranges' },
              { id: 'compensation-currency', label: 'Валюта по локациям', icon: ic(BarChartIcon), href: '/company-settings/finance' },
              { id: 'compensation-indexation', label: 'Правила индексации', icon: ic(ClockIcon), href: '/company-settings/compensation/indexation' },
              { id: 'compensation-grades-link', label: 'Связи с грейдами', icon: ic(LayersIcon), href: '/company-settings/grades' },
            ],
          },
          {
            id: 'hr-pr-settings',
            label: 'HR PR / Коммуникации',
            icon: ic(GlobeIcon),
            children: [
              { id: 'hr-pr-site-sections', label: 'Разделы внутреннего сайта', icon: ic(GlobeIcon), href: '/internal-site' },
              { id: 'hr-pr-survey-types', label: 'Типы опросов', icon: ic(ChatBubbleIcon), href: '/hr-services/surveys' },
              { id: 'hr-pr-anonymity', label: 'Правила анонимности', icon: ic(LockClosedIcon), href: '/company-settings/hr-pr/anonymity' },
              { id: 'hr-pr-moderation', label: 'Модерация', icon: ic(GearIcon), href: '/company-settings/hr-pr/moderation' },
            ],
          },
          {
            id: 'projects-settings',
            label: 'Проекты',
            icon: ic(DashboardIcon),
            children: [
              { id: 'projects-types', label: 'Типы проектов', icon: ic(BoxIcon), href: '/projects' },
              { id: 'projects-statuses', label: 'Статусы', icon: ic(ListBulletIcon), href: '/company-settings/projects/statuses' },
              { id: 'projects-role-templates', label: 'Шаблоны ролей', icon: ic(PersonIcon), href: '/company-settings/projects/roles' },
              { id: 'projects-cost-center', label: 'Связь с cost-center\'ами', icon: ic(BarChartIcon), href: '/company-settings/projects/cost-centers' },
            ],
          },
          {
            id: 'hr-services-settings',
            label: 'HR-сервисы',
            icon: ic(ClockIcon),
            children: [
              { id: 'hr-services-ticket-types', label: 'Типы сервисов/тикетов', icon: ic(ChatBubbleIcon), href: '/settings/modules/hr-services' },
              { id: 'hr-services-sla', label: 'SLA', icon: ic(ClockIcon), href: '/company-settings/sla' },
              { id: 'hr-services-escalation', label: 'Маршруты эскалации', icon: ic(ArrowRightIcon), href: '/company-settings/hr-services/escalation' },
            ],
          },
        ],
      },
      {
        id: 'analytics-data-settings',
        label: 'Настройки аналитики и данных',
        icon: ic(DashboardIcon),
        children: [
          { id: 'analytics-data-sources', label: 'Источники данных', icon: ic(BarChartIcon), href: '/company-settings/analytics/data-sources' },
          { id: 'analytics-metrics', label: 'Справочники метрик', icon: ic(BarChartIcon), href: '/company-settings/analytics/metrics' },
          { id: 'analytics-dashboard-access', label: 'Доступ к дашбордам', icon: ic(DashboardIcon), href: '/company-settings/analytics/access' },
          { id: 'analytics-retention', label: 'Политики хранения и ретеншн', icon: ic(LockClosedIcon), href: '/company-settings/analytics/retention' },
        ],
      },
      {
        id: 'automations-integrations',
        label: 'Автоматизации и интеграции',
        icon: ic(MixerHorizontalIcon),
        children: [
          { id: 'automations-triggers', label: 'Конструктор триггеров и действий', icon: ic(MixerHorizontalIcon), href: '/settings/workflows' },
          { id: 'automations-templates', label: 'Шаблоны сценариев', icon: ic(FileTextIcon), href: '/company-settings/automations/templates' },
          { id: 'company-settings-integrations', label: 'Интеграции и API', icon: <IntegrationsIcon size={16} />, href: '/company-settings/integrations' },
          { id: 'automations-logs', label: 'Логи автоматизаций', icon: ic(ActivityLogIcon), href: '/company-settings/automations/logs' },
        ],
      },
      {
        id: 'security-access',
        label: 'Безопасность и доступы',
        icon: ic(LockClosedIcon),
        children: [
          { id: 'settings-roles', label: 'Роли и права (RBAC)', icon: ic(GearIcon), href: '/settings/roles' },
          { id: 'settings-user-groups', label: 'Группы пользователей', icon: ic(PersonIcon), href: '/settings/user-groups' },
          { id: 'settings-permissions', label: 'Права доступа', icon: ic(FileTextIcon), href: '/settings/permissions' },
          { id: 'settings-users-list', label: 'Пользователи', icon: ic(PersonIcon), href: '/settings/users' },
          { id: 'security-sso', label: 'SSO и аутентификация', icon: ic(LockClosedIcon), href: '/company-settings/security/sso' },
          { id: 'security-audit', label: 'Аудит-лог', icon: ic(ActivityLogIcon), href: '/company-settings/security/audit' },
        ],
      },
      {
        id: 'system-settings',
        label: 'Системные настройки',
        icon: ic(GearIcon),
        children: [
          { id: 'settings-modules', label: 'Модули (вкл/выкл)', icon: ic(GearIcon), href: '/settings/modules' },
          { id: 'system-localization', label: 'Локализация и переводы', icon: ic(GlobeIcon), href: '/company-settings/system/localization' },
          { id: 'system-email-gateways', label: 'Почта и мессенджер-шлюзы', icon: ic(EnvelopeClosedIcon), href: '/company-settings/system/gateways' },
          { id: 'system-outbound-api-webhooks', label: 'Исходящие API и вебхуки', icon: ic(Link2Icon), href: '/company-settings/system/outbound' },
          { id: 'system-sandbox', label: 'Песочница/стенд', icon: ic(BoxIcon), href: '/company-settings/system/sandbox' },
        ],
      },
    ],
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: ic(GearIcon),
    href: '/admin',
  },
]
