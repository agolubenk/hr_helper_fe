import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from '@tanstack/react-router'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './routes/home'
import { ProfilePage } from './routes/ProfilePage'
import { PlaceholderPage } from './routes/PlaceholderPage'
import { VacanciesPage } from '@/features/recruiting/vacancies/VacanciesPage'
import { HiringRequestsPage } from '@/features/recruiting/hiring-requests/HiringRequestsPage'
import { InvitesPage } from '@/features/recruiting/invites/InvitesPage'
import { CandidateResponsesPage } from '@/features/recruiting/candidate-responses/CandidateResponsesPage'
import { InterviewersPage } from '@/features/recruiting/interviewers/InterviewersPage'
import { HuntflowPage } from '@/features/recruiting/huntflow/HuntflowPage'
import { WorkflowPage } from '@/features/workflow/WorkflowPage'
import { BenchmarksPage } from '@/features/finance/benchmarks/BenchmarksPage'
import { ReportingDashboardPage } from '@/features/reporting/ReportingDashboardPage'
import { CompanyReportPage } from '@/features/reporting/CompanyReportPage'
import { HiringPlanPage } from '@/features/reporting/HiringPlanPage'
import { HiringPlanYearlyPage } from '@/features/reporting/HiringPlanYearlyPage'
import { SpecializationsLayout } from '@/features/specializations/SpecializationsLayout'
import { SpecializationsRootPage } from '@/features/specializations/pages/SpecializationsRootPage'
import { SpecializationInfoPage } from '@/features/specializations/pages/SpecializationInfoPage'
import { AIChatPage } from '@/features/ai/chat/AIChatPage'
import { RecruiterChatPage } from '@/features/ai/recruiter-chat/RecruiterChatPage'
import { RecrChatIndexPage } from '@/features/ai/recruiter-chat/RecrChatIndexPage'
import { RecrChatCandidatePage } from '@/features/ai/recruiter-chat/RecrChatCandidatePage'
import { TelegramPage } from '@/features/integrations/telegram/TelegramPage'
import CalendarPage from './routes/CalendarPage'
import CalendarSettingsPage from './routes/CalendarSettingsPage'
import { CompanySettingsPage } from './routes/CompanySettingsPage'
import { RecruitingStagesPage } from './routes/company-settings/RecruitingStagesPage'
import { RecruitingCommandsPage } from './routes/company-settings/RecruitingCommandsPage'
import { CandidateFieldsPage } from './routes/company-settings/CandidateFieldsPage'
import { ScorecardPage } from './routes/company-settings/ScorecardPage'
import { SLAPage } from './routes/company-settings/SLAPage'
import { VacancyPromptPage } from './routes/company-settings/VacancyPromptPage'
import { OrgStructurePage } from './routes/company-settings/OrgStructurePage'
import { GradesPage } from './routes/company-settings/GradesPage'
import { RatingScalesPage } from './routes/company-settings/RatingScalesPage'
import { EmployeeLifecyclePage } from './routes/company-settings/EmployeeLifecyclePage'
import { FinancePage } from './routes/company-settings/FinancePage'
import { IntegrationsPage } from './routes/company-settings/IntegrationsPage'
import { MeetingSettingsPage } from './routes/company-settings/MeetingSettingsPage'
import { CompanyCalendarPage } from './routes/company-settings/CompanyCalendarPage'
import { UserGroupsPage } from './routes/company-settings/UserGroupsPage'
import { UsersPage } from './routes/company-settings/UsersPage'
import { AdminLayout } from './layouts/AdminLayout'
import { AdminCompanyPage } from './routes/admin/AdminCompanyPage'
import { AdminCompanyOfficesPage } from './routes/admin/AdminCompanyOfficesPage'
import { AdminCompanySchemaPage } from './routes/admin/AdminCompanySchemaPage'
import { AdminUsersPage } from './routes/admin/AdminUsersPage'
import { AdminUsersRolesPage } from './routes/admin/AdminUsersRolesPage'
import { AdminUsersGroupsPage } from './routes/admin/AdminUsersGroupsPage'
import { AdminUsersSchemaPage } from './routes/admin/AdminUsersSchemaPage'
import { AdminDepartmentsPage } from './routes/admin/AdminDepartmentsPage'
import { AdminDepartmentsStructurePage } from './routes/admin/AdminDepartmentsStructurePage'
import { AdminDepartmentsSchemaPage } from './routes/admin/AdminDepartmentsSchemaPage'
import { AdminPositionsPage } from './routes/admin/AdminPositionsPage'
import { AdminPositionsSchemaPage } from './routes/admin/AdminPositionsSchemaPage'
import { AdminLocationsPage } from './routes/admin/AdminLocationsPage'
import { AdminLocationsSchemaPage } from './routes/admin/AdminLocationsSchemaPage'
import { AdminGradesPage } from './routes/admin/AdminGradesPage'
import { AdminGradesSchemaPage } from './routes/admin/AdminGradesSchemaPage'
import { AdminRolesPage } from './routes/admin/AdminRolesPage'
import { AdminRolesPermissionsPage } from './routes/admin/AdminRolesPermissionsPage'
import { AdminRolesSchemaPage } from './routes/admin/AdminRolesSchemaPage'
import { AdminCustomFieldsPage } from './routes/admin/AdminCustomFieldsPage'
import { AdminCustomFieldsSchemaPage } from './routes/admin/AdminCustomFieldsSchemaPage'
import { AdminFieldReferencePage } from './routes/admin/AdminFieldReferencePage'
import { AdminFieldReferenceCompanyPage } from './routes/admin/AdminFieldReferenceCompanyPage'
import { AdminFieldReferenceUserPage } from './routes/admin/AdminFieldReferenceUserPage'
import { AdminPlaceholderPage } from './routes/admin/AdminPlaceholderPage'
import { WikiListPage } from './routes/wiki/WikiListPage'
import { WikiDetailPage } from './routes/wiki/WikiDetailPage'
import { WikiEditPage } from './routes/wiki/WikiEditPage'
import { WikiCreatePage } from './routes/wiki/WikiCreatePage'
import { InternalSitePage } from './routes/internal-site/InternalSitePage'
import { BlogPostDetailPage } from './routes/internal-site/BlogPostDetailPage'
import { BlogPostEditPage } from './routes/internal-site/BlogPostEditPage'
import { ErrorBoundary } from '@/shared/components/business/ErrorBoundary'
import { Error401Page } from './routes/errors/Error401Page'
import { Error402Page } from './routes/errors/Error402Page'
import { Error403Page } from './routes/errors/Error403Page'
import { Error404Page } from './routes/errors/Error404Page'
import { Error500Page } from './routes/errors/Error500Page'

function RootLayout() {
  return <Outlet />
}

function NotFoundPage() {
  return <Error404Page />
}

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
})

const layout = (children: React.ReactNode, pageTitle?: string) => (
  <MainLayout pageTitle={pageTitle}>{children}</MainLayout>
)

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => layout(<HomePage />),
})

const accountProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account/profile',
  component: () => layout(<ProfilePage />),
})

const workflowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/workflow',
  component: () => layout(<WorkflowPage />),
})

const vacanciesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vacancies',
  component: () => layout(<VacanciesPage />, 'Вакансии'),
})

const vacanciesSalaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vacancies/salary-ranges',
  component: () => layout(<PlaceholderPage title="ЗП вилки" />),
})

const hiringRequestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hiring-requests',
  component: () => layout(<HiringRequestsPage />, 'Заявки на подбор'),
})

const invitesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/invites',
  component: () => layout(<InvitesPage />, 'Инвайты'),
})

const financeBenchmarksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/finance/benchmarks',
  component: () => layout(<BenchmarksPage />, 'Бенчмарки'),
})

const huntflowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/huntflow',
  component: () => layout(<HuntflowPage />, 'Huntflow'),
})

const recruitingHuntflowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recruiting/huntflow',
  component: () => layout(<HuntflowPage />, 'Huntflow'),
})

const interviewersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/interviewers',
  component: () => layout(<InterviewersPage />, 'Интервьюеры'),
})

const aichatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/aichat',
  component: () => layout(<AIChatPage />, 'AI ассистент'),
})

const aiRecruiterChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ai/recruiter-chat',
  component: () => layout(<RecruiterChatPage />, 'AI Рекрутер'),
})

const recrChatIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recr-chat',
  component: () => layout(<RecrChatIndexPage />, 'ATS | Talent Pool'),
})

const recrChatCandidateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recr-chat/vacancy/$vacancyId/candidate/$candidateId',
  component: () => layout(<RecrChatCandidatePage />, 'ATS | Talent Pool'),
})

const integrationsTelegramRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/integrations/telegram',
  component: () => layout(<TelegramPage />, 'Telegram'),
})

const wikiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wiki',
  component: () => layout(<WikiListPage />, 'Вики'),
})

const wikiCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wiki/create',
  component: () => layout(<WikiCreatePage />, 'Создать статью'),
})

const wikiPageDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wiki/page/$slug',
  component: () => layout(<WikiDetailPage />, ''),
})

const wikiPageEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wiki/page/$slug/edit',
  component: () => layout(<WikiEditPage />, 'Редактировать'),
})

const internalSiteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/internal-site',
  component: () => layout(<InternalSitePage />, 'Внутренний сайт'),
})

const blogPostDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/internal-site/post/$slug',
  component: () => layout(<BlogPostDetailPage />, ''),
})

const blogPostEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/internal-site/post/$slug/edit',
  component: () => layout(<BlogPostEditPage />, 'Редактировать пост'),
})

const blogPostCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/internal-site/post/create',
  component: () => layout(<BlogPostEditPage />, 'Создать пост'),
})

const reportingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reporting',
  component: () => layout(<ReportingDashboardPage />, 'Отчетность'),
})

const reportingCompanyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reporting/company',
  component: () => layout(<CompanyReportPage />, 'Отчет по компании'),
})

const reportingHiringPlanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reporting/hiring-plan',
  component: () => layout(<HiringPlanPage />, 'План найма'),
})

const reportingHiringPlanYearlyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reporting/hiring-plan/yearly',
  component: () => layout(<HiringPlanYearlyPage />, 'План найма — годовая таблица'),
})

const specializationsLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/specializations',
  component: () => layout(<SpecializationsLayout />, 'Специализации'),
})

const specializationsIndexRoute = createRoute({
  getParentRoute: () => specializationsLayoutRoute,
  path: '/',
  component: () => <SpecializationsRootPage />,
})

const specializationInfoRoute = createRoute({
  getParentRoute: () => specializationsLayoutRoute,
  path: '$id/info',
  component: () => <SpecializationInfoPage />,
})

const companySettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings',
  component: () => layout(<CompanySettingsPage />, 'Общие настройки компании'),
})

const companySettingsOrgStructureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/org-structure',
  component: () => layout(<OrgStructurePage />, 'Оргструктура'),
})

const companySettingsGradesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/grades',
  component: () => layout(<GradesPage />, 'Грейды'),
})

const companySettingsRatingScalesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/rating-scales',
  component: () => layout(<RatingScalesPage />, 'Шкалы оценок'),
})

const companySettingsEmployeeLifecycleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/employee-lifecycle',
  component: () => layout(<EmployeeLifecyclePage />, 'Жизненный цикл'),
})

const companySettingsFinanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/finance',
  component: () => layout(<FinancePage />, 'Финансы'),
})

const companySettingsIntegrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/integrations',
  component: () => layout(<IntegrationsPage />, 'Интеграции'),
})

const companySettingsMeetingSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/meeting-settings',
  component: () => layout(<MeetingSettingsPage />, 'Настройки встреч'),
})

const companySettingsCalendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/calendar',
  component: () => layout(<CompanyCalendarPage />, 'Рабочий календарь'),
})

const companySettingsUserGroupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/user-groups',
  component: () => layout(<UserGroupsPage />, 'Группы пользователей'),
})

const companySettingsUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/users',
  component: () => layout(<UsersPage />, 'Пользователи'),
})

const companySettingsRecruitingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/recruiting',
  component: () => layout(<PlaceholderPage title="Рекрутинг" />, 'Рекрутинг'),
})

const companySettingsRecruitingRulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/recruiting/rules',
  component: () => layout(<PlaceholderPage title="Правила привлечения" />, 'Правила привлечения'),
})

const companySettingsRecruitingStagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/recruiting/stages',
  component: () => layout(<RecruitingStagesPage />, 'Этапы найма'),
})

const companySettingsRecruitingCommandsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/recruiting/commands',
  component: () => layout(<RecruitingCommandsPage />, 'Команды workflow'),
})

const companySettingsRecruitingOfferTemplateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/recruiting/offer-template',
  component: () => layout(<PlaceholderPage title="Шаблон оффера" />, 'Шаблон оффера'),
})

const companySettingsCandidateFieldsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/candidate-fields',
  component: () => layout(<CandidateFieldsPage />, 'Поля кандидатов'),
})

const companySettingsScorecardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/scorecard',
  component: () => layout(<ScorecardPage />, 'Scorecard'),
})

const companySettingsSlaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/sla',
  component: () => layout(<SLAPage />, 'SLA'),
})

const companySettingsVacancyPromptRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/company-settings/vacancy-prompt',
  component: () => layout(<VacancyPromptPage />, 'Промпт вакансий'),
})

const settingsUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/users',
  component: () => layout(<UsersPage />, 'Пользователи'),
})

const settingsUserGroupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/user-groups',
  component: () => layout(<UserGroupsPage />, 'Группы пользователей'),
})

const settingsRolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/roles',
  component: () => layout(<PlaceholderPage title="Роли" />, 'Роли'),
})

const settingsPermissionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/permissions',
  component: () => layout(<PlaceholderPage title="Права доступа" />, 'Права доступа'),
})

const settingsCustomFieldsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/custom-fields',
  component: () => layout(<PlaceholderPage title="Пользовательские поля" />, 'Пользовательские поля'),
})

const settingsWorkflowsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/workflows',
  component: () => layout(<PlaceholderPage title="Workflow settings" />, 'Workflow settings'),
})

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => layout(<AdminLayout />, 'Админка'),
})

const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: '/',
  component: () => <AdminCompanyPage />,
})

const adminCompanyRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'company',
  component: () => <AdminCompanyPage />,
})

const adminCompanyOfficesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'company/offices',
  component: () => <AdminCompanyOfficesPage />,
})

const adminCompanySchemaRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'company/schema',
  component: () => <AdminCompanySchemaPage />,
})

const adminUsersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'users',
  component: () => <AdminUsersPage />,
})

const adminUsersRolesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'users/roles',
  component: () => <AdminUsersRolesPage />,
})

const adminUsersGroupsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'users/groups',
  component: () => <AdminUsersGroupsPage />,
})

const adminUsersSchemaRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'users/schema',
  component: () => <AdminUsersSchemaPage />,
})

const adminDepartmentsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'departments',
  component: () => <AdminDepartmentsPage />,
})

const adminDepartmentsStructureRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'departments/structure',
  component: () => <AdminDepartmentsStructurePage />,
})

const adminDepartmentsSchemaRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'departments/schema',
  component: () => <AdminDepartmentsSchemaPage />,
})

const adminPositionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'positions',
  component: () => <AdminPositionsPage />,
})

const adminPositionsSchemaRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'positions/schema',
  component: () => <AdminPositionsSchemaPage />,
})

const adminLocationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'locations',
  component: () => <AdminLocationsPage />,
})

const adminLocationsSchemaRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'locations/schema',
  component: () => <AdminLocationsSchemaPage />,
})

const adminGradesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'grades',
  component: () => <AdminGradesPage />,
})

const adminGradesSchemaRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'grades/schema',
  component: () => <AdminGradesSchemaPage />,
})

const adminRolesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'roles',
  component: () => <AdminRolesPage />,
})

const adminRolesPermissionsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'roles/permissions',
  component: () => <AdminRolesPermissionsPage />,
})

const adminRolesSchemaRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'roles/schema',
  component: () => <AdminRolesSchemaPage />,
})

const adminCustomFieldsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'custom-fields',
  component: () => <AdminCustomFieldsPage />,
})

const adminCustomFieldsSchemaRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'custom-fields/schema',
  component: () => <AdminCustomFieldsSchemaPage />,
})

const adminFieldReferenceRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'field-reference',
  component: () => <AdminFieldReferencePage />,
})

const adminFieldReferenceCompanyRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'field-reference/company',
  component: () => <AdminFieldReferenceCompanyPage />,
})

const adminFieldReferenceUserRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'field-reference/user',
  component: () => <AdminFieldReferenceUserPage />,
})

// --- Блоки и системы из основного меню ---
const adminSpecializationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'specializations',
  component: () => <AdminPlaceholderPage title="Специализации" description="Конфигуратор специализаций" />,
})

const adminSpecializationsFrontendRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'specializations/frontend',
  component: () => <AdminPlaceholderPage title="Frontend Development" />,
})

const adminSpecializationsBackendRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'specializations/backend',
  component: () => <AdminPlaceholderPage title="Backend Development" />,
})

const adminProjectsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'projects',
  component: () => <AdminPlaceholderPage title="Проекты" description="Список проектов" />,
})

const adminProjectsTeamsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'projects/teams',
  component: () => <AdminPlaceholderPage title="Команды" />,
})

const adminProjectsResourcesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'projects/resources',
  component: () => <AdminPlaceholderPage title="Ресурсы и аллокация" />,
})

const adminRecruitingRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'recruiting',
  component: () => <AdminPlaceholderPage title="Рекрутинг" description="ATS | Talent Pool" />,
})

const adminRecruitingAtsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'recruiting/ats',
  component: () => <AdminPlaceholderPage title="ATS | Talent Pool" />,
})

const adminRecruitingInvitesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'recruiting/invites',
  component: () => <AdminPlaceholderPage title="Интервью" />,
})

const adminRecruitingVacanciesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'recruiting/vacancies',
  component: () => <AdminPlaceholderPage title="Вакансии" />,
})

const adminRecruitingRequestsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'recruiting/requests',
  component: () => <AdminPlaceholderPage title="Заявки на подбор" />,
})

const adminRecruitingInterviewersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'recruiting/interviewers',
  component: () => <AdminPlaceholderPage title="Интервьюеры" />,
})

const adminRecruitingStagesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'recruiting/stages',
  component: () => <AdminPlaceholderPage title="Этапы найма" />,
})

const adminRecruitingCommandsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'recruiting/commands',
  component: () => <AdminPlaceholderPage title="Команды workflow" />,
})

const adminRecruitingCandidateFieldsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'recruiting/candidate-fields',
  component: () => <AdminPlaceholderPage title="Поля кандидатов" />,
})

const adminRecruitingScorecardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'recruiting/scorecard',
  component: () => <AdminPlaceholderPage title="Scorecard" />,
})

const adminRecruitingSlaRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'recruiting/sla',
  component: () => <AdminPlaceholderPage title="SLA" />,
})

const adminEmployeesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'employees',
  component: () => <AdminPlaceholderPage title="Сотрудники" description="Справочник" />,
})

const adminEmployeesOrgChartRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'employees/org-chart',
  component: () => <AdminPlaceholderPage title="Оргструктура" />,
})

const adminEmployeesProfilesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'employees/profiles',
  component: () => <AdminPlaceholderPage title="Профили сотрудников" />,
})

const adminOnboardingRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'onboarding',
  component: () => <AdminPlaceholderPage title="Онбординг" description="Чек-листы" />,
})

const adminOnboardingChecklistsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'onboarding/checklists',
  component: () => <AdminPlaceholderPage title="Чек-листы" />,
})

const adminOnboardingBuddyRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'onboarding/buddy',
  component: () => <AdminPlaceholderPage title="Бадди-система" />,
})

const adminOnboardingDocsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'onboarding/documents',
  component: () => <AdminPlaceholderPage title="Документы" />,
})

const adminPerformanceRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'performance',
  component: () => <AdminPlaceholderPage title="Эффективность" description="Цели и OKR" />,
})

const adminPerformanceGoalsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'performance/goals',
  component: () => <AdminPlaceholderPage title="Цели и OKR" />,
})

const adminPerformanceReviewsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'performance/reviews',
  component: () => <AdminPlaceholderPage title="Оценки" />,
})

const adminPerformance360Route = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'performance/feedback-360',
  component: () => <AdminPlaceholderPage title="Feedback 360" />,
})

const adminPerformanceTalentRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'performance/talent-pool',
  component: () => <AdminPlaceholderPage title="Talent Pool" />,
})

const adminLearningRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'learning',
  component: () => <AdminPlaceholderPage title="Обучение" description="Курсы" />,
})

const adminLearningCoursesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'learning/courses',
  component: () => <AdminPlaceholderPage title="Курсы" />,
})

const adminLearningProgramsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'learning/programs',
  component: () => <AdminPlaceholderPage title="Программы" />,
})

const adminLearningSkillsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'learning/skills-matrix',
  component: () => <AdminPlaceholderPage title="Матрица навыков" />,
})

const adminFinanceRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'finance',
  component: () => <AdminPlaceholderPage title="Финансы" description="Зарплатные вилки" />,
})

const adminFinanceSalaryRangesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'finance/salary-ranges',
  component: () => <AdminPlaceholderPage title="Зарплатные вилки" />,
})

const adminFinanceBenchmarksRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'finance/benchmarks',
  component: () => <AdminPlaceholderPage title="Бенчмарки" />,
})

const adminFinanceBenefitsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'finance/benefits',
  component: () => <AdminPlaceholderPage title="Льготы и бонусы" />,
})

const adminHrServicesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'hr-services',
  component: () => <AdminPlaceholderPage title="HR-сервисы" description="Документы" />,
})

const adminHrServicesDocsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'hr-services/documents',
  component: () => <AdminPlaceholderPage title="Документы" />,
})

const adminHrServicesLeaveRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'hr-services/leave',
  component: () => <AdminPlaceholderPage title="Отпуска" />,
})

const adminHrServicesSurveysRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'hr-services/surveys',
  component: () => <AdminPlaceholderPage title="Опросы" />,
})

const adminHrServicesTicketsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'hr-services/tickets',
  component: () => <AdminPlaceholderPage title="Тикет-система" />,
})

const adminHrServicesTimeRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'hr-services/time-tracking',
  component: () => <AdminPlaceholderPage title="Учёт времени" />,
})

const adminIntegrationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'integrations',
  component: () => <AdminPlaceholderPage title="Интеграции" />,
})

const adminIntegrationsHuntflowRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'integrations/huntflow',
  component: () => <AdminPlaceholderPage title="Huntflow" />,
})

const adminIntegrationsAichatRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'integrations/aichat',
  component: () => <AdminPlaceholderPage title="AI Chat" />,
})

const adminIntegrationsClickupRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'integrations/clickup',
  component: () => <AdminPlaceholderPage title="ClickUp" />,
})

const adminIntegrationsNotionRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'integrations/notion',
  component: () => <AdminPlaceholderPage title="Notion" />,
})

const adminIntegrationsHhRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'integrations/hh',
  component: () => <AdminPlaceholderPage title="HeadHunter.ru" />,
})

const adminIntegrationsTelegramRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'integrations/telegram',
  component: () => <AdminPlaceholderPage title="Telegram" />,
})

const adminIntegrationsN8nRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'integrations/n8n',
  component: () => <AdminPlaceholderPage title="n8n" />,
})

const adminWikiRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'wiki',
  component: () => <AdminPlaceholderPage title="Вики" description="Список статей" />,
})

const adminWikiSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'wiki/settings',
  component: () => <AdminPlaceholderPage title="Настройки вики" />,
})

const adminInternalSiteRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'internal-site',
  component: () => <AdminPlaceholderPage title="Внутренний сайт" description="Страницы" />,
})

const adminInternalSiteSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'internal-site/settings',
  component: () => <AdminPlaceholderPage title="Настройки внутреннего сайта" />,
})

const adminAnalyticsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'analytics',
  component: () => <AdminPlaceholderPage title="Отчётность и аналитика" />,
})

const adminAnalyticsRecruitingRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'analytics/recruiting',
  component: () => <AdminPlaceholderPage title="Отчётность по подбору" />,
})

const adminAnalyticsFinanceRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'analytics/finance',
  component: () => <AdminPlaceholderPage title="Отчётность по финансам" />,
})

const adminAnalyticsEmployeesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'analytics/employees',
  component: () => <AdminPlaceholderPage title="Отчётность по сотрудникам" />,
})

const adminAnalyticsIntegrationsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'analytics/integrations',
  component: () => <AdminPlaceholderPage title="Отчётность по интеграциям" />,
})

const adminAnalyticsDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'analytics/dashboard',
  component: () => <AdminPlaceholderPage title="Дашборды" />,
})

const adminAnalyticsReportsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'analytics/reports',
  component: () => <AdminPlaceholderPage title="Отчёты" />,
})

const adminAnalyticsMetricsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: 'analytics/metrics',
  component: () => <AdminPlaceholderPage title="Метрики" />,
})

const candidateResponsesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/candidate-responses',
  component: () => layout(<CandidateResponsesPage />, 'Ответы кандидатам'),
})

const settingsModulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/modules',
  component: () => layout(<PlaceholderPage title="Модули" />, 'Модули'),
})

const settingsModulesEmployeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/modules/employees',
  component: () => layout(<PlaceholderPage title="Сотрудники" />, 'Сотрудники'),
})

const settingsModulesOnboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/modules/onboarding',
  component: () => layout(<PlaceholderPage title="Онбординг" />, 'Онбординг'),
})

const settingsModulesPerformanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/modules/performance',
  component: () => layout(<PlaceholderPage title="Эффективность" />, 'Эффективность'),
})

const settingsModulesLearningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/modules/learning',
  component: () => layout(<PlaceholderPage title="Обучение" />, 'Обучение'),
})

const settingsModulesFinanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/modules/finance',
  component: () => layout(<PlaceholderPage title="Финансы" />, 'Финансы'),
})

const settingsModulesHrServicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/modules/hr-services',
  component: () => layout(<PlaceholderPage title="HR-сервисы" />, 'HR-сервисы'),
})

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calendar',
  component: () => layout(
    <ErrorBoundary>
      <CalendarPage />
    </ErrorBoundary>
  ),
})

const calendarSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calendar/settings',
  component: () => layout(<CalendarSettingsPage />),
})

const error401Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/errors/401',
  component: () => layout(<Error401Page />),
})

const error402Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/errors/402',
  component: () => layout(<Error402Page />),
})

const error403Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/errors/403',
  component: () => layout(<Error403Page />),
})

const error404Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/errors/404',
  component: () => layout(<Error404Page />),
})

const error500Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/errors/500',
  component: () => layout(<Error500Page />),
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  accountProfileRoute,
  workflowRoute,
  vacanciesRoute,
  vacanciesSalaryRoute,
  hiringRequestsRoute,
  invitesRoute,
  financeBenchmarksRoute,
  huntflowRoute,
  recruitingHuntflowRoute,
  interviewersRoute,
  aichatRoute,
  aiRecruiterChatRoute,
  recrChatIndexRoute,
  recrChatCandidateRoute,
  integrationsTelegramRoute,
  wikiRoute,
  wikiCreateRoute,
  wikiPageDetailRoute,
  wikiPageEditRoute,
  internalSiteRoute,
  blogPostCreateRoute,
  blogPostEditRoute,
  blogPostDetailRoute,
  reportingRoute,
  reportingCompanyRoute,
  reportingHiringPlanRoute,
  reportingHiringPlanYearlyRoute,
  specializationsLayoutRoute.addChildren([specializationsIndexRoute, specializationInfoRoute]),
  companySettingsRoute,
  companySettingsOrgStructureRoute,
  companySettingsGradesRoute,
  companySettingsRatingScalesRoute,
  companySettingsEmployeeLifecycleRoute,
  companySettingsFinanceRoute,
  companySettingsIntegrationsRoute,
  companySettingsMeetingSettingsRoute,
  companySettingsCalendarRoute,
  companySettingsUserGroupsRoute,
  companySettingsUsersRoute,
  companySettingsRecruitingRoute,
  companySettingsRecruitingRulesRoute,
  companySettingsRecruitingStagesRoute,
  companySettingsRecruitingCommandsRoute,
  companySettingsRecruitingOfferTemplateRoute,
  companySettingsCandidateFieldsRoute,
  companySettingsScorecardRoute,
  companySettingsSlaRoute,
  companySettingsVacancyPromptRoute,
  settingsUsersRoute,
  settingsUserGroupsRoute,
  settingsRolesRoute,
  settingsPermissionsRoute,
  settingsCustomFieldsRoute,
  settingsWorkflowsRoute,
  adminLayoutRoute.addChildren([
    adminIndexRoute,
    adminCompanyRoute,
    adminCompanyOfficesRoute,
    adminCompanySchemaRoute,
    adminUsersRoute,
    adminUsersRolesRoute,
    adminUsersGroupsRoute,
    adminUsersSchemaRoute,
    adminDepartmentsRoute,
    adminDepartmentsStructureRoute,
    adminDepartmentsSchemaRoute,
    adminPositionsRoute,
    adminPositionsSchemaRoute,
    adminLocationsRoute,
    adminLocationsSchemaRoute,
    adminGradesRoute,
    adminGradesSchemaRoute,
    adminRolesRoute,
    adminRolesPermissionsRoute,
    adminRolesSchemaRoute,
    adminCustomFieldsRoute,
    adminCustomFieldsSchemaRoute,
    adminFieldReferenceRoute,
    adminFieldReferenceCompanyRoute,
    adminFieldReferenceUserRoute,
    // Блоки и системы
    adminSpecializationsRoute,
    adminSpecializationsFrontendRoute,
    adminSpecializationsBackendRoute,
    adminProjectsRoute,
    adminProjectsTeamsRoute,
    adminProjectsResourcesRoute,
    adminRecruitingRoute,
    adminRecruitingAtsRoute,
    adminRecruitingInvitesRoute,
    adminRecruitingVacanciesRoute,
    adminRecruitingRequestsRoute,
    adminRecruitingInterviewersRoute,
    adminRecruitingStagesRoute,
    adminRecruitingCommandsRoute,
    adminRecruitingCandidateFieldsRoute,
    adminRecruitingScorecardRoute,
    adminRecruitingSlaRoute,
    adminEmployeesRoute,
    adminEmployeesOrgChartRoute,
    adminEmployeesProfilesRoute,
    adminOnboardingRoute,
    adminOnboardingChecklistsRoute,
    adminOnboardingBuddyRoute,
    adminOnboardingDocsRoute,
    adminPerformanceRoute,
    adminPerformanceGoalsRoute,
    adminPerformanceReviewsRoute,
    adminPerformance360Route,
    adminPerformanceTalentRoute,
    adminLearningRoute,
    adminLearningCoursesRoute,
    adminLearningProgramsRoute,
    adminLearningSkillsRoute,
    adminFinanceRoute,
    adminFinanceSalaryRangesRoute,
    adminFinanceBenchmarksRoute,
    adminFinanceBenefitsRoute,
    adminHrServicesRoute,
    adminHrServicesDocsRoute,
    adminHrServicesLeaveRoute,
    adminHrServicesSurveysRoute,
    adminHrServicesTicketsRoute,
    adminHrServicesTimeRoute,
    adminIntegrationsRoute,
    adminIntegrationsHuntflowRoute,
    adminIntegrationsAichatRoute,
    adminIntegrationsClickupRoute,
    adminIntegrationsNotionRoute,
    adminIntegrationsHhRoute,
    adminIntegrationsTelegramRoute,
    adminIntegrationsN8nRoute,
    adminWikiRoute,
    adminWikiSettingsRoute,
    adminInternalSiteRoute,
    adminInternalSiteSettingsRoute,
    adminAnalyticsRoute,
    adminAnalyticsRecruitingRoute,
    adminAnalyticsFinanceRoute,
    adminAnalyticsEmployeesRoute,
    adminAnalyticsIntegrationsRoute,
    adminAnalyticsDashboardRoute,
    adminAnalyticsReportsRoute,
    adminAnalyticsMetricsRoute,
  ]),
  candidateResponsesRoute,
  settingsModulesRoute,
  settingsModulesEmployeesRoute,
  settingsModulesOnboardingRoute,
  settingsModulesPerformanceRoute,
  settingsModulesLearningRoute,
  settingsModulesFinanceRoute,
  settingsModulesHrServicesRoute,
  calendarRoute,
  calendarSettingsRoute,
  error401Route,
  error402Route,
  error403Route,
  error404Route,
  error500Route,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
