import { Box, Flex, Text, Badge } from '@radix-ui/themes'
import type { CandidateResumeProfile, CandidateResumeWorkEntry } from '../mocks'
import styles from '../AtsPage.module.css'

function resolveWorkCompanyUrl(job: CandidateResumeWorkEntry): string | undefined {
  const explicit = job.companyUrl?.trim()
  if (explicit) return explicit
  const meta = job.companyMeta?.trim()
  if (!meta) return undefined
  const domainMatch = meta.match(/(?:^|[\s,])([a-z0-9][a-z0-9.-]*\.[a-z]{2,})$/i)
  if (domainMatch) return `https://${domainMatch[1]}`
  return undefined
}

interface CandidateResumeProfileViewProps {
  profile: CandidateResumeProfile
  currentRoleLine: string
}

function SectionDividerWithLabel({ label }: { label: string }) {
  return (
    <Flex align="center" gap="2" mb="3" style={{ width: '100%' }}>
      <Text size="1" color="gray" style={{ flexShrink: 0 }}>
        {label}
      </Text>
      <Box style={{ flex: 1, height: 1, background: 'var(--gray-6)' }} />
    </Flex>
  )
}

function SectionTitleWithLine({ title }: { title: string }) {
  return (
    <Flex align="center" gap="2" mb="3" style={{ width: '100%' }}>
      <Text size="2" weight="medium" color="gray" style={{ flexShrink: 0 }}>
        {title}
      </Text>
      <Box style={{ flex: 1, height: 1, background: 'var(--gray-6)' }} />
    </Flex>
  )
}

export function CandidateResumeProfileView({ profile, currentRoleLine }: CandidateResumeProfileViewProps) {
  const { aboutMe, workExperience, education, languages, skillTags, certifications, portfolio, totalExperienceLine } =
    profile

  const workTitle =
    totalExperienceLine != null && totalExperienceLine !== ''
      ? `Опыт работы — ${totalExperienceLine}`
      : 'Опыт работы'

  return (
    <Flex direction="column" gap="4" className={styles.resumeProfileRoot}>
      <Box className={styles.resumeLabelValueRow}>
        <Text size="1" color="gray" className={styles.resumeLabelCol}>
          Текущая роль
        </Text>
        <Text size="2" weight="bold" className={styles.resumeValueCol}>
          {currentRoleLine}
        </Text>
      </Box>

      {aboutMe ? (
        <Box>
          <Box className={styles.resumeLabelValueRow}>
            <Text size="1" color="gray" className={styles.resumeLabelCol}>
              О себе
            </Text>
            <Box className={styles.resumeValueCol}>
              <Text size="2" style={{ lineHeight: 1.5 }}>
                {aboutMe.body}
              </Text>
              {aboutMe.highlightsTitle ? (
                <Text
                  as="div"
                  size="1"
                  weight="bold"
                  mt="3"
                  mb="2"
                  style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}
                >
                  {aboutMe.highlightsTitle}
                </Text>
              ) : null}
              {aboutMe.highlights?.length ? (
                <ul className={styles.resumeDashList}>
                  {aboutMe.highlights.map((line, i) => (
                    <li key={i}>
                      <Text size="2">{line}</Text>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Box>
          </Box>
        </Box>
      ) : null}

      <Box>
        <SectionTitleWithLine title={workTitle} />
        <Flex direction="column" gap="5">
          {workExperience.map((job, index) => {
            const companyHref = resolveWorkCompanyUrl(job)
            return (
              <Box key={`${job.company}-${index}`} className={styles.resumeWorkEntry}>
                <Box className={styles.resumeWorkGrid}>
                  <Box className={styles.resumeWorkAside}>
                    <Text as="div" size="1" color="gray" style={{ lineHeight: 1.4 }}>
                      {job.period}
                    </Text>
                    {job.duration ? (
                      <Text as="div" size="1" color="gray" style={{ lineHeight: 1.4 }}>
                        {job.duration}
                      </Text>
                    ) : null}
                  </Box>
                  <Box className={styles.resumeWorkMain}>
                    <Text size="3" weight="bold" asChild>
                      {companyHref ? (
                        <a
                          href={companyHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.resumeCompanyLink}
                        >
                          {job.company}
                        </a>
                      ) : (
                        <span>{job.company}</span>
                      )}
                    </Text>
                    <Text as="div" size="2" weight="bold" mt="2" style={{ lineHeight: 1.35 }}>
                      {job.title}
                    </Text>
                    {job.bullets.length > 0 ? (
                      <ul className={styles.resumeDashList}>
                        {job.bullets.map((b, i) => (
                          <li key={i}>
                            <Text size="2">{b}</Text>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </Box>
                </Box>
              </Box>
            )
          })}
        </Flex>
      </Box>

      {education?.length ? (
        <Box>
          <SectionDividerWithLabel label="Образование" />
          <Flex direction="column" gap="4">
            {education.map((ed, index) => (
              <Box key={`${ed.institution}-${index}`} className={styles.resumeWorkGrid}>
                <Box className={styles.resumeWorkAside}>
                  <Text size="1" color="gray">
                    {ed.leftLabel}
                  </Text>
                </Box>
                <Box className={styles.resumeWorkMain}>
                  <Flex direction="column" gap="1">
                    <Text as="div" size="2" weight="bold" style={{ lineHeight: 1.35 }}>
                      {ed.institution}
                    </Text>
                    {ed.detail ? (
                      <Text as="div" size="2" style={{ lineHeight: 1.45 }}>
                        {ed.detail}
                      </Text>
                    ) : null}
                  </Flex>
                </Box>
              </Box>
            ))}
          </Flex>
        </Box>
      ) : null}

      {languages?.length || skillTags?.length ? (
        <Box>
          <SectionDividerWithLabel label="Навыки" />
          {languages?.length ? (
            <Box className={styles.resumeLabelValueRow} mb="3">
              <Text size="1" color="gray" className={styles.resumeLabelCol}>
                Языки
              </Text>
              <Flex direction="column" gap="1" className={styles.resumeValueCol}>
                {languages.map((line, i) => (
                  <Text key={i} size="2">
                    {line}
                  </Text>
                ))}
              </Flex>
            </Box>
          ) : null}
          {skillTags?.length ? (
            <Box className={styles.resumeLabelValueRow}>
              <Text size="1" color="gray" className={styles.resumeLabelCol}>
                Стек
              </Text>
              <Flex wrap="wrap" gap="2" className={styles.resumeValueCol}>
                {skillTags.map((tag) => (
                  <Badge key={tag} size="1" variant="soft" color="gray">
                    {tag}
                  </Badge>
                ))}
              </Flex>
            </Box>
          ) : null}
        </Box>
      ) : null}

      {certifications?.length ? (
        <Box>
          <SectionDividerWithLabel label="Сертификации и лицензии" />
          <Flex direction="column" gap="3">
            {certifications.map((c, i) => (
              <Flex key={`${c.name}-${i}`} direction="column" gap="1">
                <Text as="div" size="2" weight="bold" style={{ lineHeight: 1.35 }}>
                  {c.name}
                </Text>
                <Text as="div" size="1" color="gray" style={{ lineHeight: 1.4 }}>
                  {[c.issuer, c.year].filter(Boolean).join(' · ')}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      ) : null}

      {portfolio?.length ? (
        <Box>
          <SectionDividerWithLabel label="Портфолио" />
          <Flex direction="column" gap="2">
            {portfolio.map((p, i) => (
              <Box key={`${p.label}-${i}`}>
                {p.url ? (
                  <Text size="2" asChild>
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className={styles.resumePortfolioLink}>
                      {p.label}
                    </a>
                  </Text>
                ) : (
                  <Text size="2">{p.label}</Text>
                )}
              </Box>
            ))}
          </Flex>
        </Box>
      ) : null}

      <Text size="1" color="gray" mt="2" style={{ lineHeight: 1.45 }}>
        Полная история позиций подключится к API компании и резюме.
      </Text>
    </Flex>
  )
}
