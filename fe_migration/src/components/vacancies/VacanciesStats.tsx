/**
 * VacanciesStats (components/vacancies/VacanciesStats.tsx) - Компонент статистики по вакансиям
 * 
 * Назначение:
 * - Отображение статистики по вакансиям
 * - Визуализация количества вакансий по статусам
 * 
 * Функциональность:
 * - Всего вакансий: общее количество всех вакансий
 * - Активных: количество активных вакансий (status === 'active')
 * - Неактивных: количество неактивных вакансий (status === 'inactive')
 * 
 * Связи:
 * - vacancies/page.tsx: отображается на странице управления вакансиями
 * - Использует данные из API или моковых данных
 * 
 * Поведение:
 * - Отображает 3 карточки со статистикой
 * - Каждая карточка содержит число и иконку
 * - data-tour атрибут для тура по приложению
 * 
 * Дизайн:
 * - Простые карточки с текстом и иконками
 * - Зеленая иконка для активных вакансий
 */
'use client'

import { Box, Flex, Text } from "@radix-ui/themes"
import { 
  FileTextIcon, 
  CheckIcon, 
  StopwatchIcon 
} from "@radix-ui/react-icons"
import styles from './VacanciesStats.module.css'

/**
 * VacanciesStatsProps - интерфейс пропсов компонента VacanciesStats
 * 
 * Структура:
 * - total: общее количество вакансий
 * - active: количество активных вакансий
 * - inactive: количество неактивных вакансий
 */
type VacancyStatusFilter = 'all' | 'active' | 'inactive'

interface VacanciesStatsProps {
  total: number
  active: number
  inactive: number
  /** Текущий фильтр по статусу (синхронно с фильтром страницы) */
  selectedStatus: VacancyStatusFilter
  /** Клик по карточке задаёт фильтр списка */
  onStatusCardClick: (status: VacancyStatusFilter) => void
}

/**
 * VacanciesStats - компонент статистики по вакансиям
 * 
 * Функциональность:
 * - Отображает 3 карточки со статистикой по вакансиям
 * - Каждая карточка содержит число и иконку
 */
export default function VacanciesStats({
  total,
  active,
  inactive,
  selectedStatus,
  onStatusCardClick,
}: VacanciesStatsProps) {
  return (
    <Flex data-tour="vacancies-stats" gap="3" className={styles.statsContainer}>
      <Box
        role="button"
        tabIndex={0}
        className={`${styles.statCard} ${selectedStatus === 'all' ? styles.statCardActive : ''}`}
        onClick={() => onStatusCardClick('all')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onStatusCardClick('all')
          }
        }}
      >
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{total} Всего вакансий</Text>
          <FileTextIcon width={20} height={20} />
        </Flex>
      </Box>

      <Box
        role="button"
        tabIndex={0}
        className={`${styles.statCard} ${selectedStatus === 'active' ? styles.statCardActive : ''}`}
        onClick={() => onStatusCardClick('active')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onStatusCardClick('active')
          }
        }}
      >
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{active} Активных</Text>
          <CheckIcon width={20} height={20} style={{ color: '#10b981' }} />
        </Flex>
      </Box>

      <Box
        role="button"
        tabIndex={0}
        className={`${styles.statCard} ${selectedStatus === 'inactive' ? styles.statCardActive : ''}`}
        onClick={() => onStatusCardClick('inactive')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onStatusCardClick('inactive')
          }
        }}
      >
        <Flex align="center" justify="between">
          <Text size="3" weight="bold">{inactive} Неактивных</Text>
          <StopwatchIcon width={20} height={20} />
        </Flex>
      </Box>
    </Flex>
  )
}
