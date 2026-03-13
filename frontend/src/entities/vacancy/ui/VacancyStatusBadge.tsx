import { memo } from 'react'
import type { VacancyStatus } from '../model'
import styles from './VacancyStatusBadge.module.css'

interface VacancyStatusBadgeProps {
  status: VacancyStatus
  size?: 'sm' | 'md'
}

const statusConfig: Record<VacancyStatus, { label: string; className: string }> = {
  active: { label: 'Активна', className: styles.active },
  inactive: { label: 'Неактивна', className: styles.inactive },
  draft: { label: 'Черновик', className: styles.draft },
  archived: { label: 'В архиве', className: styles.archived },
}

export const VacancyStatusBadge = memo(function VacancyStatusBadge({
  status,
  size = 'sm',
}: VacancyStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={`${styles.badge} ${config.className} ${size === 'md' ? styles.medium : ''}`}
    >
      {config.label}
    </span>
  )
})
