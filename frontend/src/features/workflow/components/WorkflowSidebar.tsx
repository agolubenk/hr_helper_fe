'use client'

import { Box, Text, Flex, Button, Table } from '@radix-ui/themes'
import { ChevronDownIcon, CalendarIcon, ChevronUpIcon, OpenInNewWindowIcon, PaperPlaneIcon, EnvelopeClosedIcon } from '@radix-ui/react-icons'
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

      <Box className={`${styles.panel} ${styles.quickActionsPanel}`}>
        <Flex align="center" justify="between" className={styles.panelHeader}>
          <Text size="3" weight="bold" style={{ color: '#ffffff' }}>
            Быстрые действия
          </Text>
        </Flex>
        <Box className={styles.panelContent}>
          <Flex direction="column" gap="3" align="center">
            <Box className={styles.quickActionButton} onClick={() => window.open('https://web.telegram.org', '_blank')} style={{ backgroundColor: '#0088cc' }} title="Telegram @username" role="button" tabIndex={0}>
              <PaperPlaneIcon width={20} height={20} style={{ color: '#ffffff' }} />
            </Box>
            <Box className={styles.quickActionButton} onClick={() => window.open('https://web.telegram.org', '_blank')} style={{ backgroundColor: '#0088cc' }} title="Telegram @hr_manager" role="button" tabIndex={0}>
              <PaperPlaneIcon width={20} height={20} style={{ color: '#ffffff' }} />
            </Box>
            <Box className={styles.quickActionButton} onClick={() => window.open('https://web.telegram.org', '_blank')} style={{ backgroundColor: '#0088cc' }} title="Telegram @recruiter" role="button" tabIndex={0}>
              <PaperPlaneIcon width={20} height={20} style={{ color: '#ffffff' }} />
            </Box>
            <Box className={styles.quickActionButton} onClick={() => window.open('https://web.whatsapp.com', '_blank')} style={{ backgroundColor: '#25D366' }} title="WhatsApp +7 (999) 123-45-67" role="button" tabIndex={0}>
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>W</Text>
            </Box>
            <Box className={styles.quickActionButton} onClick={() => window.open('https://web.whatsapp.com', '_blank')} style={{ backgroundColor: '#25D366' }} title="WhatsApp +7 (999) 987-65-43" role="button" tabIndex={0}>
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>W</Text>
            </Box>
            <Box className={styles.quickActionButton} onClick={() => window.open('https://web.viber.com', '_blank')} style={{ backgroundColor: '#665CAC' }} title="Viber +7 (999) 123-45-67" role="button" tabIndex={0}>
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>V</Text>
            </Box>
            <Box className={styles.quickActionButton} onClick={() => window.open('https://www.linkedin.com', '_blank')} style={{ backgroundColor: '#0077B5' }} title="LinkedIn" role="button" tabIndex={0}>
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>in</Text>
            </Box>
            <Box className={styles.quickActionButton} onClick={() => window.open('mailto:', '_blank')} style={{ backgroundColor: '#EA4335' }} title="Email" role="button" tabIndex={0}>
              <EnvelopeClosedIcon width={20} height={20} style={{ color: '#ffffff' }} />
            </Box>
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}

