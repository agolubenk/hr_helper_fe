import { useEffect } from 'react'
import { Box, Text } from '@radix-ui/themes'
import { useRouter } from '@/router-adapter'
import { useSpecializations } from '@/app/specializations/context/SpecializationsContext'
import styles from '@/app/pages/styles/SpecializationsPage.module.css'

export function SpecializationsRootPage() {
  const router = useRouter()
  const { firstNodeId, tree } = useSpecializations()

  useEffect(() => {
    if (firstNodeId) router.replace(`/specializations/${firstNodeId}/info`)
  }, [firstNodeId, router])

  if (tree.length === 0) {
    return <Box className={styles.noSelection}><Text size="2" color="gray">Нет специализаций. Добавьте первую в левой панели.</Text></Box>
  }
  return <Box className={styles.noSelection}><Text size="2" color="gray">Перенаправление...</Text></Box>
}
