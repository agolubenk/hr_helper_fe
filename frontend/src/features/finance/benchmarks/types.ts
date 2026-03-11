export type BenchmarkType = 'candidate' | 'vacancy'

export interface Benchmark {
  id: number
  type: BenchmarkType
  vacancy: number
  vacancy_name: string
  grade: number
  grade_name: string
  salary_from: string
  salary_to: string
  salary_display: string
  location: string
  work_format: string
  compensation: string
  benefits: string
  development: string
  technologies: string
  domain: string
  domain_display: string
  hh_vacancy_id?: string
  date_added: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BenchmarkTypeStat {
  type: BenchmarkType
  count: number
  avg_salary_from: string
  avg_salary_to: string
}

export interface BenchmarkGradeStat {
  grade__name: string
  count: number
  avg_salary_from: string
  avg_salary_to: string
}

export interface BenchmarkStats {
  total_benchmarks: number
  active_benchmarks: number
  type_stats: BenchmarkTypeStat[]
  grade_stats: BenchmarkGradeStat[]
}

export interface BenchmarkSettings {
  id: number
  vacancy_fields: string[]
  candidate_fields: string[]
}

export interface Grade {
  id: number
  name: string
}

export interface Vacancy {
  id: number
  name: string
  title: string
}

