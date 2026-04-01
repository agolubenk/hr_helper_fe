import {
  AlignBottomIcon,
  GearIcon,
  MinusIcon,
  OpenInNewWindowIcon,
  Pencil1Icon,
  PlusIcon,
} from '@radix-ui/react-icons'
import { Badge, Button, Dialog, IconButton, TextField } from '@radix-ui/themes'
import { MENU_LEVEL1_ORDER, MENU_LEVEL1_TO_LABEL } from '@/config/menuConfig'
import { Link } from '@/router-adapter'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BOARD_STAGE_ORDER,
  STATUS_FALLBACK_BUCKET,
  WORK_ITEM_DOMAIN_META,
  WORK_ITEM_DOMAIN_ORDER,
  WORK_ITEM_PRIORITY_DOT,
  WORK_ITEM_STATUS_BADGE_COLOR,
  boardBucketForStatus,
} from '../domainMeta'
import { getWorkItemContextHref } from '../domainContextLink'
import { formatWorkItemListDueDate } from '../formatListDueDate'
import { filterAndSearchWorkItems } from '../filterWorkItems'
import { MOCK_WORK_ITEMS } from '../mocks'
import type { WorkItem, WorkItemDomain, WorkItemStatus, WorkItemsSidebarFilterId, WorkItemsView } from '../types'
import { WorkItemsDetailPanel } from './WorkItemsDetailPanel'
import styles from './WorkItemsWorkspace.module.css'

const DOMAIN_STYLE: Record<WorkItemDomain, string> = {
  task: styles.domainTask,
  candidate: styles.domainCandidate,
  vacancy: styles.domainVacancy,
  project: styles.domainProject,
  event: styles.domainEvent,
  meet: styles.domainMeet,
  wiki: styles.domainWiki,
  specialist: styles.domainSpecialist,
  company: styles.domainCompany,
  hiring_request: styles.domainHiringRequest,
  integration: styles.domainIntegration,
  report: styles.domainReport,
}

const DOMAIN_PREFIX: Record<WorkItemDomain, string> = {
  task: 'TASK',
  candidate: 'CAND',
  vacancy: 'VAC',
  project: 'PROJ',
  event: 'EVENT',
  meet: 'MEET',
  wiki: 'WIKI',
  specialist: 'SPEC',
  company: 'COMP',
  hiring_request: 'HR-REQ',
  integration: 'INT',
  report: 'RPT',
}

/** Демо-привязка мок-объектов к дням апреля (календарь). */
const CALENDAR_DAY_BY_ID: Record<string, number> = {
  'EVENT-001': 2,
  'EVENT-002': 3,
  'MEET-001': 4,
  'EVENT-003': 29,
  'MEET-002': 10,
}

const SIDEBAR_NAV: {
  section: string
  items: { id: WorkItemsSidebarFilterId; label: string }[]
}[] = [
  {
    section: '',
    items: [
      { id: 'inbox', label: 'Inbox' },
      { id: 'mywork', label: 'Мои задачи' },
    ],
  },
  {
    section: 'Разделы меню',
    items: [
      { id: 'all', label: 'Все объекты' },
      ...MENU_LEVEL1_ORDER.map((id) => ({
        id: id as WorkItemsSidebarFilterId,
        label: MENU_LEVEL1_TO_LABEL[id] ?? id,
      })),
    ],
  },
]

function objectsCountLabel(n: number): string {
  const abs100 = n % 100
  const d = n % 10
  if (abs100 >= 11 && abs100 <= 14) return `${n} объектов`
  if (d === 1) return `${n} объект`
  if (d >= 2 && d <= 4) return `${n} объекта`
  return `${n} объектов`
}

function avatarColors(initials: string): { bg: string; fg: string } {
  const palettes: { bg: string; fg: string }[] = [
    { bg: 'var(--teal-a4)', fg: 'var(--teal-11)' },
    { bg: 'var(--blue-a4)', fg: 'var(--blue-11)' },
    { bg: 'var(--purple-a4)', fg: 'var(--purple-11)' },
    { bg: 'var(--green-a4)', fg: 'var(--green-11)' },
    { bg: 'var(--orange-a4)', fg: 'var(--orange-11)' },
  ]
  const idx = (initials.codePointAt(0) ?? 0) % palettes.length
  return palettes[idx]
}

function Avatar({ initials }: { initials: string }) {
  const { bg, fg } = avatarColors(initials)
  return (
    <span className={styles.avatar} style={{ background: bg, color: fg }}>
      {initials}
    </span>
  )
}

export function WorkItemsWorkspace() {
  const [items, setItems] = useState<WorkItem[]>(() => [...MOCK_WORK_ITEMS])
  const [sidebarFilter, setSidebarFilter] = useState<WorkItemsSidebarFilterId>('all')
  const [view, setView] = useState<WorkItemsView>('list')
  const [mineOnly, setMineOnly] = useState(false)
  const [activeOnly, setActiveOnly] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({})
  const [createOpen, setCreateOpen] = useState(false)
  const [detailFullscreenOpen, setDetailFullscreenOpen] = useState(false)
  const [createDomain, setCreateDomain] = useState<WorkItemDomain>('task')
  const [createTitle, setCreateTitle] = useState('')
  const [nextNum, setNextNum] = useState(900)

  const itemsById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])

  const sidebarCounts = useMemo(() => {
    const counts: Partial<Record<WorkItemsSidebarFilterId, number>> = {}
    const keys = SIDEBAR_NAV.flatMap((s) => s.items.map((i) => i.id))
    for (const k of keys) {
      counts[k] = filterAndSearchWorkItems(items, k, '').length
    }
    return counts
  }, [items])

  const pipelineFiltered = useMemo(() => {
    let list = filterAndSearchWorkItems(items, sidebarFilter, '')
    if (mineOnly) list = list.filter((i) => i.assignee === 'АК')
    if (activeOnly) list = list.filter((i) => i.status !== 'Готово')
    return list
  }, [items, sidebarFilter, mineOnly, activeOnly])

  const selected = useMemo(
    () => (selectedId ? itemsById.get(selectedId) ?? null : null),
    [selectedId, itemsById]
  )

  const toggleDone = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it))
    )
  }, [])

  const toggleGroup = useCallback((domain: string) => {
    setCollapsedGroups((g) => ({ ...g, [domain]: !g[domain] }))
  }, [])

  const onToggleSection = useCallback((key: string) => {
    setSectionOpen((s) => {
      const cur = s[key]
      const def = key === 'desc' || key === 'rel'
      const effective = cur !== undefined ? cur : def
      return { ...s, [key]: !effective }
    })
  }, [])

  const listGroups = useMemo(() => {
    const ordered: { domain: string; rows: WorkItem[] }[] = []
    const byDom = new Map<string, WorkItem[]>()
    for (const it of pipelineFiltered) {
      if (!byDom.has(it.domain)) byDom.set(it.domain, [])
      byDom.get(it.domain)!.push(it)
    }
    for (const d of WORK_ITEM_DOMAIN_ORDER) {
      const rows = byDom.get(d)
      if (rows?.length) ordered.push({ domain: d, rows })
    }
    return ordered
  }, [pipelineFiltered])

  const boardColumns = useMemo(() => {
    const buckets = new Map<string, WorkItem[]>()
    for (const st of BOARD_STAGE_ORDER) buckets.set(st, [])
    buckets.set(STATUS_FALLBACK_BUCKET, [])
    for (const it of pipelineFiltered) {
      const b = boardBucketForStatus(it.status)
      if (!buckets.has(b)) buckets.set(b, [])
      buckets.get(b)!.push(it)
    }
    return buckets
  }, [pipelineFiltered])

  const calendarItems = useMemo(
    () =>
      pipelineFiltered.filter((i) => i.domain === 'event' || i.domain === 'meet'),
    [pipelineFiltered]
  )

  useEffect(() => {
    if (!selected) setDetailFullscreenOpen(false)
  }, [selected])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (detailFullscreenOpen) setDetailFullscreenOpen(false)
        else if (createOpen) setCreateOpen(false)
        else setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [createOpen, detailFullscreenOpen])

  const handleCreate = () => {
    const title = createTitle.trim()
    if (!title) return
    const prefix = DOMAIN_PREFIX[createDomain]
    const id = `${prefix}-${nextNum}`
    setNextNum((n) => n + 1)
    const row: WorkItem = {
      id,
      domain: createDomain,
      title,
      status: 'Новый',
      assignee: 'АК',
      priority: 'Средний',
      date: '31 мар',
      tags: [],
      description: '',
      relatedItems: [],
    }
    setItems((prev) => [row, ...prev])
    setCreateTitle('')
    setCreateOpen(false)
    setSelectedId(id)
  }

  const countLabel = pipelineFiltered.length

  return (
    <div className={styles.shell} data-tour="tasks-universal-page">
      <nav className={styles.innerSidebar} aria-label="Inbox и домены">
        <div className={styles.innerSidebarScroll}>
          {SIDEBAR_NAV.map((block, blockIdx) => (
            <div key={block.section || `nav-${blockIdx}`} className={styles.sidebarSection}>
              {blockIdx > 0 ? <div className={styles.sidebarDivider} aria-hidden /> : null}
              {block.section ? <div className={styles.sidebarSectionLabel}>{block.section}</div> : null}
              {block.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.sidebarItem} ${sidebarFilter === item.id ? styles.sidebarItemActive : ''}`}
                  onClick={() => setSidebarFilter(item.id)}
                >
                  <span>{item.label}</span>
                  <span className={styles.sidebarItemCount}>{sidebarCounts[item.id] ?? 0}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </nav>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <span className={styles.topbarBadge}>{objectsCountLabel(countLabel)}</span>
          <span className={styles.topbarSep}>·</span>
          <button
            type="button"
            className={`${styles.chip} ${styles.topbarDomainChip} ${!mineOnly && !activeOnly ? styles.chipActive : ''}`}
            onClick={() => {
              setMineOnly(false)
              setActiveOnly(false)
            }}
          >
            Все домены
          </button>
          <div className={styles.topbarFilters} role="group" aria-label="Фильтры списка">
            <button
              type="button"
              className={`${styles.chip} ${mineOnly ? styles.chipActive : ''}`}
              onClick={() => setMineOnly((v) => !v)}
            >
              Мои объекты
            </button>
            <button
              type="button"
              className={`${styles.chip} ${activeOnly ? styles.chipActive : ''}`}
              onClick={() => setActiveOnly((v) => !v)}
            >
              Активные
            </button>
          </div>
          <div className={styles.topbarViewTabs} role="tablist" aria-label="Вид реестра">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'list'}
              className={`${styles.viewTab} ${view === 'list' ? styles.viewTabActive : ''}`}
              onClick={() => setView('list')}
            >
              Список
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'board'}
              className={`${styles.viewTab} ${view === 'board' ? styles.viewTabActive : ''}`}
              onClick={() => setView('board')}
            >
              Доска
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'calendar'}
              className={`${styles.viewTab} ${view === 'calendar' ? styles.viewTabActive : ''}`}
              onClick={() => setView('calendar')}
            >
              Календарь
            </button>
          </div>
          <div className={styles.topbarActions}>
            <IconButton size="2" variant="ghost" asChild aria-label="Настройки">
              <Link href="/settings/modules">
                <GearIcon width={16} height={16} />
              </Link>
            </IconButton>
            <Button size="2" type="button" onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              Создать
            </Button>
          </div>
        </header>

        <div className={styles.contentRow}>
          {view === 'list' ? (
            <div className={styles.listPane}>
              <div className={styles.listHeader}>
                <span className={styles.listHeaderCell} />
                <span className={styles.listHeaderCell}>Название</span>
                <span className={styles.listHeaderCell}>ID</span>
                <span className={styles.listHeaderCell}>Исполнитель</span>
                <span className={styles.listHeaderCell}>Действия</span>
                <span className={styles.listHeaderCell}>Дата</span>
              </div>
              {listGroups.length === 0 ? (
                <div className={styles.emptyState}>Нет объектов по фильтрам</div>
              ) : (
                listGroups.map(({ domain, rows }) => {
                  const meta = WORK_ITEM_DOMAIN_META[domain as WorkItemDomain]
                  const collapsed = collapsedGroups[domain]
                  return (
                    <div key={domain}>
                      <button
                        type="button"
                        className={styles.groupHeader}
                        onClick={() => toggleGroup(domain)}
                      >
                        <span
                          className={`${styles.groupToggle} ${collapsed ? styles.groupToggleCollapsed : ''}`}
                          aria-hidden
                        >
                          ▾
                        </span>
                        <span>
                          {meta.icon} {meta.label}
                        </span>
                        <span className={styles.groupCount}>{rows.length}</span>
                      </button>
                      {!collapsed &&
                        rows.map((item) => {
                          const dCls = DOMAIN_STYLE[item.domain]
                          const selectedRow = item.id === selectedId
                          return (
                            <div
                              key={item.id}
                                role="button"
                                tabIndex={0}
                              className={`${styles.listRow} ${selectedRow ? styles.listRowSelected : ''}`}
                              onClick={() => setSelectedId(item.id)}
                              onKeyDown={(ev) => {
                                if (ev.key === 'Enter' || ev.key === ' ') {
                                  ev.preventDefault()
                                  setSelectedId(item.id)
                                }
                              }}
                            >
                              <button
                                type="button"
                                className={`${styles.check} ${item.done ? styles.checkDone : ''}`}
                                onClick={(e) => toggleDone(item.id, e)}
                                aria-label={item.done ? 'Снять отметку' : 'Выполнено'}
                              >
                                {item.done ? '✓' : ''}
                              </button>
                              <div className={styles.titleArea}>
                                <span className={`${styles.domainIcon} ${dCls}`}>{meta.icon}</span>
                                <span className={`${styles.titleText} ${item.done ? styles.titleDone : ''}`}>
                                  {item.title}
                                </span>
                              </div>
                              <div className={styles.idCell}>
                                <span className={styles.monoId}>{item.id}</span>
                              </div>
                              <div className={styles.assigneeCell}>
                                <Avatar initials={item.assignee} />
                                <span>{item.assignee}</span>
                              </div>
                              <div
                                className={styles.rowActions}
                                role="presentation"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                              >
                                <span
                                  className={
                                    item.showInFooter ? styles.footerDockActive : styles.footerDockInactive
                                  }
                                  title={
                                    item.showInFooter
                                      ? 'Закреплено в нижней панели (мок)'
                                      : 'Нет в нижней панели'
                                  }
                                  aria-label={
                                    item.showInFooter
                                      ? 'Закреплено в нижней панели'
                                      : 'Не закреплено в нижней панели'
                                  }
                                  role="img"
                                >
                                  {item.showInFooter ? (
                                    <AlignBottomIcon width={13} height={13} aria-hidden />
                                  ) : (
                                    <MinusIcon width={12} height={12} aria-hidden className={styles.footerDockOffIcon} />
                                  )}
                                </span>
                                <IconButton size="1" variant="ghost" asChild aria-label="Открыть в разделе">
                                  <Link href={getWorkItemContextHref(item)}>
                                    <OpenInNewWindowIcon width={14} height={14} />
                                  </Link>
                                </IconButton>
                                <IconButton
                                  size="1"
                                  variant="ghost"
                                  type="button"
                                  aria-label="Редактировать (мок)"
                                  title="Редактирование будет доступно после подключения API"
                                  onClick={() => undefined}
                                >
                                  <Pencil1Icon width={14} height={14} />
                                </IconButton>
                              </div>
                              <div className={styles.dateCell} title={item.dueAt ?? item.date}>
                                {formatWorkItemListDueDate(item)}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  )
                })
              )}
            </div>
          ) : null}

          {view === 'board' ? (
            <div className={styles.boardPane}>
              {[...BOARD_STAGE_ORDER, STATUS_FALLBACK_BUCKET].map((stage) => {
                const col = boardColumns.get(stage) ?? []
                if (col.length === 0 && stage !== 'В работе' && stage !== STATUS_FALLBACK_BUCKET) return null
                if (stage === STATUS_FALLBACK_BUCKET && col.length === 0) return null
                const stageBadgeColor =
                  stage === STATUS_FALLBACK_BUCKET
                    ? ('gray' as const)
                    : stage in WORK_ITEM_STATUS_BADGE_COLOR
                      ? WORK_ITEM_STATUS_BADGE_COLOR[stage as WorkItemStatus]
                      : ('gray' as const)
                return (
                  <div key={stage} className={styles.boardCol}>
                    <div className={styles.boardColHeader}>
                      <Badge size="1" color={stageBadgeColor}>
                        {stage}
                      </Badge>
                      <span className={styles.boardColCount}>{col.length}</span>
                    </div>
                    <div className={styles.boardCards}>
                      {col.map((item) => {
                        const meta = WORK_ITEM_DOMAIN_META[item.domain]
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`${styles.boardCard} ${item.id === selectedId ? styles.boardCardSelected : ''}`}
                            onClick={() => setSelectedId(item.id)}
                          >
                            <div className={styles.boardCardId}>
                              {meta.icon} {item.id}
                            </div>
                            <div className={styles.boardCardTitle}>{item.title}</div>
                            <div className={styles.boardCardFooter}>
                              <Avatar initials={item.assignee} />
                              <span
                                className={styles.priorityDot}
                                style={{ background: WORK_ITEM_PRIORITY_DOT[item.priority] }}
                              />
                              <span className={styles.monoId} style={{ marginLeft: 'auto' }}>
                                {item.date}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}

          {view === 'calendar' ? (
            <div className={styles.calendarPane}>
              <div className={styles.calendarTop}>
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Апрель 2026</span>
                <Badge size="1" variant="soft">
                  События и миты (мок-сетка)
                </Badge>
              </div>
              <div className={styles.calendarGrid}>
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
                  <div key={d} className={styles.calHead}>
                    {d}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const dayNum = i - 0
                  const isToday = dayNum === 2
                  const inMonth = dayNum >= 1 && dayNum <= 30
                  const dayEvents = inMonth
                    ? calendarItems.filter((it) => CALENDAR_DAY_BY_ID[it.id] === dayNum)
                    : []
                  return (
                    <div
                      key={i}
                      className={`${styles.calCell} ${isToday ? styles.calToday : ''}`}
                    >
                      {inMonth ? (
                        <>
                          <div className={styles.calDayNum}>{dayNum}</div>
                          {dayEvents.map((evt) => {
                            const cls = DOMAIN_STYLE[evt.domain]
                            return (
                              <div
                                key={evt.id}
                                role="button"
                                tabIndex={0}
                                className={`${styles.calEvent} ${cls}`}
                                onClick={() => setSelectedId(evt.id)}
                                onKeyDown={(ev) => {
                                  if (ev.key === 'Enter' || ev.key === ' ') {
                                    ev.preventDefault()
                                    setSelectedId(evt.id)
                                  }
                                }}
                                title={evt.title}
                              >
                                {WORK_ITEM_DOMAIN_META[evt.domain].icon} {evt.title}
                              </div>
                            )
                          })}
                        </>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          {selected ? (
            <WorkItemsDetailPanel
              variant="sidebar"
              item={selected}
              itemsById={itemsById}
              sectionOpen={sectionOpen}
              onToggleSection={onToggleSection}
              onClose={() => setSelectedId(null)}
              onSelectRelated={(id) => setSelectedId(id)}
              onOpenFullscreen={() => setDetailFullscreenOpen(true)}
            />
          ) : null}
        </div>
      </div>

      <Dialog.Root open={detailFullscreenOpen} onOpenChange={setDetailFullscreenOpen}>
        <Dialog.Content className={styles.detailFullscreenDialog} aria-describedby={undefined}>
          {selected ? (
            <>
              <Dialog.Title className={styles.visuallyHidden}>
                {selected.title} · {selected.id}
              </Dialog.Title>
              <WorkItemsDetailPanel
                variant="dialog"
                item={selected}
                itemsById={itemsById}
                sectionOpen={sectionOpen}
                onToggleSection={onToggleSection}
                onClose={() => setDetailFullscreenOpen(false)}
                onSelectRelated={(id) => setSelectedId(id)}
              />
            </>
          ) : null}
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Content style={{ maxWidth: 520 }}>
          <Dialog.Title>Новый объект</Dialog.Title>
          <Dialog.Description size="2" mb="3">
            Выберите домен и название. Идентификатор будет присвоен автоматически (мок).
          </Dialog.Description>
          <div className={styles.domainSelectGrid}>
            {WORK_ITEM_DOMAIN_ORDER.map((d) => {
              const m = WORK_ITEM_DOMAIN_META[d]
              return (
                <button
                  key={d}
                  type="button"
                  className={`${styles.domainOpt} ${createDomain === d ? styles.domainOptSelected : ''}`}
                  onClick={() => setCreateDomain(d)}
                >
                  <span style={{ fontSize: 18 }} aria-hidden>
                    {m.icon}
                  </span>
                  {m.label}
                </button>
              )
            })}
          </div>
          <TextField.Root
            mb="3"
            placeholder="Название"
            value={createTitle}
            onChange={(e) => setCreateTitle(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="soft" type="button" onClick={() => setCreateOpen(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={handleCreate}>
              Создать
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}
