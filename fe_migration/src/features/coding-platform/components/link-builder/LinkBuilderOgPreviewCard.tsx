import { Box, Text, Heading } from '@radix-ui/themes'
import styles from './LinkBuilderOgPreviewCard.module.css'

interface LinkBuilderOgPreviewCardProps {
  title: string
  description: string
  imageUrl: string
  fallbackHost: string
}

export function LinkBuilderOgPreviewCard({ title, description, imageUrl, fallbackHost }: LinkBuilderOgPreviewCardProps) {
  const safeTitle = title.trim() || 'Заголовок ссылки'
  const safeDesc = description.trim() || 'Краткое описание появится здесь после заполнения полей справа.'
  const showImg = imageUrl.trim().length > 0

  return (
    <Box className={styles.card} p="3">
      <Text size="1" color="gray" mb="2" weight="medium">
        Предпросмотр карточки
      </Text>
      <div className={styles.preview}>
        {showImg ? (
          <img src={imageUrl.trim()} alt={safeTitle} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden />
        )}
        <div className={styles.body}>
          <Heading as="h3" size="3" className={styles.previewTitle}>
            {safeTitle}
          </Heading>
          <Text size="2" color="gray" className={styles.previewDesc}>
            {safeDesc}
          </Text>
          <Text size="1" color="gray" mt="1">
            {fallbackHost}
          </Text>
        </div>
      </div>
    </Box>
  )
}
