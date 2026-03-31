import { Box, Card, Flex, Grid, Switch, Text, TextArea, TextField } from '@radix-ui/themes'
import { Link2Icon } from '@radix-ui/react-icons'
import { Link } from '@/router-adapter'
import type { OutboundHttpDefaults } from '@/features/system-settings/types'
import styles from '../OutboundIntegrationsPanel.module.css'

interface OutboundIntegrationsHttpSectionProps {
  httpDefaults: OutboundHttpDefaults
  onPatch: (patch: Partial<OutboundHttpDefaults>) => void
}

export function OutboundIntegrationsHttpSection({
  httpDefaults,
  onPatch,
}: OutboundIntegrationsHttpSectionProps) {
  return (
    <>
      <Card size="1" variant="surface">
        <Flex align="center" gap="2" mb="3">
          <Link2Icon width={18} height={18} style={{ color: 'var(--gray-11)' }} />
          <Text size="3" weight="bold">
            Исходящие HTTP-вызовы (API «наружу»)
          </Text>
        </Flex>
        <Text size="2" color="gray" mb="4" as="div" style={{ maxWidth: '62ch' }}>
          Общие ограничения для сценариев, которые дергают внешние API (ATS, маркетплейсы, корпоративные
          сервисы). Конкретные базовые URL задаются в карточках интеграций.
        </Text>
        <Grid columns={{ initial: '1', sm: '2' }} gap="4" className={styles.fieldStack}>
          <Flex align="center" gap="3" style={{ gridColumn: '1 / -1' }}>
            <Switch
              checked={httpDefaults.enabled}
              onCheckedChange={(v) => onPatch({ enabled: Boolean(v) })}
            />
            <Text size="2">Разрешить исходящие HTTP-запросы из сценариев и jobs</Text>
          </Flex>
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Таймаут, сек
            </Text>
            <TextField.Root
              type="number"
              value={String(httpDefaults.timeoutSeconds)}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                onPatch({
                  timeoutSeconds: Number.isFinite(n) ? Math.min(300, Math.max(5, n)) : httpDefaults.timeoutSeconds,
                })
              }}
            />
          </Box>
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Макс. параллельных запросов
            </Text>
            <TextField.Root
              type="number"
              value={String(httpDefaults.maxConcurrent)}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                onPatch({
                  maxConcurrent: Number.isFinite(n) ? Math.min(200, Math.max(1, n)) : httpDefaults.maxConcurrent,
                })
              }}
            />
          </Box>
          <Box style={{ gridColumn: '1 / -1' }}>
            <Text size="2" weight="medium" mb="2" as="div">
              Маска общего секрета подписи исходящих тел (webhook signing)
            </Text>
            <TextField.Root
              type="password"
              value={httpDefaults.signingSecretHint}
              onChange={(e) => onPatch({ signingSecretHint: e.target.value })}
              placeholder="whsec ••••"
            />
          </Box>
          <Box style={{ gridColumn: '1 / -1' }}>
            <Text size="2" weight="medium" mb="2" as="div">
              Примечания (User-Agent, корпоративный прокси, allowlist исходящих хостов)
            </Text>
            <TextArea
              value={httpDefaults.egressNote}
              onChange={(e) => onPatch({ egressNote: e.target.value })}
              rows={3}
              placeholder="Например: egress через proxy.internal:8080; разрешены *.partner.io"
            />
          </Box>
        </Grid>
      </Card>

      <Text size="2" color="gray" as="div" style={{ maxWidth: '70ch' }}>
        Контракты REST и ключи — в разделе{' '}
        <Link href="/company-settings/integrations">«Интеграции и API»</Link>. Реестр типов событий и подписок —
        на вкладках ниже.
      </Text>
    </>
  )
}
