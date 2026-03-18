/**
 * HomePage — главная страница (миграция с Next: app/page.tsx).
 * Стек: Vite + React Router. Логика и разметка без изменений.
 */

import { useState, useMemo } from 'react'
import { Flex, Text, Card, Box, Button } from '@radix-ui/themes'
import { Link, useRouter } from '@/router-adapter'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import '@/app/tour-overrides.css'
import styles from '@/app/page.module.css'
import {
  ChatBubbleIcon,
  MixerHorizontalIcon,
  ListBulletIcon,
  ClipboardIcon,
  StarIcon,
  BarChartIcon,
  PersonIcon,
  LightningBoltIcon,
  FileTextIcon,
  DashboardIcon,
  GearIcon,
  RocketIcon,
} from '@radix-ui/react-icons'

const MODULES = ['Главное', 'Рекрутинг', 'Финансы', 'Интеграции', 'Контент и отчётность', 'Настройки'] as const

const BLOCKS = [
  { id: 'chat', label: 'Чат', href: '/workflow', icon: ChatBubbleIcon, module: 'Главное' },
  { id: 'recruiting', label: 'Рекрутинг', href: '/workflow', icon: MixerHorizontalIcon, module: 'Рекрутинг' },
  { id: 'vacancies', label: 'Вакансии', href: '/vacancies', icon: ListBulletIcon, module: 'Рекрутинг' },
  { id: 'hiring-requests', label: 'Заявки на подбор', href: '/hiring-requests', icon: ClipboardIcon, module: 'Рекрутинг' },
  { id: 'salary', label: 'ЗП вилки', href: '/vacancies/salary-ranges', icon: StarIcon, module: 'Финансы' },
  { id: 'benchmarks', label: 'Бенчмарки', href: '/finance/benchmarks', icon: BarChartIcon, module: 'Финансы' },
  { id: 'interviewers', label: 'Интервьюеры', href: '/interviewers', icon: PersonIcon, module: 'Рекрутинг' },
  { id: 'aichat', label: 'ИИ чат', href: '/aichat', icon: LightningBoltIcon, module: 'Интеграции' },
  { id: 'wiki', label: 'Вики', href: '/wiki', icon: FileTextIcon, module: 'Контент и отчётность' },
  { id: 'reporting', label: 'Отчетность', href: '/reporting', icon: DashboardIcon, module: 'Контент и отчётность' },
  { id: 'settings', label: 'Настройки', href: '/company-settings', icon: GearIcon, module: 'Настройки' },
] as const

const NAV_DELAY_MS = 900
const TOUR_STORAGE_KEY_STEP = 'hrhelper-tour-last-step'
const TOUR_STORAGE_KEY_URL = 'hrhelper-tour-last-url'

const MODULE_OPTIONS = ['Все', ...MODULES]

export function HomePage() {
  const router = useRouter()
  const [selectedModule, setSelectedModule] = useState<string>('Все')

  const filteredBlocks = useMemo(
    () =>
      selectedModule === 'Все'
        ? BLOCKS
        : BLOCKS.filter((b) => b.module === selectedModule),
    [selectedModule]
  )

  const handleWelcomeTour = () => {
    const steps = [
      { element: "[data-tour='header-menu']", popover: { title: 'Меню', description: 'Иконка ⚡ открывает боковое меню со всеми разделами: Чат, Вакансии, Заявки, Настройки, Отчётность и др. На мобильных меню разворачивается поверх экрана.' } },
      { element: "[data-tour='header-theme']", popover: { title: 'Смена темы', description: 'Переключатель светлой и тёмной темы. Подстраивайте интерфейс под освещение и привычки.' } },
      { element: "[data-tour='header-profile']", popover: { title: 'Профиль', description: 'Профиль пользователя, настройки аккаунта, интеграции и быстрые действия. Здесь же — доступ к смене акцентного цвета.' } },
      { element: "[data-tour='header-logout']", popover: { title: 'Выход', description: 'Выход из учётной записи. Сессия завершается, для входа потребуется авторизация снова.' } },
      { element: "[data-tour='blocks-wrap']", popover: { title: 'Разделы приложения', description: 'Карточки быстрого перехода в основные разделы. Нажмите на карточку — откроется нужная страница. Ниже пройдём по Чату, Настройкам и Вакансиям подробнее.' } },
      { element: "[data-tour='block-chat']", popover: { title: 'Чат (Workflow)', description: 'Основной workflow: подбор, назначение встреч, внесение данных по кандидатам. Нажмите «Далее» — откроем страницу Чат и покажем все элементы по шагам.', onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => { router.push('/workflow'); setTimeout(() => d.moveNext(), NAV_DELAY_MS); } } },
      { element: "[data-tour='workflow-page']", popover: { title: 'Страница Чат (Workflow)', description: 'Центр подбора: автоматическое назначение встреч и обработка данных по кандидатам.', onPrevClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { movePrevious: () => void } }) => { router.push('/'); setTimeout(() => d.movePrevious(), NAV_DELAY_MS); } } },
      { element: "[data-tour='block-settings']", popover: { title: 'Настройки', description: 'Настройки компании и рекрутинга.', onNextClick: (_el: Element | undefined, _step: unknown, { driver: d }: { driver: { moveNext: () => void } }) => { router.push('/company-settings'); setTimeout(() => d.moveNext(), NAV_DELAY_MS); } } },
      { popover: { title: 'Тур завершён', description: 'Вы познакомились с разделами HR Helper. Меню, профиль и карточки на главной помогут быстро перейти в нужный раздел.' } },
    ]

    const driverObj = driver({
      showProgress: true,
      progressText: 'Шаг {{current}} из {{total}}',
      nextBtnText: 'Далее',
      prevBtnText: 'Назад',
      doneBtnText: 'Готово',
      overlayOpacity: 0.82,
      overlayColor: '#000',
      stagePadding: 14,
      stageRadius: 10,
      popoverClass: 'hrhelper-tour-popover',
      popoverOffset: 14,
      smoothScroll: true,
      steps,
      onPopoverRender: (popover, opts) => {
        const cur = (opts?.driver?.getActiveIndex?.() ?? 0) + 1
        const total = opts?.config?.steps?.length ?? 1
        const pct = Math.min(100, Math.round((cur / total) * 100))
        let bar = popover?.wrapper?.querySelector?.('.hrhelper-tour-progress-bar')
        if (!bar) {
          bar = document.createElement('div')
          bar.className = 'hrhelper-tour-progress-bar'
          popover?.wrapper?.insertBefore?.(bar, popover.wrapper.firstChild)
        }
        if (bar) (bar as HTMLElement).style.width = `${pct}%`
      },
      onHighlighted: (_el, _step, opts) => {
        const idx = opts?.driver?.getActiveIndex?.() ?? opts?.state?.activeIndex
        if (typeof idx !== 'number' || idx < 0) return
        const len = opts?.config?.steps?.length
        if (typeof len !== 'number' || idx >= len) return
        localStorage.setItem(TOUR_STORAGE_KEY_STEP, String(idx))
        localStorage.setItem(TOUR_STORAGE_KEY_URL, typeof window !== 'undefined' ? window.location.pathname : '/')
      },
      onDestroyed: (_el, step, opts) => {
        const arr = opts?.config?.steps ?? []
        const i = arr.findIndex((s) => s === step)
        if (i === arr.length - 1 && arr.length > 0) {
          localStorage.setItem(TOUR_STORAGE_KEY_STEP, String(arr.length - 1))
          localStorage.setItem(TOUR_STORAGE_KEY_URL, typeof window !== 'undefined' ? window.location.pathname : '/')
        }
      },
    })

    const savedStep = typeof window !== 'undefined' ? localStorage.getItem(TOUR_STORAGE_KEY_STEP) : null
    const savedUrl = typeof window !== 'undefined' ? localStorage.getItem(TOUR_STORAGE_KEY_URL) : null
    const stepIndex = savedStep ? parseInt(savedStep, 10) : -1
    const hasValidResume = stepIndex > 0 && savedUrl && !isNaN(stepIndex) && stepIndex < steps.length

    if ((savedStep != null || savedUrl != null) && !hasValidResume) {
      localStorage.removeItem(TOUR_STORAGE_KEY_STEP)
      localStorage.removeItem(TOUR_STORAGE_KEY_URL)
    }

    if (hasValidResume) {
      const isCompleted = stepIndex === steps.length - 1
      const msg = isCompleted
        ? 'Тур уже пройден. Показать итоговый экран или пройти с начала?\n\n«OK» — итог\n«Отмена» — с начала'
        : `Тур был прерван. Вернуться к последнему достигнутому шагу (шаг ${stepIndex + 1} из ${steps.length})?\n\n«OK» — продолжить с этого места\n«Отмена» — начать тур сначала`
      const resume = window.confirm(msg)
      if (resume) {
        if (typeof window !== 'undefined' && window.location.pathname !== savedUrl) {
          router.push(savedUrl ?? '/')
          setTimeout(() => driverObj.drive(stepIndex), NAV_DELAY_MS)
        } else {
          driverObj.drive(stepIndex)
        }
        return
      }
      localStorage.removeItem(TOUR_STORAGE_KEY_STEP)
      localStorage.removeItem(TOUR_STORAGE_KEY_URL)
    }
    driverObj.drive(0)
  }

  return (
    <Flex direction="column" gap="5" align="center">
      <Box data-tour="welcome-title">
        <Text size="6" weight="bold">Добро пожаловать в HR Helper</Text>
      </Box>

      <Button
        data-tour="welcome-tour-btn"
        size="3"
        variant="soft"
        onClick={handleWelcomeTour}
        className={styles.welcomeTourBtn}
      >
        <RocketIcon width={18} height={18} />
        Приветственный тур
      </Button>

      <div className={styles.stickyFilterBar}>
        <Box className={styles.moduleFilterWrap}>
          <Flex gap="2" wrap="nowrap" justify="start" align="center" className={styles.moduleFilter}>
            {MODULE_OPTIONS.map((mod) => (
              <button
                key={mod}
                type="button"
                onClick={() => setSelectedModule(mod)}
                className={selectedModule === mod ? styles.moduleChipActive : styles.moduleChip}
              >
                {mod}
              </button>
            ))}
          </Flex>
        </Box>
      </div>

      <Flex data-tour="blocks-wrap" gap="4" wrap="wrap" justify="center" className={styles.blocksWrap}>
        {filteredBlocks.map((b) => {
          const Icon = b.icon
          return (
            <Link key={b.id} href={b.href} className={styles.blockCardLink} data-tour={`block-${b.id}`}>
              <Card size="2" className={styles.blockCard} style={{ width: 'max-content' }}>
                <Flex direction="column" gap="2" align="center">
                  <Box style={{ color: 'var(--accent-9)' }}>
                    <Icon width={28} height={28} />
                  </Box>
                  <Text size="3" weight="medium" style={{ whiteSpace: 'nowrap' }}>{b.label}</Text>
                </Flex>
              </Card>
            </Link>
          )
        })}
      </Flex>
    </Flex>
  )
}
