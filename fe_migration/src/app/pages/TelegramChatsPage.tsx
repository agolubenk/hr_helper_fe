/**
 * TelegramChatsPage — страница управления чатами Telegram (/telegram/chats).
 *
 * Переход на фичи интеграции: список чатов слева, окно сообщений справа.
 * Мок-данные и отправка сообщений без API.
 */

import { Box, Button, Flex, Text, TextField } from '@radix-ui/themes'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChatBubbleIcon, HamburgerMenuIcon, PaperPlaneIcon, Pencil1Icon } from '@radix-ui/react-icons'
import AppLayout from '@/components/AppLayout'
import styles from './styles/Telegram.module.css'
import chatsStyles from './styles/TelegramChatsPage.module.css'
import { useToast } from '@/components/Toast/ToastContext'
import FormattedText from '@/components/aichat/FormattedText'
import RichTextInput from '@/components/telegram/RichTextInput'

type TelegramSender = 'user' | 'telegram'

interface TelegramMessage {
  id: string
  text: string
  timestamp: string
  sender: TelegramSender
  senderName?: string
}

interface TelegramChat {
  id: string
  name: string
  avatar: string
  preview: string
  date: string
  unreadCount?: number
  messages: TelegramMessage[]
}

const initialChats: TelegramChat[] = [
  {
    id: '1',
    name: 'HR Helper — общий',
    avatar: 'H',
    preview: 'Добро пожаловать в чат',
    date: '10:32',
    unreadCount: 2,
    messages: [
      {
        id: '1',
        text: 'Добро пожаловать в чат **HR Helper**\n\n* Это мок-страница для миграции.\n* Отправляйте сообщения и смотрите их в окне чата.',
        timestamp: '10:30',
        sender: 'telegram',
        senderName: 'HR Helper',
      },
      { id: '2', text: 'Спасибо!', timestamp: '10:32', sender: 'user' },
    ],
  },
  {
    id: '2',
    name: 'Рекрутинг',
    avatar: 'Р',
    preview: 'Новая заявка по вакансии Frontend',
    date: '09:15',
    unreadCount: 0,
    messages: [
      {
        id: '1',
        text: '**Новая заявка по вакансии**\n\n**Должность:** Frontend Developer\n\n> Резюме скоро будет доступно.',
        timestamp: '09:15',
        sender: 'telegram',
        senderName: 'Рекрутинг',
      },
      { id: '2', text: 'Отлично, посмотрю.', timestamp: '09:20', sender: 'user' },
    ],
  },
  {
    id: '3',
    name: 'Поддержка',
    avatar: 'П',
    preview: 'Вопрос по интеграции Huntflow',
    date: 'Вчера',
    unreadCount: 0,
    messages: [
      {
        id: '1',
        text: '**Вопрос по интеграции Huntflow**\n\nНужна помощь с настройкой.\n\n* Синхронизация кандидатов\n* Автоматические уведомления',
        timestamp: 'Вчера 14:00',
        sender: 'telegram',
        senderName: 'Поддержка',
      },
      { id: '2', text: 'Какой именно шаг не работает?', timestamp: 'Вчера 14:05', sender: 'user' },
    ],
  },
]

export function TelegramChatsPage() {
  const toast = useToast()

  const [chats, setChats] = useState<TelegramChat[]>(initialChats)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(initialChats[0]?.id ?? null)
  const [searchQuery, setSearchQuery] = useState('')
  const [chatListOpen, setChatListOpen] = useState(false)
  const [messageDraft, setMessageDraft] = useState('')

  const [activeSubmenu, setActiveSubmenu] = useState<'account' | 'folders' | 'automation'>('account')

  const selectedChat = useMemo(
    () => chats.find((c) => c.id === selectedChatId) ?? null,
    [chats, selectedChatId]
  )

  const filteredChats = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return chats
    return chats.filter((c) => c.name.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q))
  }, [chats, searchQuery])

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [selectedChatId, chats])

  const handleSelectChat = (id: string) => {
    setSelectedChatId(id)
    setChatListOpen(false)
    // Мок: при открытии считаем сообщения прочитанными
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)))
  }

  const handleSendMessage = () => {
    if (!selectedChatId) return
    const text = messageDraft.trim()
    if (!text) return

    const now = new Date()
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const newMsg: TelegramMessage = {
      id: `m-${now.getTime()}`,
      text,
      timestamp,
      sender: 'user',
    }

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== selectedChatId) return c
        return {
          ...c,
          preview: text,
          date: timestamp,
          unreadCount: 0,
          messages: [...c.messages, newMsg],
        }
      })
    )

    setMessageDraft('')
    toast.showSuccess('Сообщение отправлено', 'В мок-режиме оно сразу появится в чате.')
  }

  return (
    <AppLayout pageTitle="Telegram — Чаты">
      <div className={styles.submenuContainer}>
        <Button
          type="button"
          variant="soft"
          color="gray"
          radius="full"
          className={styles.mobileMenuButton}
          aria-label="Открыть список чатов"
          title="Чаты"
          onClick={() => setChatListOpen(true)}
        >
          <HamburgerMenuIcon width={18} height={18} />
        </Button>

        <Flex align="center" gap="2" style={{ flexShrink: 0 }}>
          <ChatBubbleIcon width={18} height={18} />
          <Text weight="medium">Telegram</Text>
        </Flex>

        <Flex className={styles.submenu} role="navigation" aria-label="Telegram sub menu">
          <button
            type="button"
            className={`${styles.navTab} ${activeSubmenu === 'account' ? styles.navTabActive : ''}`}
            onClick={() => setActiveSubmenu('account')}
          >
            Аккаунт
          </button>
          <button
            type="button"
            className={`${styles.navTab} ${activeSubmenu === 'folders' ? styles.navTabActive : ''}`}
            onClick={() => setActiveSubmenu('folders')}
          >
            Папки
          </button>
          <button
            type="button"
            className={`${styles.navTab} ${activeSubmenu === 'automation' ? styles.navTabActive : ''}`}
            onClick={() => setActiveSubmenu('automation')}
          >
            Автоматизация
          </button>
        </Flex>
      </div>

      {chatListOpen && <div className={styles.mobileOverlay} />}

      <Box className={styles.container}>
        <Flex className={styles.chatsLayout}>
          <Box className={`${styles.chatListCard} ${chatListOpen ? styles.chatListCardOpen : ''}`}>
            <Box style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-a6)' }}>
              <Text size="2" color="gray" style={{ display: 'block', marginBottom: 8 }}>
                Поиск чатов
              </Text>
              <TextField.Root
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Например: рекрутинг…"
              />
            </Box>

            <Box className={styles.chatList}>
              {filteredChats.length === 0 ? (
                <Box className={chatsStyles.emptyMessages}>
                  <Text color="gray">Чаты не найдены</Text>
                </Box>
              ) : (
                filteredChats.map((c) => (
                  <Box
                    key={c.id}
                    className={`${styles.chatItem} ${c.id === selectedChatId ? styles.chatItemSelected : ''}`}
                    onClick={() => handleSelectChat(c.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') handleSelectChat(c.id)
                    }}
                    aria-label={`Открыть чат ${c.name}`}
                  >
                    <Box className={styles.chatAvatar} aria-hidden="true">
                      {c.avatar}
                    </Box>

                    <Box className={styles.chatBody}>
                      <Text as="div" className={styles.chatName}>
                        {c.name}
                      </Text>
                      <Text as="div" className={styles.chatPreview}>
                        {c.preview}
                      </Text>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Box>

          <Box className={styles.chatWindowCard}>
            {!selectedChat ? (
              <Box className={styles.emptyChatCard}>
                <Text color="gray">Выберите чат</Text>
              </Box>
            ) : (
              <>
                <Box style={{ padding: '16px', borderBottom: '1px solid var(--gray-a6)' }}>
                  <Flex align="center" justify="between" gap="2">
                    <Flex align="center" gap="3">
                      <Box className={styles.chatAvatar} style={{ width: 36, height: 36, fontSize: 14 }}>
                        {selectedChat.avatar}
                      </Box>
                      <Box>
                        <Text weight="medium">{selectedChat.name}</Text>
                        <Text size="1" color="gray">
                          {selectedChat.unreadCount ? `Непрочитано: ${selectedChat.unreadCount}` : '—'}
                        </Text>
                      </Box>
                    </Flex>

                    <Button
                      type="button"
                      variant="soft"
                      color="gray"
                      radius="full"
                      onClick={() => {
                        toast.showInfo('Настройки (mock)', `Подраздел: ${activeSubmenu}`)
                      }}
                      aria-label="Открыть настройки"
                      title="Настройки"
                    >
                      <Pencil1Icon width={16} height={16} />
                    </Button>
                  </Flex>
                </Box>

                <Box className={chatsStyles.messagesArea}>
                  {selectedChat.messages.map((m) => {
                    const isMe = m.sender === 'user'
                    return (
                      <Flex
                        key={m.id}
                        className={`${chatsStyles.messageRow} ${isMe ? chatsStyles.messageRowMe : chatsStyles.messageRowTelegram}`}
                      >
                        <Box className={`${chatsStyles.bubble} ${isMe ? chatsStyles.bubbleMe : chatsStyles.bubbleTelegram}`}>
                          {!isMe && m.senderName ? (
                            <Text className={chatsStyles.senderName} style={{ display: 'block' }}>
                              {m.senderName}
                            </Text>
                          ) : null}
                          <FormattedText content={m.text} disableHeadings />
                        </Box>
                      </Flex>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </Box>

                <Box className={chatsStyles.composerArea}>
                  <Box className={chatsStyles.composerInput}>
                    <RichTextInput
                      value={messageDraft}
                      onChange={setMessageDraft}
                      placeholder="Введите сообщение…"
                      rows={3}
                    />
                  </Box>
                  <Button
                    type="button"
                    size="3"
                    variant="solid"
                    onClick={handleSendMessage}
                    disabled={!messageDraft.trim()}
                    className={chatsStyles.sendButton}
                    aria-label="Отправить сообщение"
                    title="Отправить"
                  >
                    <PaperPlaneIcon width={18} height={18} />
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Flex>
      </Box>
    </AppLayout>
  )
}

