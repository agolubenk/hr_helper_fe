'use client'

import { Button, Flex } from '@radix-ui/themes'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { useLocation, useNavigate } from '@/router-adapter'
import {
  RECRUITING_HUB_PATH,
  type RecruitingNavigationState,
} from '@/components/company-settings/recruiting/recruitingNavState'
import styles from './RecruitingSubpageBackBar.module.css'

/**
 * Единая кнопка «Обратно» для дочерних страниц ветки рекрутинга.
 * Логика: см. docs/RECRUITING_SETTINGS_UX_PLAN_2026-03-24.md
 */
export function RecruitingSubpageBackBar() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    const state = location.state as RecruitingNavigationState | null | undefined
    if (state?.recruitingFrom) {
      navigate(state.recruitingFrom)
      return
    }
    if (typeof window !== 'undefined' && window.history.length <= 1) {
      navigate(RECRUITING_HUB_PATH)
      return
    }
    navigate(-1)
  }

  return (
    <Flex className={styles.bar}>
      <Button type="button" variant="soft" color="gray" size="2" onClick={handleBack}>
        <ArrowLeftIcon width={14} height={14} />
        Обратно
      </Button>
    </Flex>
  )
}
