import { Flex, Text, Button, Box, TextField, TextArea, Select, Badge, Tabs, DropdownMenu, Dialog, Spinner } from '@radix-ui/themes'
import { PlusIcon, MinusIcon, Crosshair1Icon, ChevronDownIcon, ChevronRightIcon, Pencil1Icon, TrashIcon, CheckIcon, Cross2Icon, MagnifyingGlassIcon, DownloadIcon, UploadIcon, ImageIcon, FileTextIcon, TableIcon, CodeIcon } from '@radix-ui/react-icons'
import { useState, useEffect, useRef, useCallback, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import { useToast } from '@/components/Toast/ToastContext'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { saveAs } from 'file-saver'
import styles from './OrgStructurePage.module.css'

interface Department {
  id: string
  name: string
  slug: string
  short_name: string
  parent: string | null
  description: string
  manager: string | null
  location: string | null
  created_at: string
  updated_at: string
  employee_count?: number
  children?: Department[]
}

const ZOOM_MIN = 0.5
const ZOOM_MAX = 1.5
const ZOOM_STEP = 0.1

function triggerDownload(href: string, filename: string) {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.rel = 'noopener noreferrer'
  link.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;'
  document.body.appendChild(link)
  link.focus()
  link.click()
  setTimeout(() => {
    document.body.removeChild(link)
    if (href.startsWith('blob:')) URL.revokeObjectURL(href)
  }, 500)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  triggerDownload(url, filename)
}

function OrgStructureVisual({
  departments,
  expandedNodes,
  onToggleNode,
  onExportSuccess,
  onExportJson,
}: {
  departments: Department[]
  expandedNodes: Set<string>
  onToggleNode: (id: string) => void
  onExportSuccess?: (msg: string) => void
  onExportJson?: () => void
}) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const schemeRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ contentW: 0, contentH: 0, containerW: 0, containerH: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null)
  const justDraggedRef = useRef(false)
  const [exportModal, setExportModal] = useState<{
    open: boolean
    type: 'png' | 'pdf' | null
    loading: boolean
    blob: Blob | null
    filename: string | null
    dataUrl?: string
  }>({ open: false, type: null, loading: false, blob: null, filename: null })

  const handleMouseDown = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    dragStartRef.current = { x: e.clientX, y: e.clientY, posX: position.x, posY: position.y }
    setIsDragging(true)
  }, [position.x, position.y])

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) justDraggedRef.current = true
    setPosition({
      x: dragStartRef.current.posX + dx,
      y: dragStartRef.current.posY + dy,
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    dragStartRef.current = null
    setIsDragging(false)
    if (justDraggedRef.current) {
      const preventClick = (ev: Event) => {
        ev.preventDefault()
        ev.stopPropagation()
        document.removeEventListener('click', preventClick, true)
        setTimeout(() => { justDraggedRef.current = false }, 0)
      }
      document.addEventListener('click', preventClick, true)
      setTimeout(() => document.removeEventListener('click', preventClick, true), 0)
    } else {
      justDraggedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!isDragging) return
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  useEffect(() => {
    const scheme = schemeRef.current
    const container = scrollContainerRef.current
    if (!scheme || !container) return
    const update = () => {
      if (scheme && container) {
        setDimensions({
          contentW: scheme.offsetWidth,
          contentH: scheme.offsetHeight,
          containerW: container.clientWidth,
          containerH: container.clientHeight,
        })
      }
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(scheme)
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  const hasCenteredRef = useRef(false)
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || dimensions.containerW === 0 || hasCenteredRef.current) return
    const { scrollWidth, scrollHeight, clientWidth, clientHeight } = container
    if (scrollWidth > clientWidth || scrollHeight > clientHeight) {
      container.scrollLeft = (scrollWidth - clientWidth) / 2
      container.scrollTop = (scrollHeight - clientHeight) / 2
      hasCenteredRef.current = true
    }
  }, [dimensions])

  const handleExportImage = useCallback(async () => {
    const el = schemeRef.current
    if (!el) return
    setExportModal({ open: true, type: 'png', loading: true, blob: null, filename: null })
    try {
      const canvas = await html2canvas(el, {
        scale: 1.5,
        backgroundColor: '#f3f4f6',
        logging: false,
        useCORS: true,
        allowTaint: true,
      })
      const fn = `org-structure-${new Date().toISOString().slice(0, 10)}.png`
      const dataUrl = canvas.toDataURL('image/png')
      canvas.toBlob(
        (blob) => {
          if (blob) {
            setExportModal({ open: true, type: 'png', loading: false, blob, filename: fn, dataUrl })
          } else {
            setExportModal({ open: false, type: null, loading: false, blob: null, filename: null })
            onExportSuccess?.('Ошибка экспорта в изображение')
          }
        },
        'image/png',
        0.95
      )
    } catch (err) {
      console.error('Export image error:', err)
      setExportModal({ open: false, type: null, loading: false, blob: null, filename: null })
      onExportSuccess?.('Ошибка экспорта в изображение')
    }
  }, [onExportSuccess])

  const handleExportPdf = useCallback(async () => {
    const el = schemeRef.current
    if (!el) return
    setExportModal({ open: true, type: 'pdf', loading: true, blob: null, filename: null })
    try {
      const canvas = await html2canvas(el, {
        scale: 1.5,
        backgroundColor: '#f3f4f6',
        logging: false,
        useCORS: true,
        allowTaint: true,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
      })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const ratio = Math.min(pageW / canvas.width, pageH / canvas.height) * 0.95
      const w = canvas.width * ratio
      const h = canvas.height * ratio
      pdf.addImage(imgData, 'PNG', (pageW - w) / 2, (pageH - h) / 2, w, h)
      const pdfBlob = pdf.output('blob')
      const filename = `org-structure-${new Date().toISOString().slice(0, 10)}.pdf`
      setExportModal({ open: true, type: 'pdf', loading: false, blob: pdfBlob, filename })
    } catch (err) {
      console.error('Export PDF error:', err)
      setExportModal({ open: false, type: null, loading: false, blob: null, filename: null })
      onExportSuccess?.('Ошибка экспорта в PDF')
    }
  }, [onExportSuccess])

  const handleCenter = useCallback(() => {
    setPosition({ x: 0, y: 0 })
    const container = scrollContainerRef.current
    if (container) {
      const { scrollWidth, scrollHeight, clientWidth, clientHeight } = container
      if (scrollWidth > clientWidth || scrollHeight > clientHeight) {
        container.scrollLeft = (scrollWidth - clientWidth) / 2
        container.scrollTop = (scrollHeight - clientHeight) / 2
      }
    }
  }, [])

  const handleExportModalDownload = useCallback(() => {
    if (!exportModal.blob || !exportModal.filename) return
    saveAs(exportModal.blob, exportModal.filename)
    onExportSuccess?.(exportModal.type === 'png' ? 'Схема экспортирована в PNG' : 'Схема экспортирована в PDF')
    setExportModal({ open: false, type: null, loading: false, blob: null, filename: null })
  }, [exportModal.blob, exportModal.filename, exportModal.type, onExportSuccess])

  const handleExportExcel = useCallback(() => {
    const toFlat = (nodes: Department[]): Department[] =>
      nodes.flatMap((n) => [n, ...(n.children ? toFlat(n.children) : [])])
    const flat = toFlat(departments)
    const getLevel = (id: string): number => {
      const dept = flat.find((d) => d.id === id)
      if (!dept?.parent) return 0
      return 1 + getLevel(dept.parent)
    }
    const getPath = (d: Department): string => {
      const findPath = (nodes: Department[], targetId: string, path: string[] = []): string[] | null => {
        for (const node of nodes) {
          const p = [...path, node.name]
          if (node.id === targetId) return p
          if (node.children) {
            const found = findPath(node.children, targetId, p)
            if (found) return found
          }
        }
        return null
      }
      return findPath(departments, d.id)?.join(' → ') ?? d.name
    }
    const rows = [
      ['Уровень', 'Название', 'Сокращение', 'Путь', 'Сотрудников', 'Локация'],
      ...flat.map((d) => [
        getLevel(d.id),
        d.name,
        d.short_name || '',
        getPath(d),
        d.employee_count ?? '',
        d.location || '',
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' })
    downloadBlob(blob, `org-structure-${new Date().toISOString().slice(0, 10)}.csv`)
    onExportSuccess?.('Схема экспортирована в Excel (CSV)')
  }, [departments, onExportSuccess])

  const renderCard = (dept: Department) => {
    const hasChildren = dept.children && dept.children.length > 0
    const isExpanded = expandedNodes.has(dept.id)

    return (
      <Flex
        key={dept.id}
        direction="column"
        align="center"
        gap="1"
        className={styles.visualCard}
        style={{
          padding: '16px 20px',
          minWidth: '180px',
          backgroundColor: 'var(--color-panel)',
          border: '1px solid var(--gray-a6)',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        <Text size="3" weight="bold" align="center">
          {dept.name}
        </Text>
        {dept.short_name && (
          <Badge color="gray" size="1">
            {dept.short_name}
          </Badge>
        )}
        {dept.employee_count !== undefined && (
          <Text size="1" color="gray">
            👥 {dept.employee_count}
          </Text>
        )}
        {hasChildren && (
          <Button
            variant="ghost"
            size="1"
            onClick={() => onToggleNode(dept.id)}
            style={{ marginTop: '4px' }}
          >
            {isExpanded ? (
              <>
                <ChevronDownIcon width={12} height={12} />
                Свернуть
              </>
            ) : (
              <>
                <ChevronRightIcon width={12} height={12} />
                Развернуть ({dept.children!.length})
              </>
            )}
          </Button>
        )}
      </Flex>
    )
  }

  const TreeNode = ({ node }: { node: Department }) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)

    return (
      <Box className={styles.treeNode}>
        {renderCard(node)}
        {hasChildren && isExpanded && (
          <Box className={styles.treeConnectors}>
            <Box className={styles.connectorVertical} />
            <Box className={styles.connectorHorizontal}>
              {node.children!.map((child) => (
                <Box key={child.id} className={styles.connectorBranch}>
                  <Box className={styles.connectorVerticalToChild} />
                  <TreeNode node={child} />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    )
  }

  const schemeFitsInViewport =
    dimensions.containerW > 0 &&
    dimensions.containerH > 0 &&
    dimensions.contentW * zoom <= dimensions.containerW &&
    dimensions.contentH * zoom <= dimensions.containerH

  if (departments.length === 0) {
    return (
      <Flex direction="column" align="center" justify="center" gap="3" style={{ padding: '100px 20px' }}>
        <Text size="8" style={{ opacity: 0.3 }}>
          📊
        </Text>
        <Text size="4" color="gray">
          Нет данных для отображения
        </Text>
      </Flex>
    )
  }

  return (
    <Box className={styles.visualTree}>
      <Flex justify="end" align="center" className={styles.schemeExportRow}>
        <Flex gap="2" align="center" className={styles.schemeExportControls}>
          <Button size="1" variant="soft" color="gray" title="Скачать как PNG" onClick={handleExportImage}>
            <ImageIcon width={14} height={14} />
          </Button>
          <Button size="1" variant="soft" color="gray" title="Скачать как PDF" onClick={handleExportPdf}>
            <FileTextIcon width={14} height={14} />
          </Button>
          <Button size="1" variant="soft" color="gray" title="Скачать как Excel (CSV)" onClick={handleExportExcel}>
            <TableIcon width={14} height={14} />
          </Button>
          <Button size="1" variant="soft" color="gray" title="Скачать как JSON" onClick={() => onExportJson?.()}>
            <CodeIcon width={14} height={14} />
          </Button>
        </Flex>
      </Flex>
      <Box ref={scrollContainerRef} className={styles.visualTreeScroll}>
        <Box
          className={`${styles.visualTreeScrollInner} ${isDragging ? styles.visualTreeScrollInnerDragging : ''}`}
          onMouseDown={handleMouseDown}
        >
          <Box
            ref={schemeRef}
            className={styles.visualTreeContent}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
          <Flex direction="row" gap="6" justify="center" wrap="wrap" align="start" className={styles.treeRoot}>
            {departments.map((dept) => (
              <TreeNode key={dept.id} node={dept} />
            ))}
          </Flex>
        </Box>
        </Box>
      </Box>
      <Dialog.Root open={exportModal.open} onOpenChange={(open) => !open && setExportModal({ open: false, type: null, loading: false, blob: null, filename: null })}>
        <Dialog.Content style={{ maxWidth: 500 }}>
          <Dialog.Title>
            {exportModal.type === 'png' ? 'Экспорт в PNG' : 'Экспорт в PDF'}
          </Dialog.Title>
          {exportModal.loading ? (
            <Flex direction="column" align="center" gap="3" py="6">
              <Spinner size="3" />
              <Text size="2" color="gray">Подготовка файла...</Text>
            </Flex>
          ) : exportModal.blob && exportModal.filename ? (
            <Flex direction="column" gap="4">
              {exportModal.type === 'png' && exportModal.dataUrl && (
                <Box style={{ maxHeight: 300, overflow: 'auto', borderRadius: 8, border: '1px solid var(--gray-a6)' }}>
                  <img src={exportModal.dataUrl} alt="Схема" style={{ maxWidth: '100%', display: 'block' }} />
                </Box>
              )}
              <Flex gap="2" justify="end">
                <Dialog.Close>
                  <Button variant="soft" color="gray">Отмена</Button>
                </Dialog.Close>
                <Button onClick={handleExportModalDownload}>
                  <DownloadIcon width={14} height={14} />
                  Скачать
                </Button>
              </Flex>
            </Flex>
          ) : null}
        </Dialog.Content>
      </Dialog.Root>
      <Flex justify="end" align="center" className={styles.zoomControlsRow}>
        <Flex direction="column" gap="1" className={styles.zoomControls}>
          <Button
            size="1"
            variant="soft"
            color="gray"
            onClick={handleCenter}
            title="Центрировать схему"
          >
            <Crosshair1Icon width={14} height={14} />
          </Button>
          <Button
            size="1"
            variant="soft"
            color="gray"
            onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
            disabled={zoom >= ZOOM_MAX}
            title="Увеличить"
          >
            <PlusIcon width={14} height={14} />
          </Button>
          <Button
            size="1"
            variant="soft"
            color="gray"
            onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
            disabled={schemeFitsInViewport || zoom <= ZOOM_MIN}
            title="Уменьшить"
          >
            <MinusIcon width={14} height={14} />
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}

export function OrgStructurePage() {
  const toast = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeView, setActiveView] = useState<'list' | 'visual'>('list')
  const [newDepartment, setNewDepartment] = useState<Partial<Department>>({
    name: '',
    short_name: '',
    parent: null,
    description: '',
    location: '',
  })

  useEffect(() => {
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const dept = (
        id: string,
        name: string,
        slug: string,
        short: string,
        parent: string | null,
        desc: string,
        count: number,
        children: Department[] = []
      ): Department => ({
        id,
        name,
        slug,
        short_name: short,
        parent,
        description: desc,
        manager: null,
        location: 'Главный офис',
        created_at: now,
        updated_at: now,
        employee_count: count,
        children,
      })

      const demoData: Department[] = [
        dept('1', 'IT Департамент', 'it-department', 'IT', null, 'Информационные технологии и разработка', 85, [
          dept('2', 'Отдел разработки', 'development', 'DEV', '1', 'Разработка ПО', 45, [
            dept('21', 'Фронтенд команда', 'frontend', 'FE', '2', 'React, Vue, мобильные приложения', 15, []),
            dept('22', 'Бэкенд команда', 'backend', 'BE', '2', 'API, микросервисы, базы данных', 18, []),
            dept('23', 'DevOps', 'devops', 'DO', '2', 'CI/CD, инфраструктура, мониторинг', 12, []),
          ]),
          dept('3', 'Отдел тестирования', 'qa', 'QA', '1', 'Контроль качества', 20, [
            dept('31', 'Автотесты', 'qa-auto', 'QA-A', '3', 'Selenium, Playwright, нагрузочное тестирование', 10, []),
            dept('32', 'Ручное тестирование', 'qa-manual', 'QA-M', '3', 'Функциональное и регрессионное тестирование', 10, []),
          ]),
          dept('4', 'Отдел инфраструктуры', 'infra', 'OPS', '1', 'Серверы, сети, поддержка', 20, [
            dept('41', 'Системная поддержка', 'sysadmin', 'SYS', '4', 'Администрирование серверов', 12, []),
            dept('42', 'Сетевая группа', 'network', 'NET', '4', 'Сети, VPN, безопасность', 8, []),
          ]),
        ]),
        dept('5', 'HR Департамент', 'hr-department', 'HR', null, 'Управление персоналом', 25, [
          dept('51', 'Рекрутинг', 'recruiting', 'REC', '5', 'Подбор персонала', 12, []),
          dept('52', 'Обучение и развитие', 'learning', 'L&D', '5', 'Онбординг, тренинги, карьера', 8, []),
          dept('53', 'Администрация персонала', 'hr-admin', 'HR-ADM', '5', 'Кадровое делопроизводство', 5, []),
        ]),
        dept('6', 'Финансовый департамент', 'finance', 'FIN', null, 'Финансы и учёт', 18, [
          dept('61', 'Бухгалтерия', 'accounting', 'ACC', '6', 'Учёт, отчётность, налоги', 10, []),
          dept('62', 'Контроллинг', 'controlling', 'CTL', '6', 'Планирование, анализ', 8, []),
        ]),
        dept('7', 'Департамент продаж', 'sales', 'SALES', null, 'Продажи и работа с клиентами', 35, [
          dept('71', 'Внутренние продажи', 'inside-sales', 'INS', '7', 'Входящие заявки, холодные звонки', 15, []),
          dept('72', 'Внешние продажи', 'outside-sales', 'OUT', '7', 'Крупные клиенты, B2B', 12, []),
          dept('73', 'Поддержка клиентов', 'customer-success', 'CS', '7', 'Удержание, апселл', 8, []),
        ]),
        dept('8', 'Маркетинг', 'marketing', 'MKT', null, 'Продвижение и бренд', 22, [
          dept('81', 'Digital-маркетинг', 'digital', 'DIG', '8', 'PPC, SMM, аналитика', 12, []),
          dept('82', 'Контент и дизайн', 'content', 'CNT', '8', 'Копирайтинг, дизайн, продвижение', 10, []),
        ]),
      ]

      setDepartments(demoData)
      const allIds = new Set<string>()
      const collectIds = (depts: Department[]) => {
        depts.forEach((dept) => {
          allIds.add(dept.id)
          if (dept.children) collectIds(dept.children)
        })
      }
      collectIds(demoData)
      setExpandedNodes(allIds)
    } catch (error) {
      console.error('Error loading departments:', error)
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  const getAllDepartmentsFlat = (tree: Department[]): Department[] => {
    const result: Department[] = []
    const traverse = (nodes: Department[]) => {
      nodes.forEach((node) => {
        result.push(node)
        if (node.children) traverse(node.children)
      })
    }
    traverse(tree)
    return result
  }

  const flattenForExport = (tree: Department[]): Omit<Department, 'children'>[] => {
    return getAllDepartmentsFlat(tree).map(({ children, ...rest }) => rest)
  }

  const handleExportJson = useCallback(() => {
    const data = flattenForExport(departments)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    downloadBlob(blob, `org-structure-${new Date().toISOString().slice(0, 10)}.json`)
    toast.showSuccess('Экспорт', 'Оргструктура экспортирована в JSON')
  }, [departments])

  const handleImportJson = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string) as Omit<Department, 'children'>[]
          if (!Array.isArray(data)) throw new Error('Неверный формат')
          const buildTree = (items: Omit<Department, 'children'>[], parentId: string | null): Department[] => {
            return items
              .filter((d) => (d.parent ?? null) === parentId)
              .map((d) => ({
                ...d,
                children: buildTree(items, d.id),
              }))
          }
          const tree = buildTree(data, null)
          setDepartments(tree)
          toast.showSuccess('Импорт', 'Оргструктура загружена из JSON')
        } catch (err) {
          toast.showError('Ошибка импорта', 'Не удалось прочитать файл. Проверьте формат JSON.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const getFullPath = (dept: Department, tree: Department[]): string => {
    const findPath = (nodes: Department[], targetId: string, path: string[] = []): string[] | null => {
      for (const node of nodes) {
        const currentPath = [...path, node.name]
        if (node.id === targetId) return currentPath
        if (node.children) {
          const found = findPath(node.children, targetId, currentPath)
          if (found) return found
        }
      }
      return null
    }
    const path = findPath(tree, dept.id)
    return path ? path.join(' → ') : dept.name
  }

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleAddDepartment = async () => {
    if (!newDepartment.name) {
      toast.showWarning('Ошибка', 'Введите название отдела')
      return
    }
    setSaving(true)
    try {
      setTimeout(() => {
        setShowAddForm(false)
        setNewDepartment({ name: '', short_name: '', parent: null, description: '', location: '' })
        setSaving(false)
        loadDepartments()
      }, 500)
    } catch (error) {
      console.error('Error creating department:', error)
      setSaving(false)
    }
  }

  const handleEditDepartment = async (_department: Department) => {
    setSaving(true)
    try {
      setTimeout(() => {
        setEditingDepartment(null)
        setSaving(false)
        loadDepartments()
      }, 500)
    } catch (error) {
      console.error('Error updating department:', error)
      setSaving(false)
    }
  }

  const removeDepartmentFromTree = (list: Department[], removeId: string): Department[] =>
    list
      .filter((d) => d.id !== removeId)
      .map((d) => ({
        ...d,
        children: d.children ? removeDepartmentFromTree(d.children, removeId) : undefined,
      }))

  const handleDeleteDepartment = (id: string) => {
    toast.showWarning('Удалить департамент?', 'Вы уверены, что хотите удалить этот департамент?', {
      actions: [
        { label: 'Отмена', onClick: () => {}, variant: 'soft', color: 'gray' },
        {
          label: 'Удалить',
          onClick: () => {
            setSaving(true)
            try {
              setDepartments((prev) => removeDepartmentFromTree(prev, id))
            } catch (e) {
              toast.showError('Ошибка', 'Ошибка при удалении департамента')
            } finally {
              setSaving(false)
            }
          },
          variant: 'solid',
          color: 'red',
        },
      ],
    })
  }

  const filterDepartments = (depts: Department[]): Department[] => {
    if (!searchTerm) return depts
    const searchLower = searchTerm.toLowerCase()
    const filtered: Department[] = []
    depts.forEach((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchLower) || dept.short_name?.toLowerCase().includes(searchLower)
      const filteredChildren = dept.children ? filterDepartments(dept.children) : []
      if (matchesSearch || filteredChildren.length > 0) {
        filtered.push({
          ...dept,
          children: filteredChildren.length > 0 ? filteredChildren : dept.children,
        })
      }
    })
    return filtered
  }

  const filteredDepartments = filterDepartments(departments)

  const renderDepartment = (dept: Department, level = 0): ReactNode => {
    const hasChildren = dept.children && dept.children.length > 0
    const isExpanded = expandedNodes.has(dept.id)
    const isEditing = editingDepartment?.id === dept.id

    return (
      <Box key={dept.id} style={{ marginLeft: `${level * 24}px`, marginBottom: '8px' }}>
        <Box
          className={styles.departmentItem}
          style={{
            padding: '12px',
            backgroundColor: 'var(--color-panel)',
            border: '1px solid var(--gray-a6)',
            borderRadius: '8px',
          }}
        >
          <Flex align="center" justify="between" gap="3">
            <Flex align="center" gap="2" style={{ flex: 1 }}>
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="1"
                  onClick={() => toggleNode(dept.id)}
                  style={{ minWidth: '24px', width: '24px', height: '24px', padding: 0, cursor: 'pointer' }}
                >
                  {isExpanded ? <ChevronDownIcon width={16} height={16} /> : <ChevronRightIcon width={16} height={16} />}
                </Button>
              )}
              {!hasChildren && <Box style={{ width: '24px' }} />}
              <Text size="2">{!dept.parent ? '📦' : !hasChildren ? '📄' : '📁'}</Text>
              <Flex direction="column" gap="1" style={{ flex: 1 }}>
                {isEditing ? (
                  <Flex direction="column" gap="2" style={{ width: '100%' }}>
                    <Flex gap="2" wrap="wrap">
                      <TextField.Root
                        size="2"
                        value={editingDepartment.name || ''}
                        onChange={(e) => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                        placeholder="Название *"
                        style={{ minWidth: '200px', flex: 1 }}
                      />
                      <TextField.Root
                        size="2"
                        value={editingDepartment.short_name || ''}
                        onChange={(e) => setEditingDepartment({ ...editingDepartment, short_name: e.target.value })}
                        placeholder="Сокращение"
                        style={{ minWidth: '120px', maxWidth: '150px' }}
                      />
                      <TextField.Root
                        size="2"
                        value={editingDepartment.location || ''}
                        onChange={(e) => setEditingDepartment({ ...editingDepartment, location: e.target.value })}
                        placeholder="Локация/офис"
                        style={{ minWidth: '150px', maxWidth: '200px' }}
                      />
                    </Flex>
                    <Select.Root
                      size="2"
                      value={editingDepartment.parent || 'none'}
                      onValueChange={(value) =>
                        setEditingDepartment({ ...editingDepartment, parent: value === 'none' ? null : value })
                      }
                    >
                      <Select.Trigger style={{ width: '100%', maxWidth: '400px' }} />
                      <Select.Content>
                        <Select.Item value="none">— Без родителя (корневой)</Select.Item>
                        {getAllDepartmentsFlat(departments)
                          .filter((d) => d.id !== editingDepartment.id)
                          .map((d) => (
                            <Select.Item key={d.id} value={d.id}>
                              {getFullPath(d, departments)}
                            </Select.Item>
                          ))}
                      </Select.Content>
                    </Select.Root>
                    <TextArea
                      size="2"
                      value={editingDepartment.description || ''}
                      onChange={(e) => setEditingDepartment({ ...editingDepartment, description: e.target.value })}
                      placeholder="Описание"
                      rows={2}
                      style={{ width: '100%' }}
                    />
                  </Flex>
                ) : (
                  <Flex direction="column" gap="1">
                    <Flex align="center" gap="2" wrap="wrap">
                      <Text size="3" weight="bold">
                        {dept.name}
                      </Text>
                      {dept.short_name && (
                        <Badge color="gray" size="1">
                          {dept.short_name}
                        </Badge>
                      )}
                    </Flex>
                    {dept.location && (
                      <Text size="1" color="gray">
                        📍 {dept.location}
                      </Text>
                    )}
                    {dept.description && (
                      <Text size="1" color="gray" style={{ fontStyle: 'italic' }}>
                        {dept.description}
                      </Text>
                    )}
                  </Flex>
                )}
              </Flex>
            </Flex>
            <Flex align="center" gap="2">
              {dept.employee_count !== undefined && (
                <Box className={styles.employeeBadge}>
                  <Badge color="blue" size="1">
                    👥 {dept.employee_count}
                  </Badge>
                </Box>
              )}
              {isEditing ? (
                <>
                  <Button
                    size="2"
                    variant="soft"
                    color="green"
                    onClick={() => handleEditDepartment(editingDepartment)}
                    disabled={saving}
                  >
                    <CheckIcon width={16} height={16} />
                  </Button>
                  <Button size="2" variant="soft" color="gray" onClick={() => setEditingDepartment(null)}>
                    <Cross2Icon width={16} height={16} />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="2"
                    variant="soft"
                    onClick={() =>
                      setEditingDepartment({
                        ...dept,
                        location: dept.location ?? '',
                        description: dept.description || '',
                        short_name: dept.short_name || '',
                      })
                    }
                  >
                    <Pencil1Icon width={16} height={16} />
                  </Button>
                  <Button size="2" variant="soft" color="red" onClick={() => handleDeleteDepartment(dept.id)}>
                    <TrashIcon width={16} height={16} />
                  </Button>
                </>
              )}
            </Flex>
          </Flex>
        </Box>
        {isExpanded && hasChildren && (
          <Box style={{ marginTop: '8px' }}>{dept.children!.map((child) => renderDepartment(child, level + 1))}</Box>
        )}
      </Box>
    )
  }

  if (loading) {
    return (
      <Flex direction="column" gap="4" className={styles.container}>
        <Box>
          <Flex align="center" gap="2" mb="2">
            <Text size="8" weight="bold">
              Оргструктура
            </Text>
          </Flex>
          <Text size="3" color="gray">
            Настройка организационной структуры компании
          </Text>
        </Box>
        <Flex align="center" justify="center" style={{ padding: '100px' }}>
          <Text size="3" color="gray">
            Загрузка...
          </Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap="4" className={styles.container} style={{ flex: 1, minHeight: 0 }}>
      <Flex justify="between" align="center" wrap="wrap" gap="3" className={styles.toolbarRow}>
        <Flex align="center" gap="2">
          <Text size="8" weight="bold">
            Оргструктура
          </Text>
        </Flex>
        <Flex gap="2" align="center">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button size="2" variant="soft" title="Импорт / Экспорт">
                <UploadIcon width={16} height={16} style={{ marginRight: 2 }} />
                <DownloadIcon width={16} height={16} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" style={{ minWidth: 180 }}>
              <DropdownMenu.Item onSelect={handleImportJson}>
                <UploadIcon width={16} height={16} style={{ marginRight: 8 }} />
                Импорт JSON
              </DropdownMenu.Item>
              <DropdownMenu.Item onSelect={handleExportJson}>
                <DownloadIcon width={16} height={16} style={{ marginRight: 8 }} />
                Экспорт JSON
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <Button size="3" onClick={() => setShowAddForm(!showAddForm)}>
            <PlusIcon width={16} height={16} />
            Добавить отдел
          </Button>
        </Flex>
      </Flex>
      <Text size="3" color="gray">
        Управление организационной структурой компании: департаменты, отделы и подразделения
      </Text>

      <Tabs.Root value={activeView} onValueChange={(v) => setActiveView(v as 'list' | 'visual')} className={styles.tabsRoot}>
        <Flex gap="3" align="center" justify="between" wrap="wrap" className={styles.toolbarRow}>
          <Tabs.List>
            <Tabs.Trigger value="list">Список</Tabs.Trigger>
            <Tabs.Trigger value="visual">Схема</Tabs.Trigger>
          </Tabs.List>
          <Box style={{ marginLeft: 'auto', minWidth: '280px', maxWidth: '400px' }}>
            <TextField.Root
              size="2"
              placeholder="Поиск департаментов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon width={16} height={16} />
              </TextField.Slot>
            </TextField.Root>
          </Box>
        </Flex>

      {showAddForm && (
        <Box
          style={{
            padding: '24px',
            backgroundColor: 'var(--color-panel)',
            border: '1px solid var(--gray-a6)',
            borderRadius: '12px',
          }}
        >
          <Text size="5" weight="bold" mb="4" style={{ display: 'block' }}>
            Новый отдел
          </Text>
          <Flex direction="column" gap="4">
            <Flex gap="3" wrap="wrap">
              <Box style={{ flex: 1, minWidth: '250px' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Название *
                </Text>
                <TextField.Root
                  size="2"
                  value={newDepartment.name || ''}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  placeholder="Например: Отдел разработки"
                />
              </Box>
              <Box style={{ flex: 1, minWidth: '200px' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Сокращенное название
                </Text>
                <TextField.Root
                  size="2"
                  value={newDepartment.short_name || ''}
                  onChange={(e) => setNewDepartment({ ...newDepartment, short_name: e.target.value })}
                  placeholder="Например: DEV"
                />
              </Box>
            </Flex>
            <Flex gap="3" wrap="wrap">
              <Box style={{ flex: 1, minWidth: '300px' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Родительский департамент
                </Text>
                <Select.Root
                  size="2"
                  value={newDepartment.parent || 'none'}
                  onValueChange={(value) => setNewDepartment({ ...newDepartment, parent: value === 'none' ? null : value })}
                >
                  <Select.Trigger style={{ width: '100%' }} />
                  <Select.Content>
                    <Select.Item value="none">— Без родителя (корневой)</Select.Item>
                    {getAllDepartmentsFlat(departments).map((dept) => (
                      <Select.Item key={dept.id} value={dept.id}>
                        {getFullPath(dept, departments)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </Box>
              <Box style={{ flex: 1, minWidth: '250px' }}>
                <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                  Локация/офис
                </Text>
                <TextField.Root
                  size="2"
                  value={newDepartment.location || ''}
                  onChange={(e) => setNewDepartment({ ...newDepartment, location: e.target.value })}
                  placeholder="Например: Главный офис"
                />
              </Box>
            </Flex>
            <Box>
              <Text size="2" weight="medium" mb="2" style={{ display: 'block' }}>
                Описание
              </Text>
              <TextArea
                size="2"
                value={newDepartment.description || ''}
                onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                placeholder="Описание задач и зоны ответственности департамента"
                rows={3}
                style={{ width: '100%' }}
              />
            </Box>
            <Flex gap="2">
              <Button size="3" onClick={handleAddDepartment} disabled={saving}>
                {saving ? 'Сохранение...' : 'Создать'}
              </Button>
              <Button
                size="3"
                variant="soft"
                color="gray"
                onClick={() => {
                  setShowAddForm(false)
                  setNewDepartment({ name: '', short_name: '', parent: null, description: '', location: '' })
                }}
              >
                Отмена
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}

        <Tabs.Content value="list">
      <Box style={{ paddingTop: '16px' }}>
        {filteredDepartments.length === 0 ? (
          <Flex direction="column" align="center" justify="center" gap="3" style={{ padding: '100px 20px' }}>
            <Text size="8" style={{ opacity: 0.3 }}>
              📦
            </Text>
            <Text size="4" color="gray">
              Нет департаментов
            </Text>
            <Text size="2" color="gray">
              Добавьте первый департамент для начала работы
            </Text>
          </Flex>
        ) : (
          <Flex direction="column" gap="2">
            {filteredDepartments.map((dept) => renderDepartment(dept))}
          </Flex>
        )}
      </Box>
        </Tabs.Content>

        <Tabs.Content value="visual" asChild>
          <Box className={styles.visualTabContent}>
            <OrgStructureVisual
              departments={filteredDepartments}
              expandedNodes={expandedNodes}
              onToggleNode={toggleNode}
              onExportSuccess={(msg) =>
                msg.startsWith('Ошибка') ? toast.showError('Экспорт', msg) : toast.showSuccess('Экспорт', msg)
              }
              onExportJson={handleExportJson}
            />
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    </Flex>
  )
}
