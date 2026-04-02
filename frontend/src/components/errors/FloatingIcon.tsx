import { useRef } from 'react'

interface FloatingIconProps {
  Icon: React.ElementType
  index: number
  className: string
  children?: React.ReactNode
}

export function FloatingIcon({ Icon, index, className, children }: FloatingIconProps) {
  const styleRef = useRef<React.CSSProperties | null>(null)
  if (!styleRef.current) {
    const speedGroups = [
      { min: 8, max: 12 },
      { min: 12, max: 18 },
      { min: 18, max: 25 },
    ]
    const speedGroup = speedGroups[index % speedGroups.length]
    const duration = speedGroup.min + Math.random() * (speedGroup.max - speedGroup.min)
    const delay = Math.random() * 2
    const startX = Math.random() * 100
    const startY = Math.random() * 100
    const amplitudeX = 50 + Math.random() * 70
    const amplitudeY = 50 + Math.random() * 70
    const size = 32 + Math.random() * 21
    const opacity = 0.25 + Math.random() * 0.3
    styleRef.current = {
      ['--duration' as string]: `${duration}s`,
      ['--delay' as string]: `${delay}s`,
      ['--start-x' as string]: `${startX}%`,
      ['--start-y' as string]: `${startY}%`,
      ['--amplitude-x' as string]: `${amplitudeX}px`,
      ['--amplitude-y' as string]: `${amplitudeY}px`,
      ['--size' as string]: `${size}px`,
      ['--opacity' as string]: `${opacity}`,
    }
  }

  return (
    <div style={styleRef.current} className={className}>
      {children ?? <Icon width={32} height={32} />}
    </div>
  )
}
