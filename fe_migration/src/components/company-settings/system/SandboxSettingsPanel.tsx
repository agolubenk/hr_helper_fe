import { Box, Button, Callout, Card, Flex, Switch, Text, TextField, Select } from '@radix-ui/themes'
import { useState } from 'react'
import { useToast } from '@/components/Toast/ToastContext'
import type { SandboxEnvironmentKind, SandboxSettingsState } from '@/features/system-settings/types'
import { readSandboxSettings, writeSandboxSettings } from '@/features/system-settings/sandboxStorage'
import styles from './SandboxSettingsPanel.module.css'

const MODE_LABEL: Record<SandboxEnvironmentKind, string> = {
  production_mirror: 'Зеркало продакшена (обезличенные данные)',
  staging: 'Общий staging-пул',
  isolated: 'Изолированный стенд',
}

export function SandboxSettingsPanel() {
  const { showSuccess, showError } = useToast()
  const [state, setState] = useState<SandboxSettingsState>(() => readSandboxSettings())
  const [testing, setTesting] = useState(false)

  const save = () => {
    writeSandboxSettings(state)
    showSuccess('Сохранено', 'Параметры песочницы записаны локально.')
  }

  const testConnection = () => {
    setTesting(true)
    window.setTimeout(() => {
      setTesting(false)
      const ok = state.baseUrl.startsWith('http')
      if (ok) showSuccess('Проверка', 'Соединение с стендом успешно (мок).')
      else showError('Проверка', 'Укажите корректный URL (https://…).')
    }, 650)
  }

  return (
    <Flex direction="column" gap="4">
      <Callout.Root color="amber">
        <Callout.Text>
          Песочница предназначена для проверки интеграций и сценариев без влияния на боевые данные. Включайте запись
          только на доверенных стендах.
        </Callout.Text>
      </Callout.Root>

      <Card size="1" variant="surface">
        <Text size="3" weight="bold">
          Параметры стенда
        </Text>
        <div className={styles.fieldStack}>
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Тип окружения
            </Text>
            <Select.Root
              value={state.mode}
              onValueChange={(v) =>
                setState((s) => ({
                  ...s,
                  mode:
                    v === 'production_mirror' || v === 'staging' || v === 'isolated' ? v : 'isolated',
                }))
              }
            >
              <Select.Trigger style={{ maxWidth: 400 }} />
              <Select.Content position="popper">
                {(Object.keys(MODE_LABEL) as SandboxEnvironmentKind[]).map((k) => (
                  <Select.Item key={k} value={k}>
                    {MODE_LABEL[k]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Базовый URL API
            </Text>
            <TextField.Root
              value={state.baseUrl}
              onChange={(e) => setState((s) => ({ ...s, baseUrl: e.target.value }))}
              placeholder="https://stand.example.com/api"
            />
          </Box>
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Ключ API (не сохраняется в открытом виде в мок-режиме)
            </Text>
            <TextField.Root
              type="password"
              value={state.apiKeyMasked}
              onChange={(e) => setState((s) => ({ ...s, apiKeyMasked: e.target.value }))}
              placeholder="sk-••••••••"
            />
          </Box>
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Идентификатор организации на стенде
            </Text>
            <TextField.Root
              value={state.organizationId}
              onChange={(e) => setState((s) => ({ ...s, organizationId: e.target.value }))}
            />
          </Box>
          <Flex align="center" gap="3">
            <Switch checked={state.allowWrite} onCheckedChange={(v) => setState((s) => ({ ...s, allowWrite: v }))} />
            <Text size="2">Разрешить операции записи (создание/изменение сущностей)</Text>
          </Flex>
        </div>
        <div className={styles.actions}>
          <Button onClick={save}>Сохранить</Button>
          <Button variant="soft" loading={testing} onClick={testConnection}>
            Проверить соединение
          </Button>
        </div>
      </Card>
    </Flex>
  )
}
