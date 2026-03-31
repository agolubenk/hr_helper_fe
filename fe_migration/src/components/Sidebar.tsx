/**
 * Sidebar (components/Sidebar.tsx) - Боковое меню навигации приложения
 * 
 * Назначение:
 * - Навигация по разделам приложения
 * - Иерархическая структура меню с вложенными пунктами
 * - Подсветка активного пункта меню
 * - Автоматическое раскрытие активных разделов
 * - Закрытие меню на мобильных устройствах при навигации
 * 
 * Функциональность:
 * - Иерархическое меню с поддержкой вложенных пунктов
 * - Автоматическое определение активного пункта по текущему пути
 * - Раскрытие/сворачивание разделов меню
 * - Навигация по внутренним и внешним ссылкам
 * - Обработка пунктов "в разработке" (показ toast вместо навигации)
 * - Синхронизация активной вкладки профиля через localStorage и CustomEvent
 * - Адаптивное поведение (закрытие на мобильных при навигации)
 * 
 * Связи:
 * - AppLayout: получает состояние isOpen и обработчик onClose
 * - usePathname: определение текущего пути для подсветки активного пункта
 * - useRouter: выполнение навигации
 * - useToast: отображение уведомлений для пунктов "в разработке"
 * - ThemeProvider: получение текущей темы
 * 
 * Поведение:
 * - При открытии автоматически раскрывает разделы с активными пунктами
 * - При клике на пункт с дочерними элементами - раскрывает/сворачивает
 * - При клике на пункт без дочерних элементов - выполняет навигацию
 * - На мобильных устройствах закрывается при навигации
 * - Пункты "в разработке" показывают toast вместо навигации
 */

import { Flex, Box, Text, Separator, DropdownMenu, IconButton, Button } from "@radix-ui/themes"
import * as Tooltip from '@radix-ui/react-tooltip'
import { ChevronDownIcon, ChevronUpIcon, GearIcon, OpenInNewWindowIcon, PlusIcon } from "@radix-ui/react-icons"
import { useState, ReactNode, useEffect, useCallback, useMemo } from "react"
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './Sidebar.module.css'
import { useTheme } from '@/components/ThemeProvider'
import { MAIN_MENU_ITEMS, MENU_SECTIONS } from '@/config/menuConfig'
import { SETTINGS_MENU_ITEMS } from '@/config/settingsMenuConfig'
import { PROFILE_REQUESTS_BLOCKS } from '@/config/profileRequestsConfig'
import { shouldMarkSidebarLinkAsPlaceholder } from '@/config/sidebarLinkImplementation'
import {
  readModuleEnableMap,
  COMPANY_MODULES_CHANGED_EVENT,
} from '@/features/system-settings/moduleSettingsStorage'
import {
  filterMainMenuItemsForModules,
  filterSettingsMenuForModules,
} from '@/features/system-settings/sidebarModuleMenuFilter'

/** Ключ localStorage для сохранения выбранной главной страницы (кнопка «Главная»). */
const SIDEBAR_HOME_HREF_KEY = 'sidebarHomeHref'
/** Ключ localStorage для сохранения главной страницы админки (кнопка «Admin CRM»). */
const SIDEBAR_ADMIN_HOME_HREF_KEY = 'sidebarAdminHomeHref'
/** Ключ localStorage для выбранного пункта «Мои заявки / документы» (кнопка «Заявки»). */
const SIDEBAR_PROFILE_REQUESTS_HREF_KEY = 'sidebarProfileRequestsHref'

/** Пустое множество — все пункты меню ведут навигацию по href (заглушки отключены) */
const IN_DEVELOPMENT_IDS = new Set<string>()

/**
 * MenuItem - интерфейс пункта меню
 * 
 * Структура:
 * - id: уникальный идентификатор пункта меню
 * - label: отображаемый текст пункта
 * - icon: иконка пункта (опционально)
 * - children: массив дочерних пунктов (для вложенных меню)
 * - href: ссылка для навигации (опционально)
 * - external: флаг внешней ссылки (открывается в новой вкладке)
 */
interface MenuItem {
  id: string
  label: string
  icon?: ReactNode
  children?: MenuItem[]
  href?: string
  external?: boolean
}

/**
 * SidebarProps - интерфейс пропсов компонента Sidebar
 * 
 * Структура:
 * - isOpen: флаг открытости меню
 * - onClose: обработчик закрытия меню
 */
interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * MenuItemComponentProps - интерфейс пропсов компонента MenuItemComponent
 * 
 * Структура:
 * - item: пункт меню для отображения
 * - isActive: флаг активности пункта (подсветка)
 * - level: уровень вложенности (для отступов)
 * - onNavigate: обработчик навигации (закрытие меню на мобильных)
 * - pathname: текущий путь для определения активности
 * - inDevelopment: флаг "в разработке" (показ toast вместо навигации)
 * - onInDevelopmentClick: обработчик клика на пункт "в разработке"
 */
interface MenuItemComponentProps {
  item: MenuItem
  isActive?: boolean
  level?: number
  onNavigate?: () => void
  pathname?: string | null
  inDevelopment?: boolean
  onInDevelopmentClick?: () => void
}

/**
 * isItemOrChildrenActive - проверка, является ли пункт меню или его дочерние элементы активными
 * 
 * Функциональность:
 * - Проверяет, соответствует ли текущий путь пункту меню или его дочерним элементам
 * - Обрабатывает специальные случаи (home -> /workflow, wiki -> /wiki/* и т.д.)
 * - Рекурсивно проверяет дочерние элементы
 * 
 * Используется для:
 * - Подсветки активного пункта меню
 * - Автоматического раскрытия разделов с активными пунктами
 * 
 * Специальные случаи:
 * - 'home' активен на '/workflow'
 * - 'wiki' активен на всех путях, начинающихся с '/wiki'
 * - 'recruiting' активен на путях рекрутинга
 * - 'finance' активен на путях финансов
 * - 'company-settings' активен на всех путях настроек компании
 * - 'reporting' активен на всех путях отчетности
 * 
 * @param item - пункт меню для проверки
 * @param pathname - текущий путь
 * @returns true если пункт или его дочерние элементы активны, иначе false
 */
function isItemOrChildrenActive(item: MenuItem, pathname: string | null | undefined): boolean {
  if (!pathname) return false
  
  // Специальные случаи для проверки активности
  // 'home' активен на странице '/workflow'
  if (item.id === 'home' && pathname === '/workflow') {
    return true
  }
  // 'recruiting' активен на всех страницах рекрутинга
  if (item.id === 'recruiting' && (
    pathname.startsWith('/ats') ||
    pathname.startsWith('/invites') ||
    pathname.startsWith('/vacancies') ||
    pathname.startsWith('/hiring-requests') ||
    pathname.startsWith('/reporting/hiring-plan') ||
    pathname.startsWith('/reporting')
  )) {
    return true
  }
  // 'finance' активен на страницах финансов
  if (item.id === 'finance' && (
    pathname.startsWith('/vacancies/salary-ranges') ||
    pathname.startsWith('/finance/benchmarks')
  )) {
    return true
  }
  // 'company-settings' активен на всех страницах настроек компании
  if (item.id === 'company-settings' && pathname.startsWith('/company-settings')) {
    return true
  }
  // 'company-settings-finance' активен на страницах финансовых настроек
  if (item.id === 'company-settings-finance' && pathname.startsWith('/company-settings/finance')) {
    return true
  }
  // 'vacancies-requests' активен на странице заявок
  if (item.id === 'vacancies-requests' && pathname.startsWith('/hiring-requests')) {
    return true
  }
  // 'recruiting-settings-interviewers' активен на странице интервьюеров (в настройках рекрутинга)
  if (item.id === 'recruiting-settings-interviewers' && pathname.startsWith('/interviewers')) {
    return true
  }
  // 'integrations-huntflow' активен на странице Huntflow
  if (item.id === 'integrations-huntflow' && pathname.startsWith('/huntflow')) {
    return true
  }
  // 'integrations-aichat' активен на странице AI Chat
  if (item.id === 'integrations-aichat' && pathname.startsWith('/aichat')) {
    return true
  }
  // 'integrations-telegram' активен на страницах Telegram
  if (item.id === 'integrations-telegram' && pathname.startsWith('/telegram')) {
    return true
  }
  // 'reporting-recruiting', 'analytics-builder' и др. — отчёты и аналитика
  if ((item.id === 'reporting-recruiting' || item.id === 'analytics-builder') && (pathname.startsWith('/reporting') || pathname.startsWith('/analytics'))) {
    return true
  }
  // 'employee-relations' активен на страницах Employee relations, сотрудников, специализаций, внутренних вакансий, команд
  if (item.id === 'employee-relations' && (
    pathname.startsWith('/hr-services/employee-relations') ||
    pathname.startsWith('/employees') ||
    pathname.startsWith('/specializations') ||
    pathname.startsWith('/internal-vacancies') ||
    pathname.startsWith('/employees/teams')
  )) {
    return true
  }
  // 'onboarding' активен на страницах онбординга
  if (item.id === 'onboarding' && pathname.startsWith('/onboarding')) {
    return true
  }
  // 'performance' активен на страницах эффективности и шкалах оценок
  if (item.id === 'performance' && (pathname.startsWith('/performance') || pathname.startsWith('/company-settings/rating-scales'))) {
    return true
  }
  // 'learning' активен на страницах обучения
  if (item.id === 'learning' && pathname.startsWith('/learning')) {
    return true
  }
  // 'hr-services' активен на страницах HR-сервисов
  if (item.id === 'hr-services' && pathname.startsWith('/hr-services')) {
    return true
  }
  // 'analytics' активен на страницах отчётов и аналитики
  if (item.id === 'analytics' && (pathname.startsWith('/analytics') || pathname.startsWith('/reporting'))) {
    return true
  }
  // 'hr-pr' активен на внутреннем сайте, опросах, вики, ивентах
  if (item.id === 'hr-pr' && (
    pathname.startsWith('/internal-site') ||
    pathname.startsWith('/hr-services/surveys') ||
    pathname.startsWith('/wiki') ||
    pathname.startsWith('/hr-pr')
  )) {
    return true
  }
  // 'tasks' активен на странице задач
  if (item.id === 'tasks' && pathname.startsWith('/tasks')) {
    return true
  }
  // «Внутренние миты» в основном блоке — только главная /meet
  if (item.id === 'meet-home') {
    return pathname === '/meet'
  }
  // Обзор кодинговой платформы — только /coding-platform (без вложенных путей)
  if (item.id === 'coding-platform-overview') {
    return pathname === '/coding-platform'
  }
  // 'finance' доп. путь для compensation
  if (item.id === 'finance' && pathname.startsWith('/compensation')) {
    return true
  }
  // 'settings-modules', 'general-settings', 'settings-user-groups', 'settings-workflows'
  if ((item.id === 'settings-modules' || item.id === 'general-settings' || item.id === 'settings-user-groups' || item.id === 'settings-workflows') && pathname?.startsWith('/settings')) {
    return true
  }
  // 'module-settings' и дочерние — настройки модулей (/settings, /interviewers, настройки рекрутинга под /company-settings/)
  if (
    item.id === 'module-settings' &&
    (pathname?.startsWith('/settings') ||
      pathname?.startsWith('/interviewers') ||
      pathname?.startsWith('/company-settings/recruiting') ||
      pathname?.startsWith('/company-settings/scorecard') ||
      pathname?.startsWith('/company-settings/Scorecard') ||
      pathname?.startsWith('/company-settings/vacancy-prompt') ||
      pathname?.startsWith('/company-settings/sla') ||
      pathname === '/candidate-responses')
  ) {
    return true
  }
  if (item.id?.startsWith('module-settings-') && pathname?.startsWith('/settings/modules')) {
    return true
  }
  // 'specializations' и подпункты по направлениям
  if (item.id === 'specializations' && pathname.startsWith('/specializations')) {
    return true
  }
  if (item.id === 'specializations-all' && pathname === '/specializations') {
    return true
  }
  if (item.id === 'specializations-frontend' && pathname?.startsWith('/specializations/frontend')) {
    return true
  }
  if (item.id === 'specializations-backend' && pathname?.startsWith('/specializations/backend')) {
    return true
  }
  // 'projects' активен на всех страницах проектов
  if (item.id === 'projects' && pathname.startsWith('/projects')) {
    return true
  }
  if (item.id === 'projects-teams' && pathname.startsWith('/projects/teams')) {
    return true
  }
  if (item.id === 'projects-resources' && pathname.startsWith('/projects/resources')) {
    return true
  }
  // 'ats' активен на странице ATS | Talent Pool
  if (item.id === 'ats' && pathname.startsWith('/ats')) {
    return true
  }
  // 'workflow-chat' активен на странице Workflow чат
  if (item.id === 'workflow-chat' && pathname === '/workflow') {
    return true
  }
  if (item.id === 'benchmarks-dashboard') {
    return pathname === '/finance/benchmarks' || pathname === '/company-settings/finance/benchmarks'
  }
  if (item.id === 'benchmarks-all') {
    return pathname === '/finance/benchmarks/all'
  }
  // Проверяем сам элемент: точное совпадение или начало пути
  if (item.href && item.id !== 'benchmarks-dashboard' && item.id !== 'meet-home' && item.id !== 'coding-platform-overview') {
    if (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) {
      return true
    }
  }
  
  // Проверяем дочерние элементы рекурсивно
  if (item.children && item.children.length > 0) {
    return item.children.some(child => isItemOrChildrenActive(child, pathname))
  }
  
  return false
}

/**
 * MenuItemComponent - компонент пункта меню
 * 
 * Функциональность:
 * - Отображение пункта меню с иконкой и текстом
 * - Раскрытие/сворачивание дочерних элементов
 * - Навигация по внутренним и внешним ссылкам
 * - Подсветка активного пункта
 * - Обработка пунктов "в разработке"
 * - Синхронизация активной вкладки профиля
 * 
 * Состояние:
 * - isExpanded: флаг раскрытости дочерних элементов
 * 
 * Поведение:
 * - Автоматически раскрывается, если пункт или его дочерние элементы активны
 * - При клике на пункт с дочерними элементами - раскрывает/сворачивает
 * - При клике на пункт без дочерних элементов - выполняет навигацию
 * - На мобильных закрывает меню при навигации
 * - Для пунктов "в разработке" показывает toast вместо навигации
 */
function MenuItemComponent({ item, isActive = false, level = 0, onNavigate, pathname, inDevelopment = false, onInDevelopmentClick }: MenuItemComponentProps) {
  const navigate = useNavigate()
  const isPlaceholderLink = shouldMarkSidebarLinkAsPlaceholder(item)
  const labelColor = isPlaceholderLink ? 'var(--red-11)' : 'var(--gray-12)'
  // Проверка наличия дочерних элементов
  const hasChildren = item.children && item.children.length > 0
  /**
   * shouldBeExpanded - должен ли пункт быть раскрыт
   * 
   * Логика:
   * - Раскрывается только если есть дочерние элементы И пункт или его дочерние элементы активны
   * 
   * Используется для:
   * - Автоматического раскрытия разделов с активными пунктами
   */
  const shouldBeExpanded = hasChildren && isItemOrChildrenActive(item, pathname)
  // Состояние раскрытости дочерних элементов
  const [isExpanded, setIsExpanded] = useState(shouldBeExpanded)
  
  /**
   * useEffect - обновление состояния раскрытости при изменении pathname
   * 
   * Функциональность:
   * - Обновляет isExpanded при изменении shouldBeExpanded
   * 
   * Поведение:
   * - Выполняется при изменении shouldBeExpanded (который зависит от pathname)
   * - Обеспечивает автоматическое раскрытие разделов при навигации
   */
  useEffect(() => {
    setIsExpanded(shouldBeExpanded)
  }, [shouldBeExpanded])

  /**
   * handleClick - обработчик клика на пункт меню
   * 
   * Функциональность:
   * - Обрабатывает клики на пункты меню
   * - Для пунктов "в разработке" показывает toast
   * - Для пунктов с дочерними элементами - раскрывает/сворачивает
   * - Для пунктов без дочерних элементов - выполняет навигацию
   * - Синхронизирует активную вкладку профиля через localStorage и CustomEvent
   * 
   * Поведение:
   * - Приоритет 1: Если пункт "в разработке" - показывает toast, навигацию не выполняет
   * - Приоритет 2: Если есть дочерние элементы - раскрывает/сворачивает, навигацию не выполняет
   * - Приоритет 3: Если есть href - выполняет навигацию
   * - На мобильных (< 768px) закрывает меню после навигации
   * 
   * Связи:
   * - router.push: внутренняя навигация
   * - window.open: внешняя навигация (новая вкладка)
   * - localStorage: сохранение активной вкладки профиля
   * - CustomEvent: синхронизация активной вкладки между вкладками браузера
   * 
   * @param e - событие клика (опционально)
   */
  const handleClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation() // Предотвращаем всплытие события
      e.preventDefault() // Предотвращаем стандартное поведение
    }

    // Пункт «в разработке»: показываем toast, навигацию не выполняем
    if (inDevelopment) {
      onInDevelopmentClick?.() // Показываем toast через обработчик
      return
    }
    
    // ПРИОРИТЕТ: Если есть дочерние элементы, сначала обрабатываем раскрытие/сворачивание
    if (hasChildren) {
      setIsExpanded(!isExpanded) // Инвертируем состояние раскрытости
      return // Выходим, не выполняя навигацию
    }
    
    // Если дочерних элементов нет, но есть href, выполняем навигацию
    if (item.href) {
      // Если это ссылка, выполняем навигацию
      if (item.external) {
        // Внешняя ссылка открывается в новой вкладке
        window.open(item.href, '_blank')
      } else {
        // Внутренняя ссылка - используем Next.js роутер
        // Если это ссылка на профиль, устанавливаем активную вкладку
        if (item.href === '/account/profile') {
          if (typeof window !== 'undefined') {
            let tabValue = 'profile' // По умолчанию вкладка "Профиль"
            
            // Если это "Интеграции и API", устанавливаем вкладку integrations
            if (item.id === 'settings-integrations') {
              tabValue = 'integrations'
            }
            // Если это "Профиль", устанавливаем вкладку profile
            else if (item.id === 'profile') {
              tabValue = 'profile'
            }
            
            // Сохраняем активную вкладку в localStorage для восстановления при загрузке
            localStorage.setItem('profileActiveTab', tabValue)
            // Отправляем кастомное событие для синхронизации в той же вкладке браузера
            // (позволяет обновить активную вкладку без перезагрузки страницы)
            window.dispatchEvent(new CustomEvent('localStorageChange', {
              detail: {
                key: 'profileActiveTab',
                value: tabValue
              }
            }))
          }
        }
        navigate(item.href) // Выполняем навигацию
        // Закрываем меню при навигации только на мобильных устройствах (< 768px)
        if (onNavigate && typeof window !== 'undefined' && window.innerWidth < 768) {
          onNavigate() // Закрываем меню на мобильных
        }
      }
    }
  }

  /**
   * Рендер компонента MenuItemComponent
   * 
   * Структура:
   * - Flex контейнер пункта меню с иконкой, текстом и индикаторами
   * - Условный рендеринг дочерних элементов при раскрытии
   * 
   * Стили:
   * - paddingLeft: отступ слева зависит от уровня вложенности (level)
   * - backgroundColor: подсветка при активности и наведении
   * - cursor: pointer для кликабельных пунктов
   */
  return (
    <Box>
      {/* Контейнер пункта меню
          - data-tour: атрибут для тура по приложению
          - className: применяет стили меню и активного состояния
          - onClick: обработчик клика (раскрытие/навигация)
          - onMouseEnter/onMouseLeave: визуальная обратная связь при наведении */}
      <Flex
        data-tour={`sidebar-${item.id}`}
        align="center"
        gap="2"
        px="3"
        py="2"
        className={`${styles.menuItem} ${isActive ? styles.menuItemActive : ''}`}
        style={{
          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent', // Подсветка активного пункта
          borderRadius: '6px',
          cursor: (item.href || hasChildren) ? 'pointer' : 'default', // Курсор pointer для кликабельных пунктов
          paddingLeft: level > 0 ? `${16 + level * 20}px` : '12px', // Отступ слева зависит от уровня вложенности
          position: 'relative',
          marginBottom: '2px',
          transition: 'all 0.2s ease-in-out', // Плавные переходы
        }}
        onClick={(e) => {
          e.stopPropagation() // Предотвращаем всплытие события
          handleClick(e) // Вызываем обработчик клика
        }}
        onMouseEnter={(e) => {
          // При наведении показываем легкую подсветку (только для неактивных кликабельных пунктов)
          if (!isActive && (item.href || hasChildren)) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
          }
        }}
        onMouseLeave={(e) => {
          // При уходе курсора возвращаем прозрачный фон (только для неактивных пунктов)
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        }}
      >
        {/* Иконка пункта меню (если есть) */}
        {item.icon && (
          <Box style={{ display: 'flex', alignItems: 'center', minWidth: '20px' }}>
            {item.icon}
          </Box>
        )}
        {/* Текст пункта меню
            - flex: 1 - занимает оставшееся пространство */}
        <Text size="2" style={{ flex: 1, color: labelColor }}>
          {item.label}
        </Text>
        {/* Индикатор наличия дочерних элементов
            - ChevronUpIcon: если раскрыто
            - ChevronDownIcon: если свернуто */}
        {hasChildren && (
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            {isExpanded ? (
              <ChevronUpIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
            ) : (
              <ChevronDownIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
            )}
          </Box>
        )}
        {/* Индикатор внешней ссылки
            - Показывается только для внешних ссылок (external === true) */}
        {item.external && (
          <OpenInNewWindowIcon width="14" height="14" style={{ color: 'var(--gray-12)', opacity: 0.7 }} />
        )}
      </Flex>
      {/* Дочерние элементы пункта меню
          - Рендерятся только если есть дочерние элементы И пункт раскрыт
          - stopPropagation: предотвращаем всплытие событий от дочерних элементов
          - Рекурсивный рендеринг MenuItemComponent для каждого дочернего элемента */}
      {hasChildren && isExpanded && (
        <Box onClick={(e) => e.stopPropagation()} onMouseEnter={(e) => e.stopPropagation()} onMouseLeave={(e) => e.stopPropagation()}>
          <Flex direction="column" style={{ marginTop: '4px' }}>
            {item.children!.map((child) => (
              <MenuItemComponent
                key={child.id}
                item={child}
                level={level + 1} // Увеличиваем уровень вложенности для отступов
                onNavigate={onNavigate}
                pathname={pathname}
                isActive={isItemOrChildrenActive(child, pathname)} // Определяем активность дочернего элемента
                inDevelopment={IN_DEVELOPMENT_IDS.has(child.id)} // Проверяем, в разработке ли дочерний элемент
                onInDevelopmentClick={onInDevelopmentClick}
              />
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  )
}

/**
 * Sidebar - основной компонент бокового меню
 * 
 * Состояние:
 * - isOpen: флаг открытости меню (из пропсов)
 * - theme: текущая тема приложения
 * - pathname: текущий путь для определения активных пунктов
 * 
 * Функциональность:
 * - Отображает иерархическое меню навигации
 * - Определяет активные пункты меню по текущему пути
 * - Обрабатывает клики на пункты меню
 * - Закрывается на мобильных при навигации
 * - Адаптивное позиционирование (учитывает StatusBar на странице ats)
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  // Проверка, является ли текущая страница ats (для корректного позиционирования)
  const isAtsPage = pathname?.startsWith('/ats')
  /**
   * topOffset - отступ сверху для меню
   * 
   * Логика:
   * - На странице ats: 112px (64px Header + 48px StatusBar)
   * - На остальных страницах: 64px (только Header)
   * 
   * Используется для:
   * - Корректного позиционирования меню под Header и StatusBar
   */
  const topOffset = isAtsPage ? '112px' : '64px' // 64px header + 48px status bar (только для ats)

  /**
   * homeHref - выбранная главная страница для кнопки «Главная».
   * Читается из localStorage при монтировании; выбор в выпадающем списке только сохраняет значение, без перехода.
   */
  const [homeHref, setHomeHref] = useState('/workflow')
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(SIDEBAR_HOME_HREF_KEY)
    if (stored) setHomeHref(stored)
  }, [])
  const setHomeHrefAndSave = useCallback((href: string) => {
    setHomeHref(href)
    if (typeof window !== 'undefined') localStorage.setItem(SIDEBAR_HOME_HREF_KEY, href)
  }, [])

  /**
   * adminHomeHref - выбранная главная страница админки для пункта «Admin CRM».
   * Читается из localStorage; выбор в выпадающем списке только сохраняет значение, без перехода.
   */
  const [adminHomeHref, setAdminHomeHref] = useState('/admin')
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(SIDEBAR_ADMIN_HOME_HREF_KEY)
    if (stored) setAdminHomeHref(stored)
  }, [])
  const setAdminHomeHrefAndSave = useCallback((href: string) => {
    setAdminHomeHref(href)
    if (typeof window !== 'undefined') localStorage.setItem(SIDEBAR_ADMIN_HOME_HREF_KEY, href)
  }, [])

  /**
   * profileRequestsHref — выбранный пункт для кнопки «Заявки» (Мои заявки / Мои документы).
   * По умолчанию — заявки на найм.
   */
  const [profileRequestsHref, setProfileRequestsHref] = useState('/hr-services/access')
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(SIDEBAR_PROFILE_REQUESTS_HREF_KEY)
    if (stored) setProfileRequestsHref(stored)
  }, [])
  const profileRequestsBlocks = PROFILE_REQUESTS_BLOCKS
  const profileRequestsLabel = profileRequestsBlocks.flatMap((b) => b.items).find((p) => p.href === profileRequestsHref)?.label ?? 'Заявки'
  const setProfileRequestsAndSave = useCallback((href: string) => {
    setProfileRequestsHref(href)
    if (typeof window !== 'undefined') localStorage.setItem(SIDEBAR_PROFILE_REQUESTS_HREF_KEY, href)
  }, [])
  
  const [moduleEnableMap, setModuleEnableMap] = useState(readModuleEnableMap)
  useEffect(() => {
    const sync = () => setModuleEnableMap(readModuleEnableMap())
    sync()
    window.addEventListener(COMPANY_MODULES_CHANGED_EVENT, sync)
    return () => window.removeEventListener(COMPANY_MODULES_CHANGED_EVENT, sync)
  }, [])

  /** Основное меню с учётом /settings/modules (вкл/выкл разделов). */
  const menuItems: MenuItem[] = useMemo(
    () => filterMainMenuItemsForModules(MAIN_MENU_ITEMS, moduleEnableMap) as MenuItem[],
    [moduleEnableMap]
  )

  const settingsItems: MenuItem[] = useMemo(
    () => filterSettingsMenuForModules(SETTINGS_MENU_ITEMS, moduleEnableMap) as MenuItem[],
    [moduleEnableMap]
  )

  /** Карта пунктов основного меню (company-settings теперь после Separator) */
  const menuItemsById = new Map(menuItems.map((i) => [i.id, i]))

  /** Пункты настроек после Separator (profile, workflow settings, integrations, company-settings, admin) */
  const settingsItemsAfterSeparator = settingsItems

  /**
   * mainPagesByBlock - главные страницы по блокам приложения для выпадающего списка «Настройки главной»
   */
  const mainPagesByBlock: { blockLabel: string; items: { label: string; href: string }[] }[] = [
    { blockLabel: 'Главная', items: [{ label: 'Home Page', href: '/' }] },
    { blockLabel: 'Календарь', items: [{ label: 'Календарь', href: '/calendar' }] },
    { blockLabel: 'Inbox / Workflow chat', items: [{ label: 'Workflow', href: '/workflow' }] },
    { blockLabel: 'Задачи', items: [{ label: 'Мои задачи', href: '/tasks' }] },
    { blockLabel: 'Внутренние миты', items: [{ label: 'Главная meet', href: '/meet' }] },
    {
      blockLabel: 'Кодинговая платформа',
      items: [{ label: 'Обзор платформы', href: '/coding-platform' }],
    },
    {
      blockLabel: 'Рекрутинг',
      items: [
        { label: 'ATS | Talent Pool', href: '/ats/vacancy/1/candidate/1' },
        { label: 'Вакансии', href: '/vacancies' },
        { label: 'Заявки на найм', href: '/hiring-requests' },
        { label: 'Интервью, ТЗ и скрининги', href: '/invites' },
        { label: 'План найма', href: '/reporting/hiring-plan' },
        { label: 'Отчёты по подбору', href: '/reporting' },
      ],
    },
    {
      blockLabel: 'Онбординг',
      items: [
        { label: 'Программы онбординга', href: '/onboarding/programs' },
        { label: 'Onboarding Pool', href: '/onboarding/pool' },
        { label: 'Чек‑листы', href: '/onboarding/checklists' },
        { label: 'Бадди‑система', href: '/onboarding/buddy' },
        { label: 'Документы онбординга', href: '/onboarding/documents' },
        { label: 'Отчёты по онбордингу', href: '/onboarding/reports' },
      ],
    },
    {
      blockLabel: 'HROps',
      items: [
        { label: 'Документы', href: '/hr-services/documents' },
        { label: 'Onboarding', href: '/onboarding' },
        { label: 'Отпуска и отсутствия', href: '/hr-services/leave' },
        { label: 'Учёт времени', href: '/hr-services/time-tracking' },
        { label: 'Тикет‑система', href: '/hr-services/tickets' },
        { label: 'Offboarding', href: '/hr-services/offboarding' },
      ],
    },
    {
      blockLabel: 'Employee relations',
      items: [
        { label: 'Employee relations', href: '/hr-services/employee-relations' },
        { label: 'Список сотрудников', href: '/employees' },
        { label: 'Профили', href: '/employees/profiles' },
        { label: 'Специализации', href: '/specializations' },
        { label: 'Оргструктура', href: '/employees/org-chart' },
        { label: 'Внутренние вакансии', href: '/internal-vacancies' },
        { label: 'Команды', href: '/employees/teams' },
      ],
    },
    {
      blockLabel: 'L&D',
      items: [
        { label: 'Курсы', href: '/learning/courses' },
        { label: 'Программы', href: '/learning/programs' },
        { label: 'Матрица навыков', href: '/learning/skills-matrix' },
        { label: 'Планы развития', href: '/learning/idp' },
        { label: 'Оценка знаний', href: '/learning/assessment' },
        { label: 'Обратная связь', href: '/learning/feedback' },
        { label: 'Отчёты по обучению', href: '/learning/reports' },
      ],
    },
    {
      blockLabel: 'Эффективность',
      items: [
        { label: 'Цели и OKR', href: '/performance/goals' },
        { label: 'Оценочные циклы', href: '/performance/reviews' },
        { label: 'Шкалы оценок', href: '/company-settings/rating-scales' },
        { label: 'Nine‑box / калибровки', href: '/performance/ninebox' },
        { label: 'PIP и планы улучшения', href: '/performance/pip' },
      ],
    },
    {
      blockLabel: 'C&B',
      items: [
        { label: 'Зарплатные вилки', href: '/vacancies/salary-ranges' },
        { label: 'Бенчмарки', href: '/finance/benchmarks' },
        { label: 'Льготы и бонусы', href: '/compensation/benefits' },
        { label: 'Пересмотр вознаграждения', href: '/compensation/review' },
        { label: 'Отчёты по C&B', href: '/compensation/reports' },
      ],
    },
    {
      blockLabel: 'HR PR и внутренняя коммуникация',
      items: [
        { label: 'Внутренний сайт', href: '/internal-site' },
        { label: 'Посты / Создать пост', href: '/internal-site/post/create' },
        { label: 'Опросы', href: '/hr-services/surveys' },
        { label: 'Вики', href: '/wiki' },
        { label: 'Ивенты и признание', href: '/hr-pr/events' },
      ],
    },
    {
      blockLabel: 'Проекты и ресурсы',
      items: [
        { label: 'Список проектов', href: '/projects' },
        { label: 'Команды проекта', href: '/projects/teams' },
        { label: 'Ресурсы и аллокация', href: '/projects/resources' },
        { label: 'HR‑проекты', href: '/projects/hr' },
      ],
    },
    {
      blockLabel: 'Отчёты и аналитика',
      items: [
        { label: 'По подбору', href: '/reporting' },
        { label: 'По сотрудникам и оргструктуре', href: '/reporting/employees' },
        { label: 'По финансам', href: '/reporting/finance' },
        { label: 'По интеграциям и SLA', href: '/reporting/integrations' },
        { label: 'L&D и эффективность', href: '/reporting/learning' },
        { label: 'C&B и льготы', href: '/reporting/compensation' },
        { label: 'Конструктор дашбордов', href: '/analytics' },
      ],
    },
    {
      blockLabel: 'Интеграции и автоматизации',
      items: [
        { label: 'Huntflow', href: '/huntflow' },
        { label: 'hh.ru/rabota.by', href: '/integrations/hh' },
        { label: 'Telegram', href: '/telegram' },
        { label: 'n8n', href: '/integrations/n8n' },
        { label: 'ClickUp', href: '/integrations/clickup' },
        { label: 'Notion', href: '/integrations/notion' },
        { label: 'Automation / Workflows', href: '/settings/workflows' },
        { label: 'AI Chat / Copilot', href: '/aichat' },
      ],
    },
  ]

  /** Главные страницы для выпадающего списка Admin — те же блоки, что и для «Настройки главной» + страница админки */
  const adminMainPagesByBlock: { blockLabel: string; items: { label: string; href: string }[] }[] = [
    { blockLabel: 'Админка', items: [{ label: 'Главная админки', href: '/admin' }] },
    ...mainPagesByBlock,
  ]

  /** menuSections — из shared/config/menuConfig */
  const menuSections = MENU_SECTIONS

  /**
   * Рендер компонента Sidebar
   * 
   * Структура:
   * - Фиксированная позиция справа
   * - Отступ сверху зависит от наличия StatusBar (topOffset)
   * - Анимация появления/исчезновения через transform
   * - Основное меню (menuItems)
   * - Разделитель
   * - Меню настроек (settingsItems)
   * 
   * Стили:
   * - transform: translateX(0) когда открыто, translateX(100%) когда закрыто
   * - transition: плавная анимация появления/исчезновения
   * - overflowY: auto - вертикальная прокрутка при переполнении
   */
  return (
    <Box
      position="fixed"
      top={topOffset} // Отступ сверху: 112px для ats (Header + StatusBar), 64px для остальных (только Header)
      right="0"
      className={styles.sidebar}
      style={{
        backgroundColor: theme === 'dark' ? 'var(--gray-2, #1c1c1f)' : '#ffffff', // Адаптивный фон в зависимости от темы
        borderLeft: '1px solid var(--gray-a6)', // Разделительная линия слева
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)', // Анимация: открыто - видно, закрыто - скрыто справа
        transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out', // Плавные переходы
        overflowY: 'auto', // Вертикальная прокрутка при переполнении
      }}
    >
      <Flex direction="column" p="2" gap="1">
        {/* Явный пункт «Главная» — всегда на самом верху */}
        {(() => {
          const homeItem = menuItemsById.get('home')
          if (!homeItem) return null
          const homeItemWithHref = { ...homeItem, href: homeHref }
          const isHomeActive = pathname === homeHref
          return (
            <Box key="home-top">
              <Flex align="center" gap="2" pr="3" style={{ alignItems: 'center' }}>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <MenuItemComponent
                    item={homeItemWithHref}
                    isActive={isHomeActive}
                    onNavigate={onClose}
                    pathname={pathname}
                    inDevelopment={IN_DEVELOPMENT_IDS.has('home')}
                    onInDevelopmentClick={undefined}
                  />
                </Box>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <IconButton
                      size="1"
                      variant="ghost"
                      title="Настройки главной страницы"
                      style={{ color: 'var(--gray-12)', opacity: 0.7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GearIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
                    </IconButton>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end" style={{ minWidth: 220 }}>
                    {mainPagesByBlock.map((block) => (
                      <DropdownMenu.Group key={block.blockLabel}>
                        <DropdownMenu.Label style={{ fontWeight: 'bold', color: 'var(--gray-12)' }}>{block.blockLabel}</DropdownMenu.Label>
                        {block.items.map((page) => (
                          <DropdownMenu.Item
                            key={page.href}
                            onSelect={() => setHomeHrefAndSave(page.href)}
                          >
                            {page.label}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Group>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Flex>
            </Box>
          )
        })()}
        {/* Основное меню навигации
            - Рендерим все пункты основного меню
            - Первый сепаратор — после «Задачи»
            - Определяем активность каждого пункта по текущему пути */}
        {menuSections.map((section, sectionIdx) => (
          <Box key={section.label}>
            {sectionIdx >= 1 && <Separator size="4" my="2" />}
            {section.itemIds.map((id) => {
              const item = menuItemsById.get(id)
              if (!item) return null
              let isActive = pathname === item.href || 
            (item.id === 'home' && pathname === homeHref) ||
            (item.id === 'calendar' && pathname?.startsWith('/calendar')) ||
            (item.id === 'specializations' && pathname?.startsWith('/specializations')) ||
            (item.id === 'specializations-all' && pathname?.startsWith('/specializations')) ||
            (item.id === 'specializations-frontend' && pathname?.startsWith('/specializations/frontend')) ||
            (item.id === 'specializations-backend' && pathname?.startsWith('/specializations/backend')) ||
            (item.id === 'projects' && pathname?.startsWith('/projects')) ||
            (item.id === 'projects-list' && pathname === '/projects') ||
            (item.id === 'projects-teams' && pathname?.startsWith('/projects/teams')) ||
            (item.id === 'projects-resources' && pathname?.startsWith('/projects/resources')) ||
            (item.id === 'projects-hr' && pathname?.startsWith('/projects/hr')) ||
            (item.id === 'recruiting' && (
              pathname?.startsWith('/ats') ||
              pathname?.startsWith('/invites') ||
              pathname?.startsWith('/vacancies') ||
              pathname?.startsWith('/hiring-requests') ||
              pathname?.startsWith('/reporting/hiring-plan') ||
              pathname?.startsWith('/reporting')
            )) ||
            (item.id === 'tasks' && pathname?.startsWith('/tasks')) ||
            (item.id === 'meet-home' && pathname === '/meet') ||
            (item.id === 'meet-system' && pathname?.startsWith('/meet/')) ||
            (item.id === 'meet-new-links' && pathname === '/meet/new-links') ||
            (item.id === 'meet-room' && pathname === '/meet/room') ||
            (item.id === 'meet-history' && pathname === '/meet/history') ||
            (item.id === 'meet-upcoming' && pathname === '/meet/upcoming') ||
            (item.id === 'meet-archive' && pathname === '/meet/archive') ||
            (item.id === 'coding-platform' && pathname?.startsWith('/coding-platform')) ||
            (item.id === 'coding-platform-overview' && pathname === '/coding-platform') ||
            (item.id === 'coding-platform-saved' && pathname === '/coding-platform/saved') ||
            (item.id === 'coding-platform-playground' && pathname === '/coding-platform/playground') ||
            (item.id === 'link-builder' && pathname === '/link-builder') ||
            (item.id === 'ats' && pathname?.startsWith('/ats')) ||
            (item.id === 'workflow-chat' && pathname === '/workflow') ||
            (item.id === 'invites' && pathname?.startsWith('/invites')) ||
            (item.id === 'vacancies-list' && pathname?.startsWith('/vacancies')) ||
            (item.id === 'vacancies-requests' && pathname?.startsWith('/hiring-requests')) ||
            (item.id === 'reporting-hiring-plan' && pathname?.startsWith('/reporting/hiring-plan')) ||
            (item.id === 'recruiting-reports' && pathname?.startsWith('/reporting')) ||
            (item.id === 'finance' && (
              pathname?.startsWith('/vacancies/salary-ranges') ||
              pathname?.startsWith('/finance/benchmarks')
            )) ||
            (item.id === 'finance-salary-ranges' && pathname?.startsWith('/vacancies/salary-ranges')) ||
            (item.id === 'finance-benchmarks' && pathname?.startsWith('/finance/benchmarks')) ||
            (item.id === 'benchmarks-dashboard' &&
              (pathname === '/finance/benchmarks' || pathname === '/company-settings/finance/benchmarks')) ||
            (item.id === 'benchmarks-all' && pathname === '/finance/benchmarks/all') ||
            (item.id === 'integrations' && (
              pathname?.startsWith('/huntflow') ||
              pathname?.startsWith('/aichat') ||
              pathname?.startsWith('/telegram') ||
              pathname?.startsWith('/settings/workflows') ||
              pathname?.startsWith('/integrations')
            )) ||
            (item.id === 'employee-relations' && (
              pathname?.startsWith('/hr-services/employee-relations') ||
              pathname?.startsWith('/employees') ||
              pathname?.startsWith('/specializations') ||
              pathname?.startsWith('/internal-vacancies') ||
              pathname?.startsWith('/employees/teams')
            )) ||
            (item.id === 'onboarding' && pathname?.startsWith('/onboarding')) ||
            (item.id === 'performance' && pathname?.startsWith('/performance')) ||
            (item.id === 'learning' && pathname?.startsWith('/learning')) ||
            (item.id === 'hr-services' && pathname?.startsWith('/hr-services')) ||
            (item.id === 'analytics' && (pathname?.startsWith('/analytics') || pathname?.startsWith('/reporting'))) ||
            (item.id === 'hr-pr' && (pathname?.startsWith('/internal-site') || pathname?.startsWith('/hr-services/surveys') || pathname?.startsWith('/wiki') || pathname?.startsWith('/hr-pr'))) ||
            (item.id === 'compensation-benefits' && pathname?.startsWith('/compensation')) ||
            (item.id === 'company-settings' && (pathname?.startsWith('/company-settings') || pathname?.startsWith('/settings/custom-fields')))
          
          return (
                <MenuItemComponent
                  key={item.id}
                  item={item}
                  isActive={isActive}
                  onNavigate={onClose}
                  pathname={pathname}
                  inDevelopment={IN_DEVELOPMENT_IDS.has(item.id)}
                  onInDevelopmentClick={undefined}
                />
              )
            })}
          </Box>
        ))}

        {/* Разделитель между основным меню и настройками */}
        <Separator size="4" my="2" />

        {/* Меню настроек (после Separator)
            - Пункты настроек пользователя (company-settings уже в основном меню выше)
            - Специальная логика определения активности для профиля (проверка активной вкладки) */}
        {settingsItemsAfterSeparator.map((item) => {
          /**
           * Определение активности пункта настроек
           * 
           * Логика:
           * - Для 'settings-integrations': проверяет активную вкладку 'integrations' в localStorage
           * - Для 'profile': проверяет, что активная вкладка 'profile' или не установлена
           * - Для 'company-settings': использует isItemOrChildrenActive для проверки пути и дочерних элементов
           * - Для остальных: проверяет точное совпадение пути
           */
          let isActive = pathname === item.href
          
          // Для страницы интеграций проверяем активную вкладку в localStorage
          if (item.id === 'settings-integrations' && pathname === '/account/profile') {
            if (typeof window !== 'undefined') {
              const activeTab = localStorage.getItem('profileActiveTab')
              isActive = activeTab === 'integrations' // Активен только если активная вкладка 'integrations'
            }
          } else if (item.id === 'profile' && pathname === '/account/profile') {
            // Для профиля проверяем, что активная вкладка - это профиль (или не установлена)
            if (typeof window !== 'undefined') {
              const activeTab = localStorage.getItem('profileActiveTab')
              isActive = !activeTab || activeTab === 'profile' // Активен если вкладка 'profile' или не установлена
            }
          } else if (item.id === 'company-settings' && (pathname?.startsWith('/company-settings') || pathname?.startsWith('/settings/custom-fields'))) {
            isActive = isItemOrChildrenActive(item, pathname)
          } else if (item.id === 'settings-user-groups' && pathname?.startsWith('/settings/user-groups')) {
            isActive = true
          } else if (item.id === 'admin' && pathname?.startsWith('/admin')) {
            isActive = true
          } else if (item.id === 'settings-workflows' && pathname?.startsWith('/settings/workflows')) {
            isActive = true
          }

          if (item.id === 'profile') {
            return (
              <Flex key={item.id} align="center" gap="2" pr="3" style={{ alignItems: 'center' }}>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <MenuItemComponent
                    item={item}
                    isActive={isActive}
                    onNavigate={onClose}
                    pathname={pathname}
                    inDevelopment={IN_DEVELOPMENT_IDS.has(item.id)}
                    onInDevelopmentClick={undefined}
                  />
                </Box>
                <div className={styles.adminButtonGroup}>
                  <Button
                    size="1"
                    variant="soft"
                    className={`${styles.adminOpenBtn} ${styles.adminOpenBtnIcon}`}
                    title="Создать заявку"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate('/hiring-requests')
                      onClose()
                    }}
                  >
                    <PlusIcon width={14} height={14} />
                  </Button>
                  <Button
                    size="1"
                    variant="soft"
                    className={`${styles.adminOpenBtn} ${styles.adminOpenBtnAccent}`}
                    title={profileRequestsLabel}
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(profileRequestsHref)
                      onClose()
                    }}
                  >
                    <span className={styles.adminBtnLabel}>{profileRequestsLabel}</span>
                  </Button>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <IconButton
                        size="1"
                        variant="soft"
                        title="Мои заявки и документы"
                        style={{ flexShrink: 0 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <GearIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
                      </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end" style={{ minWidth: 240 }}>
                      {profileRequestsBlocks.map((block) => (
                        <DropdownMenu.Group key={block.blockLabel}>
                          <DropdownMenu.Label style={{ fontWeight: 'bold', color: 'var(--gray-12)' }}>{block.blockLabel}</DropdownMenu.Label>
                          {block.items.map((page) => (
                            <DropdownMenu.Item
                              key={page.href}
                              onSelect={() => {
                                setProfileRequestsAndSave(page.href)
                                navigate(page.href)
                                onClose()
                              }}
                            >
                              {page.label}
                            </DropdownMenu.Item>
                          ))}
                        </DropdownMenu.Group>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </div>
              </Flex>
            )
          }

          if (item.id === 'admin') {
            const adminItem = { ...item, href: adminHomeHref }
            const adminPageLabel = adminMainPagesByBlock.flatMap((b) => b.items).find((p) => p.href === adminHomeHref)?.label ?? 'Вкладка'
            return (
              <Flex key={item.id} align="center" gap="2" pr="3" style={{ alignItems: 'center' }}>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <MenuItemComponent
                    item={adminItem}
                    isActive={isActive}
                    onNavigate={onClose}
                    pathname={pathname}
                    inDevelopment={IN_DEVELOPMENT_IDS.has(item.id)}
                    onInDevelopmentClick={undefined}
                  />
                </Box>
                <Tooltip.Provider delayDuration={200}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <div className={styles.adminButtonGroup}>
                        <Button
                          size="1"
                          variant="soft"
                          className={styles.adminOpenBtn}
                          title={`Открыть «${adminPageLabel}» во внешней вкладке`}
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(adminHomeHref, '_blank', 'noopener,noreferrer')
                          }}
                        >
                          <span className={styles.adminBtnLabel}>{adminPageLabel}</span>
                        </Button>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger>
                            <IconButton
                              size="1"
                              variant="soft"
                              title="Настройки главной страницы админки"
                              style={{ flexShrink: 0 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GearIcon width={16} height={16} style={{ color: 'var(--gray-12)' }} />
                            </IconButton>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content align="end" style={{ minWidth: 220 }}>
                            <DropdownMenu.Item
                              key="admin-open-page"
                              onSelect={() => setAdminHomeHrefAndSave(pathname || '/admin')}
                            >
                              Текущая страница
                            </DropdownMenu.Item>
                            {adminMainPagesByBlock.map((block) => {
                              const firstHref = block.items[0]?.href
                              if (!firstHref) return null
                              return (
                                <DropdownMenu.Item
                                  key={block.blockLabel}
                                  onSelect={() => setAdminHomeHrefAndSave(firstHref)}
                                >
                                  {block.blockLabel}
                                </DropdownMenu.Item>
                              )
                            })}
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </div>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="top"
                        sideOffset={8}
                        style={{
                          backgroundColor: 'var(--gray-2)',
                          border: '1px solid var(--gray-6)',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          lineHeight: 1.4,
                          color: 'var(--gray-12)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          zIndex: 1100,
                        }}
                      >
                        {adminPageLabel}
                        <Tooltip.Arrow style={{ fill: 'var(--gray-2)', stroke: 'var(--gray-6)' }} />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </Flex>
            )
          }

          return (
            <MenuItemComponent
              key={item.id}
              item={item}
              isActive={isActive} // Передаем флаг активности для подсветки
              onNavigate={onClose} // Обработчик закрытия меню на мобильных при навигации
              pathname={pathname}
              inDevelopment={IN_DEVELOPMENT_IDS.has(item.id)} // Проверяем, в разработке ли пункт
              onInDevelopmentClick={undefined} // Обработчик для пунктов "в разработке"
            />
          )
        })}
      </Flex>
    </Box>
  )
}
