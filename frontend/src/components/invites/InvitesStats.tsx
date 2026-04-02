/**
 * InvitesStats (components/invites/InvitesStats.tsx) - Компонент статистики по инвайтам
 * 
 * Назначение:
 * - Отображение статистики по инвайтам на интервью
 * - Визуализация количества инвайтов по статусам
 * 
 * Функциональность:
 * - Всего инвайтов: общее количество всех инвайтов
 * - Ожидают: количество инвайтов со статусом "pending" (ожидают отправки)
 * - Отправлены: количество инвайтов со статусом "sent" (отправлены кандидату)
 * - Завершены: количество инвайтов со статусом "completed" (интервью завершено)
 * 
 * Связи:
 * - invites/page.tsx: отображается на странице управления инвайтами
 * - Использует данные из API или моковых данных
 * 
 * Поведение:
 * - Отображает 4 карточки со статистикой
 * - Каждая карточка имеет цветовую индикацию (границы сверху и снизу)
 * - Иконки для визуального различия статусов
 * 
 * Дизайн:
 * - Карточки с цветными границами для визуального различия
 * - Иконки для каждого типа статистики
 * - Крупный шрифт для чисел
 */
'use client'

import { Box, Flex, Text } from "@radix-ui/themes"
import { CalendarIcon, ClockIcon, PaperPlaneIcon, CheckCircledIcon } from "@radix-ui/react-icons"
import styles from './InvitesStats.module.css'

/**
 * InvitesStatsProps - интерфейс пропсов компонента InvitesStats
 * 
 * Структура:
 * - total: общее количество инвайтов
 * - pending: количество инвайтов со статусом "pending" (ожидают)
 * - sent: количество инвайтов со статусом "sent" (отправлены)
 * - completed: количество инвайтов со статусом "completed" (завершены)
 */
interface InvitesStatsProps {
  total: number
  pending: number
  sent: number
  completed: number
}

/**
 * InvitesStats - компонент статистики по инвайтам
 * 
 * Функциональность:
 * - Отображает 4 карточки со статистикой по инвайтам
 * - Каждая карточка имеет уникальную цветовую схему
 * - Иконки для визуального различия статусов
 */
export default function InvitesStats({ total, pending, sent, completed }: InvitesStatsProps) {
  return (
    <Flex gap="3" className={styles.statsContainer}>
      {/* Карточка "Всего инвайтов"
          - Отображает общее количество всех инвайтов
          - Цветовая схема: синий сверху, зеленый снизу
          - Иконка: CalendarIcon */}
      <Box className={styles.statCard} data-border="total">
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between">
            <Text size="1" weight="medium" className={styles.statLabel}>
              ВСЕГО ИНВАЙТОВ
            </Text>
            <CalendarIcon width={20} height={20} className={styles.statIcon} />
          </Flex>
          <Text size="6" weight="bold" className={styles.statValue}>
            {total}
          </Text>
        </Flex>
      </Box>

      <Box className={styles.statCard} data-border="pending">
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between">
            <Text size="1" weight="medium" className={styles.statLabelPending}>
              ОЖИДАЮТ
            </Text>
            <ClockIcon width={20} height={20} className={styles.statIcon} />
          </Flex>
          <Text size="6" weight="bold" className={styles.statValue}>
            {pending}
          </Text>
        </Flex>
      </Box>

      <Box className={styles.statCard} data-border="sent">
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between">
            <Text size="1" weight="medium" className={styles.statLabel}>
              ОТПРАВЛЕНЫ
            </Text>
            <PaperPlaneIcon width={20} height={20} className={styles.statIcon} />
          </Flex>
          <Text size="6" weight="bold" className={styles.statValue}>
            {sent}
          </Text>
        </Flex>
      </Box>

      <Box className={styles.statCard} data-border="completed">
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between">
            <Text size="1" weight="medium" className={styles.statLabelCompleted}>
              ЗАВЕРШЕНЫ
            </Text>
            <CheckCircledIcon width={20} height={20} className={styles.statIcon} />
          </Flex>
          <Text size="6" weight="bold" className={styles.statValue}>
            {completed}
          </Text>
        </Flex>
      </Box>
    </Flex>
  )
}
