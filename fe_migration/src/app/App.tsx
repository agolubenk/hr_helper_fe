import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ToastProvider } from '@/components/Toast/ToastContext'
import AppLayout from '@/components/AppLayout'
import { HomePage } from '@/app/pages/HomePage'
import { WorkflowPage } from '@/app/pages/WorkflowPage'
import { AIChatPage } from '@/app/pages/AIChatPage'
import { HuntflowPage } from '@/app/pages/HuntflowPage'
import { CalendarPage } from '@/app/pages/CalendarPage'
import { CalendarSettingsPage } from '@/app/pages/CalendarSettingsPage'
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
import BenchmarksDashboardPage from '@/app/pages/BenchmarksDashboardPage'
import { WikiPage } from '@/app/pages/WikiPage'
import { WikiDetailPage } from '@/app/pages/WikiDetailPage'
import { WikiEditPage } from '@/app/pages/WikiEditPage'
import { WikiNewPage } from '@/app/pages/WikiNewPage'
import { WikiNewDetailPage } from '@/app/pages/WikiNewDetailPage'
import { WikiNewEditPage } from '@/app/pages/WikiNewEditPage'
import { ReportingPage } from '@/app/pages/ReportingPage'
import { CompanyReportPage } from '@/app/pages/CompanyReportPage'
import { HiringPlanPage } from '@/app/pages/HiringPlanPage'
import { YearlyHiringPlanPage } from '@/app/pages/YearlyHiringPlanPage'
import { TelegramPage } from '@/app/pages/TelegramPage'
import { Telegram2FAPage } from '@/app/pages/Telegram2FAPage'
import { TelegramChatsPage } from '@/app/pages/TelegramChatsPage'
import { ProjectsPage } from '@/app/pages/ProjectsPage'
import { ProjectDetailPage } from '@/app/pages/ProjectDetailPage'
import { ProjectsTeamsPage } from '@/app/pages/ProjectsTeamsPage'
import { ProjectsResourcesPage } from '@/app/pages/ProjectsResourcesPage'
import { InternalSitePage } from '@/app/pages/InternalSitePage'
import { InternalSitePostDetailPage } from '@/app/pages/InternalSitePostDetailPage'
import { InternalSitePostEditPage } from '@/app/pages/InternalSitePostEditPage'
import { ModulesSettingsPage } from '@/app/pages/ModulesSettingsPage'
import { LocalizationSettingsPage } from '@/app/pages/LocalizationSettingsPage'
import { SandboxSettingsPage } from '@/app/pages/SandboxSettingsPage'
import { GatewaysSettingsPage } from '@/app/pages/GatewaysSettingsPage'
import { OutboundIntegrationsPage } from '@/app/pages/OutboundIntegrationsPage'
import { TasksPage } from '@/app/pages/TasksPage'
import { MeetHomePage } from '@/app/pages/meet/MeetHomePage'
import { MeetNewLinksPage } from '@/app/pages/meet/MeetNewLinksPage'
import { MeetRoomPage } from '@/app/pages/meet/MeetRoomPage'
import { MeetHistoryPage } from '@/app/pages/meet/MeetHistoryPage'
import { MeetUpcomingPage } from '@/app/pages/meet/MeetUpcomingPage'
import { MeetArchivePage } from '@/app/pages/meet/MeetArchivePage'
import { CodingPlatformHomePage } from '@/app/pages/coding-platform/CodingPlatformHomePage'
import { CodingPlatformLanguagesPage } from '@/app/pages/coding-platform/CodingPlatformLanguagesPage'
import { CodingPlatformPlaygroundPage } from '@/app/pages/coding-platform/CodingPlatformPlaygroundPage'
import { CodingPlatformLinkBuilderPage } from '@/app/pages/coding-platform/CodingPlatformLinkBuilderPage'
import { LearningFeedbackPage } from '@/app/pages/LearningFeedbackPage'
import { SettingsSecurityUsersPage } from '@/app/pages/settings-security/SettingsSecurityUsersPage'
import { SettingsSecurityRolesPage } from '@/app/pages/settings-security/SettingsSecurityRolesPage'
import { SettingsSecurityPermissionsPage } from '@/app/pages/settings-security/SettingsSecurityPermissionsPage'
import { SettingsSecurityGroupsPage } from '@/app/pages/settings-security/SettingsSecurityGroupsPage'
import { mockProjectDetails } from '@/app/pages/projectsMocks'
import { useParams } from '@/router-adapter'
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
import { SpecializationsRootPage } from '@/app/pages/SpecializationsRootPage'
import { SpecializationIdRedirectPage } from '@/app/pages/SpecializationIdRedirectPage'
import { SpecializationInfoPage } from '@/app/pages/SpecializationInfoPage'
import { SpecializationGradesPage } from '@/app/pages/SpecializationGradesPage'
import { SpecializationMatrixPage } from '@/app/pages/SpecializationMatrixPage'
import { SpecializationCareerPage } from '@/app/pages/SpecializationCareerPage'
import { SpecializationVacanciesPage } from '@/app/pages/SpecializationVacanciesPage'
import { SpecializationAllocationPage } from '@/app/pages/SpecializationAllocationPage'
import { SpecializationPreviewPage } from '@/app/pages/SpecializationPreviewPage'
import { AdminPage } from '@/app/pages/AdminPage'
import { AdminUsersPage } from '@/app/pages/AdminUsersPage'
import { AdminGroupsPage } from '@/app/pages/AdminGroupsPage'
import {
  AtsIndexPage,
  AtsCandidatePage,
  AtsAssessmentNewPage,
  AtsAssessmentViewPage,
  AtsAssessmentEditPage,
} from '@/features/ats'
import {
  CompanySettingsPage,
  CompanySettingsOrgStructurePage,
  CompanySettingsGradesPage,
  CompanySettingsRatingScalesPage,
  CompanySettingsEmployeeLifecyclePage,
  CompanySettingsIntegrationsPage,
  CompanySettingsUserGroupsPage,
  CompanySettingsUsersPage,
  CompanySettingsRecruitingRulesPage,
  CompanySettingsRecruitingStagesPage,
  CompanySettingsRecruitingCommandsPage,
  CompanySettingsCandidateFieldsPage,
  CompanySettingsVacancyFieldsPage,
  CompanySettingsScorecardPage,
  CompanySettingsSlaPage,
  CompanySettingsVacancyPromptPage,
  CompanySettingsRecruitingOfferTemplatePage,
  CompanySettingsRecruitingTemplatesPage,
  CompanySettingsRecruitingResponseTemplatesPage,
  CompanySettingsRecruitingMessageTemplatesPage,
} from '@/app/pages/CompanySettingsPages'
import { ModulePlaceholderPage } from '@/app/pages/ModulePlaceholderPage'
import { RecruitingSettingsHub } from '@/components/company-settings/recruiting/RecruitingSettingsHub'
import { CompanyListsSettings } from '@/components/company-settings/recruiting/CompanyListsSettings'

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

/** Заголовок в шапке = имя проекта (как в Next AppLayout pageTitle). */
function ProjectDetailAppLayout() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : ''
  const project = id ? mockProjectDetails[id] : undefined
  const pageTitle = project?.name ?? 'Проект'
  return (
    <AppLayout {...layoutProps} pageTitle={pageTitle}>
      <ProjectDetailPage />
    </AppLayout>
  )
}

/** Обертка: AppLayout + заглушка для маршрутов из меню без своей страницы */
function AppModulePlaceholder({ pageTitle }: { pageTitle: string }) {
  return (
    <AppLayout {...layoutProps} pageTitle={pageTitle}>
      <ModulePlaceholderPage />
    </AppLayout>
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
            <Route path="/calendar/settings" element={<AppLayout {...layoutProps} pageTitle="Настройки календаря"><CalendarSettingsPage /></AppLayout>} />
            <Route path="/tasks" element={<AppLayout {...layoutProps} pageTitle="Задачи"><TasksPage /></AppLayout>} />
            <Route path="/meet/new-links" element={<AppLayout {...layoutProps} pageTitle="Миты — новые ссылки"><MeetNewLinksPage /></AppLayout>} />
            <Route path="/meet/room" element={<AppLayout {...layoutProps} pageTitle="Мит"><MeetRoomPage /></AppLayout>} />
            <Route path="/meet/history" element={<AppLayout {...layoutProps} pageTitle="Миты — история"><MeetHistoryPage /></AppLayout>} />
            <Route path="/meet/upcoming" element={<AppLayout {...layoutProps} pageTitle="Миты — предстоящие"><MeetUpcomingPage /></AppLayout>} />
            <Route path="/meet/archive" element={<AppLayout {...layoutProps} pageTitle="Миты — архивы"><MeetArchivePage /></AppLayout>} />
            <Route path="/meet" element={<AppLayout {...layoutProps} pageTitle="Внутренние миты"><MeetHomePage /></AppLayout>} />
            <Route
              path="/coding-platform/languages"
              element={
                <AppLayout {...layoutProps} pageTitle="Кодинговая платформа — языки">
                  <CodingPlatformLanguagesPage />
                </AppLayout>
              }
            />
            <Route
              path="/coding-platform/playground"
              element={
                <AppLayout {...layoutProps} pageTitle="Кодинговая платформа — песочница">
                  <CodingPlatformPlaygroundPage />
                </AppLayout>
              }
            />
            <Route
              path="/coding-platform/link-builder"
              element={
                <AppLayout {...layoutProps} pageTitle="Кодинговая платформа — Link-билдер">
                  <CodingPlatformLinkBuilderPage />
                </AppLayout>
              }
            />
            <Route
              path="/coding-platform"
              element={
                <AppLayout {...layoutProps} pageTitle="Кодинговая платформа">
                  <CodingPlatformHomePage />
                </AppLayout>
              }
            />
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
            <Route path="/account/profile" element={<AppLayout {...layoutProps} pageTitle="Профиль"><ProfilePage /></AppLayout>} />
            <Route path="/finance" element={<Navigate to="/company-settings/finance" replace />} />
            <Route path="/company-settings" element={<AppLayout {...layoutProps} pageTitle="Общие настройки компании"><CompanySettingsPage /></AppLayout>} />
            <Route path="/company-settings/org-structure" element={<AppLayout {...layoutProps} pageTitle="Оргструктура"><CompanySettingsOrgStructurePage /></AppLayout>} />
            <Route path="/company-settings/grades" element={<AppLayout {...layoutProps} pageTitle="Настройки грейдов"><CompanySettingsGradesPage /></AppLayout>} />
            <Route path="/company-settings/rating-scales" element={<AppLayout {...layoutProps} pageTitle="Шкалы оценок"><CompanySettingsRatingScalesPage /></AppLayout>} />
            <Route path="/company-settings/employee-lifecycle" element={<AppLayout {...layoutProps} pageTitle="Жизненный цикл сотрудников"><CompanySettingsEmployeeLifecyclePage /></AppLayout>} />
            <Route path="/company-settings/finance" element={<AppLayout {...layoutProps} pageTitle="Финансы"><FinanceSettingsPage /></AppLayout>} />
            <Route path="/company-settings/integrations" element={<AppLayout {...layoutProps} pageTitle="Интеграции"><CompanySettingsIntegrationsPage /></AppLayout>} />
            <Route path="/company-settings/user-groups" element={<AppLayout {...layoutProps} pageTitle="Группы пользователей"><CompanySettingsUserGroupsPage /></AppLayout>} />
            <Route path="/company-settings/users" element={<AppLayout {...layoutProps} pageTitle="Пользователи"><CompanySettingsUsersPage /></AppLayout>} />
            <Route
              path="/company-settings/recruiting"
              element={
                <AppLayout {...layoutProps} pageTitle="Рекрутинг">
                  <RecruitingSettingsHub />
                </AppLayout>
              }
            />
            <Route path="/company-settings/recruiting/rules" element={<AppLayout {...layoutProps} pageTitle="Правила привлечения"><CompanySettingsRecruitingRulesPage /></AppLayout>} />
            <Route path="/company-settings/recruiting/stages" element={<AppLayout {...layoutProps} pageTitle="Этапы найма и причины отказа"><CompanySettingsRecruitingStagesPage /></AppLayout>} />
            <Route path="/company-settings/recruiting/commands" element={<AppLayout {...layoutProps} pageTitle="Команды workflow"><CompanySettingsRecruitingCommandsPage /></AppLayout>} />
            <Route path="/company-settings/recruiting/candidate-fields" element={<AppLayout {...layoutProps} pageTitle="Поля кандидатов"><CompanySettingsCandidateFieldsPage /></AppLayout>} />
            <Route path="/company-settings/recruiting/vacancy-fields" element={<AppLayout {...layoutProps} pageTitle="Поля вакансий"><CompanySettingsVacancyFieldsPage /></AppLayout>} />
            <Route path="/company-settings/candidate-fields" element={<Navigate to="/company-settings/recruiting/candidate-fields" replace />} />
            <Route path="/company-settings/vacancy-fields" element={<Navigate to="/company-settings/recruiting/vacancy-fields" replace />} />
            <Route path="/company-settings/scorecard" element={<Navigate to="/company-settings/Scorecard" replace />} />
            <Route path="/company-settings/Scorecard" element={<AppLayout {...layoutProps} pageTitle="Настройки Scorecard"><CompanySettingsScorecardPage /></AppLayout>} />
            <Route path="/company-settings/sla" element={<AppLayout {...layoutProps} pageTitle="SLA для вакансий"><CompanySettingsSlaPage /></AppLayout>} />
            <Route path="/company-settings/vacancy-prompt" element={<AppLayout {...layoutProps} pageTitle="Промпт для вакансий"><CompanySettingsVacancyPromptPage /></AppLayout>} />
            <Route path="/company-settings/recruiting/offer-template" element={<AppLayout {...layoutProps} pageTitle="Шаблон оффера"><CompanySettingsRecruitingOfferTemplatePage /></AppLayout>} />
            <Route path="/company-settings/recruiting/templates" element={<AppLayout {...layoutProps} pageTitle="Шаблоны рекрутинга"><CompanySettingsRecruitingTemplatesPage /></AppLayout>} />
            <Route path="/company-settings/recruiting/response-templates" element={<AppLayout {...layoutProps} pageTitle="Шаблоны ответов кандидатам"><CompanySettingsRecruitingResponseTemplatesPage /></AppLayout>} />
            <Route path="/company-settings/recruiting/message-templates" element={<AppLayout {...layoutProps} pageTitle="Шаблоны писем и сообщений"><CompanySettingsRecruitingMessageTemplatesPage /></AppLayout>} />
            <Route
              path="/company-settings/recruiting/company-blacklist"
              element={
                <AppLayout {...layoutProps} pageTitle="Черный список компаний">
                  <CompanyListsSettings kind="blacklist" />
                </AppLayout>
              }
            />
            <Route
              path="/company-settings/recruiting/company-whitelist-donors"
              element={
                <AppLayout {...layoutProps} pageTitle="Белый список компаний / доноры">
                  <CompanyListsSettings kind="whitelist-donors" />
                </AppLayout>
              }
            />
            <Route path="/company-settings/finance/benchmarks" element={<AppLayout {...layoutProps} pageTitle="Бенчмарки — обзор"><BenchmarksDashboardPage /></AppLayout>} />
            <Route
              path="/company-settings/system/localization"
              element={
                <AppLayout {...layoutProps} pageTitle="Локализация и переводы">
                  <LocalizationSettingsPage />
                </AppLayout>
              }
            />
            <Route
              path="/company-settings/system/gateways"
              element={
                <AppLayout {...layoutProps} pageTitle="Почта и мессенджер-шлюзы">
                  <GatewaysSettingsPage />
                </AppLayout>
              }
            />
            <Route
              path="/company-settings/system/outbound"
              element={
                <AppLayout {...layoutProps} pageTitle="Исходящие API и вебхуки">
                  <OutboundIntegrationsPage />
                </AppLayout>
              }
            />
            <Route
              path="/company-settings/system/sandbox"
              element={
                <AppLayout {...layoutProps} pageTitle="Песочница / стенд">
                  <SandboxSettingsPage />
                </AppLayout>
              }
            />
            <Route
              path="/company-settings/*"
              element={<AppModulePlaceholder pageTitle="Настройки компании" />}
            />
            <Route path="/finance/benchmarks" element={<AppLayout {...layoutProps} pageTitle="Бенчмарки — обзор"><BenchmarksDashboardPage /></AppLayout>} />
            <Route path="/finance/benchmarks/all" element={<AppLayout {...layoutProps} pageTitle="Все бенчмарки"><BenchmarksPage /></AppLayout>} />
            <Route path="/wiki" element={<AppLayout {...layoutProps} pageTitle="Wiki"><WikiPage /></AppLayout>} />
            <Route path="/wiki/:id" element={<AppLayout {...layoutProps} pageTitle="Wiki"><WikiDetailPage /></AppLayout>} />
            <Route path="/wiki/:id/edit" element={<AppLayout {...layoutProps} pageTitle="Wiki"><WikiEditPage /></AppLayout>} />
            <Route path="/wiki-new" element={<AppLayout {...layoutProps} pageTitle="База знаний (новый вариант)"><WikiNewPage /></AppLayout>} />
            <Route path="/wiki-new/:id" element={<AppLayout {...layoutProps} pageTitle="База знаний"><WikiNewDetailPage /></AppLayout>} />
            <Route path="/wiki-new/:id/edit" element={<AppLayout {...layoutProps} pageTitle="Редактирование"><WikiNewEditPage /></AppLayout>} />
            <Route path="/reporting" element={<AppLayout {...layoutProps} pageTitle="Отчетность"><ReportingPage /></AppLayout>} />
            <Route path="/reporting/company" element={<AppLayout {...layoutProps} pageTitle="Отчет по компании"><CompanyReportPage /></AppLayout>} />
            <Route path="/reporting/hiring-plan" element={<AppLayout {...layoutProps} pageTitle="План найма"><HiringPlanPage /></AppLayout>} />
            <Route path="/reporting/hiring-plan/yearly" element={<AppLayout {...layoutProps} pageTitle="План найма (год)"><YearlyHiringPlanPage /></AppLayout>} />
            <Route path="/reporting/*" element={<AppModulePlaceholder pageTitle="Отчётность" />} />
            <Route path="/telegram" element={<AppLayout {...layoutProps} pageTitle="Telegram"><TelegramPage /></AppLayout>} />
            <Route path="/telegram/2fa" element={<AppLayout {...layoutProps} pageTitle="Telegram — 2FA"><Telegram2FAPage /></AppLayout>} />
            <Route path="/telegram/chats" element={<AppLayout {...layoutProps} pageTitle="Telegram — Чаты"><TelegramChatsPage /></AppLayout>} />
            <Route path="/projects/teams" element={<AppLayout {...layoutProps} pageTitle="Команды проектов"><ProjectsTeamsPage /></AppLayout>} />
            <Route path="/projects/resources" element={<AppLayout {...layoutProps} pageTitle="Ресурсы и аллокация"><ProjectsResourcesPage /></AppLayout>} />
            <Route path="/projects/hr" element={<AppModulePlaceholder pageTitle="HR‑проекты" />} />
            <Route path="/projects/:id" element={<ProjectDetailAppLayout />} />
            <Route path="/projects" element={<AppLayout {...layoutProps} pageTitle="Проекты"><ProjectsPage /></AppLayout>} />
            <Route path="/ats" element={<AppLayout {...layoutProps} pageTitle="ATS"><AtsIndexPage /></AppLayout>} />
            <Route
              path="/ats/vacancy/:vacancyId/candidate/:candidateId/assessment/new"
              element={<AppLayout {...layoutProps} pageTitle="ATS"><AtsAssessmentNewPage /></AppLayout>}
            />
            <Route
              path="/ats/vacancy/:vacancyId/candidate/:candidateId/assessment/:assessmentId/edit"
              element={<AppLayout {...layoutProps} pageTitle="ATS"><AtsAssessmentEditPage /></AppLayout>}
            />
            <Route
              path="/ats/vacancy/:vacancyId/candidate/:candidateId/assessment/:assessmentId"
              element={<AppLayout {...layoutProps} pageTitle="ATS"><AtsAssessmentViewPage /></AppLayout>}
            />
            <Route
              path="/ats/vacancy/:vacancyId/candidate/:candidateId"
              element={<AppLayout {...layoutProps} pageTitle="ATS"><AtsCandidatePage /></AppLayout>}
            />
            <Route
              path="/ats/vacancy/:vacancyId"
              element={<AppLayout {...layoutProps} pageTitle="ATS"><AtsCandidatePage /></AppLayout>}
            />
            <Route path="/admin-crm" element={<Navigate to="/admin" replace />} />
            <Route path="/admin-crm/*" element={<RedirectAdminCrm />} />
            <Route path="/admin" element={<AdminLayoutShell />}>
              <Route index element={<AdminPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="groups" element={<AdminGroupsPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
            <Route path="/specializations" element={<SpecializationsLayoutShell />}>
              <Route index element={<SpecializationsRootPage />} />
              <Route path=":id" element={<SpecializationIdLayoutShell />}>
                <Route index element={<SpecializationIdRedirectPage />} />
                <Route path="info" element={<SpecializationInfoPage />} />
                <Route path="grades" element={<SpecializationGradesPage />} />
                <Route path="matrix" element={<SpecializationMatrixPage />} />
                <Route path="career" element={<SpecializationCareerPage />} />
                <Route path="vacancies" element={<SpecializationVacanciesPage />} />
                <Route path="allocation" element={<SpecializationAllocationPage />} />
                <Route path="preview" element={<SpecializationPreviewPage />} />
                <Route path="*" element={<Navigate to="info" replace />} />
              </Route>
            </Route>
            <Route path="/onboarding" element={<AppModulePlaceholder pageTitle="Онбординг" />} />
            <Route path="/onboarding/*" element={<AppModulePlaceholder pageTitle="Онбординг" />} />
            <Route path="/hr-services/*" element={<AppModulePlaceholder pageTitle="HROps" />} />
            <Route path="/employees" element={<AppModulePlaceholder pageTitle="Сотрудники" />} />
            <Route path="/employees/*" element={<AppModulePlaceholder pageTitle="Сотрудники" />} />
            <Route path="/internal-vacancies" element={<AppModulePlaceholder pageTitle="Внутренние вакансии" />} />
            <Route
              path="/learning/feedback"
              element={
                <AppLayout {...layoutProps} pageTitle="L&D — обратная связь">
                  <LearningFeedbackPage />
                </AppLayout>
              }
            />
            <Route path="/learning/*" element={<AppModulePlaceholder pageTitle="L&D" />} />
            <Route path="/performance/*" element={<AppModulePlaceholder pageTitle="Эффективность" />} />
            <Route path="/compensation/*" element={<AppModulePlaceholder pageTitle="C&B" />} />
            <Route path="/internal-site" element={<AppLayout {...layoutProps} pageTitle="Внутренний сайт"><InternalSitePage /></AppLayout>} />
            <Route path="/internal-site/post/create" element={<AppLayout {...layoutProps} pageTitle="Создать пост"><InternalSitePostEditPage /></AppLayout>} />
            <Route path="/internal-site/post/:slug/edit" element={<AppLayout {...layoutProps} pageTitle="Редактировать пост"><InternalSitePostEditPage /></AppLayout>} />
            <Route path="/internal-site/post/:slug" element={<AppLayout {...layoutProps} pageTitle="Пост"><InternalSitePostDetailPage /></AppLayout>} />
            <Route path="/internal-site/*" element={<AppLayout {...layoutProps} pageTitle="Внутренний сайт"><InternalSitePage /></AppLayout>} />
            <Route path="/hr-pr/*" element={<AppModulePlaceholder pageTitle="HR PR" />} />
            <Route path="/analytics" element={<AppModulePlaceholder pageTitle="Аналитика" />} />
            <Route
              path="/settings/modules"
              element={
                <AppLayout {...layoutProps} pageTitle="Модули (вкл/выкл)">
                  <ModulesSettingsPage />
                </AppLayout>
              }
            />
            <Route
              path="/settings/users/new"
              element={
                <AppLayout {...layoutProps} pageTitle="Пользователи — безопасность">
                  <SettingsSecurityUsersPage />
                </AppLayout>
              }
            />
            <Route
              path="/settings/users"
              element={
                <AppLayout {...layoutProps} pageTitle="Пользователи — безопасность">
                  <SettingsSecurityUsersPage />
                </AppLayout>
              }
            />
            <Route
              path="/settings/roles"
              element={
                <AppLayout {...layoutProps} pageTitle="Роли и права (RBAC)">
                  <SettingsSecurityRolesPage />
                </AppLayout>
              }
            />
            <Route
              path="/settings/permissions"
              element={
                <AppLayout {...layoutProps} pageTitle="Права доступа">
                  <SettingsSecurityPermissionsPage />
                </AppLayout>
              }
            />
            <Route
              path="/settings/user-groups"
              element={
                <AppLayout {...layoutProps} pageTitle="Группы пользователей">
                  <SettingsSecurityGroupsPage />
                </AppLayout>
              }
            />
            <Route path="/settings/*" element={<AppModulePlaceholder pageTitle="Настройки" />} />
            <Route path="/integrations/*" element={<AppModulePlaceholder pageTitle="Интеграции" />} />
            <Route path="/my-requests/*" element={<AppModulePlaceholder pageTitle="Мои заявки" />} />
            <Route path="/my-documents/*" element={<AppModulePlaceholder pageTitle="Мои документы" />} />
            <Route path="/errors/401" element={<Error401Page />} />
            <Route path="/errors/402" element={<Error402Page />} />
            <Route path="/errors/403" element={<ForbiddenPage />} />
            <Route path="/errors/forbidden" element={<Navigate to="/errors/403" replace />} />
            <Route path="/errors/500" element={<Error500Page />} />
            <Route path="*" element={<Error404Page />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}
