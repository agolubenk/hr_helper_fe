import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
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
} from '@radix-ui/themes'
import { useParams, useNavigate } from '@tanstack/react-router'
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
} from '@radix-ui/react-icons'
import { useToast } from '@/shared/components/feedback/Toast'
import {
  MOCK_CANDIDATES,
  AVAILABLE_VACANCIES,
  getCandidateInitials,
  getVacancyIdByTitle,
  getUnreadConversationsCount,
  STATUS_ORDER,
  REJECTION_REASONS,
  getStatusColor,
  type AtsCandidate,
} from './mocks'
import { getPlatformInfo, getSocialUrl, SOCIAL_PLATFORMS, type SocialPlatformKey } from '@/shared/lib/socialPlatforms'
import { WorkflowChat } from '@/features/workflow/components/WorkflowChat'
import { SlotsPanel } from '@/features/workflow/components/SlotsPanel'
import { VacancySettingsForms, type VacancySettingTab } from './VacancySettingsForms'
import styles from './AtsPage.module.css'

type LeftTab = 'candidates' | 'chat' | 'vacancy-settings'
type RightTab = 'info' | 'activity' | 'ratings' | 'documents' | 'history'

const UNREAD_BADGE_ICON_SIZE = 12

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

/** Элемент истории правок настроек вакансии */
interface VacancyHistoryItem {
  id: string
  date: string
  user: string
  changes: string
  version: number
  fullText?: string
  fieldsState?: {
    title: string
    department: string
    header: string
    responsibilities: string
    requirements: string
    niceToHave: string
    conditions: string
    closing: string
    link: string
    fieldSettings?: Record<string, { active: boolean; visible: boolean }>
  }
}

const MOCK_EDIT_HISTORY: VacancyHistoryItem[] = [
  {
    id: '1',
    date: '2026-01-24 10:30',
    user: 'Иван Иванов',
    changes: 'Изменен текст вакансии',
    version: 1,
    fullText:
      'Название вакансии: Senior Frontend Developer\n\nОтдел: Разработка\n\nЗаголовок: Приглашаем опытного разработчика\n\nОбязанности:\n- Разработка пользовательских интерфейсов\n- Оптимизация производительности\n- Работа с командой\n\nТребования:\n- Опыт работы от 3 лет\n- Знание React, TypeScript\n- Опыт работы с Redux',
    fieldsState: {
      title: 'Senior Frontend Developer',
      department: 'Разработка',
      header: 'Приглашаем опытного разработчика',
      responsibilities:
        '- Разработка пользовательских интерфейсов\n- Оптимизация производительности\n- Работа с командой',
      requirements: '- Опыт работы от 3 лет\n- Знание React, TypeScript\n- Опыт работы с Redux',
      niceToHave: '',
      conditions: '',
      closing: '',
      link: '',
      fieldSettings: {
        title: { active: true, visible: true },
        header: { active: true, visible: true },
        responsibilities: { active: true, visible: true },
        requirements: { active: true, visible: true },
        niceToHave: { active: true, visible: true },
        conditions: { active: true, visible: true },
        closing: { active: true, visible: true },
        link: { active: true, visible: true },
        attachment: { active: true, visible: true },
      },
    },
  },
  {
    id: '2',
    date: '2026-01-23 15:45',
    user: 'Петр Петров',
    changes: 'Обновлены условия работы',
    version: 2,
    fullText:
      'Название вакансии: Senior Frontend Developer\n\nОтдел: Разработка\n\nЗаголовок: Приглашаем опытного разработчика\n\nОбязанности:\n- Разработка пользовательских интерфейсов\n- Оптимизация производительности\n\nТребования:\n- Опыт работы от 3 лет\n- Знание React, TypeScript',
    fieldsState: {
      title: 'Senior Frontend Developer',
      department: 'Разработка',
      header: 'Приглашаем опытного разработчика',
      responsibilities: '- Разработка пользовательских интерфейсов\n- Оптимизация производительности',
      requirements: '- Опыт работы от 3 лет\n- Знание React, TypeScript',
      niceToHave: '',
      conditions: '',
      closing: '',
      link: '',
      fieldSettings: {
        title: { active: true, visible: true },
        header: { active: true, visible: true },
        responsibilities: { active: true, visible: true },
        requirements: { active: true, visible: true },
        niceToHave: { active: false, visible: false },
        conditions: { active: true, visible: true },
        closing: { active: true, visible: true },
        link: { active: true, visible: true },
        attachment: { active: true, visible: true },
      },
    },
  },
  {
    id: '3',
    date: '2026-01-22 09:15',
    user: 'Иван Иванов',
    changes: 'Создана вакансия',
    version: 3,
    fullText:
      'Название вакансии: Frontend Developer\n\nОтдел: Разработка\n\nЗаголовок: Ищем разработчика\n\nОбязанности:\n- Разработка интерфейсов\n\nТребования:\n- Опыт работы от 2 лет\n- Знание React',
    fieldsState: {
      title: 'Frontend Developer',
      department: 'Разработка',
      header: 'Ищем разработчика',
      responsibilities: '- Разработка интерфейсов',
      requirements: '- Опыт работы от 2 лет\n- Знание React',
      niceToHave: '',
      conditions: '',
      closing: '',
      link: '',
      fieldSettings: {
        title: { active: true, visible: true },
        header: { active: true, visible: true },
        responsibilities: { active: true, visible: true },
        requirements: { active: true, visible: true },
        niceToHave: { active: false, visible: false },
        conditions: { active: false, visible: false },
        closing: { active: false, visible: false },
        link: { active: false, visible: false },
        attachment: { active: false, visible: false },
      },
    },
  },
]

function getHistoryFieldName(fieldKey: string): string {
  const names: Record<string, string> = {
    title: 'Название вакансии',
    department: 'Отдел',
    header: 'Заголовок',
    responsibilities: 'Обязанности',
    requirements: 'Требования',
    niceToHave: 'Будет плюсом',
    conditions: 'Условия работы',
    closing: 'Завершение',
    link: 'Ссылка',
    attachment: 'Вложение',
  }
  return names[fieldKey] ?? fieldKey
}

function compareHistoryLines(current: string, next: string): string {
  const currentWords = current.split(/(\s+)/)
  const nextWords = next.split(/(\s+)/)
  const result: string[] = []
  let currentIdx = 0
  let nextIdx = 0
  while (currentIdx < currentWords.length || nextIdx < nextWords.length) {
    if (currentIdx >= currentWords.length) {
      result.push(
        `<span style="text-decoration: underline; background-color: #fef3c7;">${nextWords.slice(nextIdx).join('')}</span>`
      )
      break
    }
    if (nextIdx >= nextWords.length) {
      result.push(
        `<span style="text-decoration: line-through; background-color: #fef3c7;">${currentWords.slice(currentIdx).join('')}</span>`
      )
      break
    }
    if (currentWords[currentIdx] === nextWords[nextIdx]) {
      result.push(currentWords[currentIdx])
      currentIdx++
      nextIdx++
    } else {
      let found = false
      for (let j = nextIdx + 1; j < nextWords.length; j++) {
        if (currentWords[currentIdx] === nextWords[j]) {
          result.push(
            `<span style="text-decoration: line-through; background-color: #fef3c7;">${nextWords.slice(nextIdx, j).join('')}</span>`
          )
          nextIdx = j
          found = true
          break
        }
      }
      if (!found) {
        for (let j = currentIdx + 1; j < currentWords.length; j++) {
          if (currentWords[j] === nextWords[nextIdx]) {
            result.push(
              `<span style="text-decoration: underline; background-color: #fef3c7;">${currentWords.slice(currentIdx, j).join('')}</span>`
            )
            currentIdx = j
            found = true
            break
          }
        }
      }
      if (!found) {
        result.push(
          `<span style="text-decoration: line-through; background-color: #fef3c7;">${currentWords[currentIdx]}</span>`
        )
        result.push(
          `<span style="text-decoration: underline; background-color: #fef3c7;">${nextWords[nextIdx]}</span>`
        )
        currentIdx++
        nextIdx++
      }
    }
  }
  return result.join('')
}

function calculateHistoryDiff(currentText: string, nextText: string): string {
  if (!nextText) return currentText
  const currentLines = currentText.split('\n')
  const nextLines = nextText.split('\n')
  const maxLines = Math.max(currentLines.length, nextLines.length)
  const diffLines: string[] = []
  for (let i = 0; i < maxLines; i++) {
    const currentLine = currentLines[i] ?? ''
    const nextLine = nextLines[i] ?? ''
    if (currentLine === nextLine) {
      diffLines.push(currentLine)
    } else {
      if (currentLine && !nextLine) {
        diffLines.push(
          `<span style="text-decoration: line-through; background-color: #fef3c7;">${currentLine}</span>`
        )
      } else if (!currentLine && nextLine) {
        diffLines.push(
          `<span style="text-decoration: underline; background-color: #fef3c7;">${nextLine}</span>`
        )
      } else {
        diffLines.push(compareHistoryLines(currentLine, nextLine))
      }
    }
  }
  return diffLines.join('\n')
}

export function AtsCandidatePage() {
  const toast = useToast()
  const { candidateId } = useParams({ strict: false }) as {
    vacancyId?: string
    candidateId?: string
  }
  const navigate = useNavigate()
  const cid = candidateId ?? '1'

  const rightColumnRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isRightColumnOpen, setIsRightColumnOpen] = useState(false)
  const [leftTab, setLeftTab] = useState<LeftTab>('candidates')
  const [searchQuery, setSearchQuery] = useState('')
  const [slotsOpen, setSlotsOpen] = useState(false)
  const [rightTab, setRightTab] = useState<RightTab>('info')
  const [selectedSettingTab, setSelectedSettingTab] = useState<
    'text' | 'recruiters' | 'customers' | 'questions' | 'integrations' | 'statuses' | 'salary' | 'interviews' | 'scorecard' | 'dataProcessing' | 'history'
  >('text')

  const [editHistory, setEditHistory] = useState<VacancyHistoryItem[]>(MOCK_EDIT_HISTORY)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<VacancyHistoryItem | null>(null)
  const [restoreConfirmationOpen, setRestoreConfirmationOpen] = useState(false)
  const [versionToRestore, setVersionToRestore] = useState<VacancyHistoryItem | null>(null)

  const handleRestoreVersion = useCallback(() => {
    if (!versionToRestore) return
    const newItem: VacancyHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('ru-RU'),
      user: 'Текущий пользователь',
      changes: `Восстановлена версия ${versionToRestore.version} от ${versionToRestore.date}`,
      version: Math.max(...editHistory.map((h) => h.version), 0) + 1,
      fullText: versionToRestore.fullText,
      fieldsState: versionToRestore.fieldsState,
    }
    setEditHistory((prev) => [newItem, ...prev])
    setRestoreConfirmationOpen(false)
    setSelectedHistoryItem(null)
    setVersionToRestore(null)
    toast.showSuccess('Версия восстановлена', `Версия ${versionToRestore.version} применена.`)
  }, [versionToRestore, editHistory, toast])

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

  /** Локальные изменения кандидата (статус и т.д.) по id — как setSelectedCandidate в old */
  const [localCandidateOverrides, setLocalCandidateOverrides] = useState<
    Record<string, Partial<AtsCandidate>>
  >({})
  const [statusComment, setStatusComment] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
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
  const [isEditingAge, setIsEditingAge] = useState(false)
  const [ageValue, setAgeValue] = useState('')
  const [addContactModalOpen, setAddContactModalOpen] = useState(false)
  const [newContactType, setNewContactType] = useState<'email' | 'phone'>('email')
  const [newContactValue, setNewContactValue] = useState('')

  const displayCandidate = selected
    ? { ...selected, ...(localCandidateOverrides[selected.id] ?? {}) }
    : null

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
        },
      }))
      if (newStatus === 'Rejected') setRejectionReason('')
      else setRejectionReason('')
    },
    [selected]
  )

  const handleNextStatus = useCallback(() => {
    if (!displayCandidate) return
    const next = getNextStatus(displayCandidate.status)
    if (next !== displayCandidate.status) handleStatusChange(next)
  }, [displayCandidate, getNextStatus, handleStatusChange])

  const handleStatusCommentSubmit = useCallback(() => {
    if (!statusComment.trim()) return
    setStatusComment('')
  }, [statusComment])

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

  const handleSelectCandidate = (c: AtsCandidate) => {
    if (isMobile) setIsRightColumnOpen(true)
    const vacancyId = getVacancyIdByTitle(c.vacancy)
    navigate({
      to: '/ats/vacancy/$vacancyId/candidate/$candidateId',
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
                      onClick={() => {
                        setSelectedSettingTab(tab)
                        if (isMobile) setIsRightColumnOpen(true)
                      }}
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
      >
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
            <Box className={styles.candidateCardScroll}>
              <Flex direction="column" gap="3">
                <Flex align="center" justify="between" wrap="wrap" gap="2">
                  <Text size="5" weight="bold" style={{ display: 'block' }}>
                    Настройки вакансии «{vacancyTitle || 'Вакансия'}»
                  </Text>
                  {isMobile && isRightColumnOpen && (
                    <Button variant="soft" size="2" onClick={handleCloseRightColumn}>
                      Закрыть
                    </Button>
                  )}
                </Flex>
                <Separator size="4" />
                {selectedSettingTab === 'history' ? (
              <Box>
                <Text size="4" weight="bold" mb="4" style={{ display: 'block' }}>
                  История правок
                </Text>
                <Flex direction="column" gap="3">
                  {editHistory.length === 0 ? (
                    <Text size="2" color="gray" style={{ textAlign: 'center', padding: '40px' }}>
                      История правок пуста
                    </Text>
                  ) : (
                    editHistory.map((item) => (
                      <Card
                        key={item.id}
                        style={{ padding: 16, cursor: 'pointer' }}
                        onClick={() => setSelectedHistoryItem(item)}
                      >
                        <Flex direction="column" gap="2">
                          <Flex align="center" justify="between">
                            <Flex align="center" gap="2">
                              <Badge color="gray" variant="soft">
                                Версия {item.version}
                              </Badge>
                              <Text size="2" weight="medium">
                                {item.changes}
                              </Text>
                            </Flex>
                            <Text size="1" color="gray">
                              {item.date}
                            </Text>
                          </Flex>
                          <Flex align="center" gap="2">
                            <PersonIcon width={14} height={14} style={{ color: 'var(--gray-9)' }} />
                            <Text size="1" color="gray">
                              {item.user}
                            </Text>
                          </Flex>
                        </Flex>
                      </Card>
                    ))
                  )}
                </Flex>
                <Dialog.Root
                  open={selectedHistoryItem !== null}
                  onOpenChange={(open) => !open && setSelectedHistoryItem(null)}
                >
                  <Dialog.Content style={{ maxWidth: 800, maxHeight: '90vh', overflow: 'auto' }}>
                    {selectedHistoryItem && (() => {
                      const nextVersion = editHistory
                        .filter((h) => h.version < selectedHistoryItem.version)
                        .sort((a, b) => b.version - a.version)[0]
                      const currentText = selectedHistoryItem.fullText ?? selectedHistoryItem.changes
                      const nextText = nextVersion?.fullText ?? nextVersion?.changes ?? ''
                      const diffText =
                        nextText ? calculateHistoryDiff(currentText, nextText) : currentText
                      return (
                        <>
                          <Dialog.Title>
                            <Flex direction="column" gap="2">
                              <Text size="4" weight="bold">
                                Версия {selectedHistoryItem.version}
                              </Text>
                              <Text size="2" color="gray">
                                {selectedHistoryItem.changes}
                              </Text>
                            </Flex>
                          </Dialog.Title>
                          <Dialog.Description>
                            <Flex direction="column" gap="3" mt="4">
                              <Flex align="center" gap="2">
                                <PersonIcon width={16} height={16} />
                                <Text size="2">{selectedHistoryItem.user}</Text>
                                <Text size="1" color="gray">•</Text>
                                <Text size="1" color="gray">{selectedHistoryItem.date}</Text>
                              </Flex>
                              {nextVersion && (
                                <Box
                                  style={{
                                    padding: 12,
                                    backgroundColor: 'var(--yellow-2)',
                                    borderRadius: 6,
                                    border: '1px solid var(--yellow-6)',
                                  }}
                                >
                                  <Text size="1" color="gray" mb="2" style={{ display: 'block' }}>
                                    Сравнение с версией {nextVersion.version} от {nextVersion.date}
                                  </Text>
                                  <Text size="1" style={{ display: 'block' }}>
                                    <span
                                      style={{
                                        textDecoration: 'line-through',
                                        backgroundColor: '#fef3c7',
                                      }}
                                    >
                                      Удалено
                                    </span>{' '}
                                    <span
                                      style={{
                                        textDecoration: 'underline',
                                        backgroundColor: '#fef3c7',
                                      }}
                                    >
                                      Добавлено
                                    </span>
                                  </Text>
                                </Box>
                              )}
                              <Box
                                style={{
                                  padding: 16,
                                  backgroundColor: 'var(--gray-2)',
                                  borderRadius: 6,
                                  border: '1px solid var(--gray-6)',
                                  whiteSpace: 'pre-wrap',
                                  fontFamily: 'monospace',
                                  fontSize: 13,
                                  lineHeight: 1.6,
                                  maxHeight: 500,
                                  overflow: 'auto',
                                }}
                              >
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: diffText.replace(/\n/g, '<br/>'),
                                  }}
                                />
                              </Box>
                            </Flex>
                          </Dialog.Description>
                          <Flex gap="3" mt="4" justify="end">
                            <Button
                              variant="solid"
                              color="blue"
                              onClick={() => {
                                setVersionToRestore(selectedHistoryItem)
                                setRestoreConfirmationOpen(true)
                              }}
                            >
                              Восстановить версию
                            </Button>
                            <Dialog.Close>
                              <Button variant="soft" color="gray">
                                Закрыть
                              </Button>
                            </Dialog.Close>
                          </Flex>
                        </>
                      )
                    })()}
                  </Dialog.Content>
                </Dialog.Root>
                <Dialog.Root open={restoreConfirmationOpen} onOpenChange={setRestoreConfirmationOpen}>
                  <Dialog.Content style={{ maxWidth: 600 }}>
                    <Dialog.Title>
                      <Text size="4" weight="bold">
                        Подтверждение восстановления
                      </Text>
                    </Dialog.Title>
                    <Dialog.Description>
                      <Flex direction="column" gap="4" mt="4">
                        <Text size="2">
                          Вы собираетесь восстановить версию {versionToRestore?.version} от{' '}
                          {versionToRestore?.date}. Все текущие изменения будут заменены на значения
                          из этой версии.
                        </Text>
                        {versionToRestore?.fieldsState && (
                          <>
                            <Separator size="4" />
                            <Text size="2" weight="bold" mb="2">
                              Будут восстановлены следующие поля:
                            </Text>
                            <Box
                              style={{
                                maxHeight: 300,
                                overflowY: 'auto',
                                padding: 12,
                                backgroundColor: 'var(--gray-2)',
                                borderRadius: 6,
                                border: '1px solid var(--gray-6)',
                              }}
                            >
                              <Flex direction="column" gap="2">
                                {Object.entries(
                                  versionToRestore.fieldsState.fieldSettings ?? {}
                                ).map(([fieldKey, settings]) => {
                                  const fieldName = getHistoryFieldName(fieldKey)
                                  const fs = versionToRestore.fieldsState!
                                  const fieldValue =
                                    fieldKey === 'title'
                                      ? fs.title
                                      : fieldKey === 'department'
                                        ? fs.department
                                        : fieldKey === 'header'
                                          ? fs.header
                                          : fieldKey === 'responsibilities'
                                            ? fs.responsibilities
                                            : fieldKey === 'requirements'
                                              ? fs.requirements
                                              : fieldKey === 'niceToHave'
                                                ? fs.niceToHave
                                                : fieldKey === 'conditions'
                                                  ? fs.conditions
                                                  : fieldKey === 'closing'
                                                    ? fs.closing
                                                    : fieldKey === 'link'
                                                      ? fs.link
                                                      : ''
                                  return (
                                    <Card key={fieldKey} style={{ padding: 12 }}>
                                      <Flex direction="column" gap="2">
                                        <Flex align="center" gap="2">
                                          <Text size="2" weight="medium">
                                            {fieldName}
                                          </Text>
                                          <Badge
                                            color={settings.active ? 'green' : 'gray'}
                                            variant="soft"
                                            size="1"
                                          >
                                            {settings.active ? 'Активно' : 'Неактивно'}
                                          </Badge>
                                          <Badge
                                            color={settings.visible ? 'blue' : 'gray'}
                                            variant="soft"
                                            size="1"
                                          >
                                            {settings.visible ? 'Видимо' : 'Скрыто'}
                                          </Badge>
                                        </Flex>
                                        {fieldValue && (
                                          <Text size="1" color="gray" style={{ whiteSpace: 'pre-wrap' }}>
                                            {fieldValue.slice(0, 100)}
                                            {fieldValue.length > 100 ? '…' : ''}
                                          </Text>
                                        )}
                                      </Flex>
                                    </Card>
                                  )
                                })}
                              </Flex>
                            </Box>
                          </>
                        )}
                      </Flex>
                    </Dialog.Description>
                    <Flex gap="3" mt="4" justify="end">
                      <Button variant="solid" color="blue" onClick={handleRestoreVersion}>
                        Восстановить
                      </Button>
                      <Button
                        variant="soft"
                        color="gray"
                        onClick={() => {
                          setRestoreConfirmationOpen(false)
                          setVersionToRestore(null)
                        }}
                      >
                        Отмена
                      </Button>
                    </Flex>
                  </Dialog.Content>
                </Dialog.Root>
              </Box>
            ) : (
              <VacancySettingsForms
                tab={selectedSettingTab as VacancySettingTab}
                vacancyTitle={vacancyTitle || ''}
              />
            )}
              </Flex>
            </Box>
          </Card>
        ) : selected && displayCandidate ? (
          <Card
            className={styles.candidateCard}
            style={{
              transition: 'all 0.3s ease',
              opacity: selected.hasDuplicateSuspicion ? 0.5 : 1,
              filter: selected.hasDuplicateSuspicion ? 'blur(3px)' : 'none',
            }}
          >
            <Box className={styles.candidateCardScroll}>
              <Flex direction="column" gap="4">
                {isMobile && isRightColumnOpen && (
                  <Flex justify="end">
                    <Button variant="soft" size="2" onClick={handleCloseRightColumn}>
                      Закрыть
                    </Button>
                  </Flex>
                )}
                <Flex
                  align="stretch"
                  gap="3"
                  mb="2"
                  style={{ width: '100%', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}
                >
                  <Box
                    style={{
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Avatar
                      size="5"
                      fallback={getCandidateInitials(selected)}
                      style={{
                        backgroundColor: displayCandidate.statusColor ?? 'var(--accent-9)',
                      }}
                    />
                  </Box>
                  <Flex direction="column" gap="2" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <Flex align="center" gap="2" wrap="nowrap" style={{ width: '100%', minWidth: 0 }}>
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
                      <Box className={styles.candidateHeaderBadgeScroll}>
                        <Flex align="center" gap="2" wrap="nowrap" className={styles.candidateHeaderBadgeRow}>
                          <Badge
                            size="2"
                            style={{
                              backgroundColor: displayCandidate.statusColor,
                              color: 'white',
                              flexShrink: 0,
                              maxWidth: isMobile ? '100%' : 'none',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={`🎯 ${displayCandidate.vacancy ?? vacancyTitle} · ${displayCandidate.status}`}
                          >
                            🎯 {displayCandidate.vacancy ?? vacancyTitle} · {displayCandidate.status}
                          </Badge>
                        </Flex>
                      </Box>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <Button
                            size="2"
                            variant="soft"
                            style={{
                              flexShrink: 1,
                              minWidth: 30,
                              maxWidth: 'none',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              paddingLeft: 8,
                              paddingRight: 8,
                            }}
                            title="Взять на другую вакансию"
                          >
                            <PlusIcon width={14} height={14} style={{ flexShrink: 0 }} />
                            {!isMobile && (
                              <span
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  minWidth: 0,
                                  flexShrink: 1,
                                  maxWidth: '100%',
                                }}
                              >
                                Взять на другую вакансию
                              </span>
                            )}
                          </Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end">
                          {AVAILABLE_VACANCIES.filter((v) => v.name !== (displayCandidate.vacancy ?? vacancyTitle)).map((v) => (
                            <DropdownMenu.Item key={v.id}>{v.name}</DropdownMenu.Item>
                          ))}
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </Flex>
                    <Flex align="center" gap="2" wrap="wrap" style={{ width: '100%', minWidth: 0 }}>
                  <Box style={{ flex: '1 1 auto', minWidth: 0 }}>
                    <Flex align="center" gap="2" wrap="wrap" style={{ width: '100%', minWidth: 0 }}>
                      <Text size="2" weight="medium" style={{ flexShrink: 0 }}>Status:</Text>
                      <TextField.Root
                        size="2"
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && statusComment.trim()) handleStatusCommentSubmit()
                        }}
                        placeholder="Введите комментарий..."
                        style={{ flex: '1 1 auto', minWidth: 150, maxWidth: 'none' }}
                      />
                      <Select.Root
                        value={displayCandidate.status}
                        onValueChange={handleStatusChange}
                      >
                        <Select.Trigger
                          style={{
                            backgroundColor: displayCandidate.statusColor,
                            color: 'white',
                            borderColor: displayCandidate.statusColor,
                            minWidth: 120,
                            flexShrink: 0,
                          }}
                        />
                        <Select.Content>
                          {STATUS_ORDER.filter((s) => s !== 'Все').map((status) => (
                            <Select.Item key={status} value={status}>
                              {status}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Root>
                      {displayCandidate.status === 'Rejected' && (
                        <Select.Root value={rejectionReason} onValueChange={setRejectionReason}>
                          <Select.Trigger style={{ minWidth: 180, flexShrink: 0 }} placeholder="Причина отказа" />
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
                    </Flex>
                  </Box>
                  <Button
                    size="2"
                    variant="soft"
                    onClick={handleNextStatus}
                    disabled={getNextStatus(displayCandidate.status) === displayCandidate.status}
                    style={{
                      flexShrink: 0,
                      backgroundColor: getStatusColor(getNextStatus(displayCandidate.status)),
                      color: 'white',
                    }}
                  >
                    <Text size="3">→</Text>
                  </Button>
                </Flex>
                  </Flex>
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

              <Box mt="2" style={{ flex: 1, minHeight: 0 }}>
                <Tabs.Content value="info">
                  <Flex direction="column" gap="4" style={{ width: '100%' }}>
                    <Box>
                      <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                        Контакты
                      </Text>
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
                            skype: 'skype',
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
                            figma: 'figma',
                            pinterest: 'pinterest',
                            instagram: 'instagram',
                            facebook: 'facebook',
                            twitter: 'twitter',
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
                            {(
                              Object.entries(SOCIAL_PLATFORMS) as Array<[SocialPlatformKey, typeof SOCIAL_PLATFORMS[SocialPlatformKey]]>
                            ).map(([key, cfg]) => {
                              const contacts = getSocialContacts(key)
                              const hasContact = contacts.length > 0
                              const canAddMore = contacts.length < 5
                              return (
                                <DropdownMenu.Item
                                  key={key}
                                  onSelect={() => {
                                    setAddSocialOpen(false)
                                    if (canAddMore) handleAddSocialContact(key)
                                    else alert('Можно добавить максимум 5 контактов для одной платформы')
                                  }}
                                  style={{ padding: 8 }}
                                  disabled={!canAddMore}
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
                                    {hasContact && (
                                      <Text size="1" color="gray" style={{ flexShrink: 0 }}>
                                        ({contacts.length}/5)
                                      </Text>
                                    )}
                                  </Flex>
                                </DropdownMenu.Item>
                              )
                            })}
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </Flex>
                      {getEmails().length === 0 && getPhones().length === 0 && (
                        <Text size="2" color="gray">Не указано</Text>
                      )}
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
                    <Box className={styles.applicationDetailsTable}>
                      <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                        Application Details
                      </Text>
                      <Table.Root style={{ width: '100%', tableLayout: 'fixed' }}>
                        <Table.Body>
                          <Table.Row>
                            <Table.Cell>
                              <Flex align="center" gap="2" wrap="wrap">
                                <Text size="1" weight="medium" style={{ flexShrink: 0 }}>
                                  Applied:
                                </Text>
                                <Text size="2" style={{ wordBreak: 'break-word' }}>
                                  {displayCandidate.applied ?? '—'}
                                </Text>
                              </Flex>
                            </Table.Cell>
                            <Table.Cell>
                              {isEditingSource ? (
                                <Flex align="center" gap="2" style={{ flexWrap: 'nowrap' }}>
                                  <Text size="1" weight="medium" style={{ flexShrink: 0 }}>
                                    Source:
                                  </Text>
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
                                  <Text size="1" weight="medium" style={{ flexShrink: 0 }}>
                                    Source:
                                  </Text>
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
                            </Table.Cell>
                          </Table.Row>
                          <Table.Row>
                            <Table.Cell>
                              <Text size="2" weight="medium">
                                Position:
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
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
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                        Метки (теги):
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
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
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                                Уровень:
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
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
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                                Зарплатные ожидания:
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
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
                  <Table.Row>
                    <Table.Cell>
                      <Text size="1" weight="medium">
                                Оффер:
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
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
                                    <Text size="2">{displayCandidate.gender ?? 'Не указано'}</Text>
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>
                                    <Text size="2" weight="medium">
                                      Рейтинг:
                                    </Text>
                                  </Table.Cell>
                                  <Table.Cell>
                                    <Text size="2">
                                      {displayCandidate.rating != null ? `${displayCandidate.rating} / 5` : 'Не указано'}
                                    </Text>
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>
                                    <Text size="2" weight="medium">
                                      Локация:
                                    </Text>
                                  </Table.Cell>
                                  <Table.Cell>
                                    <Text size="2">{displayCandidate.location || 'Не указано'}</Text>
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>
                                    <Text size="2" weight="medium">
                                      Email:
                                    </Text>
                                  </Table.Cell>
                                  <Table.Cell>
                                    <Text size="2">{displayCandidate.email || 'Не указано'}</Text>
                                  </Table.Cell>
                                </Table.Row>
                                <Table.Row>
                                  <Table.Cell>
                                    <Text size="2" weight="medium">
                                      Телефон:
                                    </Text>
                                  </Table.Cell>
                                  <Table.Cell>
                                    <Text size="2">{displayCandidate.phone || 'Не указано'}</Text>
                                  </Table.Cell>
                                </Table.Row>
                              </Table.Body>
                            </Table.Root>
                          </Box>
                        )}
                      </Box>
            </Box>

                    <Box>
                      <Text size="3" weight="bold" mb="2" style={{ display: 'block' }}>
                        Ресурсы
                      </Text>
                      <Flex align="center" gap="2" wrap="wrap">
                        <Button size="1" variant="soft">resume.pdf</Button>
                        <Button size="1" variant="soft">Профиль кандидата</Button>
                      </Flex>
                    </Box>
                  </Flex>
                </Tabs.Content>

                <Tabs.Content value="activity">
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                    Активность
                  </Text>
                  <Flex direction="column" gap="2">
                    <Box style={{ padding: 12, border: '1px solid var(--gray-a6)', borderRadius: 6, backgroundColor: 'var(--gray-2)' }}>
                      <Text size="2" weight="medium">Резюме добавлено</Text>
                      <Text size="1" color="gray">Источник: {selected?.email ?? '—'} · недавно</Text>
                    </Box>
                    <Box style={{ padding: 12, border: '1px solid var(--gray-a6)', borderRadius: 6, backgroundColor: 'var(--gray-2)' }}>
                      <Text size="2" weight="medium">Статус: {selected?.status ?? '—'}</Text>
                      <Text size="1" color="gray">Обновление статуса</Text>
                    </Box>
                  </Flex>
                </Tabs.Content>
                <Tabs.Content value="ratings">
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                    Оценки по матрице компетенций
                  </Text>
                  <Text size="2" color="gray" mb="3">
                    Оценка по навыкам из конфигуратора специализаций. Проводится по этапам встреч.
                  </Text>
                  <Flex direction="column" gap="2">
                    <Text size="2" color="gray">Оценки пока не выставлены.</Text>
                  </Flex>
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
                  <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                    История взаимодействий
                  </Text>
                  <Flex direction="column" gap="2">
                    <Box style={{ padding: 12, border: '1px solid var(--gray-a6)', borderRadius: 6, backgroundColor: 'var(--gray-2)' }}>
                      <Text size="2" weight="medium">Изменение статуса</Text>
                      <Text size="1" color="gray">New → {selected?.status ?? '—'} · недавно</Text>
                    </Box>
                    <Text size="2" color="gray">История сообщений и комментариев из чата отображается во вкладке Chat.</Text>
                  </Flex>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
              </Flex>
            </Box>
          </Card>
        ) : (
          <Card className={styles.candidateCard}>
            <Box className={styles.candidateCardScroll}>
              <Text size="2" color="gray">
                Выберите кандидата из списка.
              </Text>
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
    </Box>
  )
}

