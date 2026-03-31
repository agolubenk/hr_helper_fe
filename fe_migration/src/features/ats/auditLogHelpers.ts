import type { AtsCandidate, AtsCandidateAuditRevert } from './mocks'

/** Снимок полей заявки до подтверждения статуса — для отката через localCandidateOverrides */
export function buildStatusConfirmAuditRevert(params: {
  candidateId: string
  beforeStatus: string
  beforeStatusColor: string
  beforeOfferId?: string
  beforeOfferDate?: string
}): AtsCandidateAuditRevert {
  const merge: AtsCandidateAuditRevert['merge'] = {
    status: params.beforeStatus,
    statusColor: params.beforeStatusColor,
  }
  const unsetKeys: Array<'offerApplicationId' | 'offerStartDate'> = []
  if (params.beforeOfferId) {
    merge.offerApplicationId = params.beforeOfferId
  } else {
    unsetKeys.push('offerApplicationId')
  }
  if (params.beforeOfferDate) {
    merge.offerStartDate = params.beforeOfferDate
  } else {
    unsetKeys.push('offerStartDate')
  }
  return {
    candidateId: params.candidateId,
    merge,
    unsetKeys: unsetKeys.length ? unsetKeys : undefined,
  }
}

export function mergeAuditRevertIntoOverrides(
  prev: Record<string, Partial<AtsCandidate>>,
  revert: AtsCandidateAuditRevert,
): Record<string, Partial<AtsCandidate>> {
  const o = { ...(prev[revert.candidateId] ?? {}) }
  for (const k of revert.unsetKeys ?? []) {
    delete o[k]
  }
  return {
    ...prev,
    [revert.candidateId]: { ...o, ...revert.merge },
  }
}
