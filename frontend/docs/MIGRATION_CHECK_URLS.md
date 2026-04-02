# Ссылки для финальной приёмки миграции (fe_migration)

Базовый URL: **http://localhost:3000** (эталон Next — обычно 3001).

> Актуализация портов (2026-03-26): миграция (`fe_migration`) теперь работает на `3000`.
> Если в ссылках ниже встречается `localhost:3002`, используйте тот же путь на `localhost:3000`.

**Отличия от эталона не правим втихую** — заносим в **[MIGRATION_DIVERGENCES.md](./MIGRATION_DIVERGENCES.md)** (журнал §9 при поштучной приёмке).

**Мастер-план остатка (фазы 1–15):** **[../../Детальный план остаточной миграции hr_helper_fe.md](../../Детальный%20план%20остаточной%20миграции%20hr_helper_fe.md)**.  
**Статус по фазам:** **[./DETAILED_PLAN_STATUS.md](./DETAILED_PLAN_STATUS.md)**.  
**Общая очередь (smoke, хвосты):** **[../../MIGRATION_PLAN_UPD.md](../../MIGRATION_PLAN_UPD.md)** (корень репозитория).

**Исключения из доработок в рамках миграции:** `Sidebar`, `Header`, `Footer`, `FloatingActions` (позиция `left: 12px`). При smoke проверяем только отсутствие регресса.

**Дерево пунктов сайдбара (все `href`, вложенность):** **[sidebar.md](./sidebar.md)** (§2.5–§2.9).

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
- [http://localhost:3002/finance/benchmarks](http://localhost:3002/finance/benchmarks) (дашборд)
- [http://localhost:3002/finance/benchmarks/all](http://localhost:3002/finance/benchmarks/all) (список)

## Настройки компании

> **Статус фазы 8:** автоматическая сверка каталога **`components/company-settings/`** зафиксирована в **[COMPANY_SETTINGS_PHASE8.md](./COMPANY_SETTINGS_PHASE8.md)** и **`MIGRATION_DIVERGENCES.md` §12**. Ручной проход URL ниже — **обязателен** для закрытия приёмки; новые находки — в **`MIGRATION_DIVERGENCES.md` §9**.

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
- [http://localhost:3002/company-settings/recruiting/candidate-fields](http://localhost:3002/company-settings/recruiting/candidate-fields) (старый `/company-settings/candidate-fields` редиректит сюда)
- [http://localhost:3002/company-settings/scorecard](http://localhost:3002/company-settings/scorecard)
- [http://localhost:3002/company-settings/sla](http://localhost:3002/company-settings/sla)
- [http://localhost:3002/company-settings/vacancy-prompt](http://localhost:3002/company-settings/vacancy-prompt)
- [http://localhost:3002/company-settings/recruiting/offer-template](http://localhost:3002/company-settings/recruiting/offer-template)
- [http://localhost:3002/company-settings/finance/benchmarks](http://localhost:3002/company-settings/finance/benchmarks)

## Wiki

> **Приёмка:** по решению продукта полный проход этого блока **не обязателен** для текущей волны миграции (`MIGRATION_DIVERGENCES.md` §11). Ссылки оставлены для опционального smoke.

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
- [http://localhost:3002/projects/hr](http://localhost:3002/projects/hr) (заглушка HR‑проектов)

## ATS

> **Объём:** ATS планируется **пересобрать полностью** под новую спецификацию — см. `docs/ATS_MIGRATION_SCOPE.md`. Smoke ниже — проверка, что маршруты живы на моках, а не критерий паритета с 3001.

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

## Сайдбар: заглушки модулей (`ModulePlaceholderPage`)

Маршруты ниже не дублируют всё меню: это **репрезентативная выборка** для smoke (ожидается экран «Раздел в разработке» и корректный `document.title` из `AppLayout`). Непокрытые ветки смотрите в **[sidebar.md](./sidebar.md)** и обходите по пунктам меню на 3002.

- [http://localhost:3002/tasks](http://localhost:3002/tasks)
- [http://localhost:3002/onboarding/programs](http://localhost:3002/onboarding/programs)
- [http://localhost:3002/hr-services/documents](http://localhost:3002/hr-services/documents)
- [http://localhost:3002/employees](http://localhost:3002/employees)
- [http://localhost:3002/internal-vacancies](http://localhost:3002/internal-vacancies)
- [http://localhost:3002/learning/courses](http://localhost:3002/learning/courses)
- [http://localhost:3002/performance/goals](http://localhost:3002/performance/goals)
- [http://localhost:3002/compensation/benefits](http://localhost:3002/compensation/benefits)
- [http://localhost:3002/internal-site](http://localhost:3002/internal-site)
- [http://localhost:3002/hr-pr/events](http://localhost:3002/hr-pr/events)
- [http://localhost:3002/analytics](http://localhost:3002/analytics)
- [http://localhost:3002/settings/workflows](http://localhost:3002/settings/workflows)
- [http://localhost:3002/integrations/hh](http://localhost:3002/integrations/hh)
- [http://localhost:3002/reporting/employees](http://localhost:3002/reporting/employees) (подстраница отчётности — заглушка)
- [http://localhost:3002/company-settings/legal-entities](http://localhost:3002/company-settings/legal-entities) (настройки компании — заглушка)

**В UI:** пункты, ведущие на заглушку или 404, в сайдбаре отображаются **красным текстом** (см. §3 в [sidebar.md](./sidebar.md)).

---

## Рекомендуемый порядок

1. `npm run build` в `fe_migration`.
2. Пройти блоки сверху вниз или по разделам сайдбара на 3002 (структура — [sidebar.md](./sidebar.md)).
3. Отдельно пройти раздел **«Сайдбар: заглушки модулей»** выше.
4. Для каждого расхождения с 3001 — заметка в трекере (часть G плана миграции) и при необходимости §9 [MIGRATION_DIVERGENCES.md](./MIGRATION_DIVERGENCES.md).
