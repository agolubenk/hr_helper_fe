/**
 * Адаптер Next.js → React Router.
 * Позволяет не менять логику и разметку при миграции стека (только замена импортов).
 */

import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
  Link as RouterLink,
  type LinkProps as RouterLinkProps,
} from 'react-router-dom'
import { forwardRef, type ReactNode } from 'react'

export function usePathname(): string {
  return useLocation().pathname
}

export function useRouter(): { push: (url: string) => void; replace: (url: string) => void; back: () => void } {
  const navigate = useNavigate()
  return {
    push: (url: string) => navigate(url),
    replace: (url: string) => navigate(url, { replace: true }),
    back: () => navigate(-1),
  }
}

export { useLocation, useNavigate, useParams, useSearchParams }

interface LinkProps extends Omit<RouterLinkProps, 'to'> {
  href: string
  /** Состояние location при переходе (например, для «Обратно» с хаба рекрутинга). */
  linkState?: RouterLinkProps['state']
  children?: ReactNode
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, children, linkState, ...rest },
  ref
) {
  const to = linkState !== undefined ? { pathname: href, state: linkState } : href
  return (
    <RouterLink ref={ref} to={to} {...rest}>
      {children}
    </RouterLink>
  )
})
