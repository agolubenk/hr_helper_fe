import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import type { ShortenedLinkRecord } from './linkBuilderTypes'
import { readLinkBuilderHistory, writeLinkBuilderHistory } from './linkBuilderStorage'

export function useLinkBuilderHistory(): {
  links: ShortenedLinkRecord[]
  setLinks: Dispatch<SetStateAction<ShortenedLinkRecord[]>>
  prepend: (record: ShortenedLinkRecord) => void
  replace: (id: string, patch: Partial<ShortenedLinkRecord>) => void
  remove: (id: string) => void
} {
  const [links, setLinks] = useState<ShortenedLinkRecord[]>(() =>
    typeof window !== 'undefined' ? readLinkBuilderHistory() : [],
  )

  useEffect(() => {
    writeLinkBuilderHistory(links)
  }, [links])

  const prepend = useCallback((record: ShortenedLinkRecord) => {
    setLinks((prev) => [record, ...prev])
  }, [])

  const replace = useCallback((id: string, patch: Partial<ShortenedLinkRecord>) => {
    setLinks((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }, [])

  const remove = useCallback((id: string) => {
    setLinks((prev) => prev.filter((x) => x.id !== id))
  }, [])

  return { links, setLinks, prepend, replace, remove }
}
