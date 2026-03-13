import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VacancyStatusBadge } from '../ui/VacancyStatusBadge'

describe('VacancyStatusBadge', () => {
  it('renders "Активна" for active status', () => {
    render(<VacancyStatusBadge status="active" />)

    expect(screen.getByText('Активна')).toBeInTheDocument()
  })

  it('renders "Неактивна" for inactive status', () => {
    render(<VacancyStatusBadge status="inactive" />)

    expect(screen.getByText('Неактивна')).toBeInTheDocument()
  })

  it('renders "Черновик" for draft status', () => {
    render(<VacancyStatusBadge status="draft" />)

    expect(screen.getByText('Черновик')).toBeInTheDocument()
  })

  it('renders "В архиве" for archived status', () => {
    render(<VacancyStatusBadge status="archived" />)

    expect(screen.getByText('В архиве')).toBeInTheDocument()
  })

  it('applies correct class for active status', () => {
    render(<VacancyStatusBadge status="active" />)

    const badge = screen.getByText('Активна')
    expect(badge.className).toContain('active')
  })

  it('applies correct class for inactive status', () => {
    render(<VacancyStatusBadge status="inactive" />)

    const badge = screen.getByText('Неактивна')
    expect(badge.className).toContain('inactive')
  })

  it('applies medium size class when size is md', () => {
    render(<VacancyStatusBadge status="active" size="md" />)

    const badge = screen.getByText('Активна')
    expect(badge.className).toContain('medium')
  })

  it('does not apply medium class when size is sm', () => {
    render(<VacancyStatusBadge status="active" size="sm" />)

    const badge = screen.getByText('Активна')
    expect(badge.className).not.toContain('medium')
  })
})
