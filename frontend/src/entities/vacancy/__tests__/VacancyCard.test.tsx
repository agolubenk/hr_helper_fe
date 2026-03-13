import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VacancyCard } from '../ui/VacancyCard'
import type { VacancyListItem } from '../model'

const mockVacancy: VacancyListItem = {
  id: 1,
  title: 'Frontend Developer',
  status: 'active',
  recruiterName: 'John Doe',
  locations: ['Минск', 'Удалённо'],
  interviewersCount: 2,
  date: '25.10.2025',
  hasWarning: false,
}

const mockVacancyWithWarning: VacancyListItem = {
  ...mockVacancy,
  hasWarning: true,
  warningText: 'Зарплатные вилки не установлены',
}

describe('VacancyCard', () => {
  it('renders vacancy title', () => {
    render(<VacancyCard vacancy={mockVacancy} />)

    expect(screen.getByText('Frontend Developer')).toBeInTheDocument()
  })

  it('renders recruiter name', () => {
    render(<VacancyCard vacancy={mockVacancy} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })

  it('renders locations', () => {
    render(<VacancyCard vacancy={mockVacancy} />)

    expect(screen.getByText('Минск, Удалённо')).toBeInTheDocument()
  })

  it('renders interviewers count', () => {
    render(<VacancyCard vacancy={mockVacancy} />)

    expect(screen.getByText('2 интервьюеров')).toBeInTheDocument()
  })

  it('renders date', () => {
    render(<VacancyCard vacancy={mockVacancy} />)

    expect(screen.getByText('25.10.2025')).toBeInTheDocument()
  })

  it('renders warning when hasWarning is true', () => {
    render(<VacancyCard vacancy={mockVacancyWithWarning} />)

    expect(screen.getByText('Зарплатные вилки не установлены')).toBeInTheDocument()
  })

  it('does not render warning when hasWarning is false', () => {
    render(<VacancyCard vacancy={mockVacancy} />)

    expect(
      screen.queryByText('Зарплатные вилки не установлены')
    ).not.toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<VacancyCard vacancy={mockVacancy} onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledWith(1)
  })

  it('calls onClick on Enter key press', () => {
    const handleClick = vi.fn()
    render(<VacancyCard vacancy={mockVacancy} onClick={handleClick} />)

    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })

    expect(handleClick).toHaveBeenCalledWith(1)
  })

  it('applies selected class when selected prop is true', () => {
    render(<VacancyCard vacancy={mockVacancy} selected />)

    const card = screen.getByRole('button')
    expect(card.className).toContain('selected')
  })

  it('does not render locations section when locations array is empty', () => {
    const vacancyWithoutLocations = { ...mockVacancy, locations: [] }
    render(<VacancyCard vacancy={vacancyWithoutLocations} />)

    expect(screen.queryByText('Минск, Удалённо')).not.toBeInTheDocument()
  })

  it('does not render interviewers count when count is 0', () => {
    const vacancyWithoutInterviewers = { ...mockVacancy, interviewersCount: 0 }
    render(<VacancyCard vacancy={vacancyWithoutInterviewers} />)

    expect(screen.queryByText(/интервьюеров/)).not.toBeInTheDocument()
  })
})
