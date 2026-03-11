'use client'

import { Box, Text, Button } from '@radix-ui/themes'
import { EyeOpenIcon } from '@radix-ui/react-icons'
import { useSpecializations } from '../context/SpecializationsContext'
import styles from '../specializations.module.css'

export default function PreviewSidebar() {
  const { selectedNode, historyBySpecId } = useSpecializations()

  if (!selectedNode) {
    return (
      <Box className={styles.previewPanel}>
        <Box className={styles.previewHeader}>
          <EyeOpenIcon width={16} height={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Preview
        </Box>
        <Box className={styles.previewBody}>
          <Text size="2" color="gray">
            Выберите специализацию для превью
          </Text>
        </Box>
      </Box>
    )
  }

  const history = historyBySpecId[selectedNode.id] ?? []

  return (
    <Box className={styles.previewPanel}>
      <Box className={styles.previewHeader}>
        <EyeOpenIcon width={16} height={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
        Как видят другие
      </Box>
      <Box className={styles.previewBody}>
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
        <Button variant="soft" size="1" mt="3" style={{ width: '100%' }}>
          Экспорт в PDF для онбординга
        </Button>

        <Box className={styles.previewSection} style={{ marginTop: 20 }}>
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
    </Box>
  )
}
