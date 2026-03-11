'use client'

import { Box, Flex, Text, Button, Select } from '@radix-ui/themes'
import {
  CalendarIcon,
  ReloadIcon,
  OpenInNewWindowIcon,
  ClockIcon,
  ClipboardIcon,
  VideoIcon,
  Link2Icon,
} from '@radix-ui/react-icons'
import { useState } from 'react'
import styles from './WorkflowHeader.module.css'

interface WorkflowHeaderProps {
  onSlotsClick: () => void
  slotsOpen: boolean
}

type WorkflowType = 'screening' | 'interview'

const VACANCIES = [
  { id: 'frontend-react', label: 'Frontend Engineer (React)' },
  { id: 'backend-node', label: 'Backend Engineer (Node.js)' },
  { id: 'qa', label: 'QA Engineer' },
] as const

export function WorkflowHeader({ onSlotsClick, slotsOpen }: WorkflowHeaderProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>('screening')
  const [selectedVacancy, setSelectedVacancy] = useState<(typeof VACANCIES)[number]['id']>('frontend-react')

  const openCalendar = () => window.open('/calendar', '_blank', 'noopener,noreferrer')
  const openVacancy = () =>
    window.open('https://huntflow.ru/', '_blank', 'noopener,noreferrer')

  return (
    <Box className={styles.header}>
      <Flex align="center" justify="between" width="100%" gap="4" className={styles.headerRow} wrap="wrap">
        <Flex gap="3" align="center" className={styles.leftSection} wrap="wrap">
          <Flex gap="2" align="center" className={styles.quickButtonsGroup}>
            <Box className={styles.quickButton} style={{ backgroundColor: '#ef4444', position: 'relative' }} title="Telegram BY">
              <Link2Icon width={20} height={20} style={{ color: '#ffffff' }} />
              <Box className={styles.flagBadge} title="Беларусь">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇧🇾</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#eab308', position: 'relative' }} title="Telegram PL">
              <Link2Icon width={20} height={20} style={{ color: '#ffffff' }} />
              <Box className={styles.flagBadge} title="Польша">
                <Text style={{ fontSize: '20px', lineHeight: 1 }}>🇵🇱</Text>
              </Box>
            </Box>
            <Box className={styles.quickButton} style={{ backgroundColor: '#06b6d4' }} title="Календарь" onClick={openCalendar}>
              <CalendarIcon width={20} height={20} style={{ color: '#ffffff' }} />
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
                <Text size="2" weight="bold" style={{ color: '#ffffff' }}>
                  Скрининг
                </Text>
              </Flex>
            </Box>
            <Box
              className={styles.workflowButton}
              data-selected={selectedWorkflow === 'interview'}
              onClick={() => setSelectedWorkflow('interview')}
              title="Interview"
            >
              <Flex align="center" gap="2">
                <Box className={styles.workflowIcon}>
                  <VideoIcon width={18} height={18} style={{ color: '#ffffff' }} />
                </Box>
                <Text size="2" weight="bold" style={{ color: '#ffffff' }}>
                  Интервью
                </Text>
              </Flex>
            </Box>
          </Flex>
        </Flex>

        <Flex className={styles.rightSection}>
          <Select.Root value={selectedVacancy} onValueChange={(v) => setSelectedVacancy(v as typeof selectedVacancy)}>
            <Select.Trigger className={styles.vacancySelect} placeholder="Выберите вакансию" />
            <Select.Content className={styles.selectContent}>
              {VACANCIES.map((v) => (
                <Select.Item key={v.id} value={v.id} className={styles.selectItem}>
                  {v.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Flex className={styles.controlsRow}>
            <Button size="2" variant="soft" className={styles.controlButton} onClick={openCalendar}>
              <CalendarIcon />
              <span className={styles.calendarText}>Календарь</span>
              <OpenInNewWindowIcon />
            </Button>
            <Button size="2" variant="soft" className={styles.controlButton} onClick={openVacancy}>
              <OpenInNewWindowIcon />
              Вакансия
            </Button>
            <Button
              size="2"
              variant={slotsOpen ? 'solid' : 'soft'}
              className={styles.controlButton}
              onClick={onSlotsClick}
            >
              <ClockIcon />
              Слоты
            </Button>
            <Button size="2" variant="soft" className={styles.controlButton} onClick={() => window.location.reload()}>
              <ReloadIcon />
              Обновить
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}

