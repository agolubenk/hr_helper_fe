'use client'

import type { AccentColorValue } from './logoColors'
import { getLogoColors } from './logoColors'

interface LogoRobotProps {
  theme: 'light' | 'dark'
  accentColor: AccentColorValue
  size?: number
  className?: string
}

export function LogoRobot({ theme, accentColor, size = 34, className }: LogoRobotProps) {
  const colors = getLogoColors(accentColor, theme)

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <g transform="translate(16,16)">
        <circle cx="48" cy="48" r="40" fill={colors.glow} opacity="0.08" />

        {/* Glitch lines left */}
        <line x1="8" y1="32" x2="24" y2="32" stroke={colors.glitch1} strokeWidth="2" strokeLinecap="round" />
        <line x1="6" y1="42" x2="22" y2="42" stroke={colors.glitch2} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="10" y1="52" x2="24" y2="52" stroke={colors.glitch3} strokeWidth="1.6" strokeLinecap="round" />

        {/* Glitch lines right */}
        <line x1="72" y1="32" x2="88" y2="32" stroke={colors.glitch1} strokeWidth="2" strokeLinecap="round" />
        <line x1="74" y1="42" x2="90" y2="42" stroke={colors.glitch2} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="70" y1="52" x2="86" y2="52" stroke={colors.glitch3} strokeWidth="1.6" strokeLinecap="round" />

        {/* Left ear/headphone */}
        <circle cx="24" cy="48" r="10" fill={colors.earFill} stroke={colors.stroke} strokeWidth="2.4" />
        <circle cx="24" cy="48" r="6" fill={colors.earCenter} />

        {/* Right ear/headphone */}
        <circle cx="72" cy="48" r="10" fill={colors.earFill} stroke={colors.stroke} strokeWidth="2.4" />
        <circle cx="72" cy="48" r="6" fill={colors.earCenter} />

        {/* Main head body */}
        <rect
          x="28"
          y="32"
          width="40"
          height="42"
          rx="10"
          fill={`url(#headGradient-${theme}-${accentColor})`}
          stroke={colors.stroke}
          strokeWidth="2.4"
        />

        {/* Inner screen/face area */}
        <rect x="32" y="36" width="32" height="22" rx="8" fill={colors.screen} opacity="0.55" />

        {/* Eyes */}
        <circle cx="38" cy="46" r="4" fill={colors.eyes} />
        <circle cx="58" cy="46" r="4" fill={colors.eyes} />

        {/* Mouth */}
        <line x1="40" y1="54" x2="56" y2="54" stroke={colors.mouth} strokeWidth="2" strokeLinecap="round" />

        {/* Antenna rod */}
        <rect x="47" y="20" width="2" height="12" rx="1" fill={colors.antennaRod} />

        {/* Antenna ball */}
        <circle
          cx="48"
          cy="18"
          r="5"
          fill={colors.antennaBall}
          stroke={colors.antennaBallStroke}
          strokeWidth="1.6"
        />

        {/* Drip effects bottom */}
        <path
          d="M 34 74 Q 34 80 34 86 Q 34 90 30 90 Q 26 90 26 86 L 26 74"
          fill={colors.drip}
          stroke={colors.stroke}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M 48 74 Q 48 82 48 90 Q 48 94 44 94 Q 40 94 40 90 L 40 74"
          fill={colors.drip}
          stroke={colors.stroke}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M 62 74 Q 62 80 62 86 Q 62 90 66 90 Q 70 90 70 86 L 70 74"
          fill={colors.drip}
          stroke={colors.stroke}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </g>

      <defs>
        <linearGradient
          id={`headGradient-${theme}-${accentColor}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor={colors.headTop} stopOpacity={1} />
          <stop offset="100%" stopColor={colors.headBottom} stopOpacity={1} />
        </linearGradient>
      </defs>
    </svg>
  )
}
