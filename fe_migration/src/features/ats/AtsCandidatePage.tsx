import React, { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
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
  Select,
  DropdownMenu,
  TextArea,
  Popover,
} from '@radix-ui/themes'
import { useParams, useNavigate, useSearchParams } from '@/router-adapter'
import { useValidatedSearchParam } from '@/shared/hooks/useUrlSearchState'
import {
  PersonIcon,
  ChatBubbleIcon,
  GearIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EnvelopeClosedIcon,
  GlobeIcon,
  Pencil1Icon,
  CopyIcon,
  TrashIcon,
  Cross2Icon,
  CheckCircledIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeOpenIcon,
  EyeClosedIcon,
  OpenInNewWindowIcon,
  ArrowDownIcon,
  ReaderIcon,
  InfoCircledIcon,
  ReloadIcon,
  ExclamationTriangleIcon,
  FileTextIcon,
  Link2Icon,
} from '@radix-ui/react-icons'
import { FaBriefcase } from 'react-icons/fa'
import { useToast } from '@/components/Toast/ToastContext'
import {
  MOCK_CANDIDATES,
  MOCK_RATINGS,
  AVAILABLE_VACANCIES,
  getCandidateInitials,
  getVacancyIdByTitle,
  getUnreadConversationsCount,
  STATUS_ORDER,
  REJECTION_REASONS,
  OFFER_APPLICATION_IDS,
  OFFER_APPLICATION_NONE,
  getStatusColor,
  getCandidateResumeProfile,
  getExperienceTabInfo,
  isExternalRecruitingRefreshSource,
  initialCandidateActivityLogMap,
  initialCandidateAuditLogMap,
  type AtsCandidate,
  type AtsCandidateActivityEntry,
  type AtsCandidateAuditEntry,
  type CandidateExperienceTabInfo,
  type CandidateExperienceVersionEntry,
} from './mocks'
import { buildStatusConfirmAuditRevert, mergeAuditRevertIntoOverrides } from './auditLogHelpers'
import { CandidateResumeProfileView } from './components/CandidateResumeProfileView'
import { getPlatformInfo, getSocialUrl, SOCIAL_PLATFORMS, type SocialPlatformKey } from '@/lib/socialPlatforms'

const SOURCE_ICON_SIZE = 14

function formatAtsActivityTimestamp(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}

function getAtsActivityEntryHeadline(entry: AtsCandidateActivityEntry): string {
  if (entry.kind === 'status_transition') return 'Смена статуса'
  if (entry.kind === 'comment') return 'Комментарий'
  if (entry.kind === 'resume_added') return 'Поступление заявки'
  if (entry.kind === 'system') return entry.title ?? 'Система'
  return 'Событие'
}

function buildStatusConfirmAuditDetail(params: {
  atIso: string
  candidateId: string
  candidateName: string
  vacancyTitle: string
  fromStatus: string
  nextStatus: string
  logisticsStatusChange: boolean
  curOfferId: string
  curOfferDate: string
  nextOfferId: string
  nextOfferDate: string
  rejectionReason: string
  commentTrimmed: string
}): string {
  return [
    `[ATS_AUDIT] CONFIRM_STATUS`,
    `ts_iso=${params.atIso}`,
    `candidate.id=${params.candidateId}`,
    `candidate.display_name=${params.candidateName}`,
    `vacancy.title=${params.vacancyTitle || '—'}`,
    `status.before=${params.fromStatus}`,
    `status.after=${params.nextStatus}`,
    `status.logistics_changed=${params.logisticsStatusChange}`,
    `offer.before_application_id=${params.curOfferId || '∅'}`,
    `offer.before_start_date=${params.curOfferDate || '∅'}`,
    `offer.after_application_id=${params.nextOfferId || '∅'}`,
    `offer.after_start_date=${params.nextOfferDate || '∅'}`,
    `rejection.reason=${params.rejectionReason || '∅'}`,
    `comment.empty=${!params.commentTrimmed}`,
    params.commentTrimmed ? `comment.raw:\n${params.commentTrimmed}` : 'comment.raw=∅',
  ].join('\n')
}

/** Иконка источника снимка опыта для строки версий */
function getExperienceSourceIcon(sourceSnapshot: string | undefined, size = SOURCE_ICON_SIZE): React.ReactNode {
  const s = (sourceSnapshot ?? '').trim().toLowerCase()
  if (!s) return null
  if (/linkedin/i.test(s)) {
    const info = getPlatformInfo('linkedin')
    return React.isValidElement(info.icon)
      ? React.cloneElement(info.icon as React.ReactElement<{ size?: number }>, { size })
      : info.icon
  }
  if (/hh\.?ru|headhunter|хедхантер|hh\b/i.test(s)) return <FaBriefcase size={size} />
  if (/rabota|работа\.?by/i.test(s)) return <FaBriefcase size={size} />
  if (/файл|file|система|загрузка|upload|manual/i.test(s)) return <FileTextIcon width={size} height={size} />
  const info = getPlatformInfo(s.replace(/[^a-z0-9]/g, '').slice(0, 20) || 'devTo')
  return info.icon
}
import WorkflowChat from '@/components/workflow/WorkflowChat'
import SlotsPanel from '@/components/workflow/SlotsPanel'
import VacancyEditModal, { parseVacancySettingsTab, type VacancyViewItem } from '@/components/vacancies/VacancyEditModal'
import { DuplicateSuspicionModal } from './DuplicateSuspicionModal'
import { BlacklistSuspicionModal } from './BlacklistSuspicionModal'
import { AddCandidateModal } from './components/AddCandidateModal'
import styles from './AtsPage.module.css'

type LeftTab = 'candidates' | 'chat'
type RightTab = 'info' | 'activity' | 'ratings' | 'documents' | 'history'

const ATS_LEFT_TABS = ['candidates', 'chat'] as const
const ATS_RIGHT_TABS = ['info', 'activity', 'ratings', 'documents', 'history'] as const

const UNREAD_BADGE_ICON_SIZE = 12

type ResumeAttachmentFormatBadge = 'PDF' | 'DOC' | 'DOCX' | 'PPT' | 'PPTX' | 'IMG'

/** Соседние версии по времени (по возрастанию номера) для блоков расхождений */
function buildExperienceVersionComparisonPairs(
  history: CandidateExperienceVersionEntry[],
): { from: CandidateExperienceVersionEntry; to: CandidateExperienceVersionEntry; key: string }[] {
  if (history.length < 2) return []
  const asc = [...history].sort((a, b) => a.version - b.version)
  return asc.slice(0, -1).map((from, i) => ({
    from,
    to: asc[i + 1],
    key: `${from.version}-${asc[i + 1].version}`,
  }))
}

/** Метка формата для превью — по расширению имени файла */
function getResumeAttachmentFormatLabel(fileName: string): ResumeAttachmentFormatBadge {
  const trimmed = fileName.trim().toLowerCase()
  const dot = trimmed.lastIndexOf('.')
  const ext = dot >= 0 ? trimmed.slice(dot) : ''
  if (ext === '.pdf') return 'PDF'
  if (ext === '.doc') return 'DOC'
  if (ext === '.docx') return 'DOCX'
  if (ext === '.ppt') return 'PPT'
  if (ext === '.pptx') return 'PPTX'
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.heic'].includes(ext)) return 'IMG'
  return 'PDF'
}

const EXPERIENCE_TAB_LABEL_MAX = 24

function shortenMiddle(s: string, max: number): string {
  if (s.length <= max) return s
  const head = Math.floor((max - 1) / 2)
  const tail = max - 1 - head
  return `${s.slice(0, head)}…${s.slice(s.length - tail)}`
}

function shortenExperienceSourceLabelForTab(sourceLabel: string): string {
  const t = sourceLabel.trim()
  if (!t || t === '—') return '—'
  try {
    if (/^https?:\/\//i.test(t)) {
      const u = new URL(t)
      const host = u.hostname.replace(/^www\./, '')
      return shortenMiddle(host, EXPERIENCE_TAB_LABEL_MAX)
    }
  } catch {
    /* ignore */
  }
  return shortenMiddle(t, EXPERIENCE_TAB_LABEL_MAX)
}

/** Короткая подпись вкладки «Опыт»: только источник (файл / домен / площадка), до 24 символов */
function getExperienceTabTriggerLabel(
  tab: 'resume' | 'profile',
  meta: CandidateExperienceTabInfo | null,
  resumeFileName?: string,
): { short: string; full: string } {
  if (!meta) return { short: '—', full: '—' }
  const src = meta.sourceLabel.trim()
  if (tab === 'resume' && /^файл$/i.test(src) && resumeFileName?.trim()) {
    const name = resumeFileName.trim()
    return { short: shortenMiddle(name, EXPERIENCE_TAB_LABEL_MAX), full: name }
  }
  return { short: shortenExperienceSourceLabelForTab(src), full: src }
}

/** Информация для бейджа непрочитанных: иконка соцсети/мессенджера или многоточие и количество */
function getUnreadInfo(candidate: AtsCandidate): { icon: React.ReactNode; count: number } | null {
  const unreadSources = candidate.unreadSources ?? {}
  const sourceKeys = Object.keys(unreadSources)
  const totalUnread = candidate.unread ?? 0
  if (totalUnread === 0 || sourceKeys.length === 0) return null

  if (sourceKeys.length === 1) {
    const source = sourceKeys[0]
    const platformInfo = getPlatformInfo(source)
    const icon =
      React.isValidElement(platformInfo.icon)
        ? React.cloneElement(platformInfo.icon as React.ReactElement<{ size?: number }>, {
            size: UNREAD_BADGE_ICON_SIZE,
          })
        : platformInfo.icon
    return { icon, count: unreadSources[source] }
  }

  const totalCount = Object.values(unreadSources).reduce((sum, c) => sum + c, 0)
  return {
    icon: <Text size="1" weight="bold" style={{ fontSize: 10 }}>...</Text>,
    count: totalCount,
  }
}


export function AtsCandidatePage() {
  const { showInfo, showSuccess: showSuccessToast } = useToast()
  const { vacancyId = '1', candidateId } = useParams<{ vacancyId: string; candidateId?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const isVacancySettingsPath = candidateId === undefined
  const effectiveCandidateId = candidateId ?? searchParams.get('from') ?? '1'
  const cid = effectiveCandidateId

  const atsVacancyNumericId = useMemo(() => {
    const n = parseInt(vacancyId, 10)
    return Number.isNaN(n) ? 1 : n
  }, [vacancyId])

  const atsSettingsTab = useMemo(() => parseVacancySettingsTab(searchParams.get('tab')), [searchParams])

  const rightColumnRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isRightColumnOpen, setIsRightColumnOpen] = useState(false)
  const [leftTab, setLeftTab] = useValidatedSearchParam('atsLeft', ATS_LEFT_TABS, 'candidates', {
    omitWhenDefault: true,
    replace: true,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [vacancySettingsSectionSearch, setVacancySettingsSectionSearch] = useState('')
  const [settingsSidebarHost, setSettingsSidebarHost] = useState<HTMLDivElement | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [ratingDetailOpen, setRatingDetailOpen] = useState(false)
  const [selectedRating, setSelectedRating] = useState<typeof MOCK_RATINGS['1'][0] | null>(null)
  const [newRatingDialogOpen, setNewRatingDialogOpen] = useState(false)
  const [ratingScores, setRatingScores] = useState<Record<string, number>>({})
  const [ratingComments, setRatingComments] = useState<Record<string, string>>({})
  const [ratingFiles, setRatingFiles] = useState<Record<string, File[]>>({})
  const [selectedInterviewer, setSelectedInterviewer] = useState('')
  const [generalFeedback, setGeneralFeedback] = useState('')
  const [slotsOpen, setSlotsOpen] = useState(false)
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
  const [blacklistModalOpen, setBlacklistModalOpen] = useState(false)
  const [rightTab, setRightTab] = useValidatedSearchParam('atsRight', ATS_RIGHT_TABS, 'info', {
    omitWhenDefault: true,
    replace: true,
  })

  /** Локальные изменения кандидата (статус и т.д.) по id — как setSelectedCandidate в old */
  const [localCandidateOverrides, setLocalCandidateOverrides] = useState<
    Record<string, Partial<AtsCandidate>>
  >({})
  /** Новые кандидаты, созданные в сессии (мок) */
  const [extraCandidates, setExtraCandidates] = useState<AtsCandidate[]>([])
  const [addCandidateOpen, setAddCandidateOpen] = useState(false)

  const candidatesWithOverrides = useMemo(() => {
    const base = MOCK_CANDIDATES.map((c) => ({
      ...c,
      ...(localCandidateOverrides[c.id] ?? {}),
    }))
    return [...base, ...extraCandidates]
  }, [localCandidateOverrides, extraCandidates])

  const selected = useMemo(
    () =>
      candidatesWithOverrides.find((c) => c.id === effectiveCandidateId) ?? candidatesWithOverrides[0] ?? null,
    [effectiveCandidateId, candidatesWithOverrides]
  )

  const handleCreateCandidate = useCallback(
    (candidate: AtsCandidate) => {
      setExtraCandidates((prev) => [...prev, candidate])
      setAddCandidateOpen(false)
      showSuccessToast('Кандидат создан', `${candidate.name} добавлен в список (мок).`)
      navigate(`/ats/vacancy/${vacancyId}/candidate/${candidate.id}`)
    },
    [navigate, vacancyId, showSuccessToast]
  )

  const atsVacancyViewItem: VacancyViewItem | null = useMemo(() => {
    if (!selected) return null
    return {
      id: atsVacancyNumericId,
      title: selected.vacancy ?? 'Вакансия',
      status: 'active',
      recruiter: '—',
      locations: [],
      interviewers: 0,
      date: null,
      hasWarning: false,
    }
  }, [selected, atsVacancyNumericId])

  const unreadChatCount = getUnreadConversationsCount()
  const vacancyTitle = selected?.vacancy ?? ''

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    candidatesWithOverrides.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1
    })
    return counts
  }, [candidatesWithOverrides])

  const filteredCandidates = useMemo(() => {
    let result = candidatesWithOverrides

    if (selectedStatus) {
      result = result.filter((c) => c.status === selectedStatus)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.position?.toLowerCase().includes(q) ?? false) ||
          (c.email?.toLowerCase().includes(q) ?? false)
      )
    }

    return result
  }, [candidatesWithOverrides, searchQuery, selectedStatus])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new CustomEvent('atsStatusCountsUpdate', { detail: statusCounts }))
  }, [statusCounts])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleStatusChange = (e: CustomEvent<string | null>) => {
      setSelectedStatus(e.detail)
    }
    window.addEventListener('atsStatusChange', handleStatusChange as EventListener)
    return () => window.removeEventListener('atsStatusChange', handleStatusChange as EventListener)
  }, [])

  const [statusComment, setStatusComment] = useState('')
  /** Выбранный в UI статус до нажатия «Подтвердить» */
  const [pendingStatus, setPendingStatus] = useState<string>('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [offerApplicationId, setOfferApplicationId] = useState('')
  const [offerStartDate, setOfferStartDate] = useState('')
  const [editingEmailIndex, setEditingEmailIndex] = useState<number | null>(null)
  const [editingPhoneIndex, setEditingPhoneIndex] = useState<number | null>(null)
  const [emailValue, setEmailValue] = useState('')
  const [phoneValue, setPhoneValue] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [isEditingLocation, setIsEditingLocation] = useState(false)
  const [locationValue, setLocationValue] = useState('')
  const [editingSocialPlatform, setEditingSocialPlatform] = useState<string | null>(null)
  const [editingSocialIndex, setEditingSocialIndex] = useState<number | null>(null)
  const [socialValue, setSocialValue] = useState('')
  const [addSocialOpen, setAddSocialOpen] = useState(false)
  const [isEditingSource, setIsEditingSource] = useState(false)
  const [sourceValue, setSourceValue] = useState('')
  const [isEditingPosition, setIsEditingPosition] = useState(false)
  const [positionValue, setPositionValue] = useState('')
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [tagsValue, setTagsValue] = useState('')
  const [isEditingLevel, setIsEditingLevel] = useState(false)
  const [levelValue, setLevelValue] = useState('')
  const [isEditingSalary, setIsEditingSalary] = useState(false)
  const [salaryValue, setSalaryValue] = useState('')
  const [isEditingOffer, setIsEditingOffer] = useState(false)
  const [offerValue, setOfferValue] = useState('')
  const [isSalaryVisible, setIsSalaryVisible] = useState(false)
  const [isOfferVisible, setIsOfferVisible] = useState(false)
  const [armedSocialDelete, setArmedSocialDelete] = useState<{ platform: string; index: number } | null>(null)
  const armedSocialDeleteTimeoutRef = useRef<number | null>(null)
  const [showOtherFields, setShowOtherFields] = useState(false)
  /** Сворачивание блоков вкладки Info */
  const [infoContactsOpen, setInfoContactsOpen] = useState(true)
  const [infoApplicationDetailsOpen, setInfoApplicationDetailsOpen] = useState(true)
  const [infoExperienceOpen, setInfoExperienceOpen] = useState(true)
  /** Превью вложения на вкладке «Профиль кандидата» (сворачивается по клику на заголовок) */
  const [resumeAttachmentPreviewOpen, setResumeAttachmentPreviewOpen] = useState(true)
  /** Превью файла resume.pdf на вкладке «Опыт» → файл (отдельно от профиля) */
  const [resumeFileTabPreviewOpen, setResumeFileTabPreviewOpen] = useState(true)
  /** Вкладки под «Опыт»: файл резюме vs профиль */
  const [experienceResourceTab, setExperienceResourceTab] = useState<'resume' | 'profile'>('resume')
  /** Выбранная версия в общей хронологии; null — актуальная (последняя по номеру v) */
  const [experienceVersionSelection, setExperienceVersionSelection] = useState<number | null>(null)
  const [experienceDiscrepancyModalOpen, setExperienceDiscrepancyModalOpen] = useState(false)
  /** Сколько старых пар сравнения уже раскрыто в модалке (шаг +2) */
  const [experienceDiscrepancyOlderPairsRevealed, setExperienceDiscrepancyOlderPairsRevealed] = useState(0)
  const [isEditingAge, setIsEditingAge] = useState(false)
  const [ageValue, setAgeValue] = useState('')
  const [isEditingGender, setIsEditingGender] = useState(false)
  const [genderValue, setGenderValue] = useState('')
  const [isEditingRating, setIsEditingRating] = useState(false)
  const [ratingValue, setRatingValue] = useState('')
  const [isEditingOtherEmail, setIsEditingOtherEmail] = useState(false)
  const [otherEmailValue, setOtherEmailValue] = useState('')
  const [isEditingOtherPhone, setIsEditingOtherPhone] = useState(false)
  const [otherPhoneValue, setOtherPhoneValue] = useState('')
  const [addContactModalOpen, setAddContactModalOpen] = useState(false)
  const [newContactType, setNewContactType] = useState<'email' | 'phone'>('email')
  const [newContactValue, setNewContactValue] = useState('')
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false)
  const [candidatePhotosMap, setCandidatePhotosMap] = useState<Record<string, { url: string; date: string }[]>>(() => {
    const initial: Record<string, { url: string; date: string }[]> = {}
    MOCK_CANDIDATES.forEach((c) => {
      if (c.avatarUrl) {
        initial[c.id] = [{ url: c.avatarUrl, date: '01.01.2026' }]
      }
    })
    return initial
  })
  const [currentPhotoIndexMap, setCurrentPhotoIndexMap] = useState<Record<string, number>>({})
  const [isDragging, setIsDragging] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [activityLogByCandidateId, setActivityLogByCandidateId] = useState<
    Record<string, AtsCandidateActivityEntry[]>
  >(() => initialCandidateActivityLogMap(MOCK_CANDIDATES))
  const [auditLogByCandidateId, setAuditLogByCandidateId] = useState<
    Record<string, AtsCandidateAuditEntry[]>
  >(() => initialCandidateAuditLogMap(MOCK_CANDIDATES))

  const currentPhotoIndex = selected ? (currentPhotoIndexMap[selected.id] ?? 0) : 0

  const candidatePhotos = useMemo(() => {
    if (!selected) return []
    return candidatePhotosMap[selected.id] ?? []
  }, [selected, candidatePhotosMap])

  const candidateActivityEntries = useMemo(() => {
    if (!selected) return []
    const list = activityLogByCandidateId[selected.id] ?? []
    return [...list].sort((a, b) => new Date(b.atIso).getTime() - new Date(a.atIso).getTime())
  }, [selected?.id, activityLogByCandidateId])

  const candidateAuditEntries = useMemo(() => {
    if (!selected) return []
    const list = auditLogByCandidateId[selected.id] ?? []
    return [...list].sort((a, b) => new Date(b.atIso).getTime() - new Date(a.atIso).getTime())
  }, [selected?.id, auditLogByCandidateId])

  const currentCandidateAvatarUrl = useMemo(() => {
    if (candidatePhotos.length > 0 && currentPhotoIndex < candidatePhotos.length) {
      return candidatePhotos[currentPhotoIndex]?.url
    }
    return selected?.avatarUrl
  }, [candidatePhotos, currentPhotoIndex, selected])

  const getCandidateAvatarUrl = useCallback((candidateId: string, fallbackUrl?: string) => {
    const photos = candidatePhotosMap[candidateId]
    const photoIndex = currentPhotoIndexMap[candidateId] ?? 0
    if (photos && photos.length > 0 && photoIndex < photos.length) {
      return photos[photoIndex]?.url
    }
    return fallbackUrl
  }, [candidatePhotosMap, currentPhotoIndexMap])

  const handlePhotoUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/') || !selected) return
    const url = URL.createObjectURL(file)
    const today = new Date()
    const date = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`
    setCandidatePhotosMap((prev) => ({
      ...prev,
      [selected.id]: [{ url, date }, ...(prev[selected.id] ?? [])],
    }))
    setCurrentPhotoIndexMap((prev) => ({ ...prev, [selected.id]: 0 }))
  }, [selected])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handlePhotoUpload(file)
  }, [handlePhotoUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handlePhotoUpload(file)
  }, [handlePhotoUpload])

  const handlePhotoSelect = useCallback((index: number) => {
    if (!selected) return
    setCurrentPhotoIndexMap((prev) => ({ ...prev, [selected.id]: index }))
  }, [selected])

  const handlePhotoDelete = useCallback((index: number) => {
    if (!selected) return
    const currentPhotos = candidatePhotosMap[selected.id] ?? []
    const newPhotos = currentPhotos.filter((_, i) => i !== index)
    
    setCandidatePhotosMap((prev) => ({ ...prev, [selected.id]: newPhotos }))
    
    if (currentPhotoIndex >= newPhotos.length) {
      setCurrentPhotoIndexMap((prev) => ({ ...prev, [selected.id]: Math.max(0, newPhotos.length - 1) }))
    } else if (index < currentPhotoIndex) {
      setCurrentPhotoIndexMap((prev) => ({ ...prev, [selected.id]: currentPhotoIndex - 1 }))
    }
  }, [currentPhotoIndex, selected, candidatePhotosMap])

  const displayCandidate = selected
    ? { ...selected, ...(localCandidateOverrides[selected.id] ?? {}) }
    : null

  useLayoutEffect(() => {
    if (displayCandidate) setPendingStatus(displayCandidate.status)
  }, [selected?.id, displayCandidate?.status])

  useEffect(() => {
    if (displayCandidate) {
      setOfferApplicationId(displayCandidate.offerApplicationId ?? '')
      setOfferStartDate(displayCandidate.offerStartDate ?? '')
    }
  }, [selected?.id, displayCandidate?.offerApplicationId, displayCandidate?.offerStartDate])

  useEffect(() => {
    setExperienceResourceTab('resume')
    setResumeFileTabPreviewOpen(true)
    setExperienceVersionSelection(null)
  }, [selected?.id])

  const experienceTabMeta = useMemo(
    () =>
      displayCandidate ? getExperienceTabInfo(displayCandidate, experienceResourceTab) : null,
    [displayCandidate, experienceResourceTab],
  )

  const experienceResumeTabMeta = useMemo(
    () => (displayCandidate ? getExperienceTabInfo(displayCandidate, 'resume') : null),
    [displayCandidate],
  )

  const experienceProfileTabMeta = useMemo(
    () => (displayCandidate ? getExperienceTabInfo(displayCandidate, 'profile') : null),
    [displayCandidate],
  )

  const experienceResumeTabTriggerLabel = useMemo(
    () =>
      getExperienceTabTriggerLabel(
        'resume',
        experienceResumeTabMeta,
        displayCandidate?.resumeFileName,
      ),
    [experienceResumeTabMeta, displayCandidate?.resumeFileName],
  )

  const experienceProfileTabTriggerLabel = useMemo(
    () => getExperienceTabTriggerLabel('profile', experienceProfileTabMeta, undefined),
    [experienceProfileTabMeta],
  )

  const activeExperienceVersionHistory = useMemo(() => {
    const global = displayCandidate?.experienceVersionHistory
    if (global && global.length > 0) return global
    const meta =
      experienceResourceTab === 'resume' ? experienceResumeTabMeta : experienceProfileTabMeta
    return meta?.versionHistory ?? []
  }, [
    displayCandidate?.experienceVersionHistory,
    experienceResourceTab,
    experienceResumeTabMeta,
    experienceProfileTabMeta,
  ])

  /** Порядок от новых к старым: актуальная слева → v0 справа */
  const experienceVersionTimelineDesc = useMemo(
    () => [...activeExperienceVersionHistory].sort((a, b) => b.version - a.version),
    [activeExperienceVersionHistory],
  )

  const experienceVersionComparisonPairs = useMemo(
    () => buildExperienceVersionComparisonPairs(activeExperienceVersionHistory),
    [activeExperienceVersionHistory],
  )

  const experienceDiscrepancyPairSections = useMemo(() => {
    const pairs = experienceVersionComparisonPairs
    const tailN = 3
    if (pairs.length <= tailN) {
      return { head: [] as typeof pairs, tail: pairs, usePaging: false }
    }
    return {
      head: pairs.slice(0, pairs.length - tailN),
      tail: pairs.slice(-tailN),
      usePaging: true,
    }
  }, [experienceVersionComparisonPairs])

  const selectedExperienceVersion = useMemo(() => {
    const list = experienceVersionTimelineDesc
    if (list.length === 0) return null
    const latest = list[0]
    if (experienceVersionSelection == null) return latest
    return list.find((e) => e.version === experienceVersionSelection) ?? latest
  }, [experienceVersionTimelineDesc, experienceVersionSelection])

  const handleExperienceSourceRefresh = useCallback(() => {
    showInfo(
      'Обновление',
      'Запрос актуальных данных с источника (hh.ru, rabota.by, LinkedIn — мок API интеграции).',
    )
  }, [showInfo])

  const handleExperienceVersionChipClick = useCallback((version: number) => {
    setExperienceVersionSelection((prev) => {
      if (prev === version) return null
      return version
    })
  }, [])

  const effectivePendingStatus = displayCandidate
    ? pendingStatus || displayCandidate.status
    : ''

  const getNextStatus = useCallback((currentStatus: string) => {
    const idx = STATUS_ORDER.indexOf(currentStatus)
    if (idx >= 0 && idx < STATUS_ORDER.length - 1) return STATUS_ORDER[idx + 1]
    return currentStatus
  }, [])

  const handleStatusChange = useCallback(
    (newStatus: string) => {
      if (!selected) return
      setLocalCandidateOverrides((prev) => ({
        ...prev,
        [selected.id]: {
          ...prev[selected.id],
          status: newStatus,
          statusColor: getStatusColor(newStatus),
          ...(newStatus !== 'Offer'
            ? { offerApplicationId: undefined, offerStartDate: undefined }
            : {}),
        },
      }))
      if (newStatus === 'Rejected') setRejectionReason('')
      else setRejectionReason('')
    },
    [selected]
  )

  const handleNextStatus = useCallback(() => {
    if (!displayCandidate) return
    const current = pendingStatus || displayCandidate.status
    const next = getNextStatus(current)
    if (next !== current) setPendingStatus(next)
  }, [pendingStatus, displayCandidate, getNextStatus])

  const handleStatusCommentSubmit = useCallback(() => {
    if (!displayCandidate || !selected) return
    const fromStatus = displayCandidate.status
    const nextStatus = pendingStatus || displayCandidate.status
    const commentTrimmed = statusComment.trim()
    const nextOfferId = offerApplicationId.trim()
    const nextOfferDate = offerStartDate.trim()
    const curOfferId = (displayCandidate.offerApplicationId ?? '').trim()
    const curOfferDate = (displayCandidate.offerStartDate ?? '').trim()
    const offerFieldsChanged =
      nextStatus === 'Offer' && (nextOfferId !== curOfferId || nextOfferDate !== curOfferDate)
    const statusChanged = fromStatus !== nextStatus
    const logisticsStatusChange =
      statusChanged || (nextStatus === 'Offer' && fromStatus === 'Offer' && offerFieldsChanged)
    const shouldLog = commentTrimmed || logisticsStatusChange
    const atIso = new Date().toISOString()

    if (nextStatus === 'Offer') {
      setLocalCandidateOverrides((prev) => ({
        ...prev,
        [selected.id]: {
          ...prev[selected.id],
          status: 'Offer',
          statusColor: getStatusColor('Offer'),
          offerApplicationId: nextOfferId || undefined,
          offerStartDate: nextOfferDate || undefined,
        },
      }))
    } else if (nextStatus !== displayCandidate.status) {
      handleStatusChange(nextStatus)
    }

    if (shouldLog) {
      const entry: AtsCandidateActivityEntry = {
        id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        kind: logisticsStatusChange ? 'status_transition' : 'comment',
        atIso,
        authorLabel: 'Вы (текущий пользователь)',
        fromStatus: logisticsStatusChange ? fromStatus : undefined,
        toStatus: logisticsStatusChange ? nextStatus : undefined,
        commentRaw: commentTrimmed || undefined,
      }
      if (nextStatus === 'Rejected' && rejectionReason.trim()) {
        entry.rejectionReason = rejectionReason.trim()
      }
      if (nextStatus === 'Offer' && (nextOfferId || nextOfferDate)) {
        entry.subtitle = [`Заявка: ${nextOfferId || '—'}`, `Дата выхода: ${nextOfferDate || '—'}`].join(' · ')
      }
      setActivityLogByCandidateId((prev) => ({
        ...prev,
        [selected.id]: [...(prev[selected.id] ?? []), entry],
      }))

      const auditRevert = logisticsStatusChange
        ? buildStatusConfirmAuditRevert({
            candidateId: selected.id,
            beforeStatus: fromStatus,
            beforeStatusColor: displayCandidate.statusColor,
            beforeOfferId: displayCandidate.offerApplicationId,
            beforeOfferDate: displayCandidate.offerStartDate,
          })
        : null
      const auditEntry: AtsCandidateAuditEntry = {
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        atIso,
        authorLabel: 'Вы (текущий пользователь)',
        summary: logisticsStatusChange
          ? `UI: подтверждение статуса ${fromStatus} → ${nextStatus}`
          : 'UI: комментарий без смены статуса (панель статуса)',
        detail: buildStatusConfirmAuditDetail({
          atIso,
          candidateId: selected.id,
          candidateName: displayCandidate.name,
          vacancyTitle: displayCandidate.vacancy ?? '',
          fromStatus,
          nextStatus,
          logisticsStatusChange,
          curOfferId: curOfferId,
          curOfferDate: curOfferDate,
          nextOfferId,
          nextOfferDate,
          rejectionReason: rejectionReason.trim(),
          commentTrimmed,
        }),
        undone: false,
        revert: auditRevert,
      }
      setAuditLogByCandidateId((prev) => ({
        ...prev,
        [selected.id]: [...(prev[selected.id] ?? []), auditEntry],
      }))
    }

    if (commentTrimmed) setStatusComment('')
  }, [
    displayCandidate,
    selected,
    pendingStatus,
    offerApplicationId,
    offerStartDate,
    handleStatusChange,
    statusComment,
    rejectionReason,
  ])

  const handleAuditUndo = useCallback(
    (entryId: string) => {
      if (!selected) return
      const list = auditLogByCandidateId[selected.id] ?? []
      const entry = list.find((e) => e.id === entryId)
      const revert = entry?.revert
      if (!entry || entry.undone || !revert) return

      setLocalCandidateOverrides((prev) => mergeAuditRevertIntoOverrides(prev, revert))

      const undoLog: AtsCandidateAuditEntry = {
        id: `audit-undo-${Date.now()}`,
        atIso: new Date().toISOString(),
        authorLabel: 'Вы (текущий пользователь)',
        summary: `Отмена: ${entry.summary}`,
        detail: [
          `[ATS_AUDIT] REVERT`,
          `target_entry_id=${entry.id}`,
          `restored.status=${revert.merge.status ?? '—'}`,
          `restored.status_color=${revert.merge.statusColor ?? '—'}`,
          `restored.offer_application_id=${revert.merge.offerApplicationId ?? '∅'}`,
          `restored.offer_start_date=${revert.merge.offerStartDate ?? '∅'}`,
          `unset_keys=${(revert.unsetKeys ?? []).join(',') || '∅'}`,
        ].join('\n'),
        undone: false,
        revert: null,
      }

      setAuditLogByCandidateId((prev) => ({
        ...prev,
        [selected.id]: [
          ...(prev[selected.id] ?? []).map((e) => (e.id === entryId ? { ...e, undone: true } : e)),
          undoLog,
        ],
      }))

      showSuccessToast('Отмена', 'Состояние заявки восстановлено по снимку до подтверждения (мок).')
    },
    [selected, auditLogByCandidateId, showSuccessToast],
  )

  const copyCandidatePageUrl = useCallback(() => {
    if (!selected) return
    const path = `/ats/vacancy/${vacancyId}/candidate/${selected.id}`
    const url = `${window.location.origin}${path}${window.location.search}`
    void navigator.clipboard.writeText(url).then(() => {
      showSuccessToast('Скопировано', 'Ссылка на карточку кандидата в буфере обмена.')
    })
  }, [selected, vacancyId, showSuccessToast])

  const copyCandidateId = useCallback(() => {
    if (!selected) return
    void navigator.clipboard.writeText(selected.id).then(() => {
      showSuccessToast('Скопировано', `ID кандидата: ${selected.id}`)
    })
  }, [selected, showSuccessToast])

  const getEmails = () =>
    displayCandidate?.emails ?? (displayCandidate?.email ? [displayCandidate.email] : [])
  const getPhones = () =>
    displayCandidate?.phones ?? (displayCandidate?.phone ? [displayCandidate.phone] : [])

  const handleEmailSave = useCallback(
    (index: number) => {
      if (!selected || !emailValue.trim()) return
      const emails = [...getEmails()]
      emails[index] = emailValue.trim()
      setLocalCandidateOverrides((prev) => ({
        ...prev,
        [selected.id]: { ...prev[selected.id], emails, email: emails[0] },
      }))
      setEditingEmailIndex(null)
      setEmailValue('')
    },
    [selected, emailValue, getEmails]
  )
  const handlePhoneSave = useCallback(
    (index: number) => {
      if (!selected || !phoneValue.trim()) return
      const phones = [...getPhones()]
      phones[index] = phoneValue.trim()
      setLocalCandidateOverrides((prev) => ({
        ...prev,
        [selected.id]: { ...prev[selected.id], phones, phone: phones[0] },
      }))
      setEditingPhoneIndex(null)
      setPhoneValue('')
    },
    [selected, phoneValue, getPhones]
  )
  const handleDeleteEmail = useCallback(
    (index: number) => {
      if (!selected) return
      const emails = getEmails().filter((_, i) => i !== index)
      setLocalCandidateOverrides((prev) => ({
        ...prev,
        [selected.id]: { ...prev[selected.id], emails, email: emails[0] ?? '' },
      }))
      setEditingEmailIndex(null)
    },
    [selected, getEmails]
  )
  const handleDeletePhone = useCallback(
    (index: number) => {
      if (!selected) return
      const phones = getPhones().filter((_, i) => i !== index)
      setLocalCandidateOverrides((prev) => ({
        ...prev,
        [selected.id]: { ...prev[selected.id], phones, phone: phones[0] ?? '' },
      }))
      setEditingPhoneIndex(null)
    },
    [selected, getPhones]
  )
  const handleAddContact = useCallback(() => {
    if (!selected || !newContactValue.trim()) return
    if (newContactType === 'email') {
      const emails = [...getEmails(), newContactValue.trim()]
      setLocalCandidateOverrides((prev) => ({
        ...prev,
        [selected.id]: { ...prev[selected.id], emails, email: emails[0] },
      }))
    } else {
      const phones = [...getPhones(), newContactValue.trim()]
      setLocalCandidateOverrides((prev) => ({
        ...prev,
        [selected.id]: { ...prev[selected.id], phones, phone: phones[0] },
      }))
    }
    setNewContactValue('')
    setAddContactModalOpen(false)
  }, [selected, newContactType, newContactValue, getEmails, getPhones])

  const handleNameSave = useCallback(() => {
    if (!selected) return
    const next = nameValue.trim()
    if (!next) return
    setLocalCandidateOverrides((prev) => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], name: next },
    }))
    setIsEditingName(false)
  }, [selected, nameValue])

  const handleLocationSave = useCallback(() => {
    if (!selected) return
    const next = locationValue.trim()
    if (!next) return
    setLocalCandidateOverrides((prev) => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], location: next },
    }))
    setIsEditingLocation(false)
    setLocationValue('')
  }, [selected, locationValue])

  const openLocationInMaps = useCallback(() => {
    const loc = displayCandidate?.location
    if (!loc) return
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }, [displayCandidate?.location])

  type SocialValue = string | string[]
  const getSocialEntries = () => (displayCandidate?.social ?? {}) as Record<string, SocialValue>

  const getSocialContacts = useCallback(
    (platform: string): string[] => {
      const v = getSocialEntries()[platform]
      if (!v) return []
      return Array.isArray(v) ? v : [v]
    },
    [getSocialEntries]
  )

  const handleSocialSave = useCallback(() => {
    if (!selected || !editingSocialPlatform || editingSocialIndex == null) return
    const next = socialValue.trim()
    if (!next) return
    const contacts = [...getSocialContacts(editingSocialPlatform)]
    contacts[editingSocialIndex] = next
    const social = { ...getSocialEntries(), [editingSocialPlatform]: contacts }
    setLocalCandidateOverrides((prev) => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], social },
    }))
    setEditingSocialPlatform(null)
    setEditingSocialIndex(null)
    setSocialValue('')
  }, [selected, editingSocialPlatform, editingSocialIndex, socialValue, getSocialContacts])

  const handleSocialDelete = useCallback(
    (platform: string, index: number) => {
      if (!selected) return
      const contacts = getSocialContacts(platform).filter((_, i) => i !== index)
      const social = { ...getSocialEntries() }
      if (contacts.length === 0) delete social[platform]
      else social[platform] = contacts
      setLocalCandidateOverrides((prev) => ({
        ...prev,
        [selected.id]: { ...prev[selected.id], social },
      }))
      if (editingSocialPlatform === platform) {
        setEditingSocialPlatform(null)
        setEditingSocialIndex(null)
        setSocialValue('')
      }
    },
    [selected, editingSocialPlatform, getSocialContacts]
  )

  const handleSocialEdit = useCallback(
    (platform: string, index: number) => {
      const contacts = getSocialContacts(platform)
      const v = contacts[index] ?? ''
      setEditingSocialPlatform(platform)
      setEditingSocialIndex(index)
      setSocialValue(v)
    },
    [getSocialContacts]
  )

  const handleAddSocialContact = useCallback(
    (platform: string) => {
      if (!selected) return
      const contacts = getSocialContacts(platform)
      if (contacts.length >= 5) {
        alert('Можно добавить максимум 5 контактов для одной платформы')
        return
      }
      const nextContacts = [...contacts, '']
      const social = { ...getSocialEntries(), [platform]: nextContacts }
      setLocalCandidateOverrides((prev) => ({
        ...prev,
        [selected.id]: { ...prev[selected.id], social },
      }))
      setEditingSocialPlatform(platform)
      setEditingSocialIndex(nextContacts.length - 1)
      setSocialValue('')
    },
    [selected, getSocialContacts]
  )

  const handleSourceSave = useCallback(() => {
    if (!selected) return
    const next = sourceValue.trim()
    if (!next) return
    setLocalCandidateOverrides((prev) => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], source: next },
    }))
    setIsEditingSource(false)
  }, [selected, sourceValue])

  const handlePositionSave = useCallback(() => {
    if (!selected) return
    const next = positionValue.trim()
    if (!next) return
    setLocalCandidateOverrides((prev) => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], position: next },
    }))
    setIsEditingPosition(false)
  }, [selected, positionValue])

  const levelOptions = ['Junior', 'Middle', 'Senior', 'Lead', 'Principal']

  const handleTagsSave = useCallback(() => {
    if (!selected) return
    const next = tagsValue
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    setLocalCandidateOverrides((prev) => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], tags: next },
    }))
    setIsEditingTags(false)
  }, [selected, tagsValue])

  const handleLevelSave = useCallback(() => {
    if (!selected) return
    const next = levelValue === 'Не указано' ? '' : levelValue
    setLocalCandidateOverrides((prev) => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], level: next },
    }))
    setIsEditingLevel(false)
  }, [selected, levelValue])

  const handleSalarySave = useCallback(() => {
    if (!selected) return
    const next = salaryValue.trim()
    setLocalCandidateOverrides((prev) => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], salaryExpectations: next },
    }))
    setIsEditingSalary(false)
  }, [selected, salaryValue])

  const handleOfferSave = useCallback(() => {
    if (!selected) return
    const next = offerValue.trim()
    setLocalCandidateOverrides((prev) => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], offer: next },
    }))
    setIsEditingOffer(false)
  }, [selected, offerValue])

  const handleAgeSave = useCallback(() => {
    if (!selected) return
    const nextRaw = ageValue.trim()
    if (!nextRaw) return
    const next = Number.parseInt(nextRaw, 10)
    if (Number.isNaN(next)) return
    setLocalCandidateOverrides((prev) => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], age: next },
    }))
    setIsEditingAge(false)
  }, [selected, ageValue])

  const handleGenderSave = useCallback(() => {
    if (!selected) return
    const next = genderValue.trim()
    setLocalCandidateOverrides((prev) => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], gender: next || undefined },
    }))
    setIsEditingGender(false)
    setGenderValue('')
  }, [selected, genderValue])

  const handleRatingSave = useCallback(() => {
    if (!selected) return
    const nextRaw = ratingValue.trim()
    if (!nextRaw) return
    const next = Number.parseFloat(nextRaw)
    if (Number.isNaN(next) || next < 0 || next > 5) return
    setLocalCandidateOverrides((prev) => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], rating: next },
    }))
    setIsEditingRating(false)
    setRatingValue('')
  }, [selected, ratingValue])

  const handleOtherEmailSave = useCallback(() => {
    if (!selected) return
    const next = otherEmailValue.trim()
    if (!next) return
    setLocalCandidateOverrides((prev) => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], email: next },
    }))
    setIsEditingOtherEmail(false)
    setOtherEmailValue('')
  }, [selected, otherEmailValue])

  const handleOtherPhoneSave = useCallback(() => {
    if (!selected) return
    const next = otherPhoneValue.trim()
    if (!next) return
    setLocalCandidateOverrides((prev) => ({
      ...prev,
      [selected.id]: { ...prev[selected.id], phone: next },
    }))
    setIsEditingOtherPhone(false)
    setOtherPhoneValue('')
  }, [selected, otherPhoneValue])


  useEffect(() => {
    setEditingEmailIndex(null)
    setEditingPhoneIndex(null)
    setEmailValue('')
    setPhoneValue('')
    setIsEditingName(false)
    setNameValue('')
    setIsEditingLocation(false)
    setLocationValue('')
    setEditingSocialPlatform(null)
    setEditingSocialIndex(null)
    setSocialValue('')
    setAddSocialOpen(false)
    setIsEditingSource(false)
    setSourceValue('')
    setIsEditingPosition(false)
    setPositionValue('')
    setArmedSocialDelete(null)
    setShowOtherFields(false)
    setIsEditingAge(false)
    setAgeValue('')
    setIsEditingGender(false)
    setGenderValue('')
    setIsEditingRating(false)
    setRatingValue('')
    setIsEditingOtherEmail(false)
    setOtherEmailValue('')
    setIsEditingOtherPhone(false)
    setOtherPhoneValue('')
    setIsEditingTags(false)
    setTagsValue((displayCandidate?.tags ?? []).join(', '))
    setIsEditingLevel(false)
    setLevelValue(displayCandidate?.level ?? '')
    setIsEditingSalary(false)
    setSalaryValue(displayCandidate?.salaryExpectations ?? '')
    setIsEditingOffer(false)
    setOfferValue(displayCandidate?.offer ?? '')
    setIsSalaryVisible(false)
    setIsOfferVisible(false)
    setAddContactModalOpen(false)
  }, [selected?.id])


  useEffect(() => {
    const mq = window.matchMedia('(max-width: 799px)')
    const onChange = () => setIsMobile(mq.matches)
    setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!isMobile) setIsRightColumnOpen(false)
  }, [isMobile])

  const handleCloseRightColumn = useCallback(() => {
    setIsRightColumnOpen(false)
  }, [])

  const isDuplicateClickInteractiveTarget = useCallback((target: HTMLElement) => {
    return Boolean(
      target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('select') ||
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('[role="tab"]')
    )
  }, [])

  const handleRightColumnDuplicateBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (!selected?.hasDuplicateSuspicion || isVacancySettingsPath) return
      const t = e.target as HTMLElement
      if (isDuplicateClickInteractiveTarget(t)) return
      setDuplicateModalOpen(true)
    },
    [selected?.hasDuplicateSuspicion, isVacancySettingsPath, isDuplicateClickInteractiveTarget]
  )

  const handleCandidateCardDuplicateClick = useCallback(
    (e: React.MouseEvent) => {
      if (isVacancySettingsPath || !selected?.hasDuplicateSuspicion) return
      const t = e.target as HTMLElement
      if (isDuplicateClickInteractiveTarget(t)) return
      e.stopPropagation()
      setDuplicateModalOpen(true)
    },
    [isVacancySettingsPath, selected?.hasDuplicateSuspicion, isDuplicateClickInteractiveTarget]
  )

  const handleSelectCandidate = (c: AtsCandidate) => {
    if (isMobile) setIsRightColumnOpen(true)
    const vId = getVacancyIdByTitle(c.vacancy)
    navigate(`/ats/vacancy/${vId}/candidate/${c.id}`)
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.leftColumn}>
        <Flex gap="2" mb="4" className={styles.tabSwitcher}>
          <Flex className={styles.tabSwitcherGroupCandidates}>
            <Button
              type="button"
              variant="soft"
              size="2"
              className={styles.tabSwitcherAddBtn}
              aria-label="Добавить кандидата"
              title="Добавить кандидата"
              onClick={() => setAddCandidateOpen(true)}
            >
              <PlusIcon width={16} height={16} />
            </Button>
            <Button
              variant={leftTab === 'candidates' && !isVacancySettingsPath ? 'solid' : 'soft'}
              size="2"
              onClick={() => {
                setLeftTab('candidates')
                if (isVacancySettingsPath) {
                  navigate(`/ats/vacancy/${vacancyId}/candidate/${effectiveCandidateId}`)
                }
              }}
              className={`${styles.tabButton} ${styles.tabSwitcherCandidatesBtn}`}
            >
              <PersonIcon width={16} height={16} />
              <Text size="2">Candidates</Text>
              <Badge
                size="1"
                color="gray"
                className={
                  leftTab === 'candidates' && !isVacancySettingsPath
                    ? styles.tabSwitcherCandidatesCountBadgeOnAccent
                    : undefined
                }
              >
                {candidatesWithOverrides.length}
              </Badge>
            </Button>
          </Flex>
          <Button
            variant={leftTab === 'chat' && !isVacancySettingsPath ? 'solid' : 'soft'}
            size="2"
            onClick={() => {
              setLeftTab('chat')
              if (isVacancySettingsPath) {
                navigate(`/ats/vacancy/${vacancyId}/candidate/${effectiveCandidateId}`)
              }
            }}
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
            variant={isVacancySettingsPath ? 'solid' : 'soft'}
            size="2"
            onClick={() => {
              const tab = parseVacancySettingsTab(searchParams.get('tab'))
              navigate(`/ats/vacancy/${vacancyId}?from=${encodeURIComponent(effectiveCandidateId)}&tab=${encodeURIComponent(tab)}`)
            }}
            className={styles.tabButton}
          >
            <GearIcon width={16} height={16} />
            <Text size="2">Настройки вакансии</Text>
          </Button>
        </Flex>

        <Flex align="center" gap="2" mb="3" style={{ flexShrink: 0 }}>
          <TextField.Root
            placeholder={
              isVacancySettingsPath ? 'Search vacancy-settings...' : `Search ${leftTab}...`
            }
            value={isVacancySettingsPath ? vacancySettingsSectionSearch : searchQuery}
            onChange={(e) =>
              isVacancySettingsPath
                ? setVacancySettingsSectionSearch(e.target.value)
                : setSearchQuery(e.target.value)
            }
            style={{ flex: 1 }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon width={16} height={16} />
            </TextField.Slot>
          </TextField.Root>
        </Flex>

        {isVacancySettingsPath && (
          <Box ref={setSettingsSidebarHost} className={styles.vacancySettingsSidebarHost} />
        )}

        {leftTab === 'candidates' && !isVacancySettingsPath && (
          <>
            <Box className={styles.leftTabContent}>
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
                  {(c.hasBlacklistSuspicion === true || c.isBlacklisted === true) && (
                    <Box
                      className={styles.blacklistListMark}
                      title={
                        c.isBlacklisted === true
                          ? 'В чёрном списке'
                          : 'Подозрение на чёрный список'
                      }
                      role="img"
                      aria-label={
                        c.isBlacklisted === true
                          ? 'В чёрном списке'
                          : 'Подозрение на чёрный список'
                      }
                    />
                  )}
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
                      src={getCandidateAvatarUrl(c.id, c.avatarUrl)}
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
                        {(c.unread ?? 0) > 0 && (() => {
                          const unreadInfo = getUnreadInfo(c)
                          if (!unreadInfo) return null
                          return (
                            <Badge size="1" color="red" style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                              {unreadInfo.icon}
                              {unreadInfo.count}
                            </Badge>
                          )
                        })()}
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
            </Box>
          </>
        )}

        {leftTab === 'chat' && !isVacancySettingsPath && (
          <Box className={styles.chatContainer}>
            <WorkflowChat />
          </Box>
        )}
      </Box>

      {isMobile && isRightColumnOpen && (
        <Box
          className={styles.modalOverlay}
          onClick={handleCloseRightColumn}
          role="presentation"
          aria-hidden
        />
      )}

      <Box
        className={`${styles.rightColumn} ${isRightColumnOpen ? styles.open : ''}`}
        ref={rightColumnRef}
        onClick={handleRightColumnDuplicateBackdropClick}
        style={{
          cursor:
            (selected?.hasDuplicateSuspicion || selected?.hasBlacklistSuspicion) && !isVacancySettingsPath
              ? 'pointer'
              : undefined,
        }}
      >
        {(selected?.hasDuplicateSuspicion || selected?.hasBlacklistSuspicion) && !isVacancySettingsPath && (
          <Flex direction="column" gap="2" className={styles.suspicionAlertsStack} mb="3">
            {selected?.hasDuplicateSuspicion ? (
              <Button
                variant="soft"
                color="orange"
                size="2"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setDuplicateModalOpen(true)
                }}
              >
                <Text size="4" weight="bold" style={{ fontSize: 16 }}>
                  ⚠️ Подозрение на дубликат
                </Text>
              </Button>
            ) : null}
            {selected?.hasBlacklistSuspicion ? (
              <Button
                type="button"
                variant="soft"
                size="2"
                className={styles.blacklistSuspicionBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  setBlacklistModalOpen(true)
                }}
              >
                <Text size="4" weight="bold" style={{ fontSize: 16 }}>
                  ⛔ Подозрение на чёрный список
                </Text>
              </Button>
            ) : null}
          </Flex>
        )}
        {isVacancySettingsPath && atsVacancyViewItem ? (
          <Card className={styles.candidateCard}>
            <Box className={styles.candidateCardScroll} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <Box className={styles.candidateCardScrollBody} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              {isMobile && isRightColumnOpen && (
                <Flex justify="end" mb="2">
                  <Button variant="soft" size="2" onClick={handleCloseRightColumn}>
                    Закрыть
                  </Button>
                </Flex>
              )}
              <VacancyEditModal
                embedded
                open
                vacancyId={atsVacancyNumericId}
                mode="edit"
                vacancy={atsVacancyViewItem}
                vacancyTitle={vacancyTitle}
                onOpenChange={() => {}}
                settingsTab={atsSettingsTab}
                onSettingsTabChange={(tab) => {
                  setSearchParams(
                    (prev) => {
                      const next = new URLSearchParams(prev)
                      next.set('tab', tab)
                      const f = prev.get('from')
                      if (f) next.set('from', f)
                      return next
                    },
                    { replace: true }
                  )
                }}
                onEmbeddedCancel={() => navigate(`/ats/vacancy/${vacancyId}/candidate/${effectiveCandidateId}`)}
                vacancySettingsSearchExternal={vacancySettingsSectionSearch}
                onVacancySettingsSearchExternalChange={setVacancySettingsSectionSearch}
                settingsSidebarHostEl={settingsSidebarHost}
              />
              </Box>
            </Box>
          </Card>
        ) : selected && displayCandidate ? (
          <Card
            className={styles.candidateCard}
            onClick={handleCandidateCardDuplicateClick}
            style={{
              transition: 'all 0.3s ease',
              cursor:
                selected.hasDuplicateSuspicion || selected.hasBlacklistSuspicion ? 'pointer' : undefined,
            }}
          >
            <Box className={styles.candidateCardScroll}>
              <Flex className={styles.candidateCardScrollBody} direction="column" gap="4">
                {isMobile && isRightColumnOpen && (
                  <Flex justify="end">
                    <Button variant="soft" size="2" onClick={handleCloseRightColumn}>
                      Закрыть
                    </Button>
                  </Flex>
                )}
                <Flex direction="column" gap="2" mb="2" style={{ width: '100%', minWidth: 0 }}>
                  <Flex
                    align="stretch"
                    gap="3"
                    style={{ width: '100%', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}
                  >
                    <Box
                      style={{
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                      onClick={() => setPhotoDialogOpen(true)}
                      title="Нажмите, чтобы изменить фото"
                    >
                      <Avatar
                        size="5"
                        src={currentCandidateAvatarUrl}
                        fallback={getCandidateInitials(selected)}
                        style={{
                          backgroundColor: displayCandidate.statusColor ?? 'var(--accent-9)',
                        }}
                      />
                    </Box>
                    <Flex direction="column" gap="2" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <Flex
                        align="center"
                        justify="between"
                        gap="2"
                        wrap="nowrap"
                        style={{ width: '100%', minWidth: 0 }}
                      >
                        <Flex align="center" gap="2" wrap="nowrap" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          {isEditingName ? (
                            <>
                              <TextField.Root
                                size="2"
                                value={nameValue}
                                onChange={(e) => setNameValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleNameSave()
                                  if (e.key === 'Escape') {
                                    setIsEditingName(false)
                                    setNameValue('')
                                  }
                                }}
                                style={{ flex: '0 1 auto', minWidth: 180, maxWidth: 260 }}
                                autoFocus
                              />
                              <Button size="1" variant="ghost" style={{ flexShrink: 0 }} onClick={handleNameSave} title="Сохранить">
                                <CheckCircledIcon width={12} height={12} />
                              </Button>
                              <Button
                                size="1"
                                variant="ghost"
                                style={{ flexShrink: 0 }}
                                onClick={() => {
                                  setIsEditingName(false)
                                  setNameValue('')
                                }}
                                title="Отмена"
                              >
                                <Cross2Icon width={12} height={12} />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Text size="5" weight="bold" style={{ flexShrink: 0 }}>
                                {displayCandidate.name}
                              </Text>
                              <Button
                                size="1"
                                variant="ghost"
                                style={{ flexShrink: 0 }}
                                title="Редактировать имя"
                                onClick={() => {
                                  setIsEditingName(true)
                                  setNameValue(displayCandidate.name)
                                }}
                              >
                                <Pencil1Icon width={12} height={12} />
                              </Button>
                            </>
                          )}
                        </Flex>
                        <Flex align="center" gap="1" style={{ flexShrink: 0 }}>
                          <Button
                            type="button"
                            size="1"
                            variant="ghost"
                            color="gray"
                            title="Копировать ссылку на карточку"
                            aria-label="Копировать ссылку на карточку кандидата"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyCandidatePageUrl()
                            }}
                          >
                            <Link2Icon width={14} height={14} />
                          </Button>
                          <Button
                            type="button"
                            size="1"
                            variant="ghost"
                            color="gray"
                            title={`Копировать ID: ${displayCandidate.id}`}
                            aria-label="Копировать ID кандидата"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyCandidateId()
                            }}
                          >
                            <Text size="1" weight="bold" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                              ID
                            </Text>
                          </Button>
                        </Flex>
                      </Flex>
                      <Box className={styles.candidateHeaderBadgeScroll}>
                        <Flex gap="2" align="center" wrap="nowrap" className={styles.candidateHeaderBadgeRow}>
                          <Badge
                            size="2"
                            variant="soft"
                            className={styles.candidateHeaderBadgeUnified}
                            style={{
                              backgroundColor: displayCandidate.statusColor,
                              color: 'white',
                              maxWidth: '100%',
                              flexShrink: 0,
                            }}
                            title={`Текущая заявка: ${displayCandidate.vacancy ?? vacancyTitle} · ${displayCandidate.status}`}
                          >
                            🎯 {displayCandidate.vacancy ?? vacancyTitle} · {displayCandidate.status}
                          </Badge>
                          {displayCandidate.parallelVacancies?.map((p, i) => (
                            <Badge
                              key={`parallel-${i}`}
                              size="2"
                              variant="soft"
                              color="blue"
                              className={styles.candidateHeaderBadgeUnified}
                              title="Параллельная заявка на другую вакансию"
                              style={{ flexShrink: 0 }}
                            >
                              🔀 {p.vacancy} · {p.status}
                            </Badge>
                          ))}
                          {displayCandidate.archivedApplications?.map((a, i) => (
                            <Badge
                              key={`archived-${i}`}
                              size="2"
                              variant="outline"
                              color="gray"
                              className={styles.candidateHeaderBadgeUnified}
                              title="Архивная заявка"
                              style={{ flexShrink: 0 }}
                            >
                              📦 {a.vacancy} · {a.status}
                            </Badge>
                          ))}
                        </Flex>
                      </Box>
                    </Flex>
                  </Flex>
                  <Box className={styles.candidateStatusPanel}>
                    <Box className={styles.candidateStatusPanelComment}>
                      <TextArea
                        size="2"
                        rows={4}
                        className={styles.candidateStatusCommentTextarea}
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault()
                            handleStatusCommentSubmit()
                          }
                        }}
                        placeholder="Введите комментарий..."
                        style={{ paddingRight: 32 }}
                        id="status-comment-textarea"
                      />
                      <Popover.Root>
                        <Popover.Trigger>
                          <Button
                            type="button"
                            variant="ghost"
                            size="1"
                            style={{
                              position: 'absolute',
                              bottom: 8,
                              right: 8,
                              width: 24,
                              height: 24,
                              padding: 0,
                              minWidth: 24,
                            }}
                            aria-label="Форматирование текста"
                            title="Форматирование текста"
                          >
                            <InfoCircledIcon width={14} height={14} />
                          </Button>
                        </Popover.Trigger>
                        <Popover.Content size="2" style={{ maxWidth: 280, padding: 8 }}>
                          <Flex direction="column" gap="2">
                            <Text size="1" weight="bold" mb="1">
                              Форматирование текста
                            </Text>
                            <Flex gap="1" wrap="wrap">
                              <Button
                                type="button"
                                size="1"
                                variant="soft"
                                onClick={() => {
                                  const textarea = document.getElementById('status-comment-textarea') as HTMLTextAreaElement
                                  if (!textarea) return
                                  textarea.focus()
                                  const start = textarea.selectionStart
                                  const end = textarea.selectionEnd
                                  const selected = statusComment.substring(start, end)
                                  if (selected) {
                                    const before = statusComment.substring(0, start)
                                    const after = statusComment.substring(end)
                                    setStatusComment(`${before}**${selected}**${after}`)
                                    setTimeout(() => {
                                      textarea.setSelectionRange(start + 2, end + 2)
                                      textarea.focus()
                                    }, 0)
                                  } else {
                                    setStatusComment(`${statusComment}****`)
                                    setTimeout(() => {
                                      textarea.setSelectionRange(statusComment.length + 2, statusComment.length + 2)
                                      textarea.focus()
                                    }, 0)
                                  }
                                }}
                                title="Жирный (Ctrl+B / Cmd+B)"
                              >
                                <Text size="1" weight="bold">B</Text>
                              </Button>
                              <Button
                                type="button"
                                size="1"
                                variant="soft"
                                onClick={() => {
                                  const textarea = document.getElementById('status-comment-textarea') as HTMLTextAreaElement
                                  if (!textarea) return
                                  textarea.focus()
                                  const start = textarea.selectionStart
                                  const end = textarea.selectionEnd
                                  const selected = statusComment.substring(start, end)
                                  if (selected) {
                                    const before = statusComment.substring(0, start)
                                    const after = statusComment.substring(end)
                                    setStatusComment(`${before}*${selected}*${after}`)
                                    setTimeout(() => {
                                      textarea.setSelectionRange(start + 1, end + 1)
                                      textarea.focus()
                                    }, 0)
                                  } else {
                                    setStatusComment(`${statusComment}**`)
                                    setTimeout(() => {
                                      textarea.setSelectionRange(statusComment.length + 1, statusComment.length + 1)
                                      textarea.focus()
                                    }, 0)
                                  }
                                }}
                                title="Курсив (Ctrl+I / Cmd+I)"
                              >
                                <Text size="1" style={{ fontStyle: 'italic' }}>I</Text>
                              </Button>
                              <Button
                                type="button"
                                size="1"
                                variant="soft"
                                onClick={() => {
                                  const textarea = document.getElementById('status-comment-textarea') as HTMLTextAreaElement
                                  if (!textarea) return
                                  textarea.focus()
                                  const start = textarea.selectionStart
                                  const end = textarea.selectionEnd
                                  const selected = statusComment.substring(start, end)
                                  if (selected) {
                                    const before = statusComment.substring(0, start)
                                    const after = statusComment.substring(end)
                                    setStatusComment(`${before}<u>${selected}</u>${after}`)
                                    setTimeout(() => {
                                      textarea.setSelectionRange(start + 3, end + 3)
                                      textarea.focus()
                                    }, 0)
                                  } else {
                                    setStatusComment(`${statusComment}<u></u>`)
                                    setTimeout(() => {
                                      textarea.setSelectionRange(statusComment.length + 3, statusComment.length + 3)
                                      textarea.focus()
                                    }, 0)
                                  }
                                }}
                                title="Подчеркивание (Ctrl+U / Cmd+U)"
                              >
                                <Text size="1" style={{ textDecoration: 'underline' }}>U</Text>
                              </Button>
                              <Button
                                type="button"
                                size="1"
                                variant="soft"
                                onClick={() => {
                                  const textarea = document.getElementById('status-comment-textarea') as HTMLTextAreaElement
                                  if (!textarea) return
                                  textarea.focus()
                                  const start = textarea.selectionStart
                                  const lineStart = statusComment.lastIndexOf('\n', start - 1) + 1
                                  const before = statusComment.substring(0, lineStart)
                                  const after = statusComment.substring(lineStart)
                                  setStatusComment(`${before}- ${after}`)
                                  setTimeout(() => {
                                    textarea.setSelectionRange(lineStart + 2, lineStart + 2)
                                    textarea.focus()
                                  }, 0)
                                }}
                                title="Маркированный список"
                              >
                                <Text size="1">•</Text>
                              </Button>
                              <Button
                                type="button"
                                size="1"
                                variant="soft"
                                onClick={() => {
                                  const textarea = document.getElementById('status-comment-textarea') as HTMLTextAreaElement
                                  if (!textarea) return
                                  textarea.focus()
                                  const start = textarea.selectionStart
                                  const lineStart = statusComment.lastIndexOf('\n', start - 1) + 1
                                  const before = statusComment.substring(0, lineStart)
                                  const after = statusComment.substring(lineStart)
                                  setStatusComment(`${before}1. ${after}`)
                                  setTimeout(() => {
                                    textarea.setSelectionRange(lineStart + 3, lineStart + 3)
                                    textarea.focus()
                                  }, 0)
                                }}
                                title="Нумерованный список"
                              >
                                <Text size="1">1.</Text>
                              </Button>
                              <Button
                                type="button"
                                size="1"
                                variant="soft"
                                onClick={() => {
                                  const textarea = document.getElementById('status-comment-textarea') as HTMLTextAreaElement
                                  if (!textarea) return
                                  textarea.focus()
                                  const start = textarea.selectionStart
                                  const end = textarea.selectionEnd
                                  const selected = statusComment.substring(start, end) || 'текст ссылки'
                                  const before = statusComment.substring(0, start)
                                  const after = statusComment.substring(end)
                                  setStatusComment(`${before}[${selected}](url)${after}`)
                                  setTimeout(() => {
                                    const newStart = start + selected.length + 3
                                    textarea.setSelectionRange(newStart, newStart + 3)
                                    textarea.focus()
                                  }, 0)
                                }}
                                title="Ссылка (Ctrl+K / Cmd+K)"
                              >
                                <Text size="1">🔗</Text>
                              </Button>
                            </Flex>
                            <Text size="1" color="gray" mt="1" style={{ lineHeight: 1.4 }}>
                              Используйте Markdown-синтаксис или HTML-теги. Горячие клавиши: Ctrl+B (жирный), Ctrl+I (курсив), Ctrl+U (подчеркивание), Ctrl+K (ссылка).
                            </Text>
                          </Flex>
                        </Popover.Content>
                      </Popover.Root>
                    </Box>
                    <Flex className={styles.candidateStatusPanelControls} direction="column" gap="2">
                      {displayCandidate.status === 'Accepted' ? (
                        <>
                          <Flex className={styles.candidateStatusAcceptedRow} align="center" gap="2">
                            <TextField.Root
                              size="2"
                              placeholder="Дата"
                              style={{ width: 90, minWidth: 90, flexShrink: 0 }}
                              defaultValue=""
                            >
                              <TextField.Slot side="left">
                                <Text size="1">📅</Text>
                              </TextField.Slot>
                            </TextField.Root>
                            <Button
                              size="2"
                              variant="soft"
                              onClick={() => handleStatusChange('Archived')}
                              style={{
                                flexShrink: 0,
                                backgroundColor: '#10B981',
                                color: 'white',
                                minWidth: 30,
                                width: 30,
                                padding: 0,
                              }}
                              title="Hired"
                            >
                              <CheckIcon width={14} height={14} />
                            </Button>
                            <Button
                              size="2"
                              variant="soft"
                              onClick={() => handleStatusChange('Rejected')}
                              style={{
                                flexShrink: 0,
                                backgroundColor: '#EF4444',
                                color: 'white',
                                minWidth: 30,
                                width: 30,
                                padding: 0,
                              }}
                              title="Rejected"
                            >
                              <Cross2Icon width={14} height={14} />
                            </Button>
                          </Flex>
                          <Button
                            size="2"
                            variant="solid"
                            className={styles.confirmAccentButton}
                            onClick={handleStatusCommentSubmit}
                          >
                            Подтвердить
                          </Button>
                        </>
                      ) : (
                        <>
                          <Flex className={styles.statusControlMerged}>
                            <Select.Root value={effectivePendingStatus} onValueChange={setPendingStatus}>
                              <Select.Trigger
                                style={{
                                  backgroundColor: getStatusColor(effectivePendingStatus),
                                  color: 'white',
                                  borderColor: 'transparent',
                                  minWidth: 0,
                                }}
                              />
                              <Select.Content position="popper" sideOffset={4}>
                                {STATUS_ORDER.filter((s) => s !== 'Все').map((status) => (
                                  <Select.Item key={status} value={status}>
                                    {status}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                            <Button
                              size="2"
                              variant="soft"
                              onClick={handleNextStatus}
                              disabled={getNextStatus(effectivePendingStatus) === effectivePendingStatus}
                              className={styles.statusControlNextBtn}
                              style={{
                                backgroundColor: getStatusColor(getNextStatus(effectivePendingStatus)),
                                color: 'white',
                              }}
                            >
                              <Text size="3">→</Text>
                            </Button>
                          </Flex>
                          {effectivePendingStatus === 'Rejected' && (
                            <Select.Root value={rejectionReason} onValueChange={setRejectionReason}>
                              <Select.Trigger style={{ width: '100%' }} placeholder="Причина отказа" />
                              <Select.Content>
                                <Select.Item value="Без указания причин">Без указания причин</Select.Item>
                                {REJECTION_REASONS.map((reason) => (
                                  <Select.Item key={reason} value={reason}>
                                    {reason}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Root>
                          )}
                          {effectivePendingStatus === 'Offer' && (
                            <Flex className={styles.offerFieldsMerged}>
                              <Select.Root
                                value={offerApplicationId ? offerApplicationId : OFFER_APPLICATION_NONE}
                                onValueChange={(v) =>
                                  setOfferApplicationId(v === OFFER_APPLICATION_NONE ? '' : v)
                                }
                              >
                                <Select.Trigger
                                  id="offer-application-id"
                                  aria-label="Номер заявки"
                                  placeholder="Номер заявки"
                                  style={{ width: '100%' }}
                                />
                                <Select.Content>
                                  <Select.Item value={OFFER_APPLICATION_NONE}>Не выбрано</Select.Item>
                                  {OFFER_APPLICATION_IDS.map((appId) => (
                                    <Select.Item key={appId} value={appId}>
                                      {appId}
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select.Root>
                              <TextField.Root
                                id="offer-start-date"
                                type="date"
                                size="1"
                                className={styles.offerDateField}
                                value={offerStartDate}
                                onChange={(e) => setOfferStartDate(e.target.value)}
                                aria-label="Дата выхода"
                              />
                            </Flex>
                          )}
                          <Button
                            size="2"
                            variant="solid"
                            className={styles.confirmAccentButton}
                            onClick={handleStatusCommentSubmit}
                          >
                            Подтвердить
                          </Button>
                        </>
                      )}
                    </Flex>
                  </Box>
                </Flex>

            <Separator size="4" mt="2" mb="2" />

            <Tabs.Root value={rightTab} onValueChange={(v) => setRightTab(v as RightTab)}>
              <Tabs.List className={styles.subTabs}>
                <Tabs.Trigger value="info">Info</Tabs.Trigger>
                <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
                <Tabs.Trigger value="ratings">Ratings</Tabs.Trigger>
                <Tabs.Trigger value="documents">Documents</Tabs.Trigger>
                <Tabs.Trigger value="history">History</Tabs.Trigger>
              </Tabs.List>

              <Box mt="2" style={{ flex: 1, minHeight: 0, minWidth: 0, maxWidth: '100%' }}>
                <Tabs.Content value="info">
                  <Flex direction="column" gap="4" style={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
                    <Box className={styles.candidateInfoSection}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setInfoContactsOpen((o) => !o)}
                        className={`${styles.candidateInfoSectionTrigger} ${infoContactsOpen ? styles.candidateInfoSectionTriggerOpen : ''}`}
                      >
                        <Text size="3" weight="bold">
                          Контакты
                        </Text>
                        {infoContactsOpen ? <ChevronUpIcon width={18} height={18} /> : <ChevronDownIcon width={18} height={18} />}
                      </Button>
                      {infoContactsOpen ? (
                      <Box className={styles.candidateInfoSectionBody}>
                      <Box mb="3">
                        <Flex align="center" gap="2" mb="2" wrap="wrap">
                          {getEmails().map((email, index) => (
                            <Flex key={index} align="center" gap="2" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                              {editingEmailIndex === index ? (
                                <>
                                  <EnvelopeClosedIcon width={16} height={16} style={{ flexShrink: 0 }} />
                                  <TextField.Root
                                    value={emailValue}
                                    onChange={(e) => setEmailValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleEmailSave(index)
                                      else if (e.key === 'Escape') {
                                        setEditingEmailIndex(null)
                                        setEmailValue('')
                                      }
                                    }}
                                    style={{ flex: 1, minWidth: 150 }}
                                    size="1"
                                    autoFocus
                                  />
                                  <Button size="1" variant="soft" onClick={() => handleEmailSave(index)} style={{ flexShrink: 0 }}>
                                    <CheckCircledIcon width={14} height={14} />
                                  </Button>
                                  <Button
                                    size="1"
                                    variant="soft"
                                    onClick={() => {
                                      setEditingEmailIndex(null)
                                      setEmailValue('')
                                    }}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <Cross2Icon width={14} height={14} />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <EnvelopeClosedIcon width={16} height={16} style={{ flexShrink: 0 }} />
                                  <Text size="2" weight="medium" style={{ flexShrink: 0 }}>Email:</Text>
                                  <Text size="2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{email}</Text>
                                  <Button size="1" variant="soft" onClick={() => navigator.clipboard.writeText(email)} style={{ flexShrink: 0 }}>
                                    Copy
                                  </Button>
                                  <Button
                                    size="1"
                                    variant="soft"
                                    onClick={() => {
                                      setEditingEmailIndex(index)
                                      setEmailValue(email)
                                    }}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <Pencil1Icon width={14} height={14} />
                                  </Button>
                                  <Button size="1" variant="soft" asChild>
                                    <a href={`mailto:${email}`} style={{ textDecoration: 'none' }}>
                                      <EnvelopeClosedIcon width={14} height={14} />
                                    </a>
                                  </Button>
                                  {getEmails().length > 1 && (
                                    <Button
                                      size="1"
                                      variant="soft"
                                      color="red"
                                      onClick={() => handleDeleteEmail(index)}
                                      style={{ flexShrink: 0 }}
                                    >
                                      <TrashIcon width={14} height={14} />
                                    </Button>
                                  )}
                                </>
                              )}
                            </Flex>
                          ))}
                          <Button
                            size="1"
                            variant="soft"
                            onClick={() => {
                              setNewContactType('email')
                              setNewContactValue('')
                              setAddContactModalOpen(true)
                            }}
                            style={{ flexShrink: 0 }}
                          >
                            <PlusIcon width={14} height={14} />
                          </Button>
                        </Flex>
                      </Box>
                      <Box mb="3">
                        <Flex align="center" gap="2" mb="2" wrap="wrap">
                          {getPhones().map((phone, index) => (
                            <Flex key={index} align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                              {editingPhoneIndex === index ? (
                                <>
                                  <Text size="2" weight="medium" style={{ flexShrink: 0 }}>📞 Телефон:</Text>
                                  <TextField.Root
                                    value={phoneValue}
                                    onChange={(e) => setPhoneValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handlePhoneSave(index)
                                      else if (e.key === 'Escape') {
                                        setEditingPhoneIndex(null)
                                        setPhoneValue('')
                                      }
                                    }}
                                    style={{ flex: 1, minWidth: 150 }}
                                    size="1"
                                    autoFocus
                                  />
                                  <Button size="1" variant="soft" onClick={() => handlePhoneSave(index)} style={{ flexShrink: 0 }}>
                                    <CheckCircledIcon width={14} height={14} />
                                  </Button>
                                  <Button
                                    size="1"
                                    variant="soft"
                                    onClick={() => {
                                      setEditingPhoneIndex(null)
                                      setPhoneValue('')
                                    }}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <Cross2Icon width={14} height={14} />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Text size="2" weight="medium" style={{ flexShrink: 0 }}>📞 Телефон:</Text>
                                  <Text size="2">{phone}</Text>
                                  <Button size="1" variant="soft" onClick={() => navigator.clipboard.writeText(phone)} style={{ flexShrink: 0 }}>
                                    Copy
                                  </Button>
                                  <Button
                                    size="1"
                                    variant="soft"
                                    onClick={() => {
                                      setEditingPhoneIndex(index)
                                      setPhoneValue(phone)
                                    }}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <Pencil1Icon width={14} height={14} />
                                  </Button>
                                  <Button size="1" variant="soft" asChild>
                                    <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} style={{ textDecoration: 'none' }}>
                                      Call
                                    </a>
                                  </Button>
                                  {getPhones().length > 1 && (
                                    <Button
                                      size="1"
                                      variant="soft"
                                      color="red"
                                      onClick={() => handleDeletePhone(index)}
                                      style={{ flexShrink: 0 }}
                                    >
                                      <TrashIcon width={14} height={14} />
                                    </Button>
                                  )}
                                </>
                              )}
                            </Flex>
                          ))}
                          <Button
                            size="1"
                            variant="soft"
                            onClick={() => {
                              setNewContactType('phone')
                              setNewContactValue('')
                              setAddContactModalOpen(true)
                            }}
                            style={{ flexShrink: 0 }}
                          >
                            <PlusIcon width={14} height={14} />
                          </Button>
                        </Flex>
                      </Box>
                      {(isEditingLocation || displayCandidate.location) && (
                        <Flex align="center" gap="2" mb="3" style={{ flexWrap: 'nowrap' }}>
                          <Text size="2" weight="medium" style={{ flexShrink: 0 }}>
                            📍 Локация:
                          </Text>
                          {isEditingLocation ? (
                            <>
                              <TextField.Root
                                size="1"
                                value={locationValue}
                                onChange={(e) => setLocationValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleLocationSave()
                                  else if (e.key === 'Escape') {
                                    setIsEditingLocation(false)
                                    setLocationValue('')
                                  }
                                }}
                                placeholder="Введите локацию..."
                                style={{ flex: '1 1 auto', minWidth: 180 }}
                                autoFocus
                              />
                              <Button size="1" variant="soft" onClick={handleLocationSave} style={{ flexShrink: 0 }}>
                                <CheckCircledIcon width={14} height={14} />
                              </Button>
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() => {
                                  setIsEditingLocation(false)
                                  setLocationValue('')
                                }}
                                style={{ flexShrink: 0 }}
                              >
                                <Cross2Icon width={14} height={14} />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Text size="2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                                {displayCandidate.location}
                              </Text>
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() => navigator.clipboard.writeText(displayCandidate.location ?? '')}
                                style={{ flexShrink: 0 }}
                              >
                                Copy
                              </Button>
                              <Button
                                size="1"
                                variant="soft"
                                onClick={() => {
                                  setIsEditingLocation(true)
                                  setLocationValue(displayCandidate.location ?? '')
                                }}
                                style={{ flexShrink: 0 }}
                              >
                                <Pencil1Icon width={14} height={14} />
                              </Button>
                              <Button
                                size="1"
                                variant="soft"
                                onClick={openLocationInMaps}
                                style={{ flexShrink: 0 }}
                              >
                                <GlobeIcon width={14} height={14} />
                              </Button>
                            </>
                          )}
                        </Flex>
                      )}

                      {/* Кнопки соцсетей/мессенджеров в строку (как в old) + добавление */}                      
                      <Flex wrap="wrap" gap="2" style={{ alignItems: 'flex-start', overflow: 'visible' }}>
                        {Object.entries(getSocialEntries()).flatMap(([platform, _v]) => {
                          const contacts = getSocialContacts(platform)
                          const normalized = platform.toLowerCase().replace(/\s+/g, '')
                          const map: Record<string, SocialPlatformKey> = {
                            whatsapp: 'whatsapp',
                            viber: 'viber',
                            telegram: 'telegram',
                            wechat: 'wechat',
                            teams: 'teams',
                            msteams: 'teams',
                            'microsoftteams': 'teams',
                            vk: 'vk',
                            odnoklassniki: 'odnoklassniki',
                            habr: 'habr',
                            habrcareer: 'habrCareer',
                            'хабркарьера': 'habrCareer',
                            vcru: 'vcRu',
                            'яндексдзен': 'zen',
                            pikabu: 'pikabu',
                            linkedin: 'linkedin',
                            xing: 'xing',
                            github: 'github',
                            gitlab: 'gitlab',
                            bitbucket: 'bitbucket',
                            stackoverflow: 'stackoverflow',
                            devto: 'devTo',
                            kaggle: 'kaggle',
                            dribbble: 'dribbble',
                            behance: 'behance',
                            pinterest: 'pinterest',
                            instagram: 'instagram',
                            facebook: 'facebook',
                            twitter: 'twitter',
                            x: 'twitter',
                            youtube: 'youtube',
                            medium: 'medium',
                            reddit: 'reddit',
                            discord: 'discord',
                          }
                          const key = map[normalized]
                          const info = getPlatformInfo(key ?? platform)
                          return contacts.map((contact, index) => {
                            const isEditingThis =
                              editingSocialPlatform === platform && editingSocialIndex != null && editingSocialIndex === index
                            const url = key ? getSocialUrl(key, contact) : (contact.startsWith('http') ? contact : '')

                            if (isEditingThis) {
                              return (
                                <Box
                                  key={`${platform}-${index}`}
                                  className={styles.socialEditContainer}
                                  style={{
                                    backgroundColor: info.color,
                                    borderRadius: '8px',
                                    padding: '0 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    minWidth: '200px',
                                    height: '35px',
                                    transition: 'all 0.3s ease-in-out',
                                  }}
                                >
                                  <Box
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'white',
                                      width: '16px',
                                      height: '16px',
                                    }}
                                  >
                                    {info.icon}
                                  </Box>
                                  <TextField.Root
                                    value={socialValue}
                                    onChange={(e) => setSocialValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSocialSave()
                                      else if (e.key === 'Escape') {
                                        setEditingSocialPlatform(null)
                                        setEditingSocialIndex(null)
                                        setSocialValue('')
                                      }
                                    }}
                                    placeholder={`Введите ${info.name}`}
                                    style={{ flex: 1, minWidth: '150px', margin: 0 }}
                                    size="1"
                                    className={styles.socialEditInput}
                                    autoFocus
                                  />
                                  <Button
                                    size="1"
                                    variant="solid"
                                    onClick={handleSocialSave}
                                    style={{
                                      borderRadius: '4px',
                                      width: '24px',
                                      height: '24px',
                                      padding: 0,
                                      minWidth: '24px',
                                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                      color: 'white',
                                      border: '1px solid rgba(255, 255, 255, 0.3)',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <CheckIcon width={14} height={14} />
                                  </Button>
                                  <Button
                                    size="1"
                                    variant="solid"
                                    onClick={() => {
                                      setEditingSocialPlatform(null)
                                      setEditingSocialIndex(null)
                                      setSocialValue('')
                                    }}
                                    style={{
                                      borderRadius: '4px',
                                      width: '24px',
                                      height: '24px',
                                      padding: 0,
                                      minWidth: '24px',
                                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                      color: 'white',
                                      border: '1px solid rgba(255, 255, 255, 0.3)',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Cross2Icon width={14} height={14} />
                                  </Button>
                                  <Button
                                    size="1"
                                    variant="solid"
                                    onClick={() => {
                                      if (armedSocialDelete?.platform === platform && armedSocialDelete.index === index) {
                                        if (armedSocialDeleteTimeoutRef.current != null) {
                                          window.clearTimeout(armedSocialDeleteTimeoutRef.current)
                                          armedSocialDeleteTimeoutRef.current = null
                                        }
                                        setArmedSocialDelete(null)
                                        handleSocialDelete(platform, index)
                                        return
                                      }

                                      setArmedSocialDelete({ platform, index })
                                      if (armedSocialDeleteTimeoutRef.current != null) {
                                        window.clearTimeout(armedSocialDeleteTimeoutRef.current)
                                      }
                                      armedSocialDeleteTimeoutRef.current = window.setTimeout(() => {
                                        setArmedSocialDelete(null)
                                        armedSocialDeleteTimeoutRef.current = null
                                      }, 2000)
                                    }}
                                    style={{
                                      borderRadius: '4px',
                                      width: '24px',
                                      height: '24px',
                                      padding: 0,
                                      minWidth: '24px',
                                      backgroundColor:
                                        armedSocialDelete?.platform === platform && armedSocialDelete.index === index
                                          ? 'rgba(239, 68, 68, 0.35)'
                                          : 'rgba(255, 255, 255, 0.2)',
                                      color: 'white',
                                      border: '1px solid rgba(255, 255, 255, 0.3)',
                                      cursor: 'pointer',
                                    }}
                                    title={
                                      armedSocialDelete?.platform === platform && armedSocialDelete.index === index
                                        ? 'Нажмите ещё раз для удаления'
                                        : 'Удалить'
                                    }
                                  >
                                    <TrashIcon width={14} height={14} />
                                  </Button>
                                </Box>
                              )
                            }

                            return (
                              <Box key={`${platform}-${index}`} className={styles.socialButtonWrapper} style={{ position: 'relative', overflow: 'visible' }}>
                                {url ? (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.socialButton}
                                    style={{
                                      textDecoration: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '35px',
                                      height: '35px',
                                      color: 'white',
                                      borderRadius: '8px',
                                      backgroundColor: info.color,
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease-in-out',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Box
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '100%',
                                        height: '100%',
                                        filter: 'brightness(1.1) contrast(1.1)',
                                      }}
                                    >
                                      {info.icon}
                                    </Box>
                                  </a>
                                ) : (
                                  <Box
                                    className={styles.socialButton}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: '35px',
                                      height: '35px',
                                      color: 'white',
                                      borderRadius: '8px',
                                      backgroundColor: info.color,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {info.icon}
                                  </Box>
                                )}
                                <Button
                                  size="1"
                                  variant="solid"
                                  className={styles.socialEditButton}
                                  onClick={() => handleSocialEdit(platform, index)}
                                  style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    borderRadius: '0 6px 0 0',
                                    width: '16px',
                                    height: '16px',
                                    padding: 0,
                                    minWidth: '16px',
                                    backgroundColor: 'var(--accent-9)',
                                    color: 'white',
                                    border: '2px solid var(--color-surface)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10,
                                  }}
                                >
                                  <Pencil1Icon width={8} height={8} />
                                </Button>
                                <Button
                                  size="1"
                                  variant="solid"
                                  className={styles.socialEditButton}
                                  onClick={() => {
                                    const toCopy = url || contact
                                    navigator.clipboard.writeText(toCopy)
                                  }}
                                  style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    left: '-4px',
                                    borderRadius: '6px 0 0 0',
                                    width: '16px',
                                    height: '16px',
                                    padding: 0,
                                    minWidth: '16px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.55)',
                                    color: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid rgba(255, 255, 255, 0.75)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10,
                                  }}
                                  title="Копировать ссылку"
                                >
                                  <CopyIcon
                                    width={9}
                                    height={9}
                                    style={{
                                      filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.6))',
                                    }}
                                  />
                                </Button>
                                {(() => {
                                  const unreadCount = displayCandidate.unreadSources?.[platform] ?? 0
                                  if (unreadCount === 0) return null
                                  return (
                                    <span className={styles.socialMessageBadge}>
                                      {unreadCount >= 10 ? '+' : unreadCount}
                                    </span>
                                  )
                                })()}
                              </Box>
                            )
                          })
                        })}

                        <DropdownMenu.Root open={addSocialOpen} onOpenChange={setAddSocialOpen}>
                          <DropdownMenu.Trigger>
                            <Button
                              size="1"
                              variant="soft"
                              style={{
                                borderRadius: 8,
                                width: 35,
                                height: 35,
                                backgroundColor: 'var(--gray-4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                border: '2px dashed var(--gray-6)',
                              }}
                              title="Добавить соцсеть/мессенджер"
                            >
                              <PlusIcon width={14} height={14} />
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content style={{ maxHeight: 320, overflow: 'auto' }}>
                            {(() => {
                              const MESSENGER_KEYS: SocialPlatformKey[] = [
                                'whatsapp',
                                'viber',
                                'telegram',
                                'wechat',
                                'teams',
                                'discord',
                              ]
                              const allPlatforms = Object.entries(SOCIAL_PLATFORMS) as Array<[SocialPlatformKey, typeof SOCIAL_PLATFORMS[SocialPlatformKey]]>
                              const filtered = allPlatforms.filter(([key]) => {
                                const contacts = getSocialContacts(key)
                                return contacts.length < 5
                              })
                              const messengers = filtered.filter(([key]) => MESSENGER_KEYS.includes(key))
                              const others = filtered.filter(([key]) => !MESSENGER_KEYS.includes(key))
                              
                              return (
                                <>
                                  {messengers.map(([key, cfg]) => {
                                    const contacts = getSocialContacts(key)
                                    return (
                                      <DropdownMenu.Item
                                        key={key}
                                        onSelect={() => {
                                          setAddSocialOpen(false)
                                          handleAddSocialContact(key)
                                        }}
                                        style={{ padding: 8 }}
                                      >
                                        <Flex align="center" justify="between" style={{ width: '100%' }}>
                                          <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                                            <Box style={{ color: cfg.color, display: 'flex', alignItems: 'center' }}>
                                              {cfg.icon}
                                            </Box>
                                            <Text size="2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                              {cfg.label}
                                            </Text>
                                          </Flex>
                                          <Text size="1" color="gray" style={{ flexShrink: 0 }}>
                                            {contacts.length}/5
                                          </Text>
                                        </Flex>
                                      </DropdownMenu.Item>
                                    )
                                  })}
                                  {messengers.length > 0 && others.length > 0 && (
                                    <DropdownMenu.Separator />
                                  )}
                                  {others.map(([key, cfg]) => {
                                    return (
                                      <DropdownMenu.Item
                                        key={key}
                                        onSelect={() => {
                                          setAddSocialOpen(false)
                                          handleAddSocialContact(key)
                                        }}
                                        style={{ padding: 8 }}
                                      >
                                        <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                                          <Box style={{ color: cfg.color, display: 'flex', alignItems: 'center' }}>
                                            {cfg.icon}
                                          </Box>
                                          <Text size="2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {cfg.label}
                                          </Text>
                                        </Flex>
                                      </DropdownMenu.Item>
                                    )
                                  })}
                                </>
                              )
                            })()}
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </Flex>
                      {getEmails().length === 0 && getPhones().length === 0 && (
                        <Text size="2" color="gray">Не указано</Text>
                      )}
                      </Box>
                      ) : null}
                    </Box>
                    <Dialog.Root open={addContactModalOpen} onOpenChange={setAddContactModalOpen}>
                      <Dialog.Content style={{ maxWidth: 400 }}>
                        <Dialog.Title>
                          {newContactType === 'email' ? 'Добавить email' : 'Добавить телефон'}
                        </Dialog.Title>
                        <Dialog.Description>
                          Введите новый контакт
                        </Dialog.Description>
                        <Box mt="4">
                          <TextField.Root
                            value={newContactValue}
                            onChange={(e) => setNewContactValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddContact()}
                            placeholder={newContactType === 'email' ? 'email@example.com' : '+7 (999) 123-45-67'}
                            style={{ width: '100%' }}
                          />
                        </Box>
                        <Flex gap="2" justify="end" mt="4">
                          <Dialog.Close>
                            <Button variant="soft" color="gray">Отмена</Button>
                          </Dialog.Close>
                          <Button onClick={handleAddContact} disabled={!newContactValue.trim()}>
                            Добавить
                          </Button>
                        </Flex>
                      </Dialog.Content>
                    </Dialog.Root>
                    <Box className={`${styles.candidateInfoSection} ${styles.applicationDetailsTable}`}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setInfoApplicationDetailsOpen((o) => !o)}
                        className={`${styles.candidateInfoSectionTrigger} ${infoApplicationDetailsOpen ? styles.candidateInfoSectionTriggerOpen : ''}`}
                      >
                        <Text size="3" weight="bold">
                          Application Details
                        </Text>
                        {infoApplicationDetailsOpen ? <ChevronUpIcon width={18} height={18} /> : <ChevronDownIcon width={18} height={18} />}
                      </Button>
                      {infoApplicationDetailsOpen ? (
                      <Box className={styles.candidateInfoSectionBody}>
                      <Table.Root style={{ width: '100%', tableLayout: 'fixed' }}>
                        <Table.Body>
                          <Table.Row className={styles.applicationDetailsMetaRow}>
                            <Table.Cell>
                              <Flex direction="column" gap="1">
                                <Text size="1" weight="medium">
                                  Applied
                                </Text>
                                <Text size="2" style={{ wordBreak: 'break-word' }}>
                                  {displayCandidate.applied ?? '—'}
                                </Text>
                              </Flex>
                            </Table.Cell>
                            <Table.Cell>
                              <Flex direction="column" gap="1">
                                <Text size="1" weight="medium">
                                  Updated
                                </Text>
                                <Text size="2" style={{ wordBreak: 'break-word' }}>
                                  {displayCandidate.updated ?? '—'}
                                </Text>
                              </Flex>
                            </Table.Cell>
                            <Table.Cell>
                              <Flex direction="column" gap="1">
                                <Text size="1" weight="medium">
                                  Sourced
                                </Text>
                                {isEditingSource ? (
                                  <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                    <TextField.Root
                                      value={sourceValue}
                                      onChange={(e) => setSourceValue(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSourceSave()
                                        else if (e.key === 'Escape') {
                                          setSourceValue(displayCandidate.source ?? '')
                                          setIsEditingSource(false)
                                        }
                                      }}
                                      style={{ flex: 1, minWidth: 0 }}
                                      size="1"
                                      autoFocus
                                    />
                                    <Button size="1" variant="soft" onClick={handleSourceSave} style={{ flexShrink: 0 }}>
                                      <CheckCircledIcon width={14} height={14} />
                                    </Button>
                                    <Button
                                      size="1"
                                      variant="soft"
                                      onClick={() => {
                                        setSourceValue(displayCandidate.source ?? '')
                                        setIsEditingSource(false)
                                      }}
                                      style={{ flexShrink: 0 }}
                                    >
                                      <Cross2Icon width={14} height={14} />
                                    </Button>
                                  </Flex>
                                ) : (
                                  <Flex align="center" gap="2" style={{ flexWrap: 'nowrap', minWidth: 0 }}>
                                    <Text
                                      size="2"
                                      style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        minWidth: 0,
                                      }}
                                    >
                                      {displayCandidate.source ?? '—'}
                                    </Text>
                                    <Button
                                      size="1"
                                      variant="ghost"
                                      onClick={() => {
                                        setIsEditingSource(true)
                                        setSourceValue(displayCandidate.source ?? '')
                                      }}
                                      style={{ flexShrink: 0, marginLeft: 4 }}
                                    >
                                      <Pencil1Icon width={12} height={12} />
                                    </Button>
                                  </Flex>
                                )}
                              </Flex>
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row className={styles.applicationDetailsFieldRow}>
                            <Table.Cell>
                              <Text size="2" weight="medium">
                                Position:
                              </Text>
                            </Table.Cell>
                            <Table.Cell colSpan={2}>
                              {isEditingPosition ? (
                                <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                  <TextField.Root
                                    value={positionValue}
                                    onChange={(e) => setPositionValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handlePositionSave()
                                      else if (e.key === 'Escape') {
                                        setPositionValue(displayCandidate.position ?? '')
                                        setIsEditingPosition(false)
                                      }
                                    }}
                                    style={{ flex: 1, minWidth: 0 }}
                                    size="1"
                                    autoFocus
                                  />
                                  <Button size="1" variant="soft" onClick={handlePositionSave} style={{ flexShrink: 0 }}>
                                    <CheckCircledIcon width={14} height={14} />
                                  </Button>
                                  <Button
                                    size="1"
                                    variant="soft"
                                    onClick={() => {
                                      setPositionValue(displayCandidate.position ?? '')
                                      setIsEditingPosition(false)
                                    }}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <Cross2Icon width={14} height={14} />
                                  </Button>
                                </Flex>
                              ) : (
                                <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                  <Text size="2">{displayCandidate.position ?? '—'}</Text>
                                  <Button
                                    size="1"
                                    variant="ghost"
                                    onClick={() => {
                                      setIsEditingPosition(true)
                                      setPositionValue(displayCandidate.position ?? '')
                                    }}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <Pencil1Icon width={12} height={12} />
                                  </Button>
                                </Flex>
                              )}
                            </Table.Cell>
                          </Table.Row>
                  <Table.Row className={styles.applicationDetailsFieldRow}>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                        Метки (теги):
                      </Text>
                    </Table.Cell>
                    <Table.Cell colSpan={2}>
                              {isEditingTags ? (
                                <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                  <TextField.Root
                                    value={tagsValue}
                                    onChange={(e) => setTagsValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleTagsSave()
                                      else if (e.key === 'Escape') {
                                        setTagsValue((displayCandidate.tags ?? []).join(', '))
                                        setIsEditingTags(false)
                                      }
                                    }}
                                    placeholder="Введите теги через запятую"
                                    style={{ flex: 1, minWidth: 0 }}
                                    size="1"
                                    autoFocus
                                  />
                                  <Button size="1" variant="soft" onClick={handleTagsSave} style={{ flexShrink: 0 }}>
                                    <CheckCircledIcon width={14} height={14} />
                                  </Button>
                                  <Button
                                    size="1"
                                    variant="soft"
                                    onClick={() => {
                                      setTagsValue((displayCandidate.tags ?? []).join(', '))
                                      setIsEditingTags(false)
                                    }}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <Cross2Icon width={14} height={14} />
                                  </Button>
                                </Flex>
                              ) : (
                                <Flex align="center" gap="2" wrap="wrap">
                                  {(displayCandidate.tags ?? []).map((tag, index) => (
                                    <Badge key={index} size="1" color="blue">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {(!displayCandidate.tags || displayCandidate.tags.length === 0) && (
                                    <Text size="2" color="gray">
                                      Не указано
                                    </Text>
                                  )}
                                  <Button
                                    size="1"
                                    variant="ghost"
                                    onClick={() => {
                                      setIsEditingTags(true)
                                      setTagsValue((displayCandidate.tags ?? []).join(', '))
                                    }}
                                    style={{ flexShrink: 0, marginLeft: 4 }}
                                  >
                                    <Pencil1Icon width={12} height={12} />
                                  </Button>
                                </Flex>
                              )}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row className={styles.applicationDetailsFieldRow}>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                                Уровень:
                      </Text>
                    </Table.Cell>
                    <Table.Cell colSpan={2}>
                              {isEditingLevel ? (
                                <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                  <Select.Root
                                    value={levelValue || 'Не указано'}
                                    onValueChange={setLevelValue}
                                  >
                                    <Select.Trigger style={{ flex: 1, minWidth: 0 }} />
                                    <Select.Content>
                                      {levelOptions.map((option) => (
                                        <Select.Item key={option} value={option}>
                                          {option}
                                        </Select.Item>
                                      ))}
                                      <Select.Item value="Не указано">Не указано</Select.Item>
                                    </Select.Content>
                                  </Select.Root>
                                  <Button size="1" variant="soft" onClick={handleLevelSave} style={{ flexShrink: 0 }}>
                                    <CheckCircledIcon width={14} height={14} />
                                  </Button>
                                  <Button
                                    size="1"
                                    variant="soft"
                                    onClick={() => {
                                      setLevelValue(displayCandidate.level ?? '')
                                      setIsEditingLevel(false)
                                    }}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <Cross2Icon width={14} height={14} />
                                  </Button>
                                </Flex>
                              ) : (
                                <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                  <Text size="2">{displayCandidate.level || 'Не указано'}</Text>
                                  <Button
                                    size="1"
                                    variant="ghost"
                                    onClick={() => {
                                      setIsEditingLevel(true)
                                      setLevelValue(displayCandidate.level ?? '')
                                    }}
                                    style={{ flexShrink: 0, marginLeft: 4 }}
                                  >
                                    <Pencil1Icon width={12} height={12} />
                                  </Button>
                                </Flex>
                              )}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row className={styles.applicationDetailsFieldRow}>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                                Зарплатные ожидания:
                      </Text>
                    </Table.Cell>
                    <Table.Cell colSpan={2}>
                              {isEditingSalary ? (
                                <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                  <TextField.Root
                                    value={salaryValue}
                                    onChange={(e) => setSalaryValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSalarySave()
                                      else if (e.key === 'Escape') {
                                        setSalaryValue(displayCandidate.salaryExpectations ?? '')
                                        setIsEditingSalary(false)
                                      }
                                    }}
                                    placeholder="Введите зарплатные ожидания"
                                    style={{ flex: 1, minWidth: 0 }}
                                    size="1"
                                    autoFocus
                                  />
                                  <Button size="1" variant="soft" onClick={handleSalarySave} style={{ flexShrink: 0 }}>
                                    <CheckCircledIcon width={14} height={14} />
                                  </Button>
                                  <Button
                                    size="1"
                                    variant="soft"
                                    onClick={() => {
                                      setSalaryValue(displayCandidate.salaryExpectations ?? '')
                                      setIsEditingSalary(false)
                                    }}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <Cross2Icon width={14} height={14} />
                                  </Button>
                                </Flex>
                              ) : (
                                <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                  <Text size="2">
                                    {isSalaryVisible
                                      ? (displayCandidate.salaryExpectations || 'Не указано')
                                      : '••••••••'}
                                  </Text>
                                  <Button
                                    size="1"
                                    variant="ghost"
                                    onClick={() => setIsSalaryVisible(!isSalaryVisible)}
                                    style={{ flexShrink: 0 }}
                                    title={isSalaryVisible ? 'Скрыть зарплатные ожидания' : 'Показать зарплатные ожидания'}
                                  >
                                    {isSalaryVisible ? <EyeOpenIcon width={12} height={12} /> : <EyeClosedIcon width={12} height={12} />}
                                  </Button>
                                  <Button
                                    size="1"
                                    variant="ghost"
                                    onClick={() => {
                                      setIsEditingSalary(true)
                                      setSalaryValue(displayCandidate.salaryExpectations ?? '')
                                    }}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <Pencil1Icon width={12} height={12} />
                                  </Button>
                                </Flex>
                              )}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row className={styles.applicationDetailsFieldRow}>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                                Оффер:
                      </Text>
                    </Table.Cell>
                    <Table.Cell colSpan={2}>
                              {isEditingOffer ? (
                                <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                  <TextField.Root
                                    value={offerValue}
                                    onChange={(e) => setOfferValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleOfferSave()
                                      else if (e.key === 'Escape') {
                                        setOfferValue(displayCandidate.offer ?? '')
                                        setIsEditingOffer(false)
                                      }
                                    }}
                                    placeholder="Введите сумму оффера"
                                    style={{ flex: 1, minWidth: 0 }}
                                    size="1"
                                    autoFocus
                                  />
                                  <Button size="1" variant="soft" onClick={handleOfferSave} style={{ flexShrink: 0 }}>
                                    <CheckCircledIcon width={14} height={14} />
                                  </Button>
                                  <Button
                                    size="1"
                                    variant="soft"
                                    onClick={() => {
                                      setOfferValue(displayCandidate.offer ?? '')
                                      setIsEditingOffer(false)
                                    }}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <Cross2Icon width={14} height={14} />
                                  </Button>
                                </Flex>
                              ) : (
                                <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                  <Text size="2">
                                    {isOfferVisible ? (displayCandidate.offer || 'Не указано') : '••••••••'}
                                  </Text>
                                  <Button
                                    size="1"
                                    variant="ghost"
                                    onClick={() => setIsOfferVisible(!isOfferVisible)}
                                    style={{ flexShrink: 0 }}
                                    title={isOfferVisible ? 'Скрыть оффер' : 'Показать оффер'}
                                  >
                                    {isOfferVisible ? <EyeOpenIcon width={12} height={12} /> : <EyeClosedIcon width={12} height={12} />}
                                  </Button>
                                  <Button
                                    size="1"
                                    variant="ghost"
                                    onClick={() => {
                                      setIsEditingOffer(true)
                                      setOfferValue(displayCandidate.offer ?? '')
                                    }}
                                    style={{ flexShrink: 0 }}
                                  >
                                    <Pencil1Icon width={12} height={12} />
                                  </Button>
                                </Flex>
                              )}
                    </Table.Cell>
                  </Table.Row>
                        </Table.Body>
                      </Table.Root>

                      {/* Прочие поля (коллапсом) — как в old */}
                      <Box mt="3">
                        <Button
                          variant="ghost"
                          size="2"
                          onClick={() => setShowOtherFields(!showOtherFields)}
                          style={{ width: '100%', justifyContent: 'space-between' }}
                        >
                          <Text size="2" weight="medium">
                            Прочие поля
                          </Text>
                          {showOtherFields ? (
                            <ChevronUpIcon width={16} height={16} />
                          ) : (
                            <ChevronDownIcon width={16} height={16} />
                          )}
                        </Button>
                        {showOtherFields && (
                          <Box mt="2">
                            <Table.Root>
                              <Table.Body>
                                <Table.Row>
                                  <Table.Cell>
                                    <Text size="2" weight="medium">
                                      Возраст:
                                    </Text>
                                  </Table.Cell>
                                  <Table.Cell>
                                    {isEditingAge ? (
                                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                        <TextField.Root
                                          value={ageValue}
                                          onChange={(e) => setAgeValue(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAgeSave()
                                            else if (e.key === 'Escape') {
                                              setAgeValue(displayCandidate.age?.toString() ?? '')
                                              setIsEditingAge(false)
                                            }
                                          }}
                                          placeholder="Введите возраст"
                                          style={{ flex: 1, minWidth: 0 }}
                                          size="1"
                                          autoFocus
                                        />
                                        <Button size="1" variant="soft" onClick={handleAgeSave} style={{ flexShrink: 0 }}>
                                          <CheckCircledIcon width={14} height={14} />
                                        </Button>
                                        <Button
                                          size="1"
                                          variant="soft"
                                          onClick={() => {
                                            setAgeValue(displayCandidate.age?.toString() ?? '')
                                            setIsEditingAge(false)
                                          }}
                                          style={{ flexShrink: 0 }}
                                        >
                                          <Cross2Icon width={14} height={14} />
                                        </Button>
                                      </Flex>
                                    ) : (
                                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                        <Text size="2">
                                          {displayCandidate.age != null ? `${displayCandidate.age} лет` : 'Не указано'}
                                        </Text>
                                        <Button
                                          size="1"
                                          variant="ghost"
                                          onClick={() => {
                                            setIsEditingAge(true)
                                            setAgeValue(displayCandidate.age?.toString() ?? '')
                                          }}
                                          style={{ flexShrink: 0, marginLeft: 4 }}
                                        >
                                          <Pencil1Icon width={12} height={12} />
                                        </Button>
                                      </Flex>
                                    )}
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>
                                    <Text size="2" weight="medium">
                                      Пол:
                                    </Text>
                                  </Table.Cell>
                                  <Table.Cell>
                                    {isEditingGender ? (
                                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                        <Select.Root
                                          value={genderValue || 'Не указано'}
                                          onValueChange={setGenderValue}
                                        >
                                          <Select.Trigger style={{ flex: 1, minWidth: 0 }} />
                                          <Select.Content>
                                            <Select.Item value="Мужской">Мужской</Select.Item>
                                            <Select.Item value="Женский">Женский</Select.Item>
                                            <Select.Item value="Не указано">Не указано</Select.Item>
                                          </Select.Content>
                                        </Select.Root>
                                        <Button size="1" variant="soft" onClick={handleGenderSave} style={{ flexShrink: 0 }}>
                                          <CheckCircledIcon width={14} height={14} />
                                        </Button>
                                        <Button
                                          size="1"
                                          variant="soft"
                                          onClick={() => {
                                            setGenderValue(displayCandidate.gender ?? '')
                                            setIsEditingGender(false)
                                          }}
                                          style={{ flexShrink: 0 }}
                                        >
                                          <Cross2Icon width={14} height={14} />
                                        </Button>
                                      </Flex>
                                    ) : (
                                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                        <Text size="2">{displayCandidate.gender ?? 'Не указано'}</Text>
                                        <Button
                                          size="1"
                                          variant="ghost"
                                          onClick={() => {
                                            setIsEditingGender(true)
                                            setGenderValue(displayCandidate.gender ?? '')
                                          }}
                                          style={{ flexShrink: 0, marginLeft: 4 }}
                                        >
                                          <Pencil1Icon width={12} height={12} />
                                        </Button>
                                      </Flex>
                                    )}
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>
                                    <Text size="2" weight="medium">
                                      Рейтинг:
                                    </Text>
                                  </Table.Cell>
                                  <Table.Cell>
                                    {isEditingRating ? (
                                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                        <TextField.Root
                                          value={ratingValue}
                                          onChange={(e) => setRatingValue(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleRatingSave()
                                            else if (e.key === 'Escape') {
                                              setRatingValue(displayCandidate.rating?.toString() ?? '')
                                              setIsEditingRating(false)
                                            }
                                          }}
                                          placeholder="0-5"
                                          style={{ flex: 1, minWidth: 0 }}
                                          size="1"
                                          autoFocus
                                        />
                                        <Button size="1" variant="soft" onClick={handleRatingSave} style={{ flexShrink: 0 }}>
                                          <CheckCircledIcon width={14} height={14} />
                                        </Button>
                                        <Button
                                          size="1"
                                          variant="soft"
                                          onClick={() => {
                                            setRatingValue(displayCandidate.rating?.toString() ?? '')
                                            setIsEditingRating(false)
                                          }}
                                          style={{ flexShrink: 0 }}
                                        >
                                          <Cross2Icon width={14} height={14} />
                                        </Button>
                                      </Flex>
                                    ) : (
                                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                        <Text size="2">
                                          {displayCandidate.rating != null ? `${displayCandidate.rating} / 5` : 'Не указано'}
                                        </Text>
                                        <Button
                                          size="1"
                                          variant="ghost"
                                          onClick={() => {
                                            setIsEditingRating(true)
                                            setRatingValue(displayCandidate.rating?.toString() ?? '')
                                          }}
                                          style={{ flexShrink: 0, marginLeft: 4 }}
                                        >
                                          <Pencil1Icon width={12} height={12} />
                                        </Button>
                                      </Flex>
                                    )}
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>
                                    <Text size="2" weight="medium">
                                      Локация:
                                    </Text>
                                  </Table.Cell>
                                  <Table.Cell>
                                    {isEditingLocation ? (
                                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                        <TextField.Root
                                          value={locationValue}
                                          onChange={(e) => setLocationValue(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleLocationSave()
                                            else if (e.key === 'Escape') {
                                              setLocationValue(displayCandidate.location ?? '')
                                              setIsEditingLocation(false)
                                            }
                                          }}
                                          placeholder="Введите локацию"
                                          style={{ flex: 1, minWidth: 0 }}
                                          size="1"
                                          autoFocus
                                        />
                                        <Button size="1" variant="soft" onClick={handleLocationSave} style={{ flexShrink: 0 }}>
                                          <CheckCircledIcon width={14} height={14} />
                                        </Button>
                                        <Button
                                          size="1"
                                          variant="soft"
                                          onClick={() => {
                                            setLocationValue(displayCandidate.location ?? '')
                                            setIsEditingLocation(false)
                                          }}
                                          style={{ flexShrink: 0 }}
                                        >
                                          <Cross2Icon width={14} height={14} />
                                        </Button>
                                      </Flex>
                                    ) : (
                                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                        <Text size="2">{displayCandidate.location || 'Не указано'}</Text>
                                        <Button
                                          size="1"
                                          variant="ghost"
                                          onClick={() => {
                                            setIsEditingLocation(true)
                                            setLocationValue(displayCandidate.location ?? '')
                                          }}
                                          style={{ flexShrink: 0, marginLeft: 4 }}
                                        >
                                          <Pencil1Icon width={12} height={12} />
                                        </Button>
                                      </Flex>
                                    )}
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>
                                    <Text size="2" weight="medium">
                                      Email:
                                    </Text>
                                  </Table.Cell>
                                  <Table.Cell>
                                    {isEditingOtherEmail ? (
                                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                        <TextField.Root
                                          value={otherEmailValue}
                                          onChange={(e) => setOtherEmailValue(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleOtherEmailSave()
                                            else if (e.key === 'Escape') {
                                              setOtherEmailValue(displayCandidate.email ?? '')
                                              setIsEditingOtherEmail(false)
                                            }
                                          }}
                                          placeholder="Введите email"
                                          style={{ flex: 1, minWidth: 0 }}
                                          size="1"
                                          autoFocus
                                        />
                                        <Button size="1" variant="soft" onClick={handleOtherEmailSave} style={{ flexShrink: 0 }}>
                                          <CheckCircledIcon width={14} height={14} />
                                        </Button>
                                        <Button
                                          size="1"
                                          variant="soft"
                                          onClick={() => {
                                            setOtherEmailValue(displayCandidate.email ?? '')
                                            setIsEditingOtherEmail(false)
                                          }}
                                          style={{ flexShrink: 0 }}
                                        >
                                          <Cross2Icon width={14} height={14} />
                                        </Button>
                                      </Flex>
                                    ) : (
                                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                        <Text size="2">{displayCandidate.email || 'Не указано'}</Text>
                                        <Button
                                          size="1"
                                          variant="ghost"
                                          onClick={() => {
                                            setIsEditingOtherEmail(true)
                                            setOtherEmailValue(displayCandidate.email ?? '')
                                          }}
                                          style={{ flexShrink: 0, marginLeft: 4 }}
                                        >
                                          <Pencil1Icon width={12} height={12} />
                                        </Button>
                                      </Flex>
                                    )}
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>
                                    <Text size="2" weight="medium">
                                      Телефон:
                                    </Text>
                                  </Table.Cell>
                                  <Table.Cell>
                                    {isEditingOtherPhone ? (
                                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                        <TextField.Root
                                          value={otherPhoneValue}
                                          onChange={(e) => setOtherPhoneValue(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleOtherPhoneSave()
                                            else if (e.key === 'Escape') {
                                              setOtherPhoneValue(displayCandidate.phone ?? '')
                                              setIsEditingOtherPhone(false)
                                            }
                                          }}
                                          placeholder="Введите телефон"
                                          style={{ flex: 1, minWidth: 0 }}
                                          size="1"
                                          autoFocus
                                        />
                                        <Button size="1" variant="soft" onClick={handleOtherPhoneSave} style={{ flexShrink: 0 }}>
                                          <CheckCircledIcon width={14} height={14} />
                                        </Button>
                                        <Button
                                          size="1"
                                          variant="soft"
                                          onClick={() => {
                                            setOtherPhoneValue(displayCandidate.phone ?? '')
                                            setIsEditingOtherPhone(false)
                                          }}
                                          style={{ flexShrink: 0 }}
                                        >
                                          <Cross2Icon width={14} height={14} />
                                        </Button>
                                      </Flex>
                                    ) : (
                                      <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                        <Text size="2">{displayCandidate.phone || 'Не указано'}</Text>
                                        <Button
                                          size="1"
                                          variant="ghost"
                                          onClick={() => {
                                            setIsEditingOtherPhone(true)
                                            setOtherPhoneValue(displayCandidate.phone ?? '')
                                          }}
                                          style={{ flexShrink: 0, marginLeft: 4 }}
                                        >
                                          <Pencil1Icon width={12} height={12} />
                                        </Button>
                                      </Flex>
                                    )}
                                  </Table.Cell>
                                </Table.Row>
                              </Table.Body>
                            </Table.Root>
                          </Box>
                        )}
                      </Box>
                      </Box>
                      ) : null}
                    </Box>

                    <Box className={styles.candidateInfoSection}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setInfoExperienceOpen((o) => !o)}
                        className={`${styles.candidateInfoSectionTrigger} ${infoExperienceOpen ? styles.candidateInfoSectionTriggerOpen : ''}`}
                      >
                        <Text size="3" weight="bold">
                          Опыт
                        </Text>
                        {infoExperienceOpen ? <ChevronUpIcon width={18} height={18} /> : <ChevronDownIcon width={18} height={18} />}
                      </Button>
                      <Tabs.Root
                        value={experienceResourceTab}
                        onValueChange={(v) => setExperienceResourceTab(v as 'resume' | 'profile')}
                      >
                        <Flex
                          align="center"
                          justify="between"
                          gap="2"
                          mb="2"
                          wrap="wrap"
                          width="100%"
                          className={styles.experienceTabsBar}
                        >
                          <Tabs.List className={`${styles.subTabs} ${styles.experienceTabsList}`}>
                            <Tabs.Trigger
                              value="resume"
                              className={styles.experienceTabTrigger}
                              aria-label={`Резюме, источник: ${experienceResumeTabTriggerLabel.full}`}
                            >
                              <Flex align="center" gap="2" className={styles.experienceTabTriggerInner}>
                                <Text
                                  as="span"
                                  size="2"
                                  title={experienceResumeTabTriggerLabel.full}
                                  className={styles.experienceTabTriggerTitle}
                                >
                                  {experienceResumeTabTriggerLabel.short}
                                </Text>
                              </Flex>
                            </Tabs.Trigger>
                            <Tabs.Trigger
                              value="profile"
                              className={styles.experienceTabTrigger}
                              aria-label={`Профиль кандидата, источник: ${experienceProfileTabTriggerLabel.full}`}
                            >
                              <Flex align="center" gap="2" className={styles.experienceTabTriggerInner}>
                                <Text
                                  as="span"
                                  size="2"
                                  title={experienceProfileTabTriggerLabel.full}
                                  className={styles.experienceTabTriggerTitle}
                                >
                                  {experienceProfileTabTriggerLabel.short}
                                </Text>
                              </Flex>
                            </Tabs.Trigger>
                          </Tabs.List>
                          <Flex align="center" className={styles.experienceTabsBarActions} flexShrink="0">
                            {experienceVersionTimelineDesc.length >= 2 ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="1"
                                className={styles.experienceTabsWarningBtn}
                                aria-label="Расхождения в прошлом опыте"
                                title="Расхождения в прошлом опыте"
                                onClick={() => setExperienceDiscrepancyModalOpen(true)}
                              >
                                <ExclamationTriangleIcon width={16} height={16} />
                              </Button>
                            ) : null}
                            <Popover.Root>
                              <Popover.Trigger>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="1"
                                  className={styles.experienceTabsInfoBtn}
                                  aria-label="Сведения о текущей подвкладке и версии"
                                >
                                  <InfoCircledIcon width={16} height={16} />
                                </Button>
                              </Popover.Trigger>
                              <Popover.Content size="2" style={{ maxWidth: 340 }}>
                                <Text weight="bold" mb="1" as="div">
                                  {experienceResourceTab === 'resume'
                                    ? 'Подвкладка «Резюме» (файл / источник)'
                                    : 'Подвкладка «Профиль кандидата»'}
                                </Text>
                                <Text size="2" color="gray" as="div">
                                  Источник: {experienceTabMeta?.sourceLabel ?? '—'}
                                </Text>
                                <Text size="2" mt="1" as="div">
                                  Дата обновления на источнике: {experienceTabMeta?.resumeUpdatedAt ?? '—'}
                                </Text>
                                {selectedExperienceVersion ? (
                                  <Text size="2" mt="1" as="div">
                                    Просматриваемая версия: v.{selectedExperienceVersion.version}{' '}
                                    {selectedExperienceVersion.dateDisplay}
                                    {experienceVersionSelection === null ? ' (актуальная)' : ''}
                                  </Text>
                                ) : null}
                                <Text size="1" color="gray" mt="2" style={{ lineHeight: 1.45 }} as="div">
                                  {experienceResourceTab === 'resume'
                                    ? 'Файл или выгрузка с площадки — отдельное представление резюме; может отличаться от структурированного профиля на другой подвкладке.'
                                    : 'Профиль собран из интеграции и может расходиться с файлом резюме и с другими версиями на источнике.'}
                                </Text>
                              </Popover.Content>
                            </Popover.Root>
                          </Flex>
                        </Flex>
                        <Box className={styles.experienceVersionHistoryBar} width="100%">
                          <Box
                            className={styles.experienceVersionHistoryScroll}
                            role="region"
                            aria-label="Хронология версий снимков опыта (сравнение между соседними версиями)"
                          >
                            {experienceVersionTimelineDesc.length > 0 ? (
                              <Flex align="center" gap="2" wrap="nowrap" className={styles.experienceVersionHistoryTrack}>
                                {experienceVersionTimelineDesc.map((entry, idx) => {
                                  const isActiveChip = selectedExperienceVersion?.version === entry.version
                                  const src = entry.sourceSnapshot?.trim()
                                  const ariaSrc = src ? `, источник: ${src}` : ''
                                  const sourceIcon = getExperienceSourceIcon(entry.sourceSnapshot)
                                  return (
                                    <React.Fragment key={`${entry.version}-${entry.dateDisplay}`}>
                                      {idx > 0 ? (
                                        <Text size="1" color="gray" className={styles.experienceVersionHistorySep}>
                                          ·
                                        </Text>
                                      ) : null}
                                      <button
                                        type="button"
                                        className={`${styles.experienceVersionHistoryChip} ${isActiveChip ? styles.experienceVersionHistoryChipActive : ''}`}
                                        onClick={() => handleExperienceVersionChipClick(entry.version)}
                                        aria-pressed={isActiveChip}
                                        aria-label={`Версия ${entry.version} от ${entry.dateDisplay}${ariaSrc}`}
                                      >
                                        {sourceIcon ? (
                                          <span className={styles.experienceVersionHistoryChipIcon} title={src ?? undefined}>
                                            {sourceIcon}
                                          </span>
                                        ) : null}
                                        <span className={styles.experienceVersionHistoryChipMain}>
                                          v.{entry.version} {entry.dateDisplay}
                                        </span>
                                      </button>
                                    </React.Fragment>
                                  )
                                })}
                              </Flex>
                            ) : (
                              <Box aria-hidden className={styles.experienceVersionHistoryEmpty} />
                            )}
                          </Box>
                        </Box>
                        <Dialog.Root
                          open={experienceDiscrepancyModalOpen}
                          onOpenChange={(open) => {
                            setExperienceDiscrepancyModalOpen(open)
                            if (!open) setExperienceDiscrepancyOlderPairsRevealed(0)
                          }}
                        >
                          <Dialog.Content
                            style={{
                              maxWidth: 720,
                              maxHeight: '85vh',
                              display: 'flex',
                              flexDirection: 'column',
                              padding: 0,
                            }}
                          >
                            <Box
                              style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid var(--gray-a6)',
                                flexShrink: 0,
                              }}
                            >
                              <Dialog.Title>Расхождения в прошлом опыте</Dialog.Title>
                              <Dialog.Description size="2" color="gray" mt="1">
                                Сравнение идёт между соседними версиями в хронологии снимков (v0 → v1 → …), а не между
                                подвкладками «Резюме» и «Профиль». Текст ниже — мок до API; несовпадения для ревью
                                рекрутером.
                              </Dialog.Description>
                            </Box>
                            <Box style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                              <Flex direction="column" gap="3">
                                <Text size="2" weight="bold">
                                  Пары соседних версий
                                </Text>
                                {selectedExperienceVersion ? (
                                  <Text size="1" color="gray">
                                    Выбранный снимок в таймлайне: v.{selectedExperienceVersion.version}{' '}
                                    {selectedExperienceVersion.dateDisplay}
                                    {selectedExperienceVersion.sourceSnapshot?.trim()
                                      ? ` (${selectedExperienceVersion.sourceSnapshot.trim()})`
                                      : ''}
                                  </Text>
                                ) : null}
                                {(() => {
                                  const { head, tail, usePaging } = experienceDiscrepancyPairSections
                                  const revealed = experienceDiscrepancyOlderPairsRevealed
                                  const headVisible = head.slice(0, revealed)
                                  const canRevealMore = usePaging && revealed < head.length

                                  const dateLines = [
                                    'в более новой версии период окончания позиции сдвинут относительно предыдущего снимка (мок).',
                                    'указаны разные месяцы закрытия последней позиции между соседними версиями (мок).',
                                    'промежуточная запись в опыте появилась только в более новой версии (мок).',
                                  ]
                                  const companyLines = [
                                    'название юрлица или бренда отличается от предыдущей выгрузки (мок).',
                                    '«ООО Альфа» vs «Alpha LLC» — возможная транслитерация (мок).',
                                    'совпадение по ИНН не проверено; подписи расходятся (мок).',
                                  ]
                                  const extraLines = [
                                    'Формулировка роли и стек в описании изменились по сравнению с предыдущим снимком (мок).',
                                    'Блок обязанностей дополнен относительно предыдущей версии (мок).',
                                    'В более новой версии удалена строка опыта, присутствовавшая в предыдущей (мок).',
                                  ]

                                  const pairCard = (
                                    pair: {
                                      from: CandidateExperienceVersionEntry
                                      to: CandidateExperienceVersionEntry
                                      key: string
                                    },
                                    linearIdx: number,
                                  ) => {
                                    const v = linearIdx % 3
                                    return (
                                      <Card key={pair.key} size="1" variant="surface">
                                        <Text size="2" weight="bold" mb="2">
                                          {`v.${pair.from.version} (${pair.from.dateDisplay})${
                                            pair.to.sourceSnapshot?.trim()
                                              ? ` → ${pair.to.sourceSnapshot.trim()}`
                                              : ''
                                          } → v.${pair.to.version} (${pair.to.dateDisplay})`}
                                        </Text>
                                        <Flex direction="column" gap="2">
                                          <Text size="2">
                                            <Text as="span" weight="bold" color="red">
                                              Даты:{' '}
                                            </Text>
                                            {dateLines[v]}
                                          </Text>
                                          <Text size="2">
                                            <Text as="span" weight="bold" color="red">
                                              Компания / проект:{' '}
                                            </Text>
                                            {companyLines[v]}
                                          </Text>
                                          <Text size="2">
                                            <Text as="span" weight="bold" color="gray">
                                              Прочее:{' '}
                                            </Text>
                                            {extraLines[v]}
                                          </Text>
                                        </Flex>
                                      </Card>
                                    )
                                  }

                                  if (!usePaging) {
                                    return (
                                      <>
                                        {tail.map((pair, i) => pairCard(pair, i))}
                                      </>
                                    )
                                  }

                                  return (
                                    <>
                                      {headVisible.map((pair, i) => pairCard(pair, i))}
                                      {canRevealMore ? (
                                        <Box>
                                          <Button
                                            type="button"
                                            variant="soft"
                                            color="gray"
                                            size="2"
                                            onClick={() =>
                                              setExperienceDiscrepancyOlderPairsRevealed((r) =>
                                                Math.min(r + 2, head.length),
                                              )
                                            }
                                          >
                                            Показать ещё 2 сравнения
                                          </Button>
                                          <Text size="1" color="gray" mt="1" as="div">
                                            Скрыто более ранних пар: {head.length - revealed}. Всегда видны последние три
                                            соседних сравнения по версиям.
                                          </Text>
                                        </Box>
                                      ) : null}
                                      {tail.map((pair, i) => pairCard(pair, headVisible.length + i))}
                                    </>
                                  )
                                })()}
                                <Text size="1" color="gray" style={{ lineHeight: 1.5 }}>
                                  После подключения API несовпадения будут подтягиваться автоматически; сейчас текст
                                  демонстрационный и зависит от пары версий.
                                </Text>
                              </Flex>
                            </Box>
                            <Flex justify="end" gap="2" p="4" style={{ borderTop: '1px solid var(--gray-a6)' }}>
                              <Dialog.Close>
                                <Button variant="solid">Понятно</Button>
                              </Dialog.Close>
                            </Flex>
                          </Dialog.Content>
                        </Dialog.Root>
                        <Box
                          className={styles.candidateInfoSectionBody}
                          style={{ display: infoExperienceOpen ? 'block' : 'none' }}
                        >
                          <Tabs.Content value="resume">
                            <Flex direction="column" gap="3">
                              <Box className={styles.resumeProfileTopBar}>
                                <Flex className={styles.resumeProfileTopBarHeader}>
                                  <Flex align="center" gap="3" wrap="wrap" style={{ flex: '1 1 240px', minWidth: 0 }}>
                                    <button
                                      type="button"
                                      className={styles.resumeProfileOriginalToggle}
                                      onClick={() => setResumeFileTabPreviewOpen((v) => !v)}
                                      aria-expanded={resumeFileTabPreviewOpen}
                                      aria-controls="resume-file-tab-preview"
                                    >
                                      {resumeFileTabPreviewOpen ? 'Скрыть оригинал PDF' : 'Отображать оригинал PDF'}
                                    </button>
                                  </Flex>
                                  <Flex className={styles.resumeProfileToolbarActionsWrap}>
                                    {experienceResumeTabMeta &&
                                    isExternalRecruitingRefreshSource(experienceResumeTabMeta.sourceLabel) ? (
                                      <Button
                                        size="1"
                                        variant="solid"
                                        color="violet"
                                        type="button"
                                        className={`${styles.resumeToolbarIconBtn} ${styles.resumeProfileToolbarEditBtn}`}
                                        title="Обновить с источника"
                                        aria-label="Обновить с источника"
                                        onClick={handleExperienceSourceRefresh}
                                      >
                                        <ReloadIcon width={14} height={14} />
                                      </Button>
                                    ) : (
                                      <Button
                                        size="1"
                                        variant="solid"
                                        color="violet"
                                        type="button"
                                        className={`${styles.resumeToolbarIconBtn} ${styles.resumeProfileToolbarEditBtn}`}
                                        title="Редактировать вложение"
                                        aria-label="Редактировать вложение"
                                        onClick={() =>
                                          showInfo('Редактирование', 'Подключится к API хранилища и редактору вложений.')
                                        }
                                      >
                                        <Pencil1Icon width={14} height={14} />
                                      </Button>
                                    )}
                                    <Flex align="center" gap="2" className={styles.resumeProfileToolbarActionsGroup}>
                                      <Button
                                        size="1"
                                        variant="soft"
                                        color="violet"
                                        type="button"
                                        className={styles.resumeProfileToolbarOpenBtn}
                                        title="Открыть в новой вкладке"
                                        aria-label="Открыть в новой вкладке"
                                      >
                                        <OpenInNewWindowIcon width={14} height={14} />
                                      </Button>
                                      <Button
                                        size="1"
                                        variant="solid"
                                        color="violet"
                                        type="button"
                                        className={styles.resumeProfileToolbarPdfBtn}
                                        title="Скачать PDF"
                                        aria-label="Скачать PDF"
                                      >
                                        <Flex align="center" gap="2" justify="center">
                                          <ArrowDownIcon width={14} height={14} />
                                          <Text size="1" weight="medium">
                                            PDF
                                          </Text>
                                        </Flex>
                                      </Button>
                                    </Flex>
                                  </Flex>
                                </Flex>
                                <Box
                                  id="resume-file-tab-preview"
                                  className={styles.resumeProfilePreviewPane}
                                  style={{ display: resumeFileTabPreviewOpen ? 'block' : 'none' }}
                                >
                                  <Box className={styles.resumeProfilePreviewFrame}>
                                    <Badge
                                      size="1"
                                      variant="soft"
                                      color="gray"
                                      className={styles.resumeProfilePreviewKindBadge}
                                    >
                                      {getResumeAttachmentFormatLabel(displayCandidate.resumeFileName ?? 'resume.pdf')}
                                    </Badge>
                                    <Box className={styles.resumeProfilePreviewFrameBody}>
                                      <ReaderIcon
                                        className={styles.resumeProfilePreviewFrameIcon}
                                        width={28}
                                        height={28}
                                        aria-hidden
                                      />
                                      <Text
                                        size="2"
                                        weight="medium"
                                        style={{ width: '100%', wordBreak: 'break-word', lineHeight: 1.35 }}
                                      >
                                        {displayCandidate.resumeFileName ?? 'resume.pdf'}
                                      </Text>
                                      <Text size="1" color="gray" style={{ lineHeight: 1.45, width: '100%' }}>
                                        Вкладка «Файл» — только вложение resume.pdf. Просмотр PDF, Word, PowerPoint и
                                        изображений подключится к хранилищу. Отдельно планируется превью «как на
                                        источнике» (джоб-сайты, соцсети, портфолио) — список источников в продуктовом
                                        бэклоге. Сейчас — макет области превью.
                                      </Text>
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            </Flex>
                          </Tabs.Content>
                          <Tabs.Content value="profile">
                            <Flex direction="column" gap="3">
                              <Box className={styles.resumeProfileTopBar}>
                                <Flex className={styles.resumeProfileTopBarHeader}>
                                  <Flex align="center" gap="3" wrap="wrap" style={{ flex: '1 1 240px', minWidth: 0 }}>
                                    <button
                                      type="button"
                                      className={styles.resumeProfileOriginalToggle}
                                      onClick={() => setResumeAttachmentPreviewOpen((v) => !v)}
                                      aria-expanded={resumeAttachmentPreviewOpen}
                                      aria-controls="resume-attachment-preview"
                                    >
                                      {resumeAttachmentPreviewOpen ? 'Скрыть оригинал' : 'Отображать оригинал'}
                                    </button>
                                  </Flex>
                                  <Flex className={styles.resumeProfileToolbarActionsWrap}>
                                    {experienceProfileTabMeta &&
                                    isExternalRecruitingRefreshSource(experienceProfileTabMeta.sourceLabel) ? (
                                      <Button
                                        size="1"
                                        variant="solid"
                                        color="violet"
                                        type="button"
                                        className={`${styles.resumeToolbarIconBtn} ${styles.resumeProfileToolbarEditBtn}`}
                                        title="Обновить с источника"
                                        aria-label="Обновить с источника"
                                        onClick={handleExperienceSourceRefresh}
                                      >
                                        <ReloadIcon width={14} height={14} />
                                      </Button>
                                    ) : (
                                      <Button
                                        size="1"
                                        variant="solid"
                                        color="violet"
                                        type="button"
                                        className={`${styles.resumeToolbarIconBtn} ${styles.resumeProfileToolbarEditBtn}`}
                                        title="Редактировать вложение"
                                        aria-label="Редактировать вложение"
                                        onClick={() =>
                                          showInfo('Редактирование', 'Подключится к API хранилища и редактору вложений.')
                                        }
                                      >
                                        <Pencil1Icon width={14} height={14} />
                                      </Button>
                                    )}
                                    <Flex align="center" gap="2" className={styles.resumeProfileToolbarActionsGroup}>
                                      <Button
                                        size="1"
                                        variant="soft"
                                        color="violet"
                                        type="button"
                                        className={styles.resumeProfileToolbarOpenBtn}
                                        title="Открыть в новой вкладке"
                                        aria-label="Открыть в новой вкладке"
                                      >
                                        <OpenInNewWindowIcon width={14} height={14} />
                                      </Button>
                                      <Button
                                        size="1"
                                        variant="solid"
                                        color="violet"
                                        type="button"
                                        className={styles.resumeProfileToolbarPdfBtn}
                                        title="Скачать PDF"
                                        aria-label="Скачать PDF"
                                      >
                                        <Flex align="center" gap="2" justify="center">
                                          <ArrowDownIcon width={14} height={14} />
                                          <Text size="1" weight="medium">
                                            PDF
                                          </Text>
                                        </Flex>
                                      </Button>
                                    </Flex>
                                  </Flex>
                                </Flex>
                                <Box
                                  id="resume-attachment-preview"
                                  className={styles.resumeProfilePreviewPane}
                                  style={{ display: resumeAttachmentPreviewOpen ? 'block' : 'none' }}
                                >
                                  <Box className={styles.resumeProfilePreviewFrame}>
                                    <Badge
                                      size="1"
                                      variant="soft"
                                      color="gray"
                                      className={styles.resumeProfilePreviewKindBadge}
                                    >
                                      {getResumeAttachmentFormatLabel(
                                        displayCandidate.resumeFileName ?? 'resume.pdf',
                                      )}
                                    </Badge>
                                    <Box className={styles.resumeProfilePreviewFrameBody}>
                                      <ReaderIcon
                                        className={styles.resumeProfilePreviewFrameIcon}
                                        width={28}
                                        height={28}
                                        aria-hidden
                                      />
                                      <Text
                                        size="2"
                                        weight="medium"
                                        style={{ width: '100%', wordBreak: 'break-word', lineHeight: 1.35 }}
                                      >
                                        {displayCandidate.resumeFileName ?? 'resume.pdf'}
                                      </Text>
                                      <Text size="1" color="gray" style={{ lineHeight: 1.45, width: '100%' }}>
                                        Просмотр PDF, Word, PowerPoint и изображений подключится к хранилищу. Превью в
                                        стиле внешнего источника (профиль как на HH, LinkedIn и т.д.) — по очереди
                                        источников из бэклога. Сейчас — макет области превью.
                                      </Text>
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                              <CandidateResumeProfileView
                                profile={getCandidateResumeProfile(displayCandidate)}
                                currentRoleLine={`${displayCandidate.position ?? displayCandidate.vacancy ?? '—'}${
                                  displayCandidate.level ? ` · ${displayCandidate.level}` : ''
                                }`}
                              />
                            </Flex>
                          </Tabs.Content>
                        </Box>
                      </Tabs.Root>
                    </Box>
                  </Flex>
                </Tabs.Content>

                <Tabs.Content value="activity">
                  <Text size="3" weight="bold" mb="2" style={{ display: 'block' }}>
                    Активность
                  </Text>
                  <Text size="2" color="gray" mb="4" style={{ display: 'block', lineHeight: 1.5 }}>
                    Переходы по воронке и комментарии к заявке. Текст комментария показывается так, как его ввели
                    (переносы строк, звёздочки и теги из панели статуса не преобразуются — сырой ввод).
                  </Text>
                  <div className={styles.candidateActivityFeed}>
                    {candidateActivityEntries.length === 0 ? (
                      <Text size="2" color="gray">
                        Пока нет записей. Подтвердите статус с комментарием или дождитесь событий из мока.
                      </Text>
                    ) : (
                      candidateActivityEntries.map((entry) => (
                        <Box key={entry.id} className={styles.candidateActivityEntry}>
                          <div className={styles.candidateActivityEntryMeta}>
                            <Text size="2" weight="bold">
                              {getAtsActivityEntryHeadline(entry)}
                            </Text>
                            <Text size="1" color="gray">
                              {formatAtsActivityTimestamp(entry.atIso)} · {entry.authorLabel}
                            </Text>
                          </div>
                          {entry.kind === 'resume_added' && entry.title ? (
                            <Text size="2" weight="medium" style={{ display: 'block', marginTop: 4 }}>
                              {entry.title}
                            </Text>
                          ) : null}
                          {entry.kind === 'system' && entry.title ? (
                            <Text size="2" weight="medium" style={{ display: 'block', marginTop: 4 }}>
                              {entry.title}
                            </Text>
                          ) : null}
                          {(entry.kind === 'resume_added' || entry.kind === 'system') && entry.subtitle ? (
                            <Text size="2" color="gray" style={{ display: 'block', marginTop: 4 }}>
                              {entry.subtitle}
                            </Text>
                          ) : null}
                          {entry.kind === 'status_transition' && entry.fromStatus && entry.toStatus ? (
                            <Flex align="center" gap="2" wrap="wrap" className={styles.candidateActivityStatusArrow} mt="2">
                              <Badge
                                size="1"
                                style={{
                                  backgroundColor: getStatusColor(entry.fromStatus),
                                  color: 'white',
                                }}
                              >
                                {entry.fromStatus}
                              </Badge>
                              <Text size="2" weight="bold">
                                →
                              </Text>
                              <Badge
                                size="1"
                                style={{
                                  backgroundColor: getStatusColor(entry.toStatus),
                                  color: 'white',
                                }}
                              >
                                {entry.toStatus}
                              </Badge>
                            </Flex>
                          ) : null}
                          {entry.rejectionReason ? (
                            <Text size="2" color="ruby" style={{ display: 'block', marginTop: 8 }}>
                              Причина отказа: {entry.rejectionReason}
                            </Text>
                          ) : null}
                          {entry.kind === 'status_transition' && entry.subtitle ? (
                            <Text size="2" color="gray" style={{ display: 'block', marginTop: 6 }}>
                              {entry.subtitle}
                            </Text>
                          ) : null}
                          {entry.commentRaw ? (
                            <div className={styles.candidateActivityCommentRaw}>{entry.commentRaw}</div>
                          ) : null}
                        </Box>
                      ))
                    )}
                  </div>
                </Tabs.Content>
                <Tabs.Content value="ratings">
                  {(() => {
                    const candidateRatings = selected ? (MOCK_RATINGS[selected.id] ?? []) : []
                    const avgScore = candidateRatings.length > 0 
                      ? (candidateRatings.reduce((sum, r) => sum + r.score, 0) / candidateRatings.length).toFixed(1) 
                      : null

                    const getStageColor = (stage: string): 'green' | 'blue' | 'purple' | 'orange' => {
                      if (stage.includes('HR')) return 'green'
                      if (stage.includes('Tech')) return 'blue'
                      if (stage.includes('Final')) return 'purple'
                      return 'orange'
                    }

                    return (
                      <Flex direction="column" gap="4">
                        <Box>
                          <Text size="3" weight="bold" mb="2" style={{ display: 'block' }}>
                            Оценки по матрице компетенций
                          </Text>
                          <Text size="2" color="gray" mb="3">
                            Оценка проводится по навыкам из конфигуратора специализаций.
                          </Text>
                          <Flex gap="2" mb="3">
                            <Button size="1" variant="soft" onClick={() => {}}>
                              <GlobeIcon width={14} height={14} />
                              Открыть матрицу специализации (Frontend)
                            </Button>
                            <Button size="1" variant="solid" onClick={() => setNewRatingDialogOpen(true)}>
                              <PlusIcon width={14} height={14} />
                              Провести новую оценку
                            </Button>
                          </Flex>
                        </Box>

                        <Card size="1">
                          <Text size="2" weight="bold" mb="3" style={{ display: 'block' }}>
                            История оценок
                          </Text>
                          {candidateRatings.length === 0 ? (
                            <Text size="2" color="gray">Пока нет оценок для этого кандидата.</Text>
                          ) : (
                            <Flex direction="column" gap="3">
                              {candidateRatings.map((rating) => {
                                const color = getStageColor(rating.stage)

                                return (
                                  <Box
                                    key={rating.id}
                                    style={{
                                      padding: 12,
                                      border: `1px solid var(--${color}-6)`,
                                      borderRadius: 8,
                                      backgroundColor: `var(--${color}-2)`,
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => {
                                      setSelectedRating(rating)
                                      setRatingDetailOpen(true)
                                    }}
                                  >
                                    <Flex justify="between" align="center">
                                      <Flex direction="column" gap="1">
                                        <Text size="2" weight="medium">{rating.stage}</Text>
                                        <Text size="1" color="gray">{rating.date} · {rating.interviewer}</Text>
                                      </Flex>
                                      <Badge size="1" color={color}>{rating.score} / {rating.maxScore}</Badge>
                                    </Flex>
                                  </Box>
                                )
                              })}
                            </Flex>
                          )}
                        </Card>

                        {candidateRatings.length > 0 && avgScore && (
                          <Card size="1">
                            <Text size="2" weight="bold" mb="3" style={{ display: 'block' }}>
                              Итоговая оценка
                            </Text>
                            <Flex align="center" gap="3">
                              <Box style={{ 
                                width: 60, 
                                height: 60, 
                                borderRadius: '50%', 
                                background: 'linear-gradient(135deg, var(--green-9), var(--blue-9))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Text size="4" weight="bold" style={{ color: 'white' }}>{avgScore}</Text>
                              </Box>
                              <Flex direction="column">
                                <Text size="2" weight="medium">Средний балл по всем этапам</Text>
                                <Text size="1" color="gray">
                                  {candidateRatings.length} {candidateRatings.length === 1 ? 'оценка' : candidateRatings.length < 5 ? 'оценки' : 'оценок'} · Рекомендация: {parseFloat(avgScore) >= 4 ? 'Нанять' : parseFloat(avgScore) >= 3 ? 'Рассмотреть' : 'Отказ'}
                                </Text>
                              </Flex>
                            </Flex>
                          </Card>
                        )}
                      </Flex>
                    )
                  })()}
                </Tabs.Content>
                <Tabs.Content value="documents">
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                    Документы
                  </Text>
                  <Flex direction="column" gap="2">
                    <Box style={{ padding: 12, border: '1px solid var(--gray-a6)', borderRadius: 6, backgroundColor: 'var(--gray-2)' }}>
                      <Text size="2" weight="medium">resume.pdf</Text>
                      <Text size="1" color="gray">Резюме · загружено при отклике</Text>
                    </Box>
                  </Flex>
                </Tabs.Content>
                <Tabs.Content value="history">
                  <Text size="3" weight="bold" mb="2" style={{ display: 'block' }}>
                    Журнал действий (аудит)
                  </Text>
                  <Text size="2" color="gray" mb="4" style={{ display: 'block', lineHeight: 1.55 }}>
                    Подробный лог операций по заявке: кто, когда, какие поля менялись, сырой комментарий. Для шагов
                    «Подтвердить» с изменением статуса или полей Offer доступна отмена — восстанавливается снимок до
                    нажатия (локальный мок). Исторические записи из сидов без отката помечены отсутствием кнопки.
                  </Text>
                  <div className={styles.candidateHistoryFeed}>
                    {candidateAuditEntries.length === 0 ? (
                      <Text size="2" color="gray">
                        Записей аудита нет.
                      </Text>
                    ) : (
                      candidateAuditEntries.map((entry) => (
                        <Box key={entry.id} className={styles.candidateHistoryEntry}>
                          <Flex justify="between" align="start" gap="3" wrap="wrap">
                            <Box style={{ flex: '1 1 200px', minWidth: 0 }}>
                              <Text size="2" weight="bold" style={{ display: 'block' }}>
                                {entry.summary}
                              </Text>
                              <Text size="1" color="gray" style={{ display: 'block', marginTop: 4 }}>
                                {formatAtsActivityTimestamp(entry.atIso)} · {entry.authorLabel}
                              </Text>
                            </Box>
                            <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
                              {entry.undone ? (
                                <Badge size="1" color="gray" variant="soft">
                                  Отменено
                                </Badge>
                              ) : null}
                              {entry.revert && !entry.undone ? (
                                <Button size="1" variant="soft" color="orange" onClick={() => handleAuditUndo(entry.id)}>
                                  Отменить действие
                                </Button>
                              ) : null}
                            </Flex>
                          </Flex>
                          <div className={styles.candidateHistoryDetail}>{entry.detail}</div>
                        </Box>
                      ))
                    )}
                  </div>
                  <Text size="2" color="gray" mt="4" style={{ display: 'block' }}>
                    Переписка во вкладке Chat; пользовательская лента без технических полей — во вкладке Activity.
                  </Text>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
              </Flex>
            </Box>
          </Card>
        ) : (
          <Card className={styles.candidateCard}>
            <Box className={styles.candidateCardScroll}>
              <Box className={styles.candidateCardScrollBody}>
                <Text size="2" color="gray">
                  Выберите кандидата из списка.
                </Text>
              </Box>
            </Box>
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

      <Dialog.Root open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <Dialog.Content style={{ maxWidth: 600, maxHeight: '80vh' }}>
          <Dialog.Title>Фото кандидата</Dialog.Title>
          <Dialog.Description size="2" color="gray">
            Загрузите новое фото или просмотрите существующие
          </Dialog.Description>
          <Flex direction="column" gap="4" pt="4">
            <Card size="1">
              <Text size="2" weight="medium" mb="3" style={{ display: 'block' }}>
                Загрузить новое фото
              </Text>
              <Flex direction="column" gap="3">
                <Box
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                    borderRadius: 8,
                    border: isDragging ? '2px solid var(--accent-11)' : '2px dashed var(--accent-9)',
                    backgroundColor: isDragging ? 'var(--accent-4)' : 'var(--accent-2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                  }}
                  onClick={() => photoInputRef.current?.click()}
                >
                  <PlusIcon width={24} height={24} style={{ color: isDragging ? 'var(--accent-11)' : 'var(--accent-9)', marginBottom: 8 }} />
                  <Text size="2" weight="medium" style={{ color: 'var(--accent-11)' }}>
                    {isDragging ? 'Отпустите файл для загрузки' : 'Нажмите или перетащите файл сюда'}
                  </Text>
                  <Text size="1" color="gray" mt="1">
                    PNG, JPG, GIF до 10MB
                  </Text>
                </Box>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileInputChange}
                />
              </Flex>
            </Card>

            {candidatePhotos.length > 0 && (
              <Card size="1">
                <Text size="2" weight="medium" mb="3" style={{ display: 'block' }}>
                  Загруженные фото
                </Text>
                <Flex direction="column" gap="3">
                  <Box>
                    <Flex align="center" gap="2" wrap="wrap">
                      {candidatePhotos.map((photo, index) => (
                        <Box
                          key={index}
                          onClick={() => handlePhotoSelect(index)}
                          style={{
                            position: 'relative',
                            width: index === currentPhotoIndex ? 150 : 100,
                            height: index === currentPhotoIndex ? 150 : 100,
                            borderRadius: 8,
                            overflow: 'hidden',
                            border: index === currentPhotoIndex ? '3px solid var(--accent-9)' : '2px solid var(--gray-6)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={photo.url}
                            alt={`Фото ${index + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          {index === currentPhotoIndex && (
                            <Badge
                              size="1"
                              color="green"
                              style={{
                                position: 'absolute',
                                top: 4,
                                left: 4,
                              }}
                            >
                              Текущее
                            </Badge>
                          )}
                          <Badge
                            size="1"
                            color="gray"
                            style={{
                              position: 'absolute',
                              bottom: 4,
                              left: 4,
                              fontSize: 9,
                            }}
                          >
                            {photo.date}
                          </Badge>
                          <Button
                            size="1"
                            variant="solid"
                            color="red"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePhotoDelete(index)
                            }}
                            style={{
                              position: 'absolute',
                              bottom: 4,
                              right: 4,
                              width: 22,
                              height: 22,
                              padding: 0,
                              minWidth: 22,
                              borderRadius: 4,
                            }}
                            title="Удалить фото"
                          >
                            <TrashIcon width={12} height={12} />
                          </Button>
                        </Box>
                      ))}
                    </Flex>
                  </Box>
                </Flex>
              </Card>
            )}
          </Flex>
          <Flex gap="3" justify="end" mt="4">
            <Button variant="soft" onClick={() => setPhotoDialogOpen(false)}>
              Закрыть
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Модальное окно детальной оценки */}
      <Dialog.Root open={ratingDetailOpen} onOpenChange={setRatingDetailOpen}>
        <Dialog.Content style={{ maxWidth: 700, maxHeight: '85vh', overflow: 'auto' }}>
          <Dialog.Title>
            {selectedRating?.stage} — Детальная оценка
          </Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            {selectedRating?.date} · Интервьюер: {selectedRating?.interviewer}
          </Dialog.Description>

          {selectedRating && (
            <Flex direction="column" gap="4">
              {/* Метаданные */}
              {selectedRating.metadata && (
                <Card size="1">
                  <Flex gap="4" wrap="wrap">
                    {selectedRating.metadata.duration && (
                      <Flex direction="column">
                        <Text size="1" color="gray">Длительность</Text>
                        <Text size="2" weight="medium">{selectedRating.metadata.duration}</Text>
                      </Flex>
                    )}
                    {selectedRating.metadata.format && (
                      <Flex direction="column">
                        <Text size="1" color="gray">Формат</Text>
                        <Text size="2" weight="medium">{selectedRating.metadata.format}</Text>
                      </Flex>
                    )}
                    {selectedRating.metadata.location && (
                      <Flex direction="column">
                        <Text size="1" color="gray">Место</Text>
                        <Text size="2" weight="medium">{selectedRating.metadata.location}</Text>
                      </Flex>
                    )}
                  </Flex>
                </Card>
              )}

              {/* Общая оценка и навыки */}
              <Card size="1">
                <Flex justify="between" align="center" mb="3">
                  <Text size="2" weight="bold">Общая оценка</Text>
                  <Badge size="2" color="green">{selectedRating.score} / {selectedRating.maxScore}</Badge>
                </Flex>
                <Flex direction="column" gap="2">
                  {selectedRating.skills.map((skill) => (
                    <Flex key={skill.name} justify="between" align="center">
                      <Text size="2">{skill.name}</Text>
                      <Flex align="center" gap="2">
                        <Box style={{ width: 100, height: 6, backgroundColor: 'var(--gray-4)', borderRadius: 3 }}>
                          <Box style={{ width: `${(skill.score / 5) * 100}%`, height: '100%', backgroundColor: 'var(--accent-9)', borderRadius: 3 }} />
                        </Box>
                        <Text size="2" weight="medium" style={{ minWidth: 20, textAlign: 'right' }}>{skill.score}</Text>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              </Card>

              {/* Вопросы и ответы */}
              {selectedRating.questions && selectedRating.questions.length > 0 && (
                <Card size="1">
                  <Text size="2" weight="bold" mb="3" style={{ display: 'block' }}>Вопросы и ответы</Text>
                  <Flex direction="column" gap="3">
                    {selectedRating.questions.map((q) => (
                      <Box key={q.id} style={{ padding: 12, backgroundColor: 'var(--gray-2)', borderRadius: 6, border: '1px solid var(--gray-a4)' }}>
                        <Flex justify="between" align="start" mb="2">
                          <Text size="2" weight="medium" style={{ flex: 1 }}>{q.question}</Text>
                          <Badge size="1" color={q.score >= 4 ? 'green' : q.score >= 3 ? 'orange' : 'red'}>{q.score}/{q.maxScore}</Badge>
                        </Flex>
                        <Text size="2" color="gray" style={{ display: 'block', marginBottom: q.comment || q.literatureLinks ? 8 : 0 }}>
                          {q.answer}
                        </Text>
                        {q.comment && (
                          <Text size="1" style={{ display: 'block', fontStyle: 'italic', color: 'var(--accent-11)', marginTop: 4 }}>
                            Комментарий: {q.comment}
                          </Text>
                        )}
                        {q.literatureLinks && q.literatureLinks.length > 0 && (
                          <Flex gap="2" mt="2" wrap="wrap">
                            {q.literatureLinks.map((link, i) => (
                              <Badge key={i} size="1" color="blue" style={{ cursor: 'pointer' }}>
                                <GlobeIcon width={10} height={10} />
                                {link.title}
                              </Badge>
                            ))}
                          </Flex>
                        )}
                      </Box>
                    ))}
                  </Flex>
                </Card>
              )}

              {/* Фидбек */}
              {selectedRating.feedback && (
                <Card size="1">
                  <Text size="2" weight="bold" mb="2" style={{ display: 'block' }}>Итоговый фидбек</Text>
                  <Text size="2" style={{ display: 'block', padding: 12, backgroundColor: 'var(--green-2)', borderRadius: 6, border: '1px solid var(--green-6)' }}>
                    {selectedRating.feedback}
                  </Text>
                </Card>
              )}

              {/* Комментарии */}
              {selectedRating.comments && selectedRating.comments.length > 0 && (
                <Card size="1">
                  <Text size="2" weight="bold" mb="3" style={{ display: 'block' }}>Комментарии</Text>
                  <Flex direction="column" gap="2">
                    {selectedRating.comments.map((comment, i) => (
                      <Flex key={i} gap="2" style={{ padding: 8, backgroundColor: 'var(--gray-2)', borderRadius: 4 }}>
                        <Avatar size="1" fallback={comment.author[0]} />
                        <Flex direction="column" style={{ flex: 1 }}>
                          <Flex justify="between">
                            <Text size="1" weight="medium">{comment.author}</Text>
                            <Text size="1" color="gray">{comment.date}</Text>
                          </Flex>
                          <Text size="2">{comment.text}</Text>
                        </Flex>
                      </Flex>
                    ))}
                  </Flex>
                </Card>
              )}

              {/* Скриншоты */}
              {selectedRating.screenshots && selectedRating.screenshots.length > 0 && (
                <Card size="1">
                  <Text size="2" weight="bold" mb="3" style={{ display: 'block' }}>Скриншоты</Text>
                  <Flex gap="2" wrap="wrap">
                    {selectedRating.screenshots.map((screenshot, i) => (
                      <Box key={i} style={{ width: 150, position: 'relative' }}>
                        <Box
                          style={{
                            width: '100%',
                            height: 100,
                            backgroundColor: 'var(--gray-4)',
                            borderRadius: 6,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text size="1" color="gray">[Скриншот]</Text>
                        </Box>
                        {screenshot.caption && (
                          <Text size="1" color="gray" style={{ display: 'block', marginTop: 4 }}>{screenshot.caption}</Text>
                        )}
                      </Box>
                    ))}
                  </Flex>
                </Card>
              )}
            </Flex>
          )}

          <Flex gap="3" justify="end" mt="4">
            <Button variant="soft" onClick={() => setRatingDetailOpen(false)}>
              Закрыть
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {/* Диалог проведения новой оценки */}
      <Dialog.Root open={newRatingDialogOpen} onOpenChange={(open) => {
        setNewRatingDialogOpen(open)
        if (!open) {
          setRatingScores({})
          setRatingComments({})
          setRatingFiles({})
          setSelectedInterviewer('')
          setGeneralFeedback('')
        }
      }}>
        <Dialog.Content style={{ maxWidth: 700, maxHeight: '85vh', overflow: 'auto' }}>
          <Dialog.Title>Провести новую оценку</Dialog.Title>
          <Dialog.Description size="2" color="gray" mb="4">
            Заполните оценку кандидата {selected?.name}
          </Dialog.Description>

          <Flex direction="column" gap="4">
            <Flex gap="3">
              <Box style={{ flex: 1 }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Этап оценки</Text>
                <TextField.Root 
                  value={displayCandidate?.status ?? ''} 
                  readOnly 
                  style={{ backgroundColor: 'var(--gray-3)' }}
                />
              </Box>
              <Box style={{ flex: 1 }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Дата проведения</Text>
                <TextField.Root 
                  value={new Date().toLocaleDateString('ru-RU')} 
                  readOnly 
                  style={{ backgroundColor: 'var(--gray-3)' }}
                />
              </Box>
            </Flex>

            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Интервьюер</Text>
              <Select.Root value={selectedInterviewer} onValueChange={setSelectedInterviewer}>
                <Select.Trigger placeholder="Выберите интервьюера" style={{ width: '100%' }} />
                <Select.Content>
                  <Select.Item value="Иван Петров">Иван Петров</Select.Item>
                  <Select.Item value="Мария Козлова">Мария Козлова</Select.Item>
                  <Select.Item value="Алексей Смирнов">Алексей Смирнов</Select.Item>
                  <Select.Item value="Дмитрий Волков">Дмитрий Волков</Select.Item>
                  <Select.Item value="CTO">CTO</Select.Item>
                  <Select.Item value="Team Lead">Team Lead</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box>
              <Text size="2" weight="bold" mb="3" style={{ display: 'block' }}>Матрица компетенций</Text>
              <Flex direction="column" gap="4">
                {['Коммуникация', 'Технические навыки', 'Решение проблем', 'Командная работа'].map((skill) => (
                  <Card key={skill} size="1" style={{ padding: 12 }}>
                    <Flex direction="column" gap="2">
                      <Flex justify="between" align="center">
                        <Text size="2" weight="medium">{skill}</Text>
                        <Flex gap="1">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <Button 
                              key={score} 
                              size="1" 
                              variant={ratingScores[skill] === score ? 'solid' : 'soft'}
                              color={ratingScores[skill] === score ? 'green' : undefined}
                              style={{ minWidth: 28, padding: '0 8px' }}
                              onClick={() => setRatingScores((prev) => ({ ...prev, [skill]: score }))}
                            >
                              {score}
                            </Button>
                          ))}
                        </Flex>
                      </Flex>
                      <TextField.Root 
                        placeholder="Комментарий к оценке..."
                        value={ratingComments[skill] ?? ''}
                        onChange={(e) => setRatingComments((prev) => ({ ...prev, [skill]: e.target.value }))}
                        size="1"
                      />
                      <Flex align="center" gap="2">
                        <Text size="1" color="gray">Файлы ({(ratingFiles[skill] ?? []).length}/3):</Text>
                        <input
                          type="file"
                          id={`file-${skill}`}
                          style={{ display: 'none' }}
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={(e) => {
                            const files = Array.from(e.target.files ?? [])
                            const currentFiles = ratingFiles[skill] ?? []
                            const newFiles = [...currentFiles, ...files].slice(0, 3)
                            setRatingFiles((prev) => ({ ...prev, [skill]: newFiles }))
                            e.target.value = ''
                          }}
                        />
                        <Button 
                          size="1" 
                          variant="ghost" 
                          disabled={(ratingFiles[skill] ?? []).length >= 3}
                          onClick={() => document.getElementById(`file-${skill}`)?.click()}
                        >
                          <PlusIcon width={12} height={12} />
                          Добавить
                        </Button>
                        {(ratingFiles[skill] ?? []).map((file, i) => (
                          <Badge key={i} size="1" color="gray">
                            {file.name.slice(0, 15)}...
                            <Cross2Icon 
                              width={10} 
                              height={10} 
                              style={{ marginLeft: 4, cursor: 'pointer' }}
                              onClick={() => {
                                setRatingFiles((prev) => ({
                                  ...prev,
                                  [skill]: (prev[skill] ?? []).filter((_, idx) => idx !== i)
                                }))
                              }}
                            />
                          </Badge>
                        ))}
                      </Flex>
                    </Flex>
                  </Card>
                ))}
              </Flex>
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>Общий фидбек</Text>
              <TextField.Root 
                placeholder="Введите ваши наблюдения и рекомендации..." 
                value={generalFeedback}
                onChange={(e) => setGeneralFeedback(e.target.value)}
              />
            </Box>
          </Flex>

          <Flex gap="3" justify="end" mt="4">
            <Button variant="soft" onClick={() => setNewRatingDialogOpen(false)}>
              Отмена
            </Button>
            <Button 
              variant="solid" 
              disabled={!selectedInterviewer || Object.keys(ratingScores).length < 4}
              onClick={() => {
                showSuccessToast('Оценка сохранена', 'Результаты добавлены в профиль кандидата')
                setNewRatingDialogOpen(false)
              }}
            >
              Сохранить оценку
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      {displayCandidate && (
        <DuplicateSuspicionModal
          open={duplicateModalOpen}
          onOpenChange={setDuplicateModalOpen}
          candidate={displayCandidate}
          candidateAvatarSrc={currentCandidateAvatarUrl}
        />
      )}

      {displayCandidate && selected?.hasBlacklistSuspicion ? (
        <BlacklistSuspicionModal
          open={blacklistModalOpen}
          onOpenChange={setBlacklistModalOpen}
          candidateName={displayCandidate.name}
          matches={displayCandidate.blacklistSuspicionMatches ?? []}
        />
      ) : null}

      <AddCandidateModal
        open={addCandidateOpen}
        onOpenChange={setAddCandidateOpen}
        vacancyId={vacancyId}
        onSubmit={handleCreateCandidate}
      />
    </Box>
  )
}

