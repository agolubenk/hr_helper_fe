'use client'

import { Box, DropdownMenu, Text } from '@radix-ui/themes'
import { ChevronDownIcon, GlobeIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import { LOCALE_CARD_DEFS, type AppLocale } from '@/features/system-settings/localeCatalog'
import {
  readUserLocalePreferences,
  setUserActiveLocale,
  subscribeUserAndCompanyLocaleChanges,
} from '@/features/system-settings/userLocalePreferences'

const triggerBaseStyle: React.CSSProperties = {
  cursor: 'pointer',
  backgroundColor: 'transparent',
  border: '1px solid var(--gray-a6)',
  borderRadius: '6px',
  padding: '6px 8px',
  height: '34px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  gap: 4,
}

const triggerCompactStyle: React.CSSProperties = {
  ...triggerBaseStyle,
  width: 34,
  padding: '6px',
}

export interface HeaderLocaleControlProps {
  /** Узкий хедер: только иконка глобуса, меню без изменений */
  compactTrigger?: boolean
}

export function HeaderLocaleControl({ compactTrigger = false }: HeaderLocaleControlProps) {
  const [prefs, setPrefs] = useState(readUserLocalePreferences)

  useEffect(() => {
    const refresh = () => setPrefs(readUserLocalePreferences())
    refresh()
    return subscribeUserAndCompanyLocaleChanges(refresh)
  }, [])

  if (prefs.preferredLocales.length <= 1) return null

  const activeDef = LOCALE_CARD_DEFS.find((d) => d.id === prefs.activeLocale)
  const label = activeDef?.shortLabel ?? prefs.activeLocale.toUpperCase()
  const title = activeDef ? `Язык интерфейса: ${activeDef.label} (${label})` : `Язык интерфейса: ${label}`

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Box title={title} aria-label={title} style={compactTrigger ? triggerCompactStyle : triggerBaseStyle}>
          {compactTrigger ? (
            <GlobeIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
          ) : (
            <>
              <Text size="2" weight="medium" style={{ color: 'var(--gray-12)' }}>
                {label}
              </Text>
              <ChevronDownIcon width={14} height={14} style={{ color: 'var(--gray-12)' }} />
            </>
          )}
        </Box>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {prefs.preferredLocales.map((id: AppLocale) => {
          const def = LOCALE_CARD_DEFS.find((d) => d.id === id)
          return (
            <DropdownMenu.Item
              key={id}
              onSelect={() => setUserActiveLocale(id)}
            >
              {def ? `${def.label} (${def.shortLabel})` : id}
            </DropdownMenu.Item>
          )
        })}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
