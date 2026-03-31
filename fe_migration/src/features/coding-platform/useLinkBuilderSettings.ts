import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import type { LinkBuilderAutomationRule, LinkBuilderGeneralSettings } from './linkBuilderSettingsTypes'
import {
  readLinkBuilderAutomationRules,
  readLinkBuilderGeneralSettings,
  writeLinkBuilderAutomationRules,
  writeLinkBuilderGeneralSettings,
} from './linkBuilderSettingsStorage'

function newRuleId(): string {
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function useLinkBuilderSettings(): {
  general: LinkBuilderGeneralSettings
  setGeneral: Dispatch<SetStateAction<LinkBuilderGeneralSettings>>
  patchGeneral: (patch: Partial<LinkBuilderGeneralSettings>) => void
  automations: LinkBuilderAutomationRule[]
  setAutomations: Dispatch<SetStateAction<LinkBuilderAutomationRule[]>>
  addRule: (rule: Omit<LinkBuilderAutomationRule, 'id'>) => void
  updateRule: (id: string, patch: Partial<LinkBuilderAutomationRule>) => void
  removeRule: (id: string) => void
} {
  const [general, setGeneral] = useState<LinkBuilderGeneralSettings>(() => readLinkBuilderGeneralSettings())
  const [automations, setAutomations] = useState<LinkBuilderAutomationRule[]>(() => readLinkBuilderAutomationRules())

  useEffect(() => {
    writeLinkBuilderGeneralSettings(general)
  }, [general])

  useEffect(() => {
    writeLinkBuilderAutomationRules(automations)
  }, [automations])

  const patchGeneral = useCallback((patch: Partial<LinkBuilderGeneralSettings>) => {
    setGeneral((g) => ({ ...g, ...patch }))
  }, [])

  const addRule = useCallback((rule: Omit<LinkBuilderAutomationRule, 'id'>) => {
    setAutomations((list) => [...list, { ...rule, id: newRuleId() }])
  }, [])

  const updateRule = useCallback((id: string, patch: Partial<LinkBuilderAutomationRule>) => {
    setAutomations((list) =>
      list.map((r) => {
        if (r.id !== id) return r
        const mergedApply = patch.apply ? { ...r.apply, ...patch.apply } : r.apply
        const { apply: _skip, ...rest } = patch
        return { ...r, ...rest, apply: mergedApply }
      }),
    )
  }, [])

  const removeRule = useCallback((id: string) => {
    setAutomations((list) => list.filter((r) => r.id !== id))
  }, [])

  return {
    general,
    setGeneral,
    patchGeneral,
    automations,
    setAutomations,
    addRule,
    updateRule,
    removeRule,
  }
}
