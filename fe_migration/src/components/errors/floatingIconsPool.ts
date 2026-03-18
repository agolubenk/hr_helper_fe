import type { ElementType } from 'react'
import {
  AvatarIcon,
  BarChartIcon,
  CalendarIcon,
  ChatBubbleIcon,
  ClipboardIcon,
  DashboardIcon,
  EnvelopeClosedIcon,
  FileTextIcon,
  GearIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PersonIcon,
  ReloadIcon,
  StarIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
} from '@radix-ui/react-icons'

export const FLOATING_ICONS_POOL: ElementType[] = [
  AvatarIcon,
  BarChartIcon,
  CalendarIcon,
  ChatBubbleIcon,
  ClipboardIcon,
  DashboardIcon,
  EnvelopeClosedIcon,
  FileTextIcon,
  GearIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PersonIcon,
  ReloadIcon,
  StarIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
]

export function getRandomIcon(index: number, seed = 0): (typeof FLOATING_ICONS_POOL)[number] {
  const combined = (index * 9301 + 49297 + seed) % 233280
  const randomIndex = Math.floor((combined / 233280) * FLOATING_ICONS_POOL.length)
  return FLOATING_ICONS_POOL[randomIndex % FLOATING_ICONS_POOL.length]
}
