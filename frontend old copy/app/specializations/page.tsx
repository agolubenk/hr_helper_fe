/**
 * SpecializationsRootPage (specializations/page.tsx) — Корневая страница раздела «Специализации»
 *
 * Назначение:
 * - Точка входа в раздел специализаций
 * - Перенаправление на первую специализацию (вклад «Основная информация») при наличии дерева
 *
 * Функциональность:
 * - Если в дереве есть узлы: редирект на /specializations/[firstNodeId]/info
 * - Если дерево пустое: сообщение «Нет специализаций», призыв добавить через левую панель
 *
 * Связи:
 * - useSpecializations: firstNodeId, tree
 * - layout раздела: сайдбары (дерево, превью) и навигация по вкладкам
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Text } from '@radix-ui/themes'
import { useSpecializations } from './context/SpecializationsContext'
import styles from './specializations.module.css'

/**
 * SpecializationsRootPage — при наличии дерева редиректит на первую специализацию, иначе показывает приглашение создать.
 */
export default function SpecializationsRootPage() {
  const router = useRouter()
  const { firstNodeId, tree } = useSpecializations()

  useEffect(() => {
    if (firstNodeId) {
      router.replace(`/specializations/${firstNodeId}/info`)
    }
  }, [firstNodeId, router])

  if (tree.length === 0) {
    return (
      <Box className={styles.noSelection}>
        <Text size="2" color="gray">
          Нет специализаций. Добавьте первую через кнопку «Добавить специализацию» в левой панели.
        </Text>
      </Box>
    )
  }

  return (
    <Box className={styles.noSelection}>
      <Text size="2" color="gray">
        Перенаправление к первой специализации…
      </Text>
    </Box>
  )
}
