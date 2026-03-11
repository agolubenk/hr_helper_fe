'use client'

import { Box, Button, Card, Flex, Select, Text, TextField } from '@radix-ui/themes'
import { BarChartIcon } from '@radix-ui/react-icons'

const ALL_VALUE = '__all__'

export function CompanyReportPage() {
  return (
    <Box style={{ padding: '0 24px' }}>
      <Flex align="center" justify="between" mb="4" wrap="wrap" gap="3">
        <Flex align="center" gap="2">
          <BarChartIcon width={24} height={24} />
          <Text size="6" weight="bold">
            Отчет по компании
          </Text>
        </Flex>
        <Button variant="solid" style={{ background: 'var(--green-9)' }}>
          Экспорт в Excel
        </Button>
      </Flex>

      <Card>
        <Flex direction="column" gap="3">
          <Text size="2" color="gray">
            Здесь будет детальный отчет (графики/таблицы). Пока — моковая страница-заглушка без потери маршрута и UI-скелета.
          </Text>
          <Flex gap="2" wrap="wrap">
            <Select.Root defaultValue={ALL_VALUE}>
              <Select.Trigger placeholder="Период" />
              <Select.Content>
                <Select.Item value={ALL_VALUE}>Помесячная</Select.Item>
                <Select.Item value="weekly">Понедельная</Select.Item>
                <Select.Item value="daily">Ежедневная</Select.Item>
              </Select.Content>
            </Select.Root>
            <TextField.Root placeholder="Дата начала" defaultValue="12.01.2025" />
            <TextField.Root placeholder="Дата окончания" defaultValue="12.01.2026" />
          </Flex>
        </Flex>
      </Card>
    </Box>
  )
}

