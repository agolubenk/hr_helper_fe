import { useState, useMemo } from 'react'
import { Flex, Text, Card, Box, Button } from '@radix-ui/themes'
import { Link, useNavigate } from '@tanstack/react-router'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { RocketIcon } from '@radix-ui/react-icons'
import { HOME_PAGE_BLOCKS, MODULE_FILTER_OPTIONS } from '@/shared/config/menuConfig'
import styles from './home.module.css'
import './tour-overrides.css'

const NAV_DELAY_MS = 900
const TOUR_STORAGE_KEY_STEP = 'hrhelper-tour-last-step'
const TOUR_STORAGE_KEY_URL = 'hrhelper-tour-last-url'

/** Список модулей для фильтра: Все, Рекрутинг, Сотрудники, Онбординг, L&D, C&B, HROps, HR PR */
const MODULE_OPTIONS = MODULE_FILTER_OPTIONS

export function HomePage() {
  const navigate = useNavigate()
  const [selectedModule, setSelectedModule] = useState<string>('Все')

  const filteredBlocks = useMemo(
    () =>
      selectedModule === 'Все'
        ? HOME_PAGE_BLOCKS
        : HOME_PAGE_BLOCKS.filter((b) => b.filterModule === selectedModule),
    [selectedModule]
  )

  const handleWelcomeTour = () => {
    const steps = [
      { element: "[data-tour='header-menu']", popover: { title: 'Меню', description: 'Иконка ⚡ открывает боковое меню со всеми разделами: Чат, Вакансии, Заявки, Настройки, Отчётность и др. На мобильных меню разворачивается поверх экрана.' } },
      { element: "[data-tour='header-theme']", popover: { title: 'Смена темы', description: 'Переключатель светлой и тёмной темы. Подстраивайте интерфейс под освещение и привычки.' } },
      { element: "[data-tour='header-profile']", popover: { title: 'Профиль', description: 'Профиль пользователя, настройки аккаунта, интеграции и быстрые действия. Здесь же — доступ к смене акцентного цвета.' } },
      { element: "[data-tour='header-logout']", popover: { title: 'Выход', description: 'Выход из учётной записи. Сессия завершается, для входа потребуется авторизация снова.' } },
      { element: "[data-tour='blocks-wrap']", popover: { title: 'Разделы приложения', description: 'Карточки быстрого перехода в основные разделы. Нажмите на карточку — откроется нужная страница.' } },
      ...HOME_PAGE_BLOCKS.map((b) => ({
        element: `[data-tour='block-${b.id}']`,
        popover: { title: b.label, description: `Переход в раздел «${b.label}».` } as const,
      })),
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
          navigate({ to: savedUrl! })
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
    <Flex direction="column" gap="5" align="stretch">
      <Box className={styles.stickyBar}>
        <Box data-tour="welcome-title">
          <Text size="6" weight="bold">
            Добро пожаловать в HR Helper
          </Text>
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
      </Box>

      <Flex data-tour="blocks-wrap" gap="4" wrap="wrap" justify="center" className={styles.blocksWrap}>
        {filteredBlocks.map((b) => (
          <Link
            key={b.id}
            to={b.href}
            className={styles.blockCardLink}
            data-tour={`block-${b.id}`}
          >
            <Card size="2" className={styles.blockCard} style={{ width: 'max-content' }}>
              <Flex direction="column" gap="2" align="center">
                <Box style={{ color: 'var(--accent-9)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, transform: 'scale(1.75)' }}>
                  {b.icon ?? null}
                </Box>
                <Text size="3" weight="medium" style={{ whiteSpace: 'nowrap' }}>
                  {b.label}
                </Text>
              </Flex>
            </Card>
          </Link>
        ))}
      </Flex>
    </Flex>
  )
}
