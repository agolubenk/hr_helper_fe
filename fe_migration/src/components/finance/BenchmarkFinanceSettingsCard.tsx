import { Box, Card, Flex, Switch, Text } from '@radix-ui/themes'
import { Link } from '@/router-adapter'

interface BenchmarkFinanceSettingsCardProps {
  /** Мок: использовать курс и налоговый контур из «Финансы» при отображении вилок */
  useFinanceContext: boolean
  onUseFinanceContextChange: (v: boolean) => void
  /** Мок: напоминание о сборе данных из вакансий/кандидатов */
  autoCollect: boolean
  onAutoCollectChange: (v: boolean) => void
}

export function BenchmarkFinanceSettingsCard({
  useFinanceContext,
  onUseFinanceContextChange,
  autoCollect,
  onAutoCollectChange,
}: BenchmarkFinanceSettingsCardProps) {
  return (
    <Card>
      <Flex direction="column" gap="3">
        <Flex align="start" gap="3" wrap="wrap">
          <Box style={{ flex: '1 1 240px' }}>
            <Text size="3" weight="bold" as="div">
              Связь с настройками финансов
            </Text>
            <Text size="2" color="gray" mt="1">
              Валюты, налоги и отчётный период задаются в разделе{' '}
              <Link
                href="/company-settings/finance"
                style={{ color: 'var(--accent-11)', fontWeight: 500, textDecoration: 'underline' }}
              >
                Настройки компании → Финансы
              </Link>
              . Здесь — только переключатели поведения бенчмарков (мок до API).
            </Text>
          </Box>
        </Flex>

        <Flex direction="column" gap="3">
          <Flex align="center" justify="between" gap="3" wrap="wrap">
            <Box style={{ flex: '1 1 200px' }}>
              <Text size="2" weight="medium">
                Учитывать курсы и налоговый контур из «Финансов»
              </Text>
              <Text size="1" color="gray">
                При появлении API вилки на графиках будут приводиться к базовой валюте компании
              </Text>
            </Box>
            <Switch checked={useFinanceContext} onCheckedChange={onUseFinanceContextChange} />
          </Flex>
          <Flex align="center" justify="between" gap="3" wrap="wrap">
            <Box style={{ flex: '1 1 200px' }}>
              <Text size="2" weight="medium">
                Автосбор новых точек бенчмарка
              </Text>
              <Text size="1" color="gray">
                Плановый опрос вакансий и профилей кандидатов (мок)
              </Text>
            </Box>
            <Switch checked={autoCollect} onCheckedChange={onAutoCollectChange} />
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}
