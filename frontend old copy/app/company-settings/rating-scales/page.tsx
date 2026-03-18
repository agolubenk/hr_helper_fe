/**
 * RatingScalesSettingsPage (company-settings/rating-scales/page.tsx) — Страница настроек шкал оценок
 *
 * Назначение:
 * - Управление шкалами оценок для интервью и матрицы компетенций
 * - Шкала по умолчанию используется при создании оценки кандидата (страница assessment/new)
 *
 * Функциональность:
 * - RatingScalesSettings: список шкал, создание/редактирование/удаление, выбор шкалы по умолчанию
 * - Каждая шкала: название + пункты (значение и подпись, например 1–5 или «Сдал»/«Не сдал»)
 *
 * Связи:
 * - Sidebar: «Настройки компании» → «Шкалы оценок» и «Настройки рекрутинга» → «Шкалы оценок»
 * - Матрица специализации: в начале каждого таба выбирается система оценки из этих шкал
 * - Страница создания/редактирования оценки: варианты оценок подтягиваются из шкалы, выбранной в матрице по вакансии
 *
 * Поведение:
 * - При загрузке отображается список шкал (мок: «1–5 баллов», «Сдал / Не сдал», «Четыре уровня»)
 * - Редактирование и добавление шкал через модальное окно
 */

'use client'

import AppLayout from '@/components/AppLayout'
import { Box, Text } from '@radix-ui/themes'
import RatingScalesSettings from '@/components/company-settings/RatingScalesSettings'
import styles from '../company-settings.module.css'

/**
 * RatingScalesSettingsPage — компонент страницы настроек шкал оценок.
 * Рендерит заголовок и компонент RatingScalesSettings.
 */
export default function RatingScalesSettingsPage() {
  return (
    <AppLayout pageTitle="Шкалы оценок">
      <Box className={styles.container}>
        <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
          Шкалы оценок
        </Text>
        <RatingScalesSettings />
      </Box>
    </AppLayout>
  )
}
