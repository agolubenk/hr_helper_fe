import type { Benchmark, BenchmarkSettings, BenchmarkStats, Grade, Vacancy } from './types'

export const MOCK_BENCHMARKS: Benchmark[] = [
  {
    id: 1,
    type: 'candidate',
    vacancy: 1,
    vacancy_name: 'Frontend Developer',
    grade: 1,
    grade_name: 'Middle',
    salary_from: '200000',
    salary_to: '300000',
    salary_display: '200 000 - 300 000 ₽',
    location: 'Москва',
    work_format: 'гибрид',
    compensation: 'ДМС, спортзал',
    benefits: 'Обеды, корпоративы',
    development: 'Конференции, курсы',
    technologies: 'React, TypeScript, Next.js',
    domain: 'fintech',
    domain_display: 'FinTech',
    hh_vacancy_id: '12345678',
    date_added: '2026-01-20T10:00:00Z',
    is_active: true,
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 2,
    type: 'vacancy',
    vacancy: 2,
    vacancy_name: 'Backend Developer',
    grade: 2,
    grade_name: 'Senior',
    salary_from: '300000',
    salary_to: '450000',
    salary_display: '300 000 - 450 000 ₽',
    location: 'Санкт-Петербург',
    work_format: 'удаленка',
    compensation: 'ДМС',
    benefits: 'Обеды',
    development: 'Курсы',
    technologies: 'Python, Django, PostgreSQL',
    domain: 'ecommerce',
    domain_display: 'E-commerce',
    hh_vacancy_id: '87654321',
    date_added: '2026-01-19T14:30:00Z',
    is_active: true,
    created_at: '2026-01-19T14:30:00Z',
    updated_at: '2026-01-19T14:30:00Z',
  },
]

export const MOCK_STATS: BenchmarkStats = {
  total_benchmarks: 2,
  active_benchmarks: 2,
  type_stats: [
    { type: 'candidate', count: 1, avg_salary_from: '200000', avg_salary_to: '300000' },
    { type: 'vacancy', count: 1, avg_salary_from: '300000', avg_salary_to: '450000' },
  ],
  grade_stats: [
    { grade__name: 'Middle', count: 1, avg_salary_from: '200000', avg_salary_to: '300000' },
    { grade__name: 'Senior', count: 1, avg_salary_from: '300000', avg_salary_to: '450000' },
  ],
}

export const MOCK_SETTINGS: BenchmarkSettings = {
  id: 1,
  vacancy_fields: ['work_format', 'compensation', 'benefits', 'development', 'technologies', 'domain'],
  candidate_fields: ['work_format', 'compensation', 'benefits'],
}

export const MOCK_GRADES: Grade[] = [
  { id: 1, name: 'Junior' },
  { id: 2, name: 'Middle' },
  { id: 3, name: 'Senior' },
  { id: 4, name: 'Lead' },
  { id: 5, name: 'Principal' },
]

export const MOCK_VACANCIES: Vacancy[] = [
  { id: 1, name: 'Frontend Developer', title: 'Frontend Developer' },
  { id: 2, name: 'Backend Developer', title: 'Backend Developer' },
  { id: 3, name: 'DevOps Engineer', title: 'DevOps Engineer' },
]

export async function fetchBenchmarksMock(): Promise<{
  benchmarks: Benchmark[]
  stats: BenchmarkStats
  settings: BenchmarkSettings
  grades: Grade[]
  vacancies: Vacancy[]
}> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return { benchmarks: MOCK_BENCHMARKS, stats: MOCK_STATS, settings: MOCK_SETTINGS, grades: MOCK_GRADES, vacancies: MOCK_VACANCIES }
}

