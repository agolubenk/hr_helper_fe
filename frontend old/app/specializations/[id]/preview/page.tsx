/**
 * SpecializationPreviewPage (specializations/[id]/preview/page.tsx) — Превью специализации
 *
 * Назначение:
 * - Отображение того, «как видят другие» выбранную специализацию: название, описание, tech stack, грейды
 * - История изменений и кнопка экспорта в PDF для онбординга
 *
 * Связи: useSpecializations (selectedNode, historyBySpecId). Бейджи с числом сотрудников/вакансий не отображаются.
 */

'use client'

import { Box, Flex, Text, Button } from '@radix-ui/themes'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import { useSpecializations } from '../../context/SpecializationsContext'
import styles from '../../specializations.module.css'

/** Рендерит превью выбранной специализации или сообщение «Выберите специализацию». */
export default function SpecializationPreviewPage() {
  const { selectedNode, historyBySpecId } = useSpecializations()

  if (!selectedNode) {
    return (
      <Box className={styles.noSelection}>
        <Text size="2" color="gray">Выберите специализацию в левой панели.</Text>
      </Box>
    )
  }

  const history = historyBySpecId[selectedNode.id] ?? []

  return (
    <Box>
      <Flex align="center" gap="2" mb="4">
        <EyeOpenIcon width={20} height={20} />
        <Text size="4" weight="bold">Как видят другие</Text>
      </Flex>

      <Box className={styles.previewSection}>
        <div className={styles.previewSectionTitle}>Название</div>
        <Text size="2">{selectedNode.name}</Text>
      </Box>
      <Box className={styles.previewSection}>
        <div className={styles.previewSectionTitle}>Описание</div>
        <Text size="2" color="gray">
          {selectedNode.description || '—'}
        </Text>
      </Box>
      <Box className={styles.previewSection}>
        <div className={styles.previewSectionTitle}>Tech Stack</div>
        <Text size="2">
          {selectedNode.techStack?.map((t) => t.name).join(', ') || '—'}
        </Text>
      </Box>
      <Box className={styles.previewSection}>
        <div className={styles.previewSectionTitle}>Грейды</div>
        <Text size="2">Junior → Middle → Senior</Text>
      </Box>
      <Button variant="soft" size="2" mt="4">
        Экспорт в PDF для онбординга
      </Button>

      <Box className={styles.previewSection} style={{ marginTop: 24 }}>
        <div className={styles.previewSectionTitle}>История изменений</div>
        <ul className={styles.historyList}>
          {history.map((h) => (
            <li key={h.id} className={styles.historyItem}>
              {h.date} — {h.user}: {h.change}
            </li>
          ))}
        </ul>
      </Box>
    </Box>
  )
}
