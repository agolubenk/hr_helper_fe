/**
 * AIChatPage — страница ИИ чата.
 * Без AppLayout (обёртка в App.tsx).
 */

import type { Chat, Message } from '@/app/aichat/page'
import { mockAiChats, mockAiMessages } from '@/app/aichat/mocks'
import ChatHistory from '@/components/aichat/ChatHistory'
import ChatMessages from '@/components/aichat/ChatMessages'
import ChatInput from '@/components/aichat/ChatInput'
import ChatHeader from '@/components/aichat/ChatHeader'
import { useToast } from '@/components/Toast/ToastContext'
import { Box, Flex, Button, Popover, TextField, Text } from '@radix-ui/themes'
import { ChevronDownIcon, ListBulletIcon, Pencil1Icon, TrashIcon, PlusIcon } from '@radix-ui/react-icons'
import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react'
import { useOptionalSearchParam } from '@/shared/hooks/useUrlSearchState'
import styles from './styles/AiChatPage.module.css'

const MOBILE_AI_CHAT_BREAKPOINT_PX = 768
const HISTORY_POPOVER_CONTENT_ID = 'ai-chat-history-popover-content'

function useAiChatMobileLayout(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(`(max-width: ${MOBILE_AI_CHAT_BREAKPOINT_PX}px)`).matches
      : false
  )
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_AI_CHAT_BREAKPOINT_PX}px)`)
    const apply = () => setIsMobile(mq.matches)
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return isMobile
}

export function AIChatPage() {
  const toast = useToast()
  const isMobile = useAiChatMobileLayout()
  const [historyPopoverOpen, setHistoryPopoverOpen] = useState(false)
  const [titleEditOpen, setTitleEditOpen] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [chatPanelHeight, setChatPanelHeight] = useState<number | null>(null)
  const [historyPopoverShiftX, setHistoryPopoverShiftX] = useState(0)
  const chatCardRef = useRef<HTMLDivElement>(null)

  const [chats, setChats] = useState<Chat[]>(() => mockAiChats.map(c => ({ ...c })))
  const [urlChatId, setUrlChatId] = useOptionalSearchParam('chat', { replace: true })
  const selectedChatId = useMemo(() => {
    const first = chats[0]?.id ?? ''
    if (!first) return ''
    if (urlChatId && chats.some((c) => c.id === urlChatId)) return urlChatId
    return first
  }, [chats, urlChatId])

  useEffect(() => {
    if (chats.length === 0) return
    const first = chats[0].id
    if (!urlChatId || !chats.some((c) => c.id === urlChatId)) {
      setUrlChatId(first)
    }
  }, [chats, urlChatId, setUrlChatId])

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const copy: Record<string, Message[]> = {}
    for (const key of Object.keys(mockAiMessages)) {
      copy[key] = mockAiMessages[key].map(m => ({ ...m }))
    }
    return copy
  })

  const selectedChat = chats.find(chat => chat.id === selectedChatId)
  const currentMessages = messages[selectedChatId] || []
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const scrollToBottom = useCallback(() => {
    const el = messagesScrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
      setIsAtBottom(true)
    }
  }, [])

  const handleMessagesScroll = useCallback(() => {
    const el = messagesScrollRef.current
    if (!el) return
    const threshold = 80
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    setIsAtBottom(atBottom)
  }, [])

  useEffect(() => {
    const el = messagesScrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
    setIsAtBottom(true)
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight })
  }, [currentMessages, selectedChatId])

  useEffect(() => {
    if (!isMobile) {
      setHistoryPopoverOpen(false)
      setTitleEditOpen(false)
    }
  }, [isMobile])

  useEffect(() => {
    if (titleEditOpen && selectedChat) setTitleDraft(selectedChat.title)
  }, [titleEditOpen, selectedChat?.id, selectedChat?.title])

  useEffect(() => {
    if (!isMobile) {
      setChatPanelHeight(null)
      return
    }
    const el = chatCardRef.current
    if (!el) return
    const update = () => {
      setChatPanelHeight(Math.round(el.getBoundingClientRect().height))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isMobile, selectedChatId])

  const syncHistoryPopoverAlign = useCallback(() => {
    if (typeof document === 'undefined' || !isMobile) return
    const el = document.getElementById(HISTORY_POPOVER_CONTENT_ID)
    const card = chatCardRef.current
    if (!el || !card) return
    const er = el.getBoundingClientRect()
    const cr = card.getBoundingClientRect()
    const delta = Math.round(cr.right - er.right)
    setHistoryPopoverShiftX(Math.max(0, delta))
  }, [isMobile])

  useLayoutEffect(() => {
    if (!historyPopoverOpen || !isMobile) {
      setHistoryPopoverShiftX(0)
      return
    }
    let cancelled = false
    const run = () => {
      if (cancelled) return
      syncHistoryPopoverAlign()
    }
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(run)
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(id)
    }
  }, [historyPopoverOpen, isMobile, syncHistoryPopoverAlign, chatPanelHeight, selectedChatId])

  useEffect(() => {
    if (!historyPopoverOpen || !isMobile) return
    const onResize = () => syncHistoryPopoverAlign()
    window.addEventListener('resize', onResize)
    const card = chatCardRef.current
    const ro = card
      ? new ResizeObserver(() => {
          requestAnimationFrame(() => syncHistoryPopoverAlign())
        })
      : null
    if (card && ro) ro.observe(card)
    return () => {
      window.removeEventListener('resize', onResize)
      ro?.disconnect()
    }
  }, [historyPopoverOpen, isMobile, syncHistoryPopoverAlign])

  const showScrollToBottom = !isAtBottom && currentMessages.length > 0

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Чат ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
      createdAt: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    }
    setChats(prev => [newChat, ...prev])
    setUrlChatId(newChat.id)
    setMessages(prev => ({ ...prev, [newChat.id]: [] }))
    if (isMobile) setHistoryPopoverOpen(false)
  }

  const handleSendMessage = (content: string, _modelId?: string, files?: File[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content || '',
      timestamp: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      files: files && files.length > 0 ? files : undefined,
    }
    setMessages(prev => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), newMessage],
    }))
  }

  const handleFileAttach = (file: File) => {
    console.log('Прикреплен файл:', file.name, file.type, file.size)
  }

  const handleTitleChange = (newTitle: string) => {
    setChats(prev => prev.map(chat => (chat.id === selectedChatId ? { ...chat, title: newTitle } : chat)))
  }

  const saveTitleDraft = () => {
    const t = titleDraft.trim()
    if (t) handleTitleChange(t)
    setTitleEditOpen(false)
  }

  const performDeleteChat = (chatId: string) => {
    const willCreateNewRef = { current: false }
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== chatId)
      if (filtered.length === 0) {
        willCreateNewRef.current = true
        const newChat: Chat = {
          id: Date.now().toString(),
          title: `Чат ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`,
          createdAt: new Date().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        }
        setUrlChatId(newChat.id)
        setMessages(prevM => { const n = { ...prevM }; delete n[chatId]; n[newChat.id] = []; return n })
        return [newChat]
      }
      if (chatId === selectedChatId) setUrlChatId(filtered[0].id)
      return filtered
    })
    if (!willCreateNewRef.current) {
      setMessages(prev => { const n = { ...prev }; delete n[chatId]; return n })
    }
  }

  const showDeleteConfirm = (chatId: string) => {
    toast.showWarning('Удалить чат?', 'Вы уверены, что хотите удалить этот чат?', {
      duration: 12000,
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        { label: 'Удалить', onClick: () => performDeleteChat(chatId), variant: 'solid', color: 'red' },
      ],
    })
  }

  const handleDeleteChat = () => showDeleteConfirm(selectedChatId)
  const handleDeleteChatFromHistory = (chatId: string) => showDeleteConfirm(chatId)
  const handleChatSelect = (id: string) => {
    setUrlChatId(id)
    if (isMobile) setHistoryPopoverOpen(false)
  }

  return (
    <Box className={styles.aichatContainer}>
      <Flex gap="4" className={styles.mainContent}>
        {!isMobile && (
          <Box className={styles.sidebarColumn}>
            <ChatHistory
              chats={chats}
              selectedChatId={selectedChatId}
              onChatSelect={handleChatSelect}
              onNewChat={handleNewChat}
              onChatDelete={handleDeleteChatFromHistory}
            />
          </Box>
        )}
        <Box className={styles.chatColumn}>
          {selectedChat && isMobile && (
            <Box className={styles.mobileChatStack}>
              <Flex align="center" className={styles.historyFloatingBar} wrap="nowrap">
                <Flex gap="2" align="center" className={styles.historyFloatingActions}>
                  <Flex direction="column" gap="0" className={styles.historyFloatingTextBlock}>
                    <Text
                      size="2"
                      weight="bold"
                      className={styles.historyFloatingTitle}
                      title={selectedChat.title}
                    >
                      {selectedChat.title}
                    </Text>
                    {selectedChat.createdAt ? (
                      <Text size="1" className={styles.historyFloatingMeta}>
                        {selectedChat.createdAt}
                      </Text>
                    ) : null}
                  </Flex>
                  <Flex gap="2" align="center" className={styles.historyFloatingButtonCapsule} flexShrink="0">
                    <Button
                      type="button"
                      size="3"
                      variant="solid"
                      radius="full"
                      className={styles.historyFloatingButton}
                      aria-label="Новый чат"
                      title="Новый чат"
                      onClick={handleNewChat}
                      style={{ backgroundColor: 'var(--accent-9)', color: '#ffffff' }}
                    >
                      <PlusIcon width={18} height={18} />
                    </Button>
                    <Popover.Root open={titleEditOpen} onOpenChange={setTitleEditOpen}>
                  {/* @ts-expect-error Radix Themes Popover.Trigger typings omit asChild */}
                  <Popover.Trigger asChild>
                    <Button
                      type="button"
                      size="3"
                      variant="soft"
                      radius="full"
                      className={styles.historyFloatingButton}
                      aria-label="Переименовать чат"
                      title="Название чата"
                      style={{ backgroundColor: 'var(--gray-3)', color: 'var(--gray-11)' }}
                    >
                      <Pencil1Icon width={18} height={18} />
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content
                    className={styles.titleEditPopoverContent}
                    side="bottom"
                    align="end"
                    sideOffset={8}
                  >
                    <Flex direction="column" gap="3">
                      <Text size="2" weight="medium">
                        Название чата
                      </Text>
                      <TextField.Root
                        id="ai-chat-title-draft"
                        value={titleDraft}
                        onChange={(e) => setTitleDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveTitleDraft()
                        }}
                      />
                      <Flex gap="2" justify="end" wrap="wrap">
                        <Button type="button" size="2" variant="soft" color="gray" onClick={() => setTitleEditOpen(false)}>
                          Отмена
                        </Button>
                        <Button type="button" size="2" onClick={saveTitleDraft}>
                          Сохранить
                        </Button>
                      </Flex>
                    </Flex>
                  </Popover.Content>
                    </Popover.Root>
                    <Popover.Root open={historyPopoverOpen} onOpenChange={setHistoryPopoverOpen}>
                  {/* @ts-expect-error Radix Themes Popover.Trigger typings omit asChild */}
                  <Popover.Trigger asChild>
                    <Button
                      type="button"
                      size="3"
                      variant="soft"
                      radius="full"
                      className={styles.historyFloatingButton}
                      aria-label="История чатов"
                      title="История чатов"
                      style={{ backgroundColor: 'var(--gray-3)', color: 'var(--gray-11)' }}
                    >
                      <ListBulletIcon width={18} height={18} />
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content
                    id={HISTORY_POPOVER_CONTENT_ID}
                    className={styles.historyPopoverContent}
                    side="bottom"
                    align="end"
                    sideOffset={8}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    style={{
                      marginLeft: historyPopoverShiftX,
                      ...(chatPanelHeight != null
                        ? { height: chatPanelHeight, maxHeight: chatPanelHeight }
                        : { maxHeight: 'min(70dvh, 560px)' }),
                    }}
                  >
                    <Box className={styles.historyPopoverInner}>
                      <ChatHistory
                        chats={chats}
                        selectedChatId={selectedChatId}
                        onChatSelect={handleChatSelect}
                        onNewChat={handleNewChat}
                        onChatDelete={handleDeleteChatFromHistory}
                        hideHeader
                        hideNewChatButton
                        alwaysShowDelete
                      />
                    </Box>
                  </Popover.Content>
                    </Popover.Root>
                    <Button
                      type="button"
                      size="3"
                      variant="soft"
                      radius="full"
                      className={styles.historyFloatingButton}
                      aria-label="Удалить чат"
                      title="Удалить чат"
                      onClick={handleDeleteChat}
                      style={{ backgroundColor: 'var(--red-3)', color: 'var(--red-11)' }}
                    >
                      <TrashIcon width={18} height={18} />
                    </Button>
                  </Flex>
              </Flex>
            </Flex>
              <Box ref={chatCardRef} className={`${styles.chatCard} ${styles.chatCardStackedMobile}`}>
                <Box className={styles.messagesWrapper}>
                  <Box ref={messagesScrollRef} className={styles.messagesContainer} onScroll={handleMessagesScroll}>
                    <ChatMessages messages={currentMessages} />
                  </Box>
                  {showScrollToBottom && (
                    <Button size="2" variant="soft" color="gray" className={styles.scrollToBottomBtn} onClick={scrollToBottom} title="К последнему сообщению" radius="full">
                      <ChevronDownIcon width={18} height={18} />
                    </Button>
                  )}
                </Box>
                <Box className={styles.inputContainer}>
                  <ChatInput onSend={handleSendMessage} onFileAttach={handleFileAttach} />
                </Box>
              </Box>
            </Box>
          )}
          {selectedChat && !isMobile && (
            <Box ref={chatCardRef} className={styles.chatCard}>
              <ChatHeader
                title={selectedChat.title}
                createdAt={selectedChat.createdAt}
                onTitleChange={handleTitleChange}
                onDelete={handleDeleteChat}
              />
              <Box className={styles.messagesWrapper}>
                <Box ref={messagesScrollRef} className={styles.messagesContainer} onScroll={handleMessagesScroll}>
                  <ChatMessages messages={currentMessages} />
                </Box>
                {showScrollToBottom && (
                  <Button size="2" variant="soft" color="gray" className={styles.scrollToBottomBtn} onClick={scrollToBottom} title="К последнему сообщению" radius="full">
                    <ChevronDownIcon width={18} height={18} />
                  </Button>
                )}
              </Box>
              <Box className={styles.inputContainer}>
                <ChatInput onSend={handleSendMessage} onFileAttach={handleFileAttach} />
              </Box>
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  )
}
