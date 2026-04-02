import { Box, Button, Card, Checkbox, Flex, Text } from '@radix-ui/themes'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from '@/router-adapter'
import { LOCALE_CARD_DEFS, type AppLocale } from '@/features/system-settings/localeCatalog'
import {
  LOCALIZATION_SETTINGS_CHANGED,
  readLocalizationSettings,
} from '@/features/system-settings/localizationStorage'
import {
  readUserLocalePreferences,
  setUserPreferredLocales,
  USER_LOCALE_PREFERENCES_CHANGED,
  writeUserLocalePreferences,
} from '@/features/system-settings/userLocalePreferences'
import { useToast } from '@/components/Toast/ToastContext'
import styles from './ProfileLanguagesSettings.module.css'

export function ProfileLanguagesSettings() {
  const toast = useToast()
  const [companyEnabled, setCompanyEnabled] = useState<AppLocale[]>(() =>
    readLocalizationSettings().enabledLocales
  )
  const [selected, setSelected] = useState<AppLocale[]>(() => readUserLocalePreferences().preferredLocales)
  const [activeLocale, setActiveLocale] = useState<AppLocale>(() => readUserLocalePreferences().activeLocale)

  const syncFromStorage = useCallback(() => {
    const company = readLocalizationSettings().enabledLocales
    setCompanyEnabled(company)
    const prefs = readUserLocalePreferences()
    setSelected(prefs.preferredLocales)
    setActiveLocale(prefs.activeLocale)
  }, [])

  useEffect(() => {
    syncFromStorage()
    if (typeof window === 'undefined') return
    const onCompany = () => syncFromStorage()
    const onUser = () => syncFromStorage()
    window.addEventListener(LOCALIZATION_SETTINGS_CHANGED, onCompany)
    window.addEventListener(USER_LOCALE_PREFERENCES_CHANGED, onUser)
    return () => {
      window.removeEventListener(LOCALIZATION_SETTINGS_CHANGED, onCompany)
      window.removeEventListener(USER_LOCALE_PREFERENCES_CHANGED, onUser)
    }
  }, [syncFromStorage])

  const defs = useMemo(
    () => LOCALE_CARD_DEFS.filter((d) => companyEnabled.includes(d.id)),
    [companyEnabled]
  )

  const toggleLocale = (id: AppLocale, checked: boolean) => {
    setSelected((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev
        return [...prev, id]
      }
      if (prev.length <= 1) return prev
      return prev.filter((x) => x !== id)
    })
  }

  const handleSave = () => {
    setUserPreferredLocales(selected)
    const after = readUserLocalePreferences()
    setActiveLocale(after.activeLocale)
    toast.showSuccess('Сохранено', 'Языки интерфейса обновлены')
  }

  const setAsActive = (id: AppLocale) => {
    if (!selected.includes(id)) return
    const prefs = readUserLocalePreferences()
    writeUserLocalePreferences({ preferredLocales: prefs.preferredLocales, activeLocale: id })
    setActiveLocale(id)
    toast.showSuccess('Язык интерфейса', 'Текущий язык изменён')
  }

  return (
    <Flex direction="column" gap="4" className={styles.root}>
      <Box>
        <Text size="5" weight="bold" as="p" mb="1">
          Языки и локализации
        </Text>
        <Text size="2" color="gray" style={{ maxWidth: 520 }}>
          Выберите один или несколько языков из&nbsp;тех, что доступны в настройках компании. Язык по&nbsp;умолчанию
          для интерфейса отмечен ниже; при нескольких языках в шапке появится переключатель.
        </Text>
      </Box>

      <Card size="2">
        <Flex direction="column" gap="3">
          {defs.length === 0 ? (
            <Text size="2" color="gray">
              Нет доступных языков. Включите языки в{' '}
              <Link href="/company-settings/system/localization">настройках локализации</Link>.
            </Text>
          ) : (
            defs.map((def) => {
              const on = selected.includes(def.id)
              const isActive = activeLocale === def.id
              return (
                <Flex
                  key={def.id}
                  align="center"
                  justify="between"
                  gap="4"
                  wrap="wrap"
                  className={styles.row}
                >
                  <label className={styles.label}>
                    <Flex align="center" gap="3">
                      <Checkbox
                        checked={on}
                        disabled={on && selected.length <= 1}
                        onCheckedChange={(v) => toggleLocale(def.id, v === true)}
                      />
                      <Flex direction="column" gap="0" style={{ minWidth: 0 }}>
                        <Text size="2" weight="medium">
                          {def.label}{' '}
                          <Text size="1" color="gray" as="span">
                            ({def.shortLabel})
                          </Text>
                        </Text>
                        {isActive && on ? (
                          <Text size="1" color="blue">
                            Текущий язык интерфейса
                          </Text>
                        ) : null}
                      </Flex>
                    </Flex>
                  </label>
                  {on && selected.length > 1 ? (
                    <Button size="1" variant={isActive ? 'solid' : 'soft'} onClick={() => setAsActive(def.id)}>
                      {isActive ? 'Активен' : 'Сделать текущим'}
                    </Button>
                  ) : null}
                </Flex>
              )
            })
          )}
        </Flex>
      </Card>

      <Flex gap="3" align="center" wrap="wrap">
        <Button onClick={handleSave} disabled={defs.length === 0}>
          Сохранить
        </Button>
        <Text size="1" color="gray">
          Состав языков задаёт администратор в{' '}
          <Link href="/company-settings/system/localization">локализации компании</Link>.
        </Text>
      </Flex>
    </Flex>
  )
}
