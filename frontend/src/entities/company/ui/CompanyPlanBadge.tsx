import type { CompanyPlan } from '../model'
import styles from './CompanyPlanBadge.module.css'

interface CompanyPlanBadgeProps {
  plan: CompanyPlan
}

const planConfig: Record<CompanyPlan, { label: string; className: string }> = {
  free: { label: 'Free', className: styles.free },
  starter: { label: 'Starter', className: styles.starter },
  professional: { label: 'Professional', className: styles.professional },
  enterprise: { label: 'Enterprise', className: styles.enterprise },
}

export const CompanyPlanBadge = ({ plan }: CompanyPlanBadgeProps) => {
  const config = planConfig[plan]

  return (
    <span className={`${styles.badge} ${config.className}`}>
      {config.label}
    </span>
  )
}
