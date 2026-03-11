# Аудит миграции настроек

Статус переноса страниц из fullstack в hr-platform.

---

## ✅ Перенесено (реальный контент)

| Страница | Путь | Компонент | Статус |
|----------|------|-----------|--------|
| Общие настройки | /company-settings | CompanySettingsPage → GeneralSettings | ✅ |
| Оргструктура | /company-settings/org-structure | OrgStructurePage | ✅ |
| Грейды | /company-settings/grades | GradesPage → GradesSettings, GradeForm | ✅ |
| Шкалы оценок | /company-settings/rating-scales | RatingScalesPage → RatingScalesSettings | ✅ |
| Жизненный цикл | /company-settings/employee-lifecycle | EmployeeLifecyclePage → EmployeeLifecycleSettings | ✅ |
| Финансы | /company-settings/finance | FinancePage → FinanceSettings | ✅ |
| Интеграции | /company-settings/integrations | IntegrationsPage → IntegrationsSettings | ✅ |
| Группы пользователей | /company-settings/user-groups, /settings/user-groups | UserGroupsPage → UserGroupsSettings | ✅ |
| Пользователи | /company-settings/users, /settings/users | UsersPage → UsersSettings | ✅ |
| Этапы найма | /company-settings/recruiting/stages | RecruitingStagesPage → RecruitingStagesSettings | ✅ |
| Команды workflow | /company-settings/recruiting/commands | RecruitingCommandsPage → RecruitingCommandsSettings | ✅ |
| Поля кандидатов | /company-settings/candidate-fields | CandidateFieldsPage → CandidateFieldsSettings | ✅ |
| Scorecard | /company-settings/scorecard | ScorecardPage → ScorecardSettings | ✅ |
| SLA | /company-settings/sla | SLAPage → SLASettings, SLAEditModal | ✅ |
| Промпт вакансий | /company-settings/vacancy-prompt | VacancyPromptPage → VacancyPromptSettings | ✅ |

---

## ⚠️ Заглушки (PlaceholderPage)

| Страница | Путь | Примечание |
|----------|------|------------|
| Рекрутинг (landing) | /company-settings/recruiting | В fullstack — отдельная страница |
| Правила привлечения | /company-settings/recruiting/rules | fullstack: AttractionRulesPage |
| Шаблон оффера | /company-settings/recruiting/offer-template | fullstack: OfferTemplatePage (mammoth, JSZip) |
| Роли | /settings/roles | — |
| Права доступа | /settings/permissions | — |
| Пользовательские поля | /settings/custom-fields | — |
| Workflow settings | /settings/workflows | — |
| Ответы кандидатам | /candidate-responses | — |
| Модули | /settings/modules | — |
| Сотрудники, Онбординг, Эффективность, L&D, Финансы, HR-сервисы | /settings/modules/* | — |

---

## Сравнение с fullstack

| fullstack | hr-platform |
|-----------|-------------|
| app/company-settings/page.tsx | ✅ CompanySettingsPage |
| app/company-settings/org-structure/page.tsx | ✅ OrgStructurePage |
| app/company-settings/grades/page.tsx | ✅ GradesPage |
| app/company-settings/rating-scales/page.tsx | ✅ RatingScalesPage |
| app/company-settings/employee-lifecycle/page.tsx | ✅ EmployeeLifecyclePage |
| app/company-settings/finance/page.tsx | ✅ FinancePage |
| app/company-settings/integrations/page.tsx | ✅ IntegrationsPage |
| app/company-settings/user-groups/page.tsx | ✅ UserGroupsPage |
| app/company-settings/users/page.tsx | ✅ UsersPage |
| app/company-settings/recruiting/rules/page.tsx | ❌ PlaceholderPage |
| app/company-settings/recruiting/stages/page.tsx | ✅ RecruitingStagesPage |
| app/company-settings/recruiting/commands/page.tsx | ✅ RecruitingCommandsPage |
| app/company-settings/recruiting/offer-template/page.tsx | ❌ PlaceholderPage |
| app/company-settings/candidate-fields/page.tsx | ✅ CandidateFieldsPage |
| app/company-settings/scorecard/page.tsx | ✅ ScorecardPage |
| app/company-settings/sla/page.tsx | ✅ SLAPage |
| app/company-settings/vacancy-prompt/page.tsx | ✅ VacancyPromptPage |
