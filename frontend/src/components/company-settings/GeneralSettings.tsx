import { Box, Flex, Text, TextField, TextArea, Button, Card, Switch, Select, IconButton } from '@radix-ui/themes'
import { useState, useRef, useEffect } from 'react'
import {
  PlusIcon,
  TrashIcon,
  Pencil2Icon,
  CheckIcon,
  Cross2Icon,
  StarFilledIcon,
} from '@radix-ui/react-icons'
import { useToast } from '@/components/Toast/ToastContext'
import {
  readStoredCompanyDisplayName,
  writeStoredCompanyDisplayName,
} from '@/lib/companyDisplayName'
import styles from './GeneralSettings.module.css'

/** [главный 120px, миниатюра 43, 34, 27] — при новой загрузке сдвиг вниз по очереди */
type CompanyLogoSlots = readonly [string | null, string | null, string | null, string | null]

const EMPTY_COMPANY_LOGO_SLOTS: CompanyLogoSlots = [null, null, null, null]

const COMPANY_THUMB_SIZES = [43, 34, 27] as const

function shiftNewCompanyLogo(slots: CompanyLogoSlots, newUrl: string): CompanyLogoSlots {
  const [m, a, b, c] = slots
  return [newUrl, m, a, b]
}

function removeCompanyLogoAt(slots: CompanyLogoSlots, index: 0 | 1 | 2 | 3): CompanyLogoSlots {
  const kept: string[] = []
  for (let i = 0; i < 4; i++) {
    if (i !== index) {
      const x = slots[i]
      if (x) kept.push(x)
    }
  }
  return [kept[0] ?? null, kept[1] ?? null, kept[2] ?? null, kept[3] ?? null]
}

/**
 * Слоты: [0] главный, [1]–[3] миниатюры 43→34→27.
 * Выбранная миниатюра s становится главной; бывшие [0]…[s−1] сдвигаются на [1]…[s];
 * слоты правее s без изменений порядка ([s+1]…[3]).
 * Пример s=3: новый [0]=старый[3], [1]=старый[0], [2]=старый[1], [3]=старый[2].
 * Пример s=2: новый [0]=старый[2], [1]=старый[0], [2]=старый[1], [3]=старый[3].
 */
export function promoteCompanyLogoSlot(slots: CompanyLogoSlots, s: 1 | 2 | 3): CompanyLogoSlots {
  if (!slots[s]) return slots
  const next: (string | null)[] = [slots[s], null, null, null]
  let write = 1
  for (let i = 0; i < s; i++) {
    next[write] = slots[i]
    write += 1
  }
  for (let j = s + 1; j < 4; j++) {
    if (write < 4) {
      next[write] = slots[j]
      write += 1
    }
  }
  return [next[0] ?? null, next[1] ?? null, next[2] ?? null, next[3] ?? null] as CompanyLogoSlots
}

interface Office {
  id: number
  name?: string
  logo?: string | null
  address: string
  mapLink: string
  country: string
  city?: string
  timezone: string
  directions: string
  description?: string
  isMain: boolean
}

function LogoUploadBox({
  logo,
  onLogoChange,
  size = 80,
  fill,
  hoverAccent,
}: {
  logo: string | null
  onLogoChange: (logo: string | null) => void
  size?: number
  fill?: boolean
  /** Если задан, подсветка границы идёт от родителя (группа лого + превью) */
  hoverAccent?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [internalHover, setInternalHover] = useState(false)
  const showAccent = hoverAccent !== undefined ? hoverAccent : internalHover

  const handleClick = () => inputRef.current?.click()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите файл изображения')
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      alert('Размер файла не должен превышать 5MB')
      if (inputRef.current) inputRef.current.value = ''
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => onLogoChange(reader.result as string)
    reader.readAsDataURL(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  const borderColor = showAccent ? 'var(--accent-9)' : 'var(--gray-a6)'
  const background = showAccent ? 'var(--gray-3)' : 'var(--gray-2)'

  const boxStyle: React.CSSProperties = fill
    ? {
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }
    : {
        width: size,
        height: size,
        border: `1px solid ${borderColor}`,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }

  const hoverHandlers =
    hoverAccent === undefined
      ? {
          onMouseEnter: () => setInternalHover(true),
          onMouseLeave: () => setInternalHover(false),
        }
      : {}

  return (
    <>
      <Box onClick={handleClick} style={boxStyle} {...hoverHandlers}>
        {logo ? (
          <img
            src={logo}
            alt="Logo"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        ) : (
          <Text size="1" color="gray">
            Лого
          </Text>
        )}
      </Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </>
  )
}

const mockCompanyData = {
  name: 'HR Helper',
  legal_name: 'ООО «HR Helper»',
  headquarters_country: 'BY',
  headquarters_city: 'Минск',
  company_size: 150,
  calendarLink: 'https://calendar.google.com/calendar/u/0',
  logo: null as string | null,
  is_active: true,
  created_at: '2023-01-15T10:00:00Z',
}

const mockOffices: Office[] = [
  {
    id: 1,
    name: 'Главный офис',
    logo: null,
    address: 'ул. Ленина, 10, Минск, Беларусь',
    mapLink: 'https://maps.google.com/?q=Минск,+ул.+Ленина,+10',
    country: 'Беларусь',
    city: 'Минск',
    timezone: 'Europe/Minsk',
    directions: 'Вход со стороны главного входа, 3 этаж',
    description: 'Офис в центре города, рядом с метро Немига.',
    isMain: true,
  },
  {
    id: 2,
    name: 'Офис на Пушкина',
    logo: null,
    address: 'ул. Пушкина, 5, Минск, Беларусь',
    mapLink: 'https://maps.google.com/?q=Минск,+ул.+Пушкина,+5',
    country: 'Беларусь',
    city: 'Минск',
    timezone: 'Europe/Moscow',
    directions: 'Вход через бизнес-центр, лифт на 2 этаж',
    description: '',
    isMain: false,
  },
]

const COUNTRY_OPTIONS = [
  { value: 'BY', label: 'Беларусь' },
  { value: 'RU', label: 'Россия' },
  { value: 'KZ', label: 'Казахстан' },
  { value: 'UA', label: 'Украина' },
  { value: 'US', label: 'США' },
  { value: 'DE', label: 'Германия' },
]

const TIMEZONE_OPTIONS = [
  { value: 'Europe/Minsk', label: 'Europe/Minsk' },
  { value: 'Europe/Moscow', label: 'Europe/Moscow' },
  { value: 'Europe/Kiev', label: 'Europe/Kiev' },
  { value: 'Asia/Almaty', label: 'Asia/Almaty' },
  { value: 'America/New_York', label: 'America/New_York' },
]

const COMPANY_SIZE_OPTIONS = [
  { value: '0-10', label: '0–10' },
  { value: '10-25', label: '10–25' },
  { value: '25-50', label: '25–50' },
  { value: '50-100', label: '50–100' },
  { value: '100-250', label: '100–250' },
  { value: '250-500', label: '250–500' },
  { value: '500-1000', label: '500–1000' },
  { value: '1000-1500', label: '1000–1500' },
  { value: '1500-2500', label: '1500–2500' },
  { value: '2500-5000', label: '2500–5000' },
  { value: '5000-10000', label: '5000–10000' },
  { value: '10000-20000', label: '10000–20000' },
  { value: '20000-50000', label: '20000–50000' },
  { value: '50000-100000', label: '50000–100000' },
  { value: '100000+', label: '100000+' },
]

function getCompanySizeRangeForNumber(n: number): string {
  const num = Number(n)
  if (num <= 10) return '0-10'
  if (num <= 25) return '10-25'
  if (num <= 50) return '25-50'
  if (num <= 100) return '50-100'
  if (num <= 250) return '100-250'
  if (num <= 500) return '250-500'
  if (num <= 1000) return '500-1000'
  if (num <= 1500) return '1000-1500'
  if (num <= 2500) return '1500-2500'
  if (num <= 5000) return '2500-5000'
  if (num <= 10000) return '5000-10000'
  if (num <= 20000) return '10000-20000'
  if (num <= 50000) return '20000-50000'
  if (num <= 100000) return '50000-100000'
  return '100000+'
}

export default function GeneralSettings() {
  const toast = useToast()
  const [companyName, setCompanyName] = useState(() => readStoredCompanyDisplayName())
  const [legalName, setLegalName] = useState(mockCompanyData.legal_name)
  const [headquartersCountry, setHeadquartersCountry] = useState(mockCompanyData.headquarters_country)
  const [headquartersCity, setHeadquartersCity] = useState(mockCompanyData.headquarters_city)
  const [companySize, setCompanySize] = useState(() => {
    const raw = mockCompanyData.company_size
    if (typeof raw === 'string' && COMPANY_SIZE_OPTIONS.some((o) => o.value === raw)) return raw
    const range = getCompanySizeRangeForNumber(Number(raw) || 0)
    return COMPANY_SIZE_OPTIONS.some((o) => o.value === range) ? range : '100-250'
  })
  const [isActive, setIsActive] = useState(mockCompanyData.is_active)
  const [calendarLink, setCalendarLink] = useState(mockCompanyData.calendarLink)
  const [companyLogos, setCompanyLogos] = useState<CompanyLogoSlots>(() =>
    mockCompanyData.logo ? [mockCompanyData.logo, null, null, null] : EMPTY_COMPANY_LOGO_SLOTS
  )
  const [isLogoAreaHovered, setIsLogoAreaHovered] = useState(false)
  const [companyLogoSlotHover, setCompanyLogoSlotHover] = useState<0 | 1 | 2 | 3 | null>(null)
  const [companySizeAuto, setCompanySizeAuto] = useState(false)
  const [offices, setOffices] = useState<Office[]>(mockOffices)
  const [editingOfficeId, setEditingOfficeId] = useState<number | null>(null)
  const [isAddingOffice, setIsAddingOffice] = useState(false)
  const [newOffice, setNewOffice] = useState<Partial<Office>>({
    name: '',
    logo: null,
    address: '',
    mapLink: '',
    country: '',
    city: '',
    timezone: 'Europe/Minsk',
    directions: '',
    description: '',
    isMain: false,
  })

  useEffect(() => {
    writeStoredCompanyDisplayName(companyName)
  }, [companyName])

  const handleSetMainOffice = (id: number) => {
    setOffices((prev) =>
      prev.map((office) => ({
        ...office,
        isMain: office.id === id,
      }))
    )
  }

  const handleAddOffice = () => {
    if (!newOffice.address || !newOffice.mapLink) {
      alert('Заполните обязательные поля: адрес и ссылка на карте')
      return
    }

    const office: Office = {
      id: Date.now(),
      name: newOffice.name || undefined,
      logo: newOffice.logo ?? null,
      address: newOffice.address!,
      mapLink: newOffice.mapLink!,
      country: newOffice.country || 'Беларусь',
      city: newOffice.city || undefined,
      timezone: newOffice.timezone || 'Europe/Minsk',
      directions: newOffice.directions || '',
      description: newOffice.description || undefined,
      isMain: !offices.some((o) => o.isMain),
    }

    setOffices((prev) => [...prev, office])
    setNewOffice({
      name: '',
      logo: null,
      address: '',
      mapLink: '',
      country: '',
      city: '',
      timezone: 'Europe/Minsk',
      directions: '',
      description: '',
      isMain: false,
    })
    setIsAddingOffice(false)
  }

  const handleEditOffice = (id: number) => {
    setEditingOfficeId(id)
  }

  const handleSaveOffice = (id: number, updatedOffice: Partial<Office>) => {
    setOffices((prev) =>
      prev.map((office) => (office.id === id ? { ...office, ...updatedOffice } : office))
    )
    setEditingOfficeId(null)
  }

  const handleDeleteOffice = (id: number) => {
    toast.showWarning('Удалить офис?', 'Вы уверены, что хотите удалить этот офис?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => setOffices((prev) => prev.filter((office) => office.id !== id)),
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  const handleCancelAdd = () => {
    setNewOffice({
      name: '',
      logo: null,
      address: '',
      mapLink: '',
      country: '',
      city: '',
      timezone: 'Europe/Minsk',
      directions: '',
      description: '',
      isMain: false,
    })
    setIsAddingOffice(false)
  }

  return (
    <Flex direction="column" gap="4">
      <Card className={styles.card}>
        <Text size="4" weight="bold" mb="4" style={{ display: 'block' }}>
          Общие настройки
        </Text>

        <Flex direction="column" gap="4">
          <Flex gap="4" align="start" className={styles.generalSettingsRow}>
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                width: 120,
              }}
              onMouseEnter={() => setIsLogoAreaHovered(true)}
              onMouseLeave={() => {
                setIsLogoAreaHovered(false)
                setCompanyLogoSlotHover(null)
              }}
            >
              <Box onMouseEnter={() => setCompanyLogoSlotHover(null)} mb="2">
                <Text size="2" weight="medium" style={{ display: 'block' }}>
                  Логотип компании
                </Text>
              </Box>
              <Box
                style={{ position: 'relative', width: 120 }}
                onMouseEnter={() => setCompanyLogoSlotHover(0)}
              >
                <Box style={{ position: 'relative', width: 120, height: 120 }}>
                  <LogoUploadBox
                    logo={companyLogos[0]}
                    onLogoChange={(url) => {
                      if (url) setCompanyLogos((prev) => shiftNewCompanyLogo(prev, url))
                    }}
                    size={120}
                    hoverAccent={isLogoAreaHovered}
                  />
                  {companyLogoSlotHover === 0 && companyLogos[0] ? (
                    <Box
                      aria-hidden
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'color-mix(in srgb, var(--accent-9) 32%, transparent)',
                        pointerEvents: 'none',
                      }}
                    >
                      <PlusIcon width={44} height={44} style={{ color: 'var(--accent-11)' }} />
                    </Box>
                  ) : null}
                  {companyLogoSlotHover === 0 && companyLogos[0] ? (
                    <Box
                      style={{
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                        zIndex: 4,
                        pointerEvents: 'auto',
                        lineHeight: 0,
                      }}
                    >
                      <IconButton
                        type="button"
                        variant="soft"
                        color="red"
                        size="1"
                        title="Удалить изображение"
                        style={{ margin: 0 }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setCompanyLogos((prev) => removeCompanyLogoAt(prev, 0))
                        }}
                      >
                        <TrashIcon width={14} height={14} />
                      </IconButton>
                    </Box>
                  ) : null}
                </Box>
                <Flex
                  gap="2"
                  align="end"
                  wrap="nowrap"
                  style={{ width: 120, marginTop: '7px', position: 'relative', zIndex: 1 }}
                >
                {COMPANY_THUMB_SIZES.map((d, thumbIndex) => {
                  const slotIndex = (thumbIndex + 1) as 1 | 2 | 3
                  const thumbSrc = companyLogos[slotIndex]
                  return (
                    <Box
                      key={d}
                      style={{ width: d, flexShrink: 0, display: 'flex', justifyContent: 'center' }}
                      onMouseEnter={() => setCompanyLogoSlotHover(slotIndex)}
                    >
                      <Box
                        style={{
                          width: d,
                          height: d,
                          border: `1px solid ${isLogoAreaHovered ? 'var(--accent-9)' : 'var(--gray-a4)'}`,
                          borderRadius: '4px',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isLogoAreaHovered ? 'var(--gray-3)' : 'var(--gray-2)',
                          flexShrink: 0,
                          transition: 'border-color 0.2s, background-color 0.2s',
                        }}
                        title={`${d}x${d}px`}
                      >
                        {thumbSrc ? (
                          <img
                            src={thumbSrc}
                            alt={`Лого ${d}px`}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                        ) : (
                          <Text size="1" color="gray" style={{ fontSize: Math.max(8, d / 8) }}>
                            {d}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  )
                })}
                </Flex>
              </Box>
              <Flex gap="2" mt="1" align="start" wrap="nowrap" style={{ width: 120 }}>
                {COMPANY_THUMB_SIZES.map((d, thumbIndex) => {
                  const slotIndex = (thumbIndex + 1) as 1 | 2 | 3
                  const thumbSrc = companyLogos[slotIndex]
                  return (
                    <Box
                      key={`actions-${d}`}
                      style={{
                        width: d,
                        flexShrink: 0,
                        minHeight: 28,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                      }}
                      onMouseEnter={() => setCompanyLogoSlotHover(slotIndex)}
                    >
                      {companyLogoSlotHover === slotIndex && thumbSrc ? (
                        <>
                          <IconButton
                            type="button"
                            variant="soft"
                            color="gray"
                            size="1"
                            title="Сделать главным"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setCompanyLogos((prev) => promoteCompanyLogoSlot(prev, slotIndex))
                            }}
                          >
                            <CheckIcon width={12} height={12} />
                          </IconButton>
                          <IconButton
                            type="button"
                            variant="soft"
                            color="red"
                            size="1"
                            title="Удалить изображение"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setCompanyLogos((prev) => removeCompanyLogoAt(prev, slotIndex))
                            }}
                          >
                            <TrashIcon width={12} height={12} />
                          </IconButton>
                        </>
                      ) : null}
                    </Box>
                  )
                })}
              </Flex>
            </Box>

            <Flex direction="column" gap="4" style={{ flex: 1 }} className={styles.generalSettingsFormColumn}>
              <Flex gap="3" wrap="nowrap">
                <Box style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Название компании *
                  </Text>
                  <TextField.Root
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Введите название компании"
                    style={{ width: '100%' }}
                  />
                </Box>
                <Box style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Юридическое название
                  </Text>
                  <TextField.Root
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="ООО «Название»"
                    style={{ width: '100%' }}
                  />
                </Box>
              </Flex>
              <Flex gap="3" wrap="nowrap">
                <Box style={{ flex: '1 1 120px', minWidth: 0 }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Страна
                  </Text>
                  <Select.Root value={headquartersCountry} onValueChange={setHeadquartersCountry}>
                    <Select.Trigger style={{ width: '100%' }} />
                    <Select.Content>
                      {COUNTRY_OPTIONS.map((o) => (
                        <Select.Item key={o.value} value={o.value}>
                          {o.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
                <Box style={{ flex: '1 1 120px', minWidth: 0 }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Город
                  </Text>
                  <TextField.Root
                    value={headquartersCity}
                    onChange={(e) => setHeadquartersCity(e.target.value)}
                    placeholder="Минск"
                    style={{ width: '100%' }}
                  />
                </Box>
                <Box style={{ flex: '1 1 140px', minWidth: 0 }}>
                  <Flex
                    align="center"
                    justify="between"
                    mb="2"
                    wrap="nowrap"
                    gap="2"
                    style={{ width: '100%', whiteSpace: 'nowrap' }}
                  >
                    <Text size="2" weight="medium" style={{ flexShrink: 0 }}>
                      Численность
                    </Text>
                    <Switch checked={companySizeAuto} onCheckedChange={setCompanySizeAuto} />
                  </Flex>
                  {companySizeAuto ? (
                    <Text size="2" style={{ display: 'block', lineHeight: 'var(--line-height-2)' }}>
                      Автоматически
                    </Text>
                  ) : (
                    <Select.Root value={companySize} onValueChange={setCompanySize}>
                      <Select.Trigger style={{ width: '100%' }} />
                      <Select.Content>
                        {COMPANY_SIZE_OPTIONS.map((o) => (
                          <Select.Item key={o.value} value={o.value}>
                            {o.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  )}
                </Box>
              </Flex>
              <Flex gap="3" wrap="nowrap" align="center">
                <Box style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Ссылка на календарь
                  </Text>
                  <TextField.Root
                    value={calendarLink}
                    onChange={(e) => setCalendarLink(e.target.value)}
                    placeholder="https://calendar.google.com/..."
                    style={{ width: '100%' }}
                  />
                </Box>
                <Flex direction="column" align="end" gap="1" style={{ flexShrink: 0 }}>
                  <Text size="1" color="gray">
                    Создана: {new Date(mockCompanyData.created_at).toLocaleDateString('ru-RU')}
                  </Text>
                  <Flex align="center" gap="2">
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                    <Text size="2">Компания активна</Text>
                  </Flex>
                </Flex>
              </Flex>
              <Box mt="4" p="3" style={{ border: '1px dashed var(--gray-a6)', borderRadius: '8px', backgroundColor: 'var(--gray-2)' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Дополнительные поля (custom_attributes)
                </Text>
                <Text size="1" color="gray">
                  JSON-схема для произвольных полей компании. Редактор — в разработке.
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Flex>

        <Flex justify="end" gap="3" pt="3" mt="4" style={{ borderTop: '1px solid var(--gray-a6)' }}>
          <Button variant="soft" size="3" title="Отмена">
            <Cross2Icon width={18} height={18} className={styles.buttonIconMobile} />
            <span className={styles.buttonTextMobile}> Отмена</span>
          </Button>
          <Button size="3" title="Сохранить изменения">
            <CheckIcon width={18} height={18} className={styles.buttonIconMobile} />
            <span className={styles.buttonTextMobile}> Сохранить изменения</span>
          </Button>
        </Flex>
      </Card>

      <Card className={styles.card}>
        <Flex justify="between" align="center" mb="4">
          <Text size="4" weight="bold">
            Офисы
          </Text>
          {!isAddingOffice && (
            <Button size="2" onClick={() => setIsAddingOffice(true)} title="Добавить офис">
              <PlusIcon width={16} height={16} className={styles.buttonIconMobile} />
              <span className={styles.buttonTextMobile}> Добавить офис</span>
            </Button>
          )}
        </Flex>

        <Flex direction="column" gap="3">
          {isAddingOffice && (
            <Box
              className={styles.officeCard}
              p="4"
              style={{
                border: '2px dashed var(--gray-a6)',
                borderRadius: '8px',
              }}
            >
              <Text size="3" weight="bold" mb="3" style={{ display: 'block' }}>
                Новый офис
              </Text>
              <Flex direction="column" gap="3">
                <Flex gap="4" align="stretch" wrap="nowrap">
                  <Box
                    style={{
                      flexShrink: 0,
                      alignSelf: 'stretch',
                      aspectRatio: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <Text size="2" weight="medium" style={{ display: 'block' }}>
                      Логотип офиса
                    </Text>
                    <Box style={{ flex: 1, minHeight: 0 }}>
                      <LogoUploadBox
                        logo={newOffice.logo ?? null}
                        onLogoChange={(logo) => setNewOffice((prev) => ({ ...prev, logo }))}
                        fill
                      />
                    </Box>
                  </Box>
                  <Flex direction="column" gap="3" style={{ flex: 1, minWidth: 0 }}>
                    <Box>
                      <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                        Название офиса
                      </Text>
                      <TextField.Root
                        value={newOffice.name || ''}
                        onChange={(e) => setNewOffice((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Опционально"
                        style={{ width: '100%' }}
                      />
                    </Box>
                    <Box>
                      <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                        Адрес *
                      </Text>
                      <TextField.Root
                        value={newOffice.address || ''}
                        onChange={(e) => setNewOffice((prev) => ({ ...prev, address: e.target.value }))}
                        placeholder="Введите адрес офиса"
                        style={{ width: '100%' }}
                      />
                    </Box>
                  </Flex>
                </Flex>

                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Ссылка на карте *
                  </Text>
                  <TextField.Root
                    value={newOffice.mapLink || ''}
                    onChange={(e) => setNewOffice((prev) => ({ ...prev, mapLink: e.target.value }))}
                    placeholder="https://maps.google.com/..."
                    style={{ width: '100%' }}
                  />
                </Box>

                <Flex gap="3" wrap="wrap">
                  <Box style={{ flex: '1 1 120px' }}>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Страна
                    </Text>
                    <TextField.Root
                      value={newOffice.country || ''}
                      onChange={(e) => setNewOffice((prev) => ({ ...prev, country: e.target.value }))}
                      placeholder="Беларусь"
                      style={{ width: '100%' }}
                    />
                  </Box>
                  <Box style={{ flex: '1 1 120px' }}>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Город
                    </Text>
                    <TextField.Root
                      value={newOffice.city || ''}
                      onChange={(e) => setNewOffice((prev) => ({ ...prev, city: e.target.value }))}
                      placeholder="Минск"
                      style={{ width: '100%' }}
                    />
                  </Box>
                  <Box style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                      Часовой пояс
                    </Text>
                    <Select.Root
                      value={newOffice.timezone || 'Europe/Minsk'}
                      onValueChange={(v) => setNewOffice((prev) => ({ ...prev, timezone: v }))}
                    >
                      <Select.Trigger style={{ width: '100%' }} />
                      <Select.Content>
                        {TIMEZONE_OPTIONS.map((o) => (
                          <Select.Item key={o.value} value={o.value}>
                            {o.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Box>
                </Flex>

                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Как пройти
                  </Text>
                  <TextArea
                    value={newOffice.directions || ''}
                    onChange={(e) =>
                      setNewOffice((prev) => ({ ...prev, directions: e.target.value }))
                    }
                    placeholder="Описание как добраться до офиса"
                    style={{ width: '100%' }}
                    rows={3}
                  />
                </Box>

                <Box>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Описание
                  </Text>
                  <TextArea
                    value={newOffice.description || ''}
                    onChange={(e) =>
                      setNewOffice((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Дополнительное описание офиса"
                    style={{ width: '100%' }}
                    rows={2}
                  />
                </Box>

                <Flex gap="2" justify="end" mt="2">
                  <Button variant="soft" onClick={handleCancelAdd} title="Отмена">
                    <Cross2Icon width={16} height={16} className={styles.buttonIconMobile} />
                    <span className={styles.buttonTextMobile}> Отмена</span>
                  </Button>
                  <Button onClick={handleAddOffice} title="Добавить">
                    <CheckIcon width={16} height={16} className={styles.buttonIconMobile} />
                    <span className={styles.buttonTextMobile}> Добавить</span>
                  </Button>
                </Flex>
              </Flex>
            </Box>
          )}

          {offices.map((office) => (
            <OfficeCard
              key={office.id}
              office={office}
              isEditing={editingOfficeId === office.id}
              onEdit={() => handleEditOffice(office.id)}
              onSave={(updated) => handleSaveOffice(office.id, updated)}
              onCancel={() => setEditingOfficeId(null)}
              onDelete={() => handleDeleteOffice(office.id)}
              onSetMain={() => handleSetMainOffice(office.id)}
            />
          ))}
        </Flex>
      </Card>
    </Flex>
  )
}

interface OfficeCardProps {
  office: Office
  isEditing: boolean
  onEdit: () => void
  onSave: (updated: Partial<Office>) => void
  onCancel: () => void
  onDelete: () => void
  onSetMain: () => void
}

function OfficeCard({
  office,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onSetMain,
}: OfficeCardProps) {
  const [formData, setFormData] = useState<Partial<Office>>(office)

  useEffect(() => {
    if (isEditing) {
      setFormData(office)
    }
  }, [isEditing, office])

  const handleSave = () => {
    onSave(formData)
  }

  const handleCancel = () => {
    setFormData(office)
    onCancel()
  }

  if (isEditing) {
    return (
      <Box
        className={styles.officeCard}
        p="4"
        style={{
          border: '1px solid var(--gray-a6)',
          borderRadius: '8px',
          background: 'var(--color-panel)',
        }}
      >
        <Flex justify="between" align="center" mb="3">
          <Text size="3" weight="bold">
            Редактирование офиса
          </Text>
          {office.isMain && (
            <Box className={styles.mainBadge} title="Основной">
              <StarFilledIcon width={14} height={14} className={styles.mainBadgeIcon} aria-hidden />
              <Text size="1" weight="bold" className={styles.mainBadgeText}>
                Основной
              </Text>
            </Box>
          )}
        </Flex>

        <Flex direction="column" gap="3">
          <Flex gap="4" align="stretch" wrap="nowrap">
            <Box
              style={{
                flexShrink: 0,
                alignSelf: 'stretch',
                aspectRatio: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <Text size="2" weight="medium" style={{ display: 'block' }}>
                Логотип офиса
              </Text>
              <Box style={{ flex: 1, minHeight: 0 }}>
                <LogoUploadBox
                  logo={formData.logo ?? null}
                  onLogoChange={(logo) => setFormData((prev) => ({ ...prev, logo }))}
                  fill
                />
              </Box>
            </Box>
            <Flex direction="column" gap="3" style={{ flex: 1, minWidth: 0 }}>
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Название офиса
                </Text>
                <TextField.Root
                  value={formData.name || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Опционально"
                  style={{ width: '100%' }}
                />
              </Box>
              <Box>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Адрес *
                </Text>
                <TextField.Root
                  value={formData.address || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  style={{ width: '100%' }}
                />
              </Box>
            </Flex>
          </Flex>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Ссылка на карте *
            </Text>
            <TextField.Root
              value={formData.mapLink || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, mapLink: e.target.value }))}
              style={{ width: '100%' }}
            />
          </Box>

          <Flex gap="3" wrap="wrap">
            <Box style={{ flex: '1 1 120px' }}>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Страна
              </Text>
              <TextField.Root
                value={formData.country || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                style={{ width: '100%' }}
              />
            </Box>
            <Box style={{ flex: '1 1 120px' }}>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Город
              </Text>
              <TextField.Root
                value={formData.city || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Минск"
                style={{ width: '100%' }}
              />
            </Box>
            <Box style={{ flex: '1 1 200px', minWidth: 0 }}>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Часовой пояс
              </Text>
              <Select.Root
                value={formData.timezone || 'Europe/Minsk'}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, timezone: v }))}
              >
                <Select.Trigger style={{ width: '100%' }} />
                <Select.Content>
                  {TIMEZONE_OPTIONS.map((o) => (
                    <Select.Item key={o.value} value={o.value}>
                      {o.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Как пройти
            </Text>
            <TextArea
              value={formData.directions || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, directions: e.target.value }))
              }
              style={{ width: '100%' }}
              rows={3}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
              Описание
            </Text>
            <TextArea
              value={formData.description || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Дополнительное описание офиса"
              style={{ width: '100%' }}
              rows={2}
            />
          </Box>

          <Flex gap="2" justify="between" mt="2">
            <Button variant="soft" color="red" onClick={onDelete} className={styles.actionButton} title="Удалить">
              <TrashIcon width={16} height={16} className={styles.buttonIconMobile} />
              <span className={styles.buttonTextMobile}> Удалить</span>
            </Button>
            <Flex gap="2">
              <Button variant="soft" onClick={handleCancel} title="Отмена">
                <Cross2Icon width={16} height={16} className={styles.buttonIconMobile} />
                <span className={styles.buttonTextMobile}> Отмена</span>
              </Button>
              <Button onClick={handleSave} title="Сохранить">
                <CheckIcon width={16} height={16} className={styles.buttonIconMobile} />
                <span className={styles.buttonTextMobile}> Сохранить</span>
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    )
  }

  const locationParts = [office.country, office.city].filter(Boolean)
  const locationStr = locationParts.join(', ')

  return (
    <Box
      className={styles.officeCard}
      p="4"
      style={{
        border: '1px solid var(--gray-a6)',
        borderRadius: '8px',
        background: 'var(--color-panel)',
      }}
    >
      <Flex justify="between" align="start" mb="3" className={styles.officeCardRow}>
        <Flex direction="column" gap="2" style={{ flex: 1 }}>
          <Flex align="center" gap="3">
            {office.logo && (
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'var(--gray-2)',
                }}
              >
                <img
                  src={office.logo}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </Box>
            )}
            <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
              <Flex align="center" gap="2" wrap="wrap">
                <Text size="3" weight="bold">
                  {office.name || office.address}
                </Text>
                {office.isMain && (
                  <Box className={styles.mainBadge} title="Основной">
                    <StarFilledIcon width={14} height={14} className={styles.mainBadgeIcon} aria-hidden />
                    <Text size="1" weight="bold" className={styles.mainBadgeText}>
                      Основной
                    </Text>
                  </Box>
                )}
              </Flex>
              {office.name && (
                <Text size="2" color="gray">
                  {office.address}
                </Text>
              )}
            </Flex>
          </Flex>
          <Flex align="center" gap="2" wrap="wrap" style={{ flexWrap: 'wrap' }}>
            {locationStr && (
              <Text size="2" color="gray">
                {locationStr}
              </Text>
            )}
            {locationStr && office.timezone && (
              <Text size="2" color="gray">
                ·
              </Text>
            )}
            {office.timezone && (
              <Text size="2" color="gray">
                {office.timezone}
              </Text>
            )}
            {(locationStr || office.timezone) && office.mapLink && (
              <Text size="2" color="gray">·</Text>
            )}
            {office.mapLink && (
              <a
                href={office.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--accent-11)', fontSize: 'var(--font-size-2)' }}
              >
                Открыть на карте →
              </a>
            )}
          </Flex>
          {office.directions && (
            <Box>
              <Text size="1" weight="medium" color="gray" mb="1" style={{ display: 'block' }}>
                Как пройти
              </Text>
              <Box className={styles.quote}>
                <Text size="2" color="gray" style={{ whiteSpace: 'pre-wrap' }}>
                  {office.directions}
                </Text>
              </Box>
            </Box>
          )}
          {office.description && (
            <Box>
              <Text size="1" weight="medium" color="gray" mb="1" style={{ display: 'block' }}>
                Описание
              </Text>
              <Text size="2" color="gray" style={{ whiteSpace: 'pre-wrap' }}>
                {office.description}
              </Text>
            </Box>
          )}
        </Flex>
        <Flex gap="1" className={styles.officeCardActions}>
          {!office.isMain && (
            <Button
              variant="ghost"
              size="1"
              onClick={onSetMain}
              title="Сделать основным"
              className={styles.actionButton}
            >
              <CheckIcon width={14} height={14} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="1"
            onClick={onEdit}
            title="Редактировать"
            className={styles.actionButton}
          >
            <Pencil2Icon width={14} height={14} />
          </Button>
          <Button
            variant="ghost"
            size="1"
            color="red"
            onClick={onDelete}
            title="Удалить"
            className={styles.actionButton}
          >
            <TrashIcon width={14} height={14} />
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}
