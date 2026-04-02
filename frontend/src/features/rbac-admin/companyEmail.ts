/** Домены корпоративной почты (мок компании). */
export const COMPANY_EMAIL_DOMAINS = ['company.ru', 'internal.company.ru'] as const

/** Значение селекта: ввести произвольный email. */
export const CUSTOM_EMAIL_DOMAIN_SENTINEL = '__custom__' as const

export type CompanyEmailFormState =
  | { mode: 'company'; local: string; domain: (typeof COMPANY_EMAIL_DOMAINS)[number] }
  | { mode: 'custom'; full: string }

export function parseCompanyEmail(raw: string): CompanyEmailFormState {
  const trimmed = raw.trim()
  if (!trimmed) {
    return { mode: 'company', local: '', domain: COMPANY_EMAIL_DOMAINS[0] }
  }
  const at = trimmed.lastIndexOf('@')
  if (at <= 0) {
    return { mode: 'custom', full: trimmed }
  }
  const local = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1)
  const known = COMPANY_EMAIL_DOMAINS.find((d) => d === domain)
  if (known) {
    return { mode: 'company', local, domain: known }
  }
  return { mode: 'custom', full: trimmed }
}

export function composeCompanyEmail(state: CompanyEmailFormState): string {
  if (state.mode === 'custom') {
    return state.full.trim()
  }
  const loc = state.local.trim()
  if (!loc) return ''
  return `${loc}@${state.domain}`
}
