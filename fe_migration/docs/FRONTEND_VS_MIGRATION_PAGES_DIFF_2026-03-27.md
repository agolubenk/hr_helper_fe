# Сравнение страниц `frontend` и `fe_migration` (2026-03-27)

Документ фиксирует страницы двух приложений:
- `frontend` (новая платформа): `frontend/src/app/router/index.tsx`
- `fe_migration` (миграционный фронт): `fe_migration/src/app/App.tsx`

Параметры в URL нормализованы к виду `:param` (например, `:id`, `:slug`).

## 1) Общие страницы (есть в обоих приложениях)

Всего общих маршрутов: **47**.

### 1.1 Общие страницы с зафиксированными различиями

| Маршрут | Статус различий | Источник |
|---|---|---|
| `/workflow` | Есть зафиксированные UI/UX-отличия (сайдбар, кнопки отказа, поведение шапки) | `MIGRATION_DIVERGENCES.md` §3 |
| `/wiki` | Отличия зафиксированы; полная сверка отложена отдельной задачей | `MIGRATION_DIVERGENCES.md` §5, §11 |
| `/account/profile` | Есть зафиксированные отличия профиля/расписания/UI | `MIGRATION_DIVERGENCES.md` §7 |
| `/company-settings/integrations` | Отличия и follow-up по API/UX зафиксированы | `MIGRATION_DIVERGENCES.md` §12.2 |

### 1.2 Общие страницы без отдельных зафиксированных расхождений

Для страниц ниже явные различия отдельным документом не зафиксированы (нужен smoke/визуальная сверка при необходимости):

- `/`
- `/admin`
- `/aichat`
- `/ats`
- `/ats/vacancy/:vacancyId/candidate/:candidateId`
- `/ats/vacancy/:vacancyId/candidate/:candidateId/assessment/:assessmentId`
- `/ats/vacancy/:vacancyId/candidate/:candidateId/assessment/:assessmentId/edit`
- `/ats/vacancy/:vacancyId/candidate/:candidateId/assessment/new`
- `/calendar`
- `/candidate-responses`
- `/company-settings`
- `/company-settings/candidate-fields`
- `/company-settings/employee-lifecycle`
- `/company-settings/finance`
- `/company-settings/grades`
- `/company-settings/org-structure`
- `/company-settings/rating-scales`
- `/company-settings/recruiting`
- `/company-settings/recruiting/commands`
- `/company-settings/recruiting/offer-template`
- `/company-settings/recruiting/rules`
- `/company-settings/recruiting/stages`
- `/company-settings/scorecard`
- `/company-settings/sla`
- `/company-settings/user-groups`
- `/company-settings/users`
- `/company-settings/vacancy-prompt`
- `/errors/401`
- `/errors/402`
- `/errors/403`
- `/errors/500`
- `/finance/benchmarks`
- `/hiring-requests`
- `/huntflow`
- `/internal-site`
- `/interviewers`
- `/invites`
- `/reporting`
- `/reporting/company`
- `/reporting/hiring-plan`
- `/reporting/hiring-plan/yearly`
- `/specializations`
- `/vacancies`
- `/vacancies/salary-ranges`
- `/workflow`

## 2) Страницы только в `fe_migration`

Всего маршрутов только в `fe_migration`: **39**.

- `/account/forgot-password`
- `/account/login`
- `/account/reset-password`
- `/admin-crm`
- `/analytics`
- `/ats/vacancy/:vacancyId`
- `/company-settings/Scorecard`
- `/company-settings/finance/benchmarks`
- `/company-settings/recruiting/candidate-fields`
- `/company-settings/recruiting/message-templates`
- `/company-settings/recruiting/response-templates`
- `/company-settings/recruiting/templates`
- `/company-settings/recruiting/vacancy-fields`
- `/company-settings/vacancy-fields`
- `/employees`
- `/errors/forbidden`
- `/finance`
- `/finance/benchmarks/all`
- `/internal-vacancies`
- `/invites/:id`
- `/invites/:id/edit`
- `/onboarding`
- `/projects`
- `/projects/:id`
- `/projects/hr`
- `/projects/resources`
- `/projects/teams`
- `/search`
- `/tasks`
- `/telegram`
- `/telegram/2fa`
- `/telegram/chats`
- `/vacancies/:id`
- `/vacancies/:id/edit`
- `/vacancies/salary-ranges/:id`
- `/wiki-new`
- `/wiki-new/:id`
- `/wiki-new/:id/edit`
- `/wiki/:id`
- `/wiki/:id/edit`

## 3) Страницы только в `frontend`

Всего маршрутов только в `frontend`: **27**.

- `/ai/recruiter-chat`
- `/calendar/settings`
- `/company-settings/calendar`
- `/company-settings/meeting-settings`
- `/errors/404`
- `/integrations/telegram`
- `/internal-site/post/:slug`
- `/internal-site/post/:slug/edit`
- `/internal-site/post/create`
- `/recruiting/huntflow`
- `/settings/custom-fields`
- `/settings/modules`
- `/settings/modules/employees`
- `/settings/modules/finance`
- `/settings/modules/hr-services`
- `/settings/modules/learning`
- `/settings/modules/onboarding`
- `/settings/modules/performance`
- `/settings/permissions`
- `/settings/roles`
- `/settings/user-groups`
- `/settings/users`
- `/settings/workflows`
- `/wiki/create`
- `/wiki/page/:slug`
- `/wiki/page/:slug/edit`

## 4) Краткий вывод

- Основной каркас (вакансии, hiring, profile, company-settings, reporting, ATS, wiki) пересекается.
- `fe_migration` содержит больше legacy- и migration-ориентированных страниц/редиректов.
- `frontend` содержит отдельные новые/структурированные ветки (`/settings/*`, `/wiki/page/:slug`, `/internal-site/post/*`, часть AI/интеграций).
- Для точной оценки поведенческих отличий по общим маршрутам нужно пройти smoke по `MIGRATION_CHECK_URLS.md` и фиксировать находки в `MIGRATION_DIVERGENCES.md` §9.

