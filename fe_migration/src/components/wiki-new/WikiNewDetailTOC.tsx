import { Box, Text, Flex } from '@radix-ui/themes'
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import styles from './WikiNewDetailTOC.module.css'

interface Section {
  title: string
  level?: number
}

interface WikiNewDetailTOCProps {
  sections: Section[]
  className?: string
}

function getSectionId(title: string, index: number): string {
  if (!title.trim()) return `section-${index}`
  return `section-${title.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '')}`
}

export function WikiNewDetailTOC({ sections, className }: WikiNewDetailTOCProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSectionClick = (section: Section, index: number) => {
    const id = getSectionId(section.title, index)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileOpen(false)
  }

  const content = (
    <>
      <Text size="3" weight="bold" className={styles.sidebarTitle}>
        Содержание
      </Text>
      <Flex direction="column" gap="1" mt="3" className={styles.contentList}>
        {sections.map((section, index) => (
          <Flex
            key={index}
            align="center"
            gap="2"
            className={styles.contentItem}
            style={{ cursor: 'pointer', paddingLeft: (section.level ?? 0) * 12 }}
            onClick={() => handleSectionClick(section, index)}
          >
            <Text size="2" style={{ flex: 1, color: 'var(--gray-11)' }}>
              {section.title || `Раздел ${index + 1}`}
            </Text>
            <ChevronRightIcon width={14} height={14} style={{ color: 'var(--gray-9)', opacity: 0.7 }} />
          </Flex>
        ))}
      </Flex>
    </>
  )

  return (
    <>
      <Box className={`${styles.tocDesktop} ${className ?? ''}`}>{content}</Box>
      <Box className={styles.tocMobileWrap}>
        <button type="button" className={styles.tocMobileTrigger} onClick={() => setMobileOpen(!mobileOpen)}>
          <Text size="3" weight="bold">
            Содержание
          </Text>
          {mobileOpen ? <ChevronDownIcon width={16} height={16} /> : <ChevronRightIcon width={16} height={16} />}
        </button>
        {mobileOpen && <Box className={styles.tocMobileContent}>{content}</Box>}
      </Box>
    </>
  )
}
