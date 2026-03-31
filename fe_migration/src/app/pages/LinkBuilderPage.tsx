import { useCallback, useState } from 'react'
import { Box, Button, Flex, Heading, Tabs, Text, TextField } from '@radix-ui/themes'
import { useLinkBuilderHistory } from '@/features/coding-platform/useLinkBuilderHistory'
import { useLinkBuilderShortenForm } from '@/features/coding-platform/useLinkBuilderShortenForm'
import { useLinkBuilderSettings } from '@/features/coding-platform/useLinkBuilderSettings'
import type { ShortenedLinkRecord } from '@/features/coding-platform/linkBuilderTypes'
import { LinkBuilderCopyBanner } from '@/features/coding-platform/components/link-builder/LinkBuilderCopyBanner'
import { LinkBuilderShortenForm } from '@/features/coding-platform/components/link-builder/LinkBuilderShortenForm'
import { LinkBuilderHistorySection } from '@/features/coding-platform/components/link-builder/LinkBuilderHistorySection'
import { LinkBuilderEditLinkDialog } from '@/features/coding-platform/components/link-builder/LinkBuilderEditLinkDialog'
import { LinkBuilderSettingsPanel } from '@/features/coding-platform/components/link-builder/LinkBuilderSettingsPanel'
import layoutStyles from '@/app/pages/styles/CodingPlatformPages.module.css'
import styles from './LinkBuilderPage.module.css'

export function LinkBuilderPage() {
  const settings = useLinkBuilderSettings()
  const { links, prepend, replace } = useLinkBuilderHistory()

  const notifyAutomation = settings.general.notifyAutomationApplied
  const [automationBanner, setAutomationBanner] = useState<string | null>(null)
  const onAutomationApplied = useCallback(
    (name: string) => {
      if (!notifyAutomation) return
      setAutomationBanner(`Применено правило автоматизации: «${name}».`)
      window.setTimeout(() => setAutomationBanner(null), 4500)
    },
    [notifyAutomation],
  )

  const form = useLinkBuilderShortenForm({
    links,
    onRecordCreated: prepend,
    generalSettings: settings.general,
    automationRules: settings.automations,
    onAutomationApplied,
  })

  const [copyBanner, setCopyBanner] = useState<string | null>(null)
  const dismissCopyBanner = useCallback(() => setCopyBanner(null), [])

  const [copyingId, setCopyingId] = useState<string | null>(null)
  const [editing, setEditing] = useState<ShortenedLinkRecord | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const onCopy = async (record: ShortenedLinkRecord) => {
    try {
      await navigator.clipboard.writeText(record.shortUrl)
      setCopyBanner('Ссылка скопирована')
      setCopyingId(record.id)
      window.setTimeout(() => {
        setCopyingId((id) => (id === record.id ? null : id))
      }, 2200)
    } catch {
      setCopyBanner('Не удалось скопировать — проверьте разрешения браузера')
    }
  }

  const onOpenSettings = (record: ShortenedLinkRecord) => {
    setEditing(record)
    setEditOpen(true)
  }

  const onToggleStatus = (record: ShortenedLinkRecord) => {
    if (record.status === 'active') {
      replace(record.id, { status: 'disabled' })
    } else {
      replace(record.id, { status: 'active' })
    }
  }

  return (
    <>
      <LinkBuilderCopyBanner message={copyBanner} onDismiss={dismissCopyBanner} />

      <Flex direction="column" gap="4" className={layoutStyles.wrapWide} p={{ initial: '3', sm: '4' }}>
        <Box>
          <Heading size="6" mb="1">
            Управление ссылками
          </Heading>
          <Text size="2" color="gray">
            Сокращение ссылок с расширенными настройками и локальной историей. Бэкенд имитируется — позже можно
            подключить реальный API.
          </Text>
        </Box>

        <Tabs.Root defaultValue="shorten">
          <Tabs.List>
            <Tabs.Trigger value="shorten">Сокращение</Tabs.Trigger>
            <Tabs.Trigger value="settings">Настройки и автоматизации</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="shorten">
            <Flex direction="column" gap="4" mt="4">
              <Box className={styles.hero}>
                <Heading as="h1" size="7" className={styles.heroTitle}>
                  Сократи ссылку
                </Heading>
                <Text size="3" color="gray">
                  Быстро создайте короткий адрес, настройте срок жизни и превью — всё в одном месте.
                </Text>
                <div className={styles.heroRow}>
                  <Box className={styles.heroField}>
                    <Box mb="1">
                      <Text asChild size="2" weight="medium">
                        <label htmlFor="link-builder-hero-url">URL для сокращения</label>
                      </Text>
                    </Box>
                    <TextField.Root
                      id="link-builder-hero-url"
                      type="url"
                      inputMode="url"
                      placeholder="https://example.com/очень/длинный/путь"
                      value={form.url}
                      onChange={(e) => form.setUrl(e.target.value)}
                      disabled={form.submitStatus === 'loading'}
                    />
                  </Box>
                  <Button type="button" size="3" className={styles.heroCta} onClick={() => form.scrollToForm()}>
                    Создать ссылку
                  </Button>
                </div>
              </Box>

              {automationBanner ? (
                <Box role="status" aria-live="polite" p="3" style={{ borderRadius: 8, border: '1px solid var(--accent-a6)', background: 'var(--accent-a3)' }}>
                  <Text size="2">{automationBanner}</Text>
                </Box>
              ) : null}

              <LinkBuilderShortenForm form={form} />
              <LinkBuilderHistorySection
                links={links}
                copyingId={copyingId}
                onCopy={onCopy}
                onOpenSettings={onOpenSettings}
                onToggleStatus={onToggleStatus}
              />
            </Flex>
          </Tabs.Content>

          <Tabs.Content value="settings">
            <Box mt="4">
              <LinkBuilderSettingsPanel
                general={settings.general}
                patchGeneral={settings.patchGeneral}
                automations={settings.automations}
                addRule={settings.addRule}
                updateRule={settings.updateRule}
                removeRule={settings.removeRule}
              />
            </Box>
          </Tabs.Content>
        </Tabs.Root>

        <LinkBuilderEditLinkDialog
          record={editing}
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open)
            if (!open) setEditing(null)
          }}
          allLinks={links}
          onSave={(id, patch) => replace(id, patch)}
        />
      </Flex>
    </>
  )
}
