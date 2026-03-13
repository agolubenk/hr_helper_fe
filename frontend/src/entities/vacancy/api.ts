import type {
  Vacancy,
  VacancyListItem,
  VacancyFilters,
  VacancyCreatePayload,
  VacancyUpdatePayload,
} from './model'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mockVacancies: Vacancy[] = [
  {
    id: 4090046,
    title: 'AQA Engineer (TS)',
    status: 'inactive',
    priority: 'medium',
    recruiter: { id: '1', name: 'Andrei Golubenko' },
    locations: [
      { id: '1', name: 'Минск' },
      { id: '2', name: 'Удалённо', isRemote: true },
    ],
    stages: [
      { id: '1', name: 'Новые', order: 1, candidatesCount: 5 },
      { id: '2', name: 'Скрининг', order: 2, candidatesCount: 3 },
      { id: '3', name: 'Интервью', order: 3, candidatesCount: 1 },
    ],
    interviewersCount: 0,
    candidatesCount: 9,
    createdAt: '2025-10-25T10:00:00Z',
    updatedAt: '2025-10-25T10:00:00Z',
    hasWarning: true,
    warningText: 'Зарплатные вилки не установлены',
  },
  {
    id: 3993218,
    title: 'UX/UI Designer',
    status: 'inactive',
    priority: 'high',
    recruiter: { id: '1', name: 'Andrei Golubenko' },
    locations: [],
    stages: [
      { id: '1', name: 'Новые', order: 1, candidatesCount: 2 },
    ],
    interviewersCount: 0,
    candidatesCount: 2,
    createdAt: '2025-09-22T10:00:00Z',
    updatedAt: '2025-09-22T10:00:00Z',
    hasWarning: true,
    warningText: 'Зарплатные вилки не установлены',
  },
  {
    id: 4020335,
    title: 'System Administrator',
    status: 'inactive',
    priority: 'low',
    recruiter: { id: '1', name: 'Andrei Golubenko' },
    locations: [{ id: '3', name: 'Гомель' }],
    stages: [],
    interviewersCount: 0,
    candidatesCount: 0,
    createdAt: '2025-09-22T10:00:00Z',
    updatedAt: '2025-09-22T10:00:00Z',
    hasWarning: true,
    warningText: 'Зарплатные вилки не установлены',
  },
  {
    id: 4092269,
    title: 'Manual QA Engineer',
    status: 'draft',
    priority: 'medium',
    recruiter: { id: '1', name: 'Andrei Golubenko' },
    locations: [],
    stages: [],
    interviewersCount: 0,
    candidatesCount: 0,
    createdAt: '2025-10-20T10:00:00Z',
    updatedAt: '2025-10-20T10:00:00Z',
    hasWarning: false,
  },
  {
    id: 3979419,
    title: 'DevOps Engineer',
    status: 'inactive',
    priority: 'urgent',
    recruiter: { id: '1', name: 'Andrei Golubenko' },
    locations: [
      { id: '1', name: 'Минск' },
      { id: '2', name: 'Удалённо', isRemote: true },
      { id: '4', name: 'Польша' },
    ],
    salaryRange: { min: 3000, max: 5000, currency: 'USD' },
    stages: [
      { id: '1', name: 'Новые', order: 1, candidatesCount: 10 },
      { id: '2', name: 'Скрининг', order: 2, candidatesCount: 5 },
    ],
    interviewersCount: 0,
    candidatesCount: 15,
    createdAt: '2025-08-15T10:00:00Z',
    updatedAt: '2025-08-15T10:00:00Z',
    hasWarning: false,
  },
  {
    id: 3936534,
    title: 'Project Manager',
    status: 'active',
    priority: 'high',
    recruiter: { id: '1', name: 'Andrei Golubenko' },
    locations: [{ id: '1', name: 'Минск' }],
    salaryRange: { min: 2500, max: 4000, currency: 'USD' },
    stages: [
      { id: '1', name: 'Новые', order: 1, candidatesCount: 3 },
      { id: '2', name: 'Скрининг', order: 2, candidatesCount: 2 },
      { id: '3', name: 'Интервью', order: 3, candidatesCount: 1 },
      { id: '4', name: 'Оффер', order: 4, candidatesCount: 1 },
    ],
    interviewersCount: 2,
    candidatesCount: 7,
    createdAt: '2025-07-10T10:00:00Z',
    updatedAt: '2025-07-10T10:00:00Z',
    hasWarning: false,
  },
  {
    id: 4090047,
    title: 'Frontend Engineer',
    status: 'active',
    priority: 'urgent',
    recruiter: { id: '1', name: 'Andrei Golubenko' },
    locations: [
      { id: '1', name: 'Минск' },
      { id: '2', name: 'Удалённо', isRemote: true },
    ],
    salaryRange: { min: 2000, max: 3500, currency: 'USD' },
    stages: [
      { id: '1', name: 'Новые', order: 1, candidatesCount: 8 },
      { id: '2', name: 'Скрининг', order: 2, candidatesCount: 4 },
      { id: '3', name: 'Техническое интервью', order: 3, candidatesCount: 2 },
    ],
    interviewersCount: 1,
    candidatesCount: 14,
    createdAt: '2025-10-26T10:00:00Z',
    updatedAt: '2025-10-26T10:00:00Z',
    hasWarning: false,
  },
  {
    id: 4090048,
    title: 'Backend Engineer',
    status: 'inactive',
    priority: 'medium',
    recruiter: { id: '1', name: 'Andrei Golubenko' },
    locations: [
      { id: '5', name: 'Варшава' },
      { id: '2', name: 'Удалённо', isRemote: true },
    ],
    stages: [],
    interviewersCount: 0,
    candidatesCount: 0,
    createdAt: '2025-10-20T10:00:00Z',
    updatedAt: '2025-10-20T10:00:00Z',
    hasWarning: true,
    warningText: 'Зарплатные вилки не установлены',
  },
]

export const vacancyApi = {
  async getList(filters?: VacancyFilters): Promise<VacancyListItem[]> {
    await delay(300)

    let result = mockVacancies

    if (filters?.status?.length) {
      result = result.filter((v) => filters.status!.includes(v.status))
    }

    if (filters?.recruiterId) {
      result = result.filter((v) => v.recruiter.id === filters.recruiterId)
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      result = result.filter((v) => v.title.toLowerCase().includes(search))
    }

    return result.map((v) => ({
      id: v.id,
      title: v.title,
      status: v.status,
      recruiterName: v.recruiter.name,
      locations: v.locations.map((l) => l.name),
      interviewersCount: v.interviewersCount,
      date: v.updatedAt ? new Date(v.updatedAt).toLocaleDateString('ru-RU') : null,
      hasWarning: v.hasWarning,
      warningText: v.warningText,
    }))
  },

  async getById(id: number): Promise<Vacancy | null> {
    await delay(200)
    return mockVacancies.find((v) => v.id === id) ?? null
  },

  async create(payload: VacancyCreatePayload): Promise<Vacancy> {
    await delay(500)

    const newVacancy: Vacancy = {
      id: Date.now(),
      title: payload.title,
      status: payload.status,
      priority: payload.priority,
      recruiter: { id: payload.recruiterId, name: 'Current User' },
      locations: payload.locationIds.map((id) => ({ id, name: `Location ${id}` })),
      salaryRange: payload.salaryRange,
      stages: [],
      interviewersCount: 0,
      candidatesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deadline: payload.deadline,
      hasWarning: !payload.salaryRange,
      warningText: !payload.salaryRange ? 'Зарплатные вилки не установлены' : undefined,
      departmentId: payload.departmentId,
      description: payload.description,
      requirements: payload.requirements,
    }

    mockVacancies.push(newVacancy)
    return newVacancy
  },

  async update(payload: VacancyUpdatePayload): Promise<Vacancy> {
    await delay(400)

    const index = mockVacancies.findIndex((v) => v.id === payload.id)
    if (index === -1) {
      throw new Error('Vacancy not found')
    }

    const updated = {
      ...mockVacancies[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    }

    mockVacancies[index] = updated as Vacancy
    return updated as Vacancy
  },

  async delete(id: number): Promise<void> {
    await delay(300)

    const index = mockVacancies.findIndex((v) => v.id === id)
    if (index !== -1) {
      mockVacancies.splice(index, 1)
    }
  },

  async changeStatus(id: number, status: Vacancy['status']): Promise<Vacancy> {
    await delay(300)

    const vacancy = mockVacancies.find((v) => v.id === id)
    if (!vacancy) {
      throw new Error('Vacancy not found')
    }

    vacancy.status = status
    vacancy.updatedAt = new Date().toISOString()

    if (status === 'archived') {
      vacancy.closedAt = new Date().toISOString()
    }

    return vacancy
  },
}
