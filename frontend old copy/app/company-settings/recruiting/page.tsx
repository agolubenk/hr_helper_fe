'use client'

import AppLayout from '@/components/AppLayout'
import { RecruitingSettingsHub } from '@/components/company-settings/RecruitingSettingsHub'

export default function CompanySettingsRecruitingPage() {
  return (
    <AppLayout pageTitle="Рекрутинг">
      <RecruitingSettingsHub />
    </AppLayout>
  )
}
