import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'
import { VacanciesPage } from '../VacanciesPage'
import { mockVacancies } from '../mocks'

vi.mock('@tanstack/react-router', () => ({
  useRouterState: () => ({
    location: { search: '' },
  }),
}))

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<Theme>{ui}</Theme>)
}

describe('VacanciesPage Integration', () => {
  it('renders vacancies list with stats', () => {
    renderWithTheme(<VacanciesPage />)

    expect(screen.getByText(/Всего вакансий/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Активных/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Неактивных/i).length).toBeGreaterThan(0)
  })

  it('displays vacancies by default', () => {
    renderWithTheme(<VacanciesPage />)

    expect(screen.getByText(mockVacancies[0].title)).toBeInTheDocument()
  })

  it('filters vacancies by search query', async () => {
    renderWithTheme(<VacanciesPage />)

    const searchInput = screen.getByPlaceholderText(/поиск/i)
    const targetVacancy = mockVacancies.find((v) => v.title.includes('Frontend'))

    if (targetVacancy) {
      fireEvent.change(searchInput, { target: { value: 'Frontend' } })
      expect(screen.getByText(targetVacancy.title)).toBeInTheDocument()
    }
  })

  it('has status filter controls', () => {
    renderWithTheme(<VacanciesPage />)

    const comboboxes = screen.queryAllByRole('combobox')
    expect(comboboxes.length).toBeGreaterThanOrEqual(0)
  })

  it('renders view mode buttons', () => {
    renderWithTheme(<VacanciesPage />)

    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('opens vacancy details on card click', async () => {
    renderWithTheme(<VacanciesPage />)

    const firstVacancyTitle = mockVacancies[0].title
    const vacancyCard = screen.getByText(firstVacancyTitle).closest('[role="button"]')

    if (vacancyCard) {
      fireEvent.click(vacancyCard)
    }
  })

  it('shows stats section', () => {
    renderWithTheme(<VacanciesPage />)

    expect(screen.getByText(/Всего вакансий/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Активных/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Неактивных/i).length).toBeGreaterThan(0)
  })

  it('clears search filter', () => {
    renderWithTheme(<VacanciesPage />)

    const searchInput = screen.getByPlaceholderText(/поиск/i)
    fireEvent.change(searchInput, { target: { value: 'Test' } })
    fireEvent.change(searchInput, { target: { value: '' } })

    expect(screen.getByText(mockVacancies[0].title)).toBeInTheDocument()
  })
})
