import { EnterFullScreenIcon, Cross2Icon, OpenInNewWindowIcon } from '@radix-ui/react-icons'
import { Badge, IconButton } from '@radix-ui/themes'
import { Link } from '@/router-adapter'
import { getWorkItemContextHref } from '../domainContextLink'
import { WORK_ITEM_DOMAIN_META } from '../domainMeta'
import { WORK_ITEM_FIELD_SCHEMAS } from '../fieldSchemas'
import type { WorkItem, WorkItemDomain } from '../types'
import {
  WORK_ITEM_PRIORITY_DOT,
  WORK_ITEM_STATUS_BADGE_COLOR,
} from '../domainMeta'
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

interface WorkItemsDetailPanelProps {
  variant?: 'sidebar' | 'dialog'
  item: WorkItem
  itemsById: Map<string, WorkItem>
  sectionOpen: Record<string, boolean>
  onToggleSection: (key: string) => void
  onClose: () => void
  onSelectRelated: (id: string) => void
  /** Только для variant sidebar — открыть ту же карточку в полноэкранной модалке. */
  onOpenFullscreen?: () => void
}

export function WorkItemsDetailPanel({
  variant = 'sidebar',
  item,
  itemsById,
  sectionOpen,
  onToggleSection,
  onClose,
  onSelectRelated,
  onOpenFullscreen,
}: WorkItemsDetailPanelProps) {
  const meta = WORK_ITEM_DOMAIN_META[item.domain]
  const domainCls = DOMAIN_STYLE[item.domain]
  const schema = WORK_ITEM_FIELD_SCHEMAS[item.domain]
  const contextHref = getWorkItemContextHref(item)

  const descKey = 'desc'
  const relKey = 'rel'
  const actKey = 'act'

  const open = (k: string, def: boolean) => (k in sectionOpen ? sectionOpen[k]! : def)

  const rootClass =
    variant === 'dialog' ? `${styles.detailPanel} ${styles.detailPanelDialog}` : styles.detailPanel
  const closeLabel = variant === 'dialog' ? 'Закрыть окно' : 'Закрыть панель'

  return (
    <aside className={rootClass} aria-label="Карточка объекта">
      <div className={styles.detailHeader}>
        <div className={`${styles.detailDomainIcon} ${domainCls}`} aria-hidden>
          {meta.icon}
        </div>
        <span className={styles.monoId}>{item.id}</span>
        <div className={styles.detailHeaderActions}>
          <IconButton size="1" variant="ghost" type="button" asChild aria-label="Открыть в разделе">
            <Link href={contextHref}>
              <OpenInNewWindowIcon />
            </Link>
          </IconButton>
          {variant === 'sidebar' && onOpenFullscreen ? (
            <IconButton
              size="1"
              variant="ghost"
              type="button"
              onClick={onOpenFullscreen}
              aria-label="Развернуть на весь экран"
            >
              <EnterFullScreenIcon />
            </IconButton>
          ) : null}
          <IconButton size="1" variant="ghost" type="button" onClick={onClose} aria-label={closeLabel}>
            <Cross2Icon />
          </IconButton>
        </div>
      </div>
      <div className={styles.detailScroll}>
        <label className={styles.visuallyHidden} htmlFor={`wi-title-${item.id}`}>
          Название
        </label>
        <textarea
          id={`wi-title-${item.id}`}
          className={styles.detailTitle}
          rows={2}
          readOnly
          value={item.title}
        />

        <div className={styles.metaGrid}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Домен</span>
            <div className={styles.metaValue}>
              <Badge size="1" variant="soft">
                {meta.icon} {meta.label}
              </Badge>
            </div>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Статус</span>
            <div className={styles.metaValue}>
              <Badge size="1" color={WORK_ITEM_STATUS_BADGE_COLOR[item.status]}>
                {item.status}
              </Badge>
            </div>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Приоритет</span>
            <div className={styles.metaValue}>
              <span
                className={styles.priorityDot}
                style={{ background: WORK_ITEM_PRIORITY_DOT[item.priority] }}
              />
              <span>{item.priority}</span>
            </div>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Исполнитель</span>
            <div className={styles.metaValue}>
              <Avatar initials={item.assignee} />
              <span>{item.assignee}</span>
            </div>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Дата</span>
            <div className={styles.metaValue}>
              <span className={styles.monoId}>{item.date}</span>
            </div>
          </div>
          {item.menuContext ? (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Контекст</span>
              <div className={styles.metaValue}>{item.menuContext}</div>
            </div>
          ) : null}
          {item.tags.length > 0 ? (
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Теги</span>
              <div className={styles.metaValue}>
                {item.tags.map((t) => (
                  <Badge key={t} size="1" variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {item.appLinks && item.appLinks.length > 0 ? (
          <div className={styles.section}>
            <div className={styles.sectionTitle} style={{ marginBottom: 8 }}>
              В приложении
            </div>
            <div className={styles.skillTags}>
              {item.appLinks.map((l) => (
                <Badge key={`${l.href}-${l.label}`} size="1" asChild>
                  <Link href={l.href}>{l.label}</Link>
                </Badge>
              ))}
            </div>
          </div>
        ) : null}

        <div className={styles.section}>
          <button
            type="button"
            className={styles.sectionHeader}
            onClick={() => onToggleSection(descKey)}
          >
            <span className={styles.sectionTitle}>Описание</span>
            <span
              className={`${styles.sectionChevron} ${open(descKey, true) ? '' : styles.sectionChevronCollapsed}`}
            >
              ▾
            </span>
          </button>
          {open(descKey, true) ? (
            <textarea className={styles.descArea} rows={4} readOnly value={item.description} />
          ) : null}
        </div>

        {schema?.sections.map((sec) => {
          const k = sec.key
          return (
            <div key={k} className={styles.section}>
              <button type="button" className={styles.sectionHeader} onClick={() => onToggleSection(k)}>
                <span className={styles.sectionTitle}>{sec.label}</span>
                <span className={`${styles.sectionChevron} ${open(k, false) ? '' : styles.sectionChevronCollapsed}`}>
                  ▾
                </span>
              </button>
              {open(k, false) ? (
                sec.type === 'tags' ? (
                  <div className={styles.skillTags}>
                    {(sec.tags ?? []).map((t) => (
                      <span key={t} className={styles.skillTag}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className={styles.fieldGrid}>
                    {sec.fields?.length === 2 ? (
                      <div className={styles.fieldRow2}>
                        {sec.fields.map((f) => (
                          <div key={f.key} className={styles.field}>
                            <span className={styles.fieldLabel}>{f.label}</span>
                            {f.type === 'select' ? (
                              <select className={styles.fieldSelect} disabled aria-label={f.label}>
                                <option>—</option>
                                {(f.options ?? []).map((o) => (
                                  <option key={o} value={o}>
                                    {o}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input className={styles.fieldInput} disabled placeholder={f.placeholder} aria-label={f.label} />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      sec.fields?.map((f) => (
                        <div key={f.key} className={styles.field}>
                          <span className={styles.fieldLabel}>{f.label}</span>
                          {f.type === 'select' ? (
                            <select className={styles.fieldSelect} disabled aria-label={f.label}>
                              <option>—</option>
                              {(f.options ?? []).map((o) => (
                                <option key={o} value={o}>
                                  {o}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              className={styles.fieldInput}
                              disabled
                              placeholder={f.placeholder}
                              aria-label={f.label}
                              type={f.type === 'date' || f.type === 'datetime-local' ? f.type : 'text'}
                            />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )
              ) : null}
            </div>
          )
        })}

        {item.relatedItems.length > 0 ? (
          <div className={styles.section}>
            <button type="button" className={styles.sectionHeader} onClick={() => onToggleSection(relKey)}>
              <span className={styles.sectionTitle}>Связанные объекты</span>
              <span className={`${styles.sectionChevron} ${open(relKey, true) ? '' : styles.sectionChevronCollapsed}`}>
                ▾
              </span>
            </button>
            {open(relKey, true) ? (
              <div className={styles.relationList}>
                {item.relatedItems.map((rid) => {
                  const rel = itemsById.get(rid)
                  if (!rel) return null
                  const rMeta = WORK_ITEM_DOMAIN_META[rel.domain]
                  const rCls = DOMAIN_STYLE[rel.domain]
                  return (
                    <button
                      key={rid}
                      type="button"
                      className={styles.relationItem}
                      onClick={() => onSelectRelated(rid)}
                    >
                      <span className={`${styles.relationIcon} ${rCls}`}>{rMeta.icon}</span>
                      <span className={styles.relationTitle}>{rel.title}</span>
                      <span className={styles.relationBadge}>{rid}</span>
                    </button>
                  )
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className={styles.section}>
          <button type="button" className={styles.sectionHeader} onClick={() => onToggleSection(actKey)}>
            <span className={styles.sectionTitle}>Активность (мок)</span>
            <span className={`${styles.sectionChevron} ${open(actKey, false) ? '' : styles.sectionChevronCollapsed}`}>
              ▾
            </span>
          </button>
          {open(actKey, false) ? (
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <Avatar initials="АК" />
                <div className={styles.activityBody}>
                  <div className={styles.activityMeta}>
                    <strong>Алексей К.</strong> · обновление · 29 мар 18:42
                  </div>
                  <div className={styles.activityText}>Статус: {item.status}</div>
                </div>
              </div>
              <div className={styles.activityItem}>
                <Avatar initials="СИ" />
                <div className={styles.activityBody}>
                  <div className={styles.activityMeta}>
                    <strong>Система</strong> · автоматически · 28 мар
                  </div>
                  <div className={styles.activityText}>Объект синхронизирован с мок-данными HR Helper</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  )
}
