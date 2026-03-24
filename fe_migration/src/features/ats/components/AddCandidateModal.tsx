import { useState, useCallback, useEffect } from 'react'
import { FileTextIcon } from '@radix-ui/react-icons'
import {
  Dialog,
  Flex,
  Text,
  Button,
  TextField,
  Box,
  Select,
} from '@radix-ui/themes'
import type { AtsCandidate } from '../mocks'
import { AVAILABLE_VACANCIES, getStatusColor } from '../mocks'
import styles from './AddCandidateModal.module.css'

export interface AddCandidateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** id вакансии из URL — только подсказка; по умолчанию «Не выбрано» */
  vacancyId: string
  onSubmit: (candidate: AtsCandidate) => void
}

/** Значение селекта «вакансия не назначена» */
const ADD_CANDIDATE_VACANCY_NONE = '__none__'

function initialsFromName(name: string): string {
  const p = name.trim().split(/\s+/).filter(Boolean)
  if (p.length === 0) return '?'
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase()
  return `${p[0][0] ?? ''}${p[1][0] ?? ''}`.toUpperCase()
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

export function AddCandidateModal({ open, onOpenChange, vacancyId, onSubmit }: AddCandidateModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [position, setPosition] = useState('')
  const [vacancySelect, setVacancySelect] = useState(ADD_CANDIDATE_VACANCY_NONE)
  const [applied, setApplied] = useState(() => new Date().toISOString().slice(0, 10))
  const [source, setSource] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [resumeImagePreviewUrl, setResumeImagePreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!resumeFile?.type.startsWith('image/')) {
      setResumeImagePreviewUrl(null)
      return undefined
    }
    const url = URL.createObjectURL(resumeFile)
    setResumeImagePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [resumeFile])

  useEffect(() => {
    if (!open) return
    setName('')
    setEmail('')
    setPhone('')
    setLocation('')
    setPosition('')
    const hintVacancy = AVAILABLE_VACANCIES.find((v) => v.id === vacancyId)?.id
    setVacancySelect(hintVacancy ?? ADD_CANDIDATE_VACANCY_NONE)
    setApplied(new Date().toISOString().slice(0, 10))
    setSource('')
    setProfileUrl('')
    setResumeFile(null)
    setDragOver(false)
  }, [open, vacancyId])

  const handleFile = useCallback((f: File | null) => {
    if (!f) return
    setResumeFile(f)
  }, [])

  const handleSubmit = useCallback(() => {
    const n = name.trim()
    if (!n) return
    const em = email.trim()
    if (em && !isValidEmail(em)) return

    const pos = position.trim()
    const vac =
      vacancySelect === ADD_CANDIDATE_VACANCY_NONE
        ? undefined
        : AVAILABLE_VACANCIES.find((v) => v.id === vacancySelect)

    const appliedLabel = (() => {
      const d = new Date(applied)
      if (Number.isNaN(d.getTime()))
        return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    })()

    const id = `new-${Date.now()}`
    const status = 'New'
    const candidate: AtsCandidate = {
      id,
      name: n,
      position: pos || undefined,
      status,
      statusColor: getStatusColor(status),
      avatar: initialsFromName(n),
      email: em || undefined,
      emails: em ? [em] : undefined,
      phone: phone.trim() || undefined,
      phones: phone.trim() ? [phone.trim()] : undefined,
      location: location.trim() || undefined,
      vacancy: vac?.name,
      applied: `Applied ${appliedLabel}`,
      updated: appliedLabel,
      source: source.trim() || '—',
      isViewed: true,
      hasUnviewedChanges: false,
      timeAgo: 'только что',
      resumeFileName: resumeFile?.name,
      sourceProfileUrl: profileUrl.trim() || undefined,
    }

    onSubmit(candidate)
  }, [
    name,
    email,
    position,
    phone,
    location,
    applied,
    source,
    profileUrl,
    resumeFile,
    vacancySelect,
    onSubmit,
  ])

  const canSubmit = name.trim().length > 0 && (!email.trim() || isValidEmail(email))

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 720, maxHeight: '90vh', overflow: 'auto' }}>
        <Dialog.Title>Новый кандидат</Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="3">
          Обязательно только имя. Остальное — по желанию: файл или ссылка на профиль, контакты, вакансию можно указать
          позже.
        </Dialog.Description>

        <Flex className={styles.modalBody} gap="4" align="start" wrap="wrap">
          <Box className={styles.modalColLeft}>
            <Box mb="3">
              <Text size="1" weight="bold" mb="2" as="div">
                Имя *
              </Text>
              <TextField.Root value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Иванов" />
            </Box>

            <Box>
              <Text size="1" weight="bold" mb="2" as="div">
                Дополнительные поля
              </Text>
              <Flex direction="column" gap="2">
                <Box>
                  <Text size="1" color="gray" mb="1" as="div">
                    Email
                  </Text>
                  <TextField.Root
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@company.com"
                  />
                </Box>
                <Box>
                  <Text size="1" color="gray" mb="1" as="div">
                    Должность
                  </Text>
                  <TextField.Root
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Product Designer"
                  />
                </Box>
                <Box>
                  <Text size="1" color="gray" mb="1" as="div">
                    Вакансия
                  </Text>
                  <Select.Root value={vacancySelect} onValueChange={setVacancySelect}>
                    <Select.Trigger placeholder="Не выбрано" style={{ width: '100%' }} />
                    <Select.Content position="popper">
                      <Select.Item value={ADD_CANDIDATE_VACANCY_NONE}>Не выбрано</Select.Item>
                      {AVAILABLE_VACANCIES.map((v) => (
                        <Select.Item key={v.id} value={v.id}>
                          {v.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
                <Box>
                  <Text size="1" color="gray" mb="1" as="div">
                    Телефон
                  </Text>
                  <TextField.Root value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 …" />
                </Box>
                <Box>
                  <Text size="1" color="gray" mb="1" as="div">
                    Локация
                  </Text>
                  <TextField.Root
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Город, страна"
                  />
                </Box>
              </Flex>
            </Box>
          </Box>

          <Box className={styles.modalColRight}>
            <Text size="1" weight="bold" mb="1" as="div">
              Резюме или ссылка
            </Text>
            <Box
              className={`${styles.dropZone} ${resumeFile && resumeImagePreviewUrl ? styles.resumePreview : ''} ${resumeFile && !resumeImagePreviewUrl ? styles.resumePreviewFile : ''} ${dragOver ? styles.dropZoneDrag : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                const f = e.dataTransfer.files[0]
                if (f) handleFile(f)
              }}
              onClick={() => document.getElementById('add-candidate-file')?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  document.getElementById('add-candidate-file')?.click()
                }
              }}
              aria-label={resumeFile ? `Файл: ${resumeFile.name}. Нажмите, чтобы заменить` : 'Выбор файла резюме'}
            >
              <input
                id="add-candidate-file"
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              {resumeFile && resumeImagePreviewUrl ? (
                <>
                  <img
                    className={styles.resumePreviewImg}
                    src={resumeImagePreviewUrl}
                    alt={`Превью: ${resumeFile.name}`}
                  />
                  <Text size="2" color="gray" mt="2" as="div">
                    {resumeFile.name}
                  </Text>
                </>
              ) : resumeFile ? (
                <Flex align="center" justify="center" direction="column" gap="2">
                  <FileTextIcon width={32} height={32} className={styles.resumeFileIcon} />
                  <Text size="2" weight="medium" as="div">
                    {resumeFile.name}
                  </Text>
                  <Text size="1" color="gray">
                    Нажмите, чтобы заменить файл
                  </Text>
                </Flex>
              ) : (
                <Text size="2" color="gray">
                  Перетащите файл сюда или нажмите для выбора (PDF, Word, PowerPoint, изображение)
                </Text>
              )}
            </Box>
            <TextField.Root
              mt="2"
              placeholder="Ссылка на профиль (LinkedIn, GitHub, портфолио…)"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
            />

            <Flex direction="column" gap="2" mt="3">
              <Box>
                <Text size="1" color="gray" mb="1" as="div">
                  Дата отклика (Applied)
                </Text>
                <TextField.Root type="date" value={applied} onChange={(e) => setApplied(e.target.value)} />
              </Box>
              <Box>
                <Text size="1" color="gray" mb="1" as="div">
                  Источник (Sourced)
                </Text>
                <TextField.Root
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="Referral, LinkedIn…"
                />
              </Box>
            </Flex>
          </Box>
        </Flex>

        <Flex gap="3" justify="end" mt="4">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Отмена
            </Button>
          </Dialog.Close>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Создать кандидата
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
