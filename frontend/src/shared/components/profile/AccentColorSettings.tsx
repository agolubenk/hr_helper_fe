'use client'

import { Box, Text, Flex, Select, Grid } from '@radix-ui/themes'
import { ColorWheelIcon } from '@radix-ui/react-icons'
import { useTheme, type ThemePreference } from '@/app/providers/ThemeProvider'
import styles from './AccentColorSettings.module.css'

function ThemePreviewCard({ type }: { type: 'auto' | 'light' | 'dark' }) {
  const WindowPreview = ({ theme }: { theme: 'light' | 'dark' }) => (
    <Box className={styles.themePreviewWindow} data-theme={theme}>
      <Flex gap="1" align="center" className={styles.themePreviewTitlebar}>
        <Flex gap="1">
          <Box className={styles.trafficDot} style={{ background: '#ff5f57' }} />
          <Box className={styles.trafficDot} style={{ background: '#febc2e' }} />
          <Box className={styles.trafficDot} style={{ background: '#28c840' }} />
        </Flex>
      </Flex>
      <Box className={styles.themePreviewContent} data-theme={theme} />
    </Box>
  )

  return (
    <Box className={styles.themePreviewCard}>
      {type === 'auto' && (
        <Flex style={{ width: '100%', height: '100%' }}>
          <Box className={styles.themePreviewHalf} data-theme="light">
            <WindowPreview theme="light" />
          </Box>
          <Box className={styles.themePreviewHalf} data-theme="dark">
            <WindowPreview theme="dark" />
          </Box>
        </Flex>
      )}
      {type === 'light' && (
        <Box className={styles.themePreviewFull} data-theme="light">
          <WindowPreview theme="light" />
        </Box>
      )}
      {type === 'dark' && (
        <Box className={styles.themePreviewFull} data-theme="dark">
          <WindowPreview theme="dark" />
        </Box>
      )}
    </Box>
  )
}

const COLOR_PREVIEWS: Record<string, string> = {
  blue: '#3e63dd',
  tomato: '#f23d3d',
  red: '#e5484d',
  ruby: '#f43f5e',
  crimson: '#f93e6b',
  pink: '#f43f9e',
  plum: '#ab4aba',
  purple: '#8e4ec6',
  violet: '#8e4ec6',
  iris: '#5b5bd6',
  indigo: '#5468df',
  cyan: '#28b5cb',
  teal: '#12a594',
  jade: '#29a383',
  green: '#30a46c',
  grass: '#46a758',
  lime: '#65d30e',
  yellow: '#f5d90a',
  amber: '#f5a623',
  orange: '#ff802b',
  brown: '#ad7f58',
}

const ACCENT_COLORS = [
  { value: 'blue', label: 'Синий' },
  { value: 'tomato', label: 'Томатный' },
  { value: 'red', label: 'Красный' },
  { value: 'ruby', label: 'Рубин' },
  { value: 'crimson', label: 'Малиновый' },
  { value: 'pink', label: 'Розовый' },
  { value: 'plum', label: 'Сливовый' },
  { value: 'purple', label: 'Фиолетовый' },
  { value: 'violet', label: 'Фиалковый' },
  { value: 'iris', label: 'Ирис' },
  { value: 'indigo', label: 'Индиго' },
  { value: 'cyan', label: 'Бирюзовый' },
  { value: 'teal', label: 'Тиффани' },
  { value: 'jade', label: 'Нефрит' },
  { value: 'green', label: 'Зеленый' },
  { value: 'grass', label: 'Трава' },
  { value: 'lime', label: 'Лайм' },
  { value: 'yellow', label: 'Желтый' },
  { value: 'amber', label: 'Янтарный' },
  { value: 'orange', label: 'Оранжевый' },
  { value: 'brown', label: 'Коричневый' },
] as const

const THEME_OPTIONS: { id: ThemePreference; label: string; preview: 'auto' | 'light' | 'dark' }[] = [
  { id: 'auto', label: 'Автоматически', preview: 'auto' },
  { id: 'light', label: 'Светлое', preview: 'light' },
  { id: 'dark', label: 'Темное', preview: 'dark' },
]

export default function AccentColorSettings() {
  const { themePreference, setThemePreference, lightThemeAccentColor, darkThemeAccentColor, setLightThemeAccentColor, setDarkThemeAccentColor } = useTheme()

  return (
    <Box className={styles.accentColorBlock}>
      <Box className={styles.header}>
        <Flex align="center" gap="2">
          <ColorWheelIcon width={20} height={20} />
          <Text size="4" weight="bold">
            Настройки темы
          </Text>
        </Flex>
      </Box>
      <Box className={styles.content}>
        <Text size="2" weight="medium" color="gray" style={{ marginBottom: '12px', display: 'block' }}>
          Тема оформления
        </Text>
        <Flex gap="3" wrap="wrap" className={styles.themeModeRow}>
          {THEME_OPTIONS.map((opt) => (
            <Box
              key={opt.id}
              className={`${styles.themeModeCard} ${themePreference === opt.id ? styles.themeModeCardActive : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => setThemePreference(opt.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setThemePreference(opt.id)}
            >
              <ThemePreviewCard type={opt.preview} />
              <Text
                size="2"
                weight={themePreference === opt.id ? 'medium' : 'regular'}
                color={themePreference === opt.id ? undefined : 'gray'}
                style={{ marginTop: '8px', display: 'block' }}
              >
                {opt.label}
              </Text>
            </Box>
          ))}
        </Flex>
        <Text size="2" weight="medium" color="gray" style={{ marginTop: '24px', marginBottom: '12px', display: 'block' }}>
          Акцентный цвет
        </Text>
        <Grid columns="2" gap="4" width="100%" className={styles.grid} style={{ marginTop: 0 }}>
          <Box>
            <Text size="2" weight="medium" color="gray" style={{ marginBottom: '8px', display: 'block' }}>
              Светлая тема
            </Text>
            <Select.Root
              value={lightThemeAccentColor}
              onValueChange={(v) => setLightThemeAccentColor(v as (typeof ACCENT_COLORS)[number]['value'])}
            >
              <Select.Trigger style={{ width: '100%' }} />
              <Select.Content>
                {ACCENT_COLORS.map((color) => (
                  <Select.Item key={color.value} value={color.value}>
                    <Flex align="center" gap="2">
                      <Box className={styles.colorPreview} style={{ backgroundColor: COLOR_PREVIEWS[color.value] || COLOR_PREVIEWS.blue }} />
                      {color.label}
                    </Flex>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
              Выберите акцентный цвет для светлой темы
            </Text>
          </Box>
          <Box>
            <Text size="2" weight="medium" color="gray" style={{ marginBottom: '8px', display: 'block' }}>
              Темная тема
            </Text>
            <Select.Root
              value={darkThemeAccentColor}
              onValueChange={(v) => setDarkThemeAccentColor(v as (typeof ACCENT_COLORS)[number]['value'])}
            >
              <Select.Trigger style={{ width: '100%' }} />
              <Select.Content>
                {ACCENT_COLORS.map((color) => (
                  <Select.Item key={color.value} value={color.value}>
                    <Flex align="center" gap="2">
                      <Box className={styles.colorPreview} style={{ backgroundColor: COLOR_PREVIEWS[color.value] || COLOR_PREVIEWS.blue }} />
                      {color.label}
                    </Flex>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            <Text size="1" color="gray" style={{ marginTop: '4px', display: 'block' }}>
              Выберите акцентный цвет для темной темы
            </Text>
          </Box>
        </Grid>
      </Box>
    </Box>
  )
}
