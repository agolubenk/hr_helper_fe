/**
 * Дашборд бенчмарков: KPI, графики, связь с финансами, сводная таблица по специализации / локации / грейду.
 * Список всех записей с фильтрами — `/finance/benchmarks/all`.
 */

import { Box, Flex, Text, Button, Table, Badge, Card, Select } from '@radix-ui/themes'
import {
  BackpackIcon,
  BarChartIcon,
  PersonIcon,
  ListBulletIcon,
  StackIcon,
  ArrowUpIcon,
  GlobeIcon,
} from '@radix-ui/react-icons'
import { useEffect, useMemo, useState } from 'react'
import type { BenchmarkStats } from '@/lib/api'
import {
  BenchmarkChartsSection,
  BENCHMARK_INTERVAL_LABEL,
  type BenchmarkInterval,
  type BenchmarkTrendGranularity,
} from '@/components/finance/BenchmarkChartsSection'
import {
  computeBenchmarkDashboardKpis,
  formatMarketIndex,
  formatSignedPercent,
} from '@/components/finance/benchmarkDashboardKpi'
import { BenchmarkFinanceSettingsCard } from '@/components/finance/BenchmarkFinanceSettingsCard'
import {
  buildBenchmarkSummaryRows,
  formatRubMid,
} from '@/components/finance/benchmarkSummary'
import { Link } from '@/router-adapter'
import {
  MOCK_BENCHMARKS,
  MOCK_MONTHLY_TREND,
  MOCK_STATS,
} from '@/app/pages/benchmarks/benchmarksMocks'
import styles from './styles/BenchmarksPage.module.css'

export default function BenchmarksDashboardPage() {
  const [stats, setStats] = useState<BenchmarkStats | null>(null)
  const [chartInterval, setChartInterval] = useState<BenchmarkInterval>('12m')
  const [trendGranularity, setTrendGranularity] = useState<BenchmarkTrendGranularity>('month')
  const [mockUseFinanceContext, setMockUseFinanceContext] = useState(true)
  const [mockAutoCollect, setMockAutoCollect] = useState(false)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      await new Promise((r) => setTimeout(r, 200))
      if (!cancelled) setStats(MOCK_STATS)
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [])

  const summaryRows = useMemo(() => buildBenchmarkSummaryRows(MOCK_BENCHMARKS), [])

  const dashboardKpis = useMemo(
    () => computeBenchmarkDashboardKpis(MOCK_MONTHLY_TREND, chartInterval),
    [chartInterval]
  )

  return (
    <Box className={styles.container}>
      <Flex direction="column" gap="4">
        <Flex
          className={styles.dashboardHeader}
          align="start"
          justify="between"
          wrap="wrap"
          gap="3"
        >
          <Flex direction="column" gap="1" className={styles.dashboardHeaderTitle}>
            <Text size="6" weight="bold">
              Бенчмарки — обзор
            </Text>
            <Text size="2" color="gray">
              KPI, динамика вилок и сводка по рынку. Детальный список и фильтры — в разделе ниже.
            </Text>
          </Flex>
          <Flex gap="3" align="center" wrap="wrap" justify="end" className={styles.dashboardHeaderActions}>
            <Select.Root
              value={chartInterval}
              onValueChange={(v) => setChartInterval(v as BenchmarkInterval)}
            >
              <Select.Trigger style={{ minWidth: 120 }} aria-label="Период тренда" />
              <Select.Content>
                <Select.Item value="30d">{BENCHMARK_INTERVAL_LABEL['30d']}</Select.Item>
                <Select.Item value="90d">{BENCHMARK_INTERVAL_LABEL['90d']}</Select.Item>
                <Select.Item value="12m">{BENCHMARK_INTERVAL_LABEL['12m']}</Select.Item>
              </Select.Content>
            </Select.Root>
            <Button asChild size="3" variant="soft">
              <Link href="/finance/benchmarks/all">
                <Flex align="center" gap="2">
                  <ListBulletIcon width={16} height={16} />
                  Все бенчмарки
                </Flex>
              </Link>
            </Button>
          </Flex>
        </Flex>

        {stats && (
          <Flex direction="column" gap="3">
            <div className={styles.statsRow}>
              <Box className={styles.statCard} data-border="total">
                <Flex direction="column" gap="2">
                  <Flex align="center" justify="between">
                    <Text size="1" weight="medium" className={styles.statLabel}>
                      ВСЕГО БЕНЧМАРКОВ
                    </Text>
                    <BarChartIcon width={20} height={20} className={styles.statIcon} />
                  </Flex>
                  <Text size="6" weight="bold" className={styles.statValue}>
                    {stats.total_benchmarks}
                  </Text>
                </Flex>
              </Box>
              <Box className={styles.statCard} data-border="candidates">
                <Flex direction="column" gap="2">
                  <Flex align="center" justify="between">
                    <Text size="1" weight="medium" className={styles.statLabelCandidates}>
                      КАНДИДАТЫ
                    </Text>
                    <PersonIcon width={20} height={20} className={styles.statIcon} />
                  </Flex>
                  <Text size="6" weight="bold" className={styles.statValue}>
                    {stats.type_stats.find((s) => s.type === 'candidate')?.count || 0}
                  </Text>
                </Flex>
              </Box>
              <Box className={styles.statCard} data-border="vacancies">
                <Flex direction="column" gap="2">
                  <Flex align="center" justify="between">
                    <Text size="1" weight="medium" className={styles.statLabel}>
                      ВАКАНСИИ
                    </Text>
                    <BackpackIcon width={20} height={20} className={styles.statIcon} />
                  </Flex>
                  <Text size="6" weight="bold" className={styles.statValue}>
                    {stats.type_stats.find((s) => s.type === 'vacancy')?.count || 0}
                  </Text>
                </Flex>
              </Box>
              <Box className={styles.statCard} data-border="avg-mid">
                <Flex direction="column" gap="2">
                  <Flex align="center" justify="between">
                    <Text size="1" weight="medium" className={styles.statLabelAmber}>
                      СРЕДНЯЯ ВИЛКА
                    </Text>
                    <StackIcon width={20} height={20} className={styles.statIcon} />
                  </Flex>
                  <Text size="6" weight="bold" className={styles.statValue}>
                    {formatRubMid(dashboardKpis.avgMidSalary)}
                  </Text>
                  <Text size="1" color="gray">
                    Период: {BENCHMARK_INTERVAL_LABEL[chartInterval]}
                  </Text>
                </Flex>
              </Box>
            </div>
            <div className={styles.statsRow}>
              <Box className={styles.statCard} data-border="market-index">
                <Flex direction="column" gap="2">
                  <Flex align="center" justify="between">
                    <Text size="1" weight="medium" className={styles.statLabelOrange}>
                      ИНДЕКС РЫНКА
                    </Text>
                    <GlobeIcon width={20} height={20} className={styles.statIcon} />
                  </Flex>
                  <Text size="6" weight="bold" className={styles.statValue}>
                    {formatMarketIndex(dashboardKpis.marketIndex)}
                  </Text>
                  <Text size="1" color="gray">
                    100 = начало периода · {BENCHMARK_INTERVAL_LABEL[chartInterval]}
                  </Text>
                </Flex>
              </Box>
              <Box className={styles.statCard} data-border="candidate-growth">
                <Flex direction="column" gap="2">
                  <Flex align="center" justify="between">
                    <Text size="1" weight="medium" className={styles.statLabelGrowthCandidates}>
                      ПРИРОСТ КАНДИДАТОВ
                    </Text>
                    <PersonIcon width={20} height={20} className={styles.statIcon} />
                  </Flex>
                  <Text size="6" weight="bold" className={styles.statValue}>
                    {formatSignedPercent(dashboardKpis.candidateGrowthPct)}
                  </Text>
                  <Text size="1" color="gray">
                    Период: {BENCHMARK_INTERVAL_LABEL[chartInterval]} (мок)
                  </Text>
                </Flex>
              </Box>
              <Box className={styles.statCard} data-border="vacancy-growth">
                <Flex direction="column" gap="2">
                  <Flex align="center" justify="between">
                    <Text size="1" weight="medium" className={styles.statLabelCyan}>
                      ПРИРОСТ ВАКАНСИЙ
                    </Text>
                    <ArrowUpIcon width={20} height={20} className={styles.statIcon} />
                  </Flex>
                  <Text size="6" weight="bold" className={styles.statValue}>
                    {formatSignedPercent(dashboardKpis.vacancyGrowthPct)}
                  </Text>
                  <Text size="1" color="gray">
                    Период: {BENCHMARK_INTERVAL_LABEL[chartInterval]} (мок)
                  </Text>
                </Flex>
              </Box>
              <Box className={styles.statCard} data-border="salary-growth">
                <Flex direction="column" gap="2">
                  <Flex align="center" justify="between">
                    <Text size="1" weight="medium" className={styles.statLabelViolet}>
                      ПРИРОСТ ВИЛКИ
                    </Text>
                    <ArrowUpIcon width={20} height={20} className={styles.statIcon} />
                  </Flex>
                  <Text size="6" weight="bold" className={styles.statValue}>
                    {formatSignedPercent(dashboardKpis.salaryGrowthPct)}
                  </Text>
                  <Text size="1" color="gray">
                    Период: {BENCHMARK_INTERVAL_LABEL[chartInterval]}
                  </Text>
                </Flex>
              </Box>
            </div>
          </Flex>
        )}

        <BenchmarkFinanceSettingsCard
          useFinanceContext={mockUseFinanceContext}
          onUseFinanceContextChange={setMockUseFinanceContext}
          autoCollect={mockAutoCollect}
          onAutoCollectChange={setMockAutoCollect}
        />

        {stats ? (
          <BenchmarkChartsSection
            stats={stats}
            trendSeries={MOCK_MONTHLY_TREND}
            interval={chartInterval}
            trendGranularity={trendGranularity}
            onTrendGranularityChange={setTrendGranularity}
          />
        ) : null}

        <Card>
          <Flex direction="column" gap="3">
            <Flex direction="column" gap="1">
              <Text size="4" weight="bold">
                Сводная таблица
              </Text>
              <Text size="2" color="gray">
                Разрез: специализация, локация, грейд. Суммы — средняя «середина» вилки по точкам кандидатов и
                вакансий в ячейке (мок).
              </Text>
            </Flex>
            <Box className={styles.tableContainer}>
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Специализация</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Локация</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Грейд</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Кандидаты</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className={styles.salaryColumn}>
                      Сумма (кандидаты)
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Вакансии</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className={styles.salaryColumn}>
                      Сумма (вакансии)
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {summaryRows.map((row) => (
                    <Table.Row key={`${row.specialization}-${row.location}-${row.gradeName}`}>
                      <Table.Cell>
                        <Text weight="medium">{row.specialization}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{row.location}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge>{row.gradeName}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text>{row.candidateCount}</Text>
                      </Table.Cell>
                      <Table.Cell className={styles.salaryColumn}>
                        <Text>{formatRubMid(row.candidateAvgMid)}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text>{row.vacancyCount}</Text>
                      </Table.Cell>
                      <Table.Cell className={styles.salaryColumn}>
                        <Text>{formatRubMid(row.vacancyAvgMid)}</Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Flex>
        </Card>
      </Flex>
    </Box>
  )
}
