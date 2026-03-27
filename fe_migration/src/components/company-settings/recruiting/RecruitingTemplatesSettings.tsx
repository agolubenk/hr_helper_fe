'use client'

import { ArrowRightIcon, ChatBubbleIcon, EnvelopeClosedIcon, FileTextIcon } from '@radix-ui/react-icons'
import { Badge, Box, Button, Card, Checkbox, Dialog, Flex, Select, Separator, Text, TextArea, TextField } from '@radix-ui/themes'
import { useMemo, useState, type ComponentType } from 'react'
import { Link } from '@/router-adapter'
import styles from './RecruitingTemplatesSettings.module.css'

interface TemplateSectionLink {
  href: string
  title: string
  description: string
  icon: ComponentType<{ width?: string | number; height?: string | number }>
  meta: string
}

const TEMPLATE_SECTIONS: TemplateSectionLink[] = [
  {
    href: '/company-settings/recruiting/response-templates',
    title: 'Шаблоны ответов кандидатам',
    description: 'Шаблоны ответов по сценариям: отклик, приглашение, перенос, отказ и follow-up.',
    icon: ChatBubbleIcon,
    meta: 'Операционные ответы рекрутера',
  },
  {
    href: '/company-settings/recruiting/offer-template',
    title: 'Шаблон оффера',
    description: 'Шаблон оффера, переменные подстановки и контент для отправки кандидату.',
    icon: FileTextIcon,
    meta: 'Документы и юридические блоки',
  },
  {
    href: '/company-settings/recruiting/message-templates',
    title: 'Шаблоны писем и сообщений',
    description: 'Библиотека email и мессенджер-коммуникаций по этапам воронки найма.',
    icon: EnvelopeClosedIcon,
    meta: 'Email / Telegram / чат',
  },
]

type Channel = 'Email' | 'Telegram' | 'Чат'
type Stage = 'Отклик' | 'Скрининг' | 'Интервью' | 'Оффер' | 'Онбординг'

interface MessageTemplate {
  id: string
  title: string
  channels: Channel[]
  stage: Stage
  purpose: string
  subject?: string
  body: string
  vars: string[]
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'reply-auto',
    title: 'Подтверждение получения отклика',
    channels: ['Email', 'Telegram'],
    stage: 'Отклик',
    purpose: 'Сообщить кандидату, что отклик принят в работу.',
    subject: 'Мы получили ваш отклик на {{vacancy_title}}',
    body: 'Здравствуйте, {{candidate_firstname}}!\nСпасибо за интерес к позиции {{vacancy_title}}. Мы уже передали ваш отклик рекрутеру {{recruiter_name}}.',
    vars: ['candidate_firstname', 'vacancy_title', 'recruiter_name'],
  },
  {
    id: 'screening-invite',
    title: 'Приглашение на HR-скрининг',
    channels: ['Email', 'Чат'],
    stage: 'Скрининг',
    purpose: 'Предложить кандидату удобный слот и формат встречи.',
    subject: 'Приглашение на HR-скрининг — {{vacancy_title}}',
    body: 'Добрый день, {{candidate_firstname}}!\nПредлагаем созвон на 20–30 минут по позиции {{vacancy_title}}. Доступные слоты: {{slots}}.',
    vars: ['candidate_firstname', 'vacancy_title', 'slots'],
  },
  {
    id: 'tech-interview-confirm',
    title: 'Подтверждение технического интервью',
    channels: ['Email', 'Telegram'],
    stage: 'Интервью',
    purpose: 'Подтвердить время, участников и формат интервью.',
    subject: 'Подтверждение интервью: {{date_full}} в {{time_local}}',
    body: 'Подтверждаем интервью {{date_full}} в {{time_local}}.\nИнтервьюеры: {{interviewer_names}}. Ссылка на встречу: {{meeting_link}}.',
    vars: ['date_full', 'time_local', 'interviewer_names', 'meeting_link'],
  },
  {
    id: 'offer-ready',
    title: 'Оффер готов к отправке',
    channels: ['Email'],
    stage: 'Оффер',
    purpose: 'Уведомление кандидату о подготовке оффера.',
    subject: 'Оффер по позиции {{vacancy_title}}',
    body: 'Рады сообщить, что подготовили для вас оффер на позицию {{vacancy_title}}. Основные условия: {{offer_summary}}.',
    vars: ['vacancy_title', 'offer_summary'],
  },
  {
    id: 'onboarding-first-day',
    title: 'Инструкции к первому рабочему дню',
    channels: ['Email', 'Telegram'],
    stage: 'Онбординг',
    purpose: 'Направить чеклист и контакты перед стартом.',
    subject: 'Ваш первый день в {{company_name}}',
    body: 'Добро пожаловать в {{company_name}}!\nВаш старт: {{start_date}}. Контакт HRBP: {{hrbp_name}}. Чеклист: {{onboarding_link}}.',
    vars: ['company_name', 'start_date', 'hrbp_name', 'onboarding_link'],
  },
]

const CHANNEL_OPTIONS: Channel[] = ['Email', 'Telegram', 'Чат']
const STAGE_OPTIONS: Stage[] = ['Отклик', 'Скрининг', 'Интервью', 'Оффер', 'Онбординг']

const channelColor: Record<Channel, 'blue' | 'teal' | 'purple'> = {
  Email: 'blue',
  Telegram: 'teal',
  Чат: 'purple',
}

const stageColor: Record<Stage, 'gray' | 'indigo' | 'cyan' | 'green' | 'orange'> = {
  Отклик: 'gray',
  Скрининг: 'indigo',
  Интервью: 'cyan',
  Оффер: 'green',
  Онбординг: 'orange',
}

export function RecruitingTemplatesSettings() {
  return (
    <Box className={styles.wrap}>
      <Text size="2" className={styles.lead}>
        Центральная точка управления коммуникационными шаблонами рекрутинга: ответы, офферные материалы и библиотека сообщений.
      </Text>

      <Box className={styles.grid}>
        {TEMPLATE_SECTIONS.map((section) => {
          const Icon = section.icon
          return (
            <Link key={section.href} href={section.href} className={styles.cardLink}>
              <Card className={styles.card}>
                <div className={styles.cardTitleRow}>
                  <Flex align="center" gap="2">
                    <Icon width={18} height={18} />
                    <Text size="3" weight="medium">
                      {section.title}
                    </Text>
                  </Flex>
                  <ArrowRightIcon width={16} height={16} />
                </div>
                <Text size="2" className={styles.cardDesc}>
                  {section.description}
                </Text>
                <Text className={styles.meta}>{section.meta}</Text>
              </Card>
            </Link>
          )
        })}
      </Box>
    </Box>
  )
}

export function RecruitingMessageTemplatesSettings() {
  const [templates, setTemplates] = useState<MessageTemplate[]>(MESSAGE_TEMPLATES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState<Omit<MessageTemplate, 'id'>>({
    title: '',
    channels: ['Email'],
    stage: 'Отклик',
    purpose: '',
    subject: '',
    body: '',
    vars: [],
  })
  const [varsInput, setVarsInput] = useState('')

  const isEditing = useMemo(() => editingId !== null, [editingId])

  const resetForm = () => {
    setEditingId(null)
    setForm({
      title: '',
      channels: ['Email'],
      stage: 'Отклик',
      purpose: '',
      subject: '',
      body: '',
      vars: [],
    })
    setVarsInput('')
  }

  const openCreate = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEdit = (tpl: MessageTemplate) => {
    setEditingId(tpl.id)
    setForm({
      title: tpl.title,
      channels: tpl.channels,
      stage: tpl.stage,
      purpose: tpl.purpose,
      subject: tpl.subject ?? '',
      body: tpl.body,
      vars: tpl.vars,
    })
    setVarsInput(tpl.vars.join(', '))
    setIsDialogOpen(true)
  }

  const toggleChannel = (channel: Channel, checked: boolean) => {
    setForm((prev) => {
      const already = prev.channels.includes(channel)
      if (checked && !already) return { ...prev, channels: [...prev.channels, channel] }
      if (!checked && already) {
        const next = prev.channels.filter((c) => c !== channel)
        return { ...prev, channels: next.length > 0 ? next : ['Email'] }
      }
      return prev
    })
  }

  const parseVars = (raw: string): string[] => {
    return raw
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((v) => v.replace(/^\{\{|\}\}$/g, ''))
  }

  const handleSave = () => {
    if (!form.title.trim() || !form.body.trim()) return
    const normalized: Omit<MessageTemplate, 'id'> = {
      ...form,
      title: form.title.trim(),
      purpose: form.purpose.trim(),
      subject: form.subject?.trim() || undefined,
      body: form.body.trim(),
      vars: parseVars(varsInput),
    }

    if (editingId) {
      setTemplates((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...normalized } : t)))
    } else {
      setTemplates((prev) => [{ id: `custom-${Date.now()}`, ...normalized }, ...prev])
    }
    setIsDialogOpen(false)
    resetForm()
  }

  return (
    <Box className={styles.wrap}>
      <Flex justify="between" align="center" gap="3" wrap="wrap">
        <Text size="2" className={styles.lead}>
          Базовый каталог сообщений для ключевых этапов найма. Можно использовать как стартовые шаблоны до подключения API.
        </Text>
        <Button size="2" onClick={openCreate}>
          Создать шаблон
        </Button>
      </Flex>

      <Box className={styles.section}>
        <div className={styles.sectionHeader}>
          <Text size="4" weight="bold">
            Готовые шаблоны
          </Text>
          <Badge size="2" color="gray">
            {templates.length} шаблонов
          </Badge>
        </div>
        <Separator size="4" mb="3" />

        <Box className={styles.templatesGrid}>
          {templates.map((tpl) => (
            <Card key={tpl.id} className={styles.templateCard}>
              <Flex justify="between" align="start" gap="2">
                <Text size="3" weight="medium" className={styles.templateTitle}>
                  {tpl.title}
                </Text>
                <Button variant="soft" size="1" onClick={() => openEdit(tpl)}>
                  Изменить
                </Button>
              </Flex>
              <div className={styles.chips}>
                <Badge size="1" color={stageColor[tpl.stage]}>
                  {tpl.stage}
                </Badge>
                {tpl.channels.map((channel) => (
                  <Badge key={channel} size="1" color={channelColor[channel]}>
                    {channel}
                  </Badge>
                ))}
              </div>

              <Text className={styles.templateMeta}>{tpl.purpose}</Text>
              {tpl.subject ? <Text className={styles.subject}>Тема: {tpl.subject}</Text> : null}
              <div className={styles.bodyPreview}>{tpl.body}</div>

              <Flex wrap="wrap" gap="1" mt="2">
                {tpl.vars.map((v) => (
                  <Badge key={v} size="1" variant="soft">
                    {'{{'}
                    {v}
                    {'}}'}
                  </Badge>
                ))}
              </Flex>
            </Card>
          ))}
        </Box>
      </Box>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Content style={{ maxWidth: '760px', maxHeight: '88vh', overflowY: 'auto' }}>
          <Dialog.Title>{isEditing ? 'Редактировать шаблон' : 'Создать шаблон'}</Dialog.Title>
          <Dialog.Description size="2" color="gray">
            Заполните ключевые поля шаблона и каналы отправки.
          </Dialog.Description>

          <Flex direction="column" gap="3" mt="4">
            <Box>
              <Text size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                Название шаблона *
              </Text>
              <TextField.Root
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Например: Приглашение на HR-скрининг"
              />
            </Box>

            <Flex gap="3" wrap="wrap">
              <Box style={{ flex: '1 1 220px' }}>
                <Text size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                  Этап
                </Text>
                <Select.Root value={form.stage} onValueChange={(v) => setForm((p) => ({ ...p, stage: v as Stage }))}>
                  <Select.Trigger />
                  <Select.Content>
                    {STAGE_OPTIONS.map((stage) => (
                      <Select.Item key={stage} value={stage}>
                        {stage}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
              <Box style={{ flex: '1 1 320px' }}>
                <Text size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                  Каналы
                </Text>
                <Flex gap="3" wrap="wrap">
                  {CHANNEL_OPTIONS.map((channel) => (
                    <Flex key={channel} align="center" gap="2">
                      <Checkbox
                        checked={form.channels.includes(channel)}
                        onCheckedChange={(c) => toggleChannel(channel, c === true)}
                        id={`channel-${channel}`}
                      />
                      <Text size="2" as="label" htmlFor={`channel-${channel}`}>
                        {channel}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
              </Box>
            </Flex>

            <Box>
              <Text size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                Назначение
              </Text>
              <TextField.Root
                value={form.purpose}
                onChange={(e) => setForm((p) => ({ ...p, purpose: e.target.value }))}
                placeholder="Коротко: зачем этот шаблон"
              />
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                Тема (для Email)
              </Text>
              <TextField.Root
                value={form.subject ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                placeholder="Например: Мы получили ваш отклик"
              />
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                Текст шаблона *
              </Text>
              <TextArea
                value={form.body}
                onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                rows={6}
                placeholder="Текст сообщения или письма"
              />
            </Box>

            <Box>
              <Text size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                Переменные (через запятую)
              </Text>
              <TextField.Root
                value={varsInput}
                onChange={(e) => setVarsInput(e.target.value)}
                placeholder="candidate_firstname, vacancy_title, recruiter_name"
              />
              <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                Сохранится как теги вида {'{{'}variable{'}'} в карточке шаблона.
              </Text>
            </Box>
          </Flex>

          <Flex justify="end" gap="2" mt="4">
            <Button variant="soft" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={!form.title.trim() || !form.body.trim()}>
              {isEditing ? 'Сохранить' : 'Создать'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}
