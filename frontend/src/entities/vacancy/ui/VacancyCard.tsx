import { memo, useCallback } from 'react'
import { MapPin, Users, AlertTriangle, Calendar } from 'lucide-react'
import type { VacancyListItem } from '../model'
import { VacancyStatusBadge } from './VacancyStatusBadge'
import styles from './VacancyCard.module.css'

interface VacancyCardProps {
  vacancy: VacancyListItem
  onClick?: (id: number) => void
  selected?: boolean
}

export const VacancyCard = memo(function VacancyCard({ vacancy, onClick, selected }: VacancyCardProps) {
  return (
    <div
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={() => onClick?.(vacancy.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.(vacancy.id)
        }
      }}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{vacancy.title}</h3>
        <VacancyStatusBadge status={vacancy.status} />
      </div>

      <div className={styles.meta}>
        <span className={styles.recruiter}>{vacancy.recruiterName}</span>
      </div>

      <div className={styles.details}>
        {vacancy.locations.length > 0 && (
          <div className={styles.detail}>
            <MapPin size={14} />
            <span>{vacancy.locations.join(', ')}</span>
          </div>
        )}

        {vacancy.interviewersCount > 0 && (
          <div className={styles.detail}>
            <Users size={14} />
            <span>{vacancy.interviewersCount} интервьюеров</span>
          </div>
        )}

        {vacancy.date && (
          <div className={styles.detail}>
            <Calendar size={14} />
            <span>{vacancy.date}</span>
          </div>
        )}
      </div>

      {vacancy.hasWarning && vacancy.warningText && (
        <div className={styles.warning}>
          <AlertTriangle size={14} />
          <span>{vacancy.warningText}</span>
        </div>
      )}
    </div>
  )
})
