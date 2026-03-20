import type { GradeLevel, GradingConfig, SpecializationNode } from '@/app/specializations/types'

export const INITIAL_TREE: SpecializationNode[] = [
  { id: 'frontend', name: 'Frontend Development', parentId: null, projectIds: ['alpha', 'beta'], employeeCount: 45, vacancyCount: 12, children: [] },
  { id: 'backend', name: 'Backend Development', parentId: null, projectIds: ['alpha'], employeeCount: 38, vacancyCount: 8, children: [] },
]

export const DEFAULT_GRADE_LEVELS: GradeLevel[] = [
  { id: 'junior', name: 'Junior', order: 1, minSalary: 2000, maxSalary: 3500 },
  { id: 'middle', name: 'Middle', order: 2, minSalary: 3500, maxSalary: 6000 },
  { id: 'senior', name: 'Senior', order: 3, minSalary: 6000, maxSalary: 9000 },
]

export const INITIAL_GRADING: Record<string, GradingConfig> = {
  frontend: { inheritFromParent: false, type: 'grades', levels: DEFAULT_GRADE_LEVELS },
  backend: { inheritFromParent: false, type: 'grades', levels: DEFAULT_GRADE_LEVELS },
}

export const DEPARTMENTS = [
  { id: 'product', name: 'Product Department' },
  { id: 'engineering', name: 'Engineering' },
]

export const PROJECTS = [
  { id: 'alpha', name: 'Alpha' },
  { id: 'beta', name: 'Beta' },
  { id: 'gamma', name: 'Gamma' },
]
