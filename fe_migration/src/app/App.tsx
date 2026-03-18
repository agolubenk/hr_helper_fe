import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ToastProvider } from '@/components/Toast/ToastContext'
import AppLayout from '@/components/AppLayout'
import { HomePage } from '@/app/pages/HomePage'
import { WorkflowPage } from '@/app/pages/WorkflowPage'
import { AIChatPage } from '@/app/pages/AIChatPage'
import { HuntflowPage } from '@/app/pages/HuntflowPage'
import { CalendarPage } from '@/app/pages/CalendarPage'
import { SearchPage } from '@/app/pages/SearchPage'
import { InterviewersPage } from '@/app/pages/InterviewersPage'
import { CandidateResponsesPage } from '@/app/pages/CandidateResponsesPage'
import { VacanciesPage } from '@/app/pages/VacanciesPage'
import { VacancyDetailRedirect } from '@/app/pages/VacancyDetailRedirect'
import { VacancyEditRedirect } from '@/app/pages/VacancyEditRedirect'
import { SalaryRangesPage } from '@/app/pages/SalaryRangesPage'
import { SalaryRangeDetailRedirect } from '@/app/pages/SalaryRangeDetailRedirect'
import { HiringRequestsPage } from '@/app/pages/HiringRequestsPage'
import { InvitesPage } from '@/app/pages/InvitesPage'
import { InviteDetailRedirect } from '@/app/pages/InviteDetailRedirect'
import { InviteEditRedirect } from '@/app/pages/InviteEditRedirect'
import FinanceSettingsPage from '@/app/pages/FinanceSettingsPage'
import BenchmarksPage from '@/app/pages/BenchmarksPage'
import { WikiPage } from '@/app/pages/WikiPage'
import { WikiDetailPage } from '@/app/pages/WikiDetailPage'
import { WikiEditPage } from '@/app/pages/WikiEditPage'
import { WikiNewPage } from '@/app/pages/WikiNewPage'
import { WikiNewDetailPage } from '@/app/pages/WikiNewDetailPage'
import { WikiNewEditPage } from '@/app/pages/WikiNewEditPage'
import { Error404Page } from '@/app/pages/Error404Page'
import { LoginPage } from '@/app/pages/LoginPage'
import { ForgotPasswordPage } from '@/app/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/app/pages/ResetPasswordPage'
import { ProfilePage } from '@/app/pages/ProfilePage'
import { Error401Page } from '@/app/pages/Error401Page'
import { Error402Page } from '@/app/pages/Error402Page'
import { Error500Page } from '@/app/pages/Error500Page'
import { ForbiddenPage } from '@/app/pages/ForbiddenPage'
import { AdminLayoutShell } from '@/app/layouts/AdminLayoutShell'
import { SpecializationsLayoutShell } from '@/app/layouts/SpecializationsLayoutShell'
import { SpecializationIdLayoutShell } from '@/app/layouts/SpecializationIdLayoutShell'

const layoutProps = {
  pageTitle: 'HR Helper',
  userName: 'Голубенко Андрей',
  onLogout: () => console.log('Выход из системы'),
}

/** Редирект /admin-crm → /admin и /admin-crm/* → /admin/* с сохранением пути */
function RedirectAdminCrm() {
  const location = useLocation()
  const newPath = location.pathname.replace(/^\/admin-crm/, '/admin')
  return <Navigate to={newPath + location.search} replace />
}

function Placeholder({ text }: { text: string }) {
  return (
    <div style={{ padding: 24, color: 'var(--gray-11)', fontSize: 14 }}>
      {text}
    </div>
  )
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout {...layoutProps}><HomePage /></AppLayout>} />
            <Route path="/workflow" element={<AppLayout {...layoutProps} pageTitle="Workflow"><WorkflowPage /></AppLayout>} />
            <Route path="/aichat" element={<AppLayout {...layoutProps} pageTitle="AI Chat"><AIChatPage /></AppLayout>} />
            <Route path="/huntflow" element={<AppLayout {...layoutProps} pageTitle="Huntflow"><HuntflowPage /></AppLayout>} />
            <Route path="/calendar" element={<AppLayout {...layoutProps} pageTitle="Календарь"><CalendarPage /></AppLayout>} />
            <Route path="/search" element={<AppLayout {...layoutProps} pageTitle="Поиск"><SearchPage /></AppLayout>} />
            <Route path="/interviewers" element={<AppLayout {...layoutProps} pageTitle="Интервьюеры"><InterviewersPage /></AppLayout>} />
            <Route path="/candidate-responses" element={<AppLayout {...layoutProps} pageTitle="Ответы кандидатам"><CandidateResponsesPage /></AppLayout>} />
            <Route path="/vacancies" element={<AppLayout {...layoutProps} pageTitle="Вакансии"><VacanciesPage /></AppLayout>} />
            <Route path="/vacancies/:id/edit" element={<VacancyEditRedirect />} />
            <Route path="/vacancies/:id" element={<VacancyDetailRedirect />} />
            <Route path="/vacancies/salary-ranges" element={<AppLayout {...layoutProps} pageTitle="Зарплатные вилки"><SalaryRangesPage /></AppLayout>} />
            <Route path="/vacancies/salary-ranges/:id" element={<SalaryRangeDetailRedirect />} />
            <Route path="/hiring-requests" element={<AppLayout {...layoutProps} pageTitle="Заявки"><HiringRequestsPage /></AppLayout>} />
            <Route path="/invites" element={<AppLayout {...layoutProps} pageTitle="Интервью"><InvitesPage /></AppLayout>} />
            <Route path="/invites/:id/edit" element={<InviteEditRedirect />} />
            <Route path="/invites/:id" element={<InviteDetailRedirect />} />
            <Route path="/account/login" element={<LoginPage />} />
            <Route path="/account/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/account/reset-password" element={<ResetPasswordPage />} />
            <Route path="/account/profile" element={<AppLayout {...layoutProps}><ProfilePage /></AppLayout>} />
            <Route path="/finance" element={<Navigate to="/company-settings/finance" replace />} />
            <Route path="/company-settings/finance" element={<AppLayout {...layoutProps} pageTitle="Финансы"><FinanceSettingsPage /></AppLayout>} />
            <Route path="/finance/benchmarks" element={<AppLayout {...layoutProps} pageTitle="Бенчмарки зарплат"><BenchmarksPage /></AppLayout>} />
            <Route path="/wiki" element={<AppLayout {...layoutProps} pageTitle="Wiki"><WikiPage /></AppLayout>} />
            <Route path="/wiki/:id" element={<AppLayout {...layoutProps} pageTitle="Wiki"><WikiDetailPage /></AppLayout>} />
            <Route path="/wiki/:id/edit" element={<AppLayout {...layoutProps} pageTitle="Wiki"><WikiEditPage /></AppLayout>} />
            <Route path="/wiki-new" element={<AppLayout {...layoutProps} pageTitle="База знаний (новый вариант)"><WikiNewPage /></AppLayout>} />
            <Route path="/wiki-new/:id" element={<AppLayout {...layoutProps} pageTitle="База знаний"><WikiNewDetailPage /></AppLayout>} />
            <Route path="/wiki-new/:id/edit" element={<AppLayout {...layoutProps} pageTitle="Редактирование"><WikiNewEditPage /></AppLayout>} />
            <Route path="/admin-crm" element={<Navigate to="/admin" replace />} />
            <Route path="/admin-crm/*" element={<RedirectAdminCrm />} />
            <Route path="/admin" element={<AdminLayoutShell />}>
              <Route index element={<Placeholder text="Главная админки" />} />
              <Route path="*" element={<Placeholder text="Раздел в разработке" />} />
            </Route>
            <Route path="/specializations" element={<SpecializationsLayoutShell />}>
              <Route index element={<Placeholder text="Выберите специализацию" />} />
              <Route path=":id" element={<SpecializationIdLayoutShell />}>
                <Route index element={<Placeholder text="Основная информация" />} />
                <Route path="*" element={<Placeholder text="Раздел в разработке" />} />
              </Route>
            </Route>
            <Route path="/errors/401" element={<Error401Page />} />
            <Route path="/errors/402" element={<Error402Page />} />
            <Route path="/errors/403" element={<ForbiddenPage />} />
            <Route path="/errors/forbidden" element={<ForbiddenPage />} />
            <Route path="/errors/500" element={<Error500Page />} />
            <Route path="*" element={<Error404Page />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}
