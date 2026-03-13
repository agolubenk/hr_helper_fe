import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompanyLogo } from '../ui/CompanyLogo'

describe('CompanyLogo', () => {
  it('renders image when logoUrl is provided', () => {
    render(<CompanyLogo logoUrl="/logo.png" name="Test Company" />)

    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/logo.png')
    expect(img).toHaveAttribute('alt', 'Test Company logo')
  })

  it('renders initials when logoUrl is not provided', () => {
    render(<CompanyLogo name="Test Company" />)

    expect(screen.getByText('TC')).toBeInTheDocument()
  })

  it('renders single initial for single word name', () => {
    render(<CompanyLogo name="Company" />)

    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('renders only first two initials for long name', () => {
    render(<CompanyLogo name="Very Long Company Name" />)

    expect(screen.getByText('VL')).toBeInTheDocument()
  })

  it('renders uppercase initials', () => {
    render(<CompanyLogo name="test company" />)

    expect(screen.getByText('TC')).toBeInTheDocument()
  })

  it('applies correct size class for sm', () => {
    render(<CompanyLogo name="Test Company" size="sm" />)

    const placeholder = screen.getByText('TC')
    expect(placeholder.className).toContain('sm')
  })

  it('applies correct size class for md', () => {
    render(<CompanyLogo name="Test Company" size="md" />)

    const placeholder = screen.getByText('TC')
    expect(placeholder.className).toContain('md')
  })

  it('applies correct size class for lg', () => {
    render(<CompanyLogo name="Test Company" size="lg" />)

    const placeholder = screen.getByText('TC')
    expect(placeholder.className).toContain('lg')
  })
})
