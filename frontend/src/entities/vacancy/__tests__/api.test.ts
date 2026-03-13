import { describe, it, expect, beforeEach } from 'vitest'
import { vacancyApi } from '../api'

describe('vacancyApi', () => {
  describe('getList', () => {
    it('returns list of vacancies', async () => {
      const result = await vacancyApi.getList()

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('title')
      expect(result[0]).toHaveProperty('status')
    })

    it('filters vacancies by status', async () => {
      const result = await vacancyApi.getList({ status: ['active'] })

      expect(result.every((v) => v.status === 'active')).toBe(true)
    })

    it('filters vacancies by search term', async () => {
      const result = await vacancyApi.getList({ search: 'engineer' })

      expect(result.every((v) => v.title.toLowerCase().includes('engineer'))).toBe(true)
    })
  })

  describe('getById', () => {
    it('returns vacancy by id', async () => {
      const result = await vacancyApi.getById(4090046)

      expect(result).not.toBeNull()
      expect(result?.id).toBe(4090046)
      expect(result?.title).toBe('AQA Engineer (TS)')
    })

    it('returns null for non-existent id', async () => {
      const result = await vacancyApi.getById(999999)

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('creates a new vacancy', async () => {
      const payload = {
        title: 'Test Vacancy',
        status: 'draft' as const,
        priority: 'medium' as const,
        recruiterId: '1',
        locationIds: ['1', '2'],
      }

      const result = await vacancyApi.create(payload)

      expect(result.title).toBe('Test Vacancy')
      expect(result.status).toBe('draft')
      expect(result.priority).toBe('medium')
      expect(result.hasWarning).toBe(true)
    })

    it('creates vacancy with salary range without warning', async () => {
      const payload = {
        title: 'Test Vacancy With Salary',
        status: 'active' as const,
        priority: 'high' as const,
        recruiterId: '1',
        locationIds: ['1'],
        salaryRange: { min: 2000, max: 4000, currency: 'USD' },
      }

      const result = await vacancyApi.create(payload)

      expect(result.salaryRange).toEqual({ min: 2000, max: 4000, currency: 'USD' })
      expect(result.hasWarning).toBe(false)
    })
  })

  describe('changeStatus', () => {
    it('changes vacancy status', async () => {
      const vacancy = await vacancyApi.getById(3936534)
      expect(vacancy?.status).toBe('active')

      const result = await vacancyApi.changeStatus(3936534, 'inactive')

      expect(result.status).toBe('inactive')
    })

    it('sets closedAt when archiving', async () => {
      const vacancy = await vacancyApi.getById(4092269)

      const result = await vacancyApi.changeStatus(4092269, 'archived')

      expect(result.status).toBe('archived')
      expect(result.closedAt).toBeDefined()
    })

    it('throws error for non-existent vacancy', async () => {
      await expect(vacancyApi.changeStatus(999999, 'active')).rejects.toThrow(
        'Vacancy not found'
      )
    })
  })

  describe('update', () => {
    it('updates vacancy fields', async () => {
      const result = await vacancyApi.update({
        id: 4090046,
        title: 'Updated Title',
      })

      expect(result.title).toBe('Updated Title')
    })

    it('throws error for non-existent vacancy', async () => {
      await expect(
        vacancyApi.update({ id: 999999, title: 'New Title' })
      ).rejects.toThrow('Vacancy not found')
    })
  })

  describe('delete', () => {
    it('deletes vacancy', async () => {
      const initialList = await vacancyApi.getList()
      const initialLength = initialList.length

      await vacancyApi.delete(initialList[0].id)

      const updatedList = await vacancyApi.getList()
      expect(updatedList.length).toBe(initialLength - 1)
    })
  })
})
