'use client'

import { Box, Flex, Text, Card, Button, Badge, Grid, Switch } from '@radix-ui/themes'
import { useNavigate } from '@tanstack/react-router'
import { LightningBoltIcon } from '@radix-ui/react-icons'
import { useState, useEffect } from 'react'
import IntegrationScopeModal from './IntegrationScopeModal'
import { GoogleServicesModal } from './GoogleServicesModal'
import styles from './integrations.module.css'

const ACTIVE_STORAGE_KEY = 'integrationActive'

function getIntegrationActive(id: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback
  const raw = localStorage.getItem(`${ACTIVE_STORAGE_KEY}_${id}`)
  if (raw === 'true') return true
  if (raw === 'false') return false
  return fallback
}

function setIntegrationActive(id: string, value: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(`${ACTIVE_STORAGE_KEY}_${id}`, String(value))
}

type IntegrationId =
  | 'google'
  | 'telegram'
  | 'hh'
  | 'huntflow'
  | 'gemini'
  | 'openai'
  | 'cloud-ai'
  | 'clickup'
  | 'notion'
  | 'n8n'

type IntegrationGroupId =
  | 'all'
  | 'ai'
  | 'auth'
  | 'messengers'
  | 'job-sites'
  | 'hrm-ats'
  | 'task-trackers'

interface Integration {
  id: IntegrationId
  name: string
  shortName?: string
  active: boolean
  href?: string
  group: IntegrationGroupId
  allowsScopeChoice?: boolean
  description?: string
}

const INTEGRATION_GROUPS: { id: IntegrationGroupId; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'ai', label: 'ИИ' },
  { id: 'auth', label: 'Вход' },
  { id: 'messengers', label: 'Мессенджеры' },
  { id: 'job-sites', label: 'Job-сайты' },
  { id: 'hrm-ats', label: 'HRM&ATS' },
  { id: 'task-trackers', label: "Task Tracker's" },
]

const INTEGRATIONS: Integration[] = [
  {
    id: 'google',
    name: 'Google',
    shortName: 'G',
    active: false,
    group: 'auth',
    allowsScopeChoice: false,
    description:
      'Календарь, Диск, таблицы, личные данные. Включение сервисов — здесь; OAuth и ключи — в профиле.',
  },
  { id: 'telegram', name: 'Telegram', shortName: 'T', active: false, group: 'messengers', allowsScopeChoice: true },
  { id: 'hh', name: 'hh.ru / rabota.by', shortName: 'HH', active: false, group: 'job-sites', allowsScopeChoice: true },
  { id: 'huntflow', name: 'Huntflow', shortName: 'H', active: true, group: 'hrm-ats', allowsScopeChoice: true },
  { id: 'gemini', name: 'Gemini', shortName: 'G', active: false, group: 'ai', allowsScopeChoice: true },
  { id: 'openai', name: 'OpenAI', shortName: 'O', active: false, group: 'ai', allowsScopeChoice: true },
  { id: 'cloud-ai', name: 'Cloud AI', shortName: 'AI', active: false, group: 'ai', allowsScopeChoice: true },
  { id: 'n8n', name: 'n8n', shortName: 'n8n', active: false, group: 'ai', allowsScopeChoice: true },
  { id: 'clickup', name: 'ClickUp', shortName: 'C', active: false, group: 'task-trackers', allowsScopeChoice: true },
  { id: 'notion', name: 'Notion', shortName: 'N', active: false, group: 'task-trackers', allowsScopeChoice: true },
]

function filterByGroup(items: Integration[], group: IntegrationGroupId): Integration[] {
  if (group === 'all') return items
  return items.filter((i) => i.group === group)
}

interface IntegrationCardProps {
  item: Integration
  isActive: boolean
  onActiveChange: (value: boolean) => void
  onOpenScopeModal: (item: Integration) => void
  onOpenGoogleServicesModal: () => void
}

function IntegrationCard({
  item,
  isActive,
  onActiveChange,
  onOpenScopeModal,
  onOpenGoogleServicesModal,
}: IntegrationCardProps) {
  const navigate = useNavigate()
  const isAi = ['gemini', 'openai', 'cloud-ai', 'n8n'].includes(item.id)

  const handleAction = () => {
    if (item.id === 'google') {
      onOpenGoogleServicesModal()
    } else if (item.href) {
      navigate({ to: item.href })
    } else if (item.allowsScopeChoice) {
      onOpenScopeModal(item)
    }
  }

  return (
    <Card className={styles.card}>
      <Flex direction="column" gap="3" style={{ height: '100%' }}>
        <Flex align="center" justify="between" wrap="wrap" gap="2">
          <Flex align="center" gap="3">
            <Box
              className={styles.iconBox}
              style={{
                backgroundColor: isActive ? 'var(--green-3)' : 'var(--gray-4)',
                color: isActive ? 'var(--green-11)' : 'var(--gray-11)',
              }}
            >
              {isAi ? (
                <LightningBoltIcon width={20} height={20} />
              ) : (
                <Text size="2" weight="bold">
                  {item.shortName || item.name.slice(0, 2)}
                </Text>
              )}
            </Box>
            <Text size="3" weight="medium">
              {item.name}
            </Text>
          </Flex>
          {item.description && (
            <Text size="1" color="gray" style={{ lineHeight: 1.4 }}>
              {item.description}
            </Text>
          )}
          <Flex align="center" gap="2">
            <Badge color={isActive ? 'green' : 'gray'} variant="soft" size="1">
              {isActive ? 'Активна' : 'Неактивна'}
            </Badge>
            <Flex align="center" gap="2">
              <Switch checked={isActive} onCheckedChange={onActiveChange} />
              <Text size="1" color="gray">
                Активно
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Box style={{ flex: 1 }} />
        <Button
          size="2"
          variant={isActive ? 'soft' : 'outline'}
          onClick={handleAction}
          style={{ alignSelf: 'flex-start' }}
        >
          {item.id === 'google'
            ? isActive
              ? 'Настроить'
              : 'Подключить'
            : isActive && item.href
              ? 'Настроить'
              : isActive
                ? 'Настроить'
                : 'Подключить'}
        </Button>
      </Flex>
    </Card>
  )
}

export default function IntegrationsSettings() {
  const [scopeModalItem, setScopeModalItem] = useState<Integration | null>(null)
  const [googleServicesModalOpen, setGoogleServicesModalOpen] = useState(false)
  const [integrationActive, setIntegrationActiveState] = useState<Record<string, boolean>>({})
  const [selectedGroup, setSelectedGroup] = useState<IntegrationGroupId>('all')

  useEffect(() => {
    const next: Record<string, boolean> = {}
    INTEGRATIONS.forEach((i) => {
      next[i.id] = getIntegrationActive(i.id, i.active)
    })
    setIntegrationActiveState(next)
  }, [])

  const handleActiveChange = (id: string, value: boolean) => {
    setIntegrationActive(id, value)
    setIntegrationActiveState((prev) => ({ ...prev, [id]: value }))
  }

  const filtered = filterByGroup(INTEGRATIONS, selectedGroup)

  return (
    <Box style={{ padding: 0, maxWidth: 1200, margin: '0 auto' }}>
      <Text size="6" weight="bold" mb="2" style={{ display: 'block' }}>
        Интеграции
      </Text>
      <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
        Подключайте сервисы и настраивайте обмен данными с HR Helper.
      </Text>

      <Flex className={styles.groupTabs}>
        {INTEGRATION_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`${styles.groupTab} ${selectedGroup === g.id ? styles.groupTabActive : ''}`}
            onClick={() => setSelectedGroup(g.id)}
          >
            {g.label}
          </button>
        ))}
      </Flex>

      <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4" mb="5">
        {filtered.map((item) => (
          <IntegrationCard
            key={item.id}
            item={item}
            isActive={integrationActive[item.id] ?? item.active}
            onActiveChange={(v) => handleActiveChange(item.id, v)}
            onOpenScopeModal={setScopeModalItem}
            onOpenGoogleServicesModal={() => setGoogleServicesModalOpen(true)}
          />
        ))}
      </Grid>

      <Box className={styles.moreMessage}>
        <Text size="2" color="gray">
          Скоро появятся другие интеграции.
        </Text>
      </Box>

      <IntegrationScopeModal
        open={scopeModalItem !== null}
        onOpenChange={(open) => !open && setScopeModalItem(null)}
        integrationId={scopeModalItem?.id ?? ''}
        integrationName={scopeModalItem?.name ?? ''}
      />

      <GoogleServicesModal
        open={googleServicesModalOpen}
        onOpenChange={setGoogleServicesModalOpen}
        onSave={(state) => {
          setIntegrationActive('google', state.enabled)
          setIntegrationActiveState((prev) => ({ ...prev, google: state.enabled }))
        }}
      />
    </Box>
  )
}
