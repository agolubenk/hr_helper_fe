'use client'

import { Box, Button, Callout, Card, Flex, Select, Table, Text } from '@radix-ui/themes'
import {
  CheckCircledIcon,
  ExternalLinkIcon,
  FileTextIcon,
  Link2Icon,
  MixerHorizontalIcon,
  PersonIcon,
  StarIcon,
} from '@radix-ui/react-icons'
import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToast } from '@/shared/components/feedback/Toast'
import { getHuntflowUserSettings } from '@/shared/lib/huntflowUserSettings'
import styles from './HuntflowPage.module.css'
import {
  MOCK_HF_FIELDS,
  MOCK_HF_REJECTION_REASONS,
  MOCK_HF_SOURCES,
  MOCK_HUNTFLOW_ORGS,
  MOCK_HUNTFLOW_STAGES,
  MOCK_OUR_FIELDS,
  MOCK_OUR_OFFICES,
  MOCK_OUR_REJECTION_REASONS,
  MOCK_OUR_SOURCES,
  MOCK_OUR_STAGES,
  saveHuntflowMappingsMock,
} from './mocks'

const NONE = '__none__'

const QUICK_LINKS = [
  { label: 'Вакансии', href: '/vacancies', icon: FileTextIcon },
  { label: 'Грейды', href: '/company-settings/grades', icon: StarIcon },
  { label: 'Этапы найма и причины отказа', href: '/company-settings/recruiting/stages', icon: MixerHorizontalIcon },
  { label: 'Дополнительные поля кандидатов', href: '/company-settings/candidate-fields', icon: PersonIcon },
] as const

function isEmpty(v: string | undefined) {
  return !v || v === NONE || v === ''
}

export function HuntflowPage() {
  const toast = useToast()
  const navigate = useNavigate()

  const userSettings = useMemo(() => getHuntflowUserSettings(), [])
  const isIntegrationDisabled = userSettings?.credentialSource === 'disabled'

  const [orgMapping, setOrgMapping] = useState<Record<number, string>>({
    [MOCK_HUNTFLOW_ORGS[0].id]: MOCK_OUR_OFFICES[0].id,
  })

  const [stageMapping, setStageMapping] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_OUR_STAGES.map((s) => [s.id, String(MOCK_HUNTFLOW_STAGES[0]?.id ?? NONE)])),
  )

  const [rejectionMapping, setRejectionMapping] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_OUR_REJECTION_REASONS.map((r) => [r.id, NONE])),
  )

  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_OUR_FIELDS.map((f) => [f.id, NONE])),
  )

  const [sourceMapping, setSourceMapping] = useState<Record<string, string>>(
    Object.fromEntries(MOCK_OUR_SOURCES.map((s) => [s.id, NONE])),
  )

  const getHfId = (mapping: Record<string, string>, ourId: string) => {
    const v = mapping[ourId]
    return !isEmpty(v) ? Number(v) : null
  }

  const handleSave = async () => {
    try {
      await saveHuntflowMappingsMock()
      toast.showSuccess('Сохранено', 'Связи Huntflow ↔ HR Helper сохранены (мок)', { duration: 8000 })
    } catch {
      toast.showError('Не удалось сохранить', 'Попробуйте ещё раз')
    }
  }

  return (
    <Box className={styles.container}>
      <Flex gap="4" wrap="wrap" className={styles.topRow}>
        <Card className={styles.statusCard} style={{ flex: 1, minWidth: '260px' }}>
          <Flex direction="column" gap="3">
            <Flex align="center" gap="2">
              <CheckCircledIcon
                width={24}
                height={24}
                style={{ color: isIntegrationDisabled ? 'var(--gray-9)' : 'var(--green-9)' }}
              />
              <Text size="4" weight="bold">
                {isIntegrationDisabled ? 'Интеграция отключена' : 'Подключение активно'}
              </Text>
            </Flex>
            <Text size="2" color="gray">
              API: https://api.huntflow.ru/v2
            </Text>
          </Flex>
        </Card>

        <Card className={styles.quickLinksCard} style={{ flex: 2, minWidth: '320px' }}>
          <Flex align="center" gap="2" mb="3">
            <ExternalLinkIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
            <Text size="4" weight="bold">
              Быстрые ссылки
            </Text>
          </Flex>
          <Flex gap="2" wrap="wrap">
            {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
              <Button key={href} size="2" variant="soft" onClick={() => navigate({ to: href })}>
                <Icon width={16} height={16} />
                {label}
              </Button>
            ))}
          </Flex>
        </Card>
      </Flex>

      <Card className={styles.formCard}>
        <Flex align="center" gap="2" mb="4">
          <Link2Icon width={22} height={22} style={{ color: 'var(--accent-9)' }} />
          <Text size="4" weight="bold">
            Связи Huntflow ↔ HR Helper
          </Text>
        </Flex>

        <Box mb="5">
          <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>
            Организация Huntflow → Подразделение / офис в HR Helper
          </Text>
          <Flex gap="3" wrap="wrap" align="end">
            {MOCK_HUNTFLOW_ORGS.map((org) => (
              <Flex key={org.id} align="center" gap="2">
                <Text size="2" color="gray">
                  {org.name}
                </Text>
                <span style={{ color: 'var(--gray-8)' }}>→</span>
                <Select.Root value={orgMapping[org.id] || ''} onValueChange={(v) => setOrgMapping((m) => ({ ...m, [org.id]: v }))}>
                  <Select.Trigger placeholder="Выберите офис" style={{ minWidth: 180 }} />
                  <Select.Content>
                    {MOCK_OUR_OFFICES.map((o) => (
                      <Select.Item key={o.id} value={o.id}>
                        {o.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Flex>
            ))}
          </Flex>
        </Box>

        <Box mb="5">
          <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>
            Этапы найма → Этапы в Huntflow
          </Text>
          <Table.Root size="1">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Этап найма</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Этап найма в Huntflow</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>ID этапа в Huntflow</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {MOCK_OUR_STAGES.map((s) => {
                const hfId = getHfId(stageMapping, s.id)
                return (
                  <Table.Row key={s.id}>
                    <Table.Cell>{s.name}</Table.Cell>
                    <Table.Cell>
                      <Select.Root
                        value={stageMapping[s.id] || NONE}
                        onValueChange={(v) => setStageMapping((m) => ({ ...m, [s.id]: v }))}
                      >
                        <Select.Trigger placeholder="—" style={{ minWidth: 180 }} />
                        <Select.Content>
                          <Select.Item value={NONE}>—</Select.Item>
                          {MOCK_HUNTFLOW_STAGES.map((h) => (
                            <Select.Item key={h.id} value={String(h.id)}>
                              {h.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Table.Cell>
                    <Table.Cell>{hfId != null ? hfId : '—'}</Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>
        </Box>

        <Box mb="5">
          <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>
            Причины отказа → Причины в Huntflow
          </Text>
          <Table.Root size="1">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Причина отказа</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Причина в Huntflow</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>ID в Huntflow</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {MOCK_OUR_REJECTION_REASONS.map((r) => {
                const hfId = getHfId(rejectionMapping, r.id)
                return (
                  <Table.Row key={r.id}>
                    <Table.Cell>{r.name}</Table.Cell>
                    <Table.Cell>
                      <Select.Root
                        value={rejectionMapping[r.id] || NONE}
                        onValueChange={(v) => setRejectionMapping((m) => ({ ...m, [r.id]: v }))}
                      >
                        <Select.Trigger placeholder="—" style={{ minWidth: 200 }} />
                        <Select.Content>
                          <Select.Item value={NONE}>—</Select.Item>
                          {MOCK_HF_REJECTION_REASONS.map((h) => (
                            <Select.Item key={h.id} value={String(h.id)}>
                              {h.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Table.Cell>
                    <Table.Cell>{hfId != null ? hfId : '—'}</Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>
        </Box>

        <Box mb="5">
          <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>
            Дополнительные поля кандидата: наши поля → Huntflow
          </Text>
          <Table.Root size="1" mb="4">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Наше поле</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Поле в Huntflow</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>ID в Huntflow</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {MOCK_OUR_FIELDS.map((f) => {
                const hfId = getHfId(fieldMapping, f.id)
                return (
                  <Table.Row key={f.id}>
                    <Table.Cell>{f.name}</Table.Cell>
                    <Table.Cell>
                      <Select.Root value={fieldMapping[f.id] || NONE} onValueChange={(v) => setFieldMapping((m) => ({ ...m, [f.id]: v }))}>
                        <Select.Trigger placeholder="—" style={{ minWidth: 200 }} />
                        <Select.Content>
                          <Select.Item value={NONE}>—</Select.Item>
                          {MOCK_HF_FIELDS.map((h) => (
                            <Select.Item key={h.id} value={String(h.id)}>
                              {h.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Table.Cell>
                    <Table.Cell>{hfId != null ? hfId : '—'}</Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>

          <Text size="2" color="gray" mb="2" style={{ display: 'block' }}>
            Все поля в Huntflow (справочно)
          </Text>
          <Table.Root size="1">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Поле в Huntflow</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>ID в Huntflow</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {MOCK_HF_FIELDS.map((h) => (
                <Table.Row key={h.id}>
                  <Table.Cell>{h.name}</Table.Cell>
                  <Table.Cell>{h.id}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>

        <Box mb="5">
          <Text size="3" weight="medium" mb="2" style={{ display: 'block' }}>
            Источники: наши → Huntflow
          </Text>
          <Table.Root size="1" mb="4">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Наш источник</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Источник в Huntflow</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>ID в Huntflow</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {MOCK_OUR_SOURCES.map((s) => {
                const hfId = getHfId(sourceMapping, s.id)
                return (
                  <Table.Row key={s.id}>
                    <Table.Cell>{s.name}</Table.Cell>
                    <Table.Cell>
                      <Select.Root value={sourceMapping[s.id] || NONE} onValueChange={(v) => setSourceMapping((m) => ({ ...m, [s.id]: v }))}>
                        <Select.Trigger placeholder="—" style={{ minWidth: 200 }} />
                        <Select.Content>
                          <Select.Item value={NONE}>—</Select.Item>
                          {MOCK_HF_SOURCES.map((h) => (
                            <Select.Item key={h.id} value={String(h.id)}>
                              {h.name}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                    </Table.Cell>
                    <Table.Cell>{hfId != null ? hfId : '—'}</Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table.Root>

          <Text size="2" color="gray" mb="2" style={{ display: 'block' }}>
            Все источники в Huntflow (справочно)
          </Text>
          <Table.Root size="1">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Источник в Huntflow</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>ID в Huntflow</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {MOCK_HF_SOURCES.map((h) => (
                <Table.Row key={h.id}>
                  <Table.Cell>{h.name}</Table.Cell>
                  <Table.Cell>{h.id}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>

        <Callout.Root size="1" variant="soft" color="blue">
          <Callout.Text>
            Настройте грейды, этапы найма, причины отказа, доп. поля и источники в соответствующих разделах, если нужных
            значений ещё нет.
          </Callout.Text>
        </Callout.Root>

        <Flex justify="end" mt="4">
          <Button size="3" onClick={handleSave}>
            Сохранить связи
          </Button>
        </Flex>
      </Card>
    </Box>
  )
}

