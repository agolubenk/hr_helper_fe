# Ссылки для финальной приёмки миграции (fe_migration)

Базовый URL: **http://localhost:3002** (эталон Next — обычно 3001).

**Отличия от эталона не правим втихую** — заносим в **[MIGRATION_DIVERGENCES.md](./MIGRATION_DIVERGENCES.md)** (журнал §9 при поштучной приёмке).

**Общая очередь задач после переноса маршрутов:** **[../MIGRATION_PLAN_UPD.md](../MIGRATION_PLAN_UPD.md)**.

Полный перечень маршрутов из `src/app/App.tsx`. Отмечайте галочками при smoke-тесте.

---

## Главная и основной хаб

- [http://localhost:3002/](http://localhost:3002/)
- [http://localhost:3002/workflow](http://localhost:3002/workflow)
- [http://localhost:3002/aichat](http://localhost:3002/aichat)
- [http://localhost:3002/huntflow](http://localhost:3002/huntflow)
- [http://localhost:3002/calendar](http://localhost:3002/calendar)
- [http://localhost:3002/search](http://localhost:3002/search)
- [http://localhost:3002/interviewers](http://localhost:3002/interviewers)
- [http://localhost:3002/candidate-responses](http://localhost:3002/candidate-responses)

## Вакансии и найм

- [http://localhost:3002/vacancies](http://localhost:3002/vacancies)
- [http://localhost:3002/vacancies/1](http://localhost:3002/vacancies/1) (редирект)
- [http://localhost:3002/vacancies/1/edit](http://localhost:3002/vacancies/1/edit) (редирект)
- [http://localhost:3002/vacancies/salary-ranges](http://localhost:3002/vacancies/salary-ranges)
- [http://localhost:3002/vacancies/salary-ranges/1](http://localhost:3002/vacancies/salary-ranges/1) (редирект)
- [http://localhost:3002/hiring-requests](http://localhost:3002/hiring-requests)
- [http://localhost:3002/invites](http://localhost:3002/invites)
- [http://localhost:3002/invites/1](http://localhost:3002/invites/1) (редирект)
- [http://localhost:3002/invites/1/edit](http://localhost:3002/invites/1/edit) (редирект)

## Аккаунт

- [http://localhost:3002/account/login](http://localhost:3002/account/login)
- [http://localhost:3002/account/forgot-password](http://localhost:3002/account/forgot-password)
- [http://localhost:3002/account/reset-password](http://localhost:3002/account/reset-password)
- [http://localhost:3002/account/profile](http://localhost:3002/account/profile)

## Финансы (редиректы и бенчмарки)

- [http://localhost:3002/finance](http://localhost:3002/finance) → `/company-settings/finance`
- [http://localhost:3002/finance/benchmarks](http://localhost:3002/finance/benchmarks)

## Настройки компании

См. также детальный список: [PHASE12_CHECK_LINKS.md](./PHASE12_CHECK_LINKS.md) (раздел «Фаза 12»).

- [http://localhost:3002/company-settings](http://localhost:3002/company-settings)
- [http://localhost:3002/company-settings/org-structure](http://localhost:3002/company-settings/org-structure)
- [http://localhost:3002/company-settings/grades](http://localhost:3002/company-settings/grades)
- [http://localhost:3002/company-settings/rating-scales](http://localhost:3002/company-settings/rating-scales)
- [http://localhost:3002/company-settings/employee-lifecycle](http://localhost:3002/company-settings/employee-lifecycle)
- [http://localhost:3002/company-settings/finance](http://localhost:3002/company-settings/finance)
- [http://localhost:3002/company-settings/integrations](http://localhost:3002/company-settings/integrations)
- [http://localhost:3002/company-settings/user-groups](http://localhost:3002/company-settings/user-groups)
- [http://localhost:3002/company-settings/users](http://localhost:3002/company-settings/users)
- [http://localhost:3002/company-settings/recruiting](http://localhost:3002/company-settings/recruiting) → rules
- [http://localhost:3002/company-settings/recruiting/rules](http://localhost:3002/company-settings/recruiting/rules)
- [http://localhost:3002/company-settings/recruiting/stages](http://localhost:3002/company-settings/recruiting/stages)
- [http://localhost:3002/company-settings/recruiting/commands](http://localhost:3002/company-settings/recruiting/commands)
- [http://localhost:3002/company-settings/candidate-fields](http://localhost:3002/company-settings/candidate-fields)
- [http://localhost:3002/company-settings/scorecard](http://localhost:3002/company-settings/scorecard)
- [http://localhost:3002/company-settings/sla](http://localhost:3002/company-settings/sla)
- [http://localhost:3002/company-settings/vacancy-prompt](http://localhost:3002/company-settings/vacancy-prompt)
- [http://localhost:3002/company-settings/recruiting/offer-template](http://localhost:3002/company-settings/recruiting/offer-template)
- [http://localhost:3002/company-settings/finance/benchmarks](http://localhost:3002/company-settings/finance/benchmarks)

## Wiki

- [http://localhost:3002/wiki](http://localhost:3002/wiki)
- [http://localhost:3002/wiki/1](http://localhost:3002/wiki/1) (пример id из моков — подставьте актуальный)
- [http://localhost:3002/wiki/1/edit](http://localhost:3002/wiki/1/edit)
- [http://localhost:3002/wiki-new](http://localhost:3002/wiki-new)
- [http://localhost:3002/wiki-new/1](http://localhost:3002/wiki-new/1)
- [http://localhost:3002/wiki-new/1/edit](http://localhost:3002/wiki-new/1/edit)

## Отчётность

- [http://localhost:3002/reporting](http://localhost:3002/reporting)
- [http://localhost:3002/reporting/company](http://localhost:3002/reporting/company)
- [http://localhost:3002/reporting/hiring-plan](http://localhost:3002/reporting/hiring-plan)
- [http://localhost:3002/reporting/hiring-plan/yearly](http://localhost:3002/reporting/hiring-plan/yearly)

## Telegram

- [http://localhost:3002/telegram](http://localhost:3002/telegram)
- [http://localhost:3002/telegram/2fa](http://localhost:3002/telegram/2fa)
- [http://localhost:3002/telegram/chats](http://localhost:3002/telegram/chats)

## Проекты

- [http://localhost:3002/projects](http://localhost:3002/projects)
- [http://localhost:3002/projects/1](http://localhost:3002/projects/1) (id из моков)
- [http://localhost:3002/projects/teams](http://localhost:3002/projects/teams)
- [http://localhost:3002/projects/resources](http://localhost:3002/projects/resources)

## ATS

- [http://localhost:3002/ats](http://localhost:3002/ats)
- [http://localhost:3002/ats/vacancy/1/candidate/1](http://localhost:3002/ats/vacancy/1/candidate/1)
- [http://localhost:3002/ats/vacancy/1/candidate/1/assessment/new](http://localhost:3002/ats/vacancy/1/candidate/1/assessment/new)
- [http://localhost:3002/ats/vacancy/1/candidate/1/assessment/a-101](http://localhost:3002/ats/vacancy/1/candidate/1/assessment/a-101)
- [http://localhost:3002/ats/vacancy/1/candidate/1/assessment/a-101/edit](http://localhost:3002/ats/vacancy/1/candidate/1/assessment/a-101/edit)

## Админка

- [http://localhost:3002/admin](http://localhost:3002/admin)
- [http://localhost:3002/admin/users](http://localhost:3002/admin/users)
- [http://localhost:3002/admin/groups](http://localhost:3002/admin/groups)
- [http://localhost:3002/admin-crm](http://localhost:3002/admin-crm) (редирект)

## Специализации

Подставьте `:id` из моков (например `1`).

- [http://localhost:3002/specializations](http://localhost:3002/specializations)
- [http://localhost:3002/specializations/1/info](http://localhost:3002/specializations/1/info)
- [http://localhost:3002/specializations/1/grades](http://localhost:3002/specializations/1/grades)
- [http://localhost:3002/specializations/1/matrix](http://localhost:3002/specializations/1/matrix)
- [http://localhost:3002/specializations/1/career](http://localhost:3002/specializations/1/career)
- [http://localhost:3002/specializations/1/vacancies](http://localhost:3002/specializations/1/vacancies)
- [http://localhost:3002/specializations/1/allocation](http://localhost:3002/specializations/1/allocation)
- [http://localhost:3002/specializations/1/preview](http://localhost:3002/specializations/1/preview)

## Страницы ошибок

- [http://localhost:3002/errors/401](http://localhost:3002/errors/401)
- [http://localhost:3002/errors/402](http://localhost:3002/errors/402)
- [http://localhost:3002/errors/403](http://localhost:3002/errors/403)
- [http://localhost:3002/errors/forbidden](http://localhost:3002/errors/forbidden)
- [http://localhost:3002/errors/500](http://localhost:3002/errors/500)
- Несуществующий путь → 404 (wildcard в `App.tsx`)

---

## Рекомендуемый порядок

1. `npm run build` в `fe_migration`.
2. Пройти блоки сверху вниз или по разделам Sidebar на 3002.
3. Для каждого расхождения с 3001 — заметка в трекере (часть G плана миграции).
