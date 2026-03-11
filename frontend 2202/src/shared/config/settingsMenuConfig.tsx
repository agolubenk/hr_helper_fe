/**
 * Конфигурация меню настроек
 * Настройки модулей — раскрывающийся список с ссылками на страницы настроек каждого блока.
 * Группы пользователей и Пользователи перенесены из Настроек компании в Пользователи и роли.
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
} from '@radix-ui/react-icons'
import { IntegrationsIcon } from '@/shared/components/icons/IntegrationsIcon'
import { Box } from '@radix-ui/themes'

export interface SettingsMenuItemConfig {
  id: string
  label: string
  icon?: ReactNode
  href?: string
  children?: SettingsMenuItemConfig[]
}

const iconStyle = { color: 'var(--gray-12)' } as const
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    id: 'settings-integrations',
    label: 'Интеграции и API',
    icon: <IntegrationsIcon size={16} />,
    href: '/account/profile',
  },
  {
    id: 'module-settings-personal',
    label: 'Настройки модулей',
    icon: ic(GearIcon),
    href: '/settings/modules',
  },
  {
    id: 'company-settings',
    label: 'Настройки компании',
    icon: <CompanyIcon />,
    href: '/company-settings',
    children: [
      {
        id: 'general-settings',
        label: 'Общие настройки',
        icon: ic(GearIcon),
        children: [
          { id: 'settings-users-list', label: 'Пользователи', icon: ic(PersonIcon), href: '/settings/users' },
          { id: 'settings-roles', label: 'Роли', icon: ic(GearIcon), href: '/settings/roles' },
          { id: 'settings-user-groups', label: 'Группы пользователей', icon: ic(PersonIcon), href: '/settings/user-groups' },
          { id: 'settings-permissions', label: 'Права доступа', icon: ic(FileTextIcon), href: '/settings/permissions' },
        ],
      },
      {
        id: 'module-settings',
        label: 'Настройки модулей',
        icon: ic(GearIcon),
        children: [
          {
            id: 'recruiting-settings',
            label: 'Рекрутинг',
            icon: ic(ChatBubbleIcon),
            href: '/company-settings/recruiting',
            children: [
              { id: 'recruiting-settings-interviewers', label: 'Интервьюеры', icon: ic(PersonIcon), href: '/interviewers' },
              { id: 'recruiting-settings-rules', label: 'Правила привлечения', icon: ic(GearIcon), href: '/company-settings/recruiting/rules' },
              { id: 'recruiting-settings-stages', label: 'Этапы найма и причины отказа', icon: <RatingScalesIcon />, href: '/company-settings/recruiting/stages' },
              { id: 'recruiting-settings-commands', label: 'Команды workflow', icon: ic(MixerHorizontalIcon), href: '/company-settings/recruiting/commands' },
              { id: 'recruiting-settings-candidate-fields', label: 'Дополнительные поля кандидатов', icon: ic(FileTextIcon), href: '/company-settings/candidate-fields' },
              { id: 'recruiting-settings-scorecard', label: 'Scorecard', icon: <RatingScalesIcon />, href: '/company-settings/scorecard' },
              { id: 'recruiting-settings-rating-scales', label: 'Шкалы оценок', icon: <RatingScalesIcon />, href: '/company-settings/rating-scales' },
              { id: 'recruiting-settings-sla', label: 'SLA', icon: ic(ClockIcon), href: '/company-settings/sla' },
              { id: 'recruiting-settings-vacancy-prompt', label: 'Единый промпт для вакансий', icon: ic(FileTextIcon), href: '/company-settings/vacancy-prompt' },
              { id: 'recruiting-settings-offer-template', label: 'Шаблон оффера', icon: ic(FileTextIcon), href: '/company-settings/recruiting/offer-template' },
              { id: 'recruiting-settings-candidate-responses', label: 'Ответы кандидатам', icon: ic(ChatBubbleIcon), href: '/candidate-responses' },
            ],
          },
          { id: 'module-settings-employees', label: 'Сотрудники', icon: ic(PersonIcon), href: '/settings/modules/employees' },
          { id: 'module-settings-onboarding', label: 'Онбординг', icon: ic(FileTextIcon), href: '/settings/modules/onboarding' },
          { id: 'module-settings-performance', label: 'Эффективность', icon: ic(StarIcon), href: '/settings/modules/performance' },
          { id: 'module-settings-learning', label: 'L&D', icon: ic(FileTextIcon), href: '/settings/modules/learning' },
          { id: 'module-settings-finance', label: 'Финансы', icon: ic(BarChartIcon), href: '/settings/modules/finance' },
          { id: 'module-settings-hr-services', label: 'HR-сервисы', icon: ic(ClockIcon), href: '/settings/modules/hr-services' },
          { id: 'settings-modules', label: 'Модули (вкл/выкл)', icon: ic(GearIcon), href: '/settings/modules' },
        ],
      },
      { id: 'company-settings-general', label: 'Общие', icon: ic(GearIcon), href: '/company-settings' },
      { id: 'company-settings-meeting-settings', label: 'Настройки встреч', icon: ic(ClockIcon), href: '/company-settings/meeting-settings' },
      { id: 'company-settings-org-structure', label: 'Оргструктура', icon: ic(PersonIcon), href: '/company-settings/org-structure' },
      { id: 'company-settings-grades', label: 'Грейды', icon: ic(PersonIcon), href: '/company-settings/grades' },
      { id: 'company-settings-rating-scales', label: 'Шкалы оценок', icon: <RatingScalesIcon />, href: '/company-settings/rating-scales' },
      { id: 'company-settings-lifecycle', label: 'Жизненный цикл сотрудников', icon: ic(MixerHorizontalIcon), href: '/company-settings/employee-lifecycle' },
      { id: 'company-settings-finance', label: 'Финансы', icon: ic(ClockIcon), href: '/company-settings/finance' },
      { id: 'company-settings-integrations', label: 'Интеграции', icon: <IntegrationsIcon size={16} />, href: '/company-settings/integrations' },
      { id: 'company-settings-custom-fields', label: 'Пользовательские поля', icon: ic(FileTextIcon), href: '/settings/custom-fields' },
    ],
  },
  {
    id: 'settings-workflows',
    label: 'Workflow settings',
    icon: ic(MixerHorizontalIcon),
    href: '/settings/workflows',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: ic(GearIcon),
    href: '/admin',
  },
]
