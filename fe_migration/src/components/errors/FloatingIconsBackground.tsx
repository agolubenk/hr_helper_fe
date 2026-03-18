import { useMemo } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { LogoRobot } from '@/components/logo'
import { FloatingIcon } from './FloatingIcon'
import { getRandomIcon } from './floatingIconsPool'

const FLOATING_COUNT = 40
const LOGO_ROBOT_MIN = 3
const LOGO_ROBOT_MAX = 11

interface FloatingIconsBackgroundProps {
  className: string
}

export function FloatingIconsBackground({ className }: FloatingIconsBackgroundProps) {
  const seed = useMemo(() => Math.floor(Math.random() * 100000), [])
  const logoRobotCount = useMemo(
    () => LOGO_ROBOT_MIN + Math.floor(Math.random() * (LOGO_ROBOT_MAX - LOGO_ROBOT_MIN + 1)),
    []
  )
  const logoRobotIndices = useMemo(() => {
    const indices = new Set<number>()
    while (indices.size < logoRobotCount) {
      indices.add(Math.floor(Math.random() * FLOATING_COUNT))
    }
    return indices
  }, [logoRobotCount])
  const { theme, lightThemeAccentColor, darkThemeAccentColor } = useTheme()
  const accentColor = theme === 'light' ? lightThemeAccentColor : darkThemeAccentColor

  return (
    <>
      {Array.from({ length: FLOATING_COUNT }).map((_, index) => {
        if (logoRobotIndices.has(index)) {
          return (
            <FloatingIcon key={index} Icon={() => null} index={index} className={className}>
              <LogoRobot theme={theme} accentColor={accentColor} size={32} />
            </FloatingIcon>
          )
        }
        const Icon = getRandomIcon(index, seed)
        return <FloatingIcon key={index} Icon={Icon} index={index} className={className} />
      })}
    </>
  )
}
