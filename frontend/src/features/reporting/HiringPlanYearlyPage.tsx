'use client'

import { Box, Card, Flex, Text } from '@radix-ui/themes'
import { CalendarIcon } from '@radix-ui/react-icons'

export function HiringPlanYearlyPage() {
  return (
    <Box style={{ padding: '0 24px' }}>
      <Flex align="center" gap="2" mb="4">
        <CalendarIcon width={24} height={24} />
        <Text size="6" weight="bold">
          План найма — годовая таблица
        </Text>
      </Flex>

      <Card>
        <Text size="2" color="gray">
          Моковая страница годовой таблицы. Следующим шагом перенесу полноценную таблицу из `frontend old/reporting/hiring-plan/yearly`.
        </Text>
      </Card>
    </Box>
  )
}

