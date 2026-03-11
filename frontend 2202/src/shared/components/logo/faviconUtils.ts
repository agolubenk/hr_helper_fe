/**
 * Генерация SVG favicon как data URL для вкладки браузера.
 * Использует тот же шаблон робота, что и LogoRobot.
 */

import type { AccentColorValue } from './logoColors'
import { getLogoColors } from './logoColors'

function createRobotSVG(colors: ReturnType<typeof getLogoColors>): string {
  /* viewBox сужен на 35% для увеличения иконки во вкладке: 128/1.35≈95, центрирование 17,17 */
  return `<svg width="128" height="128" viewBox="17 17 95 95" xmlns="http://www.w3.org/2000/svg">
  <g transform="translate(16,16)">
    <circle cx="48" cy="48" r="40" fill="${colors.glow}" opacity="0.08"/>

    <line x1="8" y1="32" x2="24" y2="32" stroke="${colors.glitch1}" stroke-width="2" stroke-linecap="round"/>
    <line x1="6" y1="42" x2="22" y2="42" stroke="${colors.glitch2}" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="10" y1="52" x2="24" y2="52" stroke="${colors.glitch3}" stroke-width="1.6" stroke-linecap="round"/>

    <line x1="72" y1="32" x2="88" y2="32" stroke="${colors.glitch1}" stroke-width="2" stroke-linecap="round"/>
    <line x1="74" y1="42" x2="90" y2="42" stroke="${colors.glitch2}" stroke-width="1.6" stroke-linecap="round"/>
    <line x1="70" y1="52" x2="86" y2="52" stroke="${colors.glitch3}" stroke-width="1.6" stroke-linecap="round"/>

    <circle cx="24" cy="48" r="10" fill="${colors.earFill}" stroke="${colors.stroke}" stroke-width="2.4"/>
    <circle cx="24" cy="48" r="6" fill="${colors.earCenter}"/>

    <circle cx="72" cy="48" r="10" fill="${colors.earFill}" stroke="${colors.stroke}" stroke-width="2.4"/>
    <circle cx="72" cy="48" r="6" fill="${colors.earCenter}"/>

    <rect x="28" y="32" width="40" height="42" rx="10"
          fill="url(#fg)" stroke="${colors.stroke}" stroke-width="2.4"/>

    <rect x="32" y="36" width="32" height="22" rx="8" fill="${colors.screen}" opacity="0.55"/>

    <circle cx="38" cy="46" r="4" fill="${colors.eyes}"/>
    <circle cx="58" cy="46" r="4" fill="${colors.eyes}"/>

    <line x1="40" y1="54" x2="56" y2="54" stroke="${colors.mouth}" stroke-width="2" stroke-linecap="round"/>

    <rect x="47" y="20" width="2" height="12" rx="1" fill="${colors.antennaRod}"/>

    <circle cx="48" cy="18" r="5" fill="${colors.antennaBall}" stroke="${colors.antennaBallStroke}" stroke-width="1.6"/>

    <path d="M 34 74 Q 34 80 34 86 Q 34 90 30 90 Q 26 90 26 86 L 26 74"
          fill="${colors.drip}" stroke="${colors.stroke}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M 48 74 Q 48 82 48 90 Q 48 94 44 94 Q 40 94 40 90 L 40 74"
          fill="${colors.drip}" stroke="${colors.stroke}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M 62 74 Q 62 80 62 86 Q 62 90 66 90 Q 70 90 70 86 L 70 74"
          fill="${colors.drip}" stroke="${colors.stroke}" stroke-width="2.2" stroke-linejoin="round"/>
  </g>

  <defs>
    <linearGradient id="fg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${colors.headTop}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${colors.headBottom}" stop-opacity="1"/>
    </linearGradient>
  </defs>
</svg>`
}

/**
 * Возвращает data URL для favicon (48x48 — стандарт для вкладки).
 * SVG масштабируется через viewBox, браузер сам рендерит в нужный размер.
 */
export function getFaviconDataUrl(
  accent: AccentColorValue,
  theme: 'light' | 'dark'
): string {
  const colors = getLogoColors(accent, theme)
  const svg = createRobotSVG(colors)
  const encoded = encodeURIComponent(svg)
  return `data:image/svg+xml,${encoded}`
}
