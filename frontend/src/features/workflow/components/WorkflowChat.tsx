'use client'

import { Box, Button, Flex, Text, TextArea } from '@radix-ui/themes'
import { PaperPlaneIcon } from '@radix-ui/react-icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './WorkflowChat.module.css'

type MessageType = 'user' | 'assistant'

interface ChatMessage {
  id: string
  type: MessageType
  content: string
  timestamp: string
}

function nowRu() {
  return new Date().toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function WorkflowChat() {
  const initialMessages = useMemo<ChatMessage[]>(
    () => [
      {
        id: 'm1',
        type: 'assistant',
        content: 'Добро пожаловать в Workflow. Введите команду (например, #hr_screening) или сообщение.',
        timestamp: '08.01.2026 10:00',
      },
      {
        id: 'm2',
        type: 'user',
        content: '#hr_screening https://huntflow.ru/...\\n1) ожидаю от 1300$ ...',
        timestamp: '08.01.2026 11:15',
      },
      {
        id: 'm3',
        type: 'assistant',
        content: 'Данные сохранены и переданы в Huntflow (мок).',
        timestamp: '08.01.2026 11:16',
      },
    ],
    [],
  )

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [message, setMessage] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages.length])

  const send = () => {
    const trimmed = message.trim()
    if (!trimmed) return
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, type: 'user', content: trimmed, timestamp: nowRu() }
    const botMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      type: 'assistant',
      content: trimmed.startsWith('#') ? 'Команда принята в обработку (мок).' : 'Сообщение отправлено (мок).',
      timestamp: nowRu(),
    }
    setMessages((prev) => [...prev, userMsg, botMsg])
    setMessage('')
  }

  return (
    <Box className={styles.chatContainer}>
      <Box className={styles.chatHeader}>
        <Text size="3" weight="bold" style={{ color: '#ffffff' }}>
          Workflow chat
        </Text>
      </Box>

      <Box className={styles.messagesWrapper}>
        <Box ref={containerRef} className={styles.messagesContainer}>
          {messages.map((m) => (
            <Box
              key={m.id}
              className={`${styles.messageWrapper} ${m.type === 'user' ? styles.messageUser : styles.messageAssistant}`}
            >
              <Box
                className={`${styles.messageBubble} ${
                  m.type === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant
                }`}
              >
                <Text size="2" style={{ whiteSpace: 'pre-wrap' }}>
                  {m.content}
                </Text>
                <Box className={styles.messageTimestamp}>{m.timestamp}</Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box className={styles.composer}>
        <Flex className={styles.composerRow}>
          <TextArea
            className={styles.composerTextarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Введите сообщение или команду..."
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                send()
              }
            }}
          />
          <Button onClick={send}>
            <PaperPlaneIcon />
            Отправить
          </Button>
        </Flex>
        <Text size="1" color="gray" mt="2" style={{ display: 'block' }}>
          Отправка: Enter+Ctrl/⌘ или кнопка.
        </Text>
      </Box>
    </Box>
  )
}

