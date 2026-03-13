import { Building2 } from 'lucide-react'
import styles from './CompanyLogo.module.css'

interface CompanyLogoProps {
  logoUrl?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export const CompanyLogo = ({ logoUrl, name, size = 'md' }: CompanyLogoProps) => {
  const sizeClass = styles[size]

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={`${styles.logo} ${sizeClass}`}
      />
    )
  }

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()

  return (
    <div className={`${styles.placeholder} ${sizeClass}`}>
      {initials || <Building2 size={size === 'sm' ? 16 : size === 'md' ? 24 : 32} />}
    </div>
  )
}
