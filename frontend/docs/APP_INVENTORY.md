# HR Helper — полный инвентарь приложения

**Цель:** определить все аспекты, последовательность, разбить по модулям. Сделать приложение реальным.

---

## 1. МОДУЛИ ПРИЛОЖЕНИЯ

| № | Модуль | Описание | Статус |
|---|--------|----------|--------|
| 1 | **Главное** | Главная, календарь, workflow-чат | Частично |
| 2 | **Рекрутинг** | ATS, интервью, вакансии, заявки, интервьюеры | Заглушки |
| 3 | **Сотрудники** | Специализации, проекты, справочник, оргструктура, профили | 404 / Admin |
| 4 | **Онбординг** | Чек-листы, бадди, документы | 404 / Admin |
| 5 | **L&D** | Эффективность (OKR, оценки, 360, Talent Pool), курсы, программы, матрица навыков | 404 / Admin |
| 6 | **HR-сервисы** | Документы, отпуска, тикеты, учёт времени | 404 / Admin |
| 7 | **Опросы** | Опросы сотрудников | 404 |
| 8 | **HR PR** | Вики, внутренний сайт | Реализовано |
| 9 | **C&B** | Отчётность, аналитика, ЗП вилки, бенчмарки, льготы | Заглушки / 404 |
| 10 | **Интеграции** | Huntflow, AI Chat, Telegram, ClickUp, Notion, HH, n8n | Частично |
| 11 | **Настройки компании** | Общие, встречи, оргструктура, грейды, шкалы, жизненный цикл, финансы, интеграции, пользователи, группы, рекрутинг | Реализовано |
| 12 | **Общие настройки** | Пользователи, роли, группы, права | Частично |
| 13 | **Настройки модулей** | Вкл/выкл модулей, настройки по модулям | Заглушки |
| 14 | **Админка** | Модели, схемы, справочники | Частично |

---

## 2. ПОЛНЫЙ РЕЕСТР СТРАНИЦ ПО МОДУЛЯМ

### 2.1. Модуль «Главное»

| Путь | Компонент | Статус | Приоритет |
|------|------------|--------|-----------|
| / | HomePage | Реализовано | — |
| /workflow | PlaceholderPage | Заглушка | 1 |
| /calendar | CalendarPage | Реализовано | — |
| /calendar/settings | CalendarSettingsPage | Реализовано | — |

### 2.2. Модуль «Рекрутинг»

| Путь | Компонент | Статус | Приоритет |
|------|------------|--------|-----------|
| /recr-chat/vacancy/:id/candidate/:id | — | 404 | 1 |
| /invites | — | 404 | 2 |
| /vacancies | PlaceholderPage | Заглушка | 3 |
| /hiring-requests | PlaceholderPage | Заглушка | 4 |
| /interviewers | PlaceholderPage | Заглушка | 5 |
| /candidate-responses | PlaceholderPage | Заглушка | 6 |

### 2.3. Модуль «Сотрудники»

| Путь | Компонент | Статус | Приоритет |
|------|------------|--------|-----------|
| /specializations | — | 404 | 1 |
| /specializations/frontend/info | — | 404 | 2 |
| /specializations/backend/info | — | 404 | 3 |
| /projects | — | 404 | 4 |
| /projects/teams | — | 404 | 5 |
| /projects/resources | — | 404 | 6 |
| /employees | — | 404 | 7 |
| /employees/org-chart | — | 404 | 8 |
| /employees/profiles | — | 404 | 9 |

### 2.4. Модуль «Онбординг»

| Путь | Компонент | Статус | Приоритет |
|------|------------|--------|-----------|
| /onboarding/checklists | — | 404 | 1 |
| /onboarding/buddy | — | 404 | 2 |
| /onboarding/documents | — | 404 | 3 |

### 2.5. Модуль «L&D» (Эффективность + Обучение)

| Путь | Компонент | Статус | Приоритет |
|------|------------|--------|-----------|
| /performance/goals | — | 404 | 1 |
| /performance/reviews | — | 404 | 2 |
| /performance/feedback-360 | — | 404 | 3 |
| /performance/talent-pool | — | 404 | 4 |
| /learning/courses | — | 404 | 5 |
| /learning/programs | — | 404 | 6 |
| /learning/skills-matrix | — | 404 | 7 |

### 2.6. Модуль «HR-сервисы»

| Путь | Компонент | Статус | Приоритет |
|------|------------|--------|-----------|
| /hr-services/documents | — | 404 | 1 |
| /hr-services/leave | — | 404 | 2 |
| /hr-services/tickets | — | 404 | 3 |
| /hr-services/time-tracking | — | 404 | 4 |
| /hr-services/surveys | — | 404 | 5 |

### 2.7. Модуль «HR PR»

| Путь | Компонент | Статус | Приоритет |
|------|------------|--------|-----------|
| /wiki | WikiListPage | Реализовано | — |
| /wiki/create | WikiCreatePage | Реализовано | — |
| /wiki/page/:slug | WikiDetailPage | Реализовано | — |
| /wiki/page/:slug/edit | WikiEditPage | Реализовано | — |
| /internal-site | InternalSitePage | Реализовано | — |
| /internal-site/post/create | BlogPostEditPage | Реализовано | — |
| /internal-site/post/:slug | BlogPostDetailPage | Реализовано | — |
| /internal-site/post/:slug/edit | BlogPostEditPage | Реализовано | — |

### 2.8. Модуль «C&B»

| Путь | Компонент | Статус | Приоритет |
|------|------------|--------|-----------|
| /reporting | PlaceholderPage | Заглушка | 1 |
| /reporting/hiring-plan | — | 404 | 2 |
| /reporting/company | — | 404 | 3 |
| /reporting/recruiter | — | 404 | 4 |
| /reporting/vacancy | — | 404 | 5 |
| /reporting/interviewer | — | 404 | 6 |
| /reporting/funnel | — | 404 | 7 |
| /vacancies/salary-ranges | PlaceholderPage | Заглушка | 8 |
| /finance/benchmarks | PlaceholderPage | Заглушка | 9 |
| /compensation/benefits | — | 404 | 10 |
| /analytics | — | 404 | 11 |
| /analytics/reports | — | 404 | 12 |
| /analytics/metrics | — | 404 | 13 |

### 2.9. Модуль «Интеграции»

| Путь | Компонент | Статус | Приоритет |
|------|------------|--------|-----------|
| /huntflow | — | 404 | 1 |
| /aichat | PlaceholderPage | Заглушка | 2 |
| /telegram | — | 404 | 3 |
| /telegram/2fa | — | 404 | 4 |
| /telegram/chats | — | 404 | 5 |

### 2.10. Модуль «Настройки компании»

| Путь | Компонент | Статус | Приоритет |
|------|------------|--------|-----------|
| /company-settings | CompanySettingsPage | Реализовано | — |
| /company-settings/meeting-settings | MeetingSettingsPage | Реализовано | — |
| /company-settings/org-structure | OrgStructurePage | Реализовано | — |
| /company-settings/grades | GradesPage | Реализовано | — |
| /company-settings/rating-scales | RatingScalesPage | Реализовано | — |
| /company-settings/employee-lifecycle | EmployeeLifecyclePage | Реализовано | — |
| /company-settings/finance | FinancePage | Реализовано | — |
| /company-settings/integrations | IntegrationsPage | Реализовано | — |
| /company-settings/users | UsersPage | Реализовано | — |
| /company-settings/user-groups | UserGroupsPage | Реализовано | — |
| /company-settings/recruiting | PlaceholderPage | Заглушка | 1 |
| /company-settings/recruiting/rules | PlaceholderPage | Заглушка | 2 |
| /company-settings/recruiting/stages | RecruitingStagesPage | Реализовано | — |
| /company-settings/recruiting/commands | RecruitingCommandsPage | Реализовано | — |
| /company-settings/recruiting/offer-template | PlaceholderPage | Заглушка | 3 |
| /company-settings/candidate-fields | CandidateFieldsPage | Реализовано | — |
| /company-settings/scorecard | ScorecardPage | Реализовано | — |
| /company-settings/sla | SLAPage | Реализовано | — |
| /company-settings/vacancy-prompt | VacancyPromptPage | Реализовано | — |

### 2.11. Модуль «Общие настройки» (/settings/*)

| Путь | Компонент | Статус | Приоритет |
|------|------------|--------|-----------|
| /settings/users | UsersPage | Реализовано | — |
| /settings/user-groups | UserGroupsPage | Реализовано | — |
| /settings/roles | PlaceholderPage | Заглушка | 1 |
| /settings/permissions | PlaceholderPage | Заглушка | 2 |
| /settings/custom-fields | PlaceholderPage | Заглушка | 3 |
| /settings/workflows | PlaceholderPage | Заглушка | 4 |
| /settings/modules | PlaceholderPage | Заглушка | 5 |
| /settings/modules/employees | PlaceholderPage | Заглушка | 6 |
| /settings/modules/onboarding | PlaceholderPage | Заглушка | 7 |
| /settings/modules/performance | PlaceholderPage | Заглушка | 8 |
| /settings/modules/learning | PlaceholderPage | Заглушка | 9 |
| /settings/modules/finance | PlaceholderPage | Заглушка | 10 |
| /settings/modules/hr-services | PlaceholderPage | Заглушка | 11 |

### 2.12. Профиль и аккаунт

| Путь | Компонент | Статус | Приоритет |
|------|------------|--------|-----------|
| /account/profile | ProfilePage | Реализовано | — |

### 2.13. Админка (/admin/*)

| Путь | Компонент | Статус |
|------|------------|--------|
| /admin | AdminLayout + AdminCompanyPage | Реализовано |
| /admin/company | AdminCompanyPage | Реализовано |
| /admin/company/offices | AdminCompanyOfficesPage | Реализовано |
| /admin/company/schema | AdminCompanySchemaPage | Реализовано |
| /admin/users | AdminUsersPage | Реализовано |
| /admin/users/roles | AdminUsersRolesPage | Реализовано |
| /admin/users/groups | AdminUsersGroupsPage | Реализовано |
| /admin/users/schema | AdminUsersSchemaPage | Реализовано |
| /admin/departments | AdminDepartmentsPage | Реализовано |
| /admin/departments/structure | AdminDepartmentsStructurePage | Реализовано |
| /admin/departments/schema | AdminDepartmentsSchemaPage | Реализовано |
| /admin/positions | AdminPositionsPage | Реализовано |
| /admin/positions/schema | AdminPositionsSchemaPage | Реализовано |
| /admin/locations | AdminLocationsPage | Реализовано |
| /admin/locations/schema | AdminLocationsSchemaPage | Реализовано |
| /admin/grades | AdminGradesPage | Реализовано |
| /admin/grades/schema | AdminGradesSchemaPage | Реализовано |
| /admin/roles | AdminRolesPage | Реализовано |
| /admin/roles/permissions | AdminRolesPermissionsPage | Реализовано |
| /admin/roles/schema | AdminRolesSchemaPage | Реализовано |
| /admin/custom-fields | AdminCustomFieldsPage | Реализовано |
| /admin/custom-fields/schema | AdminCustomFieldsSchemaPage | Реализовано |
| /admin/field-reference | AdminFieldReferencePage | Реализовано |
| /admin/field-reference/company | AdminFieldReferenceCompanyPage | Реализовано |
| /admin/field-reference/user | AdminFieldReferenceUserPage | Реализовано |
| Остальные /admin/* | AdminPlaceholderPage | Заглушка |

---

## 3. ПОСЛЕДОВАТЕЛЬНОСТЬ РЕАЛИЗАЦИИ (РОАДМАП)

### Фаза 1: Критичные 404 (маршруты в меню ведут в никуда)

| № | Задача | Модуль | Действие |
|---|--------|--------|----------|
| 1.1 | Добавить маршрут /recr-chat/* | Рекрутинг | createRoute + PlaceholderPage или редирект |
| 1.2 | Добавить маршрут /invites | Рекрутинг | createRoute + PlaceholderPage |
| 1.3 | Добавить маршруты /specializations* | Сотрудники | createRoute или редирект на /admin |
| 1.4 | Добавить маршруты /projects* | Сотрудники | createRoute или редирект на /admin |
| 1.5 | Добавить маршруты /employees* | Сотрудники | createRoute или редирект на /admin |
| 1.6 | Добавить маршруты /onboarding/* | Онбординг | createRoute или редирект на /admin |
| 1.7 | Добавить маршруты /performance/*, /learning/* | L&D | createRoute или редирект на /admin |
| 1.8 | Добавить маршруты /hr-services/* | HR-сервисы | createRoute или редирект на /admin |
| 1.9 | Добавить маршруты /huntflow, /telegram* | Интеграции | createRoute или редирект на /admin |
| 1.10 | Добавить маршруты /reporting/*, /analytics/*, /compensation/* | C&B | createRoute или редирект |

### Фаза 2: Заглушки → Реальный контент

| № | Задача | Приоритет |
|---|--------|-----------|
| 2.1 | Workflow chat — реальный функционал | Высокий |
| 2.2 | Вакансии — список, карточки | Высокий |
| 2.3 | Заявки — список | Высокий |
| 2.4 | Интервью — список, календарь | Высокий |
| 2.5 | Роли — CRUD | Средний |
| 2.6 | Права доступа — матрица | Средний |
| 2.7 | Пользовательские поля — настройка | Средний |
| 2.8 | Workflow settings | Низкий |
| 2.9 | Настройки модулей — вкл/выкл | Средний |
| 2.10 | Рекрутинг landing, правила привлечения, шаблон оффера | Средний |
| 2.11 | Отчётность — дашборды | Высокий |

### Фаза 3: Модули с нуля

| № | Модуль | Зависимости |
|---|--------|-------------|
| 3.1 | ATS \| Talent Pool | API кандидатов, вакансий |
| 3.2 | Специализации | API специализаций |
| 3.3 | Проекты | API проектов |
| 3.4 | Справочник сотрудников | API сотрудников |
| 3.5 | Онбординг | API чек-листов |
| 3.6 | L&D (цели, курсы) | API целей, курсов |
| 3.7 | HR-сервисы | API документов, отпусков |
| 3.8 | Опросы | API опросов |
| 3.9 | C&B отчётность | API аналитики |
| 3.10 | Интеграции (Huntflow, Telegram) | API интеграций |

---

## 4. СПЕЦИФИКА ПО МОДУЛЯМ

### Рекрутинг
- **ATS:** пайплайн кандидатов, карточки, этапы, drag-and-drop
- **Интервью:** календарь слотов, приглашения, статусы
- **Вакансии:** список, создание, редактирование, публикация
- **Заявки:** workflow заявки на подбор

### Сотрудники
- **Специализации:** дерево направлений, конфигуратор
- **Проекты:** список, команды, аллокация
- **Справочник:** таблица сотрудников, фильтры, поиск
- **Оргструктура:** дерево/граф подразделений
- **Профили:** карточка сотрудника, таймлайн

### Онбординг
- **Чек-листы:** шаблоны, назначение, прогресс
- **Бадди:** назначение бадди, связь с новичком
- **Документы:** шаблоны документов для онбординга

### L&D
- **Эффективность:** OKR, цели, оценки, 360, Talent Pool
- **Обучение:** курсы, программы, матрица навыков

### C&B
- **Отчётность:** дашборды, отчёты по подбору/финансам/сотрудникам
- **Аналитика:** метрики, воронки
- **ЗП вилки, бенчмарки, льготы:** справочники и расчёты

---

## 5. ЗАВИСИМОСТИ МЕЖДУ МОДУЛЯМИ

```
Рекрутинг ←→ Вакансии, Интервьюеры, Кандидаты
Сотрудники ←→ Оргструктура, Специализации, Проекты
Онбординг ←→ Сотрудники
L&D ←→ Сотрудники, Эффективность
C&B ←→ Сотрудники, Рекрутинг, Финансы
Настройки компании ←→ Все модули (конфигурация)
Админка ←→ Схемы данных, справочники
```

---

## 6. СВОДКА ПО СТАТУСАМ

| Статус | Количество |
|--------|------------|
| Реализовано | ~35 страниц |
| PlaceholderPage | ~25 страниц |
| 404 (маршрут отсутствует) | ~50+ ссылок в меню |

---

*Документ — живой. Обновлять при изменении статусов.*
