import { useState, useMemo } from 'react'
import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  Avatar,
  TextField,
  Table,
  Card,
  Separator,
  Tabs,
  Dialog,
} from '@radix-ui/themes'
import { useParams, useNavigate } from '@tanstack/react-router'
import {
  PersonIcon,
  ChatBubbleIcon,
  GearIcon,
  Link2Icon,
  CalendarIcon,
  ClockIcon,
  ClipboardIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  VideoIcon,
  BoxIcon,
} from '@radix-ui/react-icons'
import {
  MOCK_CANDIDATES,
  getCandidateInitials,
  getVacancyIdByTitle,
  getUnreadConversationsCount,
  type RecrChatCandidate,
} from './mocks'
import { WorkflowChat } from '@/features/workflow/components/WorkflowChat'
import { SlotsPanel } from '@/features/workflow/components/SlotsPanel'
import styles from './RecrChatPage.module.css'

type LeftTab = 'candidates' | 'chat' | 'vacancy-settings'
type RightTab = 'info' | 'activity' | 'ratings' | 'documents' | 'history'

const MEETING_STAGES = [
  { id: 'interview', name: 'Интервью', description: 'Интервью' },
]

export function RecrChatCandidatePage() {
  const { candidateId } = useParams({ strict: false }) as {
    vacancyId?: string
    candidateId?: string
  }
  const navigate = useNavigate()
  const cid = candidateId ?? '1'

  const [leftTab, setLeftTab] = useState<LeftTab>('candidates')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('screening')
  const [slotsOpen, setSlotsOpen] = useState(false)
  const [rightTab, setRightTab] = useState<RightTab>('info')
  const [selectedSettingTab, setSelectedSettingTab] = useState<
    'text' | 'recruiters' | 'customers' | 'questions' | 'integrations' | 'statuses' | 'salary' | 'interviews' | 'scorecard' | 'dataProcessing' | 'history'
  >('text')

  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_CANDIDATES
    const q = searchQuery.toLowerCase()
    return MOCK_CANDIDATES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.position?.toLowerCase().includes(q) ?? false) ||
        (c.email?.toLowerCase().includes(q) ?? false)
    )
  }, [searchQuery])

  const selected = useMemo(
    () =>
      MOCK_CANDIDATES.find((c) => c.id === cid) ?? MOCK_CANDIDATES[0] ?? null,
    [cid]
  )

  const unreadChatCount = getUnreadConversationsCount()
  const vacancyTitle = selected?.vacancy ?? ''

  const handleSelectCandidate = (c: RecrChatCandidate) => {
    const vacancyId = getVacancyIdByTitle(c.vacancy)
    navigate({
      to: '/recr-chat/vacancy/$vacancyId/candidate/$candidateId',
      params: { vacancyId, candidateId: c.id },
    })
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.leftColumn}>
        <Flex gap="2" mb="4" className={styles.tabSwitcher}>
          <Button
            variant={leftTab === 'candidates' ? 'solid' : 'soft'}
            size="2"
            onClick={() => setLeftTab('candidates')}
            className={styles.tabButton}
          >
            <PersonIcon width={16} height={16} />
            <Text size="2">Candidates</Text>
            <Badge size="1" color="gray">
              {MOCK_CANDIDATES.length}
            </Badge>
          </Button>
          <Button
            variant={leftTab === 'chat' ? 'solid' : 'soft'}
            size="2"
            onClick={() => setLeftTab('chat')}
            className={styles.tabButton}
          >
            <ChatBubbleIcon width={16} height={16} />
            <Text size="2">Chat</Text>
            {unreadChatCount > 0 && (
              <Badge size="1" color="red">
                {unreadChatCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={leftTab === 'vacancy-settings' ? 'solid' : 'soft'}
            size="2"
            onClick={() => setLeftTab('vacancy-settings')}
            className={styles.tabButton}
          >
            <GearIcon width={16} height={16} />
            <Text size="2">Настройки вакансии</Text>
          </Button>
        </Flex>

        <Flex align="center" gap="2" mb="3">
          <TextField.Root
            placeholder={`Search ${leftTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon width={16} height={16} />
            </TextField.Slot>
          </TextField.Root>
        </Flex>

        {leftTab === 'candidates' && (
          <>
            <WorkflowStrip
              selectedWorkflow={selectedWorkflow}
              onSelectWorkflow={setSelectedWorkflow}
              onSlotsClick={() => setSlotsOpen(true)}
            />
            <Box className={styles.candidatesList}>
              {filteredCandidates.map((c) => (
                <Box
                  key={c.id}
                  className={`${styles.candidateItem} ${c.id === cid ? styles.selected : ''}`}
                  onClick={() => handleSelectCandidate(c)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelectCandidate(c)
                    }
                  }}
                  style={{ position: 'relative' }}
                >
                  {c.hasUnviewedChanges === true && (
                    <Box
                      className={styles.unviewedDot}
                      style={{ backgroundColor: c.statusColor }}
                      title="Есть непросмотренные изменения"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <Flex align="center" gap="3">
                    <Avatar
                      size="3"
                      fallback={getCandidateInitials(c)}
                      style={{ backgroundColor: c.statusColor }}
                    />
                    <Flex direction="column" style={{ flex: 1, minWidth: 0 }}>
                      <Flex align="center" gap="2" justify="between">
                        <Text
                          size="3"
                          weight="bold"
                          style={{
                            flex: 1,
                            minWidth: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {c.name}
                        </Text>
                        {(c.unread ?? 0) > 0 && (
                          <Badge size="1" color="red" style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            {c.unread}
                          </Badge>
                        )}
                      </Flex>
                      <Text size="2" color="gray">
                        {c.position ?? '—'}
                      </Text>
                      <Flex align="center" gap="2" mt="1">
                        <Badge size="1" style={{ backgroundColor: c.statusColor, color: 'white' }}>
                          {c.status}
                        </Badge>
                        <Text size="1" color="gray">
                          · {c.timeAgo ?? '—'}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </Box>
          </>
        )}

        {leftTab === 'chat' && (
          <Box className={styles.chatContainer}>
            <WorkflowChat />
          </Box>
        )}

        {leftTab === 'vacancy-settings' && (
          <Box className={styles.vacancySettings}>
            <Card>
              <Flex direction="column" gap="4">
                <Text size="4" weight="bold">
                  Настройки вакансии
                </Text>
                <Separator size="4" />
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Разделы настроек
                </Text>
                <Flex direction="column" gap="1">
                  {(
                    [
                      ['text', 'Текст вакансии'],
                      ['recruiters', 'Рекрутеры'],
                      ['customers', 'Заказчики и интервьюеры'],
                      ['questions', 'Вопросы и ссылки'],
                      ['integrations', 'Связи и интеграции'],
                      ['statuses', 'Статусы'],
                      ['salary', 'Зарплатные вилки'],
                      ['interviews', 'Встречи и интервью'],
                      ['scorecard', 'Scorecard'],
                      ['dataProcessing', 'Обработка данных'],
                      ['history', 'История правок'],
                    ] as const
                  ).map(([tab, label]) => (
                    <Button
                      key={tab}
                      variant={selectedSettingTab === tab ? 'solid' : 'soft'}
                      onClick={() => setSelectedSettingTab(tab)}
                      style={{ justifyContent: 'flex-start', width: '100%' }}
                    >
                      <Text size="2">{label}</Text>
                    </Button>
                  ))}
                </Flex>
              </Flex>
            </Card>
          </Box>
        )}
      </Box>

      <Box className={styles.rightColumn}>
        {selected?.hasDuplicateSuspicion && leftTab !== 'vacancy-settings' && (
          <Button
            variant="soft"
            color="orange"
            size="2"
            mb="3"
            style={{ width: '100%' }}
            onClick={() => {}}
          >
            <Text size="4" weight="bold" style={{ fontSize: 16 }}>
              ⚠️ Подозрение на дубликат
            </Text>
          </Button>
        )}
        {leftTab === 'vacancy-settings' ? (
          <Card className={styles.candidateCard}>
            <Text size="4" weight="bold" style={{ display: 'block', marginBottom: 8 }}>
              Настройки вакансии «{vacancyTitle || 'Вакансия'}»
            </Text>
            <Separator size="4" mb="4" />
            {selectedSettingTab === 'text' && (
              <Text size="2" color="gray">
                Текст вакансии: название, шапка, обязанности, пожелания, условия, завершение, ссылка, вложения. Редактирование по странам — в следующих итерациях.
              </Text>
            )}
            {selectedSettingTab === 'recruiters' && (
              <Text size="2" color="gray">Рекрутеры. Назначение ответственных за вакансию.</Text>
            )}
            {selectedSettingTab === 'customers' && (
              <Text size="2" color="gray">Заказчики и интервьюеры. Список заказчиков и интервьюеров по вакансии.</Text>
            )}
            {selectedSettingTab === 'questions' && (
              <Text size="2" color="gray">Вопросы и ссылки. Вопросы для кандидатов, ссылки на тесты.</Text>
            )}
            {selectedSettingTab === 'integrations' && (
              <Text size="2" color="gray">Связи и интеграции. Интеграции с ATS, почтой, календарём.</Text>
            )}
            {selectedSettingTab === 'statuses' && (
              <Text size="2" color="gray">Статусы. Настройка этапов и статусов вакансии.</Text>
            )}
            {selectedSettingTab === 'salary' && (
              <Text size="2" color="gray">Зарплатные вилки. Вилки по грейдам и валютам.</Text>
            )}
            {selectedSettingTab === 'interviews' && (
              <Text size="2" color="gray">Встречи и интервью. Форматы, офисы, интервьюеры.</Text>
            )}
            {selectedSettingTab === 'scorecard' && (
              <Text size="2" color="gray">Scorecard. Матрица компетенций и шкалы оценок.</Text>
            )}
            {selectedSettingTab === 'dataProcessing' && (
              <Text size="2" color="gray">Обработка данных. Согласия, хранение персональных данных.</Text>
            )}
            {selectedSettingTab === 'history' && (
              <Text size="2" color="gray">История правок. Журнал изменений настроек вакансии.</Text>
            )}
          </Card>
        ) : selected ? (
          <Card className={styles.candidateCard}>
            <Flex align="center" gap="3" mb="4">
              <Avatar
                size="5"
                fallback={getCandidateInitials(selected)}
                style={{
                  backgroundColor: selected.statusColor ?? 'var(--accent-9)',
                }}
              />
              <Box>
                <Text size="5" weight="bold" style={{ display: 'block' }}>
                  {selected.name}
                </Text>
                <Text size="2" color="gray">
                  {selected.position ?? '—'} · {selected.vacancy ?? vacancyTitle}
                </Text>
              </Box>
            </Flex>

            <Separator size="4" mb="4" />

            <Tabs.Root value={rightTab} onValueChange={(v) => setRightTab(v as RightTab)}>
              <Tabs.List className={styles.subTabs}>
                <Tabs.Trigger value="info">Info</Tabs.Trigger>
                <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
                <Tabs.Trigger value="ratings">Ratings</Tabs.Trigger>
                <Tabs.Trigger value="documents">Documents</Tabs.Trigger>
                <Tabs.Trigger value="history">History</Tabs.Trigger>
              </Tabs.List>

              <Box mt="4" style={{ overflowY: 'auto', overflowX: 'hidden', flex: 1, minHeight: 0 }}>
                <Tabs.Content value="info">
                  <Flex direction="column" gap="4" style={{ width: '100%' }}>
                    <Box className={styles.applicationDetailsTable}>
                      <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                        Application Details
                      </Text>
              <Table.Root style={{ width: '100%', tableLayout: 'fixed' }}>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                        Applied:
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{selected.applied ?? '—'}</Text>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                        Source:
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{selected.source ?? '—'}</Text>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                        Position:
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{selected.position ?? '—'}</Text>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                        Метки (теги):
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex gap="1" wrap="wrap">
                        {(selected.tags?.length ?? 0) > 0 ? (
                          (selected.tags ?? []).map((tag, i) => (
                            <Badge key={i} size="1" color="blue">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <Text size="2" color="gray">
                            Не указано
                          </Text>
                        )}
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                        Level:
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{selected.level ?? '—'}</Text>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                        Age:
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{selected.age ?? '—'}</Text>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                        Gender:
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{selected.gender ?? '—'}</Text>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                        Salary expectations:
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{selected.salaryExpectations ?? '—'}</Text>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                        Offer:
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{selected.offer ?? '—'}</Text>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                        Location:
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{selected.location ?? '—'}</Text>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                        Email:
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{selected.email ?? '—'}</Text>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                        Phone:
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text size="2">{selected.phone ?? '—'}</Text>
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Root>
            </Box>

                    <Box>
                      <Text size="3" weight="bold" mb="2" style={{ display: 'block' }}>
                        Контакты
                      </Text>
                      <Flex direction="column" gap="2">
                        {selected.email && (
                          <Flex align="center" gap="2">
                            <Text size="2" weight="medium">Email:</Text>
                            <Text size="2">{selected.email}</Text>
                          </Flex>
                        )}
                        {selected.phone && (
                          <Flex align="center" gap="2">
                            <Text size="2" weight="medium">Телефон:</Text>
                            <Text size="2">{selected.phone}</Text>
                          </Flex>
                        )}
                        {!selected.email && !selected.phone && (
                          <Text size="2" color="gray">Не указано</Text>
                        )}
                      </Flex>
                    </Box>

                    {selected.social && Object.keys(selected.social).length > 0 && (
                      <Box>
                        <Text size="3" weight="bold" mb="2" style={{ display: 'block' }}>
                          Соцсети и мессенджеры
                        </Text>
                        <Flex direction="column" gap="1" wrap="wrap">
                          {Object.entries(selected.social).map(([platform, value]) => (
                            <Flex key={platform} align="center" gap="2">
                              <Text size="2" weight="medium">{platform}:</Text>
                              <Text size="2">{value}</Text>
                            </Flex>
                          ))}
                        </Flex>
                      </Box>
                    )}
                  </Flex>
                </Tabs.Content>

                <Tabs.Content value="activity">
                  <Text size="2" color="gray">Активность кандидата. События и действия — в следующих итерациях.</Text>
                </Tabs.Content>
                <Tabs.Content value="ratings">
                  <Text size="2" color="gray">Оценки по матрице компетенций (Ratings) — в следующих итерациях.</Text>
                </Tabs.Content>
                <Tabs.Content value="documents">
                  <Text size="2" color="gray">Документы кандидата — в следующих итерациях.</Text>
                </Tabs.Content>
                <Tabs.Content value="history">
                  <Text size="2" color="gray">История взаимодействий, изменений статуса и сообщений — в следующих итерациях.</Text>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </Card>
        ) : (
          <Card className={styles.candidateCard}>
            <Text size="2" color="gray">
              Выберите кандидата из списка.
            </Text>
          </Card>
        )}
      </Box>

      <Dialog.Root open={slotsOpen} onOpenChange={setSlotsOpen}>
        <Dialog.Content style={{ maxWidth: 800, maxHeight: '80vh', overflowY: 'auto' }}>
          <Dialog.Title>Свободные слоты</Dialog.Title>
          <Dialog.Description>
            Панель свободных слотов для интервью. Копируйте доступное время.
          </Dialog.Description>
          <Box pt="3">
            <SlotsPanel />
          </Box>
          <Flex gap="3" justify="end" mt="4">
            <Button variant="soft" onClick={() => setSlotsOpen(false)}>
              Закрыть
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}

const OFFICES = [
  { id: 'minsk' as const, label: 'Минск' },
  { id: 'warsaw' as const, label: 'Варшава' },
  { id: 'gomel' as const, label: 'Гомель' },
]
const PARTICIPANTS = [
  { id: 'author', name: 'Я (текущий пользователь)' },
  { id: '1', name: 'Иван Петров' },
  { id: '2', name: 'Мария Сидорова' },
  { id: '3', name: 'Алексей Иванов' },
]

function WorkflowStrip({
  selectedWorkflow,
  onSelectWorkflow,
  onSlotsClick,
}: {
  selectedWorkflow: string
  onSelectWorkflow: (id: string) => void
  onSlotsClick: () => void
}) {
  const [interviewFormat, setInterviewFormat] = useState<'online' | 'office'>('online')
  const [selectedOffice, setSelectedOffice] = useState<'minsk' | 'warsaw' | 'gomel'>('minsk')
  const [selectedInterviewers, setSelectedInterviewers] = useState<string[]>([])
  const isMeetingStage = selectedWorkflow !== 'screening'

  const handleInterviewerToggle = (id: string) => {
    setSelectedInterviewers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <Box className={styles.workflowButtonsContainer} mb="3">
      <Flex gap="2" align="center" wrap="wrap" style={{ marginBottom: 8 }}>
        <Box
          className={styles.quickButton}
          style={{ backgroundColor: '#ef4444', position: 'relative' }}
          title="Telegram"
        >
          <Link2Icon width={20} height={20} style={{ color: '#fff' }} />
        </Box>
        <Box
          className={styles.quickButton}
          style={{ backgroundColor: '#25D366', position: 'relative' }}
          title="WhatsApp"
        >
          <Text size="3" weight="bold" style={{ color: '#fff' }}>
            ?
          </Text>
        </Box>
        <Box
          className={styles.quickButton}
          style={{ backgroundColor: '#06b6d4' }}
          title="Calendar"
        >
          <CalendarIcon width={20} height={20} style={{ color: '#fff' }} />
        </Box>
        <Box
          className={styles.quickButton}
          style={{ backgroundColor: '#6b7280' }}
          title="Document"
        >
          <Text size="3" weight="bold" style={{ color: '#fff' }}>
            📄
          </Text>
        </Box>
      </Flex>
      <Flex gap="3" align="center" className={styles.workflowToggle}>
        <Box
          className={styles.workflowButton}
          data-selected={selectedWorkflow === 'screening'}
          onClick={() => onSelectWorkflow('screening')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelectWorkflow('screening')
            }
          }}
        >
          <Flex align="center" gap="2">
            <Box className={styles.workflowIcon}>
              <ClipboardIcon width={18} height={18} />
            </Box>
            <Box>
              <Text size="2" weight="bold" style={{ display: 'block', color: '#fff' }}>
                Скрининг
              </Text>
              <Text size="1" style={{ opacity: 0.9, color: '#fff' }}>
                30 мин
              </Text>
            </Box>
          </Flex>
          {selectedWorkflow === 'screening' && (
            <Box className={styles.selectedBadge}>
              <CheckIcon width={12} height={12} style={{ color: '#fff' }} />
            </Box>
          )}
        </Box>
        {MEETING_STAGES.map((stage) => (
          <Box
            key={stage.id}
            className={styles.workflowButton}
            data-selected={selectedWorkflow === stage.id}
            onClick={() => onSelectWorkflow(stage.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectWorkflow(stage.id)
              }
            }}
          >
            <Flex align="center" gap="2">
              <Box className={styles.workflowIcon}>
                <PersonIcon width={18} height={18} />
              </Box>
              <Box>
                <Text size="2" weight="bold" style={{ display: 'block', color: '#fff' }}>
                  {stage.description || stage.name}
                </Text>
                <Text size="1" style={{ opacity: 0.9, color: '#fff' }}>
                  90 мин
                </Text>
              </Box>
            </Flex>
            {selectedWorkflow === stage.id && (
              <Box className={styles.selectedBadge}>
                <CheckIcon width={12} height={12} style={{ color: '#fff' }} />
              </Box>
            )}
          </Box>
        ))}
      </Flex>
      <Button
        variant="soft"
        size="2"
        className={styles.slotsButton}
        style={{
          backgroundColor: 'var(--accent-3)',
          color: 'var(--accent-11)',
          marginTop: 8,
        }}
        onClick={onSlotsClick}
      >
        <ClockIcon width={16} height={16} />
        <Text size="2" className={styles.slotsButtonText}>
          слоты
        </Text>
      </Button>

      {isMeetingStage && (
        <Box className={styles.interviewOptionsPanel} mt="2">
          <Flex gap="4" align="center" wrap="wrap">
            <Flex gap="2" align="center">
              <Box
                className={styles.formatButton}
                data-selected={interviewFormat === 'online'}
                onClick={() => setInterviewFormat('online')}
                role="button"
                tabIndex={0}
              >
                <VideoIcon width={14} height={14} />
                <Text size="2" weight="medium">Онлайн</Text>
              </Box>
              <Box
                className={styles.formatButton}
                data-selected={interviewFormat === 'office'}
                onClick={() => setInterviewFormat('office')}
                role="button"
                tabIndex={0}
              >
                <BoxIcon width={14} height={14} />
                <Text size="2" weight="medium">Офис</Text>
              </Box>
            </Flex>
            {interviewFormat === 'office' && (
              <>
                <Separator orientation="vertical" style={{ height: 20, flexShrink: 0 }} />
                <Flex gap="1" align="center" className={styles.officeToggle}>
                  {OFFICES.map((office) => (
                    <Box
                      key={office.id}
                      className={styles.officeButton}
                      data-selected={selectedOffice === office.id}
                      onClick={() => setSelectedOffice(office.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <Text size="1" weight={selectedOffice === office.id ? 'medium' : 'regular'}>
                        {office.label}
                      </Text>
                    </Box>
                  ))}
                </Flex>
              </>
            )}
            <Separator orientation="vertical" style={{ height: 20, flexShrink: 0 }} />
            <Flex gap="2" align="center" wrap="wrap">
              {PARTICIPANTS.map((p) => {
                const isSelected = selectedInterviewers.includes(p.id)
                return (
                  <Box
                    key={p.id}
                    onClick={() => handleInterviewerToggle(p.id)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 6,
                      border: isSelected ? '2px solid var(--accent-9)' : '2px solid transparent',
                      backgroundColor: isSelected ? 'var(--accent-3)' : 'transparent',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <Text size="2">{p.name}</Text>
                    {isSelected && (
                      <Box
                        style={{
                          position: 'absolute',
                          top: -6,
                          right: -6,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid white',
                        }}
                      >
                        <CheckIcon width={10} height={10} style={{ color: '#fff' }} />
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Flex>
          </Flex>
        </Box>
      )}
    </Box>
  )
}
