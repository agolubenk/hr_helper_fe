import { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Flex, Text } from '@radix-ui/themes'
import {
  CheckboxIcon,
  BellIcon,
  VideoIcon,
  FileTextIcon,
  BoxIcon,
  DotsHorizontalIcon,
  Cross2Icon,
} from '@radix-ui/react-icons'
import styles from './Footer.module.css'
import { usePathname, useRouter } from '@/router-adapter'

type TrayItemType = 'task' | 'notification' | 'module' | 'article' | 'meeting'

export interface TrayItem {
  id: string
  type: TrayItemType
  text: string
  /** Для type=meeting: путь с hash (например /meet/room#task=…), иначе откроется /meet/room */
  meetHref?: string
  /** Активная комната «в эфире» — точка в трее при сворачивании с meet */
  live?: boolean
}

export type FooterTrayAddDetail = {
  id?: string
  type: TrayItemType
  text: string
  meetHref?: string
  live?: boolean
}

export const FOOTER_TRAY_ADD_EVENT = 'footerTrayAddItem'

const ICON_MAP = {
  task: CheckboxIcon,
  notification: BellIcon,
  meeting: VideoIcon,
  article: FileTextIcon,
  module: BoxIcon,
} as const

// 24 примера задач и элементов для демонстрации
const EXAMPLE_ITEMS: TrayItem[] = [
  { id: '1', type: 'task', text: 'Проверить резюме кандидата' },
  { id: '2', type: 'meeting', text: 'Интервью: Frontend разработчик' },
  { id: '3', type: 'notification', text: 'Новый отклик на вакансию' },
  { id: '4', type: 'article', text: 'Гайд по онбордингу' },
  { id: '5', type: 'module', text: 'Модуль: Адаптация новичков' },
  { id: '6', type: 'task', text: 'Согласовать оффер' },
  { id: '7', type: 'meeting', text: 'Синхронизация с рекрутером' },
  { id: '8', type: 'task', text: 'Связаться с кандидатом' },
  { id: '9', type: 'notification', text: 'Кандидат принял оффер' },
  { id: '10', type: 'meeting', text: 'Онбординг: День 1' },
  { id: '11', type: 'article', text: 'Политика удалённой работы' },
  { id: '12', type: 'module', text: 'Модуль: Оценка 360' },
  { id: '13', type: 'task', text: 'Заполнить матрицу навыков' },
  { id: '14', type: 'meeting', text: '1:1 с руководителем' },
  { id: '15', type: 'notification', text: 'Заявка на отпуск одобрена' },
  { id: '16', type: 'article', text: 'Чек-лист для новичка' },
  { id: '17', type: 'module', text: 'Модуль: Цели и OKR' },
  { id: '18', type: 'task', text: 'Обновить профиль в Huntflow' },
  { id: '19', type: 'meeting', text: 'Ретро команды' },
  { id: '20', type: 'notification', text: 'Новая заявка на подбор' },
  { id: '21', type: 'article', text: 'Регламент интервью' },
  { id: '22', type: 'task', text: 'Провести скрининг' },
  { id: '23', type: 'meeting', text: 'Планирование спринта' },
  { id: '24', type: 'notification', text: 'Напоминание: дедлайн оффера' },
]

const STORAGE_KEY_ENABLED = 'footerTasksEnabled'
const STORAGE_KEY_COLLAPSED = 'footerTasksCollapsed'

export function Footer() {
  const router = useRouter()
  const pathname = usePathname()
  const isMeetRoomOpen = pathname?.startsWith('/meet/room')

  const meetingShowsLiveDot = (item: TrayItem): boolean =>
    item.type === 'meeting' && item.live === true

  const showTrayCloseControl = (item: TrayItem): boolean =>
    item.type !== 'meeting' || (!item.live && !isMeetRoomOpen)

  const year = new Date().getFullYear()
  const [items, setItems] = useState<TrayItem[]>(EXAMPLE_ITEMS)
  const [visibleCount, setVisibleCount] = useState(EXAMPLE_ITEMS.length)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [dropdownRight, setDropdownRight] = useState(12)
  const [tasksEnabled, setTasksEnabled] = useState(true)
  const [alwaysCollapsed, setAlwaysCollapsed] = useState(false)
  const trayRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const moreBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedEnabled = localStorage.getItem(STORAGE_KEY_ENABLED)
    const storedCollapsed = localStorage.getItem(STORAGE_KEY_COLLAPSED)
    if (storedEnabled !== null) setTasksEnabled(storedEnabled === 'true')
    if (storedCollapsed !== null) setAlwaysCollapsed(storedCollapsed === 'true')

    const handleSettingsChange = (e: CustomEvent<{ enabled: boolean; collapsed: boolean }>) => {
      setTasksEnabled(e.detail.enabled)
      setAlwaysCollapsed(e.detail.collapsed)
    }
    window.addEventListener('footerTasksSettingsChange', handleSettingsChange as EventListener)
    const handleAdd = (e: CustomEvent<FooterTrayAddDetail>) => {
      const nextText = (e.detail.text ?? '').trim()
      if (!nextText) return
      const next: TrayItem = {
        id: e.detail.id ?? `tray-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        type: e.detail.type,
        text: nextText,
        meetHref: e.detail.meetHref,
        live: e.detail.live,
      }
      setItems((prev) => {
        if (next.type === 'meeting' && next.meetHref) {
          const byHref = prev.findIndex((x) => x.type === 'meeting' && x.meetHref === next.meetHref)
          if (byHref >= 0) {
            const copy = [...prev]
            copy[byHref] = {
              ...copy[byHref],
              text: next.text,
              meetHref: next.meetHref,
              live: next.live ?? copy[byHref].live,
            }
            return copy
          }
        }
        if (prev.some((x) => x.type === next.type && x.text === next.text)) return prev
        return [next, ...prev]
      })
    }
    window.addEventListener(FOOTER_TRAY_ADD_EVENT, handleAdd as EventListener)
    return () => {
      window.removeEventListener('footerTasksSettingsChange', handleSettingsChange as EventListener)
      window.removeEventListener(FOOTER_TRAY_ADD_EVENT, handleAdd as EventListener)
    }
  }, [])

  const calculateLayout = useCallback(() => {
    const container = trayRef.current
    if (!container || items.length === 0) return

    const containerWidth = container.offsetWidth
    const moreBtnWidth = 72
    const gap = 8
    const estimatedItemWidth = 180
    let count = 0
    let w = 0

    for (let i = 0; i < items.length; i++) {
      const need = estimatedItemWidth + gap
      if (w + need < containerWidth - moreBtnWidth) {
        w += need
        count++
      } else break
    }
    setVisibleCount(count)
  }, [items.length])

  useEffect(() => {
    calculateLayout()
    const ro = new ResizeObserver(calculateLayout)
    if (trayRef.current) ro.observe(trayRef.current)
    return () => ro.disconnect()
  }, [calculateLayout, items])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const openItem = useCallback((item: TrayItem) => {
    if (item.type === 'meeting') {
      router.push(item.meetHref ?? '/meet/room')
      return
    }
    if (item.type === 'task') {
      router.push('/tasks')
    }
  }, [router])

  // Выравнивание правого края dropdown с правым краем кнопки +N
  useLayoutEffect(() => {
    if (!dropdownOpen || !moreBtnRef.current) return
    const rect = moreBtnRef.current.getBoundingClientRect()
    setDropdownRight(window.innerWidth - rect.right)
  }, [dropdownOpen])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current?.contains(e.target as Node) ||
        moreBtnRef.current?.contains(e.target as Node)
      )
        return
      setDropdownOpen(false)
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const effectiveVisibleCount = alwaysCollapsed ? 0 : visibleCount
  // На странице конкретной комнаты мит не показываем в футере (но сохраняем в state).
  const displayItems = isMeetRoomOpen ? items.filter((x) => x.type !== 'meeting') : items
  const visibleItems = displayItems.slice(0, effectiveVisibleCount)
  const hiddenItems = displayItems.slice(effectiveVisibleCount)
  const hasItems = tasksEnabled && displayItems.length > 0

  return (
    <footer className={styles.footer}>
      <Flex
        align="center"
        justify="between"
        className={styles.footerContent}
      >
        <Text size="1" color="gray" className={styles.copyright}>
          © HR Helper, {year}
        </Text>

        <div ref={trayRef} className={styles.trayArea}>
          {hasItems ? (
            <div className={styles.trayItems}>
              {visibleItems.map((item) => {
                const Icon = ICON_MAP[item.type]
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.trayBadge} ${styles[`type_${item.type}`]}`}
                    title={item.text}
                    onClick={() => openItem(item)}
                  >
                    <Icon width={14} height={14} className={styles.trayBadgeIcon} />
                    <span className={styles.trayBadgeText}>{item.text}</span>
                    {meetingShowsLiveDot(item) ? (
                      <span className={styles.trayLiveDot} aria-label="Мит активен" />
                    ) : null}
                    {showTrayCloseControl(item) ? (
                      <span
                        className={styles.trayBadgeClose}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          removeItem(item.id)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            removeItem(item.id)
                          }
                        }}
                      >
                        ×
                      </span>
                    ) : null}
                  </button>
                )
              })}
              {hiddenItems.length > 0 && (
                <div className={styles.trayMore}>
                  <button
                    ref={moreBtnRef}
                    type="button"
                    className={styles.trayMoreBtn}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDropdownOpen((v) => !v)
                    }}
                  >
                    <DotsHorizontalIcon width={14} height={14} />
                    <span className={styles.trayMoreCount}>+{hiddenItems.length}</span>
                  </button>
                  {dropdownOpen &&
                    createPortal(
                      <div
                        ref={dropdownRef}
                        className={styles.trayDropdown}
                        style={{ right: dropdownRight }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {hiddenItems.slice().reverse().map((item) => {
                          const Icon = ICON_MAP[item.type]
                          return (
                            <div
                              key={item.id}
                              role="button"
                              tabIndex={0}
                              className={`${styles.trayDropdownItem} ${styles[`type_${item.type}`]}`}
                              title={item.text}
                              onClick={() => {
                                openItem(item)
                                setDropdownOpen(false)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault()
                                  openItem(item)
                                  setDropdownOpen(false)
                                }
                              }}
                            >
                              <Icon width={14} height={14} className={styles.trayDropdownIcon} />
                              <span className={styles.trayDropdownText}>{item.text}</span>
                              {showTrayCloseControl(item) ? (
                                <button
                                  type="button"
                                  className={styles.trayDropdownRemove}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeItem(item.id)
                                  }}
                                  title="Удалить"
                                >
                                  <Cross2Icon width={12} height={12} />
                                </button>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>,
                      document.body
                    )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {!hasItems && (
          <Text size="1" color="gray">
            HR Helper
          </Text>
        )}
      </Flex>
    </footer>
  )
}
