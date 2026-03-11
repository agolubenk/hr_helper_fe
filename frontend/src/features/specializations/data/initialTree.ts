import type { GradingConfig, GradeLevel, SpecializationNode } from '../types'

export const INITIAL_TREE: SpecializationNode[] = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    parentId: null,
    departmentId: 'engineering',
    projectIds: ['alpha', 'beta'],
    description: 'Разработка пользовательских интерфейсов и клиентской части продукта.',
    techStack: [
      { name: 'JavaScript/ES6+', priority: 'required' },
      { name: 'React', priority: 'required' },
      { name: 'TypeScript', priority: 'required' },
    ],
    vacancyCount: 12,
    employeeCount: 45,
    gradeLevels: 3,
    isCustom: false,
    children: [
      {
        id: 'frontend-product',
        name: 'Product Team (React)',
        parentId: 'frontend',
        departmentId: 'product',
        projectIds: ['alpha'],
        description: 'Фокус на UI/UX, быстрый цикл итераций, работа с дизайн-системой.',
        techStack: [
          { name: 'React 18', priority: 'required' },
          { name: 'TypeScript', priority: 'required' },
          { name: 'Next.js', priority: 'nice' },
        ],
        vacancyCount: 5,
        employeeCount: 20,
        gradeLevels: 3,
        isCustom: true,
        children: [],
      },
      {
        id: 'frontend-legacy',
        name: 'Legacy Team (Vue)',
        parentId: 'frontend',
        departmentId: 'engineering',
        projectIds: ['beta'],
        description: 'Поддержка и развитие legacy-проектов на Vue.',
        techStack: [
          { name: 'Vue 2/3', priority: 'required' },
          { name: 'JavaScript', priority: 'required' },
        ],
        vacancyCount: 3,
        employeeCount: 15,
        gradeLevels: 3,
        children: [],
      },
    ],
  },
  {
    id: 'backend',
    name: 'Backend Development',
    parentId: null,
    departmentId: 'engineering',
    projectIds: ['alpha', 'beta'],
    description: 'Серверная разработка, API, базы данных.',
    techStack: [],
    vacancyCount: 8,
    employeeCount: 38,
    gradeLevels: 3,
    children: [],
  },
]

export const DEFAULT_GRADE_LEVELS: GradeLevel[] = [
  { id: 'junior', name: 'Junior', order: 1, minSalary: 2000, maxSalary: 3500, criteria: 'Задачи под надзором, обучение.' },
  { id: 'middle', name: 'Middle', order: 2, minSalary: 3500, maxSalary: 6000, criteria: 'Самостоятельное выполнение задач, участие в ревью.' },
  { id: 'senior', name: 'Senior', order: 3, minSalary: 6000, maxSalary: 9000, criteria: 'Владение направлением, менторство, архитектурные решения.' },
]

export const INITIAL_GRADING: Record<string, GradingConfig> = {
  frontend: { inheritFromParent: false, type: 'grades', levels: DEFAULT_GRADE_LEVELS },
  backend: { inheritFromParent: false, type: 'grades', levels: DEFAULT_GRADE_LEVELS },
}

