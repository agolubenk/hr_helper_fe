import { describe, expect, it } from 'vitest'
import {
  COMPANY_EMAIL_DOMAINS,
  composeCompanyEmail,
  parseCompanyEmail,
} from '@/features/rbac-admin/companyEmail'

describe('parseCompanyEmail', () => {
  it('parses known company domain', () => {
    const p = parseCompanyEmail('ivan@company.ru')
    expect(p).toEqual({ mode: 'company', local: 'ivan', domain: 'company.ru' })
  })

  it('returns custom for unknown domain', () => {
    const p = parseCompanyEmail('x@other.com')
    expect(p).toEqual({ mode: 'custom', full: 'x@other.com' })
  })
})

describe('composeCompanyEmail', () => {
  it('joins local and domain', () => {
    expect(
      composeCompanyEmail({ mode: 'company', local: 'a', domain: COMPANY_EMAIL_DOMAINS[0] })
    ).toBe(`a@${COMPANY_EMAIL_DOMAINS[0]}`)
  })

  it('returns custom full', () => {
    expect(composeCompanyEmail({ mode: 'custom', full: ' z@z.com ' })).toBe('z@z.com')
  })
})
