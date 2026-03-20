# Фаза 12 — ссылки для проверки

**Полный smoke-лист всех основных маршрутов:** [MIGRATION_CHECK_URLS.md](./MIGRATION_CHECK_URLS.md) (Фаза 15).

**Расхождения с эталоном (не править без задачи):** [MIGRATION_DIVERGENCES.md](./MIGRATION_DIVERGENCES.md).

База для ручной проверки:

- [http://localhost:3002](http://localhost:3002)

## Основные (представленные ранее)

- [http://localhost:3002/company-settings](http://localhost:3002/company-settings)
- [http://localhost:3002/company-settings/org-structure](http://localhost:3002/company-settings/org-structure)
- [http://localhost:3002/company-settings/grades](http://localhost:3002/company-settings/grades)
- [http://localhost:3002/company-settings/rating-scales](http://localhost:3002/company-settings/rating-scales)
- [http://localhost:3002/company-settings/employee-lifecycle](http://localhost:3002/company-settings/employee-lifecycle)
- [http://localhost:3002/company-settings/finance](http://localhost:3002/company-settings/finance)
- [http://localhost:3002/company-settings/integrations](http://localhost:3002/company-settings/integrations)
- [http://localhost:3002/company-settings/user-groups](http://localhost:3002/company-settings/user-groups)
- [http://localhost:3002/company-settings/users](http://localhost:3002/company-settings/users)
- [http://localhost:3002/company-settings/recruiting](http://localhost:3002/company-settings/recruiting)
- [http://localhost:3002/company-settings/recruiting/rules](http://localhost:3002/company-settings/recruiting/rules)
- [http://localhost:3002/company-settings/recruiting/stages](http://localhost:3002/company-settings/recruiting/stages)
- [http://localhost:3002/company-settings/recruiting/commands](http://localhost:3002/company-settings/recruiting/commands)
- [http://localhost:3002/company-settings/candidate-fields](http://localhost:3002/company-settings/candidate-fields)
- [http://localhost:3002/company-settings/scorecard](http://localhost:3002/company-settings/scorecard)
- [http://localhost:3002/company-settings/sla](http://localhost:3002/company-settings/sla)
- [http://localhost:3002/company-settings/vacancy-prompt](http://localhost:3002/company-settings/vacancy-prompt)
- [http://localhost:3002/company-settings/recruiting/offer-template](http://localhost:3002/company-settings/recruiting/offer-template)

## Финансы и совместимость путей

- [http://localhost:3002/company-settings/finance/benchmarks](http://localhost:3002/company-settings/finance/benchmarks)
- [http://localhost:3002/finance](http://localhost:3002/finance)
- [http://localhost:3002/finance/benchmarks](http://localhost:3002/finance/benchmarks)

## Рекомендованный порядок smoke-check

- Открыть `/company-settings`
- Пройти все ссылки из раздела "Основные"
- Проверить редирект `/company-settings/recruiting` -> `/company-settings/recruiting/rules`
- Проверить пару редиректов совместимости: `/finance`, `/finance/benchmarks`

---

## Фаза 13 — Админка

- [http://localhost:3002/admin](http://localhost:3002/admin)
- [http://localhost:3002/admin/users](http://localhost:3002/admin/users)
- [http://localhost:3002/admin/groups](http://localhost:3002/admin/groups)
- [http://localhost:3002/admin-crm](http://localhost:3002/admin-crm) (редирект на `/admin`)

---

## Фаза 14 — ATS

- [http://localhost:3002/ats](http://localhost:3002/ats) (редирект на первую карточку кандидата)
- [http://localhost:3002/ats/vacancy/1/candidate/1](http://localhost:3002/ats/vacancy/1/candidate/1)
- [http://localhost:3002/ats/vacancy/1/candidate/1/assessment/new](http://localhost:3002/ats/vacancy/1/candidate/1/assessment/new)
- [http://localhost:3002/ats/vacancy/1/candidate/1/assessment/a-101](http://localhost:3002/ats/vacancy/1/candidate/1/assessment/a-101)
- [http://localhost:3002/ats/vacancy/1/candidate/1/assessment/a-101/edit](http://localhost:3002/ats/vacancy/1/candidate/1/assessment/a-101/edit)
