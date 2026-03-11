'use client'

import { useEffect } from 'react'
import { Box, Text } from '@radix-ui/themes'
import { useNavigate } from '@tanstack/react-router'
import { useSpecializations } from '../context/SpecializationsContext'
import styles from '../SpecializationsLayout.module.css'

export function SpecializationsRootPage() {
  const navigate = useNavigate()
  const { firstNodeId, tree } = useSpecializations()

  useEffect(() => {
    if (!firstNodeId) return
    navigate({ to: '/specializations/$id/info', params: { id: firstNodeId }, replace: true })
  }, [firstNodeId, navigate])

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

