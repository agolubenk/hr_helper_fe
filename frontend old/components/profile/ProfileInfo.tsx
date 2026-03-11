'use client'

import { Box, Text, Flex, Grid } from "@radix-ui/themes"
import { PersonIcon, ClockIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons"
import SocialLinks from './SocialLinks'
import type { SocialLink } from '@/lib/types/social-links'
import type { WorkingHours } from '@/lib/types/working-hours'
import { formatWorkingHours, DAY_NAMES } from '@/lib/types/working-hours'
import styles from './ProfileInfo.module.css'

interface ProfileInfoProps {
  userData: {
    firstName: string
    lastName: string
    email: string
    registrationDate: string
    lastLoginDate: string
    workSchedule?: string
    workStartTime?: string
    workEndTime?: string
    workTimeByDay?: WorkingHours['custom']
    workingHours?: WorkingHours
    meetingInterval: string
    activeEnvironment: string
    socialLinks?: SocialLink[]
  }
}

export default function ProfileInfo({ userData }: ProfileInfoProps) {
  return (
    <Box className={styles.profileInfoBlock}>
      {/* Заголовок */}
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          <PersonIcon width="20" height="20" />
          <Text size="4" weight="bold">
            Информация о профиле
          </Text>
        </Flex>
      </Box>

      {/* Содержимое */}
      <Box className={styles.content}>
        <Grid columns="2" gap="4" width="100%" className={styles.grid}>
          {/* Левая колонка */}
          <Box>
            <InfoRow label="Фамилия:" value={userData.lastName} />
            <InfoRow label="Имя:" value={userData.firstName} />
            <InfoRow 
              label="Email:" 
              value={userData.email}
              icon={<EnvelopeClosedIcon width={16} height={16} />}
            />
          </Box>

          {/* Правая колонка */}
          <Box>
            <InfoRow label="Дата регистрации:" value={userData.registrationDate} />
            <InfoRow label="Дата последнего входа:" value={userData.lastLoginDate} />
            <InfoRow
              label="Рабочий график:"
              value={
                userData.workingHours
                  ? formatWorkingHours(userData.workingHours)
                  : userData.workSchedule ||
                    (userData.workStartTime && userData.workEndTime
                      ? `${userData.workStartTime} — ${userData.workEndTime}`
                      : userData.workTimeByDay
                        ? Object.entries(userData.workTimeByDay)
                            .filter(([, d]) => d?.isWorkday)
                            .map(([day, d]) => `${(DAY_NAMES as Record<string, string>)[day] ?? day}: ${d!.start} — ${d!.end}`)
                            .join('; ') || '—'
                        : '—')
              }
              icon={<ClockIcon width={16} height={16} />}
            />
            <InfoRow 
              label="Время между встречами:" 
              value={userData.meetingInterval}
              icon={<ClockIcon width={16} height={16} />}
            />
            <Box className={styles.environmentRow}>
              <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
                Активная среда:
              </Text>
              <Box className={styles.environmentBadge}>
                <Text size="2" weight="medium">
                  {userData.activeEnvironment}
                </Text>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Социальные сети и мессенджеры */}
        <Box mt="6" pt="4" style={{ borderTop: '1px solid var(--gray-a6)' }}>
          <Text size="2" weight="medium" style={{ color: 'var(--gray-11)', marginBottom: '12px', display: 'block' }}>
            Социальные сети и мессенджеры
          </Text>
          <SocialLinks links={userData.socialLinks ?? []} />
        </Box>
      </Box>
    </Box>
  )
}

function InfoRow({ 
  label, 
  value, 
  icon 
}: { 
  label: string
  value: string
  icon?: React.ReactNode 
}) {
  return (
    <Flex direction="column" gap="1" className={styles.infoRow}>
      <Text size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
        {label}
      </Text>
      <Flex align="center" gap="2">
        {icon}
        <Text size="3" style={{ color: 'var(--gray-12)' }}>
          {value}
        </Text>
      </Flex>
    </Flex>
  )
}
