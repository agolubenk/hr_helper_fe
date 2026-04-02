'use client'

import { Box, Text, Flex } from "@radix-ui/themes"
import { useMemo } from "react"
import styles from './WikiDetailContent.module.css'
import { diffLines } from "@/lib/lineDiff"

interface ContentSection {
  title: string
  content?: string
  items?: string[]
  subsections?: Array<{ title: string; items: string[] }>
}

interface WikiDetailContentProps {
  content: {
    heading: string
    sections: ContentSection[]
  }
  diff?: {
    enabled: boolean
    /** С чем сравниваем (обычно latest), чтобы показать изменения */
    compareTo: {
      heading: string
      sections: ContentSection[]
    }
  }
}

function joinLines(lines: string[] | undefined): string {
  return (lines ?? []).join('\n')
}

function findSectionByTitle(sections: ContentSection[], title: string): ContentSection | null {
  return sections.find((s) => s.title === title) ?? null
}

export default function WikiDetailContent({ content, diff }: WikiDetailContentProps) {
  const diffEnabled = diff?.enabled === true

  const compareSections = diff?.compareTo.sections ?? []
  const compareHeading = diff?.compareTo.heading ?? ''

  const headingTokens = useMemo(() => {
    if (!diffEnabled) return null
    return diffLines(content.heading, compareHeading)
  }, [compareHeading, content.heading, diffEnabled])

  const renderDiffTokens = (tokens: ReturnType<typeof diffLines>) => {
    return (
      <>
        {tokens.map((t, idx) => {
          if (t.op === 'equal') {
            return (
              <span key={idx} className={styles.diffLine}>
                {t.text}
              </span>
            )
          }
          if (t.op === 'add') {
            return (
              <span key={idx} className={`${styles.diffLine} ${styles.diffAdded}`}>
                {t.text}
              </span>
            )
          }
          return (
            <span key={idx} className={`${styles.diffLine} ${styles.diffRemoved}`}>
              {t.text}
            </span>
          )
        })}
      </>
    )
  }

  return (
    <Box className={styles.content}>
      <Text size="6" weight="bold" className={styles.mainHeading}>
        {diffEnabled && headingTokens ? renderDiffTokens(headingTokens) : content.heading}
      </Text>
      
      {content.sections.map((section, index) => {
        const sectionId = section.title 
          ? `section-${section.title.replace(/\s+/g, '-').toLowerCase()}` 
          : `section-${index}`

        const compareSection = diffEnabled ? findSectionByTitle(compareSections, section.title) : null
        const sectionContentTokens =
          diffEnabled && (section.content || compareSection?.content)
            ? diffLines(section.content ?? '', compareSection?.content ?? '')
            : null
        const sectionItemsTokens =
          diffEnabled && (section.items || compareSection?.items)
            ? diffLines(joinLines(section.items), joinLines(compareSection?.items))
            : null

        return (
          <Box key={index} id={sectionId} className={styles.section}>
            {section.title && (
              <Text size="4" weight="bold" className={styles.sectionTitle}>
                {section.title}
              </Text>
            )}
            
            {(section.content != null || (diffEnabled && compareSection?.content != null)) && (
              <Text size="3" className={styles.sectionContent}>
                {diffEnabled && sectionContentTokens ? renderDiffTokens(sectionContentTokens) : (section.content ?? '')}
              </Text>
            )}
            
            {(section.items != null || (diffEnabled && compareSection?.items != null)) && (
              <ul className={styles.itemsList}>
                {diffEnabled && sectionItemsTokens
                  ? sectionItemsTokens.map((t, itemIndex) => (
                      <li key={itemIndex} className={styles.listItem}>
                        <Text
                          size="3"
                          className={t.op === 'add' ? styles.diffAdded : t.op === 'del' ? styles.diffRemoved : undefined}
                        >
                          {t.text}
                        </Text>
                      </li>
                    ))
                  : (section.items ?? []).map((item, itemIndex) => (
                      <li key={itemIndex} className={styles.listItem}>
                        <Text size="3">{item}</Text>
                      </li>
                    ))}
              </ul>
            )}
            
            {section.subsections && section.subsections.map((subsection, subIndex) => (
              <Box key={subIndex} className={styles.subsection}>
                <Text size="3" weight="medium" className={styles.subsectionTitle}>
                  {subsection.title}
                </Text>
                {subsection.items && (
                  <ul className={styles.itemsList}>
                    {diffEnabled
                      ? diffLines(
                          joinLines(subsection.items),
                          joinLines(
                            findSectionByTitle(compareSections, section.title)?.subsections?.find((s) => s.title === subsection.title)?.items
                          )
                        ).map((t, itemIndex) => (
                        <li key={itemIndex} className={styles.listItem}>
                          <Text
                            size="3"
                            className={t.op === 'add' ? styles.diffAdded : t.op === 'del' ? styles.diffRemoved : undefined}
                          >
                            {t.text}
                          </Text>
                        </li>
                      ))
                      : (
                      subsection.items.map((item, itemIndex) => (
                        <li key={itemIndex} className={styles.listItem}>
                          <Text size="3">{item}</Text>
                        </li>
                      ))
                      )}
                  </ul>
                )}
              </Box>
            ))}
          </Box>
        )
      })}
    </Box>
  )
}
