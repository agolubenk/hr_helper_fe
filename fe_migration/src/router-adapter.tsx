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
  children?: ReactNode
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, children, ...rest },
  ref
) {
  return (
    <RouterLink ref={ref} to={href} {...rest}>
      {children}
    </RouterLink>
  )
})
