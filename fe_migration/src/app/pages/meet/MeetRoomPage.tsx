import { useEffect, useMemo, useState, useCallback, useRef, type ElementType } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Flex, Text, Heading, Badge, IconButton, Button, Box, DropdownMenu } from '@radix-ui/themes'
import {
  SpeakerLoudIcon,
  SpeakerOffIcon,
  CameraIcon,
  Share1Icon,
  ChatBubbleIcon,
  PersonIcon,
  InfoCircledIcon,
  ExitIcon,
  ChevronDownIcon,
  MixerHorizontalIcon,
  CheckIcon,
  CopyIcon,
  GearIcon,
  DotFilledIcon,
} from '@radix-ui/react-icons'
import { useRouter } from '@/router-adapter'
import { mockActiveMeetRoom } from '@/features/meet/mocks'
import type { MeetAudience, MeetChatMessage, MeetMeetingComment, MeetParticipant } from '@/features/meet/types'
import { parseMeetRoomHash, serializeMeetRoomHash } from '@/features/meet/meetRoomHash'
import type { MeetRoomHashPayload } from '@/features/meet/meetRoomHash'
import { getMeetInitials } from '@/features/meet/meetTextUtils'
import type { StageLayoutMode } from '@/features/meet/stageLayout'
import { STAGE_LAYOUT_OPTIONS } from '@/features/meet/stageLayout'
import { FOOTER_TRAY_ADD_EVENT } from '@/components/navigation/Footer/Footer'
import { MeetRoomSidePanel } from './MeetRoomSidePanel'
import styles from './MeetRoomPage.module.css'

function pickMainParticipant(list: MeetParticipant[]): MeetParticipant | undefined {
  if (list.length === 0) return undefined
  return (
    list.find((p) => p.isScreenSharing) ??
    list.find((p) => p.isActiveSpeaker) ??
    list.find((p) => p.isHost) ??
    list[0]
  )
}

function formatMeetingAt(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const STAGE_BODY_LAYOUT_CLASS: Record<StageLayoutMode, string | undefined> = {
  spotlight: undefined,
  evenGrid: styles.layoutEvenGrid,
  splitHalf: styles.layoutSplitHalf,
  proportional: styles.layoutProportional,
  focusWide: styles.layoutFocusWide,
  stripBottom: styles.layoutStripBottom,
  compactStrip: styles.layoutCompactStrip,
}

const PANEL_ICON_CYCLE_MS = 2800

const PANEL_ICON_CYCLE: readonly { label: string; Icon: ElementType; size: number }[] = [
  { label: 'Участники', Icon: PersonIcon, size: 18 },
  { label: 'Чат', Icon: ChatBubbleIcon, size: 18 },
  { label: 'Информация', Icon: InfoCircledIcon, size: 17 },
  { label: 'Управление', Icon: GearIcon, size: 18 },
]

export function MeetRoomPage() {
  const router = useRouter()
  const navigate = useNavigate()
  const location = useLocation()
  const base = mockActiveMeetRoom

  const [micMuted, setMicMuted] = useState(false)
  const [camOn, setCamOn] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [recordingOn, setRecordingOn] = useState(false)

  const [chatInternal, setChatInternal] = useState(base.chatInternal)
  const [chatExternal, setChatExternal] = useState(base.chatExternal)
  const [commentsInternal, setCommentsInternal] = useState(base.commentsInternal)
  const [commentsExternal, setCommentsExternal] = useState(base.commentsExternal)
  const [stageLayout, setStageLayout] = useState<StageLayoutMode>('spotlight')
  const [sideTab, setSideTab] = useState<'people' | 'chat' | 'manage' | 'info'>('people')
  const [sidePanelOpen, setSidePanelOpen] = useState(true)
  const [panelIconIndex, setPanelIconIndex] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = window.setInterval(() => {
      setPanelIconIndex((i) => (i + 1) % PANEL_ICON_CYCLE.length)
    }, PANEL_ICON_CYCLE_MS)
    return () => window.clearInterval(id)
  }, [])

  const defaultHashPayload = useMemo(
    () => ({
      taskId: base.linkedTaskId,
      meetingAt: base.meetingAtISO,
      organizerId: base.organizerId,
    }),
    [base.linkedTaskId, base.meetingAtISO, base.organizerId],
  )

  useEffect(() => {
    if (parseMeetRoomHash(location.hash)) return
    const fragment = serializeMeetRoomHash(defaultHashPayload)
    navigate(
      { pathname: location.pathname, search: location.search, hash: fragment },
      { replace: true },
    )
  }, [defaultHashPayload, location.pathname, location.search, location.hash, navigate])

  const hashPayload = useMemo(() => {
    return parseMeetRoomHash(location.hash) ?? defaultHashPayload
  }, [location.hash, defaultHashPayload])

  const participantsView = useMemo((): MeetParticipant[] => {
    return base.participants.map((p) => ({
      ...p,
      isActiveSpeaker: p.id === base.activeSpeakerId,
    }))
  }, [base.participants, base.activeSpeakerId])

  const { mainTile, stripTiles } = useMemo(() => {
    const main = pickMainParticipant(participantsView)
    const others = main ? participantsView.filter((p) => p.id !== main.id) : participantsView
    return { mainTile: main, stripTiles: others }
  }, [participantsView])

  const organizerName = useMemo(() => {
    return (
      participantsView.find((p) => p.id === hashPayload.organizerId)?.name ??
      base.participants.find((p) => p.id === base.organizerId)?.name ??
      '—'
    )
  }, [participantsView, hashPayload.organizerId, base.participants, base.organizerId])

  const onSendChat = useCallback((audience: MeetAudience, text: string) => {
    const row: MeetChatMessage = {
      id: `local-chat-${Date.now()}`,
      author: 'Вы',
      audience,
      text,
      timeLabel: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    }
    if (audience === 'internal') setChatInternal((prev) => [...prev, row])
    else setChatExternal((prev) => [...prev, row])
  }, [])

  const onSendComment = useCallback((audience: MeetAudience, text: string) => {
    const row: MeetMeetingComment = {
      id: `local-cmt-${Date.now()}`,
      author: 'Вы',
      audience,
      text,
      timeLabel: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    }
    if (audience === 'internal') setCommentsInternal((prev) => [...prev, row])
    else setCommentsExternal((prev) => [...prev, row])
  }, [])

  const handleLeave = () => {
    router.push('/meet')
  }

  const handleCollapseToTasks = () => {
    if (typeof window !== 'undefined') {
      const fragment = serializeMeetRoomHash(hashPayload)
      const meetHref = `/meet/room#${fragment}`
      window.dispatchEvent(
        new CustomEvent(FOOTER_TRAY_ADD_EVENT, {
          detail: {
            id: 'footer-tray-active-meet-session',
            type: 'meeting',
            text: base.title,
            meetHref,
            live: true,
          },
        }),
      )
    }
    router.push('/tasks')
  }

  const upcomingMeetings = useMemo(() => {
    const baseAt = new Date(hashPayload.meetingAt)
    const safeBase = Number.isNaN(baseAt.getTime()) ? new Date() : baseAt
    const mkAt = (minutesDelta: number) => new Date(safeBase.getTime() + minutesDelta * 60_000).toISOString()
    return [
      {
        id: 'up-1',
        title: 'Интервью: Frontend — тех. этап',
        payload: { taskId: hashPayload.taskId, meetingAt: mkAt(60), organizerId: hashPayload.organizerId },
      },
      {
        id: 'up-2',
        title: 'Синк: команда платформы',
        payload: { taskId: 'task_sync_001', meetingAt: mkAt(180), organizerId: hashPayload.organizerId },
      },
      {
        id: 'up-3',
        title: '1:1 (мок)',
        payload: { taskId: 'task_1on1_001', meetingAt: mkAt(24 * 60), organizerId: hashPayload.organizerId },
      },
    ]
  }, [hashPayload.meetingAt, hashPayload.organizerId, hashPayload.taskId])

  const openUpcomingInNewTab = useCallback((payload: MeetRoomHashPayload) => {
    if (typeof window === 'undefined') return
    const fragment = serializeMeetRoomHash(payload)
    const url = `${window.location.origin}/meet/room#${fragment}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  const toggleMeetingSidePanel = useCallback(() => {
    setSidePanelOpen((v) => !v)
  }, [])

  const meetShareUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const fragment = serializeMeetRoomHash(hashPayload)
    return `${window.location.origin}${location.pathname}#${fragment}`
  }, [hashPayload, location.pathname])

  const [linkCopied, setLinkCopied] = useState(false)
  const linkCopiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (linkCopiedTimerRef.current) clearTimeout(linkCopiedTimerRef.current)
    }
  }, [])

  const handleCopyMeetLink = useCallback(() => {
    if (!meetShareUrl || typeof navigator === 'undefined' || !navigator.clipboard) return
    void navigator.clipboard.writeText(meetShareUrl).then(() => {
      setLinkCopied(true)
      if (linkCopiedTimerRef.current) clearTimeout(linkCopiedTimerRef.current)
      linkCopiedTimerRef.current = setTimeout(() => setLinkCopied(false), 2000)
    })
  }, [meetShareUrl])

  const renderRoleBadges = (p: MeetParticipant) => (
    <Box className={styles.roleBadges}>
      {p.isHost ? (
        <Badge size="1" color="grass" variant="solid">
          Ведущий
        </Badge>
      ) : null}
      {p.isActiveSpeaker ? (
        <Badge size="1" color="blue" variant="solid">
          Говорит
        </Badge>
      ) : null}
    </Box>
  )

  const tileFrameClass = (p: MeetParticipant, layout: 'spotlight' | 'strip' | 'gallery') => {
    const variantCls =
      layout === 'spotlight' ? styles.tileSpotlight : layout === 'strip' ? styles.tileStrip : styles.tileGallery
    const baseCls = `${styles.tile} ${variantCls}`
    if (p.isActiveSpeaker) return `${baseCls} ${styles.tileSpeaking}`
    if (p.isHost) return `${baseCls} ${styles.tileHostFocus}`
    return baseCls
  }

  const renderTile = (p: MeetParticipant, layout: 'spotlight' | 'strip' | 'gallery') => (
    <Box key={p.id} className={tileFrameClass(p, layout)}>
      {p.isScreenSharing ? (
        <Badge className={styles.shareBadge} color="purple" size="1">
          Экран
        </Badge>
      ) : null}
      {renderRoleBadges(p)}
      <Text
        size={layout === 'spotlight' ? '6' : layout === 'gallery' ? '5' : '4'}
        weight="bold"
        style={{ color: 'var(--gray-11)', opacity: 0.88 }}
      >
        {getMeetInitials(p.name)}
      </Text>
      <Box className={styles.tileOverlay}>
        <Text className={styles.tileName}>{p.name}</Text>
      </Box>
    </Box>
  )

  const panelIconSlot = PANEL_ICON_CYCLE[panelIconIndex]
  const PanelCycleIcon = panelIconSlot.Icon

  return (
    <Flex direction="column" gap="3" justify="center" className={styles.outer} style={{ width: '100%' }}>
      <Box className={styles.headerRow}>
        <Box className={styles.titleBlock}>
          <Flex align="center" gap="2" wrap="wrap" mb="1">
            <Heading size="6" style={{ margin: 0 }}>
              {base.title}
            </Heading>
            <Badge size="1" color="gray" variant="soft">
              {base.id}
            </Badge>
            <Flex align="center" gap="2" wrap="wrap">
              <IconButton
                size="1"
                variant="soft"
                color={linkCopied ? 'green' : 'gray'}
                aria-label={linkCopied ? 'Ссылка скопирована' : 'Копировать ссылку на встречу'}
                title={linkCopied ? 'Ссылка скопирована' : 'Копировать ссылку на встречу'}
                onClick={handleCopyMeetLink}
              >
                {linkCopied ? <CheckIcon width={14} height={14} /> : <CopyIcon width={14} height={14} />}
              </IconButton>
              {linkCopied ? (
                <Text size="1" weight="medium" style={{ color: 'var(--green-11)' }}>
                  Скопировано
                </Text>
              ) : null}
            </Flex>
          </Flex>
          <Flex className={styles.metaRow} wrap="wrap" aria-label="Параметры встречи из ссылки">
            <span className={styles.metaChip}>Задача: {hashPayload.taskId}</span>
            <span className={styles.metaChip}>Встреча: {formatMeetingAt(hashPayload.meetingAt)}</span>
            <span className={styles.metaChip}>Организатор: {organizerName}</span>
          </Flex>
        </Box>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft" color="gray">
              Предстоящие <ChevronDownIcon />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" variant="soft" className={styles.upcomingMenuContent}>
            <DropdownMenu.Label className={styles.upcomingMenuLabel}>Предстоящие миты (мок)</DropdownMenu.Label>
            <DropdownMenu.Separator />
            {upcomingMeetings.map((m) => (
              <DropdownMenu.Item
                key={m.id}
                className={styles.upcomingMenuItem}
                onSelect={() => openUpcomingInNewTab(m.payload)}
              >
                <div className={styles.upcomingMenuItemText}>
                  <Text size="2" weight="medium">
                    {m.title}
                  </Text>
                  <Text size="1" color="gray">
                    {formatMeetingAt(m.payload.meetingAt)}
                  </Text>
                </div>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Box>

      <Flex className={styles.mainRow}>
        <Flex
          direction="column"
          className={[
            styles.stage,
            sidePanelOpen ? styles.stageWithPanel : styles.stageCentered,
          ].join(' ')}
          style={{ flex: 1, minWidth: 0 }}
        >
          <Box className={styles.stageHeader}>
            <Text size="2" weight="medium">
              Эфир
            </Text>
            <Flex align="center" gap="2" wrap="wrap" justify="end">
              <Badge color={sharing ? 'grass' : 'gray'} variant="soft">
                {sharing ? 'Демонстрация экрана (мок)' : 'Демонстрация выключена'}
              </Badge>
              {recordingOn ? (
                <Badge color="red" variant="soft">
                  Идёт запись встречи
                </Badge>
              ) : null}
            </Flex>
          </Box>
          <Box
            className={[styles.stageBody, STAGE_BODY_LAYOUT_CLASS[stageLayout]].filter(Boolean).join(' ')}
          >
            {stageLayout === 'evenGrid' ? (
              <Box className={styles.galleryGrid}>
                {participantsView.map((p) => renderTile(p, 'gallery'))}
              </Box>
            ) : (
              <>
                <Box className={styles.spotlight}>
                  {mainTile ? renderTile(mainTile, 'spotlight') : null}
                </Box>
                <Box className={styles.filmstrip} role="list" aria-label="Остальные участники">
                  {stripTiles.map((p) => renderTile(p, 'strip'))}
                </Box>
              </>
            )}
            <Box className={styles.stageControlOverlay}>
              <Box className={styles.stageControlOverlayInner}>
                <Flex className={styles.floatingControlBar} align="center" justify="center">
                  <IconButton
                    size="3"
                    variant={micMuted ? 'soft' : 'solid'}
                    color={micMuted ? 'red' : undefined}
                    radius="full"
                    className={styles.floatingBarButton}
                    title={micMuted ? 'Включить микрофон' : 'Выключить микрофон'}
                    aria-label={micMuted ? 'Включить микрофон' : 'Выключить микрофон'}
                    onClick={() => setMicMuted((v) => !v)}
                  >
                    {micMuted ? <SpeakerOffIcon width={18} height={18} /> : <SpeakerLoudIcon width={18} height={18} />}
                  </IconButton>
                  <IconButton
                    size="3"
                    variant={camOn ? 'solid' : 'soft'}
                    color={!camOn ? 'red' : undefined}
                    radius="full"
                    className={styles.floatingBarButton}
                    title={camOn ? 'Выключить камеру' : 'Включить камеру'}
                    aria-label={camOn ? 'Выключить камеру' : 'Включить камеру'}
                    onClick={() => setCamOn((v) => !v)}
                  >
                    <CameraIcon width={18} height={18} />
                  </IconButton>
                  <IconButton
                    size="3"
                    variant={sharing ? 'solid' : 'soft'}
                    color={sharing ? 'grass' : undefined}
                    radius="full"
                    className={styles.floatingBarButton}
                    title="Демонстрация экрана (мок)"
                    aria-label="Демонстрация экрана"
                    onClick={() => setSharing((v) => !v)}
                  >
                    <Share1Icon width={18} height={18} />
                  </IconButton>

                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <IconButton
                        size="3"
                        variant="soft"
                        radius="full"
                        className={styles.floatingBarButton}
                        title="Раскладка эфира"
                        aria-label="Раскладка эфира"
                      >
                        <MixerHorizontalIcon width={18} height={18} />
                      </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content
                      align="center"
                      side="top"
                      sideOffset={10}
                      variant="soft"
                      className={styles.layoutMenuContent}
                    >
                      <DropdownMenu.Label className={styles.layoutMenuDropdownLabel}>Раскладка эфира</DropdownMenu.Label>
                      <DropdownMenu.Separator />
                      {STAGE_LAYOUT_OPTIONS.map((opt) => (
                        <DropdownMenu.Item
                          key={opt.id}
                          className={styles.layoutMenuItem}
                          onSelect={() => setStageLayout(opt.id)}
                        >
                          <Flex align="start" gap="3" width="100%" className={styles.layoutMenuItemRow}>
                            <Box className={styles.layoutMenuCheck} aria-hidden>
                              {stageLayout === opt.id ? <CheckIcon width={14} height={14} /> : null}
                            </Box>
                            <div className={styles.layoutMenuItemCol}>
                              <Text size="2" weight={stageLayout === opt.id ? 'bold' : 'medium'}>
                                {opt.label}
                              </Text>
                              <Text size="1" color="gray" className={styles.layoutMenuHint}>
                                {opt.hint}
                              </Text>
                            </div>
                          </Flex>
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>

                  <Box className={styles.floatingBarSep} aria-hidden />

                  <button
                    type="button"
                    className={styles.panelClusterButton}
                    title={
                      sidePanelOpen
                        ? `Скрыть панель встречи (сейчас: ${panelIconSlot.label}, меняется каждые ${PANEL_ICON_CYCLE_MS / 1000} с)`
                        : `Открыть панель встречи (сейчас: ${panelIconSlot.label}, меняется каждые ${PANEL_ICON_CYCLE_MS / 1000} с)`
                    }
                    aria-label={
                      sidePanelOpen
                        ? `Скрыть панель встречи, значок: ${panelIconSlot.label}`
                        : `Открыть панель встречи, значок: ${panelIconSlot.label}`
                    }
                    aria-expanded={sidePanelOpen}
                    onClick={toggleMeetingSidePanel}
                  >
                    <span
                      key={panelIconIndex}
                      className={styles.panelClusterIconSlot}
                      aria-hidden
                    >
                      <PanelCycleIcon width={panelIconSlot.size} height={panelIconSlot.size} />
                    </span>
                  </button>

                  <IconButton
                    size="3"
                    variant={recordingOn ? 'solid' : 'soft'}
                    color={recordingOn ? 'red' : undefined}
                    radius="full"
                    className={styles.floatingBarButton}
                    title={
                      recordingOn ? 'Остановить запись встречи (мок)' : 'Начать запись встречи (мок)'
                    }
                    aria-label={
                      recordingOn ? 'Остановить запись встречи' : 'Начать запись встречи'
                    }
                    aria-pressed={recordingOn}
                    onClick={() => setRecordingOn((v) => !v)}
                  >
                    <DotFilledIcon width={18} height={18} />
                  </IconButton>

                  <Box className={styles.floatingBarSep} aria-hidden />

                  <IconButton
                    size="3"
                    variant="soft"
                    radius="full"
                    className={styles.floatingBarButton}
                    title="Свернуть в задачи"
                    aria-label="Свернуть в задачи"
                    onClick={handleCollapseToTasks}
                  >
                    <ChevronDownIcon width={18} height={18} />
                  </IconButton>

                  <IconButton
                    size="3"
                    color="red"
                    variant="solid"
                    radius="full"
                    className={styles.floatingBarButton}
                    title="Покинуть встречу"
                    aria-label="Покинуть встречу"
                    onClick={handleLeave}
                  >
                    <ExitIcon width={18} height={18} />
                  </IconButton>
                </Flex>
              </Box>
            </Box>
          </Box>
        </Flex>

        {sidePanelOpen ? (
          <MeetRoomSidePanel
            participants={participantsView}
            chatInternal={chatInternal}
            chatExternal={chatExternal}
            commentsInternal={commentsInternal}
            commentsExternal={commentsExternal}
            onSendChat={onSendChat}
            onSendComment={onSendComment}
            mainTab={sideTab}
            onMainTabChange={setSideTab}
          />
        ) : null}
      </Flex>
    </Flex>
  )
}
