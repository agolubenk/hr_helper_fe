/**
 * WikiDetailPage — просмотр статьи вики по id из URL.
 * Без AppLayout (обёртка в App.tsx).
 * При ширине ≤760px кнопки «Редактировать» и «Вернуться» из шапки скрыты; показывается плавающий блок справа сверху (под хедером) с тремя кнопками-иконками: Редактировать, Содержание, Назад.
 */

import { useMemo, useState, useEffect } from 'react'
import { Box, Flex, Button, Popover } from '@radix-ui/themes'
import { ListBulletIcon, Pencil1Icon, ArrowLeftIcon, EyeOpenIcon, EyeClosedIcon } from '@radix-ui/react-icons'
import { useLocation } from 'react-router-dom'
import { useParams, useRouter } from '@/router-adapter'
import WikiDetailHeader from '@/components/wiki/WikiDetailHeader'
import WikiDetailContent from '@/components/wiki/WikiDetailContent'
import WikiDetailSidebar from '@/components/wiki/WikiDetailSidebar'
import WikiDetailHistory from '@/components/wiki/WikiDetailHistory'
import { getWikiLatestVersion, getWikiPageMeta, getWikiVersionByRevisionId, getWikiPageVersions } from '@/components/wiki/wikiRevisionsMocks'
import styles from './styles/WikiDetailPage.module.css'

const FLOATING_BAR_BREAKPOINT = '(max-width: 760px)'

function useMatchMedia(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const m = window.matchMedia(query)
    setMatches(m.matches)
    const listener = () => setMatches(m.matches)
    m.addEventListener('change', listener)
    return () => m.removeEventListener('change', listener)
  }, [query])
  return matches
}

export function WikiDetailPage() {
  const params = useParams()
  const router = useRouter()
  const location = useLocation()
  const pageId = (params?.id as string) ?? ''
  const showFloatingBar = useMatchMedia(FLOATING_BAR_BREAKPOINT)
  const [tocOpen, setTocOpen] = useState(false)

  const { revisionId, isDiffMode } = useMemo(() => {
    const sp = new URLSearchParams(location.search)
    const rev = sp.get('revision')
    const view = sp.get('view')
    return { revisionId: rev, isDiffMode: view === 'diff' }
  }, [location.search])

  const toggleDiffMode = () => {
    const sp = new URLSearchParams(location.search)
    if (!sp.get('revision')) return

    if (sp.get('view') === 'diff') sp.delete('view')
    else sp.set('view', 'diff')

    const query = sp.toString()
    router.push(`${location.pathname}${query ? `?${query}` : ''}`)
  }

  const latest = getWikiLatestVersion(pageId)
  const current = getWikiVersionByRevisionId(pageId, revisionId)
  const meta = getWikiPageMeta(pageId)
  const versions = getWikiPageVersions(pageId)
  const last = versions[0] ?? null

  if (!latest || !current || !meta || !last) {
    return (
      <Box className={`${styles.wikiDetailContainer} ${showFloatingBar ? styles.withFloatingBar : ''}`}>
        <Box>
          Страница не найдена
        </Box>
      </Box>
    )
  }

  return (
    <Box className={`${styles.wikiDetailContainer} ${showFloatingBar ? styles.withFloatingBar : ''}`}>
      <WikiDetailHeader
        title={current.title}
        category={current.category}
        tags={current.tags}
        showRevisionDiffToggle={revisionId != null}
        isDiffMode={isDiffMode}
        onToggleDiffMode={toggleDiffMode}
      />

      {/* При ширине ≤760px: плавающий блок с тремя кнопками — Назад, Содержание, Редактировать */}
      {showFloatingBar && (
        <Flex gap="2" align="center" className={styles.floatingActionsBar}>
          <Button
            type="button"
            size="3"
            variant="soft"
            radius="full"
            className={styles.floatingBarButton}
            title="Вернуться к списку"
            aria-label="Вернуться к списку"
            onClick={() => router.push('/wiki')}
            style={{ backgroundColor: 'var(--gray-3)', color: 'var(--gray-11)' }}
          >
            <ArrowLeftIcon width={18} height={18} />
          </Button>
          <Popover.Root open={tocOpen} onOpenChange={setTocOpen}>
            {/* @ts-expect-error Radix Themes Popover.Trigger typings omit asChild */}
            <Popover.Trigger asChild>
              <Button
                type="button"
                size="3"
                variant="soft"
                radius="full"
                className={styles.floatingBarButton}
                aria-label="Открыть содержание"
                title="Содержание"
              >
                <ListBulletIcon width={18} height={18} />
              </Button>
            </Popover.Trigger>
            <Popover.Content
              className={styles.tocPopoverContent}
              align="end"
              sideOffset={8}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <WikiDetailSidebar
                pageId={pageId}
                sections={current.content.sections}
                onSectionClick={() => setTocOpen(false)}
              />
            </Popover.Content>
          </Popover.Root>
          {revisionId != null && (
            <Button
              type="button"
              size="3"
              variant="soft"
              radius="full"
              className={styles.floatingBarButton}
              title={isDiffMode ? 'Выключить просмотр изменений' : 'Включить просмотр изменений'}
              aria-label={isDiffMode ? 'Выключить просмотр изменений' : 'Включить просмотр изменений'}
              onClick={toggleDiffMode}
              style={{ backgroundColor: 'var(--gray-3)', color: 'var(--gray-11)' }}
            >
              {isDiffMode ? <EyeClosedIcon width={18} height={18} /> : <EyeOpenIcon width={18} height={18} />}
            </Button>
          )}
          <Button
            type="button"
            size="3"
            variant="solid"
            radius="full"
            className={styles.floatingBarButton}
            title="Редактировать"
            aria-label="Редактировать"
            onClick={() => router.push(`/wiki/${pageId}/edit`)}
            style={{ backgroundColor: 'var(--accent-9)', color: '#ffffff' }}
          >
            <Pencil1Icon width={18} height={18} />
          </Button>
        </Flex>
      )}

      <Flex gap="4" className={styles.detailContent}>
        <Box className={styles.mainContent}>
          <WikiDetailContent
            content={current.content}
            diff={
              revisionId != null && isDiffMode
                ? { enabled: true, compareTo: latest.content }
                : { enabled: false, compareTo: latest.content }
            }
          />
        </Box>
        <Flex direction="column" gap="3" className={styles.sidebar}>
          {!showFloatingBar && (
            <WikiDetailSidebar pageId={pageId} sections={current.content.sections} />
          )}
          <WikiDetailHistory
            pageId={pageId}
            author={meta.author}
            lastEditor={last.editor}
            lastEdited={last.editedAt}
            created={meta.created}
          />
        </Flex>
      </Flex>
    </Box>
  )
}
