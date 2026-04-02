import { describe, expect, it } from 'vitest'
import { buildStatusConfirmAuditRevert, mergeAuditRevertIntoOverrides } from './auditLogHelpers'

describe('auditLogHelpers', () => {
  it('buildStatusConfirmAuditRevert: пустые offer — в unsetKeys', () => {
    const r = buildStatusConfirmAuditRevert({
      candidateId: '1',
      beforeStatus: 'Interview',
      beforeStatusColor: '#8B5CF6',
      beforeOfferId: undefined,
      beforeOfferDate: undefined,
    })
    expect(r.unsetKeys).toEqual(['offerApplicationId', 'offerStartDate'])
    expect(r.merge.status).toBe('Interview')
  })

  it('mergeAuditRevertIntoOverrides применяет merge и unsetKeys', () => {
    const prev = {
      '1': {
        status: 'Offer',
        statusColor: '#000',
        offerApplicationId: 'APP-1',
        offerStartDate: '2026-04-01',
      },
    }
    const revert = buildStatusConfirmAuditRevert({
      candidateId: '1',
      beforeStatus: 'Interview',
      beforeStatusColor: '#8B5CF6',
      beforeOfferId: undefined,
      beforeOfferDate: undefined,
    })
    const next = mergeAuditRevertIntoOverrides(prev, revert)
    expect(next['1']?.status).toBe('Interview')
    expect(next['1']?.offerApplicationId).toBeUndefined()
    expect(next['1']?.offerStartDate).toBeUndefined()
  })
})
