import type { Company, CompanyUpdatePayload } from './model'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const mockCompany: Company = {
  id: '1',
  name: 'HR Helper Demo',
  legalName: 'ООО "HR Helper"',
  inn: '1234567890',
  status: 'active',
  plan: 'professional',
  settings: {
    timezone: 'Europe/Minsk',
    locale: 'ru',
    dateFormat: 'DD.MM.YYYY',
    currency: 'USD',
    workingDays: [1, 2, 3, 4, 5],
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
  },
  branding: {
    primaryColor: '#3b82f6',
    logoUrl: '/images/logo.svg',
  },
  integrations: [
    {
      id: '1',
      type: 'telegram',
      name: 'Telegram Bot',
      enabled: true,
      connectedAt: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      type: 'huntflow',
      name: 'Huntflow ATS',
      enabled: true,
      connectedAt: '2025-02-01T10:00:00Z',
    },
    {
      id: '3',
      type: 'email',
      name: 'Email SMTP',
      enabled: true,
      connectedAt: '2025-01-10T10:00:00Z',
    },
    {
      id: '4',
      type: 'slack',
      name: 'Slack',
      enabled: false,
    },
    {
      id: '5',
      type: 'hh',
      name: 'HeadHunter',
      enabled: false,
    },
    {
      id: '6',
      type: 'linkedin',
      name: 'LinkedIn',
      enabled: false,
    },
  ],
  employeesCount: 47,
  departmentsCount: 8,
  vacanciesCount: 12,
  createdAt: '2024-06-01T10:00:00Z',
  updatedAt: '2025-03-01T10:00:00Z',
}

export const companyApi = {
  async getCurrent(): Promise<Company> {
    await delay(200)
    return { ...mockCompany }
  },

  async update(payload: CompanyUpdatePayload): Promise<Company> {
    await delay(400)

    if (payload.name) {
      mockCompany.name = payload.name
    }
    if (payload.legalName) {
      mockCompany.legalName = payload.legalName
    }
    if (payload.inn) {
      mockCompany.inn = payload.inn
    }
    if (payload.settings) {
      mockCompany.settings = { ...mockCompany.settings, ...payload.settings }
    }
    if (payload.branding) {
      mockCompany.branding = { ...mockCompany.branding, ...payload.branding }
    }

    mockCompany.updatedAt = new Date().toISOString()

    return { ...mockCompany }
  },

  async enableIntegration(integrationId: string): Promise<Company> {
    await delay(300)

    const integration = mockCompany.integrations.find((i) => i.id === integrationId)
    if (integration) {
      integration.enabled = true
      integration.connectedAt = new Date().toISOString()
    }

    mockCompany.updatedAt = new Date().toISOString()
    return { ...mockCompany }
  },

  async disableIntegration(integrationId: string): Promise<Company> {
    await delay(300)

    const integration = mockCompany.integrations.find((i) => i.id === integrationId)
    if (integration) {
      integration.enabled = false
      integration.connectedAt = undefined
    }

    mockCompany.updatedAt = new Date().toISOString()
    return { ...mockCompany }
  },

  async updateBranding(branding: Partial<Company['branding']>): Promise<Company> {
    await delay(400)

    mockCompany.branding = { ...mockCompany.branding, ...branding }
    mockCompany.updatedAt = new Date().toISOString()

    return { ...mockCompany }
  },
}
