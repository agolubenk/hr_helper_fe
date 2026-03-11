'use client'

import { Box, Flex, Text, Button, Select, Checkbox, Separator } from '@radix-ui/themes'
import {
  CalendarIcon,
  ReloadIcon,
  OpenInNewWindowIcon,
  BoxIcon,
  ClockIcon,
  ClipboardIcon,
  VideoIcon,
  Link2Icon,
  CheckIcon,
  PersonIcon,
} from '@radix-ui/react-icons'
import { useState } from 'react'
import styles from './WorkflowHeader.module.css'

interface WorkflowHeaderProps {
  onSlotsClick: () => void
  slotsOpen: boolean
}

type WorkflowType = 'screening' | 'interview'
type InterviewFormat = 'online' | 'office'
type Office = 'minsk' | 'warsaw' | 'gomel'

interface Interviewer {
  id: string
  name: string
}

const VACANCIES = [
  { id: 'frontend-react', label: 'Frontend Engineer (React)' },
  { id: 'backend-python', label: 'Backend Engineer (Python)' },
  { id: 'fullstack', label: 'Fullstack Developer' },
] as const

const INTERVIEWERS: Interviewer[] = [
  { id: '1', name: 'Иван Петров' },
  { id: '2', name: 'Мария Сидорова' },
  { id: '3', name: 'Алексей Иванов' },
]

const OFFICES: { id: Office; label: string }[] = [
  { id: 'minsk', label: 'Минск' },
  { id: 'warsaw', label: 'Варшава' },
  { id: 'gomel', label: 'Гомель' },
]

export function WorkflowHeader({ onSlotsClick, slotsOpen }: WorkflowHeaderProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>('screening')
  const [selectedVacancy, setSelectedVacancy] = useState<string>('frontend-react')
  const [interviewFormat, setInterviewFormat] = useState<InterviewFormat>('online')
  const [selectedOffice, setSelectedOffice] = useState<Office>('minsk')
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([])

  const openCalendar = () => window.open('/calendar', '_blank', 'noopener,noreferrer')
  const openVacancy = () => window.open('https://huntflow.ru/', '_blank', 'noopener,noreferrer')

  const handleInterviewerToggle = (id: string) => {
    setSelectedInterviewers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  return (
    <Box className={styles.header}>
      <Flex align="center" justify="between" width="100%" gap="4" className={styles.headerRow} wrap="wrap">
        <Flex gap="3" align="center" className={styles.leftSection} wrap="wrap">
          <Flex gap="2" align="center" className={styles.quickButtonsGroup}>
            <Box className={styles.quickButton} style={{ backgroundColor: '#ef4444', position: 'relative' }} title="Telegram BY">
              <Link2Icon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
              <Box className={styles.flagBadge} title="Беларусь">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇧🇾</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#f97316', position: 'relative' }} title="? BY">
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>?</Text>
              <Box className={styles.flagBadge} title="Беларусь">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇧🇾</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#eab308', position: 'relative' }} title="Telegram PL">
              <Link2Icon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
              <Box className={styles.flagBadge} title="Польша">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇵🇱</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#3b82f6', position: 'relative' }} title="? PL">
              <Text size="4" weight="bold" style={{ color: '#ffffff' }}>?</Text>
              <Box className={styles.flagBadge} title="Польша">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇵🇱</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#06b6d4' }} title="Календарь" onClick={openCalendar}>
              <CalendarIcon width={20} height={20} style={{ color: '#ffffff', fontWeight: 'bold' }} />
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#6b7280' }} title="Документ">
              <Text size="3" weight="bold" style={{ color: '#ffffff' }}>📄</Text>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#10b981' }} title="Добавить">
              <Text size="5" weight="bold" style={{ color: '#ffffff' }}>+</Text>
            </Box>
          </Flex>

          <Flex data-tour="workflow-toggle" gap="3" align="center" className={styles.workflowToggle}>
            <Box
              className={styles.workflowButton}
              data-selected={selectedWorkflow === 'screening'}
              onClick={() => setSelectedWorkflow('screening')}
              title="HR screening"
            >
              <Flex align="center" gap="2">
                <Box className={styles.workflowIcon}>
                  <ClipboardIcon width={18} height={18} style={{ color: '#ffffff' }} />
                </Box>
                <Box>
                  <Text size="2" weight="bold" style={{ display: 'block', color: '#ffffff' }}>Скрининг</Text>
                  <Text size="1" style={{ opacity: 0.9, color: '#ffffff' }}>30 мин</Text>
                </Box>
              </Flex>
              {selectedWorkflow === 'screening' && (
                <Box className={styles.selectedBadge}>
                  <CheckIcon width={12} height={12} style={{ color: '#ffffff' }} />
                </Box>
              )}
            </Box>
            <Box
              data-tour="workflow-interview"
              className={styles.workflowButton}
              data-selected={selectedWorkflow === 'interview'}
              onClick={() => setSelectedWorkflow('interview')}
              title="Interview"
            >
              <Flex align="center" gap="2">
                <Box className={styles.workflowIcon}>
                  <PersonIcon width={18} height={18} style={{ color: '#ffffff' }} />
                </Box>
                <Box>
                  <Text size="2" weight="bold" style={{ display: 'block', color: '#ffffff' }}>Интервью</Text>
                  <Text size="1" style={{ opacity: 0.9, color: '#ffffff' }}>90 мин</Text>
                </Box>
              </Flex>
              {selectedWorkflow === 'interview' && (
                <Box className={styles.selectedBadge}>
                  <CheckIcon width={12} height={12} style={{ color: '#ffffff' }} />
                </Box>
              )}
            </Box>
          </Flex>
        </Flex>

        <Box data-tour="workflow-vacancy-buttons" className={styles.rightSection}>
          <Select.Root value={selectedVacancy} onValueChange={setSelectedVacancy}>
            <Select.Trigger className={styles.vacancySelect} />
            <Select.Content className={styles.selectContent}>
              {VACANCIES.map((v) => (
                <Select.Item key={v.id} value={v.id} className={styles.selectItem}>
                  {v.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Flex gap="2" align="center" justify="end" className={styles.controlsRow}>
            <Button size="1" variant="soft" className={styles.controlButton} style={{ backgroundColor: 'var(--gray-3)' }} onClick={openCalendar}>
              <CalendarIcon width={12} height={12} />
              <Text size="1" className={styles.calendarText}>Календарь</Text>
              <OpenInNewWindowIcon width={10} height={10} />
            </Button>
            <Button size="1" variant="soft" className={styles.controlButton} style={{ backgroundColor: 'var(--gray-3)' }} onClick={openVacancy}>
              <Text size="1">Вакансия</Text>
            </Button>
            <Button
              size="1"
              variant="soft"
              className={styles.controlButton}
              onClick={onSlotsClick}
              style={{
                backgroundColor: slotsOpen ? 'var(--accent-9)' : 'var(--accent-3)',
                color: slotsOpen ? '#ffffff' : 'var(--accent-11)',
              }}
            >
              <ClockIcon width={12} height={12} />
              <Text size="1">слоты</Text>
            </Button>
            <Button
              size="1"
              variant="soft"
              className={styles.controlButton}
              style={{
                backgroundColor: 'var(--accent-9)',
                color: '#ffffff',
                borderRadius: '50%',
                width: 27,
                height: 27,
                padding: 0,
                minWidth: 27,
              }}
              onClick={() => window.location.reload()}
            >
              <ReloadIcon width={12} height={12} />
            </Button>
          </Flex>
        </Box>
      </Flex>

      {selectedWorkflow === 'interview' && (
        <Box className={styles.interviewOptionsPanel}>
          <Flex gap="4" align="center" wrap="wrap">
            <Flex gap="2" align="center">
              <Box
                className={styles.formatButton}
                data-selected={interviewFormat === 'online'}
                onClick={() => setInterviewFormat('online')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setInterviewFormat('online')}
              >
                <VideoIcon width={16} height={16} />
                <Text size="2" weight="medium">Онлайн</Text>
              </Box>
              <Box
                className={styles.formatButton}
                data-selected={interviewFormat === 'office'}
                onClick={() => setInterviewFormat('office')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setInterviewFormat('office')}
              >
                <BoxIcon width={16} height={16} />
                <Text size="2" weight="medium">Офис</Text>
              </Box>
            </Flex>
            {interviewFormat === 'office' && (
              <>
                <Separator orientation="vertical" style={{ height: 24 }} />
                <Flex gap="1" align="center" className={styles.officeToggle}>
                  {OFFICES.map((office) => (
                    <Box
                      key={office.id}
                      className={styles.officeButton}
                      data-selected={selectedOffice === office.id}
                      onClick={() => setSelectedOffice(office.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedOffice(office.id)}
                    >
                      <Text size="1" weight={selectedOffice === office.id ? 'medium' : 'regular'}>
                        {office.label}
                      </Text>
                    </Box>
                  ))}
                </Flex>
              </>
            )}
            <Separator orientation="vertical" style={{ height: 24 }} />
            <Flex gap="3" align="center" wrap="wrap">
              {INTERVIEWERS.map((inv) => (
                <Flex key={inv.id} align="center" gap="2">
                  <Checkbox
                    checked={selectedInterviewers.includes(inv.id)}
                    onCheckedChange={() => handleInterviewerToggle(inv.id)}
                  />
                  <Text size="2">{inv.name}</Text>
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
  )
}

