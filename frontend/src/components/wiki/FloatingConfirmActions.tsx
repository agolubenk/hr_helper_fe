'use client'

import { useState, useEffect } from 'react'
import { Flex, Button, Text } from '@radix-ui/themes'
import { TrashIcon, Cross2Icon, CheckIcon } from '@radix-ui/react-icons'
import styles from './FloatingConfirmActions.module.css'

const FLOATING_BAR_PADDING = 24
/** При ширине блока карточки действий меньше этого значения считаем режим «мобильным»: карточку скрываем, показываем только плавающие кнопки */
const ACTIONS_CARD_NARROW_THRESHOLD = 800

export interface FloatingConfirmActionsProps {
  /** id формы для кнопки submit (form="...") */
  formId: string
  onCancel: () => void
  onDelete: () => void
  isNew: boolean
  isSubmitting: boolean
  /** ref на карточку с кнопками действий: по её ширине определяется мобильный режим, для IntersectionObserver — анимация и скрытие панели */
  actionsCardRef: React.RefObject<HTMLDivElement | null>
  /** вызывается при смене «мобильного» режима (ширина карточки &lt;= порог), чтобы родитель мог скрыть карточку */
  onMobileModeChange?: (isMobile: boolean) => void
  /** вызывается при смене видимости панели (чтобы скрыть статические кнопки в карточке) */
  onVisibilityChange?: (visible: boolean) => void
  saveLabel?: string
  createLabel?: string
  submittingLabel?: string
}

const DEFAULT_SAVE_LABEL = 'Сохранить изменения'
const DEFAULT_CREATE_LABEL = 'Создать страницу'
const DEFAULT_SUBMITTING_LABEL = 'Сохранение...'

export function FloatingConfirmActions({
  formId,
  onCancel,
  onDelete,
  isNew,
  isSubmitting,
  actionsCardRef,
  onMobileModeChange,
  onVisibilityChange,
  saveLabel = DEFAULT_SAVE_LABEL,
  createLabel = DEFAULT_CREATE_LABEL,
  submittingLabel = DEFAULT_SUBMITTING_LABEL,
}: FloatingConfirmActionsProps) {
  const [actionsCardInView, setActionsCardInView] = useState(false)
  const [expansionRatio, setExpansionRatio] = useState(0)
  const [floatingBarRight, setFloatingBarRight] = useState(FLOATING_BAR_PADDING)
  /** Мобильный режим по ширине блока карточки действий (не по viewport) */
  const [isMobileMode, setIsMobileMode] = useState(false)

  // Позиция: привязка к правому краю контента (при открытии меню контент сужается)
  useEffect(() => {
    const contentEl = document.querySelector('[data-app-layout-content]') as HTMLElement | null
    if (!contentEl) return
    const updateRight = () => {
      const rect = contentEl.getBoundingClientRect()
      setFloatingBarRight(window.innerWidth - rect.right + FLOATING_BAR_PADDING)
    }
    updateRight()
    const resizeObserver = new ResizeObserver(updateRight)
    resizeObserver.observe(contentEl)
    return () => resizeObserver.disconnect()
  }, [])

  // Ширина блока карточки действий: при ширине <= порога считаем режим мобильным
  useEffect(() => {
    const el = actionsCardRef.current
    if (!el) return
    const updateMobile = () => {
      const width = el.getBoundingClientRect().width
      const mobile = width <= ACTIONS_CARD_NARROW_THRESHOLD
      setIsMobileMode(mobile)
      onMobileModeChange?.(mobile)
    }
    updateMobile()
    const resizeObserver = new ResizeObserver(updateMobile)
    resizeObserver.observe(el)
    return () => resizeObserver.disconnect()
  }, [actionsCardRef, onMobileModeChange])

  // Видимость карточки: ratio для анимации расширения кнопок, скрытие панели при полном входе карточки
  useEffect(() => {
    const el = actionsCardRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio
        setExpansionRatio(ratio)
        setActionsCardInView(ratio >= 0.99)
      },
      { rootMargin: '0px', threshold: [0, 0.25, 0.5, 0.75, 0.99, 1] }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [actionsCardRef])

  const visible = isMobileMode || !actionsCardInView

  useEffect(() => {
    onVisibilityChange?.(visible)
  }, [visible, onVisibilityChange])

  const submitLabel = isSubmitting ? submittingLabel : isNew ? createLabel : saveLabel

  // Когда блока карточки действий нет (скрыт в мобильном режиме), кнопки всегда в компактном виде (только иконки)
  const effectiveExpansion = isMobileMode ? 0 : expansionRatio

  if (!visible) return null

  return (
    <Flex
      gap="2"
      align="center"
      justify="end"
      className={styles.floatingActions}
      style={
        {
          '--expansion': effectiveExpansion,
          right: floatingBarRight,
        } as React.CSSProperties
      }
      aria-label="Быстрые действия"
    >
      {!isNew && (
        <Button
          type="button"
          size="3"
          variant="solid"
          radius="full"
          className={styles.floatingDelete}
          onClick={onDelete}
          disabled={isSubmitting}
          title="Удалить"
          aria-label="Удалить страницу"
        >
          <TrashIcon width={20} height={20} />
        </Button>
      )}
      <Flex gap="2" align="center" className={styles.floatingActionsGroup}>
        <Button
          type="button"
          size="3"
          variant="soft"
          radius="full"
          className={styles.floatingCancel}
          onClick={onCancel}
          disabled={isSubmitting}
          title="Отмена"
          aria-label="Отмена"
        >
          <span className={styles.floatingIcon} aria-hidden>
            <Cross2Icon width={22} height={22} />
          </span>
          <span className={styles.floatingLabel}>Отмена</span>
        </Button>
        <Button
          type="submit"
          form={formId}
          size="3"
          radius="full"
          className={styles.floatingSave}
          disabled={isSubmitting}
          title={submitLabel}
          aria-label={submitLabel}
        >
          <span className={styles.floatingIcon} aria-hidden>
            {isSubmitting ? <Text size="1">…</Text> : <CheckIcon width={22} height={22} />}
          </span>
          <span className={styles.floatingLabel}>{submitLabel}</span>
        </Button>
      </Flex>
    </Flex>
  )
}
