/**
 * Цветовые схемы для логотипа-робота (минимальный набор: crimson, blue).
 */

export type AccentColorValue =
  | 'blue' | 'crimson'

export interface LogoColorScheme {
  glow: string
  glitch1: string
  glitch2: string
  glitch3: string
  earFill: string
  earCenter: string
  stroke: string
  screen: string
  eyes: string
  mouth: string
  antennaRod: string
  antennaBall: string
  antennaBallStroke: string
  drip: string
  headTop: string
  headBottom: string
}

const CRIMSON_DARK: LogoColorScheme = {
  glow: '#3f0d12',
  glitch1: '#e93d82',
  glitch2: '#e54666',
  glitch3: '#ffd60a',
  earFill: '#ffe4e6',
  earCenter: '#e11d48',
  stroke: '#881337',
  screen: '#3f0d12',
  eyes: '#be123c',
  mouth: '#be123c',
  antennaRod: '#be123c',
  antennaBall: '#fde047',
  antennaBallStroke: '#a16207',
  drip: '#e54666',
  headTop: '#fb7185',
  headBottom: '#f43f5e',
}

const CRIMSON_LIGHT: LogoColorScheme = {
  glow: '#fff1f2',
  glitch1: '#f43f5e',
  glitch2: '#fb7185',
  glitch3: '#fbbf24',
  earFill: '#ffffff',
  earCenter: '#e11d48',
  stroke: '#9f1239',
  screen: '#ffe4e6',
  eyes: '#be123c',
  mouth: '#be123c',
  antennaRod: '#be123c',
  antennaBall: '#facc15',
  antennaBallStroke: '#854d0e',
  drip: '#fb7185',
  headTop: '#fda4af',
  headBottom: '#fb7185',
}

const BLUE_DARK: LogoColorScheme = {
  glow: '#0c1929',
  glitch1: '#3b82f6',
  glitch2: '#60a5fa',
  glitch3: '#34d399',
  earFill: '#dbeafe',
  earCenter: '#2563eb',
  stroke: '#1e3a8a',
  screen: '#0c1929',
  eyes: '#1d4ed8',
  mouth: '#1d4ed8',
  antennaRod: '#1d4ed8',
  antennaBall: '#4ade80',
  antennaBallStroke: '#15803d',
  drip: '#60a5fa',
  headTop: '#93c5fd',
  headBottom: '#3b82f6',
}

const BLUE_LIGHT: LogoColorScheme = {
  glow: '#eff6ff',
  glitch1: '#3b82f6',
  glitch2: '#60a5fa',
  glitch3: '#22c55e',
  earFill: '#ffffff',
  earCenter: '#2563eb',
  stroke: '#1e40af',
  screen: '#dbeafe',
  eyes: '#1d4ed8',
  mouth: '#1d4ed8',
  antennaRod: '#1d4ed8',
  antennaBall: '#4ade80',
  antennaBallStroke: '#16a34a',
  drip: '#93c5fd',
  headTop: '#bfdbfe',
  headBottom: '#93c5fd',
}

const schemes: Record<string, LogoColorScheme> = {
  'crimson-dark': CRIMSON_DARK,
  'crimson-light': CRIMSON_LIGHT,
  'blue-dark': BLUE_DARK,
  'blue-light': BLUE_LIGHT,
}

export function getLogoColors(
  accent: AccentColorValue | string,
  theme: 'light' | 'dark'
): LogoColorScheme {
  const key = `${accent}-${theme}`
  return schemes[key] ?? CRIMSON_LIGHT
}
