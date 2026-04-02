import { Box, Button, Callout, Card, Flex, Select, Text, TextArea } from '@radix-ui/themes'
import { useState } from 'react'
import { Link } from '@/router-adapter'
import { useToast } from '@/components/Toast/ToastContext'
import styles from './styles/LearningFeedbackPage.module.css'

type FeedbackTopic = 'technical' | 'content' | 'idea' | 'other'

const TOPIC_LABEL: Record<FeedbackTopic, string> = {
  technical: 'Техническая проблема (LMS, доступы)',
  content: 'Контент курсов и материалов',
  idea: 'Идея по развитию L&D',
  other: 'Другое',
}

export function LearningFeedbackPage() {
  const { showSuccess, showError } = useToast()
  const [topic, setTopic] = useState<FeedbackTopic>('content')
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')

  const submit = () => {
    if (!message.trim()) {
      showError('Форма', 'Введите текст сообщения.')
      return
    }
    showSuccess('Отправлено (мок)', 'Сообщение записано локально; в продукте уйдёт в тикет или почту L&D.')
    setMessage('')
    setContact('')
  }

  return (
    <Box className={styles.wrapper}>
      <Flex direction="column" gap="2" mb="4">
        <Text size="6" weight="bold">
          Обратная связь
        </Text>
        <Text size="2" color="gray" className={styles.lead}>
          Сообщения для команды обучения и развития: ошибки в LMS, качество материалов, пожелания по программам.
          Данные на этом этапе не уходят на сервер — имитация отправки.
        </Text>
      </Flex>

      <Callout.Root color="blue" mb="4">
        <Callout.Text>
          Нужна срочная помощь по доступу? Напишите также в{' '}
          <Link href="/workflow">рабочий чат</Link> или откройте заявку в HROps через меню.
        </Callout.Text>
      </Callout.Root>

      <Card size="2" variant="surface" className={styles.card}>
        <Flex direction="column" gap="4">
          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Тема
            </Text>
            <Select.Root value={topic} onValueChange={(v) => setTopic(v as FeedbackTopic)}>
              <Select.Trigger className={styles.selectTrigger} placeholder="Выберите тему" />
              <Select.Content position="popper">
                {(Object.keys(TOPIC_LABEL) as FeedbackTopic[]).map((key) => (
                  <Select.Item key={key} value={key}>
                    {TOPIC_LABEL[key]}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Сообщение
            </Text>
            <TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Опишите ситуацию: что делали, что ожидали, что произошло…"
              className={styles.textArea}
            />
          </Box>

          <Box>
            <Text size="2" weight="medium" mb="2" as="div">
              Контакт для ответа (необязательно)
            </Text>
            <TextArea
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              rows={2}
              placeholder="Корпоративная почта, Telegram @ник, внутренний номер…"
              className={styles.textArea}
            />
          </Box>

          <Flex justify="end">
            <Button onClick={submit} disabled={!message.trim()}>
              Отправить (мок)
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Box>
  )
}
