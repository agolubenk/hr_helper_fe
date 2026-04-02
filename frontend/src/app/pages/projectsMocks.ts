/**
 * Мок-данные раздела «Проекты» (как в старом Next). Заменяемы на API без правок разметки страниц.
 */

export type ProjectStatus = 'active' | 'pilot'

export interface ProjectSummary {
  id: string
  name: string
  description: string
  vacancyCount: number
  employeeCount: number
  specialization: string
  status: ProjectStatus
}

export interface ProjectDetail {
  name: string
  description: string
}

export interface ProjectTeamRow {
  projectId: string
  projectName: string
  teamLead: string
  members: number
  openRoles: number
  specialization: string
}

export interface ProjectAllocationRow {
  projectName: string
  allocated: number
  planned: number
  pct: number
}

export const mockProjects: ProjectSummary[] = [
  {
    id: 'alpha',
    name: 'Alpha',
    description: 'Основной продукт, веб и мобильные приложения.',
    vacancyCount: 8,
    employeeCount: 24,
    specialization: 'Frontend, Backend',
    status: 'active',
  },
  {
    id: 'beta',
    name: 'Beta',
    description: 'Внутренние сервисы и инфраструктура.',
    vacancyCount: 4,
    employeeCount: 15,
    specialization: 'Backend, DevOps',
    status: 'active',
  },
  {
    id: 'gamma',
    name: 'Gamma',
    description: 'Экспериментальное направление.',
    vacancyCount: 2,
    employeeCount: 6,
    specialization: 'Frontend',
    status: 'pilot',
  },
]

export const mockProjectDetails: Record<string, ProjectDetail> = {
  alpha: { name: 'Alpha', description: 'Основной продукт, веб и мобильные приложения.' },
  beta: { name: 'Beta', description: 'Внутренние сервисы и инфраструктура.' },
  gamma: { name: 'Gamma', description: 'Экспериментальное направление.' },
}

export const mockProjectTeams: ProjectTeamRow[] = [
  {
    projectId: 'alpha',
    projectName: 'Alpha',
    teamLead: 'Иван Петров',
    members: 24,
    openRoles: 8,
    specialization: 'Frontend, Backend',
  },
  {
    projectId: 'beta',
    projectName: 'Beta',
    teamLead: 'Мария Сидорова',
    members: 15,
    openRoles: 4,
    specialization: 'Backend, DevOps',
  },
  {
    projectId: 'gamma',
    projectName: 'Gamma',
    teamLead: 'Алексей Козлов',
    members: 6,
    openRoles: 2,
    specialization: 'Frontend',
  },
]

export const mockProjectAllocation: ProjectAllocationRow[] = [
  { projectName: 'Alpha', allocated: 24, planned: 32, pct: 75 },
  { projectName: 'Beta', allocated: 15, planned: 18, pct: 83 },
  { projectName: 'Gamma', allocated: 6, planned: 8, pct: 75 },
]
