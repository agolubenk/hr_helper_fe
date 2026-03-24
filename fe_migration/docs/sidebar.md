# Сайдбар и навигация (fe_migration)

Документ описывает **правый** основной сайдбар приложения (`Sidebar`), блок настроек под разделителем, **левый** сайдбар админки (`AdminSidebar`), источники ссылок и поведение.  
Визуальная сверка с приложением на :3000 **намеренно не выполнялась**: за основу взята перенесённая версия из нового фронта; маршруты приведены к роутеру Vite.

См. также: `SIDEBAR_MENU_SYNC.md` (история diff с `frontend`), `DETAILED_PLAN_STATUS.md` (п. 2.2).

---

## 1. Компоненты и расположение

| Компонент | Файл | Где показывается |
|-----------|------|------------------|
| Основной сайдбар | `src/components/Sidebar.tsx` | Внутри `AppLayout`, справа, `position: fixed` |
| Меню админки | `src/app/admin/AdminSidebar.tsx` | В `AdminLayoutShell`, слева |
| Конфиг основного меню | `src/config/menuConfig.tsx` | `MAIN_MENU_ITEMS`, `MENU_SECTIONS`, блоки главной |
| Конфиг «настроек» под чертой | `src/config/settingsMenuConfig.tsx` | `SETTINGS_MENU_ITEMS` |
| «Мои заявки / документы» | `src/config/profileRequestsConfig.ts` | `PROFILE_REQUESTS_BLOCKS` |
| Красная подпись / реализован ли маршрут | `src/config/sidebarLinkImplementation.ts` | `isImplementedAppRoute`, `shouldMarkSidebarLinkAsPlaceholder` |

---

## 2. Источники пунктов и ссылок

Полные деревья с **`id`**, подписями и **`href`** (включая все вложенные уровни): **§2.5–§2.9**.

### 2.1 Основное меню (`MAIN_MENU_ITEMS`)

- Иерархия: родитель с `children` **без собственного `href`** ведёт только раскрытие; листья с `href` вызывают `navigate(href)`.
- Порядок групп на экране задаётся `MENU_SECTIONS`: до первого `Separator` — календарь, workflow, задачи; после — модули (рекрутинг, онбординг, …).
- Пункт **`home` («Главная»)** в конфиге есть, но **рендерится отдельно сверху** с подменой `href` из localStorage (см. §4.1).

### 2.2 Блок после `Separator` (`SETTINGS_MENU_ITEMS`)

Порядок: **Профиль** → **Workflow settings** → **Интеграции и API** → **Настройки компании** (дерево) → **Admin**.

- **Интеграции и API** и **Профиль** ведут на `/account/profile`; активная вкладка профиля синхронизируется через `localStorage` ключ `profileActiveTab` и событие `localStorageChange` (см. `MenuItemComponent` в `Sidebar.tsx`).

### 2.3 Выпадающие списки у «Главная» и «Admin» (только в `Sidebar.tsx`)

Массив **`mainPagesByBlock`** (и **`adminMainPagesByBlock`** = блок «Админка» + те же страницы) **не дублирует** `menuConfig`: это список «главных» страниц для **сохранения выбора**, а не отдельное меню приложения.

### 2.4 Admin CRM (`AdminSidebar`)

Конфиг: `src/app/admin/config.ts` → **`ADMIN_MODULES`**. Ссылки ведут в уже существующие маршруты основного приложения (`/vacancies`, `/reporting`, …) или в `/admin/users`, `/admin/groups`.

### 2.5 Полная иерархия основного меню (`MAIN_MENU_ITEMS`)

Порядок групп на экране задаётся **`MENU_SECTIONS`**: сначала блок **«Основное меню»** (`calendar`, `workflow-chat`, `tasks`), затем **«Модули»** — все id из `MENU_LEVEL1_ORDER`, кроме перечисленных в первом блоке. Пункт **`home`** в массиве есть, но **рисуется отдельно** над списком (см. §4.1).

Узел **без** строки «→» имеет только `children` — по клику открывается/закрывается ветка, перехода по URL нет.

- **`home`** — Главная → *динамический* `href` из `localStorage` (`sidebarHomeHref`), по умолчанию **`/workflow`**
- **`calendar`** — Календарь → `/calendar`
- **`workflow-chat`** — Inbox / Workflow chat → `/workflow`
- **`tasks`** — Задачи → `/tasks`
- **`recruiting`** — Рекрутинг
  - **`ats`** — ATS | Talent Pool → `/ats/vacancy/1/candidate/1`
  - **`vacancies-list`** — Вакансии → `/vacancies`
  - **`vacancies-requests`** — Заявки на найм → `/hiring-requests`
  - **`invites`** — Интервью, ТЗ и скрининги → `/invites`
  - **`reporting-hiring-plan`** — План найма → `/reporting/hiring-plan`
  - **`recruiting-reports`** — Отчёты по подбору → `/reporting`
- **`onboarding`** — Онбординг
  - **`onboarding-programs`** — Программы онбординга → `/onboarding/programs`
  - **`onboarding-pool`** — Onboarding Pool → `/onboarding/pool`
  - **`onboarding-checklists`** — Чек‑листы → `/onboarding/checklists`
  - **`onboarding-buddy`** — Бадди‑система → `/onboarding/buddy`
  - **`onboarding-docs`** — Документы онбординга → `/onboarding/documents`
  - **`onboarding-reports`** — Отчёты по онбордингу → `/onboarding/reports`
- **`hr-services`** — HROps
  - **`hr-services-docs`** — Документы → `/hr-services/documents`
  - **`hr-services-onboarding`** — Onboarding → `/onboarding`
  - **`hr-services-leave`** — Отпуска и отсутствия → `/hr-services/leave`
  - **`hr-services-time`** — Учёт времени → `/hr-services/time-tracking`
  - **`hr-services-tickets`** — Тикет‑система → `/hr-services/tickets`
  - **`hr-services-offboarding`** — Offboarding → `/hr-services/offboarding`
- **`employee-relations`** — Employee relations
  - **`hr-services-employee-relations`** — Employee relations → `/hr-services/employee-relations`
  - **`employees-directory`** — Список сотрудников → `/employees`
  - **`employees-profiles`** — Профили → `/employees/profiles`
  - **`specializations`** — Специализации
    - **`specializations-all`** — Конфигуратор → `/specializations`
    - **`specializations-frontend`** — Frontend Development → `/specializations/frontend/info`
    - **`specializations-backend`** — Backend Development → `/specializations/backend/info`
  - **`employees-orgchart`** — Оргструктура → `/employees/org-chart`
  - **`employees-internal-vacancies`** — Внутренний рынок / Внутренние вакансии → `/internal-vacancies`
  - **`employees-teams`** — Команды → `/employees/teams`
- **`learning`** — L&D
  - **`learning-courses`** — Курсы → `/learning/courses`
  - **`learning-programs`** — Программы → `/learning/programs`
  - **`learning-skills`** — Матрица навыков → `/learning/skills-matrix`
  - **`learning-idp`** — Планы развития → `/learning/idp`
  - **`learning-reports`** — Отчёты по обучению → `/learning/reports`
- **`performance`** — Эффективность
  - **`performance-goals`** — Цели и OKR → `/performance/goals`
  - **`performance-reviews`** — Оценочные циклы → `/performance/reviews`
  - **`performance-rating-scales`** — Шкалы оценок → `/company-settings/rating-scales`
  - **`performance-ninebox`** — Nine‑box / калибровки → `/performance/ninebox`
  - **`performance-pip`** — PIP и планы улучшения → `/performance/pip`
- **`finance`** — C&B
  - **`finance-salary-ranges`** — Зарплатные вилки → `/vacancies/salary-ranges`
  - **`finance-benchmarks`** — Бенчмарки
    - **`benchmarks-dashboard`** — Dashboard → `/finance/benchmarks`
    - **`benchmarks-all`** — Все бенчмарки → `/finance/benchmarks/all`
  - **`compensation-benefits`** — Льготы и бонусы → `/compensation/benefits`
  - **`compensation-review`** — Пересмотр вознаграждения → `/compensation/review`
  - **`finance-reports`** — Отчёты по C&B → `/compensation/reports`
- **`hr-pr`** — HR PR и внутренняя коммуникация
  - **`internal-site-main`** — Внутренний сайт → `/internal-site`
  - **`internal-site-create`** — Посты / Создать пост → `/internal-site/post/create`
  - **`surveys`** — Опросы → `/hr-services/surveys`
  - **`wiki-all`** — Вики → `/wiki`
  - **`hr-pr-events`** — Ивенты и признание → `/hr-pr/events`
- **`projects`** — Проекты и ресурсы
  - **`projects-list`** — Список проектов → `/projects`
  - **`projects-teams`** — Команды проекта → `/projects/teams`
  - **`projects-resources`** — Ресурсы и аллокация → `/projects/resources`
  - **`projects-hr`** — HR‑проекты → `/projects/hr`
- **`analytics`** — Отчёты и аналитика
  - **`reporting-recruiting`** — По подбору → `/reporting`
  - **`reporting-employees`** — По сотрудникам и оргструктуре → `/reporting/employees`
  - **`reporting-finance`** — По финансам / cost of workforce → `/reporting/finance`
  - **`reporting-integrations`** — По интеграциям и SLA сервисов → `/reporting/integrations`
  - **`reporting-learning`** — L&D и эффективность → `/reporting/learning`
  - **`reporting-compensation`** — C&B и льготы → `/reporting/compensation`
  - **`analytics-builder`** — Конструктор дашбордов → `/analytics`
- **`integrations`** — Интеграции и автоматизации
  - **`integrations-list`** — Интеграции
    - **`integrations-huntflow`** — Huntflow → `/huntflow`
    - **`integrations-hh`** — hh.ru/rabota.by → `/integrations/hh`
    - **`integrations-telegram`** — Telegram → `/telegram`
    - **`integrations-n8n`** — n8n → `/integrations/n8n`
    - **`integrations-clickup`** — ClickUp → `/integrations/clickup`
    - **`integrations-notion`** — Notion → `/integrations/notion`
  - **`integrations-workflows`** — Automation / Workflows → `/settings/workflows`
  - **`integrations-aichat`** — AI Chat / Copilot → `/aichat`

### 2.6 Меню под разделителем (`SETTINGS_MENU_ITEMS`)

Порядок в массиве: **Профиль** → **Workflow settings** → **Интеграции и API** → **Настройки компании** → **Admin**.

- **`profile`** — Профиль → `/account/profile`
- **`settings-workflows`** — Workflow settings → `/settings/workflows`
- **`settings-integrations`** — Интеграции и API → `/account/profile` *(та же страница; вкладка через `profileActiveTab`, см. §4)*
- **`company-settings`** — Настройки компании → `/company-settings` *(корневой URL; также раскрытие дерева)*
  - **`basic-company-settings`** — Базовые настройки компании
    - **`company-general`** — Общие настройки компании → `/company-settings`
    - **`company-groups-legal`** — Группы компаний и юрлица → `/company-settings/legal-entities`
    - **`company-calendar`** — Рабочий календарь → `/company-settings/calendar`
    - **`company-org-model`** — Организационная модель → `/company-settings/org-model`
  - **`people-org-settings`** — Настройки людей и оргструктуры
    - **`company-settings-org-structure`** — Оргструктура → `/company-settings/org-structure`
    - **`company-settings-grades`** — Грейды и грейдовые модели → `/company-settings/grades`
    - **`specializations-settings`** — Специализации и карьерные треки → `/specializations`
    - **`company-settings-lifecycle`** — Жизненный цикл сотрудника → `/company-settings/employee-lifecycle`
    - **`company-settings-custom-fields`** — Пользовательские поля → `/settings/custom-fields`
  - **`module-settings`** — Настройки модулей (по доменам)
    - **`recruiting-settings`** — Рекрутинг → `/company-settings/recruiting` *(редирект на rules; также дочерние пункты)*
      - **`recruiting-settings-stages`** — Статусы воронки → `/company-settings/recruiting/stages`
      - **`recruiting-settings-sources`** — Источники кандидатов → `/company-settings/recruiting/sources`
      - **`recruiting-settings-templates`** — Шаблоны писем и оферов → `/company-settings/recruiting/offer-template`
      - **`recruiting-settings-vacancy-types`** — Типы вакансий → `/company-settings/recruiting/vacancy-types`
      - **`recruiting-settings-vacancy-permissions`** — Права по вакансиям → `/company-settings/recruiting/permissions`
      - **`recruiting-settings-interviewers`** — Интервьюеры → `/interviewers`
      - **`recruiting-settings-rules`** — Правила привлечения → `/company-settings/recruiting/rules`
      - **`recruiting-settings-commands`** — Команды workflow → `/company-settings/recruiting/commands`
      - **`recruiting-settings-candidate-fields`** — Дополнительные поля кандидатов → `/company-settings/recruiting/candidate-fields`
      - **`recruiting-settings-scorecard`** — Scorecard → `/company-settings/scorecard`
      - **`recruiting-settings-rating-scales`** — Шкалы оценок → `/company-settings/rating-scales`
      - **`recruiting-settings-sla`** — SLA → `/company-settings/sla`
      - **`recruiting-settings-vacancy-prompt`** — Единый промпт для вакансий → `/company-settings/vacancy-prompt`
      - **`recruiting-settings-candidate-responses`** — Ответы кандидатам → `/candidate-responses`
    - **`onboarding-settings`** — Онбординг
      - **`onboarding-templates`** — Шаблоны программ по ролям/локациям → `/settings/modules/onboarding`
      - **`onboarding-checklists`** — Чек-листы → `/onboarding/checklists`
      - **`onboarding-roles`** — Роли ответственных (HR, менеджер, бадди) → `/company-settings/onboarding-roles`
    - **`hr-ops-settings`** — HROps
      - **`hr-ops-doc-types`** — Типы документов → `/company-settings/hr-ops/doc-types`
      - **`hr-ops-approval-routes`** — Маршруты согласования → `/company-settings/hr-ops/approval-routes`
      - **`hr-ops-leave-processes`** — Процессы отпусков и отсутствий → `/company-settings/hr-ops/leave`
      - **`hr-ops-time-tracking`** — Правила учёта времени → `/company-settings/hr-ops/time-tracking`
    - **`employees-module-settings`** — Сотрудники
      - **`employees-contract-types`** — Типы контрактов → `/settings/modules/employees`
      - **`employees-categories`** — Категории (staff/contractor/intern) → `/company-settings/employees/categories`
      - **`employees-data-policies`** — Политики хранения данных → `/company-settings/employees/data-policies`
    - **`learning-settings`** — L&D
      - **`learning-course-types`** — Типы курсов → `/settings/modules/learning`
      - **`learning-providers`** — Внешние провайдеры → `/company-settings/learning/providers`
      - **`learning-catalogs`** — Каталоги → `/company-settings/learning/catalogs`
      - **`learning-mandatory-rules`** — Правила обязательных курсов → `/company-settings/learning/mandatory`
    - **`performance-settings`** — Эффективность
      - **`performance-review-types`** — Типы оценок (1-1, 360, probation) → `/settings/modules/performance`
      - **`company-settings-rating-scales`** — Шкалы → `/company-settings/rating-scales`
      - **`performance-cycle-duration`** — Длительность циклов → `/company-settings/performance/cycles`
      - **`performance-form-templates`** — Шаблоны форм → `/company-settings/performance/forms`
    - **`compensation-settings`** — C&B
      - **`compensation-bands`** — Модели вилок (midpoint/graded) → `/vacancies/salary-ranges`
      - **`compensation-currency`** — Валюта по локациям → `/company-settings/finance`
      - **`compensation-indexation`** — Правила индексации → `/company-settings/compensation/indexation`
      - **`compensation-grades-link`** — Связи с грейдами → `/company-settings/grades`
    - **`hr-pr-settings`** — HR PR / Коммуникации
      - **`hr-pr-site-sections`** — Разделы внутреннего сайта → `/internal-site`
      - **`hr-pr-survey-types`** — Типы опросов → `/hr-services/surveys`
      - **`hr-pr-anonymity`** — Правила анонимности → `/company-settings/hr-pr/anonymity`
      - **`hr-pr-moderation`** — Модерация → `/company-settings/hr-pr/moderation`
    - **`projects-settings`** — Проекты
      - **`projects-types`** — Типы проектов → `/projects`
      - **`projects-statuses`** — Статусы → `/company-settings/projects/statuses`
      - **`projects-role-templates`** — Шаблоны ролей → `/company-settings/projects/roles`
      - **`projects-cost-center`** — Связь с cost-center'ами → `/company-settings/projects/cost-centers`
    - **`hr-services-settings`** — HR-сервисы
      - **`hr-services-ticket-types`** — Типы сервисов/тикетов → `/settings/modules/hr-services`
      - **`hr-services-sla`** — SLA → `/company-settings/sla`
      - **`hr-services-escalation`** — Маршруты эскалации → `/company-settings/hr-services/escalation`
  - **`analytics-data-settings`** — Настройки аналитики и данных
    - **`analytics-data-sources`** — Источники данных → `/company-settings/analytics/data-sources`
    - **`analytics-metrics`** — Справочники метрик → `/company-settings/analytics/metrics`
    - **`analytics-dashboard-access`** — Доступ к дашбордам → `/company-settings/analytics/access`
    - **`analytics-retention`** — Политики хранения и ретеншн → `/company-settings/analytics/retention`
  - **`automations-integrations`** — Автоматизации и интеграции
    - **`automations-triggers`** — Конструктор триггеров и действий → `/settings/workflows`
    - **`automations-templates`** — Шаблоны сценариев → `/company-settings/automations/templates`
    - **`company-settings-integrations`** — Интеграции и API → `/company-settings/integrations`
    - **`automations-logs`** — Логи автоматизаций → `/company-settings/automations/logs`
  - **`security-access`** — Безопасность и доступы
    - **`settings-roles`** — Роли и права (RBAC) → `/settings/roles`
    - **`settings-user-groups`** — Группы пользователей → `/settings/user-groups`
    - **`settings-permissions`** — Права доступа → `/settings/permissions`
    - **`settings-users-list`** — Пользователи → `/settings/users`
    - **`security-sso`** — SSO и аутентификация → `/company-settings/security/sso`
    - **`security-audit`** — Аудит-лог → `/company-settings/security/audit`
  - **`system-settings`** — Системные настройки
    - **`settings-modules`** — Модули (вкл/выкл) → `/settings/modules`
    - **`system-localization`** — Локализация и переводы → `/company-settings/system/localization`
    - **`system-email-gateways`** — Email/SMS/мессенджер-шлюзы → `/company-settings/system/gateways`
    - **`system-sandbox`** — Песочница/стенд → `/company-settings/system/sandbox`
- **`admin`** — Admin → *динамический* `href` из `localStorage` (`sidebarAdminHomeHref`), по умолчанию **`/admin`**

### 2.7 Выпадающий список «Настройки главной» (`mainPagesByBlock` в `Sidebar.tsx`)

Используется у пункта **«Главная»** (шестерёнка): **только сохраняет** выбранный URL в `sidebarHomeHref`, переход не выполняется. Структура по блокам:

- **Главная** — Home Page → `/`
- **Календарь** — Календарь → `/calendar`
- **Inbox / Workflow chat** — Workflow → `/workflow`
- **Задачи** — Мои задачи → `/tasks`
- **Рекрутинг** — ATS | Talent Pool → `/ats/vacancy/1/candidate/1`; Вакансии → `/vacancies`; Заявки на найм → `/hiring-requests`; Интервью, ТЗ и скрининги → `/invites`; План найма → `/reporting/hiring-plan`; Отчёты по подбору → `/reporting`
- **Онбординг** — Программы онбординга → `/onboarding/programs`; Onboarding Pool → `/onboarding/pool`; Чек‑листы → `/onboarding/checklists`; Бадди‑система → `/onboarding/buddy`; Документы онбординга → `/onboarding/documents`; Отчёты по онбордингу → `/onboarding/reports`
- **HROps** — Документы → `/hr-services/documents`; Onboarding → `/onboarding`; Отпуска и отсутствия → `/hr-services/leave`; Учёт времени → `/hr-services/time-tracking`; Тикет‑система → `/hr-services/tickets`; Offboarding → `/hr-services/offboarding`
- **Employee relations** — Employee relations → `/hr-services/employee-relations`; Список сотрудников → `/employees`; Профили → `/employees/profiles`; Специализации → `/specializations`; Оргструктура → `/employees/org-chart`; Внутренние вакансии → `/internal-vacancies`; Команды → `/employees/teams`
- **L&D** — Курсы → `/learning/courses`; Программы → `/learning/programs`; Матрица навыков → `/learning/skills-matrix`; Планы развития → `/learning/idp`; Отчёты по обучению → `/learning/reports`
- **Эффективность** — Цели и OKR → `/performance/goals`; Оценочные циклы → `/performance/reviews`; Шкалы оценок → `/company-settings/rating-scales`; Nine‑box / калибровки → `/performance/ninebox`; PIP и планы улучшения → `/performance/pip`
- **C&B** — Зарплатные вилки → `/vacancies/salary-ranges`; Бенчмарки (обзор) → `/finance/benchmarks`, список → `/finance/benchmarks/all`; Льготы и бонусы → `/compensation/benefits`; Пересмотр вознаграждения → `/compensation/review`; Отчёты по C&B → `/compensation/reports`
- **HR PR и внутренняя коммуникация** — Внутренний сайт → `/internal-site`; Посты / Создать пост → `/internal-site/post/create`; Опросы → `/hr-services/surveys`; Вики → `/wiki`; Ивенты и признание → `/hr-pr/events`
- **Проекты и ресурсы** — Список проектов → `/projects`; Команды проекта → `/projects/teams`; Ресурсы и аллокация → `/projects/resources`; HR‑проекты → `/projects/hr`
- **Отчёты и аналитика** — По подбору → `/reporting`; По сотрудникам и оргструктуре → `/reporting/employees`; По финансам → `/reporting/finance`; По интеграциям и SLA → `/reporting/integrations`; L&D и эффективность → `/reporting/learning`; C&B и льготы → `/reporting/compensation`; Конструктор дашбордов → `/analytics`
- **Интеграции и автоматизации** — Huntflow → `/huntflow`; hh.ru/rabota.by → `/integrations/hh`; Telegram → `/telegram`; n8n → `/integrations/n8n`; ClickUp → `/integrations/clickup`; Notion → `/integrations/notion`; Automation / Workflows → `/settings/workflows`; AI Chat / Copilot → `/aichat`

**`adminMainPagesByBlock`** = блок **«Админка»** (Главная админки → `/admin`) + все строки выше — используется в выпадающем списке у пункта **Admin** (сохранение `sidebarAdminHomeHref`).

### 2.8 Блок «Заявки» у профиля (`PROFILE_REQUESTS_BLOCKS`)

Выпадающий список (шестерёнка рядом с **Профилем**): выбор **сохраняет** `sidebarProfileRequestsHref` и выполняет переход.

- **Мои заявки** — Доступы → `/hr-services/access`; Отпуска → `/hr-services/leave`; Тикеты → `/hr-services/tickets`; Запросы на обучение → `/learning/requests`; Льготы → `/my-requests/benefits`; Прочие → `/my-requests/other`
- **Мои документы** — Договора → `/my-documents/contracts`; Справки → `/my-documents/certificates`; Политики → `/my-documents/policies`; Акцепты → `/my-documents/acceptances`

Кнопка с подписью рядом с **«+»** ведёт на сохранённый `profileRequestsHref` (подпись берётся из совпадения `href` в этом конфиге).

### 2.9 Левый сайдбар админки (`ADMIN_MODULES`)

Группы и ссылки (компонент `AdminSidebar`, файл `src/app/admin/config.ts`):

- **Учётные записи** — Пользователи → `/admin/users`; Группы → `/admin/groups`
- **Вакансии** — Список вакансий → `/vacancies`; Зарплатные вилки → `/vacancies/salary-ranges`
- **Рекрутинг** — Интервью (инвайты) → `/invites`; Интервьюеры → `/interviewers`; Заявки → `/hiring-requests`
- **Отчётность** — Главная отчётности → `/reporting`; План найма → `/reporting/hiring-plan`; По компании → `/reporting/company`
- **Настройки компании** — Общие → `/company-settings`; Оргструктура → `/company-settings/org-structure`; Грейды → `/company-settings/grades`; Этапы найма → `/company-settings/recruiting/stages`
- **Интеграции** — Huntflow → `/huntflow`; Календарь → `/calendar`; Вики → `/wiki`

> **Синхронизация с кодом:** при изменении `menuConfig.tsx`, `settingsMenuConfig.tsx`, `Sidebar.tsx` или конфигов админки обновляйте подразделы **§2.5–§2.9**, чтобы документ оставался справочником «1:1» с деревом меню.

---

## 3. Подсветка «не задействованных» ссылок (красный текст)

Пункты меню с **внутренним** `href`, для которых **нет** полноценной страницы в роутере (открывается `ModulePlaceholderPage` или был бы 404), отображаются **красным цветом подписи** (`var(--red-11)` в Radix Themes).

- Логика: `shouldMarkSidebarLinkAsPlaceholder` / `isImplementedAppRoute` в **`src/config/sidebarLinkImplementation.ts`**.
- При добавлении нового **реального** маршрута в `App.tsx` нужно обновить этот файл, иначе пункт останется красным.
- Внешние ссылки (`external: true`), родительские пункты **без** `href` и разделы только с раскрытием **не** красятся.
- Иконки и шевроны вложенности остаются в нейтральной гамме; меняется **только текст** метки пункта.

---

## 4. Поведение и логика (`Sidebar.tsx`)

### 4.1 Ключи `localStorage`

| Ключ | Назначение |
|------|------------|
| `sidebarMenuOpen` | Открыт ли сайдбар (в `AppLayout`, не в этом файле) |
| `sidebarHomeHref` | Цель клика по пункту «Главная» (по умолчанию `/workflow`) |
| `sidebarAdminHomeHref` | Цель клика по «Admin» (по умолчанию `/admin`) |
| `sidebarProfileRequestsHref` | Цель кнопки «Заявки» у профиля (по умолчанию `/hr-services/access`) |
| `profileActiveTab` | Вкладка на `/account/profile`: `profile` \| `integrations` |

Выбор в шестерёнках у «Главная» / «Admin» **только сохраняет** href, **переход не выполняет**. Исключение: выпадающий список у блока «Заявки» — пункт выбирает href, сохраняет и сразу `navigate`.

### 4.2 Активное состояние пунктов

- Для листьев: совпадение `pathname` с `href` или префикс (кроме корня `/`).
- Много **специальных правил** по `item.id` (рекрутинг, финансы, wiki, специализации, `module-settings`, …) — функция `isItemOrChildrenActive` и дублирующая логика в `menuSections.map` для `isActive`.
- На странице **`/ats`** сайдбар сдвигается вниз: `topOffset = 112px` (шапка + `StatusBar`), иначе `64px`.

### 4.3 Пункты «в разработке»

`IN_DEVELOPMENT_IDS` — пустой `Set`: все пункты ведут по `href` (без toast-заглушек).

### 4.4 Мобильная ширина

После внутренней навигации меню закрывается, если `window.innerWidth < 768` (`onNavigate` → `onClose` из `AppLayout`).

### 4.5 Внешние ссылки

`item.external === true` → `window.open(href, '_blank')` (иконка «открыть в новом окне» в строке пункта).

### 4.6 Кнопки у «Профиль»

- **«+»** — переход на `/hiring-requests`.
- **Подпись заявок** — на сохранённый `profileRequestsHref`.
- **Шестерёнка** — выбор из `PROFILE_REQUESTS_BLOCKS` (см. `profileRequestsConfig.ts`).

### 4.7 Блок «Admin»

- Клик по пункту — переход на `adminHomeHref`.
- Кнопка с подписью страницы — `window.open(adminHomeHref, …)` в новой вкладке.
- Выпадающий список: «Текущая страница» записывает текущий `pathname` как главную админки; остальные пункты — первый `href` блока из `adminMainPagesByBlock` (грубое сопоставление блок → один URL).

---

## 5. Маршрутизация и проверка ссылок

Все `href` из меню должны **разрешаться роутером** (`src/app/App.tsx`): либо полноценная страница, либо заглушка.

### 5.1 Заглушка модулей

`src/app/pages/ModulePlaceholderPage.tsx` — текст «Раздел в разработке» и текущий `pathname`.  
Обёртка: `AppModulePlaceholder` в `App.tsx` (передаётся `pageTitle` для шапки).

### 5.2 Префиксы, закрытые заглушками

| Префикс / путь | Заголовок в шапке |
|-----------------|-------------------|
| `/company-settings/*` (кроме явно объявленных ранее маршрутов) | Настройки компании |
| `/reporting/*` (кроме `/reporting`, `/reporting/company`, `/reporting/hiring-plan`, `/reporting/hiring-plan/yearly`) | Отчётность |
| `/tasks` | Задачи |
| `/onboarding`, `/onboarding/*` | Онбординг |
| `/hr-services/*` | HROps |
| `/employees`, `/employees/*` | Сотрудники |
| `/internal-vacancies` | Внутренние вакансии |
| `/learning/*` | L&D |
| `/performance/*` | Эффективность |
| `/compensation/*` | C&B |
| `/internal-site`, `/internal-site/*` | Внутренний сайт |
| `/hr-pr/*` | HR PR |
| `/analytics` | Аналитика |
| `/settings/*` | Настройки |
| `/integrations/*` | Интеграции |
| `/my-requests/*`, `/my-documents/*` | Мои заявки / Мои документы |
| `/projects/hr` | HR‑проекты (отдельно от `/projects/:id`, чтобы не маскироваться под карточку проекта) |

Явные маршруты **выше** по объявлению имеют приоритет над `*` / `/*` (React Router v6).

### 5.3 Уже реализованные разделы (кратко)

Домены с отдельными страницами включают, среди прочего: `/`, `/workflow`, `/calendar`, `/aichat`, `/huntflow`, `/vacancies`, `/hiring-requests`, `/invites`, `/ats/...`, `/wiki`, `/wiki-new`, `/telegram`, `/projects`, `/specializations/...`, блок `/company-settings/...` из списка в `App.tsx`, `/finance/benchmarks`, `/finance/benchmarks/all`, `/account/profile`, `/admin/...`.

При добавлении новой страницы: **либо** зарегистрировать маршрут **до** соответствующего catch-all, **либо** убрать префикс из заглушек; **и** обновить **`sidebarLinkImplementation.ts`**, чтобы убрать красную подпись.

---

## 6. Справка: идентификаторы верхнего уровня основного меню

Соответствие `id` → раздел (для туров `data-tour="sidebar-{id}"` и логики активности):

`calendar`, `workflow-chat`, `tasks`, `recruiting`, `onboarding`, `hr-services`, `employee-relations`, `learning`, `performance`, `finance`, `hr-pr`, `projects`, `analytics`, `integrations`.

---

## 7. Сопровождение

- Меняется только текст/иконка/порядок → править `menuConfig.tsx` / `settingsMenuConfig.tsx`.
- После правок меню — обновить **§2.5–§2.9** (детальная структура) и при необходимости §5.
- Новый **корневой** URL → добавить `Route` в `App.tsx`, правило в `sidebarLinkImplementation.ts` и при необходимости строку в §5.
- Намеренные отличия от legacy — `MIGRATION_DIVERGENCES.md`.

*Последнее обновление: март 2026.*
