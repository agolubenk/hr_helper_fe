import { useEffect, useState } from 'react'
import { Box, Button, Checkbox, Dialog, Flex, Select, Text, TextArea, TextField } from '@radix-ui/themes'
import type { LinkBuilderAutomationMatchKind, LinkBuilderAutomationRule } from '../../linkBuilderSettingsTypes'

export type LinkBuilderRuleSavePayload = Omit<LinkBuilderAutomationRule, 'id'> & { id?: string }

interface LinkBuilderAutomationRuleEditDialogProps {
  rule: LinkBuilderAutomationRule | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isNew: boolean
  onSave: (payload: LinkBuilderRuleSavePayload) => void
}

export function LinkBuilderAutomationRuleEditDialog({
  rule,
  open,
  onOpenChange,
  isNew,
  onSave,
}: LinkBuilderAutomationRuleEditDialogProps) {
  const [name, setName] = useState('')
  const [priority, setPriority] = useState('50')
  const [enabled, setEnabled] = useState(true)
  const [matchKind, setMatchKind] = useState<LinkBuilderAutomationMatchKind>('host')
  const [pattern, setPattern] = useState('')
  const [applyOpenAdvanced, setApplyOpenAdvanced] = useState(false)
  const [applyStatus, setApplyStatus] = useState<'none' | 'active' | 'draft'>('none')
  const [suggestAlias, setSuggestAlias] = useState(false)
  const [ogTitleTpl, setOgTitleTpl] = useState('')
  const [ogDescTpl, setOgDescTpl] = useState('')
  const [ogImage, setOgImage] = useState('')
  const [expiryApply, setExpiryApply] = useState<'unchanged' | 'date' | 'clicks'>('unchanged')
  const [expiryDays, setExpiryDays] = useState('30')
  const [maxClicks, setMaxClicks] = useState('100')

  useEffect(() => {
    if (!open) return
    if (rule) {
      setName(rule.name)
      setPriority(String(rule.priority))
      setEnabled(rule.enabled)
      setMatchKind(rule.matchKind)
      setPattern(rule.pattern)
      const a = rule.apply
      setApplyOpenAdvanced(a.openAdvanced === true)
      setApplyStatus(a.status === 'active' ? 'active' : a.status === 'draft' ? 'draft' : 'none')
      setSuggestAlias(a.suggestAliasFromPath === true)
      setOgTitleTpl(a.ogTitleTemplate ?? '')
      setOgDescTpl(a.ogDescriptionTemplate ?? '')
      setOgImage(a.ogImageUrl ?? '')
      if (a.expiryMode === 'date') {
        setExpiryApply('date')
        setExpiryDays(String(a.expiryDaysFromNow ?? 30))
      } else if (a.expiryMode === 'clicks') {
        setExpiryApply('clicks')
        setMaxClicks(String(a.maxClicks ?? 100))
      } else {
        setExpiryApply('unchanged')
        setExpiryDays('30')
        setMaxClicks(String(a.maxClicks ?? 100))
      }
    } else {
      setName('Новое правило')
      setPriority('50')
      setEnabled(true)
      setMatchKind('host')
      setPattern('')
      setApplyOpenAdvanced(false)
      setApplyStatus('none')
      setSuggestAlias(false)
      setOgTitleTpl('')
      setOgDescTpl('')
      setOgImage('')
      setExpiryApply('unchanged')
      setExpiryDays('30')
      setMaxClicks('100')
    }
  }, [open, rule])

  const handleSave = () => {
    const pr = Number.parseInt(priority.trim(), 10)
    const apply: LinkBuilderAutomationRule['apply'] = {}
    if (applyOpenAdvanced) apply.openAdvanced = true
    if (applyStatus === 'active') apply.status = 'active'
    if (applyStatus === 'draft') apply.status = 'draft'
    if (suggestAlias) apply.suggestAliasFromPath = true
    if (ogTitleTpl.trim()) apply.ogTitleTemplate = ogTitleTpl.trim()
    if (ogDescTpl.trim()) apply.ogDescriptionTemplate = ogDescTpl.trim()
    if (ogImage.trim()) apply.ogImageUrl = ogImage.trim()
    if (expiryApply === 'date') {
      const d = Number.parseInt(expiryDays.trim(), 10)
      apply.expiryMode = 'date'
      apply.expiryDaysFromNow = Number.isFinite(d) && d > 0 ? d : 30
    } else if (expiryApply === 'clicks') {
      const n = Number.parseInt(maxClicks.trim(), 10)
      apply.expiryMode = 'clicks'
      apply.maxClicks = Number.isFinite(n) && n >= 1 ? n : 100
    }

    const base: LinkBuilderRuleSavePayload = {
      name: name.trim() || 'Без названия',
      enabled,
      priority: Number.isFinite(pr) ? pr : 50,
      matchKind,
      pattern: pattern.trim(),
      apply,
    }
    onSave(rule ? { ...base, id: rule.id } : base)
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 520 }}>
        <Dialog.Title>{isNew ? 'Новое правило' : 'Редактирование правила'}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="3">
          Совпадение проверяется сверху вниз по приоритету (меньше число — раньше). В шаблонах: {'{hostname}'},{' '}
          {'{pathname}'}, {'{pathLast}'}, {'{fullUrl}'}.
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <Flex align="center" gap="2">
            <Checkbox checked={enabled} onCheckedChange={(c) => setEnabled(c === true)} id="rule-enabled" />
            <Text asChild size="2">
              <label htmlFor="rule-enabled">Правило включено</label>
            </Text>
          </Flex>

          <Flex direction="column" gap="1">
            <Text asChild size="2" weight="medium">
              <label htmlFor="rule-name">Название</label>
            </Text>
            <TextField.Root id="rule-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Flex>

          <Flex gap="3" wrap="wrap">
            <Box style={{ flex: '1 1 120px' }}>
              <Text asChild size="2" weight="medium">
                <label htmlFor="rule-priority">Приоритет</label>
              </Text>
              <TextField.Root id="rule-priority" type="number" value={priority} onChange={(e) => setPriority(e.target.value)} />
            </Box>
            <Box style={{ flex: '2 1 200px' }}>
              <Text asChild size="2" weight="medium">
                <label htmlFor="rule-match">Тип совпадения</label>
              </Text>
              <Select.Root value={matchKind} onValueChange={(v) => setMatchKind(v as LinkBuilderAutomationMatchKind)}>
                <Select.Trigger id="rule-match" style={{ width: '100%' }} />
                <Select.Content position="popper">
                  <Select.Item value="host">Только хост (example.com)</Select.Item>
                  <Select.Item value="host-path-prefix">Хост + префикс пути (site.com/docs)</Select.Item>
                  <Select.Item value="regex">Регулярное выражение (весь URL)</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>

          <Flex direction="column" gap="1">
            <Text asChild size="2" weight="medium">
              <label htmlFor="rule-pattern">Шаблон</label>
            </Text>
            <TextArea id="rule-pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} rows={2} />
          </Flex>

          <Text size="2" weight="medium">
            Действия при совпадении
          </Text>
          <Flex direction="column" gap="2">
            <Flex align="center" gap="2">
              <Checkbox
                checked={applyOpenAdvanced}
                onCheckedChange={(c) => setApplyOpenAdvanced(c === true)}
                id="rule-adv"
              />
              <Text asChild size="2">
                <label htmlFor="rule-adv">Открыть расширенные настройки</label>
              </Text>
            </Flex>
            <Flex align="center" gap="2">
              <Checkbox checked={suggestAlias} onCheckedChange={(c) => setSuggestAlias(c === true)} id="rule-alias" />
              <Text asChild size="2">
                <label htmlFor="rule-alias">Alias из последнего сегмента пути</label>
              </Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text asChild size="2" weight="medium">
                <label htmlFor="rule-apply-status">Статус новой ссылки</label>
              </Text>
              <Select.Root value={applyStatus} onValueChange={(v) => setApplyStatus(v as typeof applyStatus)}>
                <Select.Trigger id="rule-apply-status" style={{ width: '100%' }} />
                <Select.Content position="popper">
                  <Select.Item value="none">Не менять</Select.Item>
                  <Select.Item value="active">Активна</Select.Item>
                  <Select.Item value="draft">Черновик</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
            <Flex direction="column" gap="1">
              <Text asChild size="2" weight="medium">
                <label htmlFor="rule-og-title">Шаблон заголовка OG</label>
              </Text>
              <TextField.Root id="rule-og-title" value={ogTitleTpl} onChange={(e) => setOgTitleTpl(e.target.value)} />
            </Flex>
            <Flex direction="column" gap="1">
              <Text asChild size="2" weight="medium">
                <label htmlFor="rule-og-desc">Шаблон описания OG</label>
              </Text>
              <TextField.Root id="rule-og-desc" value={ogDescTpl} onChange={(e) => setOgDescTpl(e.target.value)} />
            </Flex>
            <Flex direction="column" gap="1">
              <Text asChild size="2" weight="medium">
                <label htmlFor="rule-og-img">URL картинки OG</label>
              </Text>
              <TextField.Root id="rule-og-img" type="url" value={ogImage} onChange={(e) => setOgImage(e.target.value)} />
            </Flex>
            <Flex direction="column" gap="1">
              <Text asChild size="2" weight="medium">
                <label htmlFor="rule-expiry">Срок / клики</label>
              </Text>
              <Select.Root value={expiryApply} onValueChange={(v) => setExpiryApply(v as typeof expiryApply)}>
                <Select.Trigger id="rule-expiry" style={{ width: '100%' }} />
                <Select.Content position="popper">
                  <Select.Item value="unchanged">Не задавать</Select.Item>
                  <Select.Item value="date">Срок: через N дней</Select.Item>
                  <Select.Item value="clicks">Лимит кликов</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
            {expiryApply === 'date' ? (
              <Flex direction="column" gap="1">
                <Text asChild size="2" weight="medium">
                  <label htmlFor="rule-days">Через сколько дней истекает</label>
                </Text>
                <TextField.Root id="rule-days" type="number" min={1} value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)} />
              </Flex>
            ) : null}
            {expiryApply === 'clicks' ? (
              <Flex direction="column" gap="1">
                <Text asChild size="2" weight="medium">
                  <label htmlFor="rule-clicks">Максимум кликов</label>
                </Text>
                <TextField.Root id="rule-clicks" type="number" min={1} value={maxClicks} onChange={(e) => setMaxClicks(e.target.value)} />
              </Flex>
            ) : null}
          </Flex>

          <Flex justify="end" gap="2" mt="2">
            <Dialog.Close>
              <Button type="button" variant="soft" color="gray">
                Отмена
              </Button>
            </Dialog.Close>
            <Button type="button" onClick={handleSave}>
              Сохранить
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
