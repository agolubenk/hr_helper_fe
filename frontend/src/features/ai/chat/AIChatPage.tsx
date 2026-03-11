'use client'

import { Box, Button, Flex, Text, TextArea, TextField } from '@radix-ui/themes'
import { ChatBubbleIcon, PlusIcon } from '@radix-ui/react-icons'
import { useMemo, useRef, useState } from 'react'
import styles from './AIChatPage.module.css'

type Role = 'user' | 'assistant'

interface ChatSummary {
  id: string
  title: string
  createdAt: string
  lastMessage?: string
}

interface Message {
  id: string
  role: Role
  content: string
  timestamp: string
}

function nowRu() {
  const d = new Date()
  return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function AIChatPage() {
  const initialChats = useMemo<ChatSummary[]>(
    () => [
      {
        id: '1',
        title: 'Чат 10.10.2025 20:57',
        createdAt: '10.10.2025 23:57',
        lastMessage: 'Расскажи сказку про колобка',
      },
      {
        id: '2',
        title: 'Так назову',
        createdAt: '05.10.2025 18:17',
        lastMessage: 'Привет!',
      },
    ],
    [],
  )

  const initialMessages = useMemo<Record<string, Message[]>>(
    () => ({
      '1': [
        {
          id: '1',
          role: 'user',
          content: 'Покажи примеры форматирования текста',
          timestamp: '10.10.2025 23:57',
        },
        {
          id: '2',
          role: 'assistant',
          content:
            'Вот пример ответа ассистента.\n\n— Жирный текст\n— Курсива пока нет (упрощённый рендер)\n— Блок кода и цитаты можно будет добавить позже.',
          timestamp: '10.10.2025 23:58',
        },
      ],
    }),
    [],
  )

  const [chats, setChats] = useState<ChatSummary[]>(initialChats)
  const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>(initialMessages)
  const [selectedChatId, setSelectedChatId] = useState<string>(initialChats[0]?.id ?? '1')
  const [draft, setDraft] = useState('')

  const messages = messagesByChat[selectedChatId] ?? []
  const messagesRef = useRef<HTMLDivElement | null>(null)

  const createChat = () => {
    const id = String(Date.now())
    const ts = nowRu()
    const next: ChatSummary = { id, title: `Чат ${ts}`, createdAt: ts }
    setChats((prev) => [next, ...prev])
    setSelectedChatId(id)
  }

  const send = () => {
    const content = draft.trim()
    if (!content) return
    const ts = nowRu()
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content, timestamp: ts }
    const answer: Message = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: 'Это моковый AI‑ответ. В реальной системе здесь будет интеграция с моделью.',
      timestamp: ts,
    }
    setMessagesByChat((prev) => {
      const prevArr = prev[selectedChatId] ?? []
      return { ...prev, [selectedChatId]: [...prevArr, userMsg, answer] }
    })
    setChats((prev) =>
      prev.map((c) => (c.id === selectedChatId ? { ...c, lastMessage: content || c.lastMessage, createdAt: c.createdAt } : c)),
    )
    setDraft('')
    queueMicrotask(() => {
      const el = messagesRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }

  return (
    <Box className={styles.aichatContainer}>
      <Flex className={styles.mainContent}>
        <Box className={styles.sidebarColumn}>
          <Box className={styles.historyHeader}>
            <Text size="2" weight="bold">
              Чаты
            </Text>
          </Box>
          <Box className={styles.historyList}>
            {chats.map((chat) => (
              <Box
                key={chat.id}
                className={`${styles.historyItem} ${chat.id === selectedChatId ? styles.historyItemSelected : ''}`}
                onClick={() => setSelectedChatId(chat.id)}
              >
                <Text className={styles.historyTitle}>
                  <ChatBubbleIcon /> {chat.title}
                </Text>
                {chat.lastMessage && (
                  <Text className={styles.historyMeta} truncate>
                    {chat.lastMessage}
                  </Text>
                )}
              </Box>
            ))}
          </Box>
          <Button mt="3" size="2" onClick={createChat}>
            <PlusIcon /> Новый чат
          </Button>
        </Box>

        <Box className={styles.chatColumn}>
          <Box className={styles.chatCard}>
            <Box className={styles.messagesWrapper}>
              <Box ref={messagesRef} className={styles.messagesContainer}>
                {messages.map((m) => (
                  <Box
                    key={m.id}
                    className={m.role === 'user' ? styles.messageUser : styles.messageAssistant}
                  >
                    <Box
                      className={`${styles.messageBubble} ${
                        m.role === 'user' ? styles.messageUserBubble : styles.messageAssistantBubble
                      }`}
                    >
                      <Text size="2">{m.content}</Text>
                      <Box className={styles.messageTimestamp}>{m.timestamp}</Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box className={styles.inputContainer}>
              <Flex className={styles.composerRow}>
                <TextArea
                  className={styles.composerTextarea}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Задайте вопрос ассистенту..."
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault()
                      send()
                    }
                  }}
                />
                <Button onClick={send} disabled={!draft.trim()}>
                  Отправить
                </Button>
              </Flex>
              <Text size="1" color="gray" mt="2" style={{ display: 'block' }}>
                Отправка: Ctrl/⌘ + Enter.
              </Text>
            </Box>
          </Box>
        </Box>
      </Flex>
    </Box>
  )
}

