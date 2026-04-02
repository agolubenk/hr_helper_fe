import type { LegacyRef } from 'react'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Flex,
  Heading,
  Select,
  Spinner,
  Switch,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes'
import { LinkBuilderOgPreviewCard } from './LinkBuilderOgPreviewCard'
import type { LinkBuilderShortenFormModel } from '../../useLinkBuilderShortenForm'
import styles from './LinkBuilderShortenForm.module.css'

interface LinkBuilderShortenFormProps {
  form: LinkBuilderShortenFormModel
}

function validateHostForPreview(raw: string): string | null {
  try {
    const t = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    return new URL(t).hostname
  } catch {
    return null
  }
}

function previewHostHint(url: string): string {
  const v = url.trim()
  if (!v) return 'ваш-домен.ru'
  const n = validateHostForPreview(v)
  return n ?? 'ваш-домен.ru'
}

export function LinkBuilderShortenForm({ form }: LinkBuilderShortenFormProps) {
  const f = form
  const previewHost = previewHostHint(f.url)

  const busy = f.submitStatus === 'loading'

  return (
    <div ref={f.formRef as LegacyRef<HTMLDivElement>} id="link-builder-form" className={styles.formAnchor}>
      <Card size="2" className={styles.formCard}>
      <form onSubmit={f.handleSubmit} noValidate>
        <Flex direction="column" gap="4">
          <Box>
            <Heading as="h2" size="4" id="link-builder-form-heading" style={{ margin: 0 }}>
              Форма сокращения
            </Heading>
            <Text size="2" color="gray">
              Проверка URL на лету. Пока данные хранятся только в браузере.
            </Text>
          </Box>

          {f.feedbackMessage ? (
            <Box
              role="status"
              aria-live="polite"
              className={
                f.submitStatus === 'error' ? `${styles.formStatus} ${styles.formStatusError}` : styles.formStatus
              }
              p="3"
            >
              <Text size="2">{f.feedbackMessage}</Text>
            </Box>
          ) : null}

          <Flex direction="column" gap="1">
            <Text asChild size="2" weight="medium">
              <label htmlFor="link-builder-url">Исходный URL</label>
            </Text>
            <TextField.Root
              id="link-builder-url"
              name="longUrl"
              type="url"
              inputMode="url"
              placeholder="https://example.com/длинный-путь"
              value={f.url}
              onChange={(e) => f.setUrl(e.target.value)}
              disabled={busy}
              aria-invalid={f.urlInvalid}
              aria-describedby={f.urlMessage ? 'link-builder-url-error' : undefined}
              className={f.urlInvalid ? styles.fieldInvalid : undefined}
            />
            {f.urlMessage ? (
              <Text id="link-builder-url-error" size="1" color="red" role="alert">
                {f.urlMessage}
              </Text>
            ) : null}
          </Flex>

          <Flex align="center" gap="2">
            <Checkbox
              checked={f.hasAdvanced}
              onCheckedChange={(c) => f.setHasAdvanced(c === true)}
              id="link-builder-advanced"
              disabled={busy}
            />
            <Text asChild size="2">
              <label htmlFor="link-builder-advanced">Расширенные настройки</label>
            </Text>
          </Flex>

          {f.hasAdvanced ? (
            <>
              <Flex direction="column" gap="1">
                <Text asChild size="2" weight="medium">
                  <label htmlFor="link-builder-alias">Alias (необязательно)</label>
                </Text>
                <TextField.Root
                  id="link-builder-alias"
                  name="alias"
                  placeholder="my-link"
                  value={f.alias}
                  onChange={(e) => f.setAlias(e.target.value)}
                  disabled={busy}
                  aria-invalid={f.aliasInvalid}
                  aria-describedby={f.aliasMessage ? 'link-builder-alias-error' : undefined}
                  className={f.aliasInvalid ? styles.fieldInvalid : undefined}
                />
                {f.aliasMessage ? (
                  <Text id="link-builder-alias-error" size="1" color="red" role="alert">
                    {f.aliasMessage}
                  </Text>
                ) : (
                  <Text size="1" color="gray">
                    Латиница, цифры и дефис. Должен быть уникален.
                  </Text>
                )}
              </Flex>

              <Flex direction="column" gap="2">
                <Text asChild size="2" weight="medium">
                  <label htmlFor="link-builder-expiry-mode">Срок действия</label>
                </Text>
                <Select.Root
                  value={f.expiryMode}
                  onValueChange={(v) => f.setExpiryMode(v as typeof f.expiryMode)}
                  disabled={busy}
                >
                  <Select.Trigger id="link-builder-expiry-mode" className={styles.selectTrigger} aria-label="Срок действия" />
                  <Select.Content position="popper">
                    <Select.Item value="none">Без ограничений</Select.Item>
                    <Select.Item value="date">До даты</Select.Item>
                    <Select.Item value="clicks">По количеству кликов</Select.Item>
                  </Select.Content>
                </Select.Root>

                {f.expiryMode === 'date' ? (
                  <Flex direction="column" gap="1">
                    <Text asChild size="2" weight="medium">
                      <label htmlFor="link-builder-expiry-at">Дата и время окончания</label>
                    </Text>
                    <TextField.Root
                      id="link-builder-expiry-at"
                      type="datetime-local"
                      value={f.expiryLocal}
                      onChange={(e) => f.setExpiryLocal(e.target.value)}
                      disabled={busy}
                    />
                  </Flex>
                ) : null}

                {f.expiryMode === 'clicks' ? (
                  <Flex direction="column" gap="1">
                    <Text asChild size="2" weight="medium">
                      <label htmlFor="link-builder-max-clicks">Максимум кликов</label>
                    </Text>
                    <TextField.Root
                      id="link-builder-max-clicks"
                      type="number"
                      min={1}
                      value={f.maxClicksInput}
                      onChange={(e) => f.setMaxClicksInput(e.target.value)}
                      disabled={busy}
                    />
                    {f.expiryInvalid && f.expiryMode === 'clicks' ? (
                      <Text size="1" color="red" role="alert">
                        Укажите целое число не меньше 1
                      </Text>
                    ) : null}
                  </Flex>
                ) : null}
                {f.expiryInvalid && f.expiryMode === 'date' ? (
                  <Text size="1" color="red" role="alert">
                    Выберите дату и время
                  </Text>
                ) : null}
              </Flex>

              <Flex direction="column" gap="2">
                <Text size="2" weight="medium">
                  Превью (Open Graph)
                </Text>
                <Flex direction={{ initial: 'column', md: 'row' }} gap="4" align="start">
                  <Flex direction="column" gap="2" style={{ flex: 1, minWidth: 0 }}>
                    <Flex direction="column" gap="1">
                      <Text asChild size="2" weight="medium">
                        <label htmlFor="link-builder-og-title">Заголовок</label>
                      </Text>
                      <TextField.Root
                        id="link-builder-og-title"
                        value={f.ogTitle}
                        onChange={(e) => f.setOgTitle(e.target.value)}
                        disabled={busy}
                      />
                    </Flex>
                    <Flex direction="column" gap="1">
                      <Text asChild size="2" weight="medium">
                        <label htmlFor="link-builder-og-desc">Описание</label>
                      </Text>
                      <TextArea
                        id="link-builder-og-desc"
                        value={f.ogDescription}
                        onChange={(e) => f.setOgDescription(e.target.value)}
                        rows={3}
                        disabled={busy}
                      />
                    </Flex>
                    <Flex direction="column" gap="1">
                      <Text asChild size="2" weight="medium">
                        <label htmlFor="link-builder-og-img">URL изображения</label>
                      </Text>
                      <TextField.Root
                        id="link-builder-og-img"
                        type="url"
                        placeholder="https://…"
                        value={f.ogImageUrl}
                        onChange={(e) => f.setOgImageUrl(e.target.value)}
                        disabled={busy}
                      />
                    </Flex>
                  </Flex>
                  <Box style={{ flex: 1, minWidth: 0, width: '100%' }}>
                    <LinkBuilderOgPreviewCard
                      title={f.ogTitle}
                      description={f.ogDescription}
                      imageUrl={f.ogImageUrl}
                      fallbackHost={previewHost}
                    />
                  </Box>
                </Flex>
              </Flex>
            </>
          ) : null}

          <Flex align="center" justify="between" gap="3" wrap="wrap">
            <Flex align="center" gap="2">
              <Switch
                checked={f.linkActiveSwitch}
                onCheckedChange={f.setLinkActiveSwitch}
                id="link-builder-active"
                disabled={busy}
              />
              <Text asChild size="2">
                <label htmlFor="link-builder-active">Ссылка активна (иначе черновик)</label>
              </Text>
            </Flex>
            <Button
              type="submit"
              disabled={f.shortenDisabled}
              className={
                f.buttonSuccessFlash
                  ? `${styles.submitBtn} ${styles.submitBtnSuccess}`
                  : f.submitStatus === 'error'
                    ? `${styles.submitBtn} ${styles.submitBtnError}`
                    : styles.submitBtn
              }
              aria-busy={f.submitStatus === 'loading'}
            >
              {f.submitStatus === 'loading' ? (
                <Flex align="center" gap="2">
                  <Spinner size="1" />
                  Сокращаем…
                </Flex>
              ) : f.buttonSuccessFlash ? (
                'Готово'
              ) : (
                'Сократить'
              )}
            </Button>
          </Flex>
        </Flex>
      </form>
    </Card>
    </div>
  )
}
