import { Badge, Box, Button, Card, Flex, Heading, Table, Text } from '@radix-ui/themes'
import type { ShortenedLinkRecord, LinkBuilderLinkStatus } from '../../linkBuilderTypes'
import { formatDateTime, truncateMiddle } from '../../linkBuilderFormat'
import styles from './LinkBuilderHistorySection.module.css'

interface LinkBuilderHistorySectionProps {
  links: ShortenedLinkRecord[]
  copyingId: string | null
  onCopy: (record: ShortenedLinkRecord) => void
  onOpenSettings: (record: ShortenedLinkRecord) => void
  onToggleStatus: (record: ShortenedLinkRecord) => void
}

function statusBadge(status: LinkBuilderLinkStatus): { label: string; color: 'green' | 'gray' | 'orange' } {
  switch (status) {
    case 'active':
      return { label: 'Активна', color: 'green' }
    case 'draft':
      return { label: 'Черновик', color: 'gray' }
    case 'disabled':
      return { label: 'Отключена', color: 'orange' }
  }
}

function toggleLabel(s: LinkBuilderLinkStatus): string {
  if (s === 'active') return 'Отключить'
  return 'Включить'
}

export function LinkBuilderHistorySection({
  links,
  copyingId,
  onCopy,
  onOpenSettings,
  onToggleStatus,
}: LinkBuilderHistorySectionProps) {
  return (
    <Card size="2">
      <Flex direction="column" gap="3">
        <Box>
          <Heading as="h2" size="4" style={{ margin: 0 }}>
            История ссылок
          </Heading>
          <Text size="2" color="gray">
            Хранится в браузере (localStorage). На мобильных — карточки, на широком экране — таблица.
          </Text>
        </Box>

        {links.length === 0 ? (
          <Text size="2" color="gray">
            Пока пусто — сократите первую ссылку выше.
          </Text>
        ) : (
          <>
            <Box className={styles.tableWrap}>
              <Table.Root size="1" variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Короткая</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Оригинал</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Создана</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Статус</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Действия</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {links.map((row) => {
                    const b = statusBadge(row.status)
                    const copied = copyingId === row.id
                    return (
                      <Table.Row key={row.id}>
                        <Table.Cell>
                          <Text size="2" className={styles.mono} title={row.shortUrl}>
                            {truncateMiddle(row.shortUrl, 36)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2" title={row.longUrl}>
                            {truncateMiddle(row.longUrl, 48)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text size="2">{formatDateTime(row.createdAt)}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge color={b.color} size="1">
                            {b.label}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="2" wrap="wrap">
                            <Button size="1" variant="soft" onClick={() => onCopy(row)}>
                              {copied ? 'Скопировано' : 'Копировать'}
                            </Button>
                            <Button size="1" variant="outline" onClick={() => onOpenSettings(row)}>
                              Настройки
                            </Button>
                            <Button size="1" variant="surface" onClick={() => onToggleStatus(row)}>
                              {toggleLabel(row.status)}
                            </Button>
                          </Flex>
                        </Table.Cell>
                      </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table.Root>
            </Box>

            <Flex direction="column" gap="2" className={styles.cards}>
              {links.map((row) => {
                const b = statusBadge(row.status)
                const copied = copyingId === row.id
                return (
                  <Card key={row.id} size="1" variant="surface" className={styles.card}>
                    <Flex direction="column" gap="2">
                      <Flex justify="between" align="center" gap="2" wrap="wrap">
                        <Badge color={b.color} size="1">
                          {b.label}
                        </Badge>
                        <Text size="1" color="gray">
                          {formatDateTime(row.createdAt)}
                        </Text>
                      </Flex>
                      <div>
                        <Text size="1" weight="bold" as="div">
                          Короткая
                        </Text>
                        <Text size="2" className={styles.mono} title={row.shortUrl}>
                          {row.shortUrl}
                        </Text>
                      </div>
                      <div>
                        <Text size="1" weight="bold" as="div">
                          Оригинал
                        </Text>
                        <Text size="2" title={row.longUrl}>
                          {truncateMiddle(row.longUrl, 120)}
                        </Text>
                      </div>
                      <Flex gap="2" wrap="wrap">
                        <Button size="1" variant="soft" onClick={() => onCopy(row)}>
                          {copied ? 'Скопировано' : 'Копировать'}
                        </Button>
                        <Button size="1" variant="outline" onClick={() => onOpenSettings(row)}>
                          Настройки
                        </Button>
                        <Button size="1" variant="surface" onClick={() => onToggleStatus(row)}>
                          {toggleLabel(row.status)}
                        </Button>
                      </Flex>
                    </Flex>
                  </Card>
                )
              })}
            </Flex>
          </>
        )}
      </Flex>
    </Card>
  )
}
