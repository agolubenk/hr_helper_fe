import { describe, it, expect } from 'vitest'
import { companyApi } from '../api'

describe('companyApi', () => {
  describe('getCurrent', () => {
    it('returns current company data', async () => {
      const result = await companyApi.getCurrent()

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('plan')
      expect(result).toHaveProperty('settings')
      expect(result).toHaveProperty('branding')
      expect(result).toHaveProperty('integrations')
    })

    it('returns company with correct structure', async () => {
      const result = await companyApi.getCurrent()

      expect(result.settings).toHaveProperty('timezone')
      expect(result.settings).toHaveProperty('locale')
      expect(result.settings).toHaveProperty('currency')
      expect(result.branding).toHaveProperty('primaryColor')
      expect(Array.isArray(result.integrations)).toBe(true)
    })
  })

  describe('update', () => {
    it('updates company name', async () => {
      const result = await companyApi.update({ name: 'Updated Company Name' })

      expect(result.name).toBe('Updated Company Name')
    })

    it('updates company settings partially', async () => {
      const originalCompany = await companyApi.getCurrent()

      const result = await companyApi.update({
        settings: { timezone: 'Europe/Warsaw' },
      })

      expect(result.settings.timezone).toBe('Europe/Warsaw')
      expect(result.settings.locale).toBe(originalCompany.settings.locale)
    })

    it('updates company branding', async () => {
      const result = await companyApi.update({
        branding: { primaryColor: '#ff0000' },
      })

      expect(result.branding.primaryColor).toBe('#ff0000')
    })

    it('updates updatedAt timestamp', async () => {
      const before = new Date().toISOString()

      const result = await companyApi.update({ name: 'Test Update' })

      expect(new Date(result.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(before).getTime()
      )
    })
  })

  describe('enableIntegration', () => {
    it('enables integration and sets connectedAt', async () => {
      const company = await companyApi.getCurrent()
      const slackIntegration = company.integrations.find((i) => i.type === 'slack')

      expect(slackIntegration?.enabled).toBe(false)

      const result = await companyApi.enableIntegration(slackIntegration!.id)

      const updatedSlack = result.integrations.find((i) => i.type === 'slack')
      expect(updatedSlack?.enabled).toBe(true)
      expect(updatedSlack?.connectedAt).toBeDefined()
    })
  })

  describe('disableIntegration', () => {
    it('disables integration and removes connectedAt', async () => {
      const company = await companyApi.getCurrent()
      const telegramIntegration = company.integrations.find(
        (i) => i.type === 'telegram'
      )

      expect(telegramIntegration?.enabled).toBe(true)

      const result = await companyApi.disableIntegration(telegramIntegration!.id)

      const updatedTelegram = result.integrations.find((i) => i.type === 'telegram')
      expect(updatedTelegram?.enabled).toBe(false)
      expect(updatedTelegram?.connectedAt).toBeUndefined()
    })
  })

  describe('updateBranding', () => {
    it('updates branding settings', async () => {
      const result = await companyApi.updateBranding({
        primaryColor: '#00ff00',
        logoUrl: '/new-logo.svg',
      })

      expect(result.branding.primaryColor).toBe('#00ff00')
      expect(result.branding.logoUrl).toBe('/new-logo.svg')
    })
  })
})
