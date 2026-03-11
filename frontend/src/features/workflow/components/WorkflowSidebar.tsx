'use client'

import { Box, Text, Flex, Button, Table } from '@radix-ui/themes'
import { ChevronDownIcon, CalendarIcon, ChevronUpIcon, OpenInNewWindowIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import styles from './WorkflowSidebar.module.css'

export function WorkflowSidebar() {
  const [reportsExpanded, setReportsExpanded] = useState(true)
  const [currentWeekExpanded, setCurrentWeekExpanded] = useState(false)
  const [previousWeekExpanded, setPreviousWeekExpanded] = useState(false)

  const stages = [
    { stage: 'HR-screening', count: 0 },
    { stage: 'Tech Screening', count: 0 },
    { stage: 'Interview', count: 0 },
    { stage: 'Offer', count: 0 },
    { stage: 'Offer Accepted', count: 0 },
    { stage: 'Onboarding', count: 0 },
  ]

  const handleWikiClick = () => window.open('/wiki', '_blank', 'noopener,noreferrer')

  const handleCurrentWeekClick = () => {
    const next = !currentWeekExpanded
    setCurrentWeekExpanded(next)
    if (next) setPreviousWeekExpanded(false)
  }

  const handlePreviousWeekClick = () => {
    const next = !previousWeekExpanded
    setPreviousWeekExpanded(next)
    if (next) setCurrentWeekExpanded(false)
  }

  return (
    <Flex direction="column" gap="3" className={styles.sidebar} style={{ height: '100%' }}>
      <Button
        size="3"
        variant="solid"
        onClick={handleWikiClick}
        style={{ width: '100%', backgroundColor: 'var(--accent-9)', color: '#ffffff' }}
      >
        <Text size="3" weight="medium">
          Вики
        </Text>
        <OpenInNewWindowIcon width={16} height={16} />
      </Button>

      <Box className={styles.panel}>
        <Flex
          align="center"
          justify="between"
          className={styles.panelHeader}
          onClick={() => setReportsExpanded((v) => !v)}
          style={{ cursor: 'pointer' }}
        >
          <Text size="3" weight="bold" style={{ color: '#ffffff' }}>
            Отчеты последних недель
          </Text>
          <ChevronDownIcon
            width={16}
            height={16}
            style={{
              color: '#ffffff',
              transform: reportsExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.2s ease-in-out',
            }}
          />
        </Flex>

        {reportsExpanded && (
          <Box className={styles.panelContent}>
            <Box>
              <Flex align="center" gap="2" className={styles.reportItem} onClick={handleCurrentWeekClick} style={{ cursor: 'pointer' }}>
                <CalendarIcon width={16} height={16} />
                <Text size="2" style={{ flex: 1 }}>
                  Текущая неделя
                </Text>
                <ChevronUpIcon
                  width={16}
                  height={16}
                  style={{
                    transform: currentWeekExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                />
              </Flex>

              {currentWeekExpanded && (
                <Box className={styles.reportTable}>
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell className={styles.tableHeader}>Этап</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className={styles.tableHeader}>Количество</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {stages.map((item) => (
                        <Table.Row key={`cw-${item.stage}`}>
                          <Table.Cell>{item.stage}</Table.Cell>
                          <Table.Cell>{item.count}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Box>

            <Box style={{ marginTop: '4px' }}>
              <Flex
                align="center"
                gap="2"
                className={styles.reportItem}
                onClick={handlePreviousWeekClick}
                style={{ cursor: 'pointer' }}
              >
                <CalendarIcon width={16} height={16} />
                <Text size="2" style={{ flex: 1 }}>
                  Предыдущая неделя
                </Text>
                <ChevronUpIcon
                  width={16}
                  height={16}
                  style={{
                    transform: previousWeekExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                    transition: 'transform 0.2s ease-in-out',
                  }}
                />
              </Flex>

              {previousWeekExpanded && (
                <Box className={styles.reportTable}>
                  <Table.Root>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeaderCell className={styles.tableHeader}>Этап</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell className={styles.tableHeader}>Количество</Table.ColumnHeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {stages.map((item) => (
                        <Table.Row key={`pw-${item.stage}`}>
                          <Table.Cell>{item.stage}</Table.Cell>
                          <Table.Cell>{item.count}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Flex>
  )
}

