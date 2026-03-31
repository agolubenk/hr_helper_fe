import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type RefObject,
  type SetStateAction,
} from 'react'
import {
  applyAutomationRuleToForm,
  buildUrlContext,
  pickAutomationRule,
} from './linkBuilderAutomation'
import type { LinkBuilderAutomationRule, LinkBuilderGeneralSettings } from './linkBuilderSettingsTypes'
import type {
  LinkBuilderExpiryMode,
  LinkBuilderFormSubmitStatus,
  ShortenedLinkRecord,
} from './linkBuilderTypes'
import { validateLongUrl, validateAliasAgainstRecords } from './linkBuilderValidation'
import { shortenUrlMock } from './shortenUrlMock'

interface UseLinkBuilderShortenFormArgs {
  links: ShortenedLinkRecord[]
  onRecordCreated: (record: ShortenedLinkRecord) => void
  generalSettings: LinkBuilderGeneralSettings
  automationRules: LinkBuilderAutomationRule[]
  onAutomationApplied?: (ruleName: string) => void
}

export interface LinkBuilderShortenFormModel {
  formRef: RefObject<HTMLDivElement | null>
  scrollToForm: () => void
  url: string
  setUrl: Dispatch<SetStateAction<string>>
  alias: string
  setAlias: Dispatch<SetStateAction<string>>
  hasAdvanced: boolean
  setHasAdvanced: Dispatch<SetStateAction<boolean>>
  expiryMode: LinkBuilderExpiryMode
  setExpiryMode: Dispatch<SetStateAction<LinkBuilderExpiryMode>>
  expiryLocal: string
  setExpiryLocal: Dispatch<SetStateAction<string>>
  maxClicksInput: string
  setMaxClicksInput: Dispatch<SetStateAction<string>>
  ogTitle: string
  setOgTitle: Dispatch<SetStateAction<string>>
  ogDescription: string
  setOgDescription: Dispatch<SetStateAction<string>>
  ogImageUrl: string
  setOgImageUrl: Dispatch<SetStateAction<string>>
  linkActiveSwitch: boolean
  setLinkActiveSwitch: Dispatch<SetStateAction<boolean>>
  submitStatus: LinkBuilderFormSubmitStatus
  feedbackMessage: string | null
  urlInvalid: boolean
  urlMessage: string | null
  aliasInvalid: boolean
  aliasMessage: string | null
  expiryInvalid: boolean
  shortenDisabled: boolean
  buttonSuccessFlash: boolean
  handleSubmit: (e: FormEvent) => void
}

export function useLinkBuilderShortenForm({
  links,
  onRecordCreated,
  generalSettings,
  automationRules,
  onAutomationApplied,
}: UseLinkBuilderShortenFormArgs): LinkBuilderShortenFormModel {
  const formRef = useRef<HTMLDivElement | null>(null)
  const automationUrlRef = useRef<string | null>(null)

  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [hasAdvanced, setHasAdvanced] = useState(() => generalSettings.openAdvancedByDefault)
  const [expiryMode, setExpiryMode] = useState<LinkBuilderExpiryMode>('none')
  const [expiryLocal, setExpiryLocal] = useState('')
  const [maxClicksInput, setMaxClicksInput] = useState('100')
  const [ogTitle, setOgTitle] = useState('')
  const [ogDescription, setOgDescription] = useState('')
  const [ogImageUrl, setOgImageUrl] = useState('')
  const [linkActiveSwitch, setLinkActiveSwitch] = useState(() => generalSettings.defaultStatus === 'active')

  const [submitStatus, setSubmitStatus] = useState<LinkBuilderFormSubmitStatus>('idle')
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [buttonSuccessFlash, setButtonSuccessFlash] = useState(false)

  const urlCheck = useMemo(() => validateLongUrl(url), [url])
  const urlInvalid = url.trim().length > 0 && !urlCheck.ok
  const urlMessage = urlInvalid ? urlCheck.error ?? 'Неверный URL' : null

  const aliasCheck = useMemo(
    () => (hasAdvanced ? validateAliasAgainstRecords(alias, links) : { ok: true as const, normalized: null }),
    [alias, hasAdvanced, links],
  )
  const aliasInvalid = hasAdvanced && alias.trim().length > 0 && !aliasCheck.ok
  const aliasMessage = aliasInvalid ? aliasCheck.error ?? 'Некорректный alias' : null

  const maxClicksParsed = useMemo(() => {
    const n = Number.parseInt(maxClicksInput.trim(), 10)
    if (!Number.isFinite(n) || n < 1) return null
    return n
  }, [maxClicksInput])

  const expiryInvalid =
    hasAdvanced &&
    ((expiryMode === 'date' && !expiryLocal.trim()) || (expiryMode === 'clicks' && maxClicksParsed === null))

  const shortenDisabled =
    !urlCheck.ok ||
    aliasInvalid ||
    submitStatus === 'loading' ||
    (hasAdvanced && expiryInvalid)

  useEffect(() => {
    if (!generalSettings.autoApplyAutomations) {
      automationUrlRef.current = null
      return
    }
    const norm = urlCheck.normalized
    if (!norm || !urlCheck.ok) {
      automationUrlRef.current = null
      return
    }
    if (automationUrlRef.current === norm) return
    const ctx = buildUrlContext(norm)
    if (!ctx) return
    const rule = pickAutomationRule(automationRules, ctx)
    if (!rule) return
    automationUrlRef.current = norm
    applyAutomationRuleToForm(rule, ctx, {
      setHasAdvanced,
      setAlias,
      setOgTitle,
      setOgDescription,
      setOgImageUrl,
      setExpiryMode,
      setExpiryLocal,
      setMaxClicksInput,
      setLinkActiveSwitch,
    })
    onAutomationApplied?.(rule.name)
  }, [
    urlCheck.ok,
    urlCheck.normalized,
    generalSettings.autoApplyAutomations,
    automationRules,
    onAutomationApplied,
  ])

  const scrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      const el = document.getElementById('link-builder-url')
      el?.focus()
    }, 280)
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!urlCheck.ok || aliasInvalid || (hasAdvanced && expiryInvalid)) return

      setSubmitStatus('loading')
      setFeedbackMessage(null)
      setButtonSuccessFlash(false)

      let expiresAt: string | null = null
      let maxClicks: number | null = null
      if (hasAdvanced) {
        if (expiryMode === 'date') {
          const d = new Date(expiryLocal)
          if (Number.isNaN(d.getTime())) {
            setSubmitStatus('error')
            setFeedbackMessage('Укажите корректную дату окончания')
            return
          }
          expiresAt = d.toISOString()
        } else if (expiryMode === 'clicks') {
          maxClicks = maxClicksParsed
        }
      }

      const longNorm = urlCheck.normalized ?? url.trim()
      const result = await shortenUrlMock(
        {
          longUrl: longNorm,
          alias: hasAdvanced && alias.trim() ? alias.trim() : null,
          expiresAt,
          maxClicks,
          status: linkActiveSwitch ? 'active' : 'draft',
          ogTitle: hasAdvanced ? ogTitle : null,
          ogDescription: hasAdvanced ? ogDescription : null,
          ogImageUrl: hasAdvanced ? ogImageUrl : null,
        },
        links,
        { shortLinkPathSegment: generalSettings.shortLinkPathSegment },
      )

      if (!result.ok) {
        setSubmitStatus('error')
        setFeedbackMessage(result.error)
        return
      }

      onRecordCreated(result.record)
      setSubmitStatus('success')
      setFeedbackMessage('Ссылка создана и добавлена в историю.')
      setButtonSuccessFlash(true)
      window.setTimeout(() => setButtonSuccessFlash(false), 2000)

      automationUrlRef.current = null
      setUrl('')
      setAlias('')
      setOgTitle('')
      setOgDescription('')
      setOgImageUrl('')
      setExpiryLocal('')
      setExpiryMode('none')
      setMaxClicksInput('100')
      setHasAdvanced(generalSettings.openAdvancedByDefault)
      setLinkActiveSwitch(generalSettings.defaultStatus === 'active')

      window.setTimeout(() => {
        setSubmitStatus('idle')
        setFeedbackMessage(null)
      }, 4500)
    },
    [
      urlCheck,
      aliasInvalid,
      hasAdvanced,
      expiryInvalid,
      expiryMode,
      expiryLocal,
      maxClicksParsed,
      alias,
      linkActiveSwitch,
      ogTitle,
      ogDescription,
      ogImageUrl,
      links,
      onRecordCreated,
      generalSettings.openAdvancedByDefault,
      generalSettings.defaultStatus,
      generalSettings.shortLinkPathSegment,
    ],
  )

  const model: LinkBuilderShortenFormModel = {
    formRef,
    scrollToForm,
    url,
    setUrl,
    alias,
    setAlias,
    hasAdvanced,
    setHasAdvanced,
    expiryMode,
    setExpiryMode,
    expiryLocal,
    setExpiryLocal,
    maxClicksInput,
    setMaxClicksInput,
    ogTitle,
    setOgTitle,
    ogDescription,
    setOgDescription,
    ogImageUrl,
    setOgImageUrl,
    linkActiveSwitch,
    setLinkActiveSwitch,
    submitStatus,
    feedbackMessage,
    urlInvalid,
    urlMessage,
    aliasInvalid,
    aliasMessage,
    expiryInvalid,
    shortenDisabled,
    buttonSuccessFlash,
    handleSubmit,
  }
  return model
}
