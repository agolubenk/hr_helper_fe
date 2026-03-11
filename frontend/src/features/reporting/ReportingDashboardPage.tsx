'use client'

import { Box, Button, Card, Flex, Text } from '@radix-ui/themes'
import { BarChartIcon, CalendarIcon, CheckCircledIcon, ClockIcon, ExclamationTriangleIcon, FileTextIcon, PersonIcon } from '@radix-ui/react-icons'
import { useNavigate } from '@tanstack/react-router'
import styles from './ReportingDashboardPage.module.css'

export function ReportingDashboardPage() {
  const navigate = useNavigate()

  const metrics = {
    totalInterviewers: 23,
    activeInterviewers: 22,
    totalRequests: 38,
    plannedRequests: 5,
    inProcessRequests: 15,
    closedRequests: 12,
    cancelledRequests: 6,
    totalVacancies: 25,
    activeVacancies: 18,
    totalSLAs: 38,
    activeSLAs: 35,
    slaCoverage: 92,
    avgTimeToOffer: 45,
    avgTimeToHire: 60,
    avgRecruiterDays: 25,
    onTimeRequests: 28,
    overdueRequests: 10,
    totalCandidates: 45,
    hiredCandidates: 12,
    interviewCompletionRate: 85,
    offerAcceptanceRate: 78,
  }

  return (
    <Box className={styles.container}>
      <Flex align="center" gap="2">
        <BarChartIcon width={24} height={24} />
        <Text size="6" weight="bold">
          Отчетность
        </Text>
      </Flex>

      <Flex gap="2" wrap="wrap">
        <Button variant="soft" onClick={() => navigate({ to: '/reporting/company' })}>
          <BarChartIcon />
          Отчет по компании
        </Button>
        <Button variant="soft" onClick={() => navigate({ to: '/reporting/hiring-plan' })}>
          <FileTextIcon />
          План найма
        </Button>
      </Flex>

      <Box>
        <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
          HR метрики
        </Text>
        <Flex gap="4" wrap="wrap">
          <Card className={styles.metricCard} style={{ flex: 1, minWidth: 250 }}>
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <PersonIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                <Text size="2" color="gray">
                  Интервьюеры
                </Text>
              </Flex>
              <Text size="5" weight="bold">
                {metrics.activeInterviewers} / {metrics.totalInterviewers}
              </Text>
              <Text size="1" color="gray">
                Активных из общего числа
              </Text>
            </Flex>
          </Card>

          <Card className={styles.metricCard} style={{ flex: 1, minWidth: 250 }}>
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <FileTextIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                <Text size="2" color="gray">
                  Заявки
                </Text>
              </Flex>
              <Text size="5" weight="bold">
                {metrics.totalRequests}
              </Text>
              <Flex gap="2" wrap="wrap">
                <Text size="1" color="gray">
                  Планируется: {metrics.plannedRequests}
                </Text>
                <Text size="1" color="gray">
                  В процессе: {metrics.inProcessRequests}
                </Text>
                <Text size="1" color="gray">
                  Закрыто: {metrics.closedRequests}
                </Text>
              </Flex>
            </Flex>
          </Card>

          <Card className={styles.metricCard} style={{ flex: 1, minWidth: 250 }}>
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <FileTextIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                <Text size="2" color="gray">
                  Вакансии
                </Text>
              </Flex>
              <Text size="5" weight="bold">
                {metrics.activeVacancies} / {metrics.totalVacancies}
              </Text>
              <Text size="1" color="gray">
                Активных из общего числа
              </Text>
            </Flex>
          </Card>
        </Flex>
      </Box>

      <Box>
        <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
          SLA и скорость
        </Text>
        <Flex gap="4" wrap="wrap">
          <Card className={styles.metricCard} style={{ flex: 1, minWidth: 250 }}>
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <ClockIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                <Text size="2" color="gray">
                  Покрытие SLA
                </Text>
              </Flex>
              <Text size="5" weight="bold">
                {metrics.slaCoverage}%
              </Text>
              <Text size="1" color="gray">
                {metrics.activeSLAs} из {metrics.totalSLAs} активных SLA
              </Text>
            </Flex>
          </Card>

          <Card className={styles.metricCard} style={{ flex: 1, minWidth: 250 }}>
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <CalendarIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                <Text size="2" color="gray">
                  Time-to-Offer
                </Text>
              </Flex>
              <Text size="5" weight="bold">
                {metrics.avgTimeToOffer} дней
              </Text>
              <Text size="1" color="gray">
                Среднее время до оффера
              </Text>
            </Flex>
          </Card>

          <Card className={styles.metricCard} style={{ flex: 1, minWidth: 250 }}>
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <CalendarIcon width={20} height={20} style={{ color: 'var(--accent-9)' }} />
                <Text size="2" color="gray">
                  Time-to-Hire
                </Text>
              </Flex>
              <Text size="5" weight="bold">
                {metrics.avgTimeToHire} дней
              </Text>
              <Text size="1" color="gray">
                Среднее время до найма
              </Text>
            </Flex>
          </Card>
        </Flex>
      </Box>

      <Box>
        <Text size="4" weight="bold" mb="3" style={{ display: 'block' }}>
          Исполнение
        </Text>
        <Flex gap="4" wrap="wrap">
          <Card className={styles.metricCard} style={{ flex: 1, minWidth: 250 }}>
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <CheckCircledIcon width={20} height={20} style={{ color: '#10b981' }} />
                <Text size="2" color="gray">
                  В срок
                </Text>
              </Flex>
              <Text size="5" weight="bold" style={{ color: '#10b981' }}>
                {metrics.onTimeRequests}
              </Text>
              <Text size="1" color="gray">
                Заявок выполнено в срок
              </Text>
            </Flex>
          </Card>

          <Card className={styles.metricCard} style={{ flex: 1, minWidth: 250 }}>
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <ExclamationTriangleIcon width={20} height={20} style={{ color: '#ef4444' }} />
                <Text size="2" color="gray">
                  Просрочено
                </Text>
              </Flex>
              <Text size="5" weight="bold" style={{ color: '#ef4444' }}>
                {metrics.overdueRequests}
              </Text>
              <Text size="1" color="gray">
                Заявок просрочено
              </Text>
            </Flex>
          </Card>
        </Flex>
      </Box>
    </Box>
  )
}

