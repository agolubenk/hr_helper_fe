import { useState } from 'react'
import {
  Tabs,
  Flex,
  Text,
  Badge,
  TextField,
  Button,
  ScrollArea,
  Avatar,
  Box,
} from '@radix-ui/themes'
import type { MeetAudience, MeetChatMessage, MeetMeetingComment, MeetParticipant } from '@/features/meet/types'
import { getMeetInitials } from '@/features/meet/meetTextUtils'
import styles from './MeetRoomPage.module.css'

function audienceBadge(audience: MeetAudience) {
  return audience === 'internal' ? (
    <Badge size="1" color="blue" variant="soft">
      Команда
    </Badge>
  ) : (
    <Badge size="1" color="orange" variant="soft">
      Гость
    </Badge>
  )
}

interface MeetRoomSidePanelProps {
  participants: MeetParticipant[]
  chatInternal: MeetChatMessage[]
  chatExternal: MeetChatMessage[]
  commentsInternal: MeetMeetingComment[]
  commentsExternal: MeetMeetingComment[]
  onSendChat: (audience: MeetAudience, text: string) => void
  onSendComment: (audience: MeetAudience, text: string) => void
  /** Управление вкладкой снаружи (кнопки панели эфира). */
  mainTab?: 'people' | 'chat' | 'manage' | 'info'
  onMainTabChange?: (tab: 'people' | 'chat' | 'manage' | 'info') => void
}

export function MeetRoomSidePanel({
  participants,
  chatInternal,
  chatExternal,
  commentsInternal,
  commentsExternal,
  onSendChat,
  onSendComment,
  mainTab: mainTabProp,
  onMainTabChange,
}: MeetRoomSidePanelProps) {
  const [mainTabLocal, setMainTabLocal] = useState<'people' | 'chat' | 'manage' | 'info'>('people')
  const mainTab = mainTabProp ?? mainTabLocal
  const setMainTab = (v: string) => {
    const next = v === 'chat' || v === 'manage' || v === 'info' ? v : 'people'
    setMainTabLocal(next)
    onMainTabChange?.(next)
  }
  const [chatTab, setChatTab] = useState<'internal' | 'external'>('internal')
  const [commentTab, setCommentTab] = useState<'internal' | 'external'>('internal')
  const [chatDraft, setChatDraft] = useState('')
  const [commentDraft, setCommentDraft] = useState('')

  const handleSendChat = () => {
    const t = chatDraft.trim()
    if (!t) return
    onSendChat(chatTab === 'internal' ? 'internal' : 'external', t)
    setChatDraft('')
  }

  const handleSendComment = () => {
    const t = commentDraft.trim()
    if (!t) return
    onSendComment(commentTab === 'internal' ? 'internal' : 'external', t)
    setCommentDraft('')
  }

  const chatList = chatTab === 'internal' ? chatInternal : chatExternal
  const commentList = commentTab === 'internal' ? commentsInternal : commentsExternal

  return (
    <Box className={styles.sidePanel}>
      <Box className={styles.sidePanelHeader}>
        <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
          <Text size="2" weight="bold" className={styles.sidePanelHeaderTitle}>
            Панель встречи
          </Text>
          <Text size="1" color="gray" className={styles.sidePanelHeaderSub}>
            Чат и комментарии разделены для команды и гостей
          </Text>
        </Flex>
      </Box>
      <Box className={styles.sidePanelBody}>
        <Tabs.Root
          value={mainTab}
          onValueChange={setMainTab}
          className={styles.sidePanelTabsRoot}
        >
          <Tabs.List className={styles.sidePanelTabList}>
            <Tabs.Trigger value="info">Информация</Tabs.Trigger>
            <Tabs.Trigger value="people">Участники</Tabs.Trigger>
            <Tabs.Trigger value="chat">Чат</Tabs.Trigger>
            <Tabs.Trigger value="manage">Управление</Tabs.Trigger>
          </Tabs.List>

          {mainTab === 'chat' ? (
            <Flex gap="2" wrap="wrap" className={styles.sidePanelSubTabs}>
              <Button
                size="1"
                variant={chatTab === 'internal' ? 'solid' : 'soft'}
                onClick={() => setChatTab('internal')}
              >
                Внутренний чат
              </Button>
              <Button
                size="1"
                variant={chatTab === 'external' ? 'solid' : 'soft'}
                onClick={() => setChatTab('external')}
              >
                Чат с гостями
              </Button>
            </Flex>
          ) : null}

          {mainTab === 'manage' ? (
            <Flex gap="2" wrap="wrap" className={styles.sidePanelSubTabs}>
              <Button
                size="1"
                variant={commentTab === 'internal' ? 'solid' : 'soft'}
                onClick={() => setCommentTab('internal')}
              >
                Заметки команды
              </Button>
              <Button
                size="1"
                variant={commentTab === 'external' ? 'solid' : 'soft'}
                onClick={() => setCommentTab('external')}
              >
                Вопросы гостей
              </Button>
            </Flex>
          ) : null}

          <Tabs.Content value="people" className={styles.sidePanelTabContent}>
            <ScrollArea type="auto" className={styles.panelScroll}>
              <Box>
                {participants.map((p) => {
                  const deviceBits = [
                    p.isMuted ? 'Микр. выкл.' : 'Микр. вкл.',
                    p.isVideoOn ? 'Камера вкл.' : 'Камера выкл.',
                  ]
                  if (p.isScreenSharing) deviceBits.push('Экран')
                  return (
                    <div key={p.id} className={styles.participantRow}>
                      <Avatar
                        size="2"
                        fallback={getMeetInitials(p.name)}
                        color={p.audience === 'internal' ? undefined : 'amber'}
                        variant="soft"
                      />
                      <div className={styles.participantBody}>
                        <div className={styles.participantNameRow}>
                          <Text as="span" size="2" weight="medium" truncate style={{ maxWidth: '100%' }}>
                            {p.name}
                          </Text>
                          {p.isHost ? (
                            <Badge size="1" color="grass">
                              Ведущий
                            </Badge>
                          ) : null}
                          {p.isActiveSpeaker ? (
                            <Badge size="1" color="blue">
                              Говорит
                            </Badge>
                          ) : null}
                          {audienceBadge(p.audience)}
                        </div>
                        {p.title ? (
                          <span className={styles.participantTitle}>{p.title}</span>
                        ) : null}
                        <span className={styles.participantDeviceLine} title={deviceBits.join(' · ')}>
                          {deviceBits.join(' · ')}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </Box>
            </ScrollArea>
          </Tabs.Content>

          <Tabs.Content
            value="chat"
            className={`${styles.sidePanelTabContent} ${styles.sidePanelTabContentChat}`}
          >
            <ScrollArea type="auto" className={styles.messageScroll}>
              <Box className={styles.messageListFill}>
                {chatList.map((m) => (
                  <Box key={m.id} className={styles.messageRow}>
                    <Flex className={styles.messageMeta}>
                      <Text size="2" weight="bold">
                        {m.author}
                      </Text>
                      <Text size="1" color="gray">
                        {m.timeLabel}
                      </Text>
                      {audienceBadge(m.audience)}
                    </Flex>
                    <Text size="2">{m.text}</Text>
                  </Box>
                ))}
              </Box>
            </ScrollArea>
            <Box className={styles.composer}>
              <Flex direction="column" gap="2">
                <TextField.Root
                  size="2"
                  placeholder={
                    chatTab === 'internal'
                      ? 'Сообщение только для команды…'
                      : 'Сообщение видят все в комнате…'
                  }
                  value={chatDraft}
                  onChange={(e) => setChatDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendChat()
                    }
                  }}
                />
                <Button size="2" variant="soft" onClick={handleSendChat}>
                  Отправить
                </Button>
              </Flex>
            </Box>
          </Tabs.Content>

          <Tabs.Content
            value="manage"
            className={`${styles.sidePanelTabContent} ${styles.sidePanelTabContentChat}`}
          >
            <ScrollArea type="auto" className={styles.messageScroll}>
              <Box className={styles.messageListFill}>
                {commentList.map((c) => (
                  <Box key={c.id} className={styles.messageRow}>
                    <Flex className={styles.messageMeta}>
                      <Text size="2" weight="bold">
                        {c.author}
                      </Text>
                      <Text size="1" color="gray">
                        {c.timeLabel}
                      </Text>
                      {audienceBadge(c.audience)}
                    </Flex>
                    <Text size="2">{c.text}</Text>
                  </Box>
                ))}
              </Box>
            </ScrollArea>
            <Box className={styles.composer}>
              <Flex direction="column" gap="2">
                <TextField.Root
                  size="2"
                  placeholder={
                    commentTab === 'internal'
                      ? 'Заметка для команды (гости не видят)…'
                      : 'Публичный комментарий / вопрос…'
                  }
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendComment()
                    }
                  }}
                />
                <Button size="2" variant="soft" onClick={handleSendComment}>
                  Добавить
                </Button>
              </Flex>
            </Box>
          </Tabs.Content>

          <Tabs.Content value="info" className={styles.sidePanelTabContent}>
            <ScrollArea type="auto" className={styles.panelScroll}>
              <Box p="3">
                <Text size="2" weight="bold">
                  Информация
                </Text>
                <Text size="1" color="gray" style={{ marginTop: 4 }}>
                  Сводка по комнате и быстрые подсказки (мок).
                </Text>
                <Box mt="3">
                  <Text size="2" weight="medium">
                    Что доступно
                  </Text>
                  <Box mt="2">
                    <Text size="2">- Чат и управление разделены по аудитории</Text>
                    <Text size="2">- Активный мит можно «свернуть» в задачи</Text>
                    <Text size="2">- Ссылка на мит копируется в шапке</Text>
                  </Box>
                </Box>
              </Box>
            </ScrollArea>
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Box>
  )
}
