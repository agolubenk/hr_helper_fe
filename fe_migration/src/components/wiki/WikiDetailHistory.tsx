'use client'

import { useMemo, useState } from "react"
import { Box, Text, Flex, Separator, Dialog, Button, IconButton } from "@radix-ui/themes"
import { PersonIcon, ClockIcon, OpenInNewWindowIcon } from "@radix-ui/react-icons"
import styles from './WikiDetailHistory.module.css'
import { getWikiPageVersions } from "./wikiRevisionsMocks"

interface WikiDetailHistoryProps {
  pageId: string
  author: string
  lastEditor: string
  lastEdited: string
  created: string
}

export default function WikiDetailHistory({
  pageId,
  author,
  lastEditor,
  lastEdited,
  created,
}: WikiDetailHistoryProps) {
  const revisions = useMemo(() => {
    return getWikiPageVersions(pageId).map((v) => ({
      id: v.revisionId,
      editor: v.editor,
      editedAt: v.editedAt,
      title:
        v.revisionId === 'rev_2025_11_05'
          ? 'Обновление структуры разделов'
          : 'Первая редакция',
      preview:
        v.revisionId === 'rev_2025_11_05'
          ? 'Добавлена секция «Взаимосвязи модулей», обновлён стек и расширен блок AI-помощника.'
          : 'Создана базовая структура документа и первичное описание ключевых модулей.',
    }))
  }, [pageId])

  const [open, setOpen] = useState(false)
  const [selectedRevisionId, setSelectedRevisionId] = useState(revisions[0]?.id ?? '')
  const selectedRevision = revisions.find((r) => r.id === selectedRevisionId) ?? revisions[0]

  return (
    <Box className={styles.history}>
      <Text size="3" weight="bold" className={styles.historyTitle}>
        История изменений
      </Text>
      
      <Flex direction="column" gap="3" mt="3">
        <Box>
          <Flex align="center" gap="2" mb="1">
            <PersonIcon width={14} height={14} style={{ color: 'var(--gray-9)' }} />
            <Text size="2" weight="medium" color="gray">
              Автор
            </Text>
          </Flex>
          <Text size="2" style={{ marginLeft: '22px' }}>
            {author}
          </Text>
          <Flex align="center" gap="2" mt="1" style={{ marginLeft: '22px' }}>
            <ClockIcon width={12} height={12} style={{ color: 'var(--gray-9)' }} />
            <Text size="1" color="gray">
              {created}
            </Text>
          </Flex>
        </Box>
        
        <Separator size="2" />
        
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger>
            <Box className={styles.clickableRevisionSummary} role="button" tabIndex={0}>
          <Flex align="center" gap="2" mb="1">
            <PersonIcon width={14} height={14} style={{ color: 'var(--gray-9)' }} />
            <Text size="2" weight="medium" color="gray">
              Последний редактор
            </Text>
          </Flex>
          <Text size="2" style={{ marginLeft: '22px' }}>
            {lastEditor}
          </Text>
          <Flex align="center" gap="2" mt="1" style={{ marginLeft: '22px' }}>
            <ClockIcon width={12} height={12} style={{ color: 'var(--gray-9)' }} />
            <Text size="1" color="gray">
              {lastEdited}
            </Text>
          </Flex>
            </Box>
          </Dialog.Trigger>

          <Dialog.Content className={styles.revisionsDialog}>
            <Dialog.Title>Версии документа</Dialog.Title>
            <Dialog.Description>
              Выберите редакцию, чтобы посмотреть содержимое.
            </Dialog.Description>

            <Flex gap="4" className={styles.revisionsLayout}>
              <Box className={styles.revisionsList}>
                <Flex direction="column" gap="2">
                  {revisions.map((r) => {
                    const isActive = r.id === selectedRevisionId
                    return (
                      <Button
                        key={r.id}
                        type="button"
                        variant={isActive ? 'solid' : 'soft'}
                        onClick={() => setSelectedRevisionId(r.id)}
                        className={styles.revisionButton}
                      >
                        <Flex direction="column" align="start" gap="1" style={{ textAlign: 'left' }}>
                          <Text size="2" weight="medium">
                            {r.title}
                          </Text>
                          <Text size="1" color="gray">
                            {r.editedAt} · {r.editor}
                          </Text>
                        </Flex>
                      </Button>
                    )
                  })}
                </Flex>
              </Box>

              <Box className={styles.revisionPreview}>
                <Text size="2" weight="medium">
                  {selectedRevision?.title}
                </Text>
                <Flex align="start" justify="between" gap="3" mt="1" className={styles.revisionMetaRow}>
                  <Box>
                    <Text size="1" color="gray" style={{ display: 'block' }}>
                      {selectedRevision?.editedAt}
                    </Text>
                    <Text size="1" color="gray" style={{ display: 'block' }}>
                      {selectedRevision?.editor}
                    </Text>
                  </Box>
                  <IconButton
                    type="button"
                    variant="soft"
                    radius="full"
                    aria-label="Открыть выбранную версию в новой вкладке"
                    title="Открыть версию (новая вкладка)"
                    onClick={() => {
                      const url = `/wiki/${pageId}?revision=${encodeURIComponent(selectedRevisionId)}&view=diff`
                      window.open(url, '_blank', 'noopener,noreferrer')
                    }}
                  >
                    <OpenInNewWindowIcon width={16} height={16} />
                  </IconButton>
                </Flex>
                <Box className={styles.previewBox} mt="3">
                  <Text size="2">
                    {selectedRevision?.preview}
                  </Text>
                </Box>
              </Box>
            </Flex>

            <Flex gap="3" mt="4" justify="end">
              <Dialog.Close>
                <Button type="button" variant="soft">
                  Закрыть
                </Button>
              </Dialog.Close>
            </Flex>
          </Dialog.Content>
        </Dialog.Root>
      </Flex>
    </Box>
  )
}
