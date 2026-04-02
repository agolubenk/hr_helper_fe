import { Box, Text } from '@radix-ui/themes'
import type { ContentSection } from './types'
import styles from './WikiNewDetailContent.module.css'

export function getSectionId(title: string, index: number): string {
  if (!title.trim()) return `section-${index}`
  return `section-${title.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '')}`
}

interface WikiNewDetailContentProps {
  heading: string
  sections: ContentSection[]
}

export function WikiNewDetailContent({ heading, sections }: WikiNewDetailContentProps) {
  return (
    <Box className={styles.content}>
      <Text size="6" weight="bold" className={styles.mainHeading}>
        {heading}
      </Text>
      {sections.map((section, index) => {
        const id = getSectionId(section.title, index)
        return (
          <Box key={index} id={id} className={styles.section}>
            {section.title ? (
              <Text size="4" weight="bold" className={styles.sectionTitle}>
                {section.title}
              </Text>
            ) : null}
            {section.content ? (
              <Text size="3" className={styles.sectionContent}>
                {section.content}
              </Text>
            ) : null}
            {section.items?.length ? (
              <ul className={styles.itemsList}>
                {section.items.map((item, i) => (
                  <li key={i} className={styles.listItem}>
                    <Text size="3">{item}</Text>
                  </li>
                ))}
              </ul>
            ) : null}
          </Box>
        )
      })}
    </Box>
  )
}
