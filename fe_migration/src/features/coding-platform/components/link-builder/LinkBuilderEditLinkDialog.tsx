import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  Flex,
  Select,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes'
import type { LinkBuilderExpiryMode, LinkBuilderLinkStatus, ShortenedLinkRecord } from '../../linkBuilderTypes'
import { datetimeLocalToIso, isoToDatetimeLocalValue } from '../../linkBuilderFormat'
import { extractShortLinkPathSegment } from '../../linkBuilderAutomation'
import { validateLongUrl, validateAliasAgainstRecords, extractShortLinkSlug } from '../../linkBuilderValidation'

interface LinkBuilderEditLinkDialogProps {
  record: ShortenedLinkRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  allLinks: ShortenedLinkRecord[]
  onSave: (id: string, patch: Partial<ShortenedLinkRecord>) => void
}

function initialExpiryMode(r: ShortenedLinkRecord): LinkBuilderExpiryMode {
  if (r.expiresAt) return 'date'
  if (r.maxClicks != null) return 'clicks'
  return 'none'
}

export function LinkBuilderEditLinkDialog({
  record,
  open,
  onOpenChange,
  allLinks,
  onSave,
}: LinkBuilderEditLinkDialogProps) {
  const [longUrl, setLongUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [status, setStatus] = useState<LinkBuilderLinkStatus>('active')
  const [expiryMode, setExpiryMode] = useState<LinkBuilderExpiryMode>('none')
  const [expiryLocal, setExpiryLocal] = useState('')
  const [maxClicksInput, setMaxClicksInput] = useState('10')
  const [ogTitle, setOgTitle] = useState('')
  const [ogDescription, setOgDescription] = useState('')
  const [ogImageUrl, setOgImageUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !record) return
    setLongUrl(record.longUrl)
    setAlias(record.alias ?? '')
    setStatus(record.status)
    setExpiryMode(initialExpiryMode(record))
    setExpiryLocal(isoToDatetimeLocalValue(record.expiresAt))
    setMaxClicksInput(record.maxClicks != null ? String(record.maxClicks) : '10')
    setOgTitle(record.ogTitle ?? '')
    setOgDescription(record.ogDescription ?? '')
    setOgImageUrl(record.ogImageUrl ?? '')
    setError(null)
  }, [open, record])

  const maxClicksParsed = useMemo(() => {
    const n = Number.parseInt(maxClicksInput.trim(), 10)
    if (!Number.isFinite(n) || n < 1) return null
    return n
  }, [maxClicksInput])

  const handleSave = () => {
    if (!record) return
    setError(null)

    const urlRes = validateLongUrl(longUrl)
    if (!urlRes.ok) {
      setError(urlRes.error ?? 'Некорректный URL')
      return
    }

    const slugFallback = extractShortLinkSlug(record.shortUrl) ?? 'link'
    const intendedSlug = alias.trim() || slugFallback

    if (alias.trim()) {
      const av = validateAliasAgainstRecords(alias.trim(), allLinks, record.id)
      if (!av.ok) {
        setError(av.error ?? 'Некорректный alias')
        return
      }
    } else {
      const sv = validateAliasAgainstRecords(slugFallback, allLinks, record.id)
      if (!sv.ok) {
        setError(sv.error ?? 'Конфликт короткого кода')
        return
      }
    }

    let expiresAt: string | null = null
    let maxClicks: number | null = null
    if (expiryMode === 'date') {
      if (!expiryLocal.trim()) {
        setError('Укажите дату окончания')
        return
      }
      const iso = datetimeLocalToIso(expiryLocal)
      if (!iso) {
        setError('Некорректная дата')
        return
      }
      expiresAt = iso
    } else if (expiryMode === 'clicks') {
      if (maxClicksParsed === null) {
        setError('Укажите число кликов (целое ≥ 1)')
        return
      }
      maxClicks = maxClicksParsed
    }

    const origin = new URL(record.shortUrl).origin
    const seg = extractShortLinkPathSegment(record.shortUrl)
    const shortUrl = new URL(`/${seg}/${encodeURIComponent(intendedSlug)}`, origin).toString()

    onSave(record.id, {
      shortUrl,
      longUrl: urlRes.normalized ?? longUrl.trim(),
      alias: alias.trim() ? alias.trim() : null,
      status,
      expiresAt,
      maxClicks,
      ogTitle: ogTitle.trim() ? ogTitle.trim() : null,
      ogDescription: ogDescription.trim() ? ogDescription.trim() : null,
      ogImageUrl: ogImageUrl.trim() ? ogImageUrl.trim() : null,
    })
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 520 }}>
        <Dialog.Title>Настройки ссылки</Dialog.Title>
        <Dialog.Description size="2" mb="3" color="gray">
          Изменения сохраняются локально. Короткий код и alias должны оставаться уникальными.
        </Dialog.Description>

        {!record ? null : (
          <Flex direction="column" gap="3">
            {error ? (
              <Box role="alert">
                <Text size="2" color="red">
                  {error}
                </Text>
              </Box>
            ) : null}

            <Flex direction="column" gap="1">
              <Text asChild size="2" weight="medium">
                <label htmlFor="edit-long-url">Исходный URL</label>
              </Text>
              <TextField.Root id="edit-long-url" value={longUrl} onChange={(e) => setLongUrl(e.target.value)} />
            </Flex>

            <Flex direction="column" gap="1">
              <Text asChild size="2" weight="medium">
                <label htmlFor="edit-alias">Alias / короткий код</label>
              </Text>
              <TextField.Root
                id="edit-alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Оставьте пустым, чтобы сохранить текущий код"
              />
              <Text size="1" color="gray">
                При пустом поле сохраняется существующий код из короткой ссылки.
              </Text>
            </Flex>

            <Flex direction="column" gap="1">
              <Text asChild size="2" weight="medium">
                <label htmlFor="edit-status">Статус</label>
              </Text>
              <Select.Root value={status} onValueChange={(v) => setStatus(v as LinkBuilderLinkStatus)}>
                <Select.Trigger id="edit-status" />
                <Select.Content position="popper">
                  <Select.Item value="active">Активна</Select.Item>
                  <Select.Item value="draft">Черновик</Select.Item>
                  <Select.Item value="disabled">Отключена</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            <Flex direction="column" gap="2">
              <Text asChild size="2" weight="medium">
                <label htmlFor="edit-expiry-mode">Срок действия</label>
              </Text>
              <Select.Root value={expiryMode} onValueChange={(v) => setExpiryMode(v as LinkBuilderExpiryMode)}>
                <Select.Trigger id="edit-expiry-mode" />
                <Select.Content position="popper">
                  <Select.Item value="none">Без ограничений</Select.Item>
                  <Select.Item value="date">До даты</Select.Item>
                  <Select.Item value="clicks">По количеству кликов</Select.Item>
                </Select.Content>
              </Select.Root>

              {expiryMode === 'date' ? (
                <Flex direction="column" gap="1">
                  <Text asChild size="2" weight="medium">
                    <label htmlFor="edit-expiry-at">Дата и время</label>
                  </Text>
                  <TextField.Root
                    id="edit-expiry-at"
                    type="datetime-local"
                    value={expiryLocal}
                    onChange={(e) => setExpiryLocal(e.target.value)}
                  />
                </Flex>
              ) : null}

              {expiryMode === 'clicks' ? (
                <Flex direction="column" gap="1">
                  <Text asChild size="2" weight="medium">
                    <label htmlFor="edit-max-clicks">Макс. кликов</label>
                  </Text>
                  <TextField.Root
                    id="edit-max-clicks"
                    type="number"
                    min={1}
                    value={maxClicksInput}
                    onChange={(e) => setMaxClicksInput(e.target.value)}
                  />
                </Flex>
              ) : null}
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                Open Graph
              </Text>
              <Flex direction="column" gap="1">
                <Text asChild size="2" weight="medium">
                  <label htmlFor="edit-og-title">Заголовок</label>
                </Text>
                <TextField.Root id="edit-og-title" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} />
              </Flex>
              <Flex direction="column" gap="1">
                <Text asChild size="2" weight="medium">
                  <label htmlFor="edit-og-desc">Описание</label>
                </Text>
                <TextArea id="edit-og-desc" value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} rows={3} />
              </Flex>
              <Flex direction="column" gap="1">
                <Text asChild size="2" weight="medium">
                  <label htmlFor="edit-og-img">URL изображения</label>
                </Text>
                <TextField.Root id="edit-og-img" type="url" value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} />
              </Flex>
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
        )}
      </Dialog.Content>
    </Dialog.Root>
  )
}
