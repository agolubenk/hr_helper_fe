import { Box, Text, Flex } from '@radix-ui/themes'
import { PersonIcon, Pencil1Icon, CalendarIcon, LightningBoltIcon, ColorWheelIcon, ClipboardIcon, FileTextIcon, LockClosedIcon } from '@radix-ui/react-icons'
import { IntegrationsIcon } from '@/shared/components/icons/IntegrationsIcon'
import styles from './ProfileNavigation.module.css'

export type ProfileTabType = 'profile' | 'edit' | 'schedule' | 'theme' | 'integrations' | 'quick-buttons' | 'reminder' | 'requests' | 'documents'

interface ProfileNavigationProps {
  activeTab: ProfileTabType
  onTabChange: (tab: ProfileTabType) => void
}

const menuItems: { id: ProfileTabType; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Профиль', icon: <PersonIcon width={14} height={14} /> },
  { id: 'edit', label: 'Редактировать', icon: <Pencil1Icon width={14} height={14} /> },
  { id: 'schedule', label: 'Расписание', icon: <CalendarIcon width={14} height={14} /> },
  { id: 'theme', label: 'Настройки темы', icon: <ColorWheelIcon width={14} height={14} /> },
  { id: 'integrations', label: 'Интеграции и API', icon: <IntegrationsIcon size={14} /> },
  { id: 'quick-buttons', label: 'Быстрые кнопки', icon: <LightningBoltIcon width={14} height={14} /> },
  { id: 'reminder', label: 'Напоминание', icon: <LockClosedIcon width={14} height={14} /> },
  { id: 'requests', label: 'Заявки', icon: <ClipboardIcon width={14} height={14} /> },
  { id: 'documents', label: 'Документы', icon: <FileTextIcon width={14} height={14} /> },
]

export function ProfileNavigation({ activeTab, onTabChange }: ProfileNavigationProps) {
  const profileEditItems = menuItems.slice(0, 2)
  const restItems = menuItems.slice(2)

  return (
    <Box className={styles.navigation}>
      <Box className={styles.profileEditGroup}>
        {profileEditItems.map((item) => (
          <Box
            key={item.id}
            className={`${styles.menuItem} ${activeTab === item.id ? styles.active : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <Flex align="center" gap="2">
              <Box className={styles.menuIcon}>{item.icon}</Box>
              <Text size="2" weight={activeTab === item.id ? 'medium' : 'regular'}>
                {item.label}
              </Text>
            </Flex>
          </Box>
        ))}
      </Box>
      {restItems.map((item) => (
        <Box
          key={item.id}
          className={`${styles.menuItem} ${activeTab === item.id ? styles.active : ''}`}
          onClick={() => onTabChange(item.id)}
        >
          <Flex align="center" gap="2">
            <Box className={styles.menuIcon}>{item.icon}</Box>
            <Text size="2" weight={activeTab === item.id ? 'medium' : 'regular'}>
              {item.label}
            </Text>
          </Flex>
        </Box>
      ))}
    </Box>
  )
}
