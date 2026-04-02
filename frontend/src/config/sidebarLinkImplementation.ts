/**
 * Определяет, ведёт ли внутренняя ссылка на реализованный экран (не ModulePlaceholder / 404).
 * Должно оставаться согласованным с `src/app/App.tsx`: новый полноценный маршрут → добавить сюда правило.
 */

/** Нормализует внутренний путь; `null` = внешняя ссылка (не подсвечиваем красным). */
export function normalizeInternalPath(href: string): string | null {
  const trimmed = href.trim()
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('//')
  ) {
    return null
  }
  let path = trimmed.split('?')[0].split('#')[0]
  if (!path.startsWith('/')) return null
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  return path || '/'
}

const COMPANY_SETTINGS_IMPLEMENTED = new Set<string>([
  '/company-settings',
  '/company-settings/org-structure',
  '/company-settings/grades',
  '/company-settings/rating-scales',
  '/company-settings/employee-lifecycle',
  '/company-settings/finance',
  '/company-settings/integrations',
  '/company-settings/calendar',
  '/company-settings/user-groups',
  '/company-settings/users',
  '/company-settings/system/localization',
  '/company-settings/system/gateways',
  '/company-settings/system/outbound',
  '/company-settings/system/sandbox',
  '/company-settings/recruiting',
  '/company-settings/recruiting/rules',
  '/company-settings/recruiting/stages',
  '/company-settings/recruiting/commands',
  '/company-settings/recruiting/candidate-fields',
  '/company-settings/recruiting/vacancy-fields',
  '/company-settings/recruiting/templates',
  '/company-settings/recruiting/response-templates',
  '/company-settings/recruiting/message-templates',
  '/company-settings/recruiting/company-blacklist',
  '/company-settings/recruiting/company-whitelist-donors',
  '/company-settings/scorecard',
  '/company-settings/Scorecard',
  '/company-settings/sla',
  '/company-settings/vacancy-prompt',
  '/company-settings/recruiting/offer-template',
  '/company-settings/finance/benchmarks',
])

const REPORTING_IMPLEMENTED = new Set<string>([
  '/reporting',
  '/reporting/company',
  '/reporting/hiring-plan',
  '/reporting/hiring-plan/yearly',
])

const EXACT_IMPLEMENTED = new Set<string>([
  '/',
  '/workflow',
  '/aichat',
  '/huntflow',
  '/calendar',
  '/search',
  '/interviewers',
  '/candidate-responses',
  '/hiring-requests',
  '/finance',
  '/finance/benchmarks',
  '/finance/benchmarks/all',
  '/telegram',
  '/telegram/2fa',
  '/telegram/chats',
  '/account/login',
  '/account/forgot-password',
  '/account/reset-password',
  '/account/profile',
  '/settings/modules',
  '/settings/users',
  '/settings/users/new',
  '/settings/roles',
  '/settings/permissions',
  '/settings/user-groups',
  '/tasks',
  '/work-items',
])

/**
 * `true` — есть полноценная страница (или редирект на неё). `false` — заглушка или 404.
 * Для внешних URL не вызывать: `normalizeInternalPath` вернёт `null`.
 */
export function isImplementedAppRoute(href: string): boolean {
  const p = normalizeInternalPath(href)
  if (p === null) return true

  if (p === '/company-settings' || p.startsWith('/company-settings/')) {
    return COMPANY_SETTINGS_IMPLEMENTED.has(p)
  }

  if (p === '/reporting' || p.startsWith('/reporting/')) {
    return REPORTING_IMPLEMENTED.has(p)
  }

  if (p === '/wiki' || p.startsWith('/wiki/')) return true
  if (p === '/wiki-new' || p.startsWith('/wiki-new/')) return true

  if (p === '/internal-site' || p.startsWith('/internal-site/')) return true

  if (p === '/meet' || p.startsWith('/meet/')) return true

  if (p === '/coding-platform' || p.startsWith('/coding-platform/')) return true

  if (p === '/link-builder') return true

  if (p === '/invites' || p.startsWith('/invites/')) return true

  if (p.startsWith('/vacancies/salary-ranges')) return true
  if (p === '/vacancies') return true
  if (/^\/vacancies\/[^/]+\/edit$/.test(p) || /^\/vacancies\/[^/]+$/.test(p)) return true

  if (p.startsWith('/projects/')) {
    if (p === '/projects/teams' || p === '/projects/resources') return true
    if (p === '/projects/hr') return false
    return /^\/projects\/[^/]+$/.test(p)
  }
  if (p === '/projects') return true

  if (p === '/ats' || p.startsWith('/ats/')) return true

  /* L&D: единый модуль-заглушка в App.tsx (`/learning/*`) */
  if (p === '/learning' || p.startsWith('/learning/')) return true

  if (p === '/admin' || p === '/admin/users' || p === '/admin/groups') return true

  if (p === '/specializations' || p.startsWith('/specializations/')) return true

  if (p.startsWith('/admin-crm')) return true

  if (
    p === '/errors/401' ||
    p === '/errors/402' ||
    p === '/errors/403' ||
    p === '/errors/forbidden' ||
    p === '/errors/500'
  ) {
    return true
  }

  return EXACT_IMPLEMENTED.has(p)
}

/** Красная подпись в сайдбаре: только внутренние href без реальной страницы. */
export function shouldMarkSidebarLinkAsPlaceholder(item: {
  href?: string
  external?: boolean
}): boolean {
  if (!item.href || item.external) return false
  return !isImplementedAppRoute(item.href)
}
