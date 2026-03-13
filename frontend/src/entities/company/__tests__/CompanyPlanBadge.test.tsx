import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompanyPlanBadge } from '../ui/CompanyPlanBadge'

describe('CompanyPlanBadge', () => {
  it('renders "Free" for free plan', () => {
    render(<CompanyPlanBadge plan="free" />)

    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('renders "Starter" for starter plan', () => {
    render(<CompanyPlanBadge plan="starter" />)

    expect(screen.getByText('Starter')).toBeInTheDocument()
  })

  it('renders "Professional" for professional plan', () => {
    render(<CompanyPlanBadge plan="professional" />)

    expect(screen.getByText('Professional')).toBeInTheDocument()
  })

  it('renders "Enterprise" for enterprise plan', () => {
    render(<CompanyPlanBadge plan="enterprise" />)

    expect(screen.getByText('Enterprise')).toBeInTheDocument()
  })

  it('applies correct class for free plan', () => {
    render(<CompanyPlanBadge plan="free" />)

    const badge = screen.getByText('Free')
    expect(badge.className).toContain('free')
  })

  it('applies correct class for starter plan', () => {
    render(<CompanyPlanBadge plan="starter" />)

    const badge = screen.getByText('Starter')
    expect(badge.className).toContain('starter')
  })

  it('applies correct class for professional plan', () => {
    render(<CompanyPlanBadge plan="professional" />)

    const badge = screen.getByText('Professional')
    expect(badge.className).toContain('professional')
  })

  it('applies correct class for enterprise plan', () => {
    render(<CompanyPlanBadge plan="enterprise" />)

    const badge = screen.getByText('Enterprise')
    expect(badge.className).toContain('enterprise')
  })
})
