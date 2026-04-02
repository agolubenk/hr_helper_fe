import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Switch,
  Table,
  Text,
  TextField,
  Select,
  Separator,
} from '@radix-ui/themes'
import type { LinkBuilderAutomationRule, LinkBuilderGeneralSettings } from '../../linkBuilderSettingsTypes'
import {
  LinkBuilderAutomationRuleEditDialog,
  type LinkBuilderRuleSavePayload,
} from './LinkBuilderAutomationRuleEditDialog'

interface LinkBuilderSettingsPanelProps {
  general: LinkBuilderGeneralSettings
  patchGeneral: (patch: Partial<LinkBuilderGeneralSettings>) => void
  automations: LinkBuilderAutomationRule[]
  addRule: (rule: Omit<LinkBuilderAutomationRule, 'id'>) => void
  updateRule: (id: string, patch: Partial<LinkBuilderAutomationRule>) => void
  removeRule: (id: string) => void
}

const MATCH_LABELS: Record<LinkBuilderAutomationRule['matchKind'], string> = {
  host: 'Хост',
  'host-path-prefix': 'Префикс',
  regex: 'Regex',
}

export function LinkBuilderSettingsPanel({
  general,
  patchGeneral,
  automations,
  addRule,
  updateRule,
  removeRule,
}: LinkBuilderSettingsPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<LinkBuilderAutomationRule | null>(null)

  const openNew = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (r: LinkBuilderAutomationRule) => {
    setEditing(r)
    setDialogOpen(true)
  }

  const handleSaveRule = (payload: LinkBuilderRuleSavePayload) => {
    if (payload.id) {
      const { id, ...patch } = payload
      updateRule(id, patch)
    } else {
      const { id: _skip, ...rest } = payload
      addRule(rest)
    }
  }

  const sorted = [...automations].sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name))

  return (
    <Flex direction="column" gap="4">
      <Card size="2">
        <Heading as="h2" size="4" mb="2" style={{ marginTop: 0 }}>
          Общие настройки
        </Heading>
        <Text size="2" color="gray" mb="3">
          Влияют на форму сокращения и формат коротких ссылок. Хранятся локально в браузере.
        </Text>
        <Flex direction="column" gap="3">
          <Flex direction="column" gap="1">
            <Text asChild size="2" weight="medium">
              <label htmlFor="lb-set-default-status">Новые ссылки по умолчанию</label>
            </Text>
            <Select.Root
              value={general.defaultStatus}
              onValueChange={(v) => patchGeneral({ defaultStatus: v === 'draft' ? 'draft' : 'active' })}
            >
              <Select.Trigger id="lb-set-default-status" style={{ maxWidth: 280 }} />
              <Select.Content position="popper">
                <Select.Item value="active">Активные</Select.Item>
                <Select.Item value="draft">Черновик</Select.Item>
              </Select.Content>
            </Select.Root>
          </Flex>
          <Flex align="center" gap="2">
            <Switch
              checked={general.openAdvancedByDefault}
              onCheckedChange={(c) => patchGeneral({ openAdvancedByDefault: c === true })}
              id="lb-set-adv"
            />
            <Text asChild size="2">
              <label htmlFor="lb-set-adv">Сразу показывать расширенные настройки в форме</label>
            </Text>
          </Flex>
          <Flex direction="column" gap="1">
            <Text asChild size="2" weight="medium">
              <label htmlFor="lb-set-seg">Сегмент пути короткой ссылки</label>
            </Text>
            <TextField.Root
              id="lb-set-seg"
              value={general.shortLinkPathSegment}
              onChange={(e) => patchGeneral({ shortLinkPathSegment: e.target.value })}
              placeholder="l"
            />
            <Text size="1" color="gray">
              Результат: <code>https://ваш-домен/{general.shortLinkPathSegment || 'l'}/код</code>. Латиница, цифры, дефис,
              до 32 символов.
            </Text>
          </Flex>
          <Separator size="4" />
          <Flex align="center" gap="2">
            <Switch
              checked={general.autoApplyAutomations}
              onCheckedChange={(c) => patchGeneral({ autoApplyAutomations: c === true })}
              id="lb-set-auto"
            />
            <Text asChild size="2">
              <label htmlFor="lb-set-auto">Автоматически применять правила при вводе URL</label>
            </Text>
          </Flex>
          <Flex align="center" gap="2">
            <Switch
              checked={general.notifyAutomationApplied}
              onCheckedChange={(c) => patchGeneral({ notifyAutomationApplied: c === true })}
              id="lb-set-notify"
            />
            <Text asChild size="2">
              <label htmlFor="lb-set-notify">Показывать уведомление о сработавшем правиле</label>
            </Text>
          </Flex>
        </Flex>
      </Card>

      <Card size="2">
        <Flex justify="between" align="center" gap="2" wrap="wrap" mb="2">
          <Box>
            <Heading as="h2" size="4" style={{ margin: 0 }}>
              Автоматизации
            </Heading>
            <Text size="2" color="gray">
              Условно заполняют форму: подсказки OG, срок, alias, расширенный блок.
            </Text>
          </Box>
          <Button size="2" onClick={openNew}>
            Добавить правило
          </Button>
        </Flex>

        <Box style={{ overflowX: 'auto' }}>
          <Table.Root size="1" variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Вкл.</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Приоритет</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Название</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Тип</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Шаблон</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sorted.map((r) => (
                <Table.Row key={r.id}>
                  <Table.Cell>
                    <Switch
                      checked={r.enabled}
                      onCheckedChange={(c) => updateRule(r.id, { enabled: c === true })}
                      aria-label={`Включить ${r.name}`}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">{r.priority}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2" weight="medium">
                      {r.name}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2">{MATCH_LABELS[r.matchKind]}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="2" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.pattern || '—'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex gap="2" wrap="wrap">
                      <Button size="1" variant="soft" onClick={() => openEdit(r)}>
                        Изменить
                      </Button>
                      <Button size="1" variant="surface" color="red" onClick={() => removeRule(r.id)}>
                        Удалить
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card>

      <LinkBuilderAutomationRuleEditDialog
        rule={editing}
        open={dialogOpen}
        isNew={editing === null}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditing(null)
        }}
        onSave={handleSaveRule}
      />
    </Flex>
  )
}
