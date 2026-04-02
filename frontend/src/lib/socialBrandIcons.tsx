/**
 * Узнаваемые мини-иконки брендов, для которых нет подходящего значка в react-icons/bi|si.
 * SVG упрощены под размер 16×16 (логотипы-намёки, не официальные гайдлайны).
 */
import type { CSSProperties } from 'react'

type BrandIconProps = {
  size?: number
  style?: CSSProperties
  className?: string
}

/** Pikabu — оранжевый блок с «P» (читаемо в 16px) */
export const PikabuBrandIcon = ({ size = 16, style, className }: BrandIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={style}
    aria-hidden
  >
    <rect width="24" height="24" rx="5" fill="#FF9100" />
    <text
      x="12"
      y="16.5"
      textAnchor="middle"
      fill="#fff"
      fontSize="12"
      fontWeight="800"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      P
    </text>
  </svg>
)

/** VC.ru — бирюзовый блок с «VC» */
export const VcRuBrandIcon = ({ size = 16, style, className }: BrandIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={className}
    style={style}
    aria-hidden
  >
    <rect width="24" height="24" rx="4" fill="#00B1FF" />
    <text
      x="12"
      y="15.5"
      textAnchor="middle"
      fill="#fff"
      fontSize="9"
      fontWeight="700"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      VC
    </text>
  </svg>
)
