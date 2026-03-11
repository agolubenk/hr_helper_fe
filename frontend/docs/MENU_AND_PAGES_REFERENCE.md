# Справочник по меню и страницам

Соответствие пунктов меню, маршрутов и компонентов. Актуальная структура из `menuConfig.tsx` и `settingsMenuConfig.tsx`.

**Легенда:** ✅ Реализовано | ⚠️ Заглушка | ❌ Маршрут отсутствует

---

## 1. Пункты 1 уровня (MENU_LEVEL1_ORDER)

Порядок отображения в сайдбаре до Separator:

| № | ID | Название |
|---|-----|----------|
| 1 | home | Главная |
| 2 | calendar | Календарь |
| 3 | workflow-chat | Workflow чат |
| 4 | recruiting | Рекрутинг |
| 5 | onboarding | Онбординг |
| 6 | learning | L&D |
| 7 | finance | C&B |
| 8 | hr-services | HROps |
| 9 | hr-pr | HR PR |
| 10 | employees | Сотрудники |
| 11 | internal-site | Внутренний сайт |
| 12 | surveys | Опросы |
| 13 | wiki | Вики |
| 14 | projects | Проекты |
| 15 | analytics | Отчёты и аналитика |
| 16 | integrations | Интеграции |
| 17 | company-settings | Настройки компании |

---

## 2. Полная иерархия основного меню (MAIN_MENU_ITEMS)

| Ур. | ID | Название | href | Примечание |
|-----|-----|----------|------|------------|
| 0 | home | Главная | /workflow | Настраивается через sidebarHomeHref |
| 0 | calendar | Календарь | /calendar | |
| 0 | workflow-chat | Workflow chat | /workflow | |
| 0 | recruiting | Рекрутинг | — | Раскрывающийся |
| 1 | recr-chat | ATS \| Talent Pool | /recr-chat/vacancy/1/candidate/1 | |
| 1 | invites | Интервью, ТЗ и скрининги | /invites | |
| 1 | vacancies-list | Вакансии | /vacancies | |
| 1 | vacancies-requests | Заявки | /hiring-requests | |
| 1 | reporting-hiring-plan | План найма | /reporting/hiring-plan | |
| 0 | onboarding | Онбординг | — | Раскрывающийся |
| 1 | onboarding-checklists | Чек-листы | /onboarding/checklists | |
| 1 | onboarding-buddy | Бадди-система | /onboarding/buddy | |
| 1 | onboarding-docs | Документы | /onboarding/documents | |
| 0 | learning | L&D | — | Раскрывающийся |
| 1 | performance | Эффективность | — | Раскрывающийся |
| 2 | performance-goals | Цели и OKR | /performance/goals | |
| 2 | performance-reviews | Оценки | /performance/reviews | |
| 2 | performance-360 | Feedback 360 | /performance/feedback-360 | |
| 2 | performance-talent | Talent Pool | /performance/talent-pool | |
| 1 | learning-courses | Курсы | /learning/courses | |
| 1 | learning-programs | Программы | /learning/programs | |
| 1 | learning-skills | Матрица навыков | /learning/skills-matrix | |
| 0 | finance | C&B | — | Раскрывающийся |
| 1 | finance-salary-ranges | Зарплатные вилки | /vacancies/salary-ranges | |
| 1 | finance-benchmarks | Бенчмарки | — | Раскрывающийся |
| 2 | benchmarks-dashboard | Dashboard | /finance/benchmarks | |
| 2 | benchmarks-all | Все бенчмарки | /finance/benchmarks | |
| 1 | compensation-benefits | Льготы и бонусы | /compensation/benefits | |
| 0 | hr-services | HROps | — | Раскрывающийся |
| 1 | hr-services-docs | Документы | /hr-services/documents | |
| 1 | hr-services-leave | Отпуска | /hr-services/leave | |
| 1 | hr-services-tickets | Тикет-система | /hr-services/tickets | |
| 1 | hr-services-time | Учёт времени | /hr-services/time-tracking | |
| 0 | hr-pr | HR PR | — | Раскрывающийся |
| 1 | hr-pr-wiki | Вики | /wiki | |
| 1 | hr-pr-internal | Внутренний сайт | /internal-site | |
| 0 | employees | Сотрудники | — | Раскрывающийся |
| 1 | specializations | Специализации | — | Раскрывающийся |
| 2 | specializations-all | Конфигуратор | /specializations | |
| 2 | specializations-frontend | Frontend Development | /specializations/frontend/info | |
| 2 | specializations-backend | Backend Development | /specializations/backend/info | |
| 1 | employees-directory | Справочник | /employees | |
| 1 | employees-orgchart | Оргструктура | /employees/org-chart | |
| 1 | employees-profiles | Профили | /employees/profiles | |
| 0 | internal-site | Внутренний сайт | — | Раскрывающийся |
| 1 | internal-site-main | Главная | /internal-site | |
| 1 | internal-site-create | Создать пост | /internal-site/post/create | |
| 0 | surveys | Опросы | /hr-services/surveys | |
| 0 | wiki | Вики | — | Раскрывающийся |
| 1 | wiki-all | Все статьи | /wiki | |
| 1 | wiki-intro | Введение | /wiki?category=Введение | |
| 1 | wiki-arch | Архитектура | /wiki?category=Архитектура | |
| 1 | wiki-setup | Настройка | /wiki?category=Настройка | |
| 1 | wiki-usage | Использование | /wiki?category=Использование | |
| 1 | wiki-integrations | Интеграции | /wiki?category=Интеграции | |
| 1 | wiki-uncategorized | Без категории | /wiki?category=Без категории | |
| 1 | wiki-create | Создать статью | /wiki/create | |
| 0 | projects | Проекты | — | Раскрывающийся |
| 1 | projects-list | Список проектов | /projects | |
| 1 | projects-teams | Команды | /projects/teams | |
| 1 | projects-resources | Ресурсы и аллокация | /projects/resources | |
| 0 | analytics | Отчёты и аналитика | — | Раскрывающийся |
| 1 | reporting-recruiting | По подбору | — | Раскрывающийся |
| 2 | reporting-main | Главная | /reporting | |
| 2 | reporting-hiring-plan | План найма | /reporting/hiring-plan | |
| 2 | reporting-company | По компании | /reporting/company | |
| 2 | reporting-recruiter | По рекрутеру | /reporting/recruiter | |
| 2 | reporting-vacancy | По вакансии | /reporting/vacancy | |
| 2 | reporting-interviewer | По интервьюеру | /reporting/interviewer | |
| 2 | reporting-funnel | Воронка | /reporting/funnel | |
| 1 | reporting-finance | По финансам | — | Раскрывающийся |
| 2 | reporting-salary | ЗП вилки | /vacancies/salary-ranges | |
| 2 | reporting-benchmarks | Бенчмарки | /finance/benchmarks | |
| 1 | reporting-employees | По сотрудникам | — | Раскрывающийся |
| 2 | reporting-employees-directory | Справочник | /employees | |
| 2 | reporting-employees-orgchart | Оргструктура | /employees/org-chart | |
| 1 | reporting-integrations | По интеграциям | — | Раскрывающийся |
| 2 | reporting-huntflow | Huntflow | /huntflow | |
| 2 | reporting-aichat | AI Chat | /aichat | |
| 1 | analytics-group | Аналитика | — | Раскрывающийся |
| 2 | analytics-dashboard | Дашборды | /analytics | |
| 2 | analytics-reports | Отчёты | /analytics/reports | |
| 2 | analytics-metrics | Метрики | /analytics/metrics | |
| 0 | integrations | Интеграции | — | Раскрывающийся |
| 1 | integrations-huntflow | Huntflow | /huntflow | |
| 1 | integrations-aichat | AI Chat | /aichat | |
| 1 | integrations-clickup | ClickUp | — | Без href |
| 1 | integrations-notion | Notion | — | Без href |
| 1 | integrations-hh | HeadHunter.ru | — | Без href |
| 1 | integrations-telegram | Telegram | — | Раскрывающийся |
| 2 | integrations-telegram-login | Вход | /telegram | |
| 2 | integrations-telegram-2fa | 2FA | /telegram/2fa | |
| 2 | integrations-telegram-chats | Чаты | /telegram/chats | |
| 1 | integrations-n8n | n8n | — | Без href |
| 0 | company-settings | Настройки компании | /company-settings | Из SETTINGS_MENU_ITEMS |

---

## 3. Полная иерархия меню настроек (SETTINGS_MENU_ITEMS)

**До Separator:** только `company-settings` (в основном меню).

**После Separator:** profile, settings-integrations, module-settings-personal, settings-workflows, admin.

| Ур. | ID | Название | href | Где отображается |
|-----|-----|----------|------|------------------|
| 0 | profile | Профиль | /account/profile | После Separator |
| 0 | settings-integrations | Интеграции и API | /account/profile | После Separator |
| 0 | company-settings | Настройки компании | /company-settings | В основном меню |
| 1 | general-settings | Общие настройки | — | Вложено в company-settings |
| 2 | settings-users-list | Пользователи | /settings/users | |
| 2 | settings-roles | Роли | /settings/roles | |
| 2 | settings-user-groups | Группы пользователей | /settings/user-groups | |
| 2 | settings-permissions | Права доступа | /settings/permissions | |
| 1 | module-settings | Настройки модулей | — | Вложено в company-settings |
| 2 | recruiting-settings | Рекрутинг | /company-settings/recruiting | Раскрывающийся |
| 3 | recruiting-settings-interviewers | Интервьюеры | /interviewers | |
| 3 | recruiting-settings-rules | Правила привлечения | /company-settings/recruiting/rules | |
| 3 | recruiting-settings-stages | Этапы найма и причины отказа | /company-settings/recruiting/stages | |
| 3 | recruiting-settings-commands | Команды workflow | /company-settings/recruiting/commands | |
| 3 | recruiting-settings-candidate-fields | Дополнительные поля кандидатов | /company-settings/candidate-fields | |
| 3 | recruiting-settings-scorecard | Scorecard | /company-settings/scorecard | |
| 3 | recruiting-settings-rating-scales | Шкалы оценок | /company-settings/rating-scales | |
| 3 | recruiting-settings-sla | SLA | /company-settings/sla | |
| 3 | recruiting-settings-vacancy-prompt | Единый промпт для вакансий | /company-settings/vacancy-prompt | |
| 3 | recruiting-settings-offer-template | Шаблон оффера | /company-settings/recruiting/offer-template | |
| 3 | recruiting-settings-candidate-responses | Ответы кандидатам | /candidate-responses | |
| 2 | module-settings-employees | Сотрудники | /settings/modules/employees | |
| 2 | module-settings-onboarding | Онбординг | /settings/modules/onboarding | |
| 2 | module-settings-performance | Эффективность | /settings/modules/performance | |
| 2 | module-settings-learning | L&D | /settings/modules/learning | |
| 2 | module-settings-finance | Финансы | /settings/modules/finance | |
| 2 | module-settings-hr-services | HR-сервисы | /settings/modules/hr-services | |
| 2 | settings-modules | Модули (вкл/выкл) | /settings/modules | |
| 1 | company-settings-general | Общие | /company-settings | |
| 1 | company-settings-meeting-settings | Настройки встреч | /company-settings/meeting-settings | |
| 1 | company-settings-org-structure | Оргструктура | /company-settings/org-structure | |
| 1 | company-settings-grades | Грейды | /company-settings/grades | |
| 1 | company-settings-rating-scales | Шкалы оценок | /company-settings/rating-scales | |
| 1 | company-settings-lifecycle | Жизненный цикл сотрудников | /company-settings/employee-lifecycle | |
| 1 | company-settings-finance | Финансы | /company-settings/finance | |
| 1 | company-settings-integrations | Интеграции | /company-settings/integrations | |
| 1 | company-settings-custom-fields | Пользовательские поля | /settings/custom-fields | |
| 0 | module-settings-personal | Настройки модулей | /settings/modules | После Separator |
| 0 | settings-workflows | Workflow settings | /settings/workflows | После Separator |
| 0 | admin | Admin | /admin | После Separator |

---

## 4. Соответствие пункт → маршрут → компонент → статус

### 4.1. Главное

| Пункт | href | Маршрут | Компонент | Статус |
|-------|------|---------|-----------|--------|
| Главная | /workflow (настр.) | / | HomePage | ✅ |
| Календарь | /calendar | /calendar | CalendarPage | ✅ |
| Workflow chat | /workflow | /workflow | PlaceholderPage | ⚠️ |

### 4.2. Рекрутинг

| Пункт | href | Маршрут | Компонент | Статус |
|-------|------|---------|-----------|--------|
| ATS \| Talent Pool | /recr-chat/vacancy/1/candidate/1 | /recr-chat/* | — | ❌ |
| Интервью, ТЗ и скрининги | /invites | /invites | — | ❌ |
| Вакансии | /vacancies | /vacancies | PlaceholderPage | ⚠️ |
| Заявки | /hiring-requests | /hiring-requests | PlaceholderPage | ⚠️ |
| План найма | /reporting/hiring-plan | /reporting/hiring-plan | — | ❌ |

### 4.3. Настройки рекрутинга (в company-settings)

| Пункт | href | Маршрут | Компонент | Статус |
|-------|------|---------|-----------|--------|
| Интервьюеры | /interviewers | /interviewers | PlaceholderPage | ⚠️ |
| Правила привлечения | /company-settings/recruiting/rules | — | PlaceholderPage | ⚠️ |
| Этапы найма | /company-settings/recruiting/stages | — | RecruitingStagesPage | ✅ |
| Команды workflow | /company-settings/recruiting/commands | — | RecruitingCommandsPage | ✅ |
| Доп. поля кандидатов | /company-settings/candidate-fields | — | CandidateFieldsPage | ✅ |
| Scorecard | /company-settings/scorecard | — | ScorecardPage | ✅ |
| Шкалы оценок | /company-settings/rating-scales | — | RatingScalesPage | ✅ |
| SLA | /company-settings/sla | — | SLAPage | ✅ |
| Промпт вакансий | /company-settings/vacancy-prompt | — | VacancyPromptPage | ✅ |
| Шаблон оффера | /company-settings/recruiting/offer-template | — | PlaceholderPage | ⚠️ |
| Ответы кандидатам | /candidate-responses | /candidate-responses | — | ❌ |

### 4.4. Онбординг, L&D, C&B, HROps, HR PR, Сотрудники, Внутренний сайт, Опросы, Вики, Проекты

| Раздел | Пункты | href | Статус |
|--------|--------|------|--------|
| Онбординг | Чек-листы, Бадди-система, Документы | /onboarding/* | ❌ |
| L&D | Эффективность, Курсы, Программы, Матрица навыков | /performance/*, /learning/* | ❌ |
| C&B | ЗП вилки, Бенчмарки, Льготы и бонусы | /vacancies/salary-ranges, /finance/benchmarks, /compensation/benefits | ⚠️ |
| HROps | Документы, Отпуска, Тикет-система, Учёт времени | /hr-services/* | ❌ |
| HR PR | Вики, Внутренний сайт | /wiki, /internal-site | ✅ |
| Сотрудники | Специализации, Справочник, Оргструктура, Профили | /specializations/*, /employees/* | ❌ |
| Внутренний сайт | Главная, Создать пост | /internal-site/* | ✅ |
| Опросы | Опросы | /hr-services/surveys | ❌ |
| Вики | Все статьи, категории, Создать | /wiki/* | WikiListPage, WikiDetailPage, WikiEditPage | ✅ |
| Проекты | Список, Команды, Ресурсы | /projects/* | ❌ |

### 4.5. Отчёты и аналитика, Интеграции

| Раздел | Пункты | href | Статус |
|--------|--------|------|--------|
| Отчёты и аналитика | По подбору, По финансам, По сотрудникам, По интеграциям, Аналитика | /reporting/*, /analytics/* | ⚠️ |
| Интеграции | Huntflow, AI Chat, Telegram, ClickUp, Notion, HH, n8n | /huntflow, /aichat, /telegram/* | ❌/⚠️ |

### 4.6. Настройки компании

| Пункт | href | Компонент | Статус |
|-------|------|-----------|--------|
| Общие настройки → Пользователи, Роли, Группы, Права | /settings/* | UsersPage, UserGroupsPage, PlaceholderPage | ✅/⚠️ |
| Общие, Встречи, Оргструктура, Грейды, Шкалы, Жизненный цикл, Финансы, Интеграции, Пользовательские поля | /company-settings/* | Реализовано | ✅ |

### 4.7. После Separator

| Пункт | href | Компонент | Статус |
|-------|------|-----------|--------|
| Профиль | /account/profile | ProfilePage | ✅ |
| Интеграции и API | /account/profile (вкладка) | ProfilePage | ✅ |
| Настройки модулей | /settings/modules | PlaceholderPage | ⚠️ |
| Workflow settings | /settings/workflows | PlaceholderPage | ⚠️ |
| Admin | /admin | AdminLayout | ✅ |
