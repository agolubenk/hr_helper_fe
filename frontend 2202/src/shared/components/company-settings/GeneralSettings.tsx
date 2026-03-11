import { Box, Flex, Text, TextField, TextArea, Button, Card, Switch, Select } from '@radix-ui/themes'
import { useState, useRef } from 'react'
import { PlusIcon, TrashIcon, Pencil2Icon, CheckIcon, Cross2Icon, StarFilledIcon } from '@radix-ui/react-icons'
import { useToast } from '@/shared/components/feedback/Toast'
import styles from './GeneralSettings.module.css'

interface Office {
  id: number
  name?: string
  logo?: string | null
  address: string
  mapLink: string
  country: string
  city?: string
  directions: string
  description?: string
  isMain: boolean
}

function LogoUploadBox({
  logo,
  onLogoChange,
  size = 80,
  fill,
}: {
  logo: string | null
  onLogoChange: (logo: string | null) => void
  size?: number
  fill?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)

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

  const boxStyle: React.CSSProperties = fill
    ? {
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        border: '1px solid var(--gray-a6)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gray-2)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }
    : {
        width: size,
        height: size,
        border: '1px solid var(--gray-a6)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gray-2)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }

  return (
    <>
      <Box
        onClick={handleClick}
        style={boxStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent-9)'
          e.currentTarget.style.backgroundColor = 'var(--gray-3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--gray-a6)'
          e.currentTarget.style.backgroundColor = 'var(--gray-2)'
        }}
      >
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
  tax_id: '123456789',
  headquarters_country: 'BY',
  headquarters_city: 'Минск',
  timezone: 'Europe/Minsk',
  industry: 'IT',
  company_size: 150,
  fiscal_year_start: '01-01',
  default_work_schedule: 'full-time',
  probation_period_days: 90,
  notice_period_days: 30,
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

const INDUSTRY_OPTIONS = [
  { value: 'IT', label: 'IT и разработка' },
  { value: 'finance', label: 'Финансы' },
  { value: 'retail', label: 'Ритейл' },
  { value: 'manufacturing', label: 'Производство' },
  { value: 'services', label: 'Услуги' },
]

const SCHEDULE_OPTIONS = [
  { value: 'full-time', label: 'Полная занятость' },
  { value: 'part-time', label: 'Частичная занятость' },
]

export default function GeneralSettings() {
  const toast = useToast()
  const [companyName, setCompanyName] = useState(mockCompanyData.name)
  const [legalName, setLegalName] = useState(mockCompanyData.legal_name)
  const [taxId, setTaxId] = useState(mockCompanyData.tax_id)
  const [headquartersCountry, setHeadquartersCountry] = useState(mockCompanyData.headquarters_country)
  const [headquartersCity, setHeadquartersCity] = useState(mockCompanyData.headquarters_city)
  const [timezone, setTimezone] = useState(mockCompanyData.timezone)
  const [industry, setIndustry] = useState(mockCompanyData.industry)
  const [companySize, setCompanySize] = useState(String(mockCompanyData.company_size))
  const [fiscalYearStart, setFiscalYearStart] = useState(mockCompanyData.fiscal_year_start)
  const [defaultWorkSchedule, setDefaultWorkSchedule] = useState(mockCompanyData.default_work_schedule)
  const [probationPeriodDays, setProbationPeriodDays] = useState(String(mockCompanyData.probation_period_days))
  const [noticePeriodDays, setNoticePeriodDays] = useState(String(mockCompanyData.notice_period_days))
  const [isActive, setIsActive] = useState(mockCompanyData.is_active)
  const [calendarLink, setCalendarLink] = useState(mockCompanyData.calendarLink)
  const [logo, setLogo] = useState<string | null>(mockCompanyData.logo)
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
    directions: '',
    description: '',
    isMain: false,
  })
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
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Логотип компании
              </Text>
              <LogoUploadBox logo={logo} onLogoChange={setLogo} size={120} />
            </Box>

            <Flex direction="column" gap="4" style={{ flex: 1 }} className={styles.generalSettingsFormColumn}>
              <Box>
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
              <Box>
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
              <Flex gap="3" wrap="wrap">
                <Box style={{ flex: '1 1 200px' }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    ИНН / Tax ID
                  </Text>
                  <TextField.Root
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="123456789"
                    style={{ width: '100%' }}
                  />
                </Box>
                <Box style={{ flex: '1 1 120px' }}>
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
                <Box style={{ flex: '1 1 120px' }}>
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
              </Flex>
              <Flex gap="3" wrap="wrap">
                <Box style={{ flex: '1 1 200px' }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Часовой пояс
                  </Text>
                  <Select.Root value={timezone} onValueChange={setTimezone}>
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
                <Box style={{ flex: '1 1 150px' }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Отрасль
                  </Text>
                  <Select.Root value={industry} onValueChange={setIndustry}>
                    <Select.Trigger style={{ width: '100%' }} />
                    <Select.Content>
                      {INDUSTRY_OPTIONS.map((o) => (
                        <Select.Item key={o.value} value={o.value}>
                          {o.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
                <Box style={{ flex: '1 1 100px' }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Численность
                  </Text>
                  <TextField.Root
                    type="number"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    placeholder="150"
                    style={{ width: '100%' }}
                  />
                </Box>
              </Flex>
              <Flex gap="3" wrap="wrap">
                <Box style={{ flex: '1 1 120px' }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Начало фин. года (ММ-ДД)
                  </Text>
                  <TextField.Root
                    value={fiscalYearStart}
                    onChange={(e) => setFiscalYearStart(e.target.value)}
                    placeholder="01-01"
                    style={{ width: '100%' }}
                  />
                </Box>
                <Box style={{ flex: '1 1 180px' }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    График по умолчанию
                  </Text>
                  <Select.Root value={defaultWorkSchedule} onValueChange={setDefaultWorkSchedule}>
                    <Select.Trigger style={{ width: '100%' }} />
                    <Select.Content>
                      {SCHEDULE_OPTIONS.map((o) => (
                        <Select.Item key={o.value} value={o.value}>
                          {o.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
                <Box style={{ flex: '1 1 100px' }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Испытательный (дней)
                  </Text>
                  <TextField.Root
                    type="number"
                    value={probationPeriodDays}
                    onChange={(e) => setProbationPeriodDays(e.target.value)}
                    placeholder="90"
                    style={{ width: '100%' }}
                  />
                </Box>
                <Box style={{ flex: '1 1 100px' }}>
                  <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                    Срок уведомления (дней)
                  </Text>
                  <TextField.Root
                    type="number"
                    value={noticePeriodDays}
                    onChange={(e) => setNoticePeriodDays(e.target.value)}
                    placeholder="30"
                    style={{ width: '100%' }}
                  />
                </Box>
              </Flex>
              <Box>
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
              <Flex align="center" gap="2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Text size="2">Компания активна</Text>
              </Flex>
              <Text size="1" color="gray">
                Создана: {new Date(mockCompanyData.created_at).toLocaleDateString('ru-RU')}
              </Text>
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
            {locationStr && office.mapLink && (
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
